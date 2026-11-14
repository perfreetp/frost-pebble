import { BaseElement, toast } from './base';
import { store, navigate } from './context';
import type { Annotation, AnnotationStatus, Project, ProjectStatus } from '../core/types';
import { escapeHtml, fmtDate, fmtDateTime, isOverdue, relativeTime } from '../core/util';
import type { StageView } from './stage-view';

const css = /* css */ `
  :host { display: flex; flex-direction: column; height: 100%; min-height: 0; overflow: hidden; }
  .topbar {
    height: 44px; flex: 0 0 44px; display: flex; align-items: center; gap: 10px; padding: 0 12px;
    border-bottom: 1px solid var(--line-soft); background: #101712;
  }
  .proj { display: flex; flex-direction: column; line-height: 1.2; }
  .proj .t { font-size: 12.5px; font-weight: 600; color: #e8efe4; }
  .proj .s { font-size: 10px; color: var(--text-faint); }
  .status-pill { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; height: 19px; padding: 0 8px; border-radius: 999px; border: 1px solid; }
  .spacer { flex: 1; }
  .gate { display: flex; align-items: center; gap: 6px; font-size: 10.5px; padding: 4px 9px; border-radius: 7px; }
  .gate.ok { color: #9fda9f; background: #1a2a20; border: 1px solid #35543c; }
  .gate.block { color: #f2b7a9; background: #2b1c19; border: 1px solid #5a3733; }
  .vchip { font-family: var(--mono); font-size: 10.5px; color: #e6cd92; background: #2b2415; border: 1px solid #4a3c20; border-radius: 5px; padding: 2px 7px; }

  .main { flex: 1; min-height: 0; display: flex; }
  .stage-col { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .stage-box { flex: 1; min-height: 0; position: relative; }
  .stage-box.writing { outline: 2px dashed rgba(233,183,80,.55); outline-offset: -6px; }
  .write-hint {
    position: absolute; left: 50%; transform: translateX(-50%); top: 12px; z-index: 9;
    background: rgba(28,22,12,.94); border: 1px solid #8a6428; color: #f5dca8; font-size: 11px;
    padding: 6px 14px; border-radius: 999px; display: none; pointer-events: none;
  }
  .write-hint.show { display: block; }
  .player {
    flex: 0 0 42px; display: flex; align-items: center; gap: 8px; padding: 0 12px;
    border-top: 1px solid var(--line-soft); background: #101712;
  }
  .scrub { flex: 1; position: relative; height: 22px; display: flex; align-items: center; cursor: pointer; }
  .scrub .rail { position: absolute; left: 0; right: 0; height: 5px; border-radius: 3px; background: #1e2a21; }
  .scrub .fill { position: absolute; left: 0; height: 5px; border-radius: 3px; background: linear-gradient(90deg, #5c8a60, #e9b750); }
  .scrub .head { position: absolute; width: 11px; height: 11px; border-radius: 50%; background: #f7e2b0; border: 2px solid #a0782c; transform: translateX(-5.5px); box-shadow: 0 0 8px rgba(233,183,80,.5); }
  .scrub .tick { position: absolute; width: 7px; height: 7px; border-radius: 50%; top: -9px; transform: translateX(-3.5px); border: 1px solid #f0cd84; background: #3a2a1b; }
  .scrub .tick.done { border-color: #7cb469; background: #22332a; }
  .scrub .tick.explained { border-color: #6fa8d6; background: #1e2a36; }
  .scrub .tick.sel { background: #f0cd84; }

  .list-col { width: 360px; flex: 0 0 360px; border-left: 1px solid var(--line-soft); display: flex; flex-direction: column; min-height: 0; background: var(--panel); }
  .list-head { flex: 0 0 46px; padding: 8px 12px; border-bottom: 1px solid var(--line-soft); display: flex; flex-direction: column; gap: 5px; }
  .list-head .r1 { display: flex; align-items: center; gap: 8px; }
  .list-head .ttl { font-size: 12px; font-weight: 600; color: #dde8da; }
  .tabs { display: flex; gap: 4px; }
  .tab { height: 21px; padding: 0 8px; border-radius: 999px; border: 1px solid var(--line); background: transparent; color: var(--text-faint); font-size: 10px; display: flex; align-items: center; gap: 4px; }
  .tab.on { background: #2b3a2f; border-color: #48604e; color: #e4efdf; }
  .tab .n { font-family: var(--mono); opacity: .8; }
  .list-scroll { flex: 1; overflow: auto; padding: 8px; display: flex; flex-direction: column; gap: 8px; min-height: 0; }
  .ann-card {
    border: 1px solid var(--line-soft); border-radius: 10px; background: #141c17; padding: 9px 10px;
    display: flex; flex-direction: column; gap: 6px; transition: border-color .14s, background .14s; cursor: pointer;
  }
  .ann-card:hover { border-color: #40584a; }
  .ann-card.sel { border-color: #8a6428; background: #1b2118; box-shadow: 0 0 0 1px rgba(233,183,80,.2); }
  .ann-card.resolved { opacity: .78; }
  .ann-card .head { display: flex; align-items: center; gap: 7px; }
  .badge-num { width: 19px; height: 19px; border-radius: 50%; display: grid; place-items: center; font-family: var(--mono); font-size: 10px; flex: 0 0 auto; }
  .badge-num.pending { background: #3a2a1b; color: #f0cd84; border: 1px solid #6f5527; }
  .badge-num.resolved { background: #22332a; color: #9fda9f; border: 1px solid #3d6045; }
  .badge-num.explained { background: #1e2a36; color: #a8cdea; border: 1px solid #35506a; }
  .ann-card .meta { font-size: 9.5px; color: var(--text-faint); display: flex; gap: 5px; align-items: center; }
  .ann-card .text { font-size: 11.5px; color: #d7e2d4; line-height: 1.6; }
  .status-chip { margin-left: auto; font-size: 9px; padding: 2px 6px; border-radius: 4px; border: 1px solid; }
  .status-chip.pending { color: #f0cd84; border-color: #5d4a24; background: #2a2416; }
  .status-chip.resolved { color: #9fda9f; border-color: #35543c; background: #1a2a20; }
  .status-chip.explained { color: #a8cdea; border-color: #2f4759; background: #182430; }
  .reply-box { background: #101812; border: 1px solid #26382b; border-radius: 7px; padding: 6px 8px; }
  .reply-box .who { font-size: 9.5px; color: #8fa393; display: flex; gap: 5px; align-items: center; }
  .reply-box .msg { font-size: 10.5px; color: #b9c9b6; line-height: 1.55; margin-top: 3px; }
  .reply-editor { display: flex; flex-direction: column; gap: 5px; }
  .reply-editor textarea { width: 100%; height: 48px; resize: none; font-size: 11px; line-height: 1.5; }
  .reply-editor .acts { display: flex; gap: 5px; }
  .reply-editor .acts .btn { flex: 1; padding: 0 6px; font-size: 10.5px; }
  .empty-list { padding: 40px 16px; text-align: center; color: var(--text-faint); font-size: 11.5px; line-height: 1.9; }
  .ver-strip { flex: 0 0 auto; padding: 8px 12px; border-top: 1px solid var(--line-soft); display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .ver-pill { font-family: var(--mono); font-size: 10px; color: #c9d6c6; background: #1a241d; border: 1px solid #2e4136; border-radius: 999px; padding: 2px 8px; }
  .ver-pill.on { color: #f0d79a; border-color: #6b5527; background: #2b2415; }
  .review-foot { flex: 0 0 auto; padding: 10px 12px; border-top: 1px solid var(--line-soft); display: flex; flex-direction: column; gap: 7px; background: #101712; }
  .review-foot .row { display: flex; gap: 6px; }
  .review-foot .btn { flex: 1; }
  .timeline-mini { flex: 0 0 44px; display: flex; align-items: center; gap: 8px; padding: 0 12px; border-top: 1px solid var(--line-soft); background: #0d1310; }
  .timeline-mini .label { font-size: 10px; color: var(--text-faint); letter-spacing: .5px; }
  .timeline-mini .frames { position: relative; flex: 1; height: 18px; background: #131b16; border-radius: 5px; overflow: hidden; border: 1px solid #23312a; }
  .timeline-mini .frames .cell { position: absolute; top: 0; bottom: 0; width: 1px; background: #26372c; }
  .timeline-mini .frames .marker { position: absolute; top: 2px; width: 14px; height: 12px; margin-left: -7px; background: #3a2a1b; border: 1px solid #8a6428; border-radius: 3px; color: #f0cd84; font-size: 8px; display: grid; place-items: center; font-family: var(--mono); }
  .timeline-mini .frames .ph { position: absolute; top: 0; bottom: 0; width: 1px; background: #e9b750; }
  .activity { flex: 0 0 auto; max-height: 120px; overflow: auto; border-top: 1px solid var(--line-soft); padding: 6px 12px; background: #0e1411; }
  .activity .a-row { display: flex; gap: 7px; font-size: 9.5px; color: #93a595; padding: 3px 0; align-items: baseline; }
  .activity .a-row .tm { font-family: var(--mono); color: #627667; flex: 0 0 auto; }
  .activity .a-row b { color: #c4d3c2; font-weight: 500; }
  .activity .a-row .trans { color: #8fa393; }
  .activity .a-row .from { color: #c98a76; }
  .activity .a-row .to { color: #9cc9a1; }
  .return-box { display: flex; flex-direction: column; gap: 6px; }
  .return-box textarea { height: 46px; resize: none; font-size: 11px; }
  @keyframes pinDrop { from { transform: translateY(-8px) scale(.8); opacity: 0; } }
`;

