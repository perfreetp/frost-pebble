import {
  Application,
  Container,
  Graphics,
  Rectangle,
  Text,
  TextStyle,
  type FederatedPointerEvent,
} from 'pixi.js';
import type { Assignment, Incident, Scenario, ShipOutcome } from '../game/types';
import { tideAt } from '../game/tide';

/* ------------------------------ 布局 ------------------------------ */

export interface Layout {
  width: number;
  height: number;
  queue: { x: number; y: number; w: number; cardH: number; gap: number };
  berthLabels: { x: number; w: number };
  timeline: { x0: number; x1: number; y: number; laneH: number; laneGap: number };
  tide: { y: number; h: number };
  ruler: { y: number; h: number };
}

export const CANVAS_WIDTH = 1120;

export function computeLayout(scenario: Scenario): Layout {
  const ruler = { y: 0, h: 52 };
  const lanesY = ruler.h + 4;
  const laneH = 78;
  const laneGap = 8;
  const lanesH = scenario.berths.length * (laneH + laneGap);
  const tide = { y: lanesY + lanesH + 10, h: 116 };
  const height = tide.y + tide.h + 10;
  return {
    width: CANVAS_WIDTH,
    height,
    ruler,
    queue: { x: 14, y: lanesY, w: 214, cardH: 44, gap: 6 },
    berthLabels: { x: 240, w: 124 },
    timeline: { x0: 372, x1: CANVAS_WIDTH - 16, y: lanesY, laneH, laneGap },
    tide,
  };
}

export function xForMin(layout: Layout, scenario: Scenario, min: number): number {
  const ratio = Math.min(1, Math.max(0, min / scenario.horizonMin));
  return layout.timeline.x0 + ratio * (layout.timeline.x1 - layout.timeline.x0);
}

export function minForX(layout: Layout, scenario: Scenario, x: number): number {
  const span = layout.timeline.x1 - layout.timeline.x0;
  const ratio = (x - layout.timeline.x0) / span;
  return Math.min(scenario.horizonMin, Math.max(0, ratio * scenario.horizonMin));
}

export function laneY(layout: Layout, index: number): number {
  return layout.timeline.y + index * (layout.timeline.laneH + layout.timeline.laneGap);
}

/* ------------------------------ 主题 ------------------------------ */

const C = {
  bg: 0x081620,
  panel: 0x0e2230,
  panelAlt: 0x102a3a,
  grid: 0x1b3b4d,
  gridStrong: 0x27566d,
  text: 0xe8f4f8,
  textDim: 0x8fb2c2,
  textFaint: 0x5d8296,
  teal: 0x3fd0c9,
  tealDeep: 0x1c7d7a,
  amber: 0xf3b353,
  red: 0xf2685a,
  redDeep: 0x8e2f28,
  blue: 0x58a6ff,
  green: 0x63d68a,
  plan: 0x2a6f8a,
};

const FONT = '"Segoe UI", "Microsoft YaHei", "Noto Sans SC", sans-serif';

function label(text: string, size: number, color: number, weight: '400' | '600' | '700' = '400'): Text {
  return new Text({
    text,
    style: new TextStyle({ fontFamily: FONT, fontSize: size, fill: color, fontWeight: weight }),
  });
}

/* ------------------------------ 控制器 ------------------------------ */

export interface TimelineHandlers {
  onLayout?: (geometry: NonNullable<ReturnType<TimelineView['geometry']>>) => void;
  onSelectShip: (shipId: string | null) => void;
  onSelectAssignment: (assignmentId: string | null) => void;
  onPlace: (shipId: string, berthId: string, startMin: number) => void;
  onMove: (assignmentId: string, berthId: string, startMin: number) => void;
  onHoverShip?: (shipId: string | null) => void;
  validate: (
    shipId: string,
    berthId: string,
    startMin: number,
    excludeId?: string,
  ) => { ok: boolean; message?: string };
}

export interface TimelineState {
  scenario: Scenario;
  assignments: Assignment[];
  selectedShipId: string | null;
  selectedAssignmentId: string | null;
  playheadMin: number | null;
  outcomes: ShipOutcome[] | null;
  incidents: Incident[];
}

const SNAP_MIN = 5;

