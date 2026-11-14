// 指针交互：绘制灯管（吸附）、选择/移动、顶点编辑、相机平移缩放、亚克力文字放置
import type { AcrylicElement, RGB, SignElement, TubeElement, Vec2 } from '../types';
import type { NeonRenderer } from '../render/NeonRenderer';
import type { Overlay } from './overlay';
import type { EditorStore } from './store';
import { hitTest, hitVertex, snapPoint, type SnapResult } from '../core/snap';
import { clampToWall } from '../core/snap';
import { uid } from '../core/defaults';
import { generateTextOutline, type LoadedFont } from '../core/font';

export type Tool = 'select' | 'tube-single' | 'tube-dual' | 'acrylic' | 'radius';

interface PendingText {
  font: LoadedFont;
  text: string;
  sizeMm: number;
  color: RGB;
  strokeWidth: number;
}

export class EditorController {
  tool: Tool = 'select';
  activeColor: RGB = { r: 255, g: 60, b: 180 };
  activeColor2: RGB = { r: 80, b: 220, g: 220 };
  dualPeriod = 300;
  pendingText: PendingText | null = null;

  private snap: SnapResult | null = null;
  private cursor: Vec2 | null = null;
  private hoverId: string | null = null;
  private drag:
    | { type: 'pan'; startX: number; startY: number; camX: number; camY: number }
    | { type: 'element'; id: string; start: Vec2; orig: Vec2[] | Vec2[][]; vertex?: { ring: number; index: number } | { index: number } }
    | null = null;

  constructor(
    private store: EditorStore,
    private renderer: NeonRenderer,
    overlay: Overlay,
    private canvas: HTMLCanvasElement,
  ) {
    void overlay;
    this.bind();
  }

  private get settings() { return this.store.project.settings; }

  private bind(): void {
    this.canvas.addEventListener('pointerdown', this.onDown);
    this.canvas.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
    this.canvas.addEventListener('dblclick', this.onDblClick);
    this.canvas.addEventListener('wheel', this.onWheel, { passive: false });
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('keydown', this.onKey);
  }

  dispose(): void {
    this.canvas.removeEventListener('pointerdown', this.onDown);
    this.canvas.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
    this.canvas.removeEventListener('dblclick', this.onDblClick);
    this.canvas.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('keydown', this.onKey);
  }

  private world(e: PointerEvent | MouseEvent): Vec2 {
    return this.renderer.screenToWorld(e.clientX, e.clientY);
  }

  private pickRadiusMm(): number {
    return (this.settings.snapTolerance / 10) * this.renderer.worldToScreenPx(1) * 2;
  }

  private onDown = (e: PointerEvent): void => {
    this.canvas.setPointerCapture(e.pointerId);
    const p = this.world(e);
    const project = this.store.project;

    // 中键或空格平移 / 右键平移
    if (e.button === 1 || e.button === 2) {
      this.drag = { type: 'pan', startX: e.clientX, startY: e.clientY, camX: this.renderer.camera.centerX, camY: this.renderer.camera.centerY };
      return;
    }

    if (this.tool === 'tube-single' || this.tool === 'tube-dual') {
      if (e.button === 0) {
        const s = snapPoint(p, project.wall, project.elements, {
          gridSize: this.settings.gridSize,
          tolerance: this.snapToleranceMm(),
          excludeId: undefined,
        });
        if (!this.store.drafting) {
          this.store.drafting = { kind: this.tool, points: [s.point] };
        } else {
          this.store.drafting.points.push(s.point);
        }
        this.store.markMeshDirty();
      } else if (e.button === 2 && this.store.drafting) {
        // 右键撤销最后一个点
        this.store.drafting.points.pop();
        if (this.store.drafting.points.length === 0) this.store.drafting = null;
        this.store.markMeshDirty();
      }
      return;
    }

    if (this.tool === 'acrylic' && this.pendingText && e.button === 0) {
      this.placeText(clampToWall(p, project.wall));
      return;
    }

    // 选择工具
    const pickR = this.pickRadiusMm();
    const hit = hitTest(p, project.elements, pickR);
    if (!hit) {
      this.store.select(null);
      this.drag = { type: 'pan', startX: e.clientX, startY: e.clientY, camX: this.renderer.camera.centerX, camY: this.renderer.camera.centerY };
      return;
    }
    this.store.select(hit.id);
    const v = hitVertex(p, hit, pickR * 0.8);
    this.store.beginDrag();
    if (hit.kind === 'acrylic') {
      this.drag = {
        type: 'element', id: hit.id, start: p,
        orig: structuredClone(hit.contours),
        vertex: v?.type === 'acrylic' ? { ring: v.ring, index: v.index } : undefined,
      };
    } else {
      this.drag = {
        type: 'element', id: hit.id, start: p,
        orig: structuredClone(hit.points),
        vertex: v?.type === 'tube' ? { index: v.index } : undefined,
      };
    }
  };

