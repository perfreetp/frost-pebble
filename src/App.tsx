import { useMemo, useState } from 'react';
import { USERS, fmtDateTime } from './domain/workflow';
import { useAppStore } from './ui/store';
import { IntakeScreen } from './ui/IntakeScreen';
import { WorkbenchScreen } from './ui/WorkbenchScreen';
import { QcScreen } from './ui/QcScreen';
import { BoardScreen } from './ui/BoardScreen';
import { Modal } from './ui/common';
import './ui/styles.css';

type ScreenKey = 'intake' | 'workbench' | 'qc' | 'board';

const SCREENS: { key: ScreenKey; num: string; label: string; roles: string[] }[] = [
  { key: 'intake', num: '01', label: '接单建图', roles: ['clerk', 'foreman', 'inspector'] },
  { key: 'workbench', num: '02', label: '排布施工台', roles: ['foreman', 'clerk', 'inspector'] },
  { key: 'qc', num: '03', label: '质检抽查', roles: ['inspector', 'clerk', 'foreman'] },
  { key: 'board', num: '04', label: '施工看板', roles: ['clerk', 'foreman', 'inspector'] },
];

export function App() {
  const store = useAppStore();
  const { user, state, orders, now } = store;
  const [screen, setScreen] = useState<ScreenKey>('intake');
  const [focusOrder, setFocusOrder] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // 角色切换时给出与其职责匹配的默认界面
  const switchUser = (id: string) => {
    store.setCurrentUser(id);
    const u = USERS.find((x) => x.id === id);
    if (!u) return;
    if (u.role === 'inspector') setScreen('qc');
    else if (u.role === 'foreman') setScreen('workbench');
    else setScreen('intake');
    setFocusOrder(null);
  };

  const qcCount = orders.filter((o) => o.status === 'qc').length;
  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  const openWorkbench = (orderId: string) => {
    setFocusOrder(orderId);
    setScreen('workbench');
  };

  const visibleOrders = useMemo(() => {
    if (user.role !== 'foreman') return orders;
    return orders;
  }, [orders, user]);

  return (
    <div className="app">
      <div className="topbar">
        <div className="brand">
          <div className="brand-mark">燃</div>
          <div>
            <div className="brand-title">街区立管 · 表箱布点</div>
            <div className="brand-sub">STREET RISER &amp; METER LAYOUT — WebGPU</div>
          </div>
        </div>

        <div className="nav">
          {SCREENS.map((s) => (
            <button
              key={s.key}
              className={`nav-item ${screen === s.key ? 'active' : ''}`}
              onClick={() => setScreen(s.key)}
            >
              <span className="nav-num">{s.num}</span>
              {s.label}
              {s.key === 'qc' && qcCount > 0 && <span className="nav-dot" title={`${qcCount} 单待质检`} />}
              {s.key === 'intake' && pendingCount > 0 && screen !== 'intake' && (
                <span className="tiny" style={{ color: 'var(--text-2)' }}>
                  {pendingCount} 待派
                </span>
              )}
            </button>
          ))}
        </div>

        <button className="btn btn-sm btn-ghost" onClick={() => setShowHelp(true)}>
          规则说明
        </button>
        <button className="btn btn-sm btn-ghost" onClick={() => store.resetDemo()} title="恢复演示数据">
          重置数据
        </button>
        <div className="user-switch">
          <label>当前身份</label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '0 9px',
              height: 34,
              border: '1px solid var(--line)',
              borderRadius: 8,
              background: '#111922',
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: user.role === 'clerk' ? 'rgba(74,163,255,0.22)' : user.role === 'foreman' ? 'rgba(66,200,130,0.2)' : 'rgba(245,166,35,0.2)',
                display: 'grid',
                placeItems: 'center',
                fontSize: 11,
                fontWeight: 700,
                color: user.role === 'clerk' ? '#7fc0ff' : user.role === 'foreman' ? '#7ce0a6' : '#ffcd6b',
              }}
            >
              {user.name.slice(0, 1)}
            </span>
            <select
              className="select"
              style={{ width: 108, height: 28, border: 'none', background: 'transparent', paddingLeft: 0 }}
              value={state.currentUserId}
              onChange={(e) => switchUser(e.target.value)}
            >
              {USERS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} · {u.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {screen === 'intake' && (
        <IntakeScreen
          orders={orders}
          user={user}
          onCreate={(d) => store.createOrder(d)}
          onAssign={store.assignOrder}
          onOpenWorkbench={openWorkbench}
          now={now}
        />
      )}
      {screen === 'workbench' && <WorkbenchScreen store={store} focusOrderId={focusOrder} onPickOrder={setFocusOrder} />}
      {screen === 'qc' && <QcScreen orders={orders} user={user} onDecide={store.qcDecide} now={now} />}
      {screen === 'board' && <BoardScreen orders={visibleOrders} now={now} onOpenOrder={openWorkbench} />}

      {showHelp && (
        <Modal title="规则说明" onClose={() => setShowHelp(false)} wide>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12.5, lineHeight: 1.8 }}>
            <section>
              <h4 style={{ margin: '0 0 4px', color: 'var(--amber-soft)' }}>一、排布生成</h4>
              录入小区、楼栋数、每栋层数与每层户数，选管径与表箱规格，再给定街区进深、层高与退距规则。系统按
              <b>「同一种子 + 同一组参数 → 完全一致的排布」</b>
              生成沿街立面与立管走向：每栋按每层户数拆成若干立管组（单管 2~4 户），表箱按户均 1~2 户分配（单箱容量由规格决定），
              种子只影响区段宽度、支管偏移与余数分组，因此可复现、可归档。
            </section>
            <section>
              <h4 style={{ margin: '0 0 4px', color: 'var(--amber-soft)' }}>二、手工标记</h4>
              师傅可以单独拖动某个表箱（立面视图调横向位置与标高，俯视视图调进深），或拖动立管段改变该段高度。改过的对象会打上橙色手工标记并写入工单。
              之后调整参数重新生成时，<b>手工标记的位置保持不动，其余部分重算</b>；若参数变化导致某个已标记对象不存在（例如层数减少），会提示标记失效并在保存时忽略。
            </section>
            <section>
              <h4 style={{ margin: '0 0 4px', color: 'var(--amber-soft)' }}>三、状态流转</h4>
              待派 → 施工中 → 待质检 → 已通过 / 退回整改 → 施工中（返工）。每次流转记录操作人、角色与时间，可在工单内查看操作记录。
              已通过工单锁定；待质检期间排布只读。
            </section>
            <section>
              <h4 style={{ margin: '0 0 4px', color: 'var(--amber-soft)' }}>四、质检抽查</h4>
              按提交批次序号等距抽取，<b>序号 % 5 == 0 必检</b>，长期稳定为 20%；返工单 100% 复检。未抽中订单自动通过并留痕。
              不合格需勾选整改项退回，返工次数累计到工单。
            </section>
            <section>
              <h4 style={{ margin: '0 0 4px', color: 'var(--amber-soft)' }}>五、看板</h4>
              按人统计完工量、返工率、超期单，并提供工单明细与超期预警；返工率按「含返工工单数 / 分派工单数」计算。
            </section>
            <section style={{ color: 'var(--text-2)' }}>
              数据仅保存在当前浏览器，重置数据可恢复演示样例。渲染采用 WebGPU；不可用时会降级提示，排布计算与流程不受影响。
              最后访问 {fmtDateTime(Date.now())}。
            </section>
          </div>
        </Modal>
      )}
    </div>
  );
}