export class TimelineView {
  private app: Application | null = null;
  private root = new Container();
  private staticLayer = new Container();
  private lanesLayer = new Container();
  private blocksLayer = new Container();
  private queueLayer = new Container();
  private overlayLayer = new Container();
  private state: TimelineState | null = null;
  private layout: Layout | null = null;
  private handlers: TimelineHandlers;
  private ghost: Container | null = null;
  private preview: Graphics | null = null;
  private previewHint: Text | null = null;
  private incidentLayer = new Container();
  private playhead: Graphics | null = null;
  private destroyed = false;
  private drag: {
    kind: 'ship' | 'assignment';
    shipId: string;
    assignmentId?: string;
    pointerId: number;
    startX: number;
    startY: number;
    active: boolean;
    dropBerthId: string | null;
    dropMin: number | null;
    valid: boolean;
  } | null = null;

  constructor(handlers: TimelineHandlers) {
    this.handlers = handlers;
  }

  async mount(host: HTMLElement): Promise<void> {
    if (this.app) return;
    const scenario = this.state?.scenario;
    const layout = scenario ? computeLayout(scenario) : null;
    const app = new Application();
    await app.init({
      width: layout?.width ?? CANVAS_WIDTH,
      height: layout?.height ?? 420,
      background: C.bg,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(2, window.devicePixelRatio || 1),
      preference: 'webgl',
    });
    if (this.destroyed) {
      app.destroy(true);
      return;
    }
    this.app = app;
    host.innerHTML = '';
    host.appendChild(app.canvas);
    app.canvas.style.width = '100%';
    app.canvas.style.display = 'block';
    app.canvas.style.borderRadius = '14px';
    app.canvas.setAttribute('data-testid', 'timeline-canvas');
    app.canvas.setAttribute('aria-label', '港口泊位时间轴');
    app.stage.eventMode = 'static';
    app.stage.hitArea = new Rectangle(0, 0, 10000, 10000);
    app.stage.addChild(this.root);
    this.root.addChild(
      this.staticLayer,
      this.lanesLayer,
      this.blocksLayer,
      this.queueLayer,
      this.incidentLayer,
      this.overlayLayer,
    );
    app.stage.on('pointermove', this.onStagePointerMove, this);
    app.stage.on('pointerup', this.onStagePointerUp, this);
    app.stage.on('pointerupoutside', this.onStagePointerUp, this);
    if (this.state) this.render();
  }

  destroy(): void {
    this.destroyed = true;
    this.app?.destroy(true);
    this.app = null;
  }

  setState(next: TimelineState): void {
    const prev = this.state;
    const onlyPlayhead =
      prev !== null &&
      prev.scenario === next.scenario &&
      prev.assignments === next.assignments &&
      prev.selectedShipId === next.selectedShipId &&
      prev.selectedAssignmentId === next.selectedAssignmentId &&
      prev.outcomes === next.outcomes &&
      prev.incidents === next.incidents;
    this.state = next;
    if (onlyPlayhead && this.app) {
      this.setPlayhead(next.playheadMin);
      return;
    }
    const needResize =
      !prev ||
      prev.scenario !== next.scenario ||
      prev.scenario.berths.length !== next.scenario.berths.length;
    if (this.app && needResize) {
      const layout = computeLayout(next.scenario);
      this.layout = layout;
      this.app.renderer.resize(layout.width, layout.height);
    }
    if (this.app) this.render();
  }

  /** 供 E2E 使用的几何信息 */
  geometry() {
    if (!this.layout || !this.state) return null;
    const { layout, state } = this;
    return {
      layout,
      ships: state.scenario.ships.map((s, i) => {
        const cardH = layout.queue.cardH;
        const gap = layout.queue.gap;
        return {
          shipId: s.id,
          x: layout.queue.x,
          y: layout.queue.y + i * (cardH + gap),
          w: layout.queue.w,
          h: cardH,
        };
      }),
      berths: state.scenario.berths.map((b, i) => ({
        berthId: b.id,
        y: laneY(layout, i),
        h: layout.timeline.laneH,
      })),
      timeSpan: { x0: layout.timeline.x0, x1: layout.timeline.x1, horizon: state.scenario.horizonMin },
    };
  }

  /* ---------------------------- 渲染 ---------------------------- */