const STATUS_STYLE: Record<ProjectStatus, { color: string; bg: string; border: string; dot: string }> = {
  '制作中': { color: '#f0cd84', bg: '#2a2416', border: '#5d4a24', dot: '#e9b750' },
  '待审核': { color: '#a8cdea', bg: '#182430', border: '#2f4759', dot: '#6fa8d6' },
  '退回': { color: '#f2a99c', bg: '#2b1c19', border: '#5a3733', dot: '#e07464' },
  '已采用': { color: '#9fda9f', bg: '#1a2a20', border: '#35543c', dot: '#73c17a' },
};

export class ReviewView extends BaseElement {
  private frame = 0;
  private playing = false;
  private rafId = 0;
  private lastTs = 0;
  private acc = 0;
  private selectedAnn: string | null = null;
  private filter: 'all' | AnnotationStatus = 'all';
  private writing = false;
  private unsubscribe: (() => void) | null = null;
  private focusHandler = (e: Event) => {
    this.receiveFocus((e as CustomEvent<string>).detail);
  };

  protected init() {
    this.unsubscribe = store.subscribe(() => this.paint());
    window.addEventListener('focus-annotation', this.focusHandler);
    this.render(`
      <div class="topbar" id="topbar"></div>
      <div class="main">
        <div class="stage-col">
          <div class="stage-box" id="stage-box">
            <farm-stage id="stage"></farm-stage>
            <div class="write-hint" id="write-hint">批注模式：在画面上点击要提意见的位置</div>
          </div>
          <div class="player" id="player"></div>
          <div class="timeline-mini" id="tl-mini"></div>
        </div>
        <div class="list-col">
          <div class="list-head" id="list-head"></div>
          <div class="list-scroll" id="ann-list"></div>
          <div class="ver-strip" id="ver-strip"></div>
          <div class="review-foot" id="review-foot"></div>
          <div class="activity" id="activity"></div>
        </div>
      </div>`, css);
    this.bindStatic();
    this.paint();
  }

