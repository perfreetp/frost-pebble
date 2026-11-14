import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { LayoutModel } from '../domain/types';
import { GpuRenderer } from '../gpu/renderer';
import {
  buildElevationTicks,
  buildLabels,
  buildScene,
  pickAt,
  type ScenePickables,
  type Selection,
} from '../gpu/scene';
import {
  bboxCorners,
  fitOrtho,
  cameraFromSolve,
  solveFrustum,
  intersectAxisPlane,
  makeCamera,
  normV,
  projectToScreen,
  screenDeltaToWorld,
  screenRay,
  type Camera,
  type Vec3,
} from '../gpu/math';

export type ViewMode = 'elevation' | 'top';

export interface DragPayload {
  kind: 'box' | 'segment';
  id: string;
}

interface Props {
  model: LayoutModel;
  mode: ViewMode;
  onModeChange: (m: ViewMode) => void;
  selection: Selection;
  onSelect: (sel: Selection) => void;
  onDragBox: (id: string, pos: { x: number; y: number; z: number }) => void;
  onDragSegment: (id: string, length: number) => void;
  onDragEnd: () => void;
  readOnly?: boolean;
  showLabels: boolean;
  onToggleLabels: () => void;
  highlightIds?: string[];
  /** 立面取景：all = 全街全览，detail = 按楼高取景（表箱看得清） */
  defaultFit?: FitMode;
}

export type FitMode = 'all' | 'detail';

interface ViewState {
  panX: number;
  panY: number;
  zoom: number;
}

function defaultView(mode: ViewMode): ViewState {
  // 街区是狭长条带，俯视默认放大一些，避免画面上下大片留白（可平移查看两端）
  return mode === 'elevation' ? { panX: 0, panY: 0, zoom: 1 } : { panX: 0, panY: 0, zoom: 1.45 };
}