  private render(): void {
    if (!this.app || !this.state) return;
    const { scenario } = this.state;
    const layout = computeLayout(scenario);
    this.layout = layout;
    if (this.app.renderer.width !== layout.width || this.app.renderer.height !== layout.height) {
      this.app.renderer.resize(layout.width, layout.height);
    }
    this.staticLayer.removeChildren().forEach((c) => c.destroy({ children: true }));
    this.lanesLayer.removeChildren().forEach((c) => c.destroy({ children: true }));
    this.blocksLayer.removeChildren().forEach((c) => c.destroy({ children: true }));
    this.queueLayer.removeChildren().forEach((c) => c.destroy({ children: true }));
    this.incidentLayer.removeChildren().forEach((c) => c.destroy({ children: true }));
    this.drawStatic();
    this.drawLanes();
    this.drawBlocks();
    this.drawQueue();
    this.drawIncidents();
    this.clearTooltip();
    const geometry = this.geometry();
    if (geometry) this.handlers.onLayout?.(geometry);
  }

  private drawStatic(): void {
    if (!this.state || !this.layout) return;
    const { scenario, playheadMin } = this.state;
    const layout = this.layout;

    // 顶部标题条
    const header = new Graphics();
    header.rect(0, 0, layout.width, layout.ruler.h).fill({ color: 0x0a1b26 });
    header.rect(0, layout.ruler.h - 1, layout.width, 1).fill({ color: C.grid });

    const title = label('锚地 · 待泊队列', 13, C.textDim, '600');
    title.position.set(layout.queue.x + 2, 18);
    this.staticLayer.addChild(header, title);

    const hint = label('拖到右侧泊位，或点选后在右侧面板排程', 11, C.textFaint);
    hint.position.set(layout.queue.x + 2, 34);
    this.staticLayer.addChild(hint);

    // 时间刻度
    const step = scenario.horizonMin <= 300 ? 30 : 60;
    for (let m = 0; m <= scenario.horizonMin; m += step) {
      const x = xForMin(layout, scenario, m);
      const g = new Graphics();
      g.moveTo(x, layout.ruler.h - 12).lineTo(x, layout.ruler.h).stroke({ width: 1, color: C.grid });
      g.moveTo(x, layout.timeline.y - 2).lineTo(x, layout.tide.y + layout.tide.h).stroke({ width: 1, color: 0x143140, alpha: 0.55 });
      const t = label(clockLabel(scenario, m), 10, C.textFaint);
      t.anchor.set(0.5, 0);
      t.position.set(x, 24);
      this.staticLayer.addChild(g, t);
    }

    // 潮汐带
    const tideTop = layout.tide.y;
    const tideBg = new Graphics();
    tideBg.roundRect(layout.berthLabels.x, tideTop, layout.width - layout.berthLabels.x - 16, layout.tide.h, 8)
      .fill({ color: 0x0a1c27 });
    this.staticLayer.addChild(tideBg);

    const tideLabel = label('潮高', 12, C.textDim, '600');
    tideLabel.position.set(layout.berthLabels.x + 4, tideTop + 8);
    const tideUnit = label('米', 10, C.textFaint);
    tideUnit.position.set(layout.berthLabels.x + 4, tideTop + 24);
    this.staticLayer.addChild(tideLabel, tideUnit);

    const heights = scenario.tide.map((p) => p.heightM);
    const maxH = Math.max(...heights, 1) + 0.6;
    const minH = Math.min(...heights, 0) - 0.4;
    const yForH = (h: number) =>
      tideTop + layout.tide.h - 18 - ((h - minH) / (maxH - minH)) * (layout.tide.h - 34);

    // 潮高面积曲线
    const area = new Graphics();
    const points: Array<[number, number]> = [];
    for (let m = 0; m <= scenario.horizonMin; m += 5) {
      points.push([xForMin(layout, scenario, m), yForH(tideAt(scenario.tide, m))]);
    }
    area.moveTo(points[0][0], tideTop + layout.tide.h - 18);
    for (const [x, y] of points) area.lineTo(x, y);
    area.lineTo(points[points.length - 1][0], tideTop + layout.tide.h - 18);
    area.closePath().fill({ color: C.tealDeep, alpha: 0.22 });

    const curve = new Graphics();
    curve.moveTo(points[0][0], points[0][1]);
    for (const [x, y] of points) curve.lineTo(x, y);
    curve.stroke({ width: 2, color: C.teal, alpha: 0.85 });
    this.staticLayer.addChild(area, curve);

    // 选中船舶的潮窗
    const selectedShip = scenario.ships.find((s) => s.id === this.state?.selectedShipId);
    if (selectedShip) {
      const band = new Graphics();
      const x0 = xForMin(layout, scenario, selectedShip.tideFromMin);
      const x1 = xForMin(layout, scenario, selectedShip.tideToMin);
      band.roundRect(x0, tideTop + 4, Math.max(2, x1 - x0), layout.tide.h - 8, 6)
        .fill({ color: C.teal, alpha: 0.1 })
        .stroke({ width: 1, color: C.teal, alpha: 0.5 });
      const from = label(`潮窗开 ${clockLabel(scenario, selectedShip.tideFromMin)}`, 10, C.teal);
      from.position.set(x0 + 4, tideTop + layout.tide.h - 30);
      const to = label(`关 ${clockLabel(scenario, selectedShip.tideToMin)}`, 10, C.teal);
      to.anchor.set(1, 0);
      to.position.set(x1 - 4, tideTop + layout.tide.h - 30);
      this.staticLayer.addChild(band, from, to);
    }

    // 播放头
    const p = new Graphics();
    p.moveTo(0, layout.ruler.h).lineTo(0, layout.tide.y + layout.tide.h).stroke({ width: 2, color: C.amber, alpha: 0.9 });
    p.circle(0, layout.ruler.h + 2, 4).fill({ color: C.amber });
    p.visible = playheadMin !== null;
    p.x = xForMin(layout, scenario, playheadMin ?? 0);
    this.playhead = p;
    this.staticLayer.addChild(p);
  }

