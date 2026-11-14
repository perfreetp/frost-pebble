import React, { useEffect, useMemo, useState } from 'react';
import { FileDown, Share2, QrCode, Check, XCircle, Table2, MapPin } from 'lucide-react';
import { useProject } from '@/ui/projectStore';
import { api } from '@/api';
import { buildTimelines } from '@core/timeline';
import {
  buildDistributionMap,
  buildRepairList,
  computeStats,
  SEVERITY_FILL,
  TYPE_SHAPE,
} from '@core/reports';
import { COMPONENT_TYPE_LABEL, DEFECT_TYPE_LABEL, SEVERITY_LEVEL_LABEL, type Defect, type SeverityLevel } from '@core/types';
import { formatChainage } from '@core/math';
import { sideLabel } from '@core/annotation';

export function ReportView() {
  const bridge = useProject((s) => s.bridge);
  const defects = useProject((s) => s.defects);
  const inspections = useProject((s) => s.inspections);
  const activeId = useProject((s) => s.activeInspectionId);
  const confirmations = useProject((s) => s.confirmations);
  const saveConfirmation = useProject((s) => s.saveConfirmation);
  const reportMeta = useProject((s) => s.reportMeta);
  const select = useProject((s) => s.selectComponent);
  const setTab = useProject((s) => s.setTab);

  const [engineer, setEngineer] = useState('张工');
  const [toast, setToast] = useState<{ kind: 'ok' | 'error' | 'warn'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [tab, setInnerTab] = useState<'defects' | 'repairs'>('defects');

  const inspection = inspections.find((i) => i.id === activeId) ?? inspections[inspections.length - 1];
  const activeDefects = useMemo(() => defects.filter((d) => d.inspectionId === activeId), [defects, activeId]);
  const families = useMemo(() => buildTimelines(defects, inspections), [defects, inspections]);
  const stats = useMemo(
    () => (bridge ? computeStats(activeDefects, bridge.components, families) : null),
    [bridge, activeDefects, families],
  );
  const repairs = useMemo(() => buildRepairList(activeDefects, families), [activeDefects, families]);
  const confMap = useMemo(() => new Map(confirmations.map((c) => [c.defectId, c])), [confirmations]);
  const confirmedCount = activeDefects.filter((d) => confMap.get(d.id)?.confirmed).length;

  const map = useMemo(
    () =>
      bridge
        ? buildDistributionMap(activeDefects, bridge.components, {
            stationStart: bridge.config.stationStart,
            length: bridge.length,
            spans: bridge.config.spans,
            deckWidth: bridge.config.deckWidth,
          })
        : null,
    [bridge, activeDefects],
  );

  if (!bridge || !stats || !map || !inspection) return null;

  const exportPdf = async () => {
    setBusy(true);
    setToast(null);
    try {
      const { blob, shareUrl } = await (async () => {
        const res = await fetch('/api/report/pdf');
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw Object.assign(new Error(body.error ?? '导出失败'), { code: body.code, pending: body.pending });
        }
        return { blob: await res.blob(), shareUrl: res.headers.get('X-Share-Url') ?? '' };
      })();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `桥梁定期检查报告-${inspection.date}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      setShareUrl(shareUrl);
      setToast({ kind: 'ok', text: 'PDF 已生成（含二维码），只读分享链接已就绪。' });
    } catch (e) {
      const err = e as Error & { code?: string };
      setToast({ kind: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const toggleConfirm = async (d: Defect, next: boolean) => {
    if (!engineer.trim()) {
      setToast({ kind: 'warn', text: '请先填写工程师姓名' });
      return;
    }
    try {
      await saveConfirmation(d.id, next, engineer, next ? '同意处理' : '退回复核');
    } catch (e) {
      setToast({ kind: 'error', text: (e as Error).message });
    }
  };

  return (
    <div className="report-wrap">
      <div className="report-main">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20 }}>定期检查报告 · {bridge.config.name}</h1>
            <div className="row small muted" style={{ gap: 8, marginTop: 4 }}>
              <span>{inspection.title}</span>
              <span>·</span>
              <span>{inspection.date}</span>
              <span>·</span>
              <span>报告编号 {reportMeta?.reportNo}</span>
            </div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <span className={`chip ${confirmedCount === activeDefects.length ? 'normal' : 'warning'}`}>
              确认 {confirmedCount}/{activeDefects.length}
            </span>
            <button className="primary" onClick={exportPdf} disabled={busy}>
              <span className="row" style={{ gap: 5 }}>
                <FileDown size={13} /> {busy ? '生成中…' : '导出 PDF'}
              </span>
            </button>
          </div>
        </div>

        {toast && <div className="gate" style={{ marginBottom: 12, borderColor: toast.kind === 'error' ? '#6f2b30' : '#2c5238', background: toast.kind === 'error' ? 'rgba(70,28,32,.3)' : 'rgba(23,51,34,.3)', color: toast.kind === 'error' ? '#ffb3b6' : '#9fd6b2' }}>{toast.text}</div>}
        {shareUrl && (
          <div className="gate ok" style={{ marginBottom: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
            <QrCode size={14} />
            <span>
              只读分享链接：
              <a href={shareUrl} target="_blank" rel="noreferrer" style={{ color: '#a8ccff', marginLeft: 6 }}>
                {shareUrl}
              </a>
            </span>
            <button
              className="ghost small"
              style={{ marginLeft: 'auto' }}
              onClick={() => navigator.clipboard?.writeText(shareUrl)}
            >
              复制
            </button>
          </div>
        )}

        <div className="card">
          <h2>
            <span className="num">01</span> 病害分布图
          </h2>
          <DistributionCharts map={map} defects={activeDefects} bridge={bridge} onSelect={(d) => { select(d.componentId); setTab('annotate'); }} />
        </div>

        <div className="card">
          <h2>
            <span className="num">02</span> 统计
          </h2>
          <StatsRow stats={stats} />
        </div>

        <div className="card">
          <h2>
            <span className="num">03</span> 病害清单与维修建议
          </h2>
          <div className="row" style={{ gap: 4, marginBottom: 10 }}>
            <button className={tab === 'defects' ? 'primary' : 'ghost'} style={{ fontSize: 11, padding: '3px 9px' }} onClick={() => setInnerTab('defects')}>
              <Table2 size={11} /> 病害清单 ({activeDefects.length})
            </button>
            <button className={tab === 'repairs' ? 'primary' : 'ghost'} style={{ fontSize: 11, padding: '3px 9px' }} onClick={() => setInnerTab('repairs')}>
              维修建议 ({repairs.length})
            </button>
          </div>
          {tab === 'defects' ? (
            <DefectTable defects={activeDefects} bridge={bridge} confMap={confMap} families={families} onSelect={(d) => { select(d.componentId); setTab('annotate'); }} />
          ) : (
            <RepairTable rows={repairs} />
          )}
        </div>
      </div>

      <div className="report-side">
        <div className="panel" style={{ padding: 0 }}>
          <h3>
            <Check size={13} /> 工程师逐条确认
          </h3>
          <div className="field" style={{ marginBottom: 8 }}>
            <label>确认人</label>
            <input type="text" value={engineer} onChange={(e) => setEngineer(e.target.value)} placeholder="工程师姓名" />
          </div>
          <div className="small muted" style={{ marginBottom: 8 }}>
            全部确认后方可导出带二维码的正式 PDF（服务端会再次校验）。
          </div>
          <div className="progress" style={{ marginBottom: 10 }}>
            <i style={{ width: `${(confirmedCount / Math.max(1, activeDefects.length)) * 100}%` }} />
          </div>
          {activeDefects.map((d) => {
            const c = confMap.get(d.id);
            return (
              <div className="confirm-row" key={d.id}>
                <span className={`sev-dot ${d.severity}`} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="code">{d.code}</div>
                  <div className="who">
                    {DEFECT_TYPE_LABEL[d.type]} · {d.grade} 级 · {formatChainage(d.chainage)}
                    {c?.confirmed && ` · ${c.engineer} 已确认`}
                  </div>
                </div>
                {c?.confirmed ? (
                  <button className="ghost small" onClick={() => toggleConfirm(d, false)} title="撤销确认">
                    <XCircle size={12} />
                  </button>
                ) : (
                  <button className="small primary" style={{ padding: '2px 8px' }} onClick={() => toggleConfirm(d, true)}>
                    确认
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatsRow({ stats }: { stats: ReturnType<typeof computeStats> }) {
  return (
    <>
      <div className="metric-grid">
        <div className="metric">
          <div className="k">病害总数</div>
          <div className="v">{stats.total}</div>
          <div className="d">病害线 {stats.families} 条</div>
        </div>
        <div className="metric">
          <div className="k">严重（红）</div>
          <div className="v" style={{ color: '#ff9fa3' }}>{stats.critical}</div>
          <div className="d">需补特写照片与判定依据</div>
        </div>
        <div className="metric">
          <div className="k">需关注（黄）</div>
          <div className="v" style={{ color: '#ffd98a' }}>{stats.warning}</div>
          <div className="d">宽度 &gt; 0.2 mm</div>
        </div>
        <div className="metric">
          <div className="k">新增 / 扩展</div>
          <div className="v">
            {stats.newSinceLast} / {stats.expandedSinceLast}
          </div>
          <div className="d">相对上期巡检</div>
        </div>
      </div>
      <div className="grid2" style={{ marginTop: 12, gap: 20, alignItems: 'start' }}>
        <div style={{ minWidth: 0 }}>
          <div className="small muted" style={{ marginBottom: 6 }}>按病害类型</div>
          {(Object.keys(DEFECT_TYPE_LABEL) as (keyof typeof DEFECT_TYPE_LABEL)[]).map((k) => {
            const v = stats.byType[k as 'crack'];
            const max = Math.max(1, stats.total);
            return (
              <div className="row" key={k} style={{ marginBottom: 4, gap: 8, flexWrap: 'nowrap' }}>
                <span style={{ width: 60, fontSize: 11.5, flex: 'none', whiteSpace: 'nowrap' }}>{DEFECT_TYPE_LABEL[k]}</span>
                <div className="progress" style={{ flex: 1, height: 6, minWidth: 40 }}>
                  <i style={{ width: `${(v.total / max) * 100}%` }} />
                </div>
                <span className="mono small" style={{ width: 76, textAlign: 'right', flex: 'none', whiteSpace: 'nowrap' }}>
                  {v.total}
                  {v.critical > 0 && <span style={{ color: '#ff9fa3' }}> · 严重 {v.critical}</span>}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="small muted" style={{ marginBottom: 6 }}>按构件类型</div>
          {(Object.keys(COMPONENT_TYPE_LABEL) as (keyof typeof COMPONENT_TYPE_LABEL)[]).map((k) => {
            const v = stats.byComponent[k];
            const max = Math.max(1, ...Object.values(stats.byComponent));
            return (
              <div className="row" key={k} style={{ marginBottom: 4, gap: 8 }}>
                <span style={{ width: 60, fontSize: 11.5, flex: 'none', whiteSpace: 'nowrap' }}>{COMPONENT_TYPE_LABEL[k]}</span>
                <div className="progress" style={{ flex: 1, height: 6, minWidth: 40 }}>
                  <i style={{ width: `${(v / max) * 100}%`, background: v ? undefined : 'transparent' }} />
                </div>
                <span className="mono small" style={{ width: 20, textAlign: 'right', flex: 'none' }}>{v}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function DistributionCharts({
  map,
  defects,
  bridge,
  onSelect,
}: {
  map: ReturnType<typeof buildDistributionMap>;
  defects: Defect[];
  bridge: NonNullable<ReturnType<typeof useProject.getState>['bridge']>;
  onSelect: (d: Defect) => void;
}) {
  const W = 760;
  const H = 200;
  const c0 = map.extent.chainage[0];
  const c1 = map.extent.chainage[1];
  const xOf = (c: number) => 40 + ((c - c0) / (c1 - c0)) * (W - 70);

  const [hover, setHover] = useState<{ d: Defect; x: number; y: number } | null>(null);

  const elevationSvg = () => {
    const H2 = 160;
    const top = 14;
    const bot = H2 - 26;
    const e0 = map.extent.elevation[0];
    const e1 = map.extent.elevation[1];
    const yOf = (e: number) => bot - ((e - e0) / Math.max(1e-6, e1 - e0)) * (bot - top);
    return (
      <svg className="map-svg" viewBox={`0 0 ${W} ${H2}`} onMouseLeave={() => setHover(null)}>
        <rect x={40} y={top} width={W - 70} height={bot - top} fill="#0c141c" stroke="#1d2937" />
        {map.spanBounds.map((s, i) => (
          <line key={i} x1={xOf(c0 + s)} y1={top} x2={xOf(c0 + s)} y2={bot} stroke="#22303e" strokeWidth="1" />
        ))}
        {map.structure.map((st, i) => {
          const xa = xOf(c0 + st.x0);
          const xb = xOf(c0 + st.x1);
          const yT = yOf(st.elevMax);
          const yB = yOf(st.elevMin);
          const color = st.type === 'girder' ? '#33424f' : st.type === 'pier' ? '#2b3843' : '#39434d';
          return (
            <rect
              key={i}
              x={xa}
              y={Math.min(yT, yB)}
              width={Math.max(1, xb - xa)}
              height={Math.max(1, Math.abs(yT - yB))}
              fill={color}
              opacity={st.type === 'deck' ? 0.5 : 0.9}
            />
          );
        })}
        {map.spanBounds.slice(0, -1).map((s, i) => (
          <text key={`t${i}`} x={(xOf(c0 + s) + xOf(c0 + map.spanBounds[i + 1])) / 2} y={bot + 12} textAnchor="middle">
            第 {i + 1} 跨
          </text>
        ))}
        {elevationToMarkers(defects, bridge).map((m) => (
          <g
            key={m.d.id}
            transform={`translate(${xOf(m.x)},${yOf(m.y)})`}
            onMouseMove={() => setHover({ d: m.d, x: xOf(m.x), y: yOf(m.y) })}
            onClick={() => onSelect(m.d)}
            style={{ cursor: 'pointer' }}
          >
            {markerShape(m.d, 5)}
          </g>
        ))}
        <text x={40} y={H2 - 4}>{formatChainage(c0)}</text>
        <text x={W - 30} y={H2 - 4} textAnchor="end">{formatChainage(c1)}</text>
        <text x={8} y={yOf(e0) + 3} fill="#5b6d80" style={{ fontSize: 9 }}>{e0.toFixed(1)}m</text>
        <text x={8} y={yOf(e1) + 3} fill="#5b6d80" style={{ fontSize: 9 }}>{e1.toFixed(1)}m</text>
      </svg>
    );
  };

  const planSvg = () => {
    const H2 = 150;
    const top = 18;
    const bot = H2 - 22;
    const o0 = map.extent.offset[0];
    const o1 = map.extent.offset[1];
    const yOf = (o: number) => bot - ((o - o0) / Math.max(1e-6, o1 - o0)) * (bot - top);
    return (
      <svg className="map-svg" viewBox={`0 0 ${W} ${H2}`} onMouseLeave={() => setHover(null)}>
        <rect x={40} y={top} width={W - 70} height={bot - top} fill="#0c141c" stroke="#1d2937" />
        <line x1={40} y1={yOf(0)} x2={W - 30} y2={yOf(0)} stroke="#2c4257" strokeDasharray="5 4" />
        <text x={44} y={yOf(0) - 4} fill="#5b6d80">桥面中线</text>
        {map.spanBounds.map((s, i) => (
          <line key={i} x1={xOf(c0 + s)} y1={top} x2={xOf(c0 + s)} y2={bot} stroke="#22303e" strokeWidth="1" />
        ))}
        {defects.map((d) => (
          <g
            key={d.id}
            transform={`translate(${xOf(d.chainage)},${yOf(d.offset)})`}
            onMouseMove={() => setHover({ d, x: xOf(d.chainage), y: yOf(d.offset) })}
            onClick={() => onSelect(d)}
            style={{ cursor: 'pointer' }}
          >
            {markerShape(d, 5)}
          </g>
        ))}
        <text x={40} y={H2 - 4}>{formatChainage(c0)}</text>
        <text x={W - 30} y={H2 - 4} textAnchor="end">{formatChainage(c1)}</text>
        <text x={8} y={yOf(o0) + 3} fill="#5b6d80" style={{ fontSize: 9 }}>左{Math.abs(o0).toFixed(1)}m</text>
        <text x={8} y={yOf(o1) + 3} fill="#5b6d80" style={{ fontSize: 9 }}>右{o1.toFixed(1)}m</text>
      </svg>
    );
  };

  return (
    <>
      <div className="row small muted" style={{ marginBottom: 6, gap: 12 }}>
        <span><MapPin size={11} /> 立面展开（桩号 — 标高）</span>
        <span style={{ marginLeft: 'auto' }}>点击标注可跳转到三维标注台复核</span>
      </div>
      {elevationSvg()}
      <div className="row small muted" style={{ margin: '10px 0 6px', gap: 12 }}>
        <span><MapPin size={11} /> 平面展开（桩号 — 横向偏距，左负右正）</span>
      </div>
      {planSvg()}
      <div className="row small muted" style={{ marginTop: 6, gap: 10 }}>
        <span>
          立面图竖向放大 ×
          {(((160 - 26) / Math.max(0.001, map.extent.elevation[1] - map.extent.elevation[0])) /
            ((W - 70) / Math.max(0.001, c1 - c0))).toFixed(1)}
        </span>
        <span>· 结构本体按构件包围盒绘制，便于核对病害相对墩梁的位置</span>
      </div>
      <div className="row" style={{ gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
        {(['critical', 'warning', 'normal'] as SeverityLevel[]).map((s) => (
          <span key={s} className="row small" style={{ gap: 5 }}>
            <span className="sev-dot" style={{ background: SEVERITY_FILL[s] }} />
            {SEVERITY_LEVEL_LABEL[s]}
          </span>
        ))}
        <span className="small muted" style={{ marginLeft: 8 }}>
          形状：○ 裂缝 · □ 支座脱空 · ◇ 铰缝渗水
        </span>
        {hover && (
          <span className="chip accent" style={{ marginLeft: 'auto' }}>
            {hover.d.code} · {DEFECT_TYPE_LABEL[hover.d.type]} · {hover.d.grade} 级 · {formatChainage(hover.d.chainage)}
          </span>
        )}
      </div>
    </>
  );
}

function markerShape(d: Defect, r: number) {
  const color = SEVERITY_FILL[d.severity];
  if (d.type === 'crack') {
    return <circle r={r} fill={color} stroke="#0b1015" strokeWidth="1" />;
  }
  if (d.type === 'bearing_void') {
    return <rect x={-r} y={-r} width={r * 2} height={r * 2} fill={color} stroke="#0b1015" strokeWidth="1" />;
  }
  return <path d={`M 0 ${r} L ${r} 0 L 0 ${-r} L ${-r} 0 Z`} fill={color} stroke="#0b1015" strokeWidth="1" />;
}

function elevationToMarkers(defects: Defect[], bridge: NonNullable<ReturnType<typeof useProject.getState>['bridge']>) {
  return defects.map((d) => ({ d, x: d.chainage, y: d.elevation }));
}

function DefectTable({
  defects,
  bridge,
  confMap,
  families,
  onSelect,
}: {
  defects: Defect[];
  bridge: NonNullable<ReturnType<typeof useProject.getState>['bridge']>;
  confMap: Map<string, { confirmed: boolean; engineer: string }>;
  families: ReturnType<typeof buildTimelines>;
  onSelect: (d: Defect) => void;
}) {
  const famByDefect = useMemo(() => {
    const m = new Map<string, (typeof families)[number]>();
    for (const f of families) for (const p of f.points) m.set(p.defect.id, f);
    return m;
  }, [families]);
  const comps = new Map(bridge.components.map((c) => [c.id, c]));
  const sorted = [...defects].sort((a, b) => {
    const rank = (s: string) => (s === 'critical' ? 0 : s === 'warning' ? 1 : 2);
    return rank(a.severity) - rank(b.severity) || a.chainage - b.chainage;
  });
  return (
    <table className="data">
      <thead>
        <tr>
          <th>编号</th>
          <th>类型</th>
          <th>构件</th>
          <th>桩号 / 位置</th>
          <th>几何量</th>
          <th>等级</th>
          <th>趋势</th>
          <th>确认</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((d) => {
          const comp = comps.get(d.componentId);
          const fam = famByDefect.get(d.id);
          const c = confMap.get(d.id);
          return (
            <tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => onSelect(d)}>
              <td className="mono" style={{ color: d.severity === 'critical' ? '#ff9fa3' : d.severity === 'warning' ? '#ffd98a' : undefined }}>
                {d.code}
              </td>
              <td>{DEFECT_TYPE_LABEL[d.type]}</td>
              <td>{comp?.name}</td>
              <td>
                <div className="mono small">{formatChainage(d.chainage)}</div>
                <div className="small muted">{sideLabel(d.offset, bridge.config.deckWidth)} · {d.elevation.toFixed(2)} m</div>
              </td>
              <td className="mono small">
                {d.geometry.kind === 'crack'
                  ? `${(d.geometry.lengthMm / 1000).toFixed(2)} m / ${d.geometry.widthMm.toFixed(2)} mm`
                  : `${d.geometry.areaM2.toFixed(2)} m² / ${d.geometry.depthMm.toFixed(0)} mm`}
              </td>
              <td>
                <span className={`chip ${d.severity}`}>{d.grade} 级 · {SEVERITY_LEVEL_LABEL[d.severity]}</span>
              </td>
              <td className="small">
                {fam && fam.points.length > 1 ? (
                  <>
                    <span style={{ color: fam.isExpanded ? '#ffd98a' : '#9fd6b2' }}>
                      {fam.isExpanded ? '扩展' : '稳定'}
                    </span>
                    <div className="muted">{fam.widthRatePerYear >= 0 ? '+' : ''}{fam.widthRatePerYear.toFixed(3)} mm/年</div>
                  </>
                ) : (
                  <span style={{ color: '#7fbcff' }}>新增</span>
                )}
              </td>
              <td>
                {c?.confirmed ? <span style={{ color: '#9fd6b2' }}>✓</span> : <span className="muted">—</span>}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function RepairTable({ rows }: { rows: ReturnType<typeof buildRepairList> }) {
  return (
    <table className="data">
      <thead>
        <tr>
          <th>优先</th>
          <th>维修措施</th>
          <th>工程量</th>
          <th>适用病害</th>
          <th>说明</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.item.key}>
            <td>
              <span
                className="chip"
                style={{
                  borderColor: r.item.urgency === '立即' ? '#6f2b30' : r.item.urgency === '汛前' ? '#6b5316' : undefined,
                  color: r.item.urgency === '立即' ? '#ffb3b6' : r.item.urgency === '汛前' ? '#ffd98a' : undefined,
                }}
              >
                {r.item.urgency}
              </span>
            </td>
            <td>
              <div>{r.item.title}</div>
              <div className="small muted">{r.item.detail}</div>
            </td>
            <td className="mono small">{r.quantity}</td>
            <td className="mono small">{r.defects.map((d) => d.code).join('、')}</td>
            <td className="small muted">
              {r.note || r.item.method}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
