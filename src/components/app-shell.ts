// 应用外壳：角色切换（前台/师傅/质检）、操作人设置、页签导航
import { store, MASTERS, ROLE_LABEL, type Role } from '../store';
import { SHARED_CSS, el } from '../ui/shared';
import './order-intake';
import './order-board';
import './proof-workbench';
import './qc-panel';
import './stats-board';

type Tab = 'intake' | 'board' | 'workbench' | 'qc' | 'stats';

const TABS: Array<[Tab, string]> = [
  ['intake', '前台录单'],
  ['board', '工单流转'],
  ['workbench', '打样工作台'],
  ['qc', '质检台'],
  ['stats', '统计看板'],
];

export class AppShell extends HTMLElement {
  private tab: Tab = 'board';
  private currentRole: Role = 'frontdesk';
  private content = el('div', 'content');
  private navBox = el('div', 'tabs');
  private roleBox = el('div', 'roles');

  connectedCallback(): void {
    const style = el('style');
    style.textContent = SHARED_CSS + `
      :host { display: block; }
      header {
        display: flex; align-items: center; gap: 18px; flex-wrap: wrap;
        padding: 12px 20px; background: #1c2430; color: #fff;
      }
      header h1 { font-size: 17px; margin: 0; }
      header h1 small { font-weight: 400; font-size: 12px; color: #9fb0c8; margin-left: 8px; }
      .roles { display: flex; gap: 6px; }
      .roles button { background: #2c3a4e; color: #c8d4e2; padding: 6px 14px; }
      .roles button.active { background: #2f6fdd; color: #fff; }
      .operator { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #9fb0c8; }
      .operator input, .operator select { width: 110px; padding: 5px 8px; font-size: 12px; }
      .tabs { display: flex; gap: 4px; padding: 0 20px; background: #fff; border-bottom: 1px solid #e2e6ec; }
      .tabs button {
        background: none; color: #5a6675; border-radius: 0; padding: 12px 16px;
        border-bottom: 2px solid transparent; font-size: 14px;
      }
      .tabs button:hover { background: none; color: #2f6fdd; }
      .tabs button.active { color: #2f6fdd; border-bottom-color: #2f6fdd; font-weight: 600; }
      .content { padding: 18px 20px; max-width: 1500px; margin: 0 auto; }
    `;
    const header = el('header');
    const h1 = el('h1');
    h1.innerHTML = `彩印打样门店系统<small>图像压缩 · 工单管理</small>`;
    header.append(h1, this.roleBox, this.renderOperator());
    this.append(style, header, this.navBox, this.content);

    document.addEventListener('app-navigate', ((e: CustomEvent<Tab>) => {
      this.switchTab(e.detail);
    }) as EventListener);

    this.renderRoles();
    this.renderOperatorBox();
    this.renderNav();
    this.renderContent();
  }

  private renderRoles(): void {
    this.roleBox.innerHTML = '';
    for (const role of ['frontdesk', 'master', 'qc'] as Role[]) {
      const btn = el('button', role === this.currentRole ? 'active' : '', ROLE_LABEL[role]);
      btn.onclick = () => {
        this.currentRole = role;
        this.renderRoles();
        this.renderOperatorBox();
        // 按角色跳到常用页签
        this.switchTab(role === 'frontdesk' ? 'intake' : role === 'master' ? 'board' : 'qc');
      };
      this.roleBox.append(btn);
    }
  }

  private operatorWrap = el('div', 'operator');

  private renderOperator(): HTMLElement {
    return this.operatorWrap;
  }

  private renderOperatorBox(): void {
    this.operatorWrap.innerHTML = '';
    this.operatorWrap.append(el('span', '', '操作人'));
    if (this.currentRole === 'master') {
      const sel = el('select') as HTMLSelectElement;
      for (const m of MASTERS) {
        const opt = el('option', '', m);
        opt.value = m;
        sel.append(opt);
      }
      sel.value = store.operators.master;
      sel.onchange = () => store.setOperator('master', sel.value);
      this.operatorWrap.append(sel);
    } else {
      const input = el('input') as HTMLInputElement;
      input.value = store.operators[this.currentRole];
      input.onchange = () => store.setOperator(this.currentRole, input.value.trim() || store.operators[this.currentRole]);
      this.operatorWrap.append(input);
    }
  }

  private renderNav(): void {
    this.navBox.innerHTML = '';
    for (const [tab, label] of TABS) {
      const btn = el('button', tab === this.tab ? 'active' : '', label);
      btn.onclick = () => this.switchTab(tab);
      this.navBox.append(btn);
    }
  }

  private switchTab(tab: Tab): void {
    this.tab = tab;
    this.renderNav();
    this.renderContent();
  }

  private renderContent(): void {
    this.content.innerHTML = '';
    const map: Record<Tab, string> = {
      intake: 'order-intake',
      board: 'order-board',
      workbench: 'proof-workbench',
      qc: 'qc-panel',
      stats: 'stats-board',
    };
    this.content.append(document.createElement(map[this.tab]));
  }
}

customElements.define('app-shell', AppShell);