  private drawLanes(): void {
    if (!this.state || !this.layout) return;
    const { scenario } = this.state;
    const layout = this.layout;
    scenario.berths.forEach((berth, i) => {
      const y = laneY(layout, i);
      const g = new Graphics();
      g.roundRect(layout.berthLabels.x, y, layout.width - layout.berthLabels.x - 16, layout.timeline.laneH, 10)
        .fill({ color: i % 2 === 0 ? C.panel : C.panelAlt, alpha: 0.9 })
        .stroke({ width: 1, color: C.grid, alpha: 0.9 });
      this.lanesLayer.addChild(g);

      const name = label(berth.name.split(' · ')[0], 13, C.text, '600');
      name.position.set(layout.berthLabels.x + 10, y + 12);
      const spec = label(berth.name.split(' · ')[1] ?? '', 10, C.textFaint);
      spec.position.set(layout.berthLabels.x + 10, y + 30);
      const limit = label(`限吃水 ${berth.maxDraftM.toFixed(1)}m · ${berth.lengthM}m`, 10, C.textDim);
      limit.position.set(layout.berthLabels.x + 10, y + 46);
      this.lanesLayer.addChild(name, spec, limit);
    });
  }

  private drawQueue(): void {
    if (!this.state || !this.layout) return;
    const { scenario, assignments, selectedShipId } = this.state;
    const layout = this.layout;
    const cardH = layout.queue.cardH;
    const gap = layout.queue.gap;

    scenario.ships.forEach((ship, index) => {
      const a = assignments.find((x) => x.shipId === ship.id);
      const selected = selectedShipId === ship.id;
      const x = layout.queue.x;
      const y = layout.queue.y + index * (cardH + gap);

      const card = new Container();
      card.eventMode = 'static';
      card.cursor = 'pointer';
      card.hitArea = new Rectangle(0, 0, layout.queue.w, cardH);

      const g = new Graphics();
      g.roundRect(0, 0, layout.queue.w, cardH, 8)
        .fill({ color: selected ? 0x14384a : C.panel, alpha: 1 })
        .stroke({ width: selected ? 2 : 1, color: selected ? C.teal : a ? C.tealDeep : C.grid });

      // 吃水指示条
      const draftRatio = Math.min(1, ship.draftM / 15);
      g.roundRect(layout.queue.w - 8, 8, 4, cardH - 16, 2).fill({ color: 0x1b3b4d });
      g.roundRect(layout.queue.w - 8, cardH - 8 - (cardH - 16) * draftRatio, 4, (cardH - 16) * draftRatio, 2)
        .fill({ color: draftRatio > 0.85 ? C.red : C.teal });
      card.addChild(g);

      const name = label(ship.name, 13, a ? C.text : C.textDim, '600');
      name.position.set(10, 6);
      const spec = label(`${ship.lengthM}m · 吃水 ${ship.draftM.toFixed(1)}m`, 10, C.textDim);
      spec.position.set(10, 24);
      const window = label(
        `潮窗 ${clockLabel(scenario, ship.tideFromMin)}–${clockLabel(scenario, ship.tideToMin)}`,
        9,
        C.textFaint,
      );
      window.position.set(layout.queue.w - 18 - window.width, 25);
      card.addChild(name, spec, window);

      if (a) {
        const chip = label(a.pilotId ? '已排' : '待引航', 9, a.pilotId ? C.teal : C.amber);
        chip.anchor.set(1, 0);
        chip.position.set(layout.queue.w - 18, 6);
        card.addChild(chip);
      }

      card.position.set(x, y);
      card.on('pointerdown', (e: FederatedPointerEvent) => this.beginDrag(e, 'ship', ship.id));
      card.on('pointerover', () => this.handlers.onHoverShip?.(ship.id));
      card.on('pointerout', () => this.handlers.onHoverShip?.(null));
      this.queueLayer.addChild(card);
    });
  }

