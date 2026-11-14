// 视图变换与 Canvas2D 分层渲染器（WebGPU 不可用时的完整回退实现）
import type { BlastDesign, BlastHole, LayerId, Viewport, XY } from '../types';

/** 世界坐标(米) -> 屏幕坐标(像素) */
export function worldToScreen(p: XY, vp: Viewport): XY {
  return { x: p.x * vp.scale + vp.offsetX, y: p.y * vp.scale + vp.offsetY };
}

/** 屏幕坐标 -> 世界坐标 */
export function screenToWorld(p: XY, vp: Viewport): XY {
  return { x: (p.x - vp.offsetX) / vp.scale, y: (p.y - vp.offsetY) / vp.scale };
}

/** 当前比例尺分母（1:500 即 500）。假定 96dpi、屏幕 0.2646mm/px */
export function scaleDenominator(vp: Viewport): number {
  const metersPerPixel = 1 / vp.scale;
  return Math.round(metersPerPixel / 0.0002646);
}

/** 标注出现阈值：放大到 1:500 及更大才显示孔号与装药量 */
export function labelsVisible(vp: Viewport): boolean {
  return scaleDenominator(vp) <= 500;
}

export interface RenderOptions {
  viewport: Viewport;
  width: number;
  height: number;
  design: BlastDesign;
  selectedHoleId: string | null;
  hoverHoleId: string | null;
  /** true 时不绘制背景（WebGPU 模式下作为透明叠加层使用） */
  transparent?: boolean;
  /** 高亮叠加模式：孔点由 WebGPU 绘制，这里只画选中环/避让叉/文字标注 */
  highlightOnly?: boolean;
}

function layerOn(design: BlastDesign, id: LayerId): boolean {
  return design.layerStates.find((l) => l.id === id)?.visible ?? true;
}

/** 视口裁剪：世界坐标包围盒 */
function viewBounds(vp: Viewport, w: number, h: number) {
  const a = screenToWorld({ x: 0, y: 0 }, vp);
  const b = screenToWorld({ x: w, y: h }, vp);
  return { minX: a.x, maxX: b.x, minY: a.y, maxY: b.y };
}

function drawPath(ctx: CanvasRenderingContext2D, pts: XY[], vp: Viewport, close: boolean) {
  ctx.beginPath();
  pts.forEach((p, i) => {
    const s = worldToScreen(p, vp);
    if (i === 0) ctx.moveTo(s.x, s.y);
    else ctx.lineTo(s.x, s.y);
  });
  if (close) ctx.closePath();
}

