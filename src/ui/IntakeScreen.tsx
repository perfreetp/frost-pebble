import { useMemo, useState } from 'react';
import type { LayoutParams, Order, OrderStatus, User } from '../domain/types';
import { BOX_SPECS, DEFAULT_PARAMS, DEFAULT_RULES, PIPE_DIAMETERS, generateLayout } from '../domain/layout';
import { FOREMEN, isOverdue } from '../domain/workflow';
import { dueLabel } from '../domain/stats';
import type { NewOrderDraft } from './store';
import { Panel, StatusChip, NumberField, Notice } from './common';
import { LayoutView } from './LayoutView';
import type { Selection } from '../gpu/scene';

const SEED_HINTS = ['MEITAN-2026', 'HUA IYIN-A', 'GUANGHUA-4C', 'ZIZHU-E'];

interface Props {
  orders: Order[];
  user: User;
  onCreate: (draft: NewOrderDraft) => Order;
  onAssign: (orderId: string, foremanId: string) => void;
  onOpenWorkbench: (orderId: string) => void;
  now: number;
}

interface FormState {
  community: string;
  address: string;
  contact: string;
  buildingCount: number;
  floors: number;
  householdsPerFloor: number;
  pipeDiameter: number;
  boxSpecId: string;
  seed: string;
  streetDepth: number;
  floorHeight: number;
  roadSetback: number;
  betweenBuildings: number;
  riserWallOffset: number;
  boxBaseHeight: number;
  boxSpacing: number;
  assigneeId: string;
}

const initialState: FormState = {
  community: '',
  address: '',
  contact: '',
  buildingCount: DEFAULT_PARAMS.buildingCount,
  floors: DEFAULT_PARAMS.floors,
  householdsPerFloor: DEFAULT_PARAMS.householdsPerFloor,
  pipeDiameter: DEFAULT_PARAMS.pipeDiameter,
  boxSpecId: DEFAULT_PARAMS.boxSpecId,
  seed: 'MEITAN-2026',
  streetDepth: DEFAULT_PARAMS.streetDepth,
  floorHeight: DEFAULT_PARAMS.floorHeight,
  roadSetback: DEFAULT_RULES.roadSetback,
  betweenBuildings: DEFAULT_RULES.betweenBuildings,
  riserWallOffset: DEFAULT_RULES.riserWallOffset,
  boxBaseHeight: DEFAULT_RULES.boxBaseHeight,
  boxSpacing: DEFAULT_RULES.boxSpacing,
  assigneeId: '',
};

function toParams(f: FormState): LayoutParams {
  return {
    seed: f.seed,
    buildingCount: f.buildingCount,
    floors: f.floors,
    householdsPerFloor: f.householdsPerFloor,
    pipeDiameter: f.pipeDiameter,
    boxSpecId: f.boxSpecId,
    streetDepth: f.streetDepth,
    floorHeight: f.floorHeight,
    rules: {
      roadSetback: f.roadSetback,
      betweenBuildings: f.betweenBuildings,
      riserWallOffset: f.riserWallOffset,
      boxBaseHeight: f.boxBaseHeight,
      boxSpacing: f.boxSpacing,
    },
  };
}

