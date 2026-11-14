import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore, selectActiveDesign, type ToolMode } from '../store/useStore';
import { screenToWorld, scaleDenominator, render2D, labelsVisible } from '../render/render2d';
import { WebGpuHoleRenderer } from '../render/webgpu';
import { useViewport } from '../hooks/useViewport';
import { dist } from '../lib/geometry';
import type { BlastHole } from '../types';

/** 空间网格拾取：8000+ 孔时避免每次点击全量遍历 */
function buildSpatialGrid(holes: BlastHole[], cell = 4) {
  const grid = new Map<string, BlastHole[]>();
  for (const h of holes) {
    const key = `${Math.floor(h.x / cell)},${Math.floor(h.y / cell)}`;
    const list = grid.get(key);
    if (list) list.push(h);
    else grid.set(key, [h]);
  }
  return grid;
}

function pickHole(
  grid: Map<string, BlastHole[]>,
  world: { x: number; y: number },
  radius: number,
): BlastHole | null {
  const cx = Math.floor(world.x / 4);
  const cy = Math.floor(world.y / 4);
  let best: BlastHole | null = null;
  let bestD = radius;
  for (let gx = cx - 1; gx <= cx + 1; gx++) {
    for (let gy = cy - 1; gy <= cy + 1; gy++) {
      for (const h of grid.get(`${gx},${gy}`) ?? []) {
        const d = dist(world, h);
        if (d < bestD) {
          bestD = d;
          best = h;
        }
      }
    }
  }
  return best;
}

