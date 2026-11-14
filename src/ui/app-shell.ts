import { BaseElement } from './base';
import { store, currentRoute, navigate, syncRouteProject, type ViewName } from './context';
import { APP_NAME } from './styles';
import { escapeHtml, isOverdue } from '../core/util';

const css = /* css */ `
  :host { display: flex; flex-direction: column; height: 100%; min-height: 0; }
  header {
    height: 54px; flex: 0 0 54px; display: flex; align-items: center; gap: 18px; padding: 0 16px;
    border-bottom: 1px solid var(--line-soft); background: linear-gradient(180deg, #131b16, #0f1612);
    position: relative; z-index: 30;
  }
  header::after {
    content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(233,183,80,.28), transparent);
  }
  .brand { display: flex; align-items: center; gap: 10px; user-select: none; }
  .logo {
    width: 30px; height: 30px; border-radius: 9px; display: grid; place-items: center;
    background: radial-gradient(circle at 35% 30%, #f4d488, #c38f2f);
    color: #201a08; box-shadow: 0 2px 10px rgba(233,183,80,.25), inset 0 0 0 1px rgba(255,255,255,.25);
    font-size: 15px; font-weight: 700;
  }
  .brand .names { display: flex; flex-direction: column; line-height: 1.15; }
  .brand .n1 { font-size: 14px; font-weight: 700; letter-spacing: 1px; color: #f0e6cf; }
  .brand .n2 { font-size: 9.5px; letter-spacing: 1.6px; color: #7c8f7e; text-transform: uppercase; }
  nav { display: flex; gap: 2px; margin-left: 6px; background: #0c120e; border: 1px solid var(--line-soft); border-radius: 10px; padding: 3px; }
  nav button {
    height: 28px; padding: 0 13px; border-radius: 7px; border: none; background: transparent;
    color: #93a595; font-size: 12px; display: flex; align-items: center; gap: 6px; letter-spacing: .3px;
    transition: background .14s, color .14s; position: relative;
  }
  nav button:hover { color: #dbe6d9; background: #18211a; }
  nav button.on { background: #25332a; color: #f0e4c8; box-shadow: inset 0 0 0 1px #3a4d3e; }
  nav button .ico { font-size: 12px; opacity: .85; }
  nav button .badge {
    min-width: 16px; height: 15px; border-radius: 8px; background: #6f2f27; color: #ffc9be;
    font-size: 9px; display: grid; place-items: center; padding: 0 4px; font-family: var(--mono);
  }
  nav button .badge.calm { background: #2a3c2e; color: #a9c4ac; }
  .spacer { flex: 1; }
  .ctx { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .ctx .lbl { font-size: 10px; color: var(--text-faint); letter-spacing: .6px; }
  select.project-select {
    height: 30px; max-width: 250px; background: #0d1410; border: 1px solid var(--line); border-radius: 8px;
    color: #dce7d9; padding: 0 26px 0 9px; font-size: 12px; outline: none;
    appearance: none;
    background-image: linear-gradient(45deg, transparent 50%, #8fa393 50%), linear-gradient(135deg, #8fa393 50%, transparent 50%);
    background-position: calc(100% - 13px) 13px, calc(100% - 8px) 13px;
    background-size: 5px 5px; background-repeat: no-repeat;
  }
  select.project-select:focus { border-color: #5d8a67; }
  .role {
    display: flex; align-items: center; gap: 0; background: #0c120e; border: 1px solid var(--line-soft);
    border-radius: 9px; padding: 3px; height: 34px;
  }
  .role button {
    height: 26px; padding: 0 11px; border: none; background: transparent; border-radius: 6px;
    color: #93a595; font-size: 11.5px; display: flex; align-items: center; gap: 5px;
  }
  .role button.on { background: #2c3e31; color: #e6f0e2; box-shadow: inset 0 0 0 1px #415a47; }
  .role button.on.reviewer { background: #2d3a49; color: #dbe9f7; box-shadow: inset 0 0 0 1px #40566a; }
  .who { display: flex; align-items: center; gap: 8px; padding-left: 4px; }
  .avatar {
    width: 27px; height: 27px; border-radius: 50%; display: grid; place-items: center;
    background: linear-gradient(140deg, #3d5a44, #26382c); color: #cfe3ce; font-size: 11px; font-weight: 600;
    border: 1px solid #46614c;
  }
  .who .meta { display: flex; flex-direction: column; line-height: 1.15; }
  .who .meta b { font-size: 11.5px; font-weight: 600; color: #dfe9dc; }
  .who .meta span { font-size: 9.5px; color: #7e917f; }
  main { flex: 1; min-height: 0; position: relative; display: flex; }
  .view { flex: 1; min-width: 0; min-height: 0; display: flex; animation: fadeUp .18s ease-out; }
  .status-strip { display: none; }
  .overdue-flag { font-size: 10px; color: #f0968a; }

  @media (max-width: 1180px) {
    nav button { padding: 0 9px; }
    nav button .txt { display: none; }
    select.project-select { max-width: 170px; }
  }
`;

const VIEW_META: Record<ViewName, { label: string; icon: string }> = {
  projects: { label: '项目总览', icon: '◫' },
  animate: { label: '动画工作台', icon: '✥' },
  review: { label: '农技审核', icon: '✎' },
  compare: { label: '版本比对', icon: '⇄' },
};

export class AppShell extends BaseElement {
  private route = currentRoute();
  private removeListener: (() => void) | null = null;

  protected onDisconnect() {
    this.removeListener?.();
  }