  protected onDisconnect() {
    this.unsubscribe?.();
    window.removeEventListener('focus-annotation', this.focusHandler);
    cancelAnimationFrame(this.rafId);
  }

  refresh() {
    this.paint();
  }

  private get project() {
    return store.project;
  }

  private bindStatic() {
    const stage = this.shadow.getElementById('stage') as unknown as StageView;
    stage.addEventListener('annotation-draft', (e) => {
      const d = (e as CustomEvent<{ frame: number; x: number; y: number; text: string }>).detail;
      if (store.state.role !== 'reviewer') {
        toast('请切换到「农技审核」身份再写批注', 'warn');
        return;
      }
      const ann = store.addAnnotation(d.frame, d.x, d.y, d.text);
      if (ann) {
        this.selectedAnn = ann.id;
        toast(`批注已挂在第 ${d.frame} 帧`, 'ok');
        this.paint();
      }
    });
    stage.addEventListener('annotation-click', (e) => {
      const id = (e as CustomEvent<string>).detail;
      this.selectedAnn = id;
      const ann = this.project?.annotations.find((a) => a.id === id);
      if (ann) this.setFrame(ann.frame, false);
      this.paint();
    });
    stage.addEventListener('bone-select', (e) => {
      if ((e as CustomEvent<string | null>).detail) this.paint();
    });
  }

