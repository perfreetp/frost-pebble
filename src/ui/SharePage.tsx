import React, { useEffect, useMemo, useState } from 'react';
import { Lock, Boxes, MapPin, Table2 } from 'lucide-react';
import { api } from '@/api';
import { BridgeViewer, type LabelItem } from '@/three/viewer';
import { buildDistributionMap, SEVERITY_FILL } from '@core/reports';
import { DEFECT_TYPE_LABEL, SEVERITY_LEVEL_LABEL, type Defect } from '@core/types';
import { formatChainage } from '@core/math';
import { sideLabel } from '@core/annotation';

/** 只读分享页：仅展示快照内容，不含任何编辑入口 */
export function SharePage({ token }: { token: string }) {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.share>>['snapshot'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [labels, setLabels] = useState<LabelItem[]>([]);
  const [selected, setSelected] = useState<Defect | null>(null);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'normal'>('all');
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.share(token).then((r) => setData(r.snapshot)).catch((e) => setError((e as Error).message));
  }, [token]);

  const defects = useMemo(
    () => (data ? data.defects.filter((d) => filter === 'all' || d.severity === filter) : []),
    [data, filter],
  );

  useEffect(() => {
    if (!data || !containerRef.current) return;
    const v = new BridgeViewer({ container: containerRef.current, bridge: data.bridge, showGrid: true });
    v.callbacks.onLabels = setLabels;
    v.setDefects(defects);
    v.highlightComponent(selected?.componentId ?? null, 'select');
    return () => v.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (error) {
    return (
      <div className="loading">
        <div style={{ color: '#ffb3b6' }}>分享链接无效：{error}</div>
        <div className="small muted">该链接可能已过期或被移除。</div>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="loading">
        <div className="spinner" />
        <div>正在加载只读成果…</div>
      </div>
    );
  }

  const map = buildDistributionMap(data.defects, data.bridge.components, {
    stationStart: data.bridge.config.stationStart,
    length: data.bridge.length,
    spans: data.bridge.config.spans,
    deckWidth: data.bridge.config.deckWidth,
  });

  return (
    <div className="share-page">
      <header className="topbar">
        <div className="brand">
          <span className="dot" style={{ background: '#3fb27f' }} />
          只读成果 · {data.bridge.config.name}
        </div>
        <span className="chip normal">
          <Lock size={10} /> 只读分享
        </span>
        <span className="chip accent">{data.inspection.title}</span>
        <span className="chip accent">报告编号 {data.meta?.reportNo}</span>
        <div className="spacer" />
        <span className="small muted">快照于 {new Date().toISOString().slice(0, 10)} 生成，内容不可修改</span>
      </header>
      <div className="share-body">
        <div style={{ position: 'relative', minWidth: 0 }}>
          <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
          <div className="labels">
            {labels.map((l) => (
              <div key={l.id} className="world-label" style={{ left: l.x, top: l.y, color: l.color }}>
                {l.title}
                {l.subtitle && <span className="sub">{l.subtitle}</span>}
              </div>
            ))}
          </div>
          <div className="hud tl">
            <div className="row" style={{ gap: 12 }}>
              <Boxes size={12} /> {data.bridge.components.length} 个构件
            </div>
            <div className="row" style={{ gap: 12, marginTop: 3 }}>
              <MapPin size={12} /> {data.defects.length} 处病害
            </div>
            <div className="row small muted" style={{ marginTop: 6, gap: 4 }}>
              {(['all', 'critical', 'warning', 'normal'] as const).map((f) => (
                <button key={f} className={`ghost small ${filter === f ? 'primary' : ''}`} style={{ padding: '1px 6px', fontSize: 10 }} onClick={() => setFilter(f)}>
                  {f === 'all' ? '全部' : SEVERITY_LEVEL_LABEL[f]}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="share-side">
          <div className="panel" style={{ padding: 0 }}>
            <h3>
              <Table2 size={13} /> 病害清单
            </h3>
            {data.defects.map((d) => (
              <div
                key={d.id}
                className="confirm-row"
                style={{ cursor: 'pointer', background: selected?.id === d.id ? 'rgba(79,151,255,.08)' : undefined }}
                onClick={() => {
                  setSelected(d);
                }}
              >
                <span className="sev-dot" style={{ background: SEVERITY_FILL[d.severity] }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="code">{d.code}</div>
                  <div className="who">
                    {DEFECT_TYPE_LABEL[d.type]} · {d.grade} 级 · {formatChainage(d.chainage)} ·{' '}
                    {sideLabel(d.offset, data.bridge.config.deckWidth)}
                  </div>
                </div>
                <span className="mono small muted">
                  {d.geometry.kind === 'crack' ? `${d.geometry.widthMm.toFixed(2)}mm` : `${d.geometry.depthMm.toFixed(0)}mm`}
                </span>
              </div>
            ))}
          </div>
          {selected && (
            <div className="panel">
              <h3>{selected.code}</h3>
              <div className="small" style={{ lineHeight: 1.7, color: 'var(--ink-2)' }}>{selected.description}</div>
              {selected.justification && (
                <div className="gate" style={{ marginTop: 8 }}>
                  {selected.justification}
                </div>
              )}
              {selected.photos.length > 0 && (
                <div className="photo-grid" style={{ marginTop: 8 }}>
                  {selected.photos.map((p) => (
                    <div className="photo-item" key={p.id}>
                      <img src={p.url} alt={p.caption} />
                      <div className="cap">{p.caption}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="panel small muted" style={{ lineHeight: 1.7 }}>
            本页面为管养单位只读视图：可旋转缩放模型、查看各病害的桩号、偏距、几何量与判定依据，不可编辑或导出。
          </div>
        </div>
      </div>
    </div>
  );
}
