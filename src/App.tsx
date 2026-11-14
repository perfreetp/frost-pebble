import React, { useCallback, useEffect, useState } from 'react';
import {
  Boxes,
  ListTree,
  PencilRuler,
  Scissors,
  CalendarClock,
  FileText,
  LayoutGrid,
  X,
  Maximize2,
  Crosshair,
  Ruler,
  Box,
} from 'lucide-react';
import { useProject, type TabKey } from '@/ui/projectStore';
import { useAnnotate, type AnnotateTool } from '@/ui/annotateStore';
import { Viewport, SectionReadout, useViewer } from '@/ui/Viewport';
import { ComponentTree } from '@/ui/ComponentTree';
import { AnnotateDock } from '@/ui/AnnotateDock';
import { SectionPanel } from '@/ui/SectionPanel';
import { TimelineView } from '@/ui/TimelineView';
import { ReportView } from '@/ui/ReportView';
import { ImportView } from '@/ui/ImportView';
import type { ScenePick } from '@/three/sampler';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'import', label: '模型导入', icon: <Boxes size={14} /> },
  { key: 'tree', label: '构件树', icon: <ListTree size={14} /> },
  { key: 'annotate', label: '标注台', icon: <PencilRuler size={14} /> },
  { key: 'section', label: '剖切查看', icon: <Scissors size={14} /> },
  { key: 'timeline', label: '时间线', icon: <CalendarClock size={14} /> },
  { key: 'report', label: '报告', icon: <FileText size={14} /> },
];

export function App() {
  const load = useProject((s) => s.load);
  const loading = useProject((s) => s.loading);
  const error = useProject((s) => s.error);
  const bridge = useProject((s) => s.bridge);
  const tab = useProject((s) => s.tab);
  const setTab = useProject((s) => s.setTab);
  const viewMode = useProject((s) => s.viewMode);
  const setViewMode = useProject((s) => s.setViewMode);
  const inspections = useProject((s) => s.inspections);
  const activeInspectionId = useProject((s) => s.activeInspectionId);
  const setActiveInspection = useProject((s) => s.setActiveInspection);
  const confirmations = useProject((s) => s.confirmations);
  const meshDetail = useProject((s) => s.meshDetail);
  const setMeshDetail = useProject((s) => s.setMeshDetail);

  const [picked, setPicked] = useState<ScenePick | null>(null);

  useEffect(() => {
    void load();
  }, [load]);

  // 快捷键：1/2/3 切标注工具，Esc 清空当前标注，F 聚焦选中构件
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
      const a = useAnnotate.getState();
      if (e.key === '1') a.setTool('select');
      else if (e.key === '2') a.setTool('crack');
      else if (e.key === '3') a.setTool('volume');
      else if (e.key === 'Escape') {
        a.clearPoints();
        a.setToast(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onPick = useCallback((pick: ScenePick | null) => {
    setPicked(pick);
    const tool = useAnnotate.getState().tool;
    if (!pick) {
      if (tool === 'crack' || tool === 'volume') {
        useAnnotate.getState().setToast({
          kind: 'warning',
          text: '没有点中构件：请对准模型表面再点一次（剖切打开时被剖掉的半边不可拾取）',
        });
      }
      return;
    }
    const state = useAnnotate.getState();
    const pickedId = pick.component.info.id;
    if (tool === 'select' || tool === 'section') {
      state.setComponent(pickedId);
      useProject.getState().selectComponent(pickedId);
      return;
    }
    if (!state.componentId) {
      state.setComponent(pickedId);
      useProject.getState().selectComponent(pickedId);
    } else if (state.componentId !== pickedId) {
      state.setToast({
        kind: 'error',
        text: `两个端点必须位于同一构件：当前已选 ${useProject.getState().componentById(state.componentId)?.name ?? ''}，这次点到 ${pick.component.info.name}`,
      });
      return;
    }
    state.addPoint(pick.point);
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <div>正在加载桥梁模型与病害档案…</div>
      </div>
    );
  }
  if (error || !bridge) {
    return (
      <div className="loading">
        <div style={{ color: '#ffb3b6' }}>加载失败：{error ?? '未知错误'}</div>
        <div className="small muted">请确认后端已启动（npm run dev），首次使用请运行 npm run seed</div>
        <button onClick={() => void load()}>重试</button>
      </div>
    );
  }

  const activeInsp = inspections.find((i) => i.id === activeInspectionId);
  const confirmedCount = confirmations.filter((c) => c.confirmed).length;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="dot" />
          桥检 · 三维病害标注
          <span className="sub">{bridge.config.name}</span>
        </div>
        <nav className="tabs">
          {TABS.map((t) => (
            <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              <span className="row" style={{ gap: 5 }}>
                {t.icon}
                {t.label}
              </span>
            </button>
          ))}
        </nav>
        <div className="spacer" />
        <div className="toolbar-group">
          {activeInsp && (
            <select
              value={activeInspectionId}
              onChange={(e) => void setActiveInspection(e.target.value)}
              style={{ width: 190, height: 27, fontSize: 12 }}
              title="切换巡检批次"
            >
              {inspections
                .slice()
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.title}
                  </option>
                ))}
            </select>
          )}
          <select
            value={meshDetail}
            onChange={(e) => setMeshDetail(Number(e.target.value))}
            style={{ width: 118, height: 27, fontSize: 12 }}
            title="模型网格密度（面片数）"
          >
            <option value={0}>网格 轻量</option>
            <option value={2}>网格 中等</option>
            <option value={3}>网格 26 万</option>
            <option value={4}>网格 100 万</option>
          </select>
          <select value={viewMode} onChange={(e) => setViewMode(e.target.value as typeof viewMode)} style={{ width: 92, height: 27, fontSize: 12 }}>
            <option value="solid">实体</option>
            <option value="xray">透视</option>
            <option value="wireframe">线框</option>
          </select>
          <span className="chip" title="本批次已由工程师逐条确认的病害数">
            已确认 {confirmedCount}
          </span>
        </div>
      </header>

      {tab === 'import' && <ImportView />}
      {tab === 'tree' && <TreeLayout />}
      {tab === 'annotate' && <AnnotateLayout onPick={onPick} />}
      {tab === 'section' && <SectionLayout onPick={onPick} />}
      {tab === 'timeline' && <TimelineLayout />}
      {tab === 'report' && <ReportView />}
      {picked && tab !== 'annotate' ? null : null}
    </div>
  );
}

