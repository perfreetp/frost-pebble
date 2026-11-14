import { createSignal, For, Show, type JSX } from 'solid-js';
import { state, setRole, setActiveBatch, dismissToast } from '../lib/store';
import { PAGE_TITLE, ROLE_LABEL, type Role } from '../lib/types';
import { Icon, type IconName } from './Icon';

export type PageKey =
  | 'dashboard' | 'batches' | 'photos' | 'workstation' | 'versions'
  | 'inspection' | 'reports' | 'archive' | 'guide';

interface NavDef {
  key: PageKey;
  label: string;
  icon: IconName;
  group: string;
  role: Role | 'all';
}

const NAV: NavDef[] = [
  { key: 'dashboard', label: '苗圃总览', icon: 'grid', group: '概览', role: 'all' },
  { key: 'batches', label: '批次建档', icon: 'file', group: '技术员', role: 'technician' },
  { key: 'photos', label: '样苗拍照', icon: 'camera', group: '技术员', role: 'technician' },
  { key: 'workstation', label: '加工台', icon: 'wand', group: '技术员', role: 'technician' },
  { key: 'versions', label: '版本比对', icon: 'layers', group: '技术员', role: 'technician' },
  { key: 'inspection', label: '抽检判定', icon: 'check', group: '质检', role: 'inspector' },
  { key: 'reports', label: '出圃报告', icon: 'report', group: '负责人', role: 'manager' },
  { key: 'archive', label: '档案检索', icon: 'archive', group: '负责人', role: 'all' },
  { key: 'guide', label: '作业规范', icon: 'book', group: '参考', role: 'all' },
];

const ROLE_TIP: Record<Role, string> = {
  technician: '建档 → 拍照 → 加工 → 存版本；加工台支持画笔补枝、擦除杂物。',
  inspector: '录入抽检地径与苗高，系统按区间与阈值判达标，不达标批注后不出圃。',
  manager: '按批次查看达标率、导出出圃报告，归档后多条件检索历史版本。',
};

export default function Shell(props: {
  page: PageKey;
  onNavigate: (p: PageKey) => void;
  children: JSX.Element;
}) {
  const [collapsedGroups] = createSignal<string[]>([]);

  const groups = () => {
    const out: { name: string; items: NavDef[] }[] = [];
    for (const n of NAV) {
      if (n.group === '概览' || n.group === '参考') {
        const g = out.find((x) => x.name === n.group);
        if (g) g.items.push(n);
        else out.push({ name: n.group, items: [n] });
        continue;
      }
      const roleName = n.group === '技术员' ? '技术员' : n.group === '质检' ? '质检' : '负责人';
      const g = out.find((x) => x.name === roleName);
      if (g) g.items.push(n);
      else out.push({ name: roleName, items: [n] });
    }
    return out;
  };

  const badgeFor = (key: PageKey): string | null => {
    if (key === 'batches') return String(state.batches.length);
    if (key === 'photos') return String(state.photos.length);
    if (key === 'versions') return String(state.versions.length);
    if (key === 'inspection') {
      const pending = state.batches.filter((b) => b.status === 'ready' || b.status === 'draft').length;
      return pending ? String(pending) : null;
    }
    if (key === 'archive') {
      const n = state.batches.filter((b) => b.status === 'archived').length;
      return n ? String(n) : null;
    }
    return null;
  };

  const active = () => state.batches.find((b) => b.id === state.activeBatchId);

  return (
    <div class="shell">
      <aside class="side">
        <div class="brand">
          <div class="brand-mark"><Icon name="leaf" size={22} /></div>
          <div>
            <h1>苗圃出圃档案</h1>
            <small>Dispatch Archive</small>
          </div>
        </div>

        <nav class="nav">
          <For each={groups()}>
            {(g) => (
              <>
                <Show when={!collapsedGroups().includes(g.name)}>
                  <div class="nav-group">{g.name}</div>
                  <For each={g.items}>
                    {(item) => (
                      <button
                        class="nav-item"
                        classList={{ active: props.page === item.key }}
                        onClick={() => props.onNavigate(item.key)}
                        title={
                          item.role === 'all' || item.role === state.role
                            ? PAGE_TITLE[item.key]
                            : `${PAGE_TITLE[item.key]}（当前角色为${ROLE_LABEL[state.role]}，可浏览）`
                        }
                      >
                        <span class="ico"><Icon name={item.icon} /></span>
                        <span>{item.label}</span>
                        <Show when={badgeFor(item.key)}>
                          <span class="badge">{badgeFor(item.key)}</span>
                        </Show>
                      </button>
                    )}
                  </For>
                </Show>
              </>
            )}
          </For>
        </nav>

        <div class="role-box">
          <label>当前角色</label>
          <div class="roles">
            <For each={['technician', 'inspector', 'manager'] as Role[]}>
              {(r) => (
                <button class="role-btn" classList={{ active: state.role === r }} onClick={() => setRole(r)}>
                  {r === 'technician' ? '技术员' : r === 'inspector' ? '质检员' : '负责人'}
                </button>
              )}
            </For>
          </div>
          <div class="role-note">{ROLE_TIP[state.role]}</div>
          <div class="storage-row" style={{ 'margin-top': '10px' }}>
            <span class="dot" classList={{ warn: state.storage !== 'idb' }} />
            {state.storage === 'idb' ? '本地档案库 · IndexedDB' : state.storage === 'local' ? '本地缓存 · localStorage' : '未持久化'}
          </div>
        </div>
      </aside>

      <main class="main">
        <header class="topbar">
          <h2>{PAGE_TITLE[props.page]}</h2>
          <span class="crumb">/ {ROLE_LABEL[state.role]}</span>
          <div class="spacer" />
          <Show when={active()}>
            <button
              class="batch-chip"
              onClick={() => props.onNavigate('batches')}
              title="当前批次 · 点击切换"
            >
              <span style={{ color: 'var(--ink-3)' }}>当前批次</span>
              <b>{active()!.code}</b>
              <span style={{ color: 'var(--ink-2)' }}>{active()!.variety}</span>
            </button>
          </Show>
          <select
            class="input"
            style={{ width: '190px', 'font-size': '12px', padding: '6px 9px' }}
            value={state.activeBatchId ?? ''}
            onChange={(e) => setActiveBatch(e.currentTarget.value || null)}
          >
            <option value="">— 选择批次 —</option>
            <For each={state.batches}>
              {(b) => <option value={b.id}>{b.code} · {b.variety}</option>}
            </For>
          </select>
        </header>
        <div class="page">{props.children}</div>
      </main>

      <div class="toast-wrap">
        <For each={state.toast}>
          {(t) => (
            <div class="toast" classList={{ [t.kind]: true }} onClick={() => dismissToast(t.id)}>
              <Icon name={t.kind === 'ok' ? 'check' : t.kind === 'warn' ? 'warn' : 'close'} size={15} />
              <span>{t.text}</span>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