export function LayoutView(props: Props) {
  const {
    model,
    mode,
    onModeChange,
    selection,
    onSelect,
    onDragBox,
    onDragSegment,
    onDragEnd,
    readOnly,
    showLabels,
    onToggleLabels,
    highlightIds,
    defaultFit = 'all',
  } = props;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<GpuRenderer | null>(null);
  const pickablesRef = useRef<ScenePickables>({ boxes: [], segments: [], risers: [] });
  const [gpuError, setGpuError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [adapter, setAdapter] = useState('');
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [fit, setFit] = useState<FitMode>(defaultFit);
  const [view, setView] = useState<ViewState>(() => defaultView(mode));
  const viewRef = useRef(view);
  viewRef.current = view;
  const [hover, setHover] = useState<{ x: number; y: number; label: string } | null>(null);
  const [dragging, setDragging] = useState<DragPayload | null>(null);
  const dragRef = useRef<{
    kind: 'box' | 'segment';
    id: string;
    startX: number;
    startY: number;
    base: Vec3 | number;
    moved: boolean;
  } | null>(null);
  const panRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  // ---- 尺寸监听 ----
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSize({ w: Math.max(1, Math.round(r.width)), h: Math.max(1, Math.round(r.height)) });
    });
    ro.observe(el);
    const r = el.getBoundingClientRect();
    setSize({ w: Math.max(1, Math.round(r.width)), h: Math.max(1, Math.round(r.height)) });
    return () => ro.disconnect();
  }, []);

  // ---- WebGPU 初始化 ----
  useEffect(() => {
    let dead = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    GpuRenderer.create(canvas)
      .then((r) => {
        if (dead) {
          r.destroy();
          return;
        }
        rendererRef.current = r;
        setAdapter(r.adapterInfo);
        setReady(true);
      })
      .catch((e: Error) => {
        if (!dead) setGpuError(e.message);
      });
    return () => {
      dead = true;
      rendererRef.current?.destroy();
      rendererRef.current = null;
    };
  }, []);

  // ---- 相机 ----
  const camera = useMemo<Camera>(() => {
    const b = model.bounds;
    const cx = (b.minX + b.maxX) / 2;
    const cz = (b.minZ + b.maxZ) / 2;
    const spanX = Math.max(8, b.maxX - b.minX);
    const spanY = Math.max(6, b.maxY);
    const aspect = size.w / Math.max(1, size.h);
    const zoom = view.zoom;
    const px = view.panX;
    const py = view.panY;

    if (mode === 'elevation') {
      // 正投影立面：相机在正前方沿 +z 看
      const focusX =
        fit === 'all' || !model.buildings[0]
          ? cx
          : model.buildings[0].x + Math.min(model.buildings[0].width, spanX * 0.4) / 2;
      const boxMinX = fit === 'all' ? b.minX - 2.0 : focusX - (spanX * 0.3) / 2;
      const boxMaxX = fit === 'all' ? b.maxX + 2.0 : focusX + (spanX * 0.3) / 2;
      // 内容包围盒：左右留少量、上方留标签、下方留尺寸线
      const topPad = Math.max(1.8, model.params.floorHeight * 0.55);
      const botPad = model.params.floorHeight * 1.5;
      const corners = bboxCorners(boxMinX, -botPad, b.minZ, boxMaxX, spanY + topPad, b.maxZ);
      const mid: Vec3 = [(boxMinX + boxMaxX) / 2, (spanY + topPad - botPad) / 2, cz];
      const fitted = fitOrtho([0, 0, 1], [0, 1, 0], [1, 0, 0], corners, mid, aspect, 1.0);
      const halfH = fitted.halfH / zoom;
      const dist = Math.max(spanX, spanY) * 2 + 80;
      return makeCamera({
        eye: [mid[0] + px, mid[1] + py, -dist],
        target: [mid[0] + px, mid[1] + py, 0],
        upHint: [0, 1, 0],
        rightHint: [1, 0, 0],
        orthoHalfHeight: halfH,
        orthoAspect: aspect,
        near: 0.1,
        far: dist * 2 + 500,
      });
    }
    // 俯视：斜向航拍，长条街区沿对角线铺满画面
    const fovDeg = 36;
    const azimuth = fit === 'all' ? 1.1 : 0.7;
    const elev = 1.12;
    const viewDir = normV([Math.sin(azimuth) * Math.cos(elev), -Math.sin(elev), Math.cos(azimuth) * Math.cos(elev)]);
    const focusX =
      fit === 'all' || !model.buildings[0]
        ? cx
        : model.buildings[0].x + Math.min(model.buildings[0].width, spanX * 0.4) / 2;
    const halfW = fit === 'all' ? (b.maxX - b.minX) / 2 + 1.5 : Math.min((b.maxX - b.minX) / 2, spanX * 0.22);
    const roadZ = Math.min(b.minZ, -model.params.rules.roadSetback) - 3;
    const corners: Vec3[] = [];
    for (const x of [focusX - halfW, focusX + halfW]) {
      for (const z of [roadZ, b.maxZ + 2]) {
        for (const y of [0, spanY + 1.5]) corners.push([x, y, z]);
      }
    }
    const tanH = Math.tan((fovDeg * Math.PI) / 360);
    const sol = solveFrustum(corners, viewDir, [0, 0, -1], [1, 0, 0], tanH, tanH * aspect, 0.92);
    const { target } = cameraFromSolve(viewDir, [1, 0, 0], [0, 0, -1], sol);
    const finalDist = Math.max(sol.distance / zoom, 10);
    return makeCamera({
      eye: [target[0] + px - viewDir[0] * finalDist, target[1] + py - viewDir[1] * finalDist, target[2] - viewDir[2] * finalDist],
      target: [target[0] + px, target[1] + py, target[2]],
      upHint: [0, 0, -1],
      rightHint: [1, 0, 0],
      fovDeg,
      near: 0.5,
      far: finalDist * 4 + 900,
    });
  }, [model, mode, size.w, size.h, view, fit]);

  // 供 QA/自动化测试定位实体的调试钩子（只读，不参与业务逻辑）
  useEffect(() => {
    const dbg = {
      mode,
      size,
      boxes: model.boxes.map((m) => {
        const p = projectToScreen(camera, [m.x, m.y, m.z], size.w, size.h);
        return { id: m.id, label: m.label, pinned: m.pinned, x: p?.x ?? -1, y: p?.y ?? -1, visible: !!p };
      }),
      risers: model.risers.map((r) => {
        const p = projectToScreen(camera, [r.x, Math.min(r.height * 0.5, 3), r.z], size.w, size.h);
        return { id: r.id, x: p?.x ?? -1, y: p?.y ?? -1, visible: !!p };
      }),
      segments: model.segments.map((sg) => {
        const r = model.risers.find((x) => x.id === sg.riserId);
        const p = r ? projectToScreen(camera, [r.x, sg.baseY + sg.length * 0.5, r.z], size.w, size.h) : null;
        return { id: sg.id, x: p?.x ?? -1, y: p?.y ?? -1, visible: !!p };
      }),
    };
    (window as unknown as { __layoutDebug?: typeof dbg }).__layoutDebug = dbg;
  }, [camera, model, mode, size]);

  // ---- 场景构建 + 上传 ----
  const scene = useMemo(() => buildScene(model, mode, selection), [model, mode, selection]);
  pickablesRef.current = scene.pickables;

  useEffect(() => {
    const r = rendererRef.current;
    if (!r || !ready) return;
    r.upload(scene.geometry);
  }, [scene, ready]);

  // 用 rAF 合并重绘
  const rafRef = useRef<number | null>(null);
  const draw = () => {
    const r = rendererRef.current;
    if (!r) return;
    r.render(camera, size.w, size.h);
    paintOverlay();
  };

  const paintOverlay = () => {
    const cv = overlayRef.current;
    if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (cv.width !== size.w * dpr || cv.height !== size.h * dpr) {
      cv.width = size.w * dpr;
      cv.height = size.h * dpr;
    }
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.w, size.h);

    // 选择框 / 高亮框
    if (selection.kind === 'box' && selection.id) {
      const m = model.boxes.find((x) => x.id === selection.id);
      if (m) drawWorldRect(ctx, camera, m, size.w, size.h, '#ffd24a');
    }
    if (selection.kind === 'segment' && selection.id) {
      const s = model.segments.find((x) => x.id === selection.id);
      const r = s ? model.risers.find((x) => x.id === s.riserId) : null;
      if (s && r) {
        const a = projectToScreen(camera, [r.x, s.baseY, r.z - r.radius], size.w, size.h);
        const b2 = projectToScreen(camera, [r.x, s.baseY + s.length, r.z - r.radius], size.w, size.h);
        if (a && b2) {
          ctx.strokeStyle = 'rgba(255,210,74,0.95)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b2.x, b2.y);
          ctx.stroke();
          const mid = { x: (a.x + b2.x) / 2, y: (a.y + b2.y) / 2 };
          ctx.fillStyle = '#ffd24a';
          ctx.beginPath();
          ctx.arc(mid.x, mid.y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    if (highlightIds && highlightIds.length) {
      for (const id of highlightIds) {
        const m = model.boxes.find((x) => x.id === id);
        if (m) drawWorldRect(ctx, camera, m, size.w, size.h, 'rgba(240,106,106,0.92)');
      }
    }

    // 标注
    const labels = buildLabels(camera, model, mode, size.w, size.h, selection, showLabels, fit !== 'all');
    ctx.textAlign = 'center';
    for (const it of labels) {
      const font = it.kind === 'box' || it.kind === 'segment' || it.kind === 'riser'
        ? it.accent ? '600 11px "PingFang SC","Microsoft YaHei",sans-serif' : '500 10.5px "PingFang SC","Microsoft YaHei",sans-serif'
        : '500 10.5px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.font = font;
      const padX = 5;
      const w = ctx.measureText(it.text).width + padX * 2;
      const h = 15;
      const x = it.x;
      const y = it.y;
      ctx.fillStyle = it.accent ? 'rgba(255,210,74,0.16)' : 'rgba(9,14,19,0.74)';
      roundRect(ctx, x - w / 2, y - h + 2, w, h, 4);
      ctx.fill();
      ctx.strokeStyle = it.accent ? 'rgba(255,210,74,0.6)' : 'rgba(120,145,170,0.22)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = it.accent ? '#ffe9a3' : it.kind === 'building' ? '#c3d2e0' : '#9fb2c4';
      ctx.fillText(it.text, x, y - 4);

      // 引线
      if (it.kind === 'box' || it.kind === 'segment' || it.kind === 'riser') {
        const anchor = anchorScreen(it);
        if (anchor) {
          ctx.beginPath();
          ctx.moveTo(x, y + 2);
          ctx.lineTo(anchor.x, anchor.y);
          ctx.strokeStyle = it.accent ? 'rgba(255,210,74,0.5)' : 'rgba(120,145,170,0.22)';
          ctx.stroke();
        }
      }
    }

    // 立面标高尺
    if (mode === 'elevation') {
      const ticks = buildElevationTicks(camera, model, size.w, size.h);
      if (ticks.length) {
        const baseX = Math.max(14, ticks[0].x - 34);
        ctx.strokeStyle = 'rgba(140,162,182,0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(baseX + 22, ticks[0].y);
        ctx.lineTo(baseX + 22, ticks[ticks.length - 1].y);
        for (const t of ticks) {
          ctx.moveTo(baseX + 14, t.y);
          ctx.lineTo(baseX + 30, t.y);
        }
        ctx.stroke();
        ctx.font = '500 10px "JetBrains Mono",Consolas,monospace';
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(160,180,200,0.85)';
        for (const t of ticks) {
          ctx.fillText(t.label, baseX + 11, t.y + 3);
        }
        ctx.textAlign = 'center';
      }
    }

    // 立面尺寸线：楼栋开间标注
    if (mode === 'elevation') {
      drawDimensions(ctx, camera, model, size.w, size.h);
    }

    // hover 十字准星
    if (hover && !dragging) {
      ctx.strokeStyle = 'rgba(245,166,35,0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(hover.x, hover.y, 7, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (dragging) {
      ctx.strokeStyle = 'rgba(255,210,74,0.9)';
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(dragging.kind === 'box' ? size.w / 2 - 1 : 0, 0, 1, 0);
      ctx.setLineDash([]);
    }
  };

  const anchorScreen = (it: { x: number; y: number }) => ({ x: it.x, y: it.y + 12 });

  useEffect(() => {
    if (!ready) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      draw();
    });
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, scene, selection, showLabels, hover, dragging, size, ready, mode, highlightIds]);

  // ---- 交互 ----
  const toLocal = (e: { clientX: number; clientY: number }) => {
    const el = wrapRef.current;
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const hitTest = (x: number, y: number) => {
    const ray = screenRay(camera, x, y, size.w, size.h);
    return pickAt(pickablesRef.current, ray.origin, ray.dir);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const { x, y } = toLocal(e);
    if (e.button === 1 || e.button === 2 || e.shiftKey) {
      panRef.current = { x, y, panX: view.panX, panY: view.panY };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      return;
    }
    const hit = hitTest(x, y);
    if (!hit) {
      onSelect({ kind: null, id: null });
      panRef.current = { x, y, panX: view.panX, panY: view.panY };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      return;
    }
    if (hit.kind === 'riser') {
      onSelect({ kind: 'riser', id: hit.id });
      return;
    }
    onSelect({ kind: hit.kind, id: hit.id });
    if (readOnly) return;
    if (hit.kind === 'box') {
      const m = model.boxes.find((b) => b.id === hit.id);
      if (!m) return;
      dragRef.current = { kind: 'box', id: hit.id, startX: x, startY: y, base: [m.x, m.y, m.z], moved: false };
      setDragging({ kind: 'box', id: hit.id });
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } else if (hit.kind === 'segment') {
      const s = model.segments.find((g) => g.id === hit.id);
      if (!s) return;
      dragRef.current = { kind: 'segment', id: hit.id, startX: x, startY: y, base: s.length, moved: false };
      setDragging({ kind: 'segment', id: hit.id });
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const { x, y } = toLocal(e);

    if (panRef.current) {
      const p = panRef.current;
      const dx = x - p.x;
      const dy = y - p.y;
      const scale = camera.ortho ? (camera.ortho.halfW * 2) / size.w : 0.05 * (view.zoom ? 1 / view.zoom : 1);
      const k = camera.ortho ? scale : 0.045 + 0.02 / view.zoom;
      setView((v) => ({ ...v, panX: p.panX - dx * k, panY: p.panY + dy * k }));
      return;
    }

    const d = dragRef.current;
    if (d) {
      const dist = Math.hypot(x - d.startX, y - d.startY);
      if (dist > 3) d.moved = true;
      if (!d.moved) return;
      if (d.kind === 'box') {
        const base = d.base as Vec3;
        if (mode === 'elevation') {
          // 立面：在墙面所在平面内移动，进深保持不变
          const ray = screenRay(camera, x, y, size.w, size.h);
          const hit = intersectAxisPlane(ray.origin, ray.dir, 2, base[2]);
          if (hit) {
            onDragBox(d.id, {
              x: Math.round(hit[0] * 100) / 100,
              y: Math.round(Math.max(0.1, hit[1]) * 100) / 100,
              z: base[2],
            });
          }
        } else {
          // 俯视：在地面平面上移动，安装高度保持不变
          const ray = screenRay(camera, x, y, size.w, size.h);
          const planeY = 0;
          if (Math.abs(ray.dir[1]) > 1e-5) {
            const t = (planeY - ray.origin[1]) / ray.dir[1];
            if (t > 0) {
              const pxw = ray.origin[0] + ray.dir[0] * t;
              const pzw = ray.origin[2] + ray.dir[2] * t;
              onDragBox(d.id, {
                x: Math.round(pxw * 100) / 100,
                y: base[1],
                z: Math.round(pzw * 100) / 100,
              });
            }
          }
        }
      } else {
        // 让该段顶部跟随鼠标：把起始/当前鼠标位置都投到立管所在竖直平面，取高度差
        const base = d.base as number;
        const seg = model.segments.find((g) => g.id === d.id);
        const riser = seg ? model.risers.find((r) => r.id === seg.riserId) : undefined;
        const planeZ = riser ? riser.z : 0;
        const startHit = screenRay(camera, d.startX, d.startY, size.w, size.h);
        const nowHit = screenRay(camera, x, y, size.w, size.h);
        const p0 = intersectAxisPlane(startHit.origin, startHit.dir, 2, planeZ);
        const p1 = intersectAxisPlane(nowHit.origin, nowHit.dir, 2, planeZ);
        const grow = p1 && p0 ? p1[1] - p0[1] : screenDeltaToWorld(camera, x - d.startX, y - d.startY, size.w, size.h).y;
        const next = Math.round((base + grow) * 100) / 100;
        onDragSegment(d.id, Math.min(Math.max(next, 0.2), model.params.floorHeight * 4));
      }
      return;
    }

    // hover 拾取
    const hit = hitTest(x, y);
    if (hit) {
      const label =
        hit.kind === 'box'
          ? model.boxes.find((b) => b.id === hit.id)?.label ?? ''
          : hit.kind === 'segment'
            ? `立管段 ${hit.id.replace('S-', '')}`
            : hit.id;
      setHover({ x, y, label });
    } else {
      setHover(null);
    }
  };

  const endPointer = (e: React.PointerEvent) => {
    if (panRef.current) {
      panRef.current = null;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* 已释放 */
      }
      return;
    }
    if (dragRef.current) {
      const moved = dragRef.current.moved;
      dragRef.current = null;
      setDragging(null);
      if (moved) onDragEnd();
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* 已释放 */
      }
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const { x, y } = toLocal(e);
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setView((v) => ({
      ...v,
      zoom: Math.min(4, Math.max(0.35, v.zoom * factor)),
      // 以鼠标位置为锚点缩放
      panX: v.panX + (x - size.w / 2) * 0.002 * (1 / factor - 1) * (mode === 'elevation' ? 1 : 0),
      panY: v.panY - (y - size.h / 2) * 0.002 * (1 / factor - 1) * (mode === 'elevation' ? 1 : 0),
    }));
  };

  const resetView = () => setView(defaultView(mode));

  useEffect(() => {
    resetView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, fit]);

  return (
    <div className="viewport" ref={wrapRef} onContextMenu={(e) => e.preventDefault()}>
      <canvas ref={canvasRef} style={{ display: gpuError ? 'none' : 'block' }} />
      <canvas ref={overlayRef} className="viewport-overlay" style={{ display: gpuError ? 'none' : 'block' }} />
      {gpuError && (
        <div className="viewport-fallback">
          <div>
            <h3>WebGPU 不可用</h3>
            <div style={{ maxWidth: 420, lineHeight: 1.7 }}>
              {gpuError}
              <br />
              <br />
              请在 Chrome / Edge 113+ 中打开，并确认显卡驱动支持 WebGPU。排布的生成、校验与工单流转仍可正常使用。
            </div>
          </div>
        </div>
      )}
      <div
        className="viewport-overlay"
        style={{ pointerEvents: 'auto', cursor: panRef.current ? 'grabbing' : dragging ? 'grabbing' : hover ? 'pointer' : 'grab' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onWheel={onWheel}
        onDoubleClick={resetView}
      />
      <div className="viewport-hud">
        <button className={`view-hud-btn ${mode === 'elevation' ? 'active' : ''}`} onClick={() => onModeChange('elevation')}>
          立面视图
        </button>
        <button className={`view-hud-btn ${mode === 'top' ? 'active' : ''}`} onClick={() => onModeChange('top')}>
          俯视视图
        </button>
        <button className={`view-hud-btn ${showLabels ? 'active' : ''}`} onClick={onToggleLabels}>
          {showLabels ? '标注开' : '标注关'}
        </button>
        <button className={`view-hud-btn ${fit === 'all' ? 'active' : ''}`} onClick={() => setFit((f) => (f === 'all' ? 'detail' : 'all'))} title="切换全街全览 / 单栋近观">
          {fit === 'all' ? '全览' : '近观'}
        </button>
        <button className="view-hud-btn" onClick={resetView}>
          复位
        </button>
      </div>
      {hover && (
        <div
          className="viewport-tip"
          style={{ left: hover.x + 14, top: hover.y + 12, bottom: 'auto', pointerEvents: 'none' }}
        >
          {hover.label}
          {!readOnly && <span style={{ marginLeft: 8, color: '#7d92a6' }}>拖动可移动</span>}
        </div>
      )}
      <div className="viewport-info">
        <span>{adapter || 'WebGPU'}</span>
        <span>
          {mode === 'elevation' ? '正投影立面' : '透视俯视'} · {Math.round(view.zoom * 100)}%
        </span>
      </div>
    </div>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawWorldRect(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  m: { x: number; y: number; z: number; w: number; h: number; d: number },
  width: number,
  height: number,
  color: string,
) {
  const x0 = m.x - m.w / 2;
  const x1 = m.x + m.w / 2;
  const y0 = m.y - m.h / 2;
  const y1 = m.y + m.h / 2;
  const z = m.z - m.d / 2 - 0.012;
  const pts = [
    projectToScreen(cam, [x0, y0, z], width, height),
    projectToScreen(cam, [x1, y0, z], width, height),
    projectToScreen(cam, [x1, y1, z], width, height),
    projectToScreen(cam, [x0, y1, z], width, height),
  ];
  if (pts.some((p) => !p)) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  pts.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p!.x, p!.y);
    else ctx.lineTo(p!.x, p!.y);
  });
  ctx.closePath();
  ctx.stroke();
}


/** 立面底部的总尺寸线与各栋开间标注 */
function drawDimensions(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  model: LayoutModel,
  width: number,
  height: number,
) {
  const b = model.bounds;
  const y = -model.params.floorHeight * 0.28;
  const z = -model.params.rules.roadSetback * 0.5;
  const left = projectToScreen(cam, [b.minX, y, z], width, height);
  const right = projectToScreen(cam, [b.maxX, y, z], width, height);
  if (!left || !right) return;
  const top = Math.max(left.y, right.y);

  ctx.save();
  ctx.strokeStyle = 'rgba(150,172,194,0.55)';
  ctx.fillStyle = 'rgba(160,182,202,0.9)';
  ctx.lineWidth = 1;
  ctx.font = '500 10px "JetBrains Mono",Consolas,monospace';
  ctx.textAlign = 'center';

  // 总长（线画在楼栋下方，文字放在线下方，避免压住立面）
  const lineY = top + 10;
  ctx.beginPath();
  ctx.moveTo(left.x, lineY);
  ctx.lineTo(right.x, lineY);
  ctx.moveTo(left.x, lineY - 5);
  ctx.lineTo(left.x, lineY + 5);
  ctx.moveTo(right.x, lineY - 5);
  ctx.lineTo(right.x, lineY + 5);
  ctx.stroke();
  const midX = (left.x + right.x) / 2;
  const totalLabel = `沿街总长 ${(b.maxX - b.minX).toFixed(2)} m`;
  const tw = ctx.measureText(totalLabel).width + 10;
  ctx.fillStyle = 'rgba(10,16,21,0.88)';
  roundRect(ctx, midX - tw / 2, lineY + 4, tw, 14, 3);
  ctx.fill();
  ctx.fillStyle = 'rgba(178,198,216,0.95)';
  ctx.fillText(totalLabel, midX, lineY + 14);

  // 各栋宽度
  ctx.font = '500 9.5px "JetBrains Mono",Consolas,monospace';
  for (const bd of model.buildings) {
    const l = projectToScreen(cam, [bd.x, y, z], width, height);
    const r = projectToScreen(cam, [bd.x + bd.width, y, z], width, height);
    if (!l || !r) continue;
    const yy = Math.max(l.y, r.y) + 34;
    ctx.strokeStyle = 'rgba(140,164,188,0.34)';
    ctx.beginPath();
    ctx.moveTo(l.x, yy);
    ctx.lineTo(r.x, yy);
    ctx.moveTo(l.x, yy - 4);
    ctx.lineTo(l.x, yy + 4);
    ctx.moveTo(r.x, yy - 4);
    ctx.lineTo(r.x, yy + 4);
    ctx.stroke();
    if (r.x - l.x > 52) {
      ctx.fillStyle = 'rgba(150,172,194,0.85)';
      ctx.fillText(`${bd.width.toFixed(1)}`, (l.x + r.x) / 2, yy + 12);
    }
  }
  ctx.restore();
}