export function DesignCanvas() {
  const design = useStore(selectActiveDesign);
  const tool = useStore((s) => s.tool);
  const selectedHoleId = useStore((s) => s.selectedHoleId);
  const hoverHoleId = useStore((s) => s.hoverHoleId);
  const renderMode = useStore((s) => s.renderMode);
  const setRenderMode = useStore((s) => s.setRenderMode);
  const selectHole = useStore((s) => s.selectHole);
  const setHoverHole = useStore((s) => s.setHoverHole);
  const placeAt = useStore((s) => s.placeAt);

  const containerRef = useRef<HTMLDivElement>(null);
  const gpuCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const gpuRef = useRef<WebGpuHoleRenderer | null>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [gpuStatus, setGpuStatus] = useState<'init' | 'ok' | 'fallback'>('init');
  const dragRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  const { viewport, zoomAt, pan, reset } = useViewport({ offsetX: 40, offsetY: 40, scale: 2 });

  // 容器尺寸监听
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setSize({ w: Math.max(320, Math.floor(rect.width)), h: Math.max(320, Math.floor(rect.height)) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // WebGPU 初始化，失败自动回退 Canvas2D
  useEffect(() => {
    let cancelled = false;
    if (renderMode !== 'webgpu') {
      setGpuStatus('fallback');
      return;
    }
    WebGpuHoleRenderer.create(gpuCanvasRef.current!)
      .then((r) => {
        if (cancelled) {
          r.destroy();
          return;
        }
        gpuRef.current = r;
        setGpuStatus('ok');
      })
      .catch((err: unknown) => {
        console.warn('WebGPU 不可用，回退 Canvas2D：', err);
        if (!cancelled) {
          setGpuStatus('fallback');
          setRenderMode('canvas2d');
        }
      });
    return () => {
      cancelled = true;
      gpuRef.current?.destroy();
      gpuRef.current = null;
    };
  }, [renderMode, setRenderMode]);

  const grid = useMemo(() => (design ? buildSpatialGrid(design.holes) : new Map()), [design]);

  // 每帧重绘
  useEffect(() => {
    if (!design) return;
    const overlay = overlayRef.current;
    if (!overlay) return;
    const far = scaleDenominator(viewport) > 2000;

    if (gpuStatus === 'ok' && gpuRef.current && gpuCanvasRef.current) {
      const count = gpuRef.current.uploadHoles(design.holes, selectedHoleId, far);
      gpuRef.current.render(viewport, size.w, size.h, count);
      // 叠加层：矢量图层 + 高亮环 + 近景文字标注（孔点本身由 WebGPU 绘制）
      render2D(overlay, {
        viewport, width: size.w, height: size.h,
        design,
        selectedHoleId, hoverHoleId,
        transparent: true,
        highlightOnly: true,
      });
    } else {
      render2D(overlay, {
        viewport, width: size.w, height: size.h, design, selectedHoleId, hoverHoleId,
      });
    }
  }, [design, viewport, size, gpuStatus, selectedHoleId, hoverHoleId]);

  if (!design) {
    return (
      <div className="canvas-empty">
        <p>尚未打开设计图</p>
        <p className="muted">请从左侧档案列表选择设计，或新建/载入示例采区。</p>
      </div>
    );
  }

  const toWorld = (e: React.MouseEvent) => {
    const rect = overlayRef.current!.getBoundingClientRect();
    return screenToWorld({ x: e.clientX - rect.left, y: e.clientY - rect.top }, viewport);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (dragRef.current?.moved) return; // 平移结束不触发点击
    const world = toWorld(e);
    if (tool === 'select') {
      // 世界坐标拾取半径随缩放收窄，避免放大后误选邻孔
      const worldRadius = 6 / viewport.scale;
      const hole = pickHole(grid, world, labelsVisible(viewport) ? Math.min(worldRadius, 2.5) : worldRadius);
      selectHole(hole?.id ?? null);
    } else {
      placeAt(world);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { x: e.clientX, y: e.clientY, moved: false };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const drag = dragRef.current;
    if (drag && (e.buttons & 1)) {
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
      pan(dx, dy);
      drag.x = e.clientX;
      drag.y = e.clientY;
      return;
    }
    if (tool === 'select') {
      const world = toWorld(e);
      const hole = pickHole(grid, world, 6 / viewport.scale);
      setHoverHole(hole?.id ?? null);
      overlayRef.current!.style.cursor = hole ? 'pointer' : 'grab';
    } else {
      overlayRef.current!.style.cursor = 'crosshair';
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    const rect = overlayRef.current!.getBoundingClientRect();
    zoomAt(e.clientX - rect.left, e.clientY - rect.top, e.deltaY < 0 ? 1.15 : 1 / 1.15);
  };

  const toolHint: Record<ToolMode, string> = {
    select: '选择模式：点击炮孔查看参数，拖拽平移，滚轮缩放',
    single: '单孔布设：在图上点击放置单个炮孔',
    row: '排孔布设：点击放置一排炮孔（参数见左侧面板）',
    array: '整排阵列：点击放置矩形阵列（间距/排距默认 1.2m，自动避让）',
  };

  return (
    <div className="canvas-wrap" ref={containerRef}>
      <canvas
        ref={gpuCanvasRef}
        width={size.w}
        height={size.h}
        className="gpu-canvas"
        style={{ display: gpuStatus === 'ok' ? 'block' : 'none' }}
      />
      <canvas
        ref={overlayRef}
        width={size.w}
        height={size.h}
        className="overlay-canvas"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={() => { dragRef.current = null; }}
        onMouseLeave={() => { dragRef.current = null; setHoverHole(null); }}
        onWheel={handleWheel}
      />
      <div className="canvas-hud">
        <span className={`hud-badge ${gpuStatus === 'ok' ? 'ok' : 'fallback'}`}>
          {gpuStatus === 'ok' ? 'WebGPU 加速' : 'Canvas2D 回退'}
        </span>
        <span className="hud-badge">比例尺 1:{scaleDenominator(viewport)}</span>
        <span className="hud-badge">
          {labelsVisible(viewport) ? '标注：孔号+装药量' : '标注：仅孔点（放大至 1:500 显示标注）'}
        </span>
        <button className="hud-btn" onClick={reset}>复位视图</button>
      </div>
      <div className="canvas-tool-hint">{toolHint[tool]}</div>
    </div>
  );
}