  private drawBlocks(): void {
    if (!this.state || !this.layout) return;
    const { scenario, assignments, selectedAssignmentId, playheadMin, outcomes } = this.state;
    const layout = this.layout;

    for (const a of assignments) {
      const ship = scenario.ships.find((s) => s.id === a.shipId);
      const berthIndex = scenario.berths.findIndex((b) => b.id === a.berthId);
      if (!ship || berthIndex < 0) continue;
      const y = laneY(layout, berthIndex);
      const x = xForMin(layout, scenario, a.startMin);
      const w = Math.max(18, xForMin(layout, scenario, a.startMin + ship.mooringMin) - x);
      const h = layout.timeline.laneH - 32;
      const selected = selectedAssignmentId === a.id;
      const outcome = outcomes?.find((o) => o.shipId === ship.id);
      const delayed = outcome && outcome.actualStartMin !== null && outcome.actualStartMin > a.startMin + 1;
      const missed = outcome?.status === 'missed' || outcome?.status === 'unassigned';

      const block = new Container();
      block.eventMode = 'static';
      block.cursor = 'grab';
      block.hitArea = new Rectangle(0, 0, w, h);

      const g = new Graphics();
      const baseColor = missed ? C.redDeep : delayed ? 0x7a5a22 : C.plan;
      g.roundRect(0, 0, w, h, 7)
        .fill({ color: baseColor, alpha: 0.92 })
        .stroke({ width: selected ? 2 : 1, color: selected ? C.teal : C.tealDeep });

      // 实际开始后的等待段
      if (delayed && outcome?.actualStartMin != null) {
        const wx = xForMin(layout, scenario, outcome.actualStartMin) - x;
        const waitG = new Graphics();
        waitG.roundRect(0, 0, Math.max(3, wx), h, 7).fill({ color: C.amber, alpha: 0.35 });
        block.addChild(waitG);
      }

      // 底部信息条
      const strip = new Graphics();
      strip.rect(0, h - 16, w, 16).fill({ color: 0x06131b, alpha: 0.45 });
      block.addChild(strip);

      const title = label(ship.name, 12, C.text, '600');
      title.position.set(8, 7);
      block.addChild(title);

      const time = label(clockLabel(scenario, a.startMin), 10, 0xcfe7ee);
      time.position.set(8, 26);
      block.addChild(time);

      const pilot = scenario.pilots.find((p) => p.id === a.pilotId);
      const resourceText = a.pilotId
        ? `${pilot?.name ?? '引航员'} · ${a.tugIds.length}/${ship.tugsNeeded} 拖轮`
        : '未指派引航员';
      if (w > 96) {
        const res = label(resourceText, 9, a.pilotId ? 0xd6ecf2 : C.amber);
        res.position.set(8, h - 13);
        block.addChild(res);
      } else {
        const dot = new Graphics();
        dot.circle(w - 8, 10, 3).fill({ color: a.pilotId ? C.teal : C.amber });
        block.addChild(dot);
      }

      if (playheadMin !== null && playheadMin >= a.startMin && playheadMin <= a.startMin + ship.mooringMin) {
        const glow = new Graphics();
        glow.roundRect(-2, -2, w + 4, h + 4, 8).stroke({ width: 2, color: C.amber, alpha: 0.8 });
        block.addChild(glow);
      }

      block.position.set(x, y + 16);
      block.on('pointerdown', (e: FederatedPointerEvent) => {
        e.stopPropagation();
        this.handlers.onSelectAssignment(a.id);
        this.beginDrag(e, 'assignment', ship.id, a.id);
      });
      this.blocksLayer.addChild(block);
    }
  }

