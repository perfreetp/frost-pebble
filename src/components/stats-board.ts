// 统计看板：按师傅统计完成量 / 返工率 / 超期单数，导出对账清单
import { store } from '../store';
import { SHARED_CSS, el } from '../ui/shared';

export class StatsBoard extends HTMLElement {
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
      .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
      .bar { height: 8px; border-radius: 4px; background: #eef2f7; overflow: hidden; min-width: 90px; }
      .bar > div { height: 100%; background: #2f6fdd; }
      .bar.rework > div { background: #d84a4a; }
      .bar.overdue > div { background: #e8a23f; }
    `;
    this.append(style);

    const panel = el('div', 'panel');
    const head = el('div', 'head');
    head.append(el('h2', '', '师傅统计看板'));
    const exportBtn = el('button', '', '导出对账清单 (CSV)');
    exportBtn.onclick = () => this.exportCsv();
    head.append(exportBtn);
    panel.append(head);

    const stats = store.statsByMaster();
    if (stats.length === 0) {
      panel.append(el('div', 'muted', '暂无数据，请先录单'));
      this.append(panel);
      return;
    }
    const maxDone = Math.max(1, ...stats.map((s) => s.done));
    const table = el('table');
    table.innerHTML = `
      <thead><tr>
        <th>师傅</th><th>完成量</th><th>在制</th><th>返工次数</th><th>返工率</th><th>超期单数</th>
      </tr></thead>
    `;
    const tbody = el('tbody');
    for (const s of stats) {
      const tr = el('tr');
      const pct = (s.done / maxDone) * 100;
      const reworkPct = Math.min(100, s.reworkRate * 100);
      const overduePct = Math.min(100, s.overdue * 25);
      tr.innerHTML = `
        <td><strong>${s.master}</strong></td>
        <td>${s.done} 单<div class="bar"><div style="width:${pct}%"></div></div></td>
        <td>${s.active} 单</td>
        <td>${s.rework} 次</td>
        <td>${(s.reworkRate * 100).toFixed(1)}%<div class="bar rework"><div style="width:${reworkPct}%"></div></div></td>
        <td>${s.overdue} 单<div class="bar overdue"><div style="width:${overduePct}%"></div></div></td>
      `;
      tbody.append(tr);
    }
    table.append(tbody);
    panel.append(table);
    this.append(panel);
  }

  private exportCsv(): void {
    const csv = store.exportCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = el('a');
    a.href = url;
    a.download = `对账清单_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

customElements.define('stats-board', StatsBoard);
