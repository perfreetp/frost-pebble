// 质检台：按比例抽查，抽中的判定合格/不合格，未抽中的免检放行
import { store, type Order } from '../store';
import { SHARED_CSS, el, fmtSize, fmtTime } from '../ui/shared';

export class QcPanel extends HTMLElement {
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
      .ratio { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
      .ratio input { width: 90px; }
      .qitem { display: flex; justify-content: space-between; align-items: center; gap: 12px;
        border: 1px solid #e2e6ec; border-radius: 8px; padding: 12px; margin-bottom: 8px; background: #fff; }
      .qitem .meta { font-size: 12px; color: #5a6675; margin-top: 3px; }
      .qitem .ops { display: flex; gap: 8px; flex-shrink: 0; }
      .empty { padding: 30px; text-align: center; color: #8a94a3; }
    `;
    this.append(style);

    const panel = el('div', 'panel');
    panel.append(el('h2', '', '质检台'));

    // 抽查比例设置
    const ratio = el('div', 'ratio');
    ratio.append(el('label', '', '抽查比例'));
    const input = el('input') as HTMLInputElement;
    input.type = 'number';
    input.min = '0';
    input.max = '100';
    input.value = String(Math.round(store.qcSampleRatio * 100));
    input.onchange = () => store.setQcSampleRatio(Number(input.value) / 100);
    ratio.append(input, el('span', 'muted', '% —— 师傅提交质检时按此比例随机抽中，未抽中的免检放行'));
    panel.append(ratio);

    const queue = store.orders.filter((o) => o.status === 'qc');
    if (queue.length === 0) {
      panel.append(el('div', 'empty', '暂无待质检工单'));
    }
    for (const o of queue) panel.append(this.renderItem(o));
    this.append(panel);
  }

  private renderItem(o: Order): HTMLElement {
    const item = el('div', 'qitem');
    const left = el('div');
    const title = el('div');
    title.append(el('strong', '', `${o.id} · ${o.customer}`));
    title.append(' ');
    title.append(o.sampled ? el('span', 'badge warn', '已抽中，需检验') : el('span', 'badge good', '未抽中'));
    left.append(title);
    const meta = el('div', 'meta');
    meta.textContent = `${o.sizeW}×${o.sizeH}cm · ${o.paperWeight}g · ${o.colors}色 · 师傅 ${o.master} · 提交于 ${fmtTime(o.logs[o.logs.length - 1].time)}`;
    left.append(meta);
    if (o.proof) {
      const proof = el('div', 'meta');
      proof.textContent = `档位 Q${o.proof.quality} · 压缩后 ${fmtSize(o.proof.fileSize)} · PSNR ${o.proof.psnr.toFixed(2)}dB · MSE ${o.proof.mse.toFixed(2)}`;
      left.append(proof);
      if (o.proof.warnings.length > 0) {
        const w = el('div', 'meta');
        w.textContent = `⚠ ${o.proof.warnings.join('；')}`;
        w.style.color = '#b03030';
        left.append(w);
      }
    }
    item.append(left);

    const ops = el('div', 'ops');
    if (o.sampled) {
      const pass = el('button', 'ok', '合格');
      pass.onclick = () => store.qcPass(o.id, store.operators.qc);
      const fail = el('button', 'danger', '不合格打回');
      fail.onclick = () => {
        const note = prompt('打回原因（会记录到流转日志）', '压缩失真超标');
        if (note !== null) store.qcFail(o.id, store.operators.qc, note);
      };
      ops.append(pass, fail);
    } else {
      const release = el('button', 'ghost', '免检放行');
      release.onclick = () => store.qcPass(o.id, store.operators.qc);
      ops.append(release);
    }
    item.append(ops);
    return item;
  }
}

customElements.define('qc-panel', QcPanel);