  private drawIncidents(): void {
    if (!this.state || !this.layout) return;
    const { scenario, incidents } = this.state;
    const layout = this.layout;
    this.incidentLayer.removeChildren().forEach((c) => c.destroy({ children: true }));
    const seen = new Set<string>();
    for (const inc of incidents) {
      const x = xForMin(layout, scenario, inc.timeMin);
      const dedupeKey = `${Math.round(inc.timeMin)}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      const marker = new Container();
      marker.eventMode = 'static';
      marker.cursor = 'help';
      marker.hitArea = new Rectangle(-7, -6, 14, 12);
      const g = new Graphics();
      g.moveTo(0, -6).lineTo(6, 2).lineTo(-6, 2).closePath().fill({ color: C.red });
      g.moveTo(0, -2).lineTo(0, 0.5).stroke({ width: 1.4, color: 0x2a0906 });
      marker.addChild(g);
      marker.position.set(x, layout.ruler.h - 4);
      marker.on('pointerover', () => this.showIncidentTooltip(inc, x));
      marker.on('pointerout', () => this.clearTooltip());
      this.incidentLayer.addChild(marker);
    }
  }

  private tooltip: Container | null = null;

  private showIncidentTooltip(inc: Incident, x: number): void {
    this.clearTooltip();
    if (!this.layout) return;
    const box = new Container();
    const text = label(inc.message, 11, 0xffe6e1);
    text.style.wordWrap = true;
    text.style.wordWrapWidth = 300;
    const w = text.width + 20;
    const h = text.height + 16;
    const g = new Graphics();
    g.roundRect(0, 0, w, h, 8).fill({ color: 0x3a1512, alpha: 0.97 }).stroke({ width: 1, color: C.red });
    text.position.set(10, 8);
    box.addChild(g, text);
    const tx = Math.min(this.layout.width - w - 8, Math.max(8, x - w / 2));
    box.position.set(tx, this.layout.ruler.h + 8);
    this.tooltip = box;
    this.overlayLayer.addChild(box);
  }

  private clearTooltip(): void {
    if (this.tooltip) {
      this.tooltip.destroy({ children: true });
      this.tooltip = null;
    }
  }

  /* ---------------------------- 交互 ---------------------------- */

  private beginDrag(
    event: FederatedPointerEvent,
    kind: 'ship' | 'assignment',
    shipId: string,
    assignmentId?: string,
  ): void {
    if (!this.app) return;
    event.stopPropagation();
    this.drag = {
      kind,
      shipId,
      assignmentId,
      pointerId: event.pointerId,
      startX: event.global.x,
      startY: event.global.y,
      active: false,
      dropBerthId: null,
      dropMin: null,
      valid: false,
    };
    if (kind === 'ship') this.handlers.onSelectShip(shipId);
  }

  private onStagePointerMove(event: FederatedPointerEvent): void {
    if (!this.drag || !this.state || !this.layout) return;
    const dx = event.global.x - this.drag.startX;
    const dy = event.global.y - this.drag.startY;
    if (!this.drag.active && Math.hypot(dx, dy) > 6) {
      this.drag.active = true;
      this.createGhost();
    }
    if (!this.drag.active) return;
    this.positionGhost(event.global.x, event.global.y);
    this.updateDropPreview(event.global.x, event.global.y);
  }

  private onStagePointerUp(): void {
    if (!this.drag) return;
    const drag = this.drag;
    this.drag = null;
    this.removeGhost();
    if (!drag.active) return;
    if (drag.dropBerthId && drag.dropMin !== null) {
      if (drag.kind === 'ship') {
        this.handlers.onPlace(drag.shipId, drag.dropBerthId, drag.dropMin);
      } else if (drag.assignmentId) {
        this.handlers.onMove(drag.assignmentId, drag.dropBerthId, drag.dropMin);
      }
    }
  }

  private createGhost(): void {
    if (!this.state || !this.layout || !this.drag) return;
    const ship = this.state.scenario.ships.find((s) => s.id === this.drag!.shipId);
    if (!ship) return;
    const c = new Container();
    c.alpha = 0.9;
    const g = new Graphics();
    g.roundRect(0, 0, 168, 52, 9).fill({ color: 0x123244, alpha: 0.96 }).stroke({ width: 1.5, color: C.teal });
    const name = label(ship.name, 12, C.text, '600');
    name.position.set(10, 7);
    const spec = label(`吃水 ${ship.draftM.toFixed(1)}m · ${ship.lengthM}m`, 10, C.textDim);
    spec.position.set(10, 26);
    const tug = label(`需 ${ship.tugsNeeded} 拖轮`, 9, C.textFaint);
    tug.position.set(10, 40);
    c.addChild(g, name, spec, tug);
    this.ghost = c;
    this.overlayLayer.addChild(c);

    this.preview = new Graphics();
    this.overlayLayer.addChild(this.preview);

    this.previewHint = label('', 11, C.text, '600');
    this.previewHint.style.wordWrap = true;
    this.previewHint.style.wordWrapWidth = 300;
    this.overlayLayer.addChild(this.previewHint);
  }

  private positionGhost(x: number, y: number): void {
    if (!this.ghost) return;
    this.ghost.position.set(x + 14, y - 26);
  }

  private removeGhost(): void {
    this.ghost?.destroy({ children: true });
    this.ghost = null;
    this.preview?.destroy();
    this.preview = null;
    this.previewHint?.destroy();
    this.previewHint = null;
  }

  private updateDropPreview(x: number, y: number): void {
    if (!this.state || !this.layout || !this.drag || !this.preview || !this.previewHint) return;
    const { scenario } = this.state;
    const layout = this.layout;
    const berthIndex = scenario.berths.findIndex((_b, i) => {
      const ly = laneY(layout, i);
      return y >= ly && y <= ly + layout.timeline.laneH;
    });
    const inTimeline = x >= layout.timeline.x0 - 20 && x <= layout.timeline.x1 + 20;
    this.preview.clear();
    this.previewHint.text = '';
    this.drag.dropBerthId = null;
    this.drag.dropMin = null;
    this.drag.valid = false;

    if (berthIndex < 0 || !inTimeline) {
      this.previewHint.visible = false;
      return;
    }
    const berth = scenario.berths[berthIndex];
    const ship = scenario.ships.find((s) => s.id === this.drag!.shipId);
    if (!ship) return;
    const rawMin = minForX(layout, scenario, x);
    const startMin = Math.round(rawMin / SNAP_MIN) * SNAP_MIN;
    const result = this.handlers.validate(
      ship.id,
      berth.id,
      startMin,
      this.drag.kind === 'assignment' ? this.drag.assignmentId : undefined,
    );
    const w = Math.max(14, xForMin(layout, scenario, startMin + ship.mooringMin) - xForMin(layout, scenario, startMin));
    const ly = laneY(layout, berthIndex);
    const lx = xForMin(layout, scenario, startMin);
    this.preview
      .roundRect(lx, ly + 12, w, layout.timeline.laneH - 24, 8)
      .fill({ color: result.ok ? C.teal : C.red, alpha: 0.2 })
      .stroke({ width: 2, color: result.ok ? C.teal : C.red, alpha: 0.95 });
    this.previewHint.visible = true;
    this.previewHint.text = result.ok
      ? `${berth.name.split(' · ')[0]} · ${clockLabel(scenario, startMin)} 靠泊，作业 ${ship.mooringMin} 分钟`
      : result.message ?? '无法排入';
    this.previewHint.style.fill = result.ok ? 0xd9fbf7 : 0xffd9d3;
    this.previewHint.position.set(
      Math.min(layout.width - 300, Math.max(8, lx)),
      ly + layout.timeline.laneH - 4,
    );
    this.drag.dropBerthId = berth.id;
    this.drag.dropMin = startMin;
    this.drag.valid = result.ok;
  }

  /* ---------------------------- 播放 ---------------------------- */

  setPlayhead(min: number | null): void {
    if (!this.state) return;
    this.state.playheadMin = min;
    if (!this.playhead || !this.layout) return;
    this.playhead.visible = min !== null;
    if (min === null) return;
    this.playhead.x = xForMin(this.layout, this.state.scenario, min);
  }
}

export function clockLabel(scenario: Scenario, min: number): string {
  const total = ((Math.round(scenario.startClockMin + min) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
