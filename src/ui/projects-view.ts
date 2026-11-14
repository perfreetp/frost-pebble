import { BaseElement, toast } from './base';
import { store, navigate } from './context';
import type { CropKind, Project, ProjectStatus } from '../core/types';
import { STATUS_ORDER } from '../core/types';
import { CROPS } from '../core/types';
import { daysUntil, escapeHtml, fmtDate, isOverdue, relativeTime } from '../core/util';

const css = /* css */ `
  :host { display: flex; flex-direction: column; height: 100%; min-height: 0; overflow: hidden; }
  .top { padding: 18px 22px 12px; display: flex; align-items: flex-end; gap: 22px; flex-wrap: wrap; }
  .heading h1 { margin: 0; font-size: 19px; font-weight: 650; letter-spacing: .5px; color: #f1ead9; }
  .heading p { margin: 5px 0 0; font-size: 11.5px; color: var(--text-faint); letter-spacing: .3px; }
  .stats { display: flex; gap: 8px; flex-wrap: wrap; }
  .stat {
    min-width: 108px; padding: 8px 12px; border-radius: 10px; background: var(--panel);
    border: 1px solid var(--line-soft); display: flex; flex-direction: column; gap: 3px;
  }
  .stat .v { font-family: var(--mono); font-size: 18px; font-weight: 600; line-height: 1; color: #e9e3d3; }
  .stat .k { font-size: 10px; letter-spacing: .8px; color: var(--text-faint); display: flex; align-items: center; gap: 5px; }
  .stat .k .dot { width: 5px; height: 5px; }
  .spacer { flex: 1; }
  .actions { display: flex; gap: 8px; align-items: center; }
  .filter-bar { display: flex; align-items: center; gap: 8px; padding: 0 22px 12px; flex-wrap: wrap; }
  .status-tab {
    height: 27px; padding: 0 11px; border-radius: 999px; border: 1px solid var(--line);
    background: var(--panel-2); color: var(--text-dim); font-size: 11.5px; display: flex; align-items: center; gap: 6px;
  }
  .status-tab.on { background: #2b3a2f; border-color: #48604e; color: #e4efdf; }
  .status-tab .n { font-family: var(--mono); font-size: 10px; opacity: .75; }
  .search { position: relative; width: 220px; }
  .search input { padding-left: 28px; height: 28px; background: #0d1410; }
  .search .ico { position: absolute; left: 9px; top: 7px; color: #6d8071; font-size: 11px; }
  .content { flex: 1; overflow: auto; padding: 4px 22px 30px; }
  .board { display: grid; grid-template-columns: repeat(auto-fill, minmax(288px, 1fr)); gap: 12px; align-items: start; }
  .group {
    display: flex; gap: 14px; padding: 14px 0 14px; border-top: 1px solid rgba(43,59,48,.5);
    align-items: flex-start;
  }
  .group:first-child { border-top: none; }
  .group-rail {
    width: 132px; flex: 0 0 132px; display: flex; flex-direction: column; gap: 7px; padding-top: 3px;
    position: sticky; top: 0;
  }
  .group-head { display: flex; align-items: center; gap: 8px; }
  .group-head .crop-badge {
    min-width: 40px; height: 26px; padding: 0 9px; border-radius: 8px; display: grid; place-items: center;
    font-size: 12.5px; font-weight: 600; letter-spacing: 1.5px;
  }
  .group-head .count { font-size: 10.5px; color: var(--text-faint); font-family: var(--mono); }
  .group-meta { display: flex; flex-direction: column; gap: 3px; font-size: 10px; color: var(--text-faint); line-height: 1.5; }
  .group-meta b { color: #a9bcaa; font-weight: 500; font-family: var(--mono); font-size: 10px; }
  .group-meta .overdue-n { color: #f0968a; }
  .grid { flex: 1; min-width: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(288px, 1fr)); gap: 12px; align-items: start; }
  .card {
    position: relative; border-radius: 13px; border: 1px solid var(--line-soft); background:
      linear-gradient(155deg, rgba(255,255,255,.028), transparent 46%), var(--panel);
    padding: 13px 14px 12px; display: flex; flex-direction: column; gap: 10px;
    transition: border-color .16s, transform .16s, box-shadow .16s; cursor: pointer; overflow: hidden;
  }
  .card:hover { transform: translateY(-2px); border-color: #41574a; box-shadow: 0 14px 34px rgba(0,0,0,.32); }
  .card.current { border-color: #7a6330; box-shadow: 0 0 0 1px rgba(233,183,80,.25), 0 10px 26px rgba(0,0,0,.3); }
  .card.overdue::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
    background: linear-gradient(180deg, #e07464, #7d2f26);
  }
  .card-top { display: flex; align-items: flex-start; gap: 10px; }
  .thumb {
    width: 46px; height: 46px; border-radius: 10px; flex: 0 0 auto; border: 1px solid #33463a;
    background: radial-gradient(circle at 50% 30%, #2a3a2c, #16201a); display: grid; place-items: center;
    font-size: 20px; color: #c3d6b8; overflow: hidden;
  }
  .thumb img { width: 100%; height: 100%; object-fit: cover; }
  .card-title { flex: 1; min-width: 0; }
  .card-title .t { font-size: 12.5px; font-weight: 600; color: #e7efe3; line-height: 1.35; }
  .card-title .sub { font-size: 10.5px; color: var(--text-faint); margin-top: 3px; display: flex; gap: 6px; align-items: center; }
  .status-pill { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; height: 19px; padding: 0 8px; border-radius: 999px; border: 1px solid; white-space: nowrap; }
  .card-meta { display: flex; align-items: center; gap: 10px; font-size: 10.5px; color: var(--text-dim); flex-wrap: wrap; }
  .meta-item { display: flex; align-items: center; gap: 4px; }
  .meta-item.due { font-family: var(--mono); }
  .meta-item.due.warn { color: #f0968a; font-weight: 600; }
  .meta-item.due.near { color: #eac97c; }
  .progress { display: flex; align-items: center; gap: 7px; }
  .bar { flex: 1; height: 4px; border-radius: 3px; background: #1b2620; overflow: hidden; }
  .bar > i { display: block; height: 100%; border-radius: 3px; }
  .card-foot { display: flex; align-items: center; gap: 6px; padding-top: 2px; }
  .vbadge {
    font-family: var(--mono); font-size: 10.5px; color: #e6cd92; background: #2b2415;
    border: 1px solid #4a3c20; border-radius: 5px; padding: 1px 6px;
  }
  .ann-badge { font-size: 10px; color: #f2b7a9; display: flex; align-items: center; gap: 4px; }
  .ann-badge.ok { color: #9fc9a6; }
  .card-foot .spacer { flex: 1; }
  .card-foot .mini { height: 22px; padding: 0 8px; font-size: 10px; }
  .empty-all { padding: 60px 20px; text-align: center; color: var(--text-faint); }
  .overdue-chip { position: absolute; top: 11px; right: 11px; font-size: 9.5px; color: #ffb4a6; letter-spacing: .5px; display: flex; align-items: center; gap: 3px; }
  .legend { display: flex; gap: 12px; font-size: 10px; color: var(--text-faint); padding: 0 22px 10px; }
  .legend i { display: inline-block; width: 8px; height: 8px; border-radius: 2px; margin-right: 4px; vertical-align: middle; }

  .new-modal .modal { width: 470px; }
`;

