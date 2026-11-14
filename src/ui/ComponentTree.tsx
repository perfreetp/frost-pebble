import React, { useMemo } from 'react';
import { ChevronDown, ChevronRight, Eye, EyeOff, Layers, Search, Focus } from 'lucide-react';
import { useProject } from '@/ui/projectStore';
import { useViewer } from '@/ui/Viewport';
import { COMPONENT_TYPE_LABEL, type ComponentType } from '@core/types';
import { formatChainage } from '@core/math';

const TYPE_ICON: Record<ComponentType, string> = {
  girder: '▬',
  deck: '▤',
  railing: '╫',
  pier: '▮',
  bearing: '▪',
  abutment: '▩',
};

export function ComponentTree({ compact = false }: { compact?: boolean }) {
  const bridge = useProject((s) => s.bridge);
  const selected = useProject((s) => s.selectedComponentId);
  const select = useProject((s) => s.selectComponent);
  const hidden = useProject((s) => s.hiddenComponents);
  const toggle = useProject((s) => s.toggleVisibility);
  const showAll = useProject((s) => s.showAll);
  const collapsed = useProject((s) => s.collapsed);
  const toggleCollapse = useProject((s) => s.toggleCollapse);
  const search = useProject((s) => s.search);
  const setSearch = useProject((s) => s.setSearch);
  const defects = useProject((s) => s.defects);
  const activeInspectionId = useProject((s) => s.activeInspectionId);
  const viewer = useViewer().viewer;

  const groups = useMemo(() => {
    if (!bridge) return [];
    const order: ComponentType[] = ['girder', 'deck', 'railing', 'pier', 'bearing', 'abutment'];
    const q = search.trim().toLowerCase();
    return order
      .map((type) => {
        const items = bridge.components
          .filter((c) => c.type === type)
          .filter((c) =>
            !q ||
            c.name.toLowerCase().includes(q) ||
            c.assetCode.toLowerCase().includes(q) ||
            String(c.spanIndex) === q ||
            formatChainage(c.chainageStart).toLowerCase().includes(q),
          )
          .sort((a, b) => a.spanIndex - b.spanIndex || a.chainageStart - b.chainageStart);
        return { type, label: COMPONENT_TYPE_LABEL[type], items };
      })
      .filter((g) => g.items.length);
  }, [bridge, search]);

  const defectCount = useMemo(() => {
    const m = new Map<string, { total: number; critical: number }>();
    for (const d of defects) {
      if (d.inspectionId !== activeInspectionId) continue;
      const cur = m.get(d.componentId) ?? { total: 0, critical: 0 };
      cur.total++;
      if (d.severity === 'critical') cur.critical++;
      m.set(d.componentId, cur);
    }
    return m;
  }, [defects, activeInspectionId]);

  if (!bridge) return null;

  return (
    <div className="tree" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div className="panel" style={{ borderBottom: '1px solid var(--line)' }}>
        <div className="row" style={{ marginBottom: 6 }}>
          <Search size={13} color="#6f8095" />
          <input type="search" placeholder="搜索构件名 / 档案编号 / 桩号" value={search} onChange={(e) => setSearch(e.target.value)} style={{ height: 26 }} />
        </div>
        <div className="row small muted" style={{ justifyContent: 'space-between' }}>
          <span>
            共 {bridge.components.length} 个构件 · 隐藏 {hidden.size}
          </span>
          <button className="ghost small" onClick={showAll} disabled={hidden.size === 0}>
            全部显示
          </button>
        </div>
      </div>
      <div className="scroll">
        {groups.map((g) => {
          const key = `grp-${g.type}`;
          const isCollapsed = collapsed.has(key);
          return (
            <div className="tree-group" key={key}>
              <div className="tree-group-head" onClick={() => toggleCollapse(key)}>
                {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                <span style={{ fontWeight: 600 }}>{g.label}</span>
                <span className="badge" style={{ marginLeft: 'auto' }}>{g.items.length}</span>
              </div>
              {!isCollapsed &&
                g.items.map((c) => {
                  const dc = defectCount.get(c.id);
                  const isHidden = hidden.has(c.id);
                  return (
                    <div
                      key={c.id}
                      className={`tree-item ${selected === c.id ? 'selected' : ''} ${isHidden ? 'hidden' : ''}`}
                      onClick={() => {
                        select(c.id);
                        viewer?.focusComponent(c.id);
                      }}
                      onDoubleClick={() => viewer?.focusComponent(c.id)}
                    >
                      <span style={{ width: 12, color: '#5f7a99' }}>{TYPE_ICON[c.type]}</span>
                      <span className="name" title={`${c.name} · ${c.assetCode}`}>
                        {c.name}
                      </span>
                      {dc && dc.total > 0 && (
                        <span className={`badge`} style={{ color: dc.critical ? '#ffb3b6' : '#ffd98a', border: `1px solid ${dc.critical ? '#5e2b2f' : '#5c4718'}`, background: 'transparent' }}>
                          {dc.total}
                        </span>
                      )}
                      <span className="st">{formatChainage(c.chainageStart)}</span>
                      <span
                        className="eye"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggle(c.id);
                        }}
                        title={isHidden ? '显示' : '隐藏'}
                      >
                        {isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
                      </span>
                    </div>
                  );
                })}
            </div>
          );
        })}
        {groups.length === 0 && <div className="panel hint">没有匹配的构件，请调整搜索条件。</div>}
      </div>
      {!compact && (
        <div className="panel small muted" style={{ borderTop: '1px solid var(--line)', borderBottom: 'none' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span>
              <Layers size={11} /> 单击选中，双击聚焦
            </span>
            <span className="mono">{bridge.length} m</span>
          </div>
        </div>
      )}
    </div>
  );
}
