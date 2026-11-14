import { baseCss } from './styles';

export class BaseElement extends HTMLElement {
  protected shadow: ShadowRoot;
  private unsubs: Array<() => void> = [];
  private mounted = false;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (!this.mounted) {
      this.mounted = true;
      this.init();
    }
    this.onConnect?.();
  }

  disconnectedCallback() {
    this.onDisconnect?.();
    for (const u of this.unsubs) u();
    this.unsubs = [];
  }

  protected init(): void {}
  protected onConnect?(): void;
  protected onDisconnect?(): void;

  protected render(html: string, css = ''): void {
    this.shadow.innerHTML = `<style>${baseCss}\n${css}</style>${html}`;
  }

  protected $(sel: string): HTMLElement {
    const el = this.shadow.querySelector(sel);
    if (!el) throw new Error(`missing element ${sel}`);
    return el as HTMLElement;
  }

  protected $all(sel: string): HTMLElement[] {
    return Array.from(this.shadow.querySelectorAll(sel)) as HTMLElement[];
  }

  protected on<K extends keyof HTMLElementEventMap>(
    sel: string | HTMLElement,
    evt: K,
    handler: (e: HTMLElementEventMap[K]) => void,
  ): void {
    const el = typeof sel === 'string' ? this.shadow.querySelector(sel) : sel;
    el?.addEventListener(evt, handler as EventListener);
  }

  protected sub(fn: () => void): void {
    this.unsubs.push(() => {});
    fn();
  }

  protected emitApp(name: string, detail?: unknown) {
    window.dispatchEvent(new CustomEvent(name, { detail, bubbles: false }));
  }
}

export function toast(message: string, kind: 'ok' | 'warn' | 'err' = 'ok', ms = 2600): void {
  let host = document.querySelector('.toast-host') as HTMLElement | null;
  if (!host) {
    host = document.createElement('div');
    host.className = 'toast-host';
    document.body.appendChild(host);
  }
  const el = document.createElement('div');
  el.className = `toast ${kind}`;
  el.textContent = message;
  host.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .2s, transform .2s';
    el.style.opacity = '0';
    el.style.transform = 'translateY(6px)';
    setTimeout(() => el.remove(), 220);
  }, ms);
}

export function confirmDialog(title: string, message: string, okLabel = '确定'): Promise<boolean> {
  return new Promise((resolve) => {
    const back = document.createElement('div');
    back.className = 'modal-backdrop';
    back.innerHTML = `
      <style>${baseCss}</style>
      <div class="modal">
        <div class="modal-head">${title}</div>
        <div class="modal-body"><div class="muted" style="line-height:1.7">${message}</div></div>
        <div class="modal-foot">
          <button class="btn" data-x>取消</button>
          <button class="btn primary" data-ok>${okLabel}</button>
        </div>
      </div>`;
    document.body.appendChild(back);
    const close = (v: boolean) => {
      back.remove();
      resolve(v);
    };
    back.querySelector('[data-x]')!.addEventListener('click', () => close(false));
    back.querySelector('[data-ok]')!.addEventListener('click', () => close(true));
    back.addEventListener('click', (e) => { if (e.target === back) close(false); });
  });
}