  private onMove = (e: PointerEvent): void => {
    const p = this.world(e);
    this.cursor = p;
    const project = this.store.project;

    if (this.drag?.type === 'pan') {
      const dxPx = e.clientX - this.drag.startX;
      const dyPx = e.clientY - this.drag.startY;
      const mmPerPx = this.renderer.camera.viewWidth / this.canvas.clientWidth;
      this.renderer.camera.centerX = this.drag.camX - dxPx * mmPerPx;
      this.renderer.camera.centerY = this.drag.camY + dyPx * mmPerPx;
      return;
    }

    if (this.drag?.type === 'element') {
      const drag = this.drag;
      const dx = p.x - drag.start.x;
      const dy = p.y - drag.start.y;
      const el = project.elements.find((x) => x.id === drag.id);
      if (!el) return;
      const vert = drag.vertex;
      if (vert && 'ring' in vert) {
        const ae = el as AcrylicElement;
        const target = ae.contours[vert.ring][vert.index];
        const s = snapPoint(p, project.wall, project.elements, {
          gridSize: this.settings.gridSize, tolerance: this.snapToleranceMm(), excludeId: el.id,
        });
        target.x = s.point.x; target.y = s.point.y;
      } else if (vert && 'index' in vert && el.kind !== 'acrylic') {
        const te = el as TubeElement;
        const s = snapPoint(p, project.wall, project.elements, {
          gridSize: this.settings.gridSize, tolerance: this.snapToleranceMm(), excludeId: el.id,
        });
        te.points[vert.index] = s.point;
      } else {
        // 整体移动
        if (el.kind === 'acrylic') {
          const orig = this.drag.orig as Vec2[][];
          el.contours = orig.map((ring) => ring.map((q) => ({ x: q.x + dx, y: q.y + dy })));
        } else {
          const orig = this.drag.orig as Vec2[];
          el.points = orig.map((q) => ({ x: q.x + dx, y: q.y + dy }));
        }
      }
      this.store.dragUpdate(() => undefined);
      return;
    }

    // 悬停 / 吸附提示
    this.hoverId = hitTest(p, project.elements, this.pickRadiusMm())?.id ?? null;
    if (this.tool === 'tube-single' || this.tool === 'tube-dual') {
      this.snap = snapPoint(p, project.wall, project.elements, {
        gridSize: this.settings.gridSize, tolerance: this.snapToleranceMm(),
      });
      this.cursor = this.snap.point;
    }
  };

  private onUp = (): void => {
    if (this.drag?.type === 'element') this.store.endDrag();
    this.drag = null;
  };

  private onDblClick = (): void => {
    // 双击结束当前灯管绘制
    if (this.store.drafting && this.store.drafting.points.length >= 2) {
      this.commitDraft();
    }
  };

  private onKey = (e: KeyboardEvent): void => {
    if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return;
    if (e.key === 'Enter' && this.store.drafting) {
      this.commitDraft();
    } else if (e.key === 'Escape') {
      this.store.drafting = null;
      this.pendingText = null;
      this.store.select(null);
      this.tool = 'select';
      this.store.markMeshDirty();
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      this.store.deleteSelected();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      this.store.duplicateSelected();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      e.shiftKey ? this.store.redo() : this.store.undo();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      this.store.redo();
    }
  };

