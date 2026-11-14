// 前台录单：客户名、成品尺寸、纸张克重、色数、分派师傅、交期
import { store, MASTERS } from '../store';
import { SHARED_CSS, el } from '../ui/shared';

export class OrderIntake extends HTMLElement {
  connectedCallback(): void {
    this.render();
  }

  private render(): void {
    this.innerHTML = '';
    const style = el('style');
    style.textContent = SHARED_CSS + `
      form { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
      .full { grid-column: 1 / -1; }
      .actions { display: flex; align-items: flex-end; gap: 10px; }
      #msg { font-size: 13px; color: #1e7a41; align-self: center; }
    `;
    const panel = el('div', 'panel');
    panel.innerHTML = `
      <h2>前台录单</h2>
      <form id="f">
        <div><label>客户名称 *</label><input name="customer" required placeholder="如：恒泰广告"></div>
        <div><label>成品尺寸 宽 (cm) *</label><input name="sizeW" type="number" min="1" step="0.1" required placeholder="60"></div>
        <div><label>成品尺寸 高 (cm) *</label><input name="sizeH" type="number" min="1" step="0.1" required placeholder="90"></div>
        <div><label>纸张克重 (g/m²) *</label>
          <select name="paperWeight">
            <option value="128">128</option>
            <option value="157" selected>157</option>
            <option value="200">200</option>
            <option value="250">250</option>
            <option value="300">300</option>
            <option value="350">350</option>
          </select>
        </div>
        <div><label>色数 *</label>
          <select name="colors">
            <option value="1">单色</option>
            <option value="2">双色</option>
            <option value="4" selected>四色 (CMYK)</option>
            <option value="5">四色 + 专色</option>
            <option value="6">六色</option>
          </select>
        </div>
        <div><label>分派师傅 *</label>
          <select name="master">${MASTERS.map((m) => `<option>${m}</option>`).join('')}</select>
        </div>
        <div><label>交期（小时后）*</label><input name="dueHours" type="number" min="1" value="24" required></div>
        <div class="actions full">
          <button type="submit">创建工单</button>
          <span id="msg"></span>
        </div>
      </form>
    `;
    this.append(style, panel);

    const form = panel.querySelector<HTMLFormElement>('#f')!;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const order = store.createOrder(
        {
          customer: String(fd.get('customer')).trim(),
          sizeW: Number(fd.get('sizeW')),
          sizeH: Number(fd.get('sizeH')),
          paperWeight: Number(fd.get('paperWeight')),
          colors: Number(fd.get('colors')),
          master: String(fd.get('master')),
          dueHours: Number(fd.get('dueHours')),
        },
        store.operators.frontdesk,
      );
      form.reset();
      const msg = panel.querySelector('#msg')!;
      msg.textContent = `已创建工单 ${order.id}，分派给 ${order.master}`;
      setTimeout(() => { msg.textContent = ''; }, 4000);
    });
  }
}

customElements.define('order-intake', OrderIntake);
