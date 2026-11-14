import { useEffect, useMemo, useState } from 'react';
import type { LayoutParams, Order, Overrides, Photo } from '../domain/types';
import { BOX_SPECS, PIPE_DIAMETERS, generateLayout } from '../domain/layout';
import { fmtDateTime, isOverdue, canTransition } from '../domain/workflow';
import { dueLabel } from '../domain/stats';
import { countManual } from '../domain/orders';
import type { AppStore } from './store';
import { Panel, StatusChip, NumberField, Notice, KV, Modal, RectifyList, Timeline, Empty } from './common';
import { LayoutView } from './LayoutView';
import type { Selection } from '../gpu/scene';
import { clearBoxOverride, clearSegmentOverride, setBoxOverride, setSegmentOverride, clearAllOverrides } from '../domain/orders';

interface Props {
  store: AppStore;
  focusOrderId: string | null;
  onPickOrder: (id: string) => void;
}

export function WorkbenchScreen({ store, focusOrderId, onPickOrder }: Props) {
  const { orders, user, now } = store;
  const visible = useMemo(() => {
    if (user.role === 'foreman') {
      return orders
        .filter((o) => o.assigneeId === user.id)
        .sort((a, b) => statusRank(a.status) - statusRank(b.status) || a.deadline - b.deadline);
    }
    return orders.slice().sort((a, b) => statusRank(a.status) - statusRank(b.status) || a.deadline - b.deadline);
  }, [orders, user]);

  const active = focusOrderId ?? visible[0]?.id ?? null;
  const order = orders.find((o) => o.id === active) ?? null;

  return (
    <div className="main">
      <div style={{ width: 292, flex: '0 0 292px', padding: 12, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Panel
          title={user.role === 'foreman' ? '我的工单' : '工单列表'}
          right={<span className="tiny">{visible.length} 单</span>}
          bodyClassName="list"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {visible.length === 0 && <Empty>当前身份下没有可用工单</Empty>}
            {visible.map((o) => {
              const due = dueLabel(o, now);
              return (
                <div
                  key={o.id}
                  className={`list-row ${o.id === active ? 'selected' : ''}`}
                  onClick={() => onPickOrder(o.id)}
                  style={{ flexDirection: 'column', alignItems: 'stretch', gap: 4, borderRadius: 7 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="mono tiny">{o.id}</span>
                    <div className="spacer" />
                    <StatusChip status={o.status} small />
                  </div>
                  <div style={{ fontWeight: 620, fontSize: 12.5 }}>{o.community}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className="tiny">{o.params.buildingCount}栋 · {o.params.floors}层</span>
                    <div className="spacer" />
                    {isOverdue(o, now) && <span className="chip chip-red" style={{ height: 16, fontSize: 9.5 }}>超期</span>}
                    <span className="tiny">{due.text}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', minHeight: 0 }}>
        {order ? <WorkbenchEditor key={order.id} order={order} store={store} /> : <Empty>选择左侧工单开始排布</Empty>}
      </div>
    </div>
  );
}

function statusRank(s: string): number {
  return { rework: 0, working: 1, pending: 2, qc: 3, passed: 4 }[s] ?? 9;
}

function WorkbenchEditor({ order, store }: { order: Order; store: AppStore }) {
  const { user, now } = store;
  const isForeman = user.role === 'foreman';
  const canEdit = isForeman && order.assigneeId === user.id && (order.status === 'working' || order.status === 'rework');

  // 本地草稿：参数与手工标记
  const [params, setParams] = useState<LayoutParams>(order.params);
  const [overrides, setOverrides] = useState<Overrides>(order.overrides);
  const [mode, setMode] = useState<'elevation' | 'top'>('elevation');
  const [selection, setSelection] = useState<Selection>({ kind: null, id: null });
  const [showLabels, setShowLabels] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setParams(order.params);
    setOverrides(order.overrides);
    setDirty(false);
    setSelection({ kind: null, id: null });
  }, [order.id, order.params, order.overrides]);

  const model = useMemo(() => generateLayout(params, overrides), [params, overrides]);
  const savedModel = useMemo(() => generateLayout(order.params, order.overrides), [order.params, order.overrides]);
  const manualCount = countManual(overrides);

  const setRule = <K extends keyof LayoutParams['rules']>(k: K, v: LayoutParams['rules'][K]) => {
    if (!canEdit) return;
    setParams((p) => ({ ...p, rules: { ...p.rules, [k]: v } }));
    setDirty(true);
  };
  const setParam = <K extends keyof LayoutParams>(k: K, v: LayoutParams[K]) => {
    if (!canEdit) return;
    setParams((p) => ({ ...p, [k]: v }));
    setDirty(true);
  };

  const doDragBox = (id: string, pos: { x: number; y: number; z: number }) => {
    if (!canEdit) return;
    setOverrides((o) => setBoxOverride(o, id, pos));
    setDirty(true);
  };
  const doDragSegment = (id: string, length: number) => {
    if (!canEdit) return;
    setOverrides((o) => setSegmentOverride(o, id, length));
    setDirty(true);
  };

  const resetBox = (id: string) => {
    setOverrides((o) => clearBoxOverride(o, id));
    setDirty(true);
  };
  const resetSegment = (id: string) => {
    setOverrides((o) => clearSegmentOverride(o, id));
    setDirty(true);
  };
  const resetAll = () => {
    setOverrides(clearAllOverrides());
    setDirty(true);
  };

  const save = () => {
    store.saveLayout(order.id, params, overrides);
    setDirty(false);
    setToast('排布已保存并写入操作日志');
    window.setTimeout(() => setToast(null), 4000);
  };

  const revert = () => {
    setParams(order.params);
    setOverrides(order.overrides);
    setDirty(false);
    setToast('已恢复到上次保存的排布');
    window.setTimeout(() => setToast(null), 3000);
  };

  const selectedBox = selection.kind === 'box' ? model.boxes.find((b) => b.id === selection.id) : undefined;
  const selectedSegment = selection.kind === 'segment' ? model.segments.find((s) => s.id === selection.id) : undefined;

  const canSubmit = isForeman && order.assigneeId === user.id && canTransition(order.status, 'qc');
  const overdue = isOverdue(order, now);

  return (
    <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', padding: 12, gap: 10, overflow: 'hidden' }}>
      {/* 顶部工单信息条 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '9px 14px',
          border: '1px solid var(--line)',
          borderRadius: 10,
          background: 'linear-gradient(180deg,#151f29,#111922)',
          flex: '0 0 auto',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{order.community}</span>
            <StatusChip status={order.status} />
            {order.reworkCount > 0 && <span className="chip chip-red">返工 {order.reworkCount} 次</span>}
          </div>
          <div className="tiny" style={{ marginTop: 3 }}>
            {order.id} · {order.address || '—'} · {order.contact || '—'}
          </div>
        </div>
        <div className="spacer" />
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Metric k="交期" v={overdue ? '已超期' : dueLabel(order, now).text} danger={overdue} />
          <Metric k="立管" v={`${model.stats.riserCount} 根`} />
          <Metric k="表箱" v={`${model.stats.boxCount} 台`} />
          <Metric k="手工标记" v={`${model.stats.manualBoxes + model.stats.manualSegments} 处`} accent />
          <Metric k="指纹" v={model.fingerprint} mono />
        </div>
        <button className="btn btn-sm" onClick={() => setLogOpen(true)}>
          操作记录 {order.log.length}
        </button>
        <button className="btn btn-sm btn-primary" disabled={!canSubmit} onClick={() => setSubmitOpen(true)}>
          完工提交
        </button>
      </div>

      {toast && <Notice level="ok">{toast}</Notice>}

      {order.status === 'qc' && (
        <Notice level="info">该单已提交，等待质检。质检期间排布锁定只读，如需调整请等待退回后再改。</Notice>
      )}
      {order.status === 'passed' && <Notice level="ok">质检已通过，工单归档。下方排布为最终施工版。</Notice>}
      {order.status === 'rework' && order.rectifications.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 320px',
            gap: 10,
            alignItems: 'start',
            background: 'rgba(240,106,106,0.06)',
            border: '1px solid rgba(240,106,106,0.28)',
            borderRadius: 9,
            padding: '10px 12px',
          }}
        >
          <div>
            <div style={{ fontWeight: 650, color: '#ffb1b1', fontSize: 12.5, marginBottom: 6 }}>
              质检退回 · 整改项（第 {order.reworkCount} 次返工）
            </div>
            <RectifyList items={order.rectifications} />
          </div>
          <div className="tiny" style={{ lineHeight: 1.7 }}>
            整改完成后重新提交，返工单 100% 复检。改过的表箱/立管位置会带手工标记保留，其余部分可随参数重算。
          </div>
        </div>
      )}

      {/* 主体：画布 + 右侧属性 */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 10, overflow: 'hidden' }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <LayoutView
            model={model}
            mode={mode}
            onModeChange={setMode}
            selection={selection}
            onSelect={setSelection}
            onDragBox={doDragBox}
            onDragSegment={doDragSegment}
            onDragEnd={() => setDirty(true)}
            readOnly={!canEdit}
            showLabels={showLabels}
            onToggleLabels={() => setShowLabels((v) => !v)}
            highlightIds={order.rectifications.length && order.status === 'rework' ? [] : undefined}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '7px 12px',
              border: '1px solid var(--line)',
              borderRadius: 9,
              background: '#111922',
              flex: '0 0 auto',
            }}
          >
            <span className="tiny">
              拖动表箱移动位置 · 拖动立管段改变该段高度 · <span className="hint-key">Shift</span>+拖动平移 · 滚轮缩放 · 双击复位
            </span>
            <div className="spacer" />
            {dirty ? (
              <>
                <span className="chip chip-amber">未保存</span>
                <button className="btn btn-sm" onClick={revert}>
                  还原
                </button>
                <button className="btn btn-sm btn-primary" disabled={!canEdit} onClick={save}>
                  保存排布
                </button>
              </>
            ) : (
              <span className="tiny">已保存 · 指纹 {savedModel.fingerprint}</span>
            )}
          </div>
        </div>

        <div className="side-scroll" style={{ width: 306, flex: '0 0 306px' }}>
          <Panel title="参数调整" className="panel" style={{ flex: '0 0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <div className="form-grid">
                <NumberField label="楼栋数" value={params.buildingCount} min={1} max={12} onChange={(v) => setParam('buildingCount', Math.round(v))} suffix="栋" />
                <NumberField label="层数" value={params.floors} min={1} max={40} onChange={(v) => setParam('floors', Math.round(v))} suffix="层" />
                <NumberField label="每层户数" value={params.householdsPerFloor} min={1} max={12} onChange={(v) => setParam('householdsPerFloor', Math.round(v))} suffix="户" />
                <NumberField label="层高" value={params.floorHeight} min={2.4} max={4.5} step={0.05} onChange={(v) => setParam('floorHeight', v)} suffix="m" />
                <NumberField label="街区进深" value={params.streetDepth} min={6} max={40} step={0.5} onChange={(v) => setParam('streetDepth', v)} suffix="m" />
                <div className="field">
                  <label>管径</label>
                  <select className="select" value={params.pipeDiameter} disabled={!canEdit} onChange={(e) => setParam('pipeDiameter', Number(e.target.value))}>
                    {PIPE_DIAMETERS.map((d) => (
                      <option key={d} value={d}>
                        DN{d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field" style={{ gridColumn: '1 / -1' }}>
                  <label>表箱规格</label>
                  <select className="select" value={params.boxSpecId} disabled={!canEdit} onChange={(e) => setParam('boxSpecId', e.target.value)}>
                    {BOX_SPECS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label} · {s.capacity} 户/箱
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-section" style={{ marginTop: 2 }}>
                <div className="form-section-title">退距规则</div>
                <div className="form-grid">
                  <NumberField label="退红线" value={params.rules.roadSetback} min={0} max={30} step={0.5} onChange={(v) => setRule('roadSetback', v)} suffix="m" />
                  <NumberField label="楼栋净距" value={params.rules.betweenBuildings} min={0} max={30} step={0.5} onChange={(v) => setRule('betweenBuildings', v)} suffix="m" />
                  <NumberField label="立管距墙" value={params.rules.riserWallOffset} min={0.15} max={5} step={0.05} onChange={(v) => setRule('riserWallOffset', v)} suffix="m" />
                  <NumberField label="箱底标高" value={params.rules.boxBaseHeight} min={0.2} max={2.6} step={0.05} onChange={(v) => setRule('boxBaseHeight', v)} suffix="m" />
                </div>
              </div>

              <div className="form-section" style={{ marginTop: 2 }}>
                <div className="form-section-title">种子</div>
                <input className="input mono" value={params.seed} disabled={!canEdit} onChange={(e) => setParam('seed', e.target.value)} />
                <div className="tiny" style={{ marginTop: 5, lineHeight: 1.6 }}>
                  同种子同参数必得同一排布。改参数后自动重算，已手工标记的{' '}
                  {model.stats.manualBoxes + model.stats.manualSegments} 处位置保持不动。
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="选中对象" className="panel" style={{ flex: '0 0 auto' }}>
            {!selection.kind && <div className="tiny" style={{ padding: '4px 2px', lineHeight: 1.8 }}>在视图中点选表箱或立管段，可精确调整或清除手工标记。</div>}
            {selection.kind === 'box' && selectedBox && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span className="mono" style={{ fontWeight: 650 }}>{selectedBox.label}</span>
                  {selectedBox.pinned && <span className="chip chip-amber">手工</span>}
                  <div className="spacer" />
                  <span className="tiny">{selectedBox.serves} 户</span>
                </div>
                <KV k="楼层" v={`${selectedBox.floor} F`} />
                <KV k="位置 x / y / z" v={`${selectedBox.x.toFixed(2)} / ${selectedBox.y.toFixed(2)} / ${selectedBox.z.toFixed(2)} m`} />
                <KV k="所属立管" v={selectedBox.riserId} />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-sm" style={{ flex: 1 }} disabled={!canEdit || !selectedBox.pinned} onClick={() => resetBox(selectedBox.id)}>
                    清除手工位置
                  </button>
                </div>
                {canEdit && (
                  <div className="tiny">提示：立面视图拖动改高度与横向位置；俯视视图拖动改进深。拖过的箱子会打上橙色手工标记旗。</div>
                )}
              </div>
            )}
            {selection.kind === 'segment' && selectedSegment && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span className="mono" style={{ fontWeight: 650 }}>段 {selectedSegment.index + 1}</span>
                  {selectedSegment.pinned && <span className="chip chip-amber">手工</span>}
                </div>
                <KV k="段长" v={`${selectedSegment.length.toFixed(3)} m`} />
                <KV k="名义段长" v={`${selectedSegment.nominal.toFixed(3)} m`} />
                <KV k="起始标高" v={`${selectedSegment.baseY.toFixed(2)} m`} />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-sm" style={{ flex: 1 }} disabled={!canEdit} onClick={() => doReplaceLength(selectedSegment.id, selectedSegment.length - 0.1, setOverrides, setDirty)}>
                    −0.1 m
                  </button>
                  <button className="btn btn-sm" style={{ flex: 1 }} disabled={!canEdit} onClick={() => doReplaceLength(selectedSegment.id, selectedSegment.length + 0.1, setOverrides, setDirty)}>
                    +0.1 m
                  </button>
                  <button className="btn btn-sm" disabled={!canEdit || !selectedSegment.pinned} onClick={() => resetSegment(selectedSegment.id)}>
                    复位
                  </button>
                </div>
              </div>
            )}
            {selection.kind === 'riser' && (
              <RiserDetail model={model} id={selection.id!} />
            )}
          </Panel>

          <Panel title={`校验与手工标记 · ${manualCount}`} right={manualCount > 0 ? <button className="btn btn-sm btn-ghost" disabled={!canEdit} onClick={resetAll}>全部清除</button> : undefined} bodyClassName="list">
            {model.violations.length === 0 && manualCount === 0 && <Empty>暂无校验问题，也无手工标记</Empty>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {model.violations.map((v, i) => (
                <Notice key={i} level={v.level === 'error' ? 'error' : v.level === 'warn' ? 'warn' : 'info'}>
                  {v.message}
                </Notice>
              ))}
              {model.orphans.boxes.length + model.orphans.segments.length > 0 && (
                <Notice level="warn">
                  有 {model.orphans.boxes.length + model.orphans.segments.length} 处手工标记因参数变化已失效（对应实体不存在），保存时会自动忽略。
                </Notice>
              )}
              {model.stats.manualBoxes > 0 && (
                <div className="tiny">
                  手工标记表箱 {model.stats.manualBoxes} 台：{model.boxes.filter((b) => b.pinned).slice(0, 6).map((b) => b.label).join('、')}
                  {model.stats.manualBoxes > 6 ? ' …' : ''}
                </div>
              )}
              {model.stats.manualSegments > 0 && (
                <div className="tiny">手工改高立管段 {model.stats.manualSegments} 段</div>
              )}
            </div>
          </Panel>
        </div>
      </div>

      {submitOpen && <SubmitModal order={order} model={model} params={params} overrides={overrides} store={store} onClose={() => setSubmitOpen(false)} />}
      {logOpen && (
        <Modal title={`${order.id} 操作记录`} onClose={() => setLogOpen(false)}>
          <Timeline entries={order.log} />
        </Modal>
      )}
    </div>
  );
}

function doReplaceLength(id: string, len: number, setOverrides: React.Dispatch<React.SetStateAction<Overrides>>, setDirty: (v: boolean) => void) {
  setOverrides((o) => setSegmentOverride(o, id, Math.max(0.2, Math.round(len * 100) / 100)));
  setDirty(true);
}

function Metric({ k, v, danger, accent, mono }: { k: string; v: string; danger?: boolean; accent?: boolean; mono?: boolean }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div className="tiny">{k}</div>
      <div
        style={{
          fontSize: 12.5,
          fontWeight: 650,
          color: danger ? '#ff9b9b' : accent ? 'var(--amber-soft)' : 'var(--text-0)',
          fontFamily: mono ? "'JetBrains Mono',Consolas,monospace" : undefined,
        }}
      >
        {v}
      </div>
    </div>
  );
}

function RiserDetail({ model, id }: { model: ReturnType<typeof generateLayout>; id: string }) {
  const r = model.risers.find((x) => x.id === id);
  if (!r) return null;
  const segs = model.segments.filter((s) => s.riserId === id);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div className="mono" style={{ fontWeight: 650 }}>{r.id}</div>
      <KV k="总高" v={`${r.height.toFixed(2)} m`} />
      <KV k="每层服务" v={`${r.householdsPerFloor} 户`} />
      <KV k="表箱" v={`${r.boxIds.length} 台`} />
      <KV k="分段" v={`${segs.length} 段`} />
      <div className="tiny">{segs.map((s) => `${s.length.toFixed(2)}`).join(' / ')} m</div>
    </div>
  );
}

function SubmitModal({
  order,
  model,
  params,
  overrides,
  store,
  onClose,
}: {
  order: Order;
  model: ReturnType<typeof generateLayout>;
  params: LayoutParams;
  overrides: Overrides;
  store: AppStore;
  onClose: () => void;
}) {
  const { user, submitWork, saveLayout } = store;
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const addPhoto = (dataUrl: string, caption: string) => {
    setPhotos((p) => [
      ...p,
      { id: `PH-${Date.now().toString(36)}-${p.length}`, dataUrl, at: Date.now(), actorName: user.name, caption },
    ]);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    for (const f of files.slice(0, 6)) {
      const reader = new FileReader();
      reader.onload = () => addPhoto(String(reader.result), f.name.replace(/\.[^.]+$/, ''));
      reader.readAsDataURL(f);
    }
    e.target.value = '';
  };

  const fakeShot = (kind: string) => {
    const hue = 190 + photos.length * 24;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${hue},30%,60%)"/><stop offset="1" stop-color="hsl(${hue},32%,32%)"/></linearGradient></defs><rect width="480" height="360" fill="url(#g)"/><rect y="266" width="480" height="94" fill="hsl(${hue},18%,24%)"/><rect x="70" y="80" width="140" height="150" rx="4" fill="hsl(${hue},12%,74%)"/><rect x="228" y="80" width="140" height="150" rx="4" fill="hsl(${hue},12%,70%)"/><path d="M120 266 L120 118 L150 118" stroke="hsl(${hue},50%,20%)" stroke-width="7" fill="none"/><rect x="146" y="100" width="34" height="30" rx="3" fill="hsl(${hue},55%,36%)" stroke="hsl(${hue},40%,18%)" stroke-width="2"/><text x="24" y="334" font-family="sans-serif" font-size="17" fill="hsla(${hue},24%,96%,0.9)">${kind}</text></svg>`;
    addPhoto(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`, kind);
  };

  const submit = () => {
    if (photos.length < 2) {
      setError('至少上传 2 张现场照片（整体 + 表箱细节）');
      return;
    }
    if (model.violations.some((v) => v.level === 'error')) {
      setError('排布存在 error 级校验项，无法提交；请先处置冲突');
      return;
    }
    // 仅在排布真正变化时补写一次调整日志，避免重复留痕
    if (model.fingerprint !== generateLayout(order.params, order.overrides).fingerprint) {
      saveLayout(order.id, params, overrides);
    }
    submitWork(order.id, photos, note);
    onClose();
  };

  return (
    <Modal
      title={`完工提交 · ${order.community}`}
      onClose={onClose}
      wide
      footer={
        <>
          <span className="tiny">
            提交后按 20% 抽查规则判定：批次序号 % 5 == 0 必检，返工单必检
          </span>
          <div className="spacer" />
          <button className="btn" onClick={onClose}>
            取消
          </button>
          <button className="btn btn-primary" onClick={submit}>
            提交完工
          </button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
            <button className="btn btn-sm" onClick={() => fakeShot('现场照片 · 立管')}>
              模拟拍摄
            </button>
            <label className="btn btn-sm" style={{ position: 'relative', overflow: 'hidden' }}>
              上传照片
              <input type="file" accept="image/*" multiple style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} onChange={onFile} />
            </label>
            <span className="tiny">已选 {photos.length} 张（至少 2 张）</span>
          </div>
          <div className="photo-grid">
            {photos.map((p) => (
              <div className="photo-card" key={p.id}>
                <img src={p.dataUrl} alt={p.caption} />
                <div className="photo-meta">
                  <span>{p.caption}</span>
                  <span>{fmtDateTime(p.at)}</span>
                </div>
              </div>
            ))}
            {photos.length === 0 && (
              <div className="empty" style={{ gridColumn: '1 / -1', minHeight: 120 }}>
                还没有照片。点击"模拟拍摄"或上传现场照片。
              </div>
            )}
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label>施工说明</label>
            <textarea
              className="input"
              rows={3}
              style={{ height: 'auto', padding: 9, resize: 'vertical' }}
              placeholder="例如：2 号楼 3 单元立管加装了固定支架，表箱标高按图纸 1.5 m 安装"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          {error && (
            <div style={{ marginTop: 10 }}>
              <Notice level="error">{error}</Notice>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          <div className="panel" style={{ padding: 12 }}>
            <div className="panel-title" style={{ marginBottom: 8 }}>提交前核对</div>
            <KV k="楼栋 / 立管" v={`${model.stats.buildingCount} / ${model.stats.riserCount}`} />
            <KV k="表箱" v={`${model.stats.boxCount} 台`} />
            <KV k="手工标记" v={`${model.stats.manualBoxes} 箱 / ${model.stats.manualSegments} 段`} />
            <KV k="管材" v={`${model.stats.totalPipeLength.toFixed(1)} m`} />
            <KV k="返工次数" v={`${order.reworkCount}`} />
            <KV k="排布指纹" v={<span className="mono">{model.fingerprint}</span>} />
          </div>
          {model.violations.length > 0 ? (
            <Notice level={model.violations.some((v) => v.level === 'error') ? 'error' : 'warn'}>
              有 {model.violations.length} 条校验提示
              {model.violations.some((v) => v.level === 'error') ? '，其中存在 error 需处置' : '，可提交但建议复核'}
            </Notice>
          ) : (
            <Notice level="ok">校验无异常</Notice>
          )}
          <div className="tiny" style={{ lineHeight: 1.7 }}>
            提交人与时间会写入工单操作记录。照片随工单归档，质检员可对照排布图核查。
          </div>
        </div>
      </div>
    </Modal>
  );
}