const STATUS_STYLE: Record<ProjectStatus, { color: string; bg: string; border: string; dot: string }> = {
  '制作中': { color: '#f0cd84', bg: '#2a2416', border: '#5d4a24', dot: '#e9b750' },
  '待审核': { color: '#a8cdea', bg: '#182430', border: '#2f4759', dot: '#6fa8d6' },
  '退回': { color: '#f2a99c', bg: '#2b1c19', border: '#5a3733', dot: '#e07464' },
  '已采用': { color: '#9fda9f', bg: '#1a2a20', border: '#35543c', dot: '#73c17a' },
};

const CROP_TINT: Record<CropKind, string> = {
  '水稻': '#7cb469', '小麦': '#dcb464', '玉米': '#e9c05a', '大豆': '#9dc36a', '高粱': '#c2704f',
};

export class ProjectsView extends BaseElement {
  private statusFilter: ProjectStatus | '全部' = '全部';
  private cropFilter: CropKind | '全部' = '全部';
  private query = '';
  private unsubscribe: (() => void) | null = null;

  protected init() {
    this.unsubscribe = store.subscribe(() => this.paint());
    this.paint();
  }

  protected onDisconnect() {
    this.unsubscribe?.();
  }

  refresh() {
    this.paint();
  }

  private filtered(): Project[] {
    const q = this.query.trim().toLowerCase();
    return store.state.projects.filter((p) => {
      if (this.statusFilter !== '全部' && p.status !== this.statusFilter) return false;
      if (this.cropFilter !== '全部' && p.crop !== this.cropFilter) return false;
      if (q && !(`${p.title} ${p.crop} 第${p.episode}集 ${p.episode}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }

  private paint() {
    const projects = this.filtered();
    const counts = store.statusCounts();
    const overdue = store.state.projects.filter((p) => isOverdue(p.deliveryDate, p.status));
    const pendingAnns = store.state.projects.reduce((n, p) => n + p.annotations.filter((a) => a.status === 'pending').length, 0);
    const active = store.state.projects.filter((p) => p.status !== '已采用').length;

    const groups = CROPS.filter((c) => projects.some((p) => p.crop === c)).map((crop) => {
      const list = projects.filter((p) => p.crop === crop).sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate));
      const overdues = list.filter((p) => isOverdue(p.deliveryDate, p.status)).length;
      const pendingN = list.reduce((n, p) => n + p.annotations.filter((a) => a.status === 'pending').length, 0);
      return `<section class="group">
        <div class="group-rail">
          <div class="group-head">
            <span class="crop-badge" style="background:${CROP_TINT[crop]}22;color:${CROP_TINT[crop]};border:1px solid ${CROP_TINT[crop]}55">${crop}</span>
            <span class="count">${list.length} 集</span>
          </div>
          <div class="group-meta">
            <span>最近交付 <b>${list.map((p) => p.deliveryDate).sort()[list.length - 1]}</b></span>
            ${overdues ? `<span class="overdue-n">⚠ ${overdues} 集超期</span>` : '<span>进度正常</span>'}
            ${pendingN ? `<span>✎ ${pendingN} 条待处理</span>` : ''}
          </div>
        </div>
        <div class="grid">${list.map((p) => this.cardHtml(p)).join('')}</div>
      </section>`;
    }).join('');

    this.render(`
      <div class="top">
        <div class="heading">
          <h1>项目总览</h1>
          <p>按作物 / 集数 / 交付日期编排 · 状态流转全程留痕</p>
        </div>
        <div class="stats">
          <div class="stat"><div class="v">${active}</div><div class="k"><span class="dot" style="color:#7cb469"></span>在制项目</div></div>
          <div class="stat"><div class="v" style="color:#a8cdea">${counts['待审核']}</div><div class="k"><span class="dot" style="color:#6fa8d6"></span>待审核</div></div>
          <div class="stat"><div class="v" style="color:#f2a99c">${counts['退回']}</div><div class="k"><span class="dot" style="color:#e07464"></span>退回修改</div></div>
          <div class="stat"><div class="v" style="color:#f0968a">${overdue.length}</div><div class="k"><span class="dot" style="color:#f0968a"></span>超期</div></div>
          <div class="stat"><div class="v" style="color:#f0cd84">${pendingAnns}</div><div class="k"><span class="dot" style="color:#e9b750"></span>待处理批注</div></div>
        </div>
        <div class="spacer"></div>
        <div class="actions">
          <div class="search"><span class="ico">⌕</span><input class="input" id="q" placeholder="搜标题 / 集数 / 作物" value="${escapeHtml(this.query)}"></div>
          <button class="btn primary" id="new-project">＋ 新建项目</button>
        </div>
      </div>
      <div class="filter-bar">
        ${(['全部', ...STATUS_ORDER] as const).map((s) => `
          <button class="status-tab ${this.statusFilter === s ? 'on' : ''}" data-status="${s}">
            ${s === '全部' ? '全部' : `<span class="dot" style="color:${STATUS_STYLE[s].dot}"></span>${s}`}
            <span class="n">${s === '全部' ? store.state.projects.length : counts[s]}</span>
          </button>`).join('')}
        <span style="width:1px;height:16px;background:var(--line);margin:0 4px"></span>
        ${(['全部', ...CROPS] as const).map((c) => `
          <button class="status-tab ${this.cropFilter === c ? 'on' : ''}" data-crop="${c}">${c}</button>`).join('')}
      </div>
      <div class="content">
        ${projects.length ? groups : `<div class="empty-all">没有符合条件的项目<br><span class="small">试试清除筛选，或新建一个作物项目</span></div>`}
      </div>
      <div class="legend">
        <span><i style="background:#e07464"></i>左侧红条 = 已超交付日期</span>
        <span><i style="background:#6fa8d6"></i>待审核 = 等待农技员签字</span>
        <span><i style="background:#e9b750"></i>待处理批注会阻止定稿</span>
      </div>`, css);

    this.bind();
  }

  private cardHtml(p: Project): string {
    const st = STATUS_STYLE[p.status];
    const overdue = isOverdue(p.deliveryDate, p.status);
    const due = daysUntil(p.deliveryDate);
    const dueCls = overdue ? 'warn' : due <= 2 ? 'near' : '';
    const pending = p.annotations.filter((a) => a.status === 'pending').length;
    const latest = p.versions[p.versions.length - 1];
    const cropColor = CROP_TINT[p.crop];
    const progress = p.versions.length ? Math.min(1, p.versions.length / 4) : 0.12;
    const current = p.id === store.state.currentProjectId;
    return `
      <article class="card ${overdue ? 'overdue' : ''} ${current ? 'current' : ''}" data-project="${p.id}">
        <div class="card-top">
          <div class="thumb"><span style="color:${cropColor}">禾</span></div>
          <div class="card-title">
            <div class="t">${escapeHtml(p.title)}</div>
            <div class="sub"><span>第 ${p.episode} 集</span><span>·</span><span>${p.crop}</span></div>
          </div>
          <span class="status-pill" style="color:${st.color};background:${st.bg};border-color:${st.border}">
            <span class="dot" style="color:${st.dot}"></span>${p.status}
          </span>
        </div>
        <div class="card-meta">
          <span class="meta-item due ${dueCls}">📅 交付 ${p.deliveryDate}${overdue ? ' · 已超期' : due <= 2 ? ` · ${due === 0 ? '今天截止' : `剩 ${due} 天`}` : ''}</span>
          <span class="meta-item">🕒 ${relativeTime(p.updatedAt)}</span>
        </div>
        <div class="progress">
          <div class="bar"><i style="width:${progress * 100}%;background:linear-gradient(90deg,${cropColor},${st.dot})"></i></div>
          <span class="faint" style="font-size:10px">${p.versions.length} 版</span>
        </div>
        <div class="card-foot">
          <span class="vbadge">${latest ? `v${latest.number}` : 'v0 · 未提交'}</span>
          ${pending ? `<span class="ann-badge">✎ ${pending} 条待处理</span>` : p.annotations.length ? '<span class="ann-badge ok">✓ 批注已清</span>' : '<span class="ann-badge ok" style="opacity:.55">尚无批注</span>'}
          <span class="spacer"></span>
          <button class="btn mini ghost" data-open="${p.id}">打开工作台</button>
        </div>
      </article>`;
  }

  private bind() {
    this.shadow.querySelectorAll<HTMLElement>('.card').forEach((card) => {
      card.addEventListener('click', (e) => {
        const id = card.dataset.project!;
        if ((e.target as HTMLElement).closest('[data-open]')) {
          store.selectProject(id);
          navigate(store.state.role === 'animator' ? 'animate' : 'review', id);
        } else {
          store.selectProject(id);
          this.paint();
        }
      });
      card.addEventListener('dblclick', () => {
        store.selectProject(card.dataset.project!);
        navigate('animate', card.dataset.project!);
      });
    });
    this.shadow.querySelectorAll<HTMLElement>('[data-status]').forEach((b) => {
      b.addEventListener('click', () => {
        this.statusFilter = b.dataset.status as ProjectStatus | '全部';
        this.paint();
      });
    });
    this.shadow.querySelectorAll<HTMLElement>('[data-crop]').forEach((b) => {
      b.addEventListener('click', () => {
        this.cropFilter = b.dataset.crop as CropKind | '全部';
        this.paint();
      });
    });
    const q = this.shadow.getElementById('q') as HTMLInputElement | null;
    q?.addEventListener('input', () => {
      this.query = q.value;
      const content = this.shadow.querySelector('.content');
      if (content) {
        const caret = content.scrollTop;
        this.paint();
        this.shadow.getElementById('q')?.focus();
        (this.shadow.querySelector('.content') as HTMLElement).scrollTop = caret;
      }
    });
    this.shadow.getElementById('new-project')?.addEventListener('click', () => this.openNewProject());
    this.shadow.querySelectorAll<HTMLElement>('[data-open]').forEach((b) => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = b.dataset.open!;
        store.selectProject(id);
        navigate(store.state.role === 'animator' ? 'animate' : 'review', id);
      });
    });
  }

  private openNewProject() {
    const today = new Date();
    const plus = (n: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + n);
      return fmtDate(d.getTime());
    };
    const back = document.createElement('div');
    back.className = 'modal-backdrop new-modal';
    back.innerHTML = `
      <style>${css}</style>
      <div class="modal" style="width:460px">
        <div class="modal-head">新建作物角色项目</div>
        <div class="modal-body">
          <div class="row" style="gap:10px">
            <div class="field grow"><label>作物</label><select class="select" id="np-crop">${CROPS.map((c) => `<option>${c}</option>`).join('')}</select></div>
            <div class="field" style="width:110px"><label>集数</label><input class="input mono" id="np-ep" type="number" min="1" value="1"></div>
          </div>
          <div class="field"><label>标题</label><input class="input" id="np-title" placeholder="例：第一集 · 破土"></div>
          <div class="field"><label>交付日期</label><input class="input" id="np-date" type="date" value="${plus(14)}"></div>
          <div class="faint small" style="line-height:1.6">创建后会自动生成头部 / 躯干 / 叶片 / 穗 / 根须 五个零件，可直接在画布上搭骨架。</div>
        </div>
        <div class="modal-foot"><button class="btn" data-x>取消</button><button class="btn primary" data-ok>创建项目</button></div>
      </div>`;
    document.body.appendChild(back);
    const close = () => back.remove();
    back.querySelector('[data-x]')!.addEventListener('click', close);
    back.addEventListener('click', (e) => { if (e.target === back) close(); });
    back.querySelector('[data-ok]')!.addEventListener('click', () => {
      const crop = (back.querySelector('#np-crop') as HTMLSelectElement).value as CropKind;
      const episode = Number((back.querySelector('#np-ep') as HTMLInputElement).value) || 1;
      const title = (back.querySelector('#np-title') as HTMLInputElement).value.trim() || `第 ${episode} 集 · 新角色`;
      const date = (back.querySelector('#np-date') as HTMLInputElement).value || plus(14);
      const p = store.addProject({ crop, episode, title, deliveryDate: date });
      close();
      toast(`已创建「${title}」`, 'ok');
      store.selectProject(p.id);
      navigate('animate', p.id);
    });
  }
}

customElements.define('farm-projects', ProjectsView);

