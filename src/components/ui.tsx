import { createSignal, onCleanup, onMount } from 'solid-js';

export function Toast(props: { message: string | null }) {
  return <>{props.message && <div class="toast">{props.message}</div>}</>;
}

export function useToast() {
  const [msg, setMsg] = createSignal<string | null>(null);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const show = (m: string) => {
    setMsg(m);
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => setMsg(null), 2600);
  };
  onCleanup(() => timer && clearTimeout(timer));
  return { msg, show };
}

export function Modal(props: { title: string; onClose: () => void; width?: number; children: any }) {
  onMount(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && props.onClose();
    window.addEventListener('keydown', onKey);
    onCleanup(() => window.removeEventListener('keydown', onKey));
  });
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(40,30,20,0.45)',
        'z-index': 100, display: 'flex', 'align-items': 'center', 'justify-content': 'center',
      }}
      onClick={(e) => e.target === e.currentTarget && props.onClose()}
    >
      <div class="card" style={{ width: `${props.width ?? 640}px`, 'max-height': '86vh', overflow: 'auto' }}>
        <div class="row spread mb8">
          <h3 style={{ margin: 0 }}>{props.title}</h3>
          <button class="ghost small" onClick={props.onClose}>✕ 关闭</button>
        </div>
        {props.children}
      </div>
    </div>
  );
}

export function StatusTag(props: { status: string }) {
  const map: Record<string, string> = {
    submitted: '待复核',
    graded: '已评分',
    returned: '已退回',
  };
  return <span class={`tag status-${props.status}`}>{map[props.status] ?? props.status}</span>;
}