function TreeLayout() {
  const select = useProject((s) => s.setSection);
  void select;
  return (
    <div className="workspace">
      <Viewport>
        <ViewportHud />
      </Viewport>
      <div className="sidebar">
        <ComponentTree />
      </div>
    </div>
  );
}

function AnnotateLayout({ onPick }: { onPick: (p: ScenePick | null) => void }) {
  return (
    <div className="workspace">
      <div className="sidebar left">
        <ComponentTree compact />
      </div>
      <Viewport onPick={onPick}>
        <AnnotateToolRail />
        <ViewportHud />
        <SectionReadout />
        <AnnotateDock />
      </Viewport>
    </div>
  );
}

function SectionLayout({ onPick }: { onPick: (p: ScenePick | null) => void }) {
  const clipEnabled = useProject((s) => s.clipEnabled);
  const setSection = useProject((s) => s.setSection);
  const defects = useProject((s) => s.defects);
  const activeId = useProject((s) => s.activeInspectionId);
  const bridge = useProject((s) => s.bridge)!;

  useEffect(() => {
    if (!clipEnabled) {
      setSection({ axis: 'z', pos: 0, enabled: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="workspace">
      <Viewport onPick={onPick}>
        <SectionPanel />
        <ViewportHud />
      </Viewport>
      <div className="sidebar">
        <div className="panel">
          <h3>剖切说明</h3>
          <div className="hint">
            拖动滑杆移动剖切面。剖切面旁的标签实时给出该截面内每个构件的标高范围与名称；
            右上角读数同步显示截面标高与桩号。剖切保留侧可翻转，便于观察箱梁内部。
          </div>
        </div>
        <div className="panel" style={{ borderTop: '1px solid var(--line)' }}>
          <h3>本跨严重病害</h3>
          <div className="col" style={{ gap: 4 }}>
            {defects
              .filter((d) => d.inspectionId === activeId && d.severity === 'critical')
              .slice(0, 8)
              .map((d) => (
                <div className="row small" key={d.id} style={{ justifyContent: 'space-between' }}>
                  <span className="mono">{d.code}</span>
                  <span className="muted">{d.elevation.toFixed(1)} m</span>
                </div>
              ))}
            {defects.filter((d) => d.inspectionId === activeId && d.severity === 'critical').length === 0 && (
              <span className="hint">本期无严重级病害</span>
            )}
          </div>
        </div>
        <div className="panel small muted" style={{ borderTop: '1px solid var(--line)' }}>
          桥面宽度 {bridge.config.deckWidth} m · 梁高 {bridge.config.girderDepth} m · 共 {bridge.config.spans.length} 跨
        </div>
      </div>
    </div>
  );
}

function TimelineLayout() {
  return (
    <div className="workspace" style={{ background: 'var(--panel)' }}>
      <TimelineView />
    </div>
  );
}

function AnnotateToolRail() {
  const tool = useAnnotate((s) => s.tool);
  const setTool = useAnnotate((s) => s.setTool);
  const bridge = useProject((s) => s.bridge)!;
  const viewer = useViewer().viewer;

  const items: { key: AnnotateTool; icon: React.ReactNode; label: string }[] = [
    { key: 'select', icon: <Crosshair size={16} />, label: '选择构件' },
    { key: 'crack', icon: <Ruler size={16} />, label: '裂缝：点两个端点' },
    { key: 'volume', icon: <Box size={16} />, label: '支座脱空 / 铰缝渗水：框选范围' },
  ];

  return (
    <div className="toolrail">
      {items.map((it) => (
        <button
          key={it.key}
          className={tool === it.key ? 'active' : ''}
          title={it.label}
          onClick={() => setTool(it.key)}
        >
          {it.icon}
        </button>
      ))}
      <div className="sep" />
      <button
        title="定位到整座桥"
        onClick={() => viewer?.fitView([bridge.length / 2, 40, 0], Math.max(26, bridge.length * 0.6))}
      >
        <Maximize2 size={16} />
      </button>
      <button title="定位到选中构件" onClick={() => viewer?.focusComponent(useProject.getState().selectedComponentId ?? '')}>
        <LayoutGrid size={16} />
      </button>
    </div>
  );
}

function ViewportHud() {
  const viewer = useViewer().viewer;
  const bridge = useProject((s) => s.bridge)!;
  const defects = useProject((s) => s.defects);
  const activeId = useProject((s) => s.activeInspectionId);
  const [stats, setStats] = useState({ fps: 0, triangles: 0 });

  useEffect(() => {
    if (!viewer) return;
    const t = setInterval(() => setStats({ fps: viewer.stats.fps, triangles: viewer.stats.triangles }), 700);
    return () => clearInterval(t);
  }, [viewer]);

  const active = defects.filter((d) => d.inspectionId === activeId);
  const hidden = useProject((s) => s.hiddenComponents);

  return (
    <>
      <div className="hud tl">
        <div className="row" style={{ justifyContent: 'space-between', gap: 14 }}>
          <span className="k">三角面片</span>
          <span className="v">{stats.triangles.toLocaleString('en-US')}</span>
        </div>
        <div className="row" style={{ justifyContent: 'space-between', gap: 14 }}>
          <span className="k">帧率</span>
          <span className="v" style={{ color: stats.fps >= 50 ? '#9fd6b2' : stats.fps >= 30 ? '#ffd98a' : '#ffb3b6' }}>
            {stats.fps} fps
          </span>
        </div>
        <div className="row" style={{ justifyContent: 'space-between', gap: 14 }}>
          <span className="k">本期病害</span>
          <span className="v">{active.length}</span>
        </div>
      </div>
      <div className="hud bl small">
        <span className="k">左键旋转 · 右键平移 · 滚轮缩放</span>
        {hidden.size > 0 && <span className="k"> · 已隐藏 {hidden.size} 构件</span>}
      </div>
    </>
  );
}
