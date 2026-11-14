import React, { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, BellRing, Crosshair, PlusCircle, CalendarClock } from 'lucide-react';
import { useProject } from '@/ui/projectStore';
import { useViewer } from '@/ui/Viewport';
import { useAnnotate } from '@/ui/annotateStore';
import { buildTimelines, summarizeTimelines, trendOf, TREND_LABEL, type DefectFamily, type TrendKind } from '@core/timeline';
import { SEVERITY_LEVEL_LABEL, DEFECT_TYPE_LABEL, type SeverityLevel } from '@core/types';
import { formatChainage } from '@core/math';
import { sideLabel } from '@core/annotation';

const TREND_COLOR: Record<TrendKind, string> = {
  new: '#4f97ff',
  expanded: '#e8b033',
  stable: '#6f8095',
  reduced: '#4f9a68',
};

export function TimelineView() {
  const bridge = useProject((s) => s.bridge);
  const defects = useProject((s) => s.defects);
  const inspections = useProject((s) => s.inspections);
  const activeId = useProject((s) => s.activeInspectionId);
  const setTab = useProject((s) => s.setTab);
  const select = useProject((s) => s.selectComponent);
  const viewer = useViewer().viewer;
  const loadDefect = useAnnotate((s) => s.loadDefect);
  const startFromHistory = useAnnotate((s) => s.startFromHistory);
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | TrendKind>('all');

  const families = useMemo(
    () => buildTimelines(defects, inspections, { criticalWidthMm: 0.3 }),
    [defects, inspections],
  );
  const summary = useMemo(() => summarizeTimelines(families), [families]);
  const filtered = useMemo(
    () => (filter === 'all' ? families : families.filter((f) => trendOf(f) === filter)),
    [families, filter],
  );
  const current = filtered.find((f) => f.id === selectedFamily) ?? filtered[0] ?? null;

  if (!bridge) return null;

  return (
    <div className="timeline-wrap">
      <div className="timeline-list">
        <div className="panel" style={{ borderBottom: '1px solid var(--line)' }}>
          <h3>
            <CalendarClock size={13} /> 病害发展线
          </h3>
          <div className="row small" style={{ gap: 4, flexWrap: 'wrap' }}>
            {(['all', 'new', 'expanded', 'stable'] as const).map((k) => (
              <button
                key={k}
                className={filter === k ? 'primary' : 'ghost'}
                style={{ fontSize: 11, padding: '3px 8px' }}
                onClick={() => setFilter(k)}
              >
                {k === 'all' ? `全部 ${families.length}` : `${TREND_LABEL[k]} ${families.filter((f) => trendOf(f) === k).length}`}
              </button>
            ))}
          </div>
          <div className="row small muted" style={{ marginTop: 6, justifyContent: 'space-between' }}>
            <span>归并口径：同构件 · 桩号 ±0.35 m · 偏距 ±0.5 m</span>
          </div>
          <div className="row small" style={{ marginTop: 6, gap: 8 }}>
            <span className="chip" style={{ borderColor: '#6f2b30', color: '#ffb3b6' }}>严重 {summary.critical}</span>
            <span className="chip" style={{ borderColor: '#6b5316', color: '#ffd98a' }}>关注 {summary.warning}</span>
            <span className="chip" style={{ borderColor: '#2c5238', color: '#9fd6b2' }}>一般 {summary.normal}</span>
            {summary.nearLimitCount > 0 && (
              <span className="chip" style={{ borderColor: '#7a5b13', color: '#ffd98a' }}>
                <BellRing size={10} /> 接近上限 {summary.nearLimitCount}
              </span>
            )}
          </div>
        </div>
        {filtered.map((f) => {
          const kind = trendOf(f);
          return (
            <div
              key={f.id}
              className={`family-card ${current?.id === f.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedFamily(f.id);
                select(f.latest.defect.componentId);
                viewer?.focusComponent(f.latest.defect.componentId);
              }}
            >
              <div className="top">
                <span className={`sev-dot ${f.latest.defect.severity}`} />
                <span className="code">{f.latest.defect.code}</span>
                <span className="chip" style={{ marginLeft: 'auto', borderColor: TREND_COLOR[kind] + '66', color: TREND_COLOR[kind], fontSize: 10 }}>
                  {TREND_LABEL[kind]}
                </span>
              </div>
              <div className="meta">
                <span>{DEFECT_TYPE_LABEL[f.type]}</span>
                <span>·</span>
                <span>{f.points.length} 次观测</span>
                <span>·</span>
                <span>
                  {f.measureKind === 'extent' ? `${(f.comparableMm / 1000).toFixed(2)} m` : `${f.comparableMm.toFixed(f.type === 'crack' ? 2 : 1)} mm`}
                </span>
                {f.nearLimit && <span style={{ color: '#ffd98a' }}>· 接近严重限值</span>}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="panel hint">没有符合条件的病害线。</div>}
      </div>

      <div className="tl-detail">
        {current ? (
          <FamilyDetail family={current} onLoad={() => { loadDefect(current.latest.defect); setTab('annotate'); }} onSeed={() => { startFromHistory(current.latest.defect); setTab('annotate'); }} />
        ) : (
          <div className="loading" style={{ height: 300 }}>
            选择左侧病害线查看详情
          </div>
        )}
      </div>
    </div>
  );
}

function FamilyDetail({ family, onLoad, onSeed }: { family: DefectFamily; onLoad: () => void; onSeed: () => void }) {
  const bridge = useProject((s) => s.bridge)!;
  const d = family.latest.defect;
  // 主尺度序列：裂缝/支座看宽度或深度，铰缝看影响长度
  const series = family.points.map((p) => ({
    ...p,
    value: family.measureKind === 'extent' ? p.extentMm : p.widthMm,
  }));
  const maxW = Math.max(...series.map((p) => p.value), family.criticalAt * 1.15);
  const minW = Math.min(...series.map((p) => p.value), family.warnAt * 0.5);
  const kind = trendOf(family);
  // 主尺度对应的年增长速率：裂缝/支座看宽度或深度，铰缝看影响长度
  const rate = family.measureKind === 'extent' ? family.extentRatePerYear : family.widthRatePerYear;

  const width = 520;
  const height = 110;
  const pad = 26;
  const xOf = (i: number) => pad + (i / Math.max(1, family.points.length - 1)) * (width - pad * 2);
  const yOf = (w: number) => height - pad - ((w - minW * 0.9) / (maxW * 1.15 - minW * 0.9 || 1)) * (height - pad * 2);

  const path = series
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xOf(i).toFixed(1)} ${yOf(p.value).toFixed(1)}`)
    .join(' ');
  const limitY = yOf(family.criticalAt);
  const warnY = yOf(family.warnAt);

  return (
    <>
      <div className="tl-head">
        <div>
          <h2 className="mono">{d.code}</h2>
          <div className="row small muted" style={{ gap: 8, flexWrap: 'wrap' }}>
            <span>{DEFECT_TYPE_LABEL[d.type]}</span>
            <span>·</span>
            <span>{bridge.components.find((c) => c.id === d.componentId)?.name}</span>
            <span>·</span>
            <span>
              桩号 {formatChainage(d.chainage)} · {sideLabel(d.offset, bridge.config.deckWidth)}（偏距 {d.offset.toFixed(2)} m）
            </span>
            <span>·</span>
            <span>标高 {d.elevation.toFixed(2)} m</span>
          </div>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <button onClick={onLoad}>
            <Crosshair size={12} /> 在三维中定位
          </button>
          <button className="primary" onClick={onSeed}>
            <PlusCircle size={12} /> 本期沿用位置新增观测
          </button>
        </div>
      </div>

      <div className="metric-grid" style={{ marginBottom: 14 }}>
        <div className="metric">
          <div className="k">{family.type === 'crack' ? '当前宽度' : family.type === 'bearing_void' ? '当前脱空深度' : '当前影响长度'}</div>
          <div className="v" style={{ color: d.severity === 'critical' ? '#ff9fa3' : d.severity === 'warning' ? '#ffd98a' : '#9fd6b2' }}>
            {family.measureKind === 'extent' ? (family.comparableMm / 1000).toFixed(2) : family.comparableMm.toFixed(family.type === 'crack' ? 2 : 1)}{' '}
            <span style={{ fontSize: 12 }}>{family.measureKind === 'extent' ? 'm' : 'mm'}</span>
          </div>
          <div className="d">
            {SEVERITY_LEVEL_LABEL[d.severity]} · {d.grade} 级
          </div>
        </div>
        <div className="metric">
          <div className="k">{family.type === 'crack' ? '宽度增长速率' : family.type === 'bearing_void' ? '深度增长速率' : '影响长度增长率'}</div>
          <div className="v">
            {rate >= 0 ? <TrendingUp size={15} color="#ff9fa3" style={{ verticalAlign: -2 }} /> : <TrendingDown size={15} color="#9fd6b2" style={{ verticalAlign: -2 }} />}{' '}
            {family.measureKind === 'extent'
              ? (Math.abs(rate) / 1000).toFixed(2)
              : Math.abs(rate).toFixed(family.type === 'crack' ? 3 : 2)}{' '}
            <span style={{ fontSize: 12 }}>{family.measureKind === 'extent' ? 'm' : 'mm'}/年</span>
          </div>
          <div className="d">跨度 {family.spanYears.toFixed(1)} 年</div>
        </div>
        <div className="metric">
          <div className="k">观测跨度</div>
          <div className="v">
            {family.points.length} <span style={{ fontSize: 12 }}>次</span>
          </div>
          <div className="d">
            {family.first.inspection.date} → {family.latest.inspection.date}
          </div>
        </div>
        <div className="metric">
          <div className="k">距 {family.measureKind === 'extent' ? `${(family.criticalAt / 1000).toFixed(2)} m` : `${family.criticalAt.toFixed(family.type === 'crack' ? 1 : 0)} mm`} 严重限值余量</div>
          <div className="v" style={{ color: family.headroomMm < family.criticalAt * 0.2 ? '#ffd98a' : undefined }}>
            {family.measureKind === 'extent' ? (family.headroomMm / 1000).toFixed(2) : family.headroomMm.toFixed(family.type === 'crack' ? 3 : 1)}{' '}
            <span style={{ fontSize: 12 }}>{family.measureKind === 'extent' ? 'm' : 'mm'}</span>
          </div>
          <div className="d">
            {family.headroomMm < 0
              ? '已超限，须立即处理'
              : family.yearsToLimit != null && family.yearsToLimit < 25
                ? `按当前速率约 ${family.yearsToLimit.toFixed(1)} 年后触限`
                : '速率不足，暂不预测'}
          </div>
        </div>
      </div>

      {family.nearLimit && (
        <div className="gate" style={{ marginBottom: 12 }}>
          <BellRing size={12} />{' '}
          {family.headroomMm < 0
            ? `该病害已超严重限值 ${Math.abs(family.measureKind === 'extent' ? family.headroomMm / 1000 : family.headroomMm).toFixed(family.measureKind === 'extent' ? 2 : 2)} ${family.measureKind === 'extent' ? 'm' : 'mm'}，必须本次处理。`
            : `该病害已进入预警区间，距严重限值仅余 ${
                family.measureKind === 'extent' ? `${(family.headroomMm / 1000).toFixed(2)} m` : `${family.headroomMm.toFixed(family.type === 'crack' ? 3 : 1)} mm`
              }`}
          {family.yearsToLimit != null && family.headroomMm >= 0
            ? `；按 ${
                family.measureKind === 'extent'
                  ? `${(rate / 1000).toFixed(2)} m/年`
                  : `${rate.toFixed(family.type === 'crack' ? 3 : 2)} mm/年`
              } 的扩展速率，约 ${family.yearsToLimit.toFixed(1)} 年后触限，建议本次定检安排处理。`
            : '；建议下次定检复测。'}
        </div>
      )}

      <div className="sparkline">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
          <strong style={{ fontSize: 12 }}>
            {family.measureKind === 'width' ? '宽度发展曲线' : family.measureKind === 'depth' ? '脱空深度发展曲线' : '渗水影响长度发展曲线'}
          </strong>
          <span className="small muted">
            虚线为 {(family.warnAt / (family.measureKind === 'extent' ? 1000 : 1)).toFixed(2)} /{' '}
            {(family.criticalAt / (family.measureKind === 'extent' ? 1000 : 1)).toFixed(2)} {family.measureKind === 'extent' ? 'm' : 'mm'} 阈值
          </span>
        </div>
        <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
          <line x1={pad} y1={limitY} x2={width - pad} y2={limitY} stroke="#e5484d" strokeDasharray="4 3" strokeWidth="1" opacity="0.7" />
          <line x1={pad} y1={warnY} x2={width - pad} y2={warnY} stroke="#e8b033" strokeDasharray="4 3" strokeWidth="1" opacity="0.6" />
          <text x={width - pad + 2} y={limitY + 3} fill="#e5484d" style={{ fontSize: 9 }}>
            {family.measureKind === 'extent' ? (family.criticalAt / 1000).toFixed(2) : family.criticalAt.toFixed(family.type === 'crack' ? 1 : 0)}
          </text>
          <text x={width - pad + 2} y={warnY + 3} fill="#e8b033" style={{ fontSize: 9 }}>
            {family.measureKind === 'extent' ? (family.warnAt / 1000).toFixed(2) : family.warnAt.toFixed(family.type === 'crack' ? 1 : 0) }
          </text>
          <path d={path} fill="none" stroke="#7fbcff" strokeWidth="2" />
          {series.map((p, i) => (
            <g key={p.defect.id}>
              <circle
                cx={xOf(i)}
                cy={yOf(p.value)}
                r={i === family.points.length - 1 ? 4.5 : 3.2}
                fill={p.critical ? '#e5484d' : p.defect.severity === 'warning' ? '#e8b033' : '#4f9a68'}
                stroke="#0d1218"
                strokeWidth="1.5"
              />
              <text x={xOf(i)} y={yOf(p.value) - 8} textAnchor="middle" fill="#a9b7c6" style={{ fontSize: 9 }}>
                {family.measureKind === 'extent' ? (p.value / 1000).toFixed(2) : p.value.toFixed(family.type === 'crack' ? 2 : 1)}
              </text>
              <text x={xOf(i)} y={height - 6} textAnchor="middle" fill="#6f8095" style={{ fontSize: 9 }}>
                {p.inspection.date.slice(0, 7)}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="tl-events">
        {family.points
          .slice()
          .reverse()
          .map((p, idx, arr) => {
            const prev = arr[idx + 1];
            const dW = prev ? p.widthMm - prev.widthMm : null;
            const dL = prev ? p.extentMm - prev.extentMm : null;
            return (
              <div className={`tl-event ${p.defect.severity}`} key={p.defect.id}>
                <div className="when">
                  {p.inspection.date}
                  <div style={{ fontSize: 10, opacity: 0.7 }}>{p.inspection.id === useProject.getState().activeInspectionId ? '本次' : ''}</div>
                </div>
                <div className="axis">
                  <span className="node" />
                </div>
                <div className="body">
                  <div className="line1">
                    <strong>{p.inspection.title}</strong>
                    <span className="mono" style={{ color: p.defect.severity === 'critical' ? '#ffb3b6' : p.defect.severity === 'warning' ? '#ffd98a' : '#9fd6b2' }}>
                      {family.measureKind === 'extent' ? `${(p.extentMm / 1000).toFixed(2)} m` : `${p.widthMm.toFixed(family.type === 'crack' ? 2 : 1)} mm`}
                    </span>
                    {family.measureKind !== 'extent' && (
                      <span className="mono muted">L {(p.extentMm / 1000).toFixed(2)} m</span>
                    )}
                    {dW != null && family.measureKind !== 'extent' && (
                      <span className="mono small" style={{ color: dW > 0.02 ? '#ffd98a' : dW < -0.02 ? '#9fd6b2' : '#6f8095' }}>
                        {family.measureKind === 'depth' ? '深度' : '宽度'} {dW >= 0 ? '+' : ''}
                        {dW.toFixed(2)} mm
                      </span>
                    )}
                    {dL != null && Math.abs(dL) > 1 && (
                      <span className="mono small" style={{ color: dL > 0 ? '#ffd98a' : '#6f8095' }}>
                        {family.measureKind === 'extent' ? '影响长度' : '长度'} {dL >= 0 ? '+' : ''}
                        {(dL / 1000).toFixed(2)} m
                      </span>
                    )}
                  </div>
                  <div className="small muted" style={{ marginTop: 3 }}>
                    {p.defect.justification || p.defect.description}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
}