export function IntakeScreen({ orders, user, onCreate, onAssign, onOpenWorkbench, now }: Props) {
  const [form, setForm] = useState<FormState>(initialState);
  const [previewMode, setPreviewMode] = useState<'elevation' | 'top'>('elevation');
  const [showLabels, setShowLabels] = useState(true);
  const [selection, setSelection] = useState<Selection>({ kind: null, id: null });
  const [toast, setToast] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const params = useMemo(() => toParams(form), [form]);
  const preview = useMemo(() => generateLayout(params), [params]);

  const errors = preview.violations.filter((v) => v.level === 'error');
  const warns = preview.violations.filter((v) => v.level === 'warn');
  const canCreate = form.community.trim().length > 0 && errors.length === 0;

  const pending = orders.filter((o) => o.status === 'pending');
  const list =
    filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const submit = () => {
    if (!canCreate) return;
    const order = onCreate({
      community: form.community,
      address: form.address,
      contact: form.contact,
      params,
      assigneeId: form.assigneeId || null,
    });
    setToast(`已建单 ${order.id}，排布指纹 ${preview.fingerprint}${form.assigneeId ? '，已派单' : '，待派单'}`);
    setForm((f) => ({ ...initialState, seed: f.seed, community: '', address: '', contact: '' }));
    window.setTimeout(() => setToast(null), 6000);
  };

  const randomizeSeed = () => {
    const n = Math.floor(Math.random() * 9000) + 1000;
    set('seed', `SEED-${n}`);
  };

  return (
    <div className="main">
      {/* 左：接单表单 */}
      <div style={{ width: 336, flex: '0 0 336px', padding: 12, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Panel
          title="接单录入"
          right={<span className="tiny mono">{preview.fingerprint}</span>}
          bodyClassName="list"
        >
          <div className="form-grid">
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label>小区名称 *</label>
              <input
                className="input"
                placeholder="例如：槐荫里小区"
                value={form.community}
                onChange={(e) => set('community', e.target.value)}
              />
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label>报装地址</label>
              <input className="input" placeholder="路名 / 门牌 / 楼栋范围" value={form.address} onChange={(e) => set('address', e.target.value)} />
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label>联系人</label>
              <input className="input" placeholder="姓名 电话" value={form.contact} onChange={(e) => set('contact', e.target.value)} />
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">楼栋与户数</div>
            <div className="form-grid">
              <NumberField label="楼栋数" value={form.buildingCount} min={1} max={12} onChange={(v) => set('buildingCount', Math.round(v))} suffix="栋" />
              <NumberField label="每栋层数" value={form.floors} min={1} max={40} onChange={(v) => set('floors', Math.round(v))} suffix="层" />
              <NumberField
                label="每层户数"
                value={form.householdsPerFloor}
                min={1}
                max={12}
                onChange={(v) => set('householdsPerFloor', Math.round(v))}
                suffix="户"
              />
              <NumberField label="层高" value={form.floorHeight} min={2.4} max={4.5} step={0.05} onChange={(v) => set('floorHeight', v)} suffix="m" />
              <NumberField label="街区进深" value={form.streetDepth} min={6} max={40} step={0.5} onChange={(v) => set('streetDepth', v)} suffix="m" />
              <div className="field">
                <label>管径</label>
                <select className="select" value={form.pipeDiameter} onChange={(e) => set('pipeDiameter', Number(e.target.value))}>
                  {PIPE_DIAMETERS.map((d) => (
                    <option key={d} value={d}>
                      DN{d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label>表箱规格</label>
                <select className="select" value={form.boxSpecId} onChange={(e) => set('boxSpecId', e.target.value)}>
                  {BOX_SPECS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label} · {s.capacity} 户/箱 · {s.w}×{s.h}×{s.d} m
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">退距与安装规则</div>
            <div className="form-grid">
              <NumberField label="退道路红线" value={form.roadSetback} min={0} max={30} step={0.5} onChange={(v) => set('roadSetback', v)} suffix="m" />
              <NumberField label="楼栋净距" value={form.betweenBuildings} min={0} max={30} step={0.5} onChange={(v) => set('betweenBuildings', v)} suffix="m" />
              <NumberField label="立管距墙" value={form.riserWallOffset} min={0.15} max={5} step={0.05} onChange={(v) => set('riserWallOffset', v)} suffix="m" />
              <NumberField label="表箱底标高" value={form.boxBaseHeight} min={0.2} max={2.6} step={0.05} onChange={(v) => set('boxBaseHeight', v)} suffix="m" />
              <NumberField label="表箱净距" value={form.boxSpacing} min={0.15} max={2} step={0.05} onChange={(v) => set('boxSpacing', v)} suffix="m" />
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">种子与派工</div>
            <div className="field">
              <label>排布种子（同种子 + 同参数 = 同排布）</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input className="input mono" value={form.seed} onChange={(e) => set('seed', e.target.value)} />
                <button className="btn btn-sm" style={{ height: 32 }} onClick={randomizeSeed} title="换一个种子">
                  换一个
                </button>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 5 }}>
                {SEED_HINTS.map((s) => (
                  <button key={s} className="btn btn-ghost btn-sm" onClick={() => set('seed', s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="field" style={{ marginTop: 10 }}>
              <label>派单师傅</label>
              <select className="select" value={form.assigneeId} onChange={(e) => set('assigneeId', e.target.value)}>
                <option value="">暂不派单（进待派池）</option>
                {FOREMEN.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} · {f.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {errors.length > 0 && (
            <div style={{ marginTop: 11, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {errors.map((v, i) => (
                <Notice key={i} level="error">
                  {v.message}
                </Notice>
              ))}
            </div>
          )}
          {warns.length > 0 && (
            <div style={{ marginTop: errors.length ? 6 : 11, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {warns.slice(0, 3).map((v, i) => (
                <Notice key={i} level="warn">
                  {v.message}
                </Notice>
              ))}
            </div>
          )}

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" style={{ flex: 1, height: 36 }} disabled={!canCreate} onClick={submit}>
              生成排布并建单
            </button>
          </div>
          <div className="tiny" style={{ marginTop: 7, lineHeight: 1.6 }}>
            录入人：{user.name}（{user.title}）· 每次建单都会写入操作日志
          </div>
        </Panel>
      </div>

      {/* 中：实时排布预览 */}
      <div style={{ flex: 1, minWidth: 0, padding: '12px 0 12px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {toast && (
          <div style={{ marginRight: 12 }}>
            <Notice level="ok">{toast}</Notice>
          </div>
        )}
        <div style={{ flex: 1, minHeight: 0, marginRight: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <LayoutView
            model={preview}
            mode={previewMode}
            onModeChange={setPreviewMode}
            selection={selection}
            onSelect={setSelection}
            onDragBox={() => undefined}
            onDragSegment={() => undefined}
            onDragEnd={() => undefined}
            readOnly
            showLabels={showLabels}
            onToggleLabels={() => setShowLabels((v) => !v)}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            <MiniStat label="楼栋" value={preview.stats.buildingCount} unit="栋" />
            <MiniStat label="立管" value={preview.stats.riserCount} unit="根" />
            <MiniStat label="表箱" value={preview.stats.boxCount} unit="台" />
            <MiniStat label="总户数" value={preview.stats.totalHouseholds} unit="户" />
            <MiniStat label="管材总长" value={preview.stats.totalPipeLength.toFixed(1)} unit="m" />
          </div>
        </div>
      </div>

      {/* 右：待派 / 工单池 */}
      <div style={{ width: 352, flex: '0 0 352px', padding: 12, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Panel
          title={`待派池 · ${pending.length}`}
          right={
            <span className="tiny">
              共 {orders.length} 单
            </span>
          }
          bodyClassName="list"
        >
          <div className="seg-control" style={{ marginBottom: 9 }}>
            <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
              全部
            </button>
            <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>
              待派
            </button>
            <button className={filter === 'working' ? 'active' : ''} onClick={() => setFilter('working')}>
              施工
            </button>
            <button className={filter === 'qc' ? 'active' : ''} onClick={() => setFilter('qc')}>
              待检
            </button>
            <button className={filter === 'rework' ? 'active' : ''} onClick={() => setFilter('rework')}>
              整改
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {list.length === 0 && <div className="tiny" style={{ padding: 18, textAlign: 'center' }}>没有符合条件的工单</div>}
            {list.map((o) => {
              const due = dueLabel(o, now);
              const overdue = isOverdue(o, now);
              return (
                <OrderMiniCard
                  key={o.id}
                  order={o}
                  due={due}
                  overdue={overdue}
                  onAssign={onAssign}
                  onOpenWorkbench={onOpenWorkbench}
                />
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function MiniStat({ label, value, unit }: { label: string; value: string | number; unit: string }) {
  return (
    <div className="stat-card" style={{ padding: '8px 11px' }}>
      <div className="stat-label" style={{ marginBottom: 4 }}>{label}</div>
      <div className="stat-value" style={{ fontSize: 18 }}>
        {value}
        <small style={{ fontSize: 11 }}>{unit}</small>
      </div>
    </div>
  );
}

function OrderMiniCard({
  order,
  due,
  overdue,
  onAssign,
  onOpenWorkbench,
}: {
  order: Order;
  due: { text: string; overdue: boolean; soon: boolean };
  overdue: boolean;
  onAssign: (id: string, fm: string) => void;
  onOpenWorkbench: (id: string) => void;
}) {
  const model = useMemo(() => generateLayout(order.params, order.overrides), [order.params, order.overrides]);
  const [picking, setPicking] = useState(false);
  return (
    <div
      style={{
        border: '1px solid var(--line)',
        borderRadius: 9,
        padding: '9px 11px',
        background: '#121a22',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--text-2)' }}>
          {order.id}
        </span>
        <div className="spacer" />
        <StatusChip status={order.status} small />
      </div>
      <div style={{ fontWeight: 650, marginTop: 5, fontSize: 13 }}>{order.community}</div>
      <div className="tiny" style={{ marginTop: 2 }}>
        {order.params.buildingCount} 栋 × {order.params.floors} 层 × {order.params.householdsPerFloor} 户 · DN{order.params.pipeDiameter} · {order.params.boxSpecId}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 7 }}>
        <span className={`small ${overdue ? '' : 'tiny'}`} style={overdue ? { color: '#ff9b9b', fontWeight: 600 } : undefined}>
          {overdue ? '已超期 · ' : '交期 '}
          {due.overdue ? '超期' : due.text}
        </span>
        <span className="tiny">表箱 {model.stats.boxCount}</span>
        {order.reworkCount > 0 && <span className="chip chip-red" style={{ height: 17, fontSize: 10 }}>返工 {order.reworkCount}</span>}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        {order.status === 'pending' ? (
          picking ? (
            <>
              {FOREMEN.map((f) => (
                <button
                  key={f.id}
                  className="btn btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => {
                    onAssign(order.id, f.id);
                    setPicking(false);
                  }}
                >
                  {f.name}
                </button>
              ))}
              <button className="btn btn-sm btn-ghost" onClick={() => setPicking(false)}>
                ✕
              </button>
            </>
          ) : (
            <button className="btn btn-sm btn-primary" style={{ flex: 1 }} onClick={() => setPicking(true)}>
              分派师傅
            </button>
          )
        ) : (
          <button className="btn btn-sm" style={{ flex: 1 }} onClick={() => onOpenWorkbench(order.id)}>
            打开排布工作台
          </button>
        )}
      </div>
    </div>
  );
}