export function render2D(canvas: HTMLCanvasElement, opts: RenderOptions): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { viewport: vp, width: w, height: h, design: d } = opts;
  ctx.clearRect(0, 0, w, h);
  if (!opts.transparent) {
    ctx.fillStyle = '#0f1722';
    ctx.fillRect(0, 0, w, h);
  }

  const bounds = viewBounds(vp, w, h);
  const inView = (p: XY) =>
    p.x >= bounds.minX && p.x <= bounds.maxX && p.y >= bounds.minY && p.y <= bounds.maxY;

  // 1. 地质分层
  if (layerOn(d, 'geology')) {
    for (const g of d.geology) {
      ctx.fillStyle = g.color;
      drawPath(ctx, g.polygon.points, vp, true);
      ctx.fill();
      ctx.strokeStyle = 'rgba(226,232,240,0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // 2. 台阶平面边界
  drawPath(ctx, d.benchPolygon.points, vp, true);
  ctx.strokeStyle = '#7dd3fc';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  // 3. 等高线 + 高程注记
  if (layerOn(d, 'contour')) {
    ctx.lineWidth = 1;
    for (const c of d.contours) {
      ctx.strokeStyle = 'rgba(148,163,184,0.7)';
      drawPath(ctx, c.polyline.points, vp, false);
      ctx.stroke();
      if (vp.scale > 0.8) {
        const mid = c.polyline.points[Math.floor(c.polyline.points.length / 2)];
        const s = worldToScreen(mid, vp);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px sans-serif';
        ctx.fillText(`${c.elevation}`, s.x + 2, s.y - 2);
      }
    }
  }

  // 4. 空区
  if (layerOn(d, 'void')) {
    for (const v of d.voids) {
      drawPath(ctx, v.polygon.points, vp, true);
      ctx.fillStyle = 'rgba(220,38,38,0.18)';
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      const cx = v.polygon.points.reduce((s, p) => s + p.x, 0) / v.polygon.points.length;
      const cy = v.polygon.points.reduce((s, p) => s + p.y, 0) / v.polygon.points.length;
      const sc = worldToScreen({ x: cx, y: cy }, vp);
      if (inView({ x: cx, y: cy })) {
        ctx.fillStyle = '#fca5a5';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(v.name, sc.x, sc.y);
        ctx.textAlign = 'left';
      }
    }
  }

  // 5. 边坡线
  if (layerOn(d, 'slope')) {
    for (const sLine of d.slopes) {
      drawPath(ctx, sLine.polyline.points, vp, false);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();
      const first = worldToScreen(sLine.polyline.points[0], vp);
      ctx.fillStyle = '#fbbf24';
      ctx.font = '11px sans-serif';
      ctx.fillText(`▲ ${sLine.name}`, first.x, first.y - 6);
    }
  }

  // 6. 管线
  if (layerOn(d, 'pipeline')) {
    for (const pipe of d.pipelines) {
      drawPath(ctx, pipe.polyline.points, vp, false);
      ctx.strokeStyle = pipe.kind === '电缆' ? '#a78bfa' : '#34d399';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
      const first = worldToScreen(pipe.polyline.points[0], vp);
      ctx.fillStyle = ctx.strokeStyle;
      ctx.font = '11px sans-serif';
      ctx.fillText(`${pipe.kind} ${pipe.name}`, first.x + 4, first.y + 12);
    }
  }

  // 7. 炮孔（视口外裁剪 + LOD）
  if (layerOn(d, 'hole')) {
    drawHoles2D(ctx, d.holes, vp, bounds, opts);
  }
  // 8. 比例尺
  drawScaleBar(ctx, vp, w, h);
}

function drawHoles2D(
  ctx: CanvasRenderingContext2D,
  holes: BlastHole[],
  vp: Viewport,
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
  opts: RenderOptions,
): void {
  const showLabels = labelsVisible(vp) && layerOn(opts.design, 'label');
  const far = vp.scale < 2; // 远景：只画孔点
  const highlightOnly = opts.highlightOnly === true;
  let drawn = 0;
  for (const hole of holes) {
    // 视口裁剪：屏幕外的孔直接跳过
    if (hole.x < bounds.minX || hole.x > bounds.maxX || hole.y < bounds.minY || hole.y > bounds.maxY) {
      continue;
    }
    drawn++;
    const s = worldToScreen(hole, vp);
    const skipped = hole.state === 'skipped';
    const selected = hole.id === opts.selectedHoleId;
    const hovered = hole.id === opts.hoverHoleId;

    if (!highlightOnly) {
      if (skipped) {
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#fca5a5';
        const r = far ? 1.2 : 2.5;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fill();
        if (!far) {
          ctx.beginPath();
          ctx.moveTo(s.x - 4, s.y - 4);
          ctx.lineTo(s.x + 4, s.y + 4);
          ctx.moveTo(s.x + 4, s.y - 4);
          ctx.lineTo(s.x - 4, s.y + 4);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      } else {
        ctx.fillStyle = selected ? '#facc15' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(s.x, s.y, far ? 1.5 : 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (selected || hovered) {
      ctx.strokeStyle = selected ? '#fde047' : 'rgba(250,204,21,0.6)';
      ctx.lineWidth = selected ? 2 : 1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 近景（≥1:500）才出孔号与装药量
    if (showLabels && !far && !skipped) {
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '9px sans-serif';
      ctx.fillText(hole.code, s.x + 5, s.y - 4);
      ctx.fillStyle = '#7dd3fc';
      ctx.fillText(`${hole.charge.toFixed(1)}kg`, s.x + 5, s.y + 9);
    }
  }
  return;
}

function drawScaleBar(
  ctx: CanvasRenderingContext2D,
  vp: Viewport,
  w: number,
  h: number,
): void {
  const denom = scaleDenominator(vp);
  // 选取约 100px 宽的整数米数
  const rawMeters = 100 / vp.scale;
  const nice = [1, 2, 5, 10, 20, 50, 100, 200, 500].reduce((prev, cur) =>
    Math.abs(cur - rawMeters) < Math.abs(prev - rawMeters) ? cur : prev,
  );
  const barPx = nice * vp.scale;
  const x0 = w - barPx - 24;
  const y0 = h - 24;
  ctx.strokeStyle = '#e2e8f0';
  ctx.fillStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x0 + barPx, y0);
  ctx.moveTo(x0, y0 - 4);
  ctx.lineTo(x0, y0 + 4);
  ctx.moveTo(x0 + barPx, y0 - 4);
  ctx.lineTo(x0 + barPx, y0 + 4);
  ctx.stroke();
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${nice} m`, x0 + barPx / 2, y0 - 8);
  ctx.textAlign = 'left';
  ctx.fillText(`比例尺 1:${denom}`, x0, y0 + 18);
}