  protected init() {
    this.render(`<header>
      <div class="brand">
        <div class="logo">禾</div>
        <div class="names"><span class="n1">${APP_NAME}</span><span class="n2">Crop Rig Studio</span></div>
      </div>
      <nav>${this.navHtml()}</nav>
      <div class="spacer"></div>
      <div class="ctx">
        <span class="lbl">当前项目</span>
        <select class="project-select" id="project-select"></select>
      </div>
      <div class="role" id="role-switch">
        <button data-role="animator">✥ <span>动画师</span></button>
        <button data-role="reviewer">✎ <span>农技审核</span></button>
      </div>
      <div class="who">
        <div class="avatar" id="who-avatar">林</div>
        <div class="meta"><b id="who-name">林小满</b><span id="who-role">动画师</span></div>
      </div>
    </header>
    <main id="main"></main>`, css);

    window.addEventListener('hashchange', () => this.handleRoute());
    this.removeListener = store.subscribe(() => this.refreshChrome());
    this.shadow.querySelectorAll('nav button').forEach((b) => {
      b.addEventListener('click', () => navigate((b as HTMLElement).dataset.view as ViewName));
    });
    this.shadow.getElementById('project-select')?.addEventListener('change', (e) => {
      const id = (e.target as HTMLSelectElement).value;
      if (id) {
        store.selectProject(id);
        navigate(this.route.view, id);
        this.mountView();
      }
    });
    this.shadow.querySelectorAll('#role-switch [data-role]').forEach((b) => {
      b.addEventListener('click', () => {
        const role = (b as HTMLElement).dataset.role as 'animator' | 'reviewer';
        store.setRole(role);
        this.mountView();
      });
    });
    this.refreshChrome();
    this.handleRoute();
  }

  private navHtml(): string {
    const state = store.state;
    const pendingTotal = state.projects.reduce((n, p) => n + p.annotations.filter((a) => a.status === 'pending').length, 0);
    const reviewCount = state.projects.filter((p) => p.status === '待审核').length;
    return (Object.keys(VIEW_META) as ViewName[]).map((v) => `
      <button data-view="${v}">
        <span class="ico">${VIEW_META[v].icon}</span><span class="txt">${VIEW_META[v].label}</span>
        ${v === 'review' && reviewCount ? `<span class="badge">${reviewCount}</span>` : ''}
        ${v === 'projects' && pendingTotal ? `<span class="badge">${pendingTotal}</span>` : ''}
      </button>`).join('');
  }

  private refreshChrome() {
    const role = store.state.role;
    const nav = this.shadow.querySelector('nav');
    if (nav) nav.innerHTML = this.navHtml();
    this.shadow.querySelectorAll('nav button').forEach((b) => {
      b.addEventListener('click', () => navigate((b as HTMLElement).dataset.view as ViewName));
    });
    this.shadow.querySelectorAll('#role-switch [data-role]').forEach((b) => {
      const r = (b as HTMLElement).dataset.role;
      b.classList.toggle('on', r === role);
      b.classList.toggle('reviewer', r === 'reviewer');
    });
    const name = this.shadow.getElementById('who-name');
    const roleEl = this.shadow.getElementById('who-role');
    const avatar = this.shadow.getElementById('who-avatar');
    const currentName = store.currentName;
    if (name) name.textContent = currentName;
    if (roleEl) roleEl.textContent = role === 'animator' ? '动画师' : '农技审核员';
    if (avatar) avatar.textContent = currentName.slice(0, 1);

    const select = this.shadow.getElementById('project-select') as HTMLSelectElement | null;
    if (select) {
      const groups = new Map<string, typeof store.state.projects>();
      for (const p of store.state.projects) {
        if (!groups.has(p.crop)) groups.set(p.crop, []);
        groups.get(p.crop)!.push(p);
      }
      select.innerHTML = `<option value="">— 选择项目 —</option>` + [...groups.entries()].map(([crop, list]) =>
        `<optgroup label="${crop}">${list
          .sort((a, b) => a.episode - b.episode)
          .map((p) => `<option value="${p.id}" ${p.id === store.state.currentProjectId ? 'selected' : ''}>第 ${p.episode} 集 · ${escapeHtml(p.title)}${isOverdue(p.deliveryDate, p.status) ? ' ⚠超期' : ''}</option>`)
          .join('')}</optgroup>`).join('');
    }
  }

  private handleRoute() {
    this.route = currentRoute();
    syncRouteProject();
    if (this.route.projectId && store.state.projects.some((p) => p.id === this.route.projectId)) {
      store.state.currentProjectId = this.route.projectId;
    }
    this.shadow.querySelectorAll('nav button').forEach((b) => {
      b.classList.toggle('on', (b as HTMLElement).dataset.view === this.route.view);
    });
    this.mountView();
    this.refreshChrome();
  }

  private mountView() {
    const main = this.shadow.getElementById('main')!;
    const route = this.route;
    const role = store.state.role;
    const tag = route.view === 'projects' ? 'farm-projects'
      : route.view === 'animate' ? 'farm-workbench'
      : route.view === 'review' ? 'farm-review' : 'farm-compare';
    if (route.view === 'review' && role === 'animator') {
      // reviewers own the review desk; animators can still open it to reply, but see a hint
    }
    const existing = main.firstElementChild as HTMLElement | null;
    if (existing && existing.tagName.toLowerCase() === tag) {
      (existing as unknown as { refresh?: () => void }).refresh?.();
      return;
    }
    main.innerHTML = '';
    const el = document.createElement(tag);
    el.className = 'view';
    main.appendChild(el);
  }

  refresh() {
    this.refreshChrome();
    this.mountView();
  }
}

customElements.define('farm-app', AppShell);