  private paint() {
    const p = this.project;
    if (!p) {
      this.shadow.getElementById('topbar')!.innerHTML = `<div class="proj"><div class="t">未选择项目</div></div>`;
      return;
    }
    if (!this.selectedAnn && p.annotations.length) {
      this.selectedAnn = p.annotations.find((a) => a.status === 'pending')?.id ?? p.annotations[0].id;
    }
    if (this.selectedAnn && !p.annotations.some((a) => a.id === this.selectedAnn)) this.selectedAnn = null;
    this.paintTopbar();
    this.paintPlayer();
    this.paintTimelineMini();
    this.paintList();
    this.paintFoot();
    this.paintActivity();
    const stage = this.shadow.getElementById('stage') as unknown as StageView;
    stage.setProject(p, p.timeline, this.frame);
    // on the review desk, pins stay clickable so the reviewer can jump between notes
    stage.setAnnotationsInteractive(true);
    stage.setMode(this.writing ? 'annotate' : 'select', true);
    stage.setViewOptions({ bones: this.writing });
    stage.setToolsVisible(this.writing);
    stage.setAnnotationSelection(this.selectedAnn);
    if (this.selectedAnn) stage.focusAnnotation(this.selectedAnn);
  }

  private pendingCount(p: Project = this.project!) {
    return p.annotations.filter((a) => a.status === 'pending').length;
  }

  private paintTopbar() {
    const p = this.project!;
    const st = STATUS_STYLE[p.status];
    const pending = this.pendingCount(p);
    const bar = this.shadow.getElementById('topbar')!;
    bar.innerHTML = `
      <div class="proj">
        <div class="t">${escapeHtml(p.title)}</div>
        <div class="s">${p.crop} · 第 ${p.episode} 集 · 交付 ${p.deliveryDate}${isOverdue(p.deliveryDate, p.status) ? ' · <span style="color:#f0968a">已超期</span>' : ''}</div>
      </div>
      <span class="vchip">v${p.versions.length || 0}</span>
      <span class="status-pill" style="color:${st.color};background:${st.bg};border-color:${st.border}"><span class="dot" style="color:${st.dot}"></span>${p.status}</span>
      <span class="spacer"></span>
      <span class="gate ${pending ? 'block' : 'ok'}">${pending ? `⛔ ${pending} 条批注未处理 · 不能定稿` : '✓ 批注已清 · 可定稿'}</span>
      <button class="btn sm ${this.writing ? 'toggled' : ''}" id="write-toggle">✎ ${this.writing ? '批注中…' : '写批注'}</button>
      <button class="btn sm ghost" id="btn-compare" ${p.versions.length < 2 ? 'disabled title="至少需要两个版本"' : ''}>⇄ 版本比对</button>
      <button class="btn sm ghost" id="btn-workbench">◧ 回工作台</button>
    `;
    bar.querySelector('#write-toggle')?.addEventListener('click', () => {
      this.writing = !this.writing;
      const stage = this.shadow.getElementById('stage') as unknown as StageView;
      stage.setMode(this.writing ? 'annotate' : 'select');
      stage.setAnnotationsInteractive(!this.writing);
    stage.setMode(this.writing ? 'annotate' : 'select');
      this.shadow.getElementById('write-hint')?.classList.toggle('show', this.writing);
      this.shadow.getElementById('stage-box')?.classList.toggle('writing', this.writing);
      this.shadow.querySelector('#write-toggle')?.classList.toggle('toggled', this.writing);
      this.shadow.querySelector('#write-toggle')!.textContent = this.writing ? '✎ 批注中…' : '写批注';
    });
    bar.querySelector('#btn-compare')?.addEventListener('click', () => navigate('compare', p.id));
    bar.querySelector('#btn-workbench')?.addEventListener('click', () => navigate('animate', p.id));
  }