  private onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.12 : 1 / 1.12;
    const before = this.renderer.screenToWorld(e.clientX, e.clientY);
    this.renderer.camera.viewWidth = Math.max(200, Math.min(20000, this.renderer.camera.viewWidth * factor));
    const after = this.renderer.screenToWorld(e.clientX, e.clientY);
    this.renderer.camera.centerX += before.x - after.x;
    this.renderer.camera.centerY += before.y - after.y;
  };

  private snapToleranceMm(): number {
    // 屏幕容差像素 → 世界 mm
    return this.settings.snapTolerance * (this.renderer.camera.viewWidth / this.canvas.clientWidth);
  }

  private commitDraft(): void {
    const draft = this.store.drafting;
    if (!draft || draft.points.length < 2) {
      this.store.drafting = null;
      return;
    }
    const d = this.settings.defaultTubeDiameter;
    const el: TubeElement = {
      id: uid(draft.kind),
      kind: draft.kind,
      points: draft.points.map((p) => ({ ...p })),
      diameter: d,
      // 默认折弯半径 = 直径 × 2.5（合规值），用户可在半径工具下调
      cornerRadii: draft.points.slice(1, -1).map(() => d * 2.5),
      color: { ...this.activeColor },
      ...(draft.kind === 'tube-dual'
        ? { color2: { ...this.activeColor2 }, dualPeriod: this.dualPeriod }
        : {}),
    };
    this.store.drafting = null;
    this.store.addElement(el);
  }

  /** 外部按钮：完成绘制 */
  finishDraft(): void {
    if (this.store.drafting) this.commitDraft();
  }

  /** 外部按钮：取消绘制 */
  cancelDraft(): void {
    this.store.drafting = null;
    this.store.markMeshDirty();
  }

  private placeText(origin: Vec2): void {
    const t = this.pendingText;
    if (!t) return;
    const outline = generateTextOutline(t.font, t.text, t.sizeMm, t.sizeMm * 0.08);
    if (outline.glyphs.length === 0) return;
    // 归一化到放置点（左下角）
    const contours: Vec2[][] = [];
    for (const g of outline.glyphs) {
      for (const ring of g.contours) {
        contours.push(ring.map((p) => ({ x: p.x - outline.minX + origin.x, y: p.y - outline.minY + origin.y })));
      }
    }
    const el: AcrylicElement = {
      id: uid('acrylic'),
      kind: 'acrylic',
      contours,
      strokeWidth: t.strokeWidth,
      color: { ...t.color },
    };
    this.pendingText = null;
    this.store.addElement(el);
  }

  setTextPending(t: PendingText): void {
    this.pendingText = t;
    this.tool = 'acrylic';
  }

  /** 调当前选中灯管的折角半径（全部折角统一） */
  setSelectedCornerRadius(radius: number): void {
    const el = this.store.selected;
    if (!el || el.kind === 'acrylic') return;
    this.store.updateElement(el.id, { cornerRadii: el.cornerRadii.map(() => radius) } as Partial<TubeElement>);
  }

  setTool(tool: Tool): void {
    this.tool = tool;
    if (tool !== 'tube-single' && tool !== 'tube-dual') this.store.drafting = null;
    this.store.markMeshDirty();
  }

  getOverlayState() {
    return {
      project: this.store.project,
      camera: this.renderer.camera,
      selectedId: this.store.selectedId,
      draftPoints: this.store.drafting?.points ?? [],
      snap: this.snap,
      badCornerMap: new Map(),
      cursor: this.cursor,
      hoverId: this.hoverId,
    };
  }

  setBadCornerMap(m: Map<string, Set<number>>): void {
    // 由主循环注入（来自 stats）
    this.badCornerExternal = m;
  }

  private badCornerExternal = new Map<string, Set<number>>();

  getBadCornerMap(): Map<string, Set<number>> {
    return this.badCornerExternal;
  }

  /** 当前吸附状态（叠加层用） */
  get currentSnap(): SnapResult | null { return this.snap; }
  /** 鼠标世界坐标 */
  get currentCursor(): Vec2 | null { return this.cursor; }
  /** 悬停元素 id */
  get currentHoverId(): string | null { return this.hoverId; }

  getSignElement(id: string): SignElement | undefined {
    return this.store.project.elements.find((e) => e.id === id);
  }
}
