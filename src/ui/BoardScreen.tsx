import { useMemo, useState } from 'react';
import type { Order, OrderStatus } from '../domain/types';
import { FOREMEN, STATUS_META, fmtDate, isOverdue, overdueDays } from '../domain/workflow';
import { computeBoard, dueLabel } from '../domain/stats';
import { Panel, StatCard, StatusChip, Empty } from './common';
import { fmtDateTime } from '../domain/workflow';

interface Props {
  orders: Order[];
  now: number;
  onOpenOrder: (id: string) => void;
}

type RangeKey = 'all' | '30d' | '90d';

export function BoardScreen({ orders, now, onOpenOrder }: Props) {
  const [range, setRange] = useState<RangeKey>('all');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [sortKey, setSortKey] = useState<'deadline' | 'overdue'>('deadline');

  const filtered = useMemo(() => {
    if (range === 'all') return orders;
    const days = range === '30d' ? 30 : 90;
    const cut = now - days * 86_400_000;
    return orders.filter((o) => o.createdAt >= cut);
  }, [orders, range, now]);

  const board = useMemo(() => computeBoard(filtered, FOREMEN, now), [filtered, now]);
  const maxMonthly = Math.max(1, ...board.monthly.map((m) => m.completed));

  const overdueOrders = useMemo(
    () =>
      filtered
        .filter((o) => isOverdue(o, now))
        .sort((a, b) => a.deadline - b.deadline),
    [filtered, now],
  );

  const tableOrders = useMemo(() => {
    const rows = filtered.filter((o) => (statusFilter === 'all' ? true : o.status === statusFilter));
    if (sortKey === 'overdue') {
      return rows.slice().sort((a, b) => Number(isOverdue(b, now)) - Number(isOverdue(a, now)) || a.deadline - b.deadline);
    }
    return rows.slice().sort((a, b) => a.deadline - b.deadline);
  }, [filtered, statusFilter, sortKey, now]);

  const maxCompleted = Math.max(1, ...board.foremen.map((f) => f.completed));

  return (
    <div className="main" style={{ overflowY: 'auto', display: 'block', padding: 12 }}>
      {/* 抬头 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>施工看板</div>
          <div className="tiny" style={{ marginTop: 2 }}>
            数据截至 {fmtDateTime(now)} · 统计口径：所选区间内创建的工单
          </div>
        </div>
        <div className="spacer" />
        <div className="seg-control" style={{ width: 210 }}>
          <button className={range === 'all' ? 'active' : ''} onClick={() => setRange('all')}>
            全部
          </button>
          <button className={range === '30d' ? 'active' : ''} onClick={() => setRange('30d')}>
            近 30 天
          </button>
          <button className={range === '90d' ? 'active' : ''} onClick={() => setRange('90d')}>
            近 90 天
          </button>
        </div>
      </div>

      {/* 指标卡 */}
      <div className="stat-grid" style={{ marginBottom: 12 }}>
        <StatCard label="工单总数" value={board.total} unit="单" sub={`覆盖 ${board.totalHouseholds} 户 · ${board.totalBoxes} 台表箱`} />
        <StatCard label="进行中" value={board.working + board.qc + board.rework} unit="单" accent="blue" sub={`施工 ${board.working} · 待检 ${board.qc} · 整改 ${board.rework}`} />
        <StatCard label="已通过" value={board.passed} unit="单" accent="green" sub={`完成率 ${board.total ? Math.round((board.passed / board.total) * 100) : 0}%`} />
        <StatCard label="超期单" value={board.overdue} unit="单" accent="red" sub={board.overdue > 0 ? '需重点跟进' : '交期正常'} />
        <StatCard
          label="返工率"
          value={board.total ? `${Math.round((board.foremen.reduce((s, f) => s + f.reworkedOrders, 0) / Math.max(1, board.total)) * 100)}%` : '0%'}
          accent="amber"
          sub={`累计返工 ${board.reworkTotal} 次`}
        />
        <StatCard label="质检抽查" value={`${board.inspected}/${board.total}`} accent="teal" sub={`抽中 ${board.sampled} 单 · 约 20%`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.55fr) minmax(0,1fr)', gap: 12, marginBottom: 12 }}>
        {/* 按人统计 */}
        <Panel title="按人统计 · 完工量 / 返工率 / 超期" right={<span className="tiny">完工量条形以最高者为满格</span>}>
          <table className="table">
            <thead>
              <tr>
                <th>师傅</th>
                <th className="num">在手</th>
                <th className="num">完工</th>
                <th style={{ width: 130 }}>完工量</th>
                <th className="num">返工单</th>
                <th style={{ width: 118 }}>返工率</th>
                <th className="num">超期</th>
                <th className="num">平均工期</th>
              </tr>
            </thead>
            <tbody>
              {board.foremen.map((f) => (
                <tr key={f.userId}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{f.name}</div>
                    <div className="tiny">{f.title}</div>
                  </td>
                  <td className="num">{f.active}</td>
                  <td className="num" style={{ fontWeight: 700, color: '#7ce0a6' }}>{f.completed}</td>
                  <td>
                    <div className="bar-track">
                      <div className="bar-fill bar-green" style={{ width: `${(f.completed / maxCompleted) * 100}%` }} />
                    </div>
                  </td>
                  <td className="num">{f.reworkedOrders}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div className="bar-track" style={{ flex: 1 }}>
                        <div className="bar-fill bar-red" style={{ width: `${Math.min(100, f.reworkRate * 100 * 2)}%` }} />
                      </div>
                      <span className="mono" style={{ fontSize: 11, color: f.reworkRate > 0.3 ? '#ff9b9b' : 'var(--text-1)' }}>
                        {Math.round(f.reworkRate * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="num" style={{ color: f.overdue > 0 ? '#ff9b9b' : undefined, fontWeight: f.overdue > 0 ? 700 : 400 }}>
                    {f.overdue}
                  </td>
                  <td className="num">{f.avgDays === null ? '—' : `${f.avgDays} 天`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        {/* 月度趋势 */}
        <Panel title="近 6 个月完工趋势" right={<span className="tiny">绿=通过 · 红=含返工</span>}>
          <div className="mini-chart">
            {board.monthly.map((m) => {
              const h = (m.completed / maxMonthly) * 62;
              return (
                <div className="mini-col" key={m.key} title={`${m.label}：完工 ${m.completed}，其中含返工 ${m.rework}`}>
                  <div className="mini-stack" style={{ height: Math.max(3, h) }}>
                    <div className="mini-seg mini-seg-a" style={{ height: `${100 - (m.completed ? (m.rework / m.completed) * 100 : 0)}%` }} />
                    {m.rework > 0 && <div className="mini-seg mini-seg-b" style={{ height: `${(m.rework / m.completed) * 100}%` }} />}
                  </div>
                  <span className="mini-label">{m.label}</span>
                  <span className="mini-label mono" style={{ color: '#c3d2e0' }}>
                    {m.completed}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
            <MiniKV k="月度完工峰值" v={`${maxMonthly} 单`} />
            <MiniKV k="含返工单" v={`${board.foremen.reduce((s, f) => s + f.reworkedOrders, 0)} 单`} />
            <MiniKV k="平均工期" v={avgDays(board.foremen.map((f) => f.avgDays))} />
          </div>
        </Panel>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.55fr) minmax(0,1fr)', gap: 12 }}>
        {/* 工单明细 */}
        <Panel
          title="工单明细"
          right={
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <select className="select" style={{ height: 26, width: 104, fontSize: 11 }} value={sortKey} onChange={(e) => setSortKey(e.target.value as 'deadline' | 'overdue')}>
                <option value="deadline">按交期</option>
                <option value="overdue">超期优先</option>
              </select>
              <select
                className="select"
                style={{ height: 26, width: 100, fontSize: 11 }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
              >
                <option value="all">全部状态</option>
                {(Object.keys(STATUS_META) as OrderStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s].label}
                  </option>
                ))}
              </select>
            </div>
          }
        >
          <div style={{ maxHeight: 330, overflowY: 'auto', margin: '-4px -14px -12px' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>工单</th>
                  <th>小区</th>
                  <th>状态</th>
                  <th>负责人</th>
                  <th className="num">交期</th>
                  <th className="num">返工</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {tableOrders.map((o) => {
                  const fm = FOREMEN.find((f) => f.id === o.assigneeId);
                  const overdue = isOverdue(o, now);
                  return (
                    <tr key={o.id} onClick={() => onOpenOrder(o.id)} style={{ cursor: 'pointer' }}>
                      <td className="mono" style={{ fontSize: 11, color: 'var(--text-2)' }}>{o.id}</td>
                      <td style={{ fontWeight: 600 }}>{o.community}</td>
                      <td>
                        <StatusChip status={o.status} small />
                      </td>
                      <td className="small">{fm?.name ?? '未派'}</td>
                      <td className="num small" style={overdue ? { color: '#ff9b9b', fontWeight: 600 } : { color: 'var(--text-1)' }}>
                        {fmtDate(o.deadline)}
                      </td>
                      <td className="num small">{o.reworkCount || '—'}</td>
                      <td className="num">
                        {overdue && (
                          <span className={`chip ${o.status === 'passed' ? 'chip-slate' : 'chip-red'}`} style={{ height: 17, fontSize: 9.5 }}>
                            {o.status === 'passed' ? '逾期完成' : '超期'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {tableOrders.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <Empty>无数据</Empty>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* 超期预警 */}
        <Panel title={`超期预警 · ${overdueOrders.length}`} bodyClassName="list">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {overdueOrders.length === 0 && <Empty>没有超期工单</Empty>}
            {overdueOrders.map((o) => {
              const fm = FOREMEN.find((f) => f.id === o.assigneeId);
              const lateDays = overdueDays(o, now);
              return (
                <div key={o.id} className="list-row" style={{ borderRadius: 7 }} onClick={() => onOpenOrder(o.id)}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontWeight: 620, fontSize: 12.5 }}>{o.community}</span>
                      <StatusChip status={o.status} small />
                    </div>
                    <div className="tiny" style={{ marginTop: 2 }}>
                      {o.id} · {fm?.name ?? '未派'} · {dueLabel(o, now).text}
                    </div>
                  </div>
                  <span className={`chip ${o.status === 'passed' ? 'chip-slate' : 'chip-red'}`}>
                    {o.status === 'passed' ? `逾期完成 · ${lateDays} 天` : `超 ${lateDays} 天`}
                  </span>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function MiniKV({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="tiny">{k}</div>
      <div style={{ fontWeight: 650, fontSize: 13, marginTop: 2 }}>{v}</div>
    </div>
  );
}

function avgDays(list: (number | null)[]): string {
  const nums = list.filter((n): n is number => n !== null);
  if (!nums.length) return '—';
  return `${(nums.reduce((s, n) => s + n, 0) / nums.length).toFixed(1)} 天`;
}
