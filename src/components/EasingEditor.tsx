import { For } from 'solid-js';
import type { Easing } from '../types';
import { EASING_PRESETS } from '../lib/anim';

interface Props {
  easing: Easing;
  onChange: (e: Easing) => void;
}

const SIZE = 180;
const PAD = 18;

/** 缓入/缓出独立调节的 cubic-bezier 曲线编辑器 */
export default function EasingEditor(props: Props) {
  const toSvg = (x: number, y: number) => ({
    cx: PAD + x * (SIZE - PAD * 2),
    cy: SIZE - PAD - y * (SIZE - PAD * 2),
  });
  const fromSvg = (cx: number, cy: number) => ({
    x: Math.max(0, Math.min(1, (cx - PAD) / (SIZE - PAD * 2))),
    y: Math.max(-0.5, Math.min(1.5, (SIZE - PAD - cy) / (SIZE - PAD * 2))),
  });

  const p0 = toSvg(0, 0);
  const p3 = toSvg(1, 1);
  const p1 = () => toSvg(props.easing.inX, props.easing.inY);
  const p2 = () => toSvg(props.easing.outX, props.easing.outY);

  const drag = (which: 'in' | 'out') => (e: PointerEvent) => {
    e.preventDefault();
    const svg = (e.currentTarget as SVGElement).ownerSVGElement!;
    const onMove = (ev: PointerEvent) => {
      const rect = svg.getBoundingClientRect();
      const pt = fromSvg(ev.clientX - rect.left, ev.clientY - rect.top);
      if (which === 'in') props.onChange({ ...props.easing, inX: pt.x, inY: pt.y });
      else props.onChange({ ...props.easing, outX: pt.x, outY: pt.y });
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  // 采样曲线用于预览
  const pathD = () => {
    const pts: string[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const x = 3 * (1 - t) * (1 - t) * t * props.easing.inX + 3 * (1 - t) * t * t * props.easing.outX + t ** 3;
      const y = 3 * (1 - t) * (1 - t) * t * props.easing.inY + 3 * (1 - t) * t * t * props.easing.outY + t ** 3;
      const p = toSvg(x, y);
      pts.push(`${i === 0 ? 'M' : 'L'}${p.cx.toFixed(1)},${p.cy.toFixed(1)}`);
    }
    return pts.join(' ');
  };

  return (
    <div class="easing-box">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ background: '#fffdf8', border: '1px solid var(--line)', 'border-radius': '6px' }}>
        {/* 参考对角线 */}
        <line x1={p0.cx} y1={p0.cy} x2={p3.cx} y2={p3.cy} stroke="#ddd2c0" stroke-dasharray="4 3" />
        {/* 控制柄 */}
        <line x1={p0.cx} y1={p0.cy} x2={p1().cx} y2={p1().cy} stroke="#2f6f6a" stroke-width="1.4" />
        <line x1={p3.cx} y1={p3.cy} x2={p2().cx} y2={p2().cy} stroke="#9c3f4e" stroke-width="1.4" />
        <path d={pathD()} fill="none" stroke="#3a2f28" stroke-width="2" />
        <circle cx={p0.cx} cy={p0.cy} r="3.5" fill="#3a2f28" />
        <circle cx={p3.cx} cy={p3.cy} r="3.5" fill="#3a2f28" />
        <circle
          class="ease-handle" cx={p1().cx} cy={p1().cy} r="6"
          fill="#2f6f6a" stroke="#fff" stroke-width="1.5"
          onPointerDown={drag('in')}
        />
        <circle
          class="ease-handle" cx={p2().cx} cy={p2().cy} r="6"
          fill="#9c3f4e" stroke="#fff" stroke-width="1.5"
          onPointerDown={drag('out')}
        />
      </svg>
      <div class="muted" style={{ 'font-size': '11px' }}>
        绿点 = 缓入 ({props.easing.inX.toFixed(2)}, {props.easing.inY.toFixed(2)})；
        红点 = 缓出 ({props.easing.outX.toFixed(2)}, {props.easing.outY.toFixed(2)})
      </div>
      <div class="ease-presets">
        <For each={EASING_PRESETS}>
          {(preset) => (
            <button
              class="small"
              onClick={() => props.onChange({ ...preset.easing })}
              title={`cubic-bezier(${preset.easing.inX},${preset.easing.inY},${preset.easing.outX},${preset.easing.outY})`}
            >
              {preset.name}
            </button>
          )}
        </For>
      </div>
    </div>
  );
}
