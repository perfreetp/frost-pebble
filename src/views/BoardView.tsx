import { For, Show, createMemo, createSignal } from 'solid-js';
import type { ItemStatus } from '../lib/types';
import { STATUS_META, STATUS_ORDER } from '../lib/types';
import { currentPerson, itemsOfProject, projectById, projectProgress, setActiveItem, setActiveProject, state } from '../lib/store';
import { formatDay, remainingLabel } from '../lib/color';
import { IconClock, IconFolder, IconPlus, IconRework } from '../components/icons';

export function BoardView(p: { onOpenItem: (id: string) => void; onNewProject: () => void; onNewItem: (projectId: string) => void }) {
  const project = () => (state.activeProjectId ? projectById(state.activeProjectId) : undefined);
  const items = createMemo(() => (state.activeProjectId ? itemsOfProject(state.activeProjectId) : []));
  const progress = createMemo(() => (state.activeProjectId ? projectProgress(state.activeProjectId) : null));
  const [now] = createSignal(Date.now());

  return (
    <div class="board-scroll">
      <div class="board-head">
        <div>
          <h1 class="board-title">定制项目看板</h1>
          <div class="board-sub">
            共 {state.projects.length} 个在制项目 · {state.items.length} 个条目 · 当前身份 {currentPerson().title}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <Show when={currentPerson().role === 'client'}>
          <button class="btn primary" onClick={p.onNewProject}>
            <IconPlus size={14} /> 新建项目
          </button>
        </Show>
      </div>

      <div class="projects-strip">
        <For each={state.projects}>
          {(proj) => {
            const prog = () => projectProgress(proj.id);
            const total = () => Math.max(1, prog().total);
            const rem = () => remainingLabel(proj.dueAt, now());
            return (
              <div
                class={`project-card ${state.activeProjectId === proj.id ? 'on' : ''}`}
                onClick={() => setActiveProject(proj.id)}
              >
                <div class="pc-top">
                  <span class="pc-code">{proj.code}</span>
                  <span class={`chip ${rem().urgency === 'over' ? 'red' : rem().urgency === 'urgent' ? 'amber' : 'slate'}`}>
                    {rem().text}
                  </span>
                </div>
                <div class="pc-model">{proj.model}</div>
                <div class="pc-scene">
                  {proj.scenario} · 交付 {proj.deliverableCount} 张
                </div>
                <div class="pc-meta">
                  <span class="muted">{formatDay(proj.createdAt)} 下单</span>
                  <span class="mono" style={{ color: prog().approved === prog().total ? '#6ed7a6' : 'var(--text-2)' }}>
                    {prog().approved}/{prog().total}
                  </span>
                </div>
                <div class="progress">
                  <i class="p-approved" style={{ width: `${(prog().approved / total()) * 100}%` }} />
                  <i class="p-review" style={{ width: `${(prog().review / total()) * 100}%` }} />
                  <i class="p-rework" style={{ width: `${(prog().rework / total()) * 100}%` }} />
                  <i class="p-doing" style={{ width: `${(prog().doing / total()) * 100}%` }} />
                </div>
              </div>
            );
          }}
        </For>
      </div>

      <Show when={project()}>
        {(proj) => (
          <>
            <div class="stats-row">
              <div class="stat">
                <div class="k">交付张数</div>
                <div class="v">{progress()!.total}</div>
                <div class="sub">合同要求 {proj().deliverableCount} 张</div>
              </div>
              <div class="stat">
                <div class="k">已通过</div>
                <div class="v" style={{ color: '#6ed7a6' }}>{progress()!.approved}</div>
                <div class="sub">{progress()!.review} 张在审 · {progress()!.rework} 张返工</div>
              </div>
              <div class="stat">
                <div class="k">返工累计</div>
                <div class="v" style={{ color: '#e8955a' }}>
                  {items().reduce((s, i) => s + i.reworkCount, 0)}
                </div>
                <div class="sub">按条目累计，计入交付质检</div>
              </div>
              <div class="stat">
                <div class="k">交期</div>
                <div class="v" style={{ 'font-size': '19px', color: remainingLabel(proj().dueAt, now()).urgency === 'over' ? '#f0908f' : 'var(--text)' }}>
                  {formatDay(proj().dueAt)}
                </div>
                <div class="sub">
                  <IconClock size={10} style={{ display: 'inline', 'vertical-align': '-1px' }} /> {remainingLabel(proj().dueAt, now()).text}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', 'align-items': 'center', gap: '10px', 'margin-bottom': '12px' }}>
              <div class="section-title" style={{ 'font-size': '11px' }}>
                <IconFolder size={13} /> {proj().code} 条目流程
                <span class="rule" style={{ width: '40px' }} />
              </div>
              <div class="muted" style={{ 'font-size': '11.5px' }}>{proj().notes}</div>
              <div style={{ flex: 1 }} />
              <Show when={currentPerson().role !== 'supervisor'}>
                <button class="btn sm" onClick={() => p.onNewItem(proj().id)}>
                  <IconPlus size={13} /> 新建条目
                </button>
              </Show>
            </div>

            <div class="kanban">
              <For each={STATUS_ORDER}>
                {(status) => (
                  <KanbanColumn status={status} items={items().filter((i) => i.status === status)} now={now()} onOpen={p.onOpenItem} projectId={proj().id} onNew={p.onNewItem} />
                )}
              </For>
            </div>
          </>
        )}
      </Show>
    </div>
  );
}

