import { useMemo, useState } from 'react';
import type { Order, RectifyItem, User } from '../domain/types';
import { generateLayout } from '../domain/layout';
import { fmtDateTime } from '../domain/workflow';
import { RECTIFY_CODES, dueLabel, rectifyText } from '../domain/stats';
import { Panel, StatusChip, Notice, KV, Modal, Empty, Timeline, RectifyList } from './common';
import { LayoutView } from './LayoutView';
import type { Selection } from '../gpu/scene';

interface Props {
  orders: Order[];
  user: User;
  onDecide: (orderId: string, decision: 'pass' | 'reject', items: RectifyItem[], note: string) => void;
  now: number;
}

export function QcScreen({ orders, user, onDecide, now }: Props) {
  const queue = useMemo(
    () => orders.filter((o) => o.status === 'qc').sort((a, b) => (a.submitSeq ?? 999) - (b.submitSeq ?? 999)),
    [orders],
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = queue.find((o) => o.id === activeId) ?? queue[0] ?? null;
  const [mode, setMode] = useState<'elevation' | 'top'>('elevation');
  const [showLabels, setShowLabels] = useState(true);
  const [selection, setSelection] = useState<Selection>({ kind: null, id: null });
  const [decideOpen, setDecideOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const model = useMemo(() => (active ? generateLayout(active.params, active.overrides) : null), [active]);
  const submitLog = active
    ? active.log.filter((l) => l.action === '提交完工' || l.action === '提交质检').slice(-1)[0]
    : undefined;

  const inspected = orders.filter((o) => o.qcRounds.some((r) => r.sampled));
  const rejected = orders.filter((o) => o.qcRounds.some((r) => r.sampled && r.decision === 'reject'));

  return (
    <div className="main">
      <div style={{ width: 310, flex: '0 0 310px', padding: 12, display: 'flex', flexDirection: 'column', minHeight: 0, gap: 10 }}>
        <Panel title={`待质检队列 · ${queue.length}`} bodyClassName="list" className="panel">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {queue.length === 0 && <Empty>没有待质检工单<br />施工班组长提交完工后会自动进入此队列</Empty>}
            {queue.map((o) => (
              <div
                key={o.id}
                className={`list-row ${active?.id === o.id ? 'selected' : ''}`}
                style={{ flexDirection: 'column', alignItems: 'stretch', gap: 4, borderRadius: 7 }}
                onClick={() => setActiveId(o.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="mono tiny">{o.id}</span>
                  <div className="spacer" />
                  <span className="chip chip-amber" style={{ height: 18, fontSize: 10 }}>批次 #{o.submitSeq}</span>
                </div>
                <div style={{ fontWeight: 620, fontSize: 12.5 }}>{o.community}</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span className="tiny">{o.photos.length} 张照片</span>
                  <div className="spacer" />
                  {o.reworkCount > 0 && <span className="chip chip-red" style={{ height: 16, fontSize: 9.5 }}>返工 {o.reworkCount}</span>}
                  <span className="tiny">{dueLabel(o, now).text}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="抽查规则" bodyClassName="list">
          <div className="tiny" style={{ lineHeight: 1.85 }}>
            按提交批次序号等距抽取：<b style={{ color: 'var(--amber-soft)' }}>序号 % 5 == 0</b> 必检，长期比例稳定 20%。
            <br />
            返工单一律 100% 复检。
            <br />
            未抽中订单自动通过，记录留痕。
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <div className="stat-card" style={{ flex: 1, padding: '7px 10px' }}>
              <div className="stat-label" style={{ marginBottom: 3 }}>已抽查</div>
              <div className="stat-value" style={{ fontSize: 18 }}>{inspected.length}</div>
            </div>
            <div className="stat-card" style={{ flex: 1, padding: '7px 10px' }}>
              <div className="stat-label" style={{ marginBottom: 3 }}>曾不合格</div>
              <div className="stat-value stat-red" style={{ fontSize: 18 }}>{rejected.length}</div>
            </div>
          </div>
        </Panel>
      </div>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', padding: 12, gap: 10 }}>
        {!active || !model ? (
          <Empty>队列为空</Empty>
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '9px 14px',
                border: '1px solid var(--line)',
                borderRadius: 10,
                background: 'linear-gradient(180deg,#151f29,#111922)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{active.community}</span>
                  <StatusChip status={active.status} />
                  <span className="chip chip-amber">第 {active.qcRounds.length + 1} 轮质检</span>
                  {active.reworkCount > 0 && <span className="chip chip-red">返工 {active.reworkCount} 次</span>}
                </div>
                <div className="tiny" style={{ marginTop: 3 }}>
                  {active.id} · 提交批次 #{active.submitSeq} · {active.assigneeId} · 交期 {dueLabel(active, now).text}
                </div>
              </div>
              <div className="spacer" />
              <Metric k="表箱" v={`${model.stats.boxCount}`} />
              <Metric k="立管" v={`${model.stats.riserCount}`} />
              <Metric k="手工标记" v={`${model.stats.manualBoxes + model.stats.manualSegments}`} accent />
              <button className="btn btn-sm" onClick={() => setReviewOpen(true)}>
                查看照片 ({active.photos.length})
              </button>
              <button className="btn btn-sm btn-danger" onClick={() => setDecideOpen(true)} disabled={active.status !== 'qc'}>
                不合格 · 退回整改
              </button>
              <button
                className="btn btn-sm"
                style={{ background: 'rgba(66,200,130,0.16)', borderColor: 'rgba(66,200,130,0.45)', color: '#7ce0a6', fontWeight: 650 }}
                onClick={() => onDecide(active.id, 'pass', [], '抽查合格')}
                disabled={active.status !== 'qc'}
              >
                合格通过
              </button>
            </div>

            {active.qcRounds.length > 0 && active.status === 'qc' && (
              <Notice level="info">
                该单为返工重新提交，上一轮整改项：{active.qcRounds[active.qcRounds.length - 1].items.map((i) => i.code).join('、') || '无'}
              </Notice>
            )}

            <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <LayoutView
                  model={model}
                  mode={mode}
                  onModeChange={setMode}
                  selection={selection}
                  onSelect={setSelection}
                  onDragBox={() => undefined}
                  onDragSegment={() => undefined}
                  onDragEnd={() => undefined}
                  readOnly
                  showLabels={showLabels}
                  onToggleLabels={() => setShowLabels((v) => !v)}
                />
              </div>
              <div style={{ width: 300, flex: '0 0 300px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
                <Panel title="报装参数" bodyClassName="list">
                  <KV k="楼栋 / 层数" v={`${active.params.buildingCount} 栋 / ${active.params.floors} 层`} />
                  <KV k="每层户数" v={`${active.params.householdsPerFloor} 户`} />
                  <KV k="管径" v={`DN${active.params.pipeDiameter}`} />
                  <KV k="表箱规格" v={active.params.boxSpecId} />
                  <KV k="街区进深" v={`${active.params.streetDepth} m`} />
                  <KV k="层高" v={`${active.params.floorHeight} m`} />
                  <KV k="退红线" v={`${active.params.rules.roadSetback} m`} />
                  <KV k="排布指纹" v={<span className="mono">{model.fingerprint}</span>} />
                  <KV k="手工改动" v={`${model.stats.manualBoxes} 箱 / ${model.stats.manualSegments} 段`} />
                </Panel>
                <Panel title="排布校验" bodyClassName="list">
                  {model.violations.length === 0 ? (
                    <Notice level="ok">排布校验无异常</Notice>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {model.violations.map((v, i) => (
                        <Notice key={i} level={v.level === 'error' ? 'error' : v.level === 'warn' ? 'warn' : 'info'}>
                          {v.message}
                        </Notice>
                      ))}
                    </div>
                  )}
                </Panel>
                <Panel title="提交记录" bodyClassName="list">
                  <div className="tiny" style={{ marginBottom: 6 }}>
                    提交人 {submitLog?.actorName ?? '—'} · {submitLog ? fmtDateTime(submitLog.at) : '—'}
                  </div>
                  <Timeline entries={active.log.slice(-4)} />
                </Panel>
              </div>
            </div>
          </>
        )}
      </div>

      {active && decideOpen && (
        <RejectModal
          order={active}
          user={user}
          onClose={() => setDecideOpen(false)}
          onSubmit={(items, note) => {
            onDecide(active.id, 'reject', items, note);
            setDecideOpen(false);
          }}
        />
      )}
      {active && reviewOpen && (
        <Modal title={`现场照片 · ${active.community}`} onClose={() => setReviewOpen(false)} wide>
          {active.photos.length === 0 ? (
            <Empty>该单没有照片</Empty>
          ) : (
            <div className="photo-grid">
              {active.photos.map((p) => (
                <div className="photo-card" key={p.id}>
                  <img src={p.dataUrl || placeholderSvg(p.caption)} alt={p.caption} />
                  <div className="photo-meta">
                    <span style={{ color: 'var(--text-1)' }}>{p.caption}</span>
                    <span>{p.actorName} · {fmtDateTime(p.at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

function placeholderSvg(title: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><rect width="480" height="360" fill="#16202a"/><text x="240" y="180" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#6f8296">${title}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function Metric({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div className="tiny">{k}</div>
      <div style={{ fontSize: 12.5, fontWeight: 650, color: accent ? 'var(--amber-soft)' : 'var(--text-0)' }}>{v}</div>
    </div>
  );
}

function RejectModal({
  order,
  user,
  onClose,
  onSubmit,
}: {
  order: Order;
  user: User;
  onClose: () => void;
  onSubmit: (items: RectifyItem[], note: string) => void;
}) {
  const [codes, setCodes] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const toggle = (code: string) => {
    setCodes((c) => (c.includes(code) ? c.filter((x) => x !== code) : [...c, code]));
    setErr(null);
  };
  const submit = () => {
    if (codes.length === 0) {
      setErr('至少选择一条整改项');
      return;
    }
    const items: RectifyItem[] = codes.map((code, i) => ({
      id: `RC-${order.id}-${Date.now().toString(36)}-${i}`,
      code,
      text: rectifyText(code),
    }));
    onSubmit(items, note);
  };
  return (
    <Modal
      title={`质检退回 · ${order.community}`}
      onClose={onClose}
      footer={
        <>
          <span className="tiny">退回后返工次数 +1，操作人 {user.name} 与时间将写入工单</span>
          <div className="spacer" />
          <button className="btn" onClick={onClose}>
            取消
          </button>
          <button className="btn btn-danger" onClick={submit}>
            确认退回（{codes.length} 项）
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {RECTIFY_CODES.map((r) => (
          <label key={r.code} className={`check-row ${codes.includes(r.code) ? 'on' : ''}`}>
            <input type="checkbox" checked={codes.includes(r.code)} onChange={() => toggle(r.code)} />
            <span style={{ fontSize: 12, lineHeight: 1.5 }}>
              <span className="check-code">{r.code}</span>
              {r.text}
            </span>
          </label>
        ))}
      </div>
      <div className="field" style={{ marginTop: 12 }}>
        <label>补充说明</label>
        <textarea
          className="input"
          rows={3}
          style={{ height: 'auto', padding: 9, resize: 'vertical' }}
          placeholder="现场照片对应的问题位置、复测要求等"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      {err && (
        <div style={{ marginTop: 10 }}>
          <Notice level="error">{err}</Notice>
        </div>
      )}
      {order.rectifications.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div className="tiny" style={{ marginBottom: 6 }}>本轮需复核的上一轮整改项</div>
          <RectifyList items={order.rectifications} />
        </div>
      )}
    </Modal>
  );
}