  private paintPlayer() {
    const p = this.project!;
    const pending = this.pendingCount(p);
    const fx = this.frame / Math.max(1, p.timeline.duration);
    const player = this.shadow.getElementById('player')!;
    player.innerHTML = `
      <button class="btn icon" id="rv-play" title="播放/暂停">${this.playing ? '❚❚' : '▶'}</button>
      <button class="btn icon" id="rv-prev">◀</button>
      <button class="btn icon" id="rv-next">▶</button>
      <div class="scrub" id="scrub">
        <div class="rail"></div>
        <div class="fill" style="width:${fx * 100}%"></div>
        ${p.annotations.map((a, i) => `<span class="tick ${a.status === 'resolved' ? 'done' : a.status === 'explained' ? 'explained' : ''} ${this.selectedAnn === a.id ? 'sel' : ''}" style="left:${(a.frame / Math.max(1, p.timeline.duration)) * 100}%" data-tick="${a.id}" title="${escapeHtml(a.text.slice(0, 30))}"></span>`).join('')}
        <div class="head" style="left:${fx * 100}%"></div>
      </div>
      <span class="mono small" id="rv-frame" style="min-width:128px;text-align:right;color:#8fa393">第 ${this.frame} 帧 / ${p.timeline.duration}</span>
      <span class="gate ${pending ? 'block' : 'ok'}" style="font-size:10px">${pending ? `${pending} 待处理` : '批注已清'}</span>
    `;
    player.querySelector('#rv-play')?.addEventListener('click', () => this.togglePlay());
    player.querySelector('#rv-prev')?.addEventListener('click', () => this.setFrame(this.frame - 1, false));
    player.querySelector('#rv-next')?.addEventListener('click', () => this.setFrame(this.frame + 1, false));
    player.querySelectorAll<HTMLElement>('[data-tick]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectAnn(el.dataset.tick!);
      });
    });
    const scrub = player.querySelector('#scrub') as HTMLElement;
    const jump = (clientX: number) => {
      const r = scrub.getBoundingClientRect();
      const t = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
      this.setFrame(Math.round(t * p.timeline.duration), false);
    };
    scrub.addEventListener('pointerdown', (e) => {
      jump(e.clientX);
      const move = (ev: PointerEvent) => jump(ev.clientX);
      const up = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    });
  }

  private paintTimelineMini() {
    const p = this.project!;
    const host = this.shadow.getElementById('tl-mini')!;
    const dur = Math.max(1, p.timeline.duration);
    const cells = Array.from({ length: Math.floor(dur / 6) + 1 }, (_, i) => `<div class="cell" style="left:${(i * 6 / dur) * 100}%"></div>`).join('');
    host.innerHTML = `
      <span class="label">时间轴批注</span>
      <div class="frames">
        ${cells}
        ${p.annotations.map((a, i) => `<div class="marker" style="left:${(a.frame / dur) * 100}%;top:2px" data-tl-ann="${a.id}" title="第 ${a.frame} 帧 · ${escapeHtml(a.text.slice(0, 24))}">${i + 1}</div>`).join('')}
        <div class="ph" style="left:${(this.frame / dur) * 100}%"></div>
      </div>
      <span class="mono small" style="color:#7d9182">${p.annotations.length} 条</span>`;
    host.querySelectorAll<HTMLElement>('[data-tl-ann]').forEach((el) => {
      el.addEventListener('click', () => this.selectAnn(el.dataset.tlAnn!));
    });
  }

  private paintList() {
    const p = this.project!;
    const all = p.annotations;
    const counts = {
      all: all.length,
      pending: all.filter((a) => a.status === 'pending').length,
      resolved: all.filter((a) => a.status === 'resolved').length,
      explained: all.filter((a) => a.status === 'explained').length,
    };
    const list = all
      .filter((a) => this.filter === 'all' || a.status === this.filter)
      .slice()
      .sort((a, b) => a.frame - b.frame || a.createdAt - b.createdAt);

    const head = this.shadow.getElementById('list-head')!;
    head.innerHTML = `
      <div class="r1"><span class="ttl">画面批注</span><span class="faint small">农技员 · 陈穗生</span></div>
      <div class="tabs">
        ${(['all', 'pending', 'resolved', 'explained'] as const).map((f) => `
          <button class="tab ${this.filter === f ? 'on' : ''}" data-filter="${f}">${f === 'all' ? '全部' : f === 'pending' ? '待处理' : f === 'resolved' ? '已改' : '已说明'} <span class="n">${counts[f]}</span></button>`).join('')}
      </div>`;
    head.querySelectorAll<HTMLElement>('[data-filter]').forEach((el) => {
      el.addEventListener('click', () => {
        this.filter = el.dataset.filter as typeof this.filter;
        this.paintList();
      });
    });

    const box = this.shadow.getElementById('ann-list')!;
    if (!list.length) {
      box.innerHTML = `<div class="empty-list">${all.length ? '该筛选下暂无批注' : '还没有批注<br>点右上角「写批注」，在画面上点位置即可提意见'}</div>`;
      return;
    }
    const role = store.state.role;
    box.innerHTML = list.map((a) => {
      const idx = all.indexOf(a) + 1;
      const sel = this.selectedAnn === a.id;
      return `
        <div class="ann-card ${sel ? 'sel' : ''} ${a.status === 'resolved' ? 'resolved' : ''}" data-card="${a.id}">
          <div class="head">
            <span class="badge-num ${a.status}">${idx}</span>
            <div class="meta"><span class="mono">第 ${a.frame} 帧</span><span>·</span><span>${a.author}</span><span>·</span><span>${relativeTime(a.createdAt)}</span></div>
            <span class="status-chip ${a.status}">${a.status === 'pending' ? '待处理' : a.status === 'resolved' ? '已改' : '已说明'}</span>
          </div>
          <div class="text">${escapeHtml(a.text)}</div>
          ${a.reply ? `<div class="reply-box"><div class="who">↳ ${escapeHtml(a.repliedBy ?? '制作方')} · ${a.repliedAt ? fmtDateTime(a.repliedAt) : ''}</div><div class="msg">${escapeHtml(a.reply)}</div></div>` : ''}
          ${a.status === 'pending' && role === 'animator' ? `
            <div class="reply-editor">
              <textarea class="textarea" data-reply="${a.id}" placeholder="已改：说明改了什么 / 或说明保留理由…"></textarea>
              <div class="acts">
                <button class="btn sm" data-act="resolved" data-id="${a.id}">✓ 标记已改</button>
                <button class="btn sm ghost" data-act="explained" data-id="${a.id}">说明理由</button>
              </div>
            </div>` : ''}
          ${a.status !== 'pending' ? `<button class="btn sm ghost" data-reopen="${a.id}" style="align-self:flex-start;height:21px">重新打开</button>` : ''}
          ${a.status === 'pending' && role === 'reviewer' ? `<button class="btn sm ghost" data-remove="${a.id}" style="align-self:flex-start;height:21px;color:#c98a76">撤回批注</button>` : ''}
        </div>`;
    }).join('');

    box.querySelectorAll<HTMLElement>('[data-card]').forEach((el) => {
      el.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('textarea,button')) return;
        this.selectAnn(el.dataset.card!);
      });
    });
    box.querySelectorAll<HTMLElement>('[data-act]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id!;
        const status = btn.dataset.act as 'resolved' | 'explained';
        const ta = box.querySelector(`textarea[data-reply="${id}"]`) as HTMLTextAreaElement | null;
        const text = ta?.value.trim() ?? '';
        if (!text) {
          toast(status === 'resolved' ? '请简单写明改了什么' : '说明理由不能为空', 'warn');
          ta?.focus();
          return;
        }
        store.replyAnnotation(id, text, status);
        toast(status === 'resolved' ? '已标记为已改' : '已附说明理由', 'ok');
      });
    });
    box.querySelectorAll<HTMLElement>('[data-reopen]').forEach((btn) => {
      btn.addEventListener('click', () => {
        store.reopenAnnotation(btn.dataset.reopen!);
        toast('批注已重新打开，需再次处理', 'warn');
      });
    });
    box.querySelectorAll<HTMLElement>('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        store.deleteAnnotation(btn.dataset.remove!);
        toast('已撤回批注', 'ok');
      });
    });
  }

  private paintFoot() {
    const p = this.project!;
    const st = STATUS_STYLE[p.status];
    const pending = this.pendingCount(p);
    const role = store.state.role;
    const foot = this.shadow.getElementById('review-foot')!;
    foot.querySelector('.ver-strip');
    const strip = this.shadow.getElementById('ver-strip')!;
    strip.innerHTML = `<span class="faint small" style="letter-spacing:.5px">版本</span>
      ${p.versions.length ? p.versions.slice().reverse().map((v) => `<span class="ver-pill" title="${escapeHtml(v.note)} · ${fmtDate(v.submittedAt)}">v${v.number}</span>`).join('') : '<span class="faint small">未提交</span>'}
      <span class="spacer" style="flex:1"></span>
      ${p.versions.length >= 2 ? '<button class="btn sm ghost" id="foot-compare" style="height:22px">⇄ 比对</button>' : ''}`;
    strip.querySelector('#foot-compare')?.addEventListener('click', () => navigate('compare', p.id));

    if (role === 'reviewer') {
      foot.innerHTML = `
        <div class="return-box">
          <textarea class="textarea" id="review-note" placeholder="审核意见（退回时必填，会记入流转记录）"></textarea>
          <div class="row">
            <button class="btn danger" id="btn-return" ${p.status !== '待审核' && p.status !== '退回' ? 'disabled' : ''}>↩ 退回修改</button>
            <button class="btn primary" id="btn-approve" ${pending ? 'disabled' : ''} title="${pending ? '有未处理批注，不能定稿' : '通过并可定稿'}">✓ 通过并采用</button>
          </div>
          ${pending ? `<div class="faint small">⛔ 还有 ${pending} 条批注未处理，处理后才能采用定稿</div>` : ''}
        </div>`;
      foot.querySelector('#btn-return')?.addEventListener('click', () => {
        const note = (foot.querySelector('#review-note') as HTMLTextAreaElement).value;
        const res = store.review('退回', note);
        if (!res.ok) { toast(res.message, 'err'); return; }
        toast('已退回制作方，流转已记录', 'warn');
        this.paint();
      });
      foot.querySelector('#btn-approve')?.addEventListener('click', () => {
        const note = (foot.querySelector('#review-note') as HTMLTextAreaElement).value;
        const res = store.review('已采用', note);
        if (!res.ok) { toast(res.message, 'err'); this.paint(); return; }
        toast('审核通过，版本已锁定为「已采用」', 'ok', 3200);
        this.paint();
      });
    } else {
      foot.innerHTML = `
        <div class="row" style="align-items:center">
          <span class="status-chip ${st ? 'pending' : ''}" style="color:${st.color};border-color:${st.border};background:${st.bg}">${p.status}</span>
          <span class="faint small" style="flex:1">制作方视角：逐条回复批注后可提交新版本</span>
        </div>
        <div class="row">
          <button class="btn primary" id="foot-submit" ${p.status === '已采用' ? 'disabled' : ''}>${p.status === '退回' ? '处理完 → 重新提交' : '提交新版本'}</button>
        </div>
        ${pending ? `<div class="faint small">还有 ${pending} 条待处理，提交会被拦截</div>` : ''}`;
      foot.querySelector('#foot-submit')?.addEventListener('click', () => {
        if (pending) { toast(`还有 ${pending} 条批注未回复`, 'err'); return; }
        const res = store.submitVersion('按审核批注修订');
        if (!res.ok) { toast(res.message, 'err'); return; }
        toast(`已提交 v${res.version!.number}`, 'ok');
        this.paint();
      });
    }
  }

  private paintActivity() {
    const p = this.project!;
    const host = this.shadow.getElementById('activity')!;
    host.innerHTML = `<div class="section-label" style="padding:0 0 4px">流转记录</div>` + p.activity.slice(0, 8).map((a) => `
      <div class="a-row">
        <span class="tm">${fmtDateTime(a.at)}</span>
        <b>${escapeHtml(a.by)}</b>
        <span>${escapeHtml(a.action)}</span>
        ${a.from || a.to ? `<span class="trans">${a.from ? `<span class="from">${a.from}</span> → ` : ''}<span class="to">${a.to ?? ''}</span></span>` : ''}
        ${a.version ? `<span class="trans">v${a.version}</span>` : ''}
      </div>`).join('');
  }

  private selectAnn(id: string) {
    this.selectedAnn = id;
    const ann = this.project?.annotations.find((a) => a.id === id);
    if (ann) this.setFrame(ann.frame, false);
    const stage = this.shadow.getElementById('stage') as unknown as StageView;
    stage.focusAnnotation(id);
    this.paintList();
    this.paintPlayer();
  }

  private receiveFocus(id: string) {
    this.selectAnn(id);
  }

  private setFrame(frame: number, fromPlay: boolean) {
    const dur = this.project?.timeline.duration ?? 0;
    const f = Math.max(0, Math.min(dur, Math.round(frame)));
    this.frame = f;
    const stage = this.shadow.getElementById('stage') as unknown as StageView;
    stage.setFrame(f);
    const el = this.shadow.getElementById('rv-frame');
    if (el) el.textContent = `第 ${f} 帧 / ${dur}`;
    const fill = this.shadow.querySelector('.scrub .fill') as HTMLElement | null;
    const head = this.shadow.querySelector('.scrub .head') as HTMLElement | null;
    const fx = f / Math.max(1, dur);
    if (fill) fill.style.width = `${fx * 100}%`;
    if (head) head.style.left = `${fx * 100}%`;
    const ph = this.shadow.querySelector('.timeline-mini .ph') as HTMLElement | null;
    if (ph) ph.style.left = `${fx * 100}%`;
    if (!fromPlay) { /* repaint list not needed for frame change */ }
  }

  private togglePlay() {
    this.playing = !this.playing;
    const btn = this.shadow.getElementById('rv-play');
    if (btn) btn.textContent = this.playing ? '❚❚' : '▶';
    if (this.playing) {
      this.lastTs = performance.now();
      this.acc = 0;
      const tick = (ts: number) => {
        if (!this.playing) return;
        const dt = Math.min(100, ts - this.lastTs);
        this.lastTs = ts;
        this.acc += dt;
        const spf = 1000 / (this.project?.timeline.fps ?? 24);
        if (this.acc >= spf) {
          const steps = Math.floor(this.acc / spf);
          this.acc -= steps * spf;
          const dur = this.project?.timeline.duration ?? 0;
          this.setFrame((this.frame + steps) % (dur + 1), true);
          const fill = this.shadow.querySelector('.scrub .fill') as HTMLElement | null;
          const head = this.shadow.querySelector('.scrub .head') as HTMLElement | null;
          const fx = this.frame / Math.max(1, dur);
          if (fill) fill.style.width = `${fx * 100}%`;
          if (head) head.style.left = `${fx * 100}%`;
        }
        this.rafId = requestAnimationFrame(tick);
      };
      this.rafId = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(this.rafId);
    }
  }
}

customElements.define('farm-review', ReviewView);