function KanbanColumn(p: {
  status: ItemStatus;
  items: import('../lib/types').Item[];
  now: number;
  projectId: string;
  onOpen: (id: string) => void;
  onNew: (projectId: string) => void;
}) {
  const meta = () => STATUS_META[p.status];
  const toneColor: Record<string, string> = {
    slate: '#5a6675',
    blue: '#4d86d4',
    amber: '#d9a441',
    red: '#e2605f',
    green: '#4fbf87',
  };
  return (
    <div class="column">
      <div class="col-head">
        <span class="bar" style={{ background: toneColor[meta().tone] }} />
        <span class="col-name">{meta().label}</span>
        <span class="col-count">{p.items.length}</span>
      </div>
      <div class="col-body">
        <For each={p.items}>
          {(item) => <ItemCard item={item} now={p.now} onOpen={() => p.onOpen(item.id)} />}
        </For>
        <Show when={p.status === 'todo'}>
          <div class="new-item-tile" onClick={() => p.onNew(p.projectId)}>
            <IconPlus size={13} /> 新建条目
          </div>
        </Show>
        <Show when={p.items.length === 0 && p.status !== 'todo'}>
          <div class="empty-col">暂无</div>
        </Show>
      </div>
    </div>
  );
}

function ItemCard(p: { item: import('../lib/types').Item; now: number; onOpen: () => void }) {
  const rem = () => remainingLabel(p.item.updatedAt + 86400000 * 2, p.now);
  return (
    <div class="item-card" onClick={() => p.onOpen()}>
      <div class="ic-thumb" style={{ 'background-image': `url(${p.item.proof || p.item.thumb})` }}>
        <span class="ic-idx">#{String(p.item.index).padStart(2, '0')}</span>
      </div>
      <div class="ic-title">{p.item.title}</div>
      <div class="ic-foot">
        <span class="owner-pill" title={p.item.ownerName}>
          <span class="avatar" style={{ background: '#2fb3a1', color: '#06231f' }}>
            {p.item.ownerName.slice(-2)}
          </span>
          {p.item.ownerName}
        </span>
        <span class={`rework-pill ${p.item.reworkCount === 0 ? 'zero' : ''}`} title="返工次数">
          <IconRework size={11} /> {p.item.reworkCount}
        </span>
      </div>
    </div>
  );
}
