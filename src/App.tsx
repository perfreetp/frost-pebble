import { For, Show, createSignal, onMount } from 'solid-js';
import { boot, currentPerson, dismissToast, setActiveItem, state, setRole, toast } from './lib/store';
import { BoardView } from './views/BoardView';
import { StudioView } from './views/StudioView';
import { ReviewView } from './views/ReviewView';
import { DeliverView } from './views/DeliverView';
import { NewItemModal, NewProjectModal } from './components/Modals';
import {
  IconCheck,
  IconBoard,
  IconInfo,
  IconPackage,
  IconScissors,
  IconX,
} from './components/icons';
import type { Role } from './lib/types';

type Tab = 'board' | 'studio' | 'review' | 'deliver';

export function App() {
  const [tab, setTab] = createSignal<Tab>('board');
  const [newProject, setNewProject] = createSignal(false);
  const [newItemProject, setNewItemProject] = createSignal<string | null>(null);

  onMount(() => {
    void boot();
    const hash = window.location.hash.replace('#', '') as Tab;
    if (hash === 'review' || hash === 'deliver' || hash === 'board') setTab(hash);
  });

  const person = () => currentPerson();
  const reviewing = () => state.items.filter((i) => i.status === 'review').length;
  const openItem = (id: string) => {
    setActiveItem(id);
    setTab('studio');
  };

  const canTab = (t: Tab) => {
    if (t === 'studio') return person().role !== 'supervisor' && person().role !== 'client';
    if (t === 'review') return person().role === 'supervisor';
    if (t === 'deliver') return person().role !== 'supervisor';
    return true;
  };

  const switchRole = (role: Role) => {
    setRole(role);
    if (role === 'supervisor') setTab('review');
    else if (role === 'producer') setTab('board');
    else setTab('board');
  };

  return (
    <div class="app">
      <div class="topbar">
        <div class="brand">
          <div class="brand-mark" />
          <div>
            <div class="brand-name">像素工坊</div>
            <div class="brand-sub">Cutout Studio</div>
          </div>
        </div>

        <div class="nav">
          <button class={`nav-btn ${tab() === 'board' ? 'on' : ''}`} onClick={() => setTab('board')}>
            <IconBoard size={15} /> 看板
            <span class="count">{state.projects.length}</span>
          </button>
          <button
            class={`nav-btn ${tab() === 'studio' ? 'on' : ''}`}
            disabled={!canTab('studio')}
            style={!canTab('studio') ? { opacity: 0.45, 'cursor': 'not-allowed' } : {}}
            onClick={() => {
              if (!canTab('studio')) {
                toast('warn', '当前身份无法进入制作台', '请切换到「制作员」身份。');
                return;
              }
              const first = state.items.find((i) => i.status === 'doing' || i.status === 'rework' || i.status === 'todo');
              if (state.activeItemId || first) {
                if (!state.activeItemId && first) setActiveItem(first.id);
                setTab('studio');
              } else {
                toast('info', '项目部里还没有条目', '先新建条目再进入制作台。');
              }
            }}
          >
            <IconScissors size={15} /> 制作台
          </button>
          <button class={`nav-btn ${tab() === 'review' ? 'on' : ''}`} onClick={() => setTab('review')}>
            <IconCheck size={15} /> 审核台
            <span class="count">{reviewing()}</span>
          </button>
          <button class={`nav-btn ${tab() === 'deliver' ? 'on' : ''}`} onClick={() => setTab('deliver')}>
            <IconPackage size={15} /> 交付
          </button>
        </div>

        <div class="topbar-spacer" />

        <div class="role-switch">
          <For each={state.people}>
            {(p) => (
              <button class={state.role === p.role ? 'on' : ''} onClick={() => switchRole(p.role)}>
                <span class="role-dot" style={{ background: p.color }} />
                {p.role === 'client' ? '客户' : p.role === 'producer' ? '制作员' : '主管'}
              </button>
            )}
          </For>
        </div>

        <div style={{ width: '1px', height: '26px', background: 'var(--line-soft)' }} />
        <span class="avatar" style={{ background: person().color }}>{person().name.slice(0, 1)}</span>
        <div class="who">
          <b>{person().name}</b>
          <span>{person().org} · {person().title}</span>
        </div>
      </div>

      <div class="main">
        <Show when={state.ready} fallback={<Boot />}>
          <Show when={tab() === 'board'}>
            <BoardView
              onOpenItem={openItem}
              onNewProject={() => setNewProject(true)}
              onNewItem={(pid) => setNewItemProject(pid)}
            />
          </Show>
          <Show when={tab() === 'studio'}>
            <Show
              when={state.items.find((i) => i.id === state.activeItemId)}
              fallback={
                <div class="board-scroll" style={{ display: 'grid', 'place-items': 'center' }}>
                  <div class="empty-col" style={{ 'font-size': '13px' }}>
                    还没有打开条目
                    <div style={{ 'margin-top': '10px' }}>
                      <button class="btn primary sm" onClick={() => setTab('board')}>回看板选一个条目</button>
                    </div>
                  </div>
                </div>
              }
            >
              {(item) => <StudioView item={item()} onBack={() => setTab('board')} />}
            </Show>
          </Show>
          <Show when={tab() === 'review'}>
            <ReviewView onOpenItem={openItem} />
          </Show>
          <Show when={tab() === 'deliver'}>
            <DeliverView />
          </Show>
        </Show>
      </div>

      <div class="toasts">
        <For each={state.toasts}>
          {(t) => (
            <div class={`toast ${t.kind}`}>
              <span class="t-icon">
                <Show when={t.kind === 'ok'} fallback={<Show when={t.kind === 'error' || t.kind === 'warn'} fallback={<IconInfo size={15} />}><IconX size={15} /></Show>}>
                  <IconCheck size={15} />
                </Show>
              </span>
              <div class="t-body">
                <div class="t-title">{t.text}</div>
                <Show when={t.detail}>
                  <div class="t-detail">{t.detail}</div>
                </Show>
              </div>
              <button class="btn ghost sm icon" style={{ 'align-self': 'flex-start', 'margin-top': '-4px' }} onClick={() => dismissToast(t.id)}>
                ✕
              </button>
            </div>
          )}
        </For>
      </div>

      <Show when={newProject()}>
        <NewProjectModal onClose={() => setNewProject(false)} />
      </Show>
      <Show when={newItemProject()}>
        <NewItemModal
          projectId={newItemProject()!}
          onClose={() => setNewItemProject(null)}
          onCreated={(id) => {
            setActiveItem(id);
            setTab('studio');
          }}
        />
      </Show>
    </div>
  );
}

function Boot() {
  return (
    <div class="boot-screen">
      <div class="boot-inner">
        <div class="brand-mark" />
        <div class="boot-title">像素工坊 · 抠图合成工作台</div>
        <div class="boot-sub">
          <span class="spin" style={{ display: 'inline-block', 'vertical-align': '-3px', 'margin-right': '7px' }} />
          {state.seeding ? '正在生成演示素材：实拍图、背景库与项目数据…' : '正在载入工作区…'}
        </div>
      </div>
    </div>
  );
}
