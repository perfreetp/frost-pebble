// 工单流转看板：五个状态列，卡片式展示，按角色提供流转操作
import { store, STATUS_LABEL, type Order, type OrderStatus } from '../store';
import { SHARED_CSS, el, fmtTime, fmtSize } from '../ui/shared';

const COLUMNS: OrderStatus[] = ['pending', 'making', 'qc', 'rejected', 'done'];

export class OrderBoard extends HTMLElement {
  private onChange = (): void => this.render();

  connectedCallback(): void {
    store.addEventListener('change', this.onChange);
    this.render();
  }

  disconnectedCallback(): void {
    store.removeEventListener('change', this.onChange);
  }

  private render(): void {
    this.innerHTML = '';
    const style = el('style');
    style.textContent = SHARED_CSS + `
      .board { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; align-items: start; }
      .col { background: #f4f6f9; border-radius: 10px; padding: 10px; min-height: 200px; }
      .col h3 { display: flex; justify-content: space-between; padding: 2px 4px 8px; }
      .col.pending h3 { color: #8a6d1f; }
      .col.making h3 { color: #2456a8; }
      .col.qc h3 { color: #7a3fb0; }
      .col.rejected h3 { color: #b03030; }
      .col.done h3 { color: #1e7a41; }
      .card { background: #fff; border: 1px solid #e2e6ec; border-radius: 8px; padding: 10px; margin-bottom: 8px; font-size: 12px; }
      .card .head { display: flex; justify-content: space-between; font-weight: 700; font-size: 13px; margin-bottom: 4px; }
      .card .line { color: #5a6675; margin: 2px 0; }
      .card .actions { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
      .card button { padding: 4px 10px; font-size: 12px; }
      .overdue { color: #b03030; font-weight: 700; }
      details { margin-top: 6px; }
      summary { cursor: pointer; color: #8a94a3; font-size: 11px; }
      .log { color: #5a6675; font-size: 11px; padding: 2px 0; border-top: 1px dashed #edf0f4; }
    `;
    this.append(style);

    const board = el('div', 'board');
    for (const col of COLUMNS) {
      const orders = store.orders.filter((o) => o.status === col);
      const colEl = el('div', `col ${col}`);
      const h3 = el('h3');
      h3.append(el('span', '', STATUS_LABEL[col]), el('span', 'badge', String(orders.length)));
      colEl.append(h3);
      for (const o of orders) colEl.append(this.renderCard(o));
      board.append(colEl);
    }
    this.append(board);
  }

  private renderCard(o: Order): HTMLElement {
    const card = el('div', 'card');
    const head = el('div', 'head');
    head.append(el('span', '', o.id), el('span', '', o.customer));
    card.append(head);
    card.append(el('div', 'line', `${o.sizeW}×${o.sizeH}cm · ${o.paperWeight}g · ${o.colors}色`));
    card.append(el('div', 'line', `师傅：${o.master} · 返工 ${o.rework} 次`));
    const due = el('div', 'line', `交期：${fmtTime(o.dueAt)}`);
    if (store.isOverdue(o)) {
      due.append(' ');
      due.append(el('span', 'overdue', '【已超期】'));
    }
    card.append(due);
    if (o.proof) {
      card.append(el('div', 'line', `档位 ${o.proof.quality} · ${fmtSize(o.proof.fileSize)} · PSNR ${o.proof.psnr.toFixed(1)}dB`));
    }
    if (o.status === 'qc') {
      const badgeWrap = el('div');
      badgeWrap.append(o.sampled
        ? el('span', 'badge warn', '已抽中待检')
        : el('span', 'badge good', '未抽中'));
      card.append(badgeWrap);
    }
    if (o.status === 'rejected' && o.qcNote) {
      card.append(el('div', 'line', `打回原因：${o.qcNote}`));
    }

    const actions = el('div', 'actions');
    if (o.status === 'pending') {
      const btn = el('button', '', '师傅接单');
      btn.onclick = () => store.accept(o.id, store.operators.master);
      actions.append(btn);
    }
    if (o.status === 'making') {
      const btn = el('button', 'ghost', '去工作台');
      btn.onclick = () => {
        store.select(o.id);
        document.dispatchEvent(new CustomEvent('app-navigate', { detail: 'workbench' }));
      };
      actions.append(btn);
    }
    if (o.status === 'rejected') {
      const btn = el('button', 'danger', '重新制作');
      btn.onclick = () => {
        store.rework(o.id, store.operators.master);
        document.dispatchEvent(new CustomEvent('app-navigate', { detail: 'workbench' }));
      };
      actions.append(btn);
    }
    if (o.status === 'qc') {
      const btn = el('button', 'ghost', '去质检台');
      btn.onclick = () => document.dispatchEvent(new CustomEvent('app-navigate', { detail: 'qc' }));
      actions.append(btn);
    }
    if (actions.childElementCount > 0) card.append(actions);

    const details = el('details');
    const summary = el('summary', '', `流转记录（${o.logs.length}）`);
    details.append(summary);
    for (const log of [...o.logs].reverse()) {
      details.append(el('div', 'log',
        `${fmtTime(log.time)} · ${STATUS_LABEL[log.status]} · ${log.operator}${log.note ? ` · ${log.note}` : ''}`));
    }
    card.append(details);
    return card;
  }
}

customElements.define('order-board', OrderBoard);
