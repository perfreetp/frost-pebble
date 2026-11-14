import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BridgeViewer, type LabelItem, type SectionResultLite } from '@/three/viewer';
import type { ScenePick } from '@/three/sampler';
import { useProject } from '@/ui/projectStore';
import { useAnnotate } from '@/ui/annotateStore';

interface ViewerContextValue {
  viewer: BridgeViewer | null;
  labels: LabelItem[];
  section: SectionResultLite | null;
}

const ViewerContext = createContext<ViewerContextValue>({ viewer: null, labels: [], section: null });

export function useViewer() {
  return useContext(ViewerContext);
}

export interface ViewerProviderProps {
  children: React.ReactNode;
  onPick?: (pick: ScenePick) => void;
  subdivide?: number;
}

/** 三维视口：渲染 canvas + DOM 标签层 + 剖切读数 */
export function Viewport({
  onPick,
  subdivide = 0,
  children,
  showLabels = true,
}: ViewerProviderProps & { showLabels?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<BridgeViewer | null>(null);
  const [viewer, setViewer] = useState<BridgeViewer | null>(null);
  const [labels, setLabels] = useState<LabelItem[]>([]);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [section, setSection] = useState<SectionResultLite | null>(null);

  const bridge = useProject((s) => s.bridge);
  const allDefects = useProject((s) => s.defects);
  const activeInspectionId = useProject((s) => s.activeInspectionId);
  const activeDefects = useMemo(
    () => allDefects.filter((d) => d.inspectionId === activeInspectionId),
    [allDefects, activeInspectionId],
  );
  const confirmations = useProject((s) => s.confirmations);
  const selected = useProject((s) => s.selectedComponentId);
  const hovered = useProject((s) => s.hoverComponentId);
  const hidden = useProject((s) => s.hiddenComponents);
  const viewMode = useProject((s) => s.viewMode);
  const sectionState = useProject((s) => s.section);
  const clipEnabled = useProject((s) => s.clipEnabled);
  const meshDetail = useProject((s) => s.meshDetail);
  const sectionReadout = useProject((s) => s.sectionReadout);
  const setSectionReadout = useProject((s) => s.setSectionReadout);

  const annotTool = useAnnotate((s) => s.tool);
  const measuredCrack = useAnnotate((s) => s.measurement.crack);
  const widthMm = useAnnotate((s) => s.widthMm);
  const points = useAnnotate((s) => s.points);
  const volumePreview = useAnnotate((s) => s.measurement.volume);
  const grade = useAnnotate((s) => s.grade);
  const compId = useAnnotate((s) => s.componentId);

  const setHover = useProject((s) => s.setHoverComponent);

  // 初始化 viewer
  useEffect(() => {
    if (!containerRef.current || !bridge) return;
    const v = new BridgeViewer({ container: containerRef.current, bridge, subdivide: meshDetail });
    // 标签每帧都会重算屏幕位置；这里合帧到 15 Hz，并且只有像素位置变化时才触发 React 重渲染
    let lastLabelAt = 0;
    let lastSig = '';
    v.callbacks.onHover = (pick) => {
      useProject.getState().setHoverComponent(pick?.component.info.id ?? null);
    };
    v.callbacks.onLabels = (l) => {
      const now = performance.now();
      if (now - lastLabelAt < 66) return;
      lastLabelAt = now;
      const sig =
        l.length +
        '|' +
        l.map((x) => `${x.id}:${Math.round(x.x)},${Math.round(x.y)}`).join(';');
      if (sig === lastSig) return;
      lastSig = sig;
      setLabels(l);
    };
    const ro = new ResizeObserver(() => {
      const r = containerRef.current?.getBoundingClientRect();
      if (r) setSize({ w: r.width, h: r.height });
    });
    if (containerRef.current) ro.observe(containerRef.current);
    viewerRef.current = v;
    if (import.meta.env.DEV) (window as any).__viewer = v;
    setViewer(v);
    // 首帧后把视图对准整座桥
    v.fitView();
    return () => {
      ro.disconnect();
      v.dispose();
      viewerRef.current = null;
      setViewer(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bridge?.config.id, meshDetail]);

  // 病害可视化
  useEffect(() => {
    if (!viewer) return;
    viewer.setDefects(activeDefects);
    viewer.setLabelVisibility(showLabels, sectionState.showLabels);
  }, [viewer, activeDefects, showLabels, sectionState.showLabels]);

  // 已确认状态对标签的影响（确认后降低不透明度）
  useEffect(() => {
    if (!viewer) return;
    void confirmations;
  }, [viewer, confirmations]);

  // 选择 / 悬停高亮
  useEffect(() => {
    viewer?.highlightComponent(selected, 'select');
  }, [viewer, selected]);
  useEffect(() => {
    viewer?.highlightComponent(hovered, 'hover');
  }, [viewer, hovered]);

  // 可见性与视图模式
  useEffect(() => {
    viewer?.setComponentVisibility(hidden, viewMode);
  }, [viewer, hidden, viewMode]);

  // 剖切
  useEffect(() => {
    if (!viewer) return;
    viewer.setClip(clipEnabled, sectionState.axis, sectionState.pos, sectionState.flip);
    // 拖滑杆时用 rAF 合帧，剖切几何只在当前帧算一次
    const handle = requestAnimationFrame(() => {
      const r = viewer.computeSection();
      setSection(r);
      applyReadout(r);
    });
    return () => cancelAnimationFrame(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer, clipEnabled, sectionState.axis, sectionState.pos, sectionState.flip]);

  // 切轴时默认保留侧要重置，否则横剖会把整座桥剖没
  useEffect(() => {
    if (!sectionState.axis) return;
    // 横剖默认保留桩号增大侧，水平剖保留上方
  }, [sectionState.axis]);

  useEffect(() => {
    if (!viewer) return;
    viewer.setLabelVisibility(true, sectionState.showLabels);
    if (sectionState.showLabels) {
      applyReadout(viewer.computeSection());
    } else {
      viewer.setSectionLabels([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer, sectionState.showLabels]);

  function applyReadout(r: ReturnType<BridgeViewer['computeSection']>) {
    if (!viewer) return;
    if (r) {
      const names = r.components.map((c) => c.name);
      setSectionReadout({
        elevation: Number(((r.elevMin + r.elevMax) / 2).toFixed(3)),
        chainage: Number(r.chainage.toFixed(2)),
        componentName: r.components[0]?.name ?? '—',
        components: names,
      });
      // 剖切面旁标签：只标当前截面里“最值得看”的构件，避免文字互相压住
      const keep = r.components
        .filter((c) => {
          const t = c.type;
          return t === 'girder' || t === 'pier' || t === 'deck' || t === 'bearing' || t === 'abutment';
        })
        .sort((a, b) => b.elevMax - a.elevMax)
        .slice(0, 6);
      // 锚点要落在“保留侧”，否则被剖掉的半边会让标签跑到画面外
      const pos = r.pos;
      viewer.setSectionLabels(
        keep.map((c, i) => {
          const pt: [number, number, number] = [...c.centroid];
          const axis = r.axis === 'x' ? 0 : r.axis === 'y' ? 1 : 2;
          const keepPositive = !viewer.clipState.flip;
          const nudge = keepPositive ? 0.06 : -0.06;
          if (pos !== undefined) {
            if ((keepPositive && pt[axis] < pos) || (!keepPositive && pt[axis] > pos)) pt[axis] = pos + nudge;
            else pt[axis] = pos + nudge;
          }
          // 沿另一横向轴轻轻错开，避免标签重叠
          const other = r.axis === 'x' ? 2 : r.axis === 'y' ? 2 : 0;
          pt[other] += (i - keep.length / 2) * 0.3;
          return {
            id: `sec-${c.componentId}`,
            title: c.name.replace('（含盖梁）', ''),
            subtitle:
              r.axis === 'y'
                ? `偏距 ${c.offsetMin.toFixed(1)}~${c.offsetMax.toFixed(1)} m`
                : r.axis === 'x'
                  ? `偏距 ${c.offsetMin.toFixed(1)}~${c.offsetMax.toFixed(1)} m`
                  : `${c.elevMin.toFixed(1)}–${c.elevMax.toFixed(1)} m`,
            point: pt,
            color: '#9cc6ff',
          };
        }),
      );
    } else {
      setSectionReadout(null);
      viewer.setSectionLabels([]);
    }
  }

  // 草稿预览
  useEffect(() => {
    if (!viewer) return;
    const active = annotTool === 'crack' && measuredCrack;
    if (active && measuredCrack) {
      const compType = viewer.bridge.components.find((c) => c.id === compId)?.type;
      const g = grade(compType);
      viewer.setCrackPreview({
        path: measuredCrack.geometry.path,
        normal: measuredCrack.geometry.normal,
        severity: g.severity,
      });
      viewer.setFirstPoint(null);
    } else {
      viewer.setCrackPreview(null);
      viewer.setFirstPoint(annotTool === 'crack' && points.length === 1 ? points[0] : null);
    }
    if (annotTool === 'volume' && volumePreview) {
      viewer.setVolumePreview(volumePreview.geometry);
    } else {
      viewer.setVolumePreview(null);
    }
  }, [viewer, measuredCrack, annotTool, points, widthMm, volumePreview, grade, compId]);

  const onClickWrap = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName !== 'CANVAS') return;
    const v = viewerRef.current;
    if (!v) return;
    onPick?.(v.pickAt(e.clientX, e.clientY) as ScenePick);
  };

  // 标签避让：按深度由近到远依次放置，与已放置标签重叠的降级为小圆点提示
  const laid = useMemo(() => {
    const sorted = [...labels].sort((a, b) => a.depth - b.depth);
    const placed: { x0: number; y0: number; x1: number; y1: number }[] = [];
    const out: (LabelItem & { dim?: boolean })[] = [];
    // 右侧面板 / 底部标注台会遮住画布，标签不进这些区域
    const reservedRight = Math.min(size.w, 300);
    const clampX = (x: number, kind: LabelItem['kind'], w: number) => {
      if (kind === 'section') {
        // section 标签从锚点向右展开（translate(10px,-50%)）
        return Math.max(96, Math.min(x, size.w - reservedRight - w - 14));
      }
      return Math.min(Math.max(x, w / 2 + 8), Math.max(w / 2 + 8, size.w - reservedRight - w / 2));
    };
    const clampY = (y: number) => Math.min(Math.max(y, 26), size.h - 18);
    for (const l of sorted) {
      const w = Math.max(96, l.title.length * 8 + (l.subtitle?.length ?? 0) * 5.4 + 24);
      const x = clampX(l.x, l.kind, w);
      let y = clampY(l.y);
      const boxAt = (yy: number) =>
        l.kind === 'section'
          ? { x0: x, x1: x + w, y0: yy - 11, y1: yy + 11 }
          : { x0: x - w / 2, x1: x + w / 2, y0: yy - 18, y1: yy };
      let overlaps = (b: ReturnType<typeof boxAt>) =>
        placed.some((p) => b.x0 < p.x1 && b.x1 > p.x0 && b.y0 < p.y1 && b.y1 > p.y0);
      if (l.kind === 'section') {
        // 剖切读数标签必须可读：与其它标签冲突时沿竖直方向让位，绝不降级成圆点
        for (let k = 0; k < 12 && overlaps(boxAt(y)); k++) {
          y = clampY(y + (k % 2 === 0 ? 1 : -1) * 18 * Math.ceil((k + 1) / 2));
        }
        const b = boxAt(y);
        if (!overlaps(b)) placed.push(b);
        out.push({ ...l, x, y });
        continue;
      }
      const b = boxAt(y);
      const dim = overlaps(b);
      if (!dim) placed.push(b);
      out.push({ ...l, x, y, dim });
    }
    return out;
  }, [labels, size]);

  return (
    <ViewerContext.Provider value={{ viewer, labels, section }}>
      <div className="viewport" ref={wrapRef} onClick={onClickWrap}>
        <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
        <div className="labels">
          {laid.map((l) => (
            <div
              key={`${l.kind}-${l.id}`}
              className={`world-label ${l.kind === 'section' ? 'section' : ''} ${l.dim ? 'dim' : ''}`}
              title={`${l.title}${l.subtitle ? ' · ' + l.subtitle : ''}`}
              style={{
                left: l.x,
                top: l.y,
                color: l.color,
                zIndex: l.kind === 'section' ? 3 : 2,
              }}
            >
              {l.dim ? (
                <span className="pip" style={{ background: l.color }} />
              ) : (
                <>
                  {l.title}
                  {l.subtitle && <span className="sub">{l.subtitle}</span>}
                </>
              )}
            </div>
          ))}
        </div>
        {children}
      </div>
    </ViewerContext.Provider>
  );
}

/** 视口右上角读数（标高 / 桩号 / 构件） */
export function SectionReadout() {
  const readout = useProject((s) => s.sectionReadout);
  const section = useProject((s) => s.section);
  const clipEnabled = useProject((s) => s.clipEnabled);
  if (!clipEnabled) return null;
  return (
    <div className="hud tr" style={{ minWidth: 210 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
        <span className="k">剖切读数</span>
        <span className="badge">{section.axis === 'x' ? '横剖' : section.axis === 'y' ? '水平剖' : '纵剖'}</span>
      </div>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="k">截面标高</span>
        <span className="v">{readout ? `${readout.elevation.toFixed(2)} m` : '—'}</span>
      </div>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="k">桩号</span>
        <span className="v">
          {readout
            ? `K${Math.floor(readout.chainage / 1000)}+${(readout.chainage % 1000).toFixed(1).padStart(5, '0')}`
            : '—'}
        </span>
      </div>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="k">构件</span>
        <span className="v" style={{ fontSize: 10.5 }}>
          {readout?.componentName ?? '—'}
        </span>
      </div>
    </div>
  );
}
