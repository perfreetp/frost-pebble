import { For, Show, type JSX } from 'solid-js';
import type { BatchStatus } from '../lib/types';
import { STATUS_LABEL } from '../lib/types';

export function Card(props: {
  title?: string;
  sub?: string;
  actions?: JSX.Element;
  tight?: boolean;
  class?: string;
  children: JSX.Element;
}) {
  return (
    <section class={`card${props.tight ? ' tight' : ''} ${props.class ?? ''}`}>
      <Show when={props.title}>
        <div class="row between" style={{ 'margin-bottom': props.sub ? '4px' : '12px', 'align-items': 'flex-start' }}>
          <div>
            <h3>{props.title}</h3>
            <Show when={props.sub}><div class="sub">{props.sub}</div></Show>
          </div>
          {props.actions}
        </div>
      </Show>
      {props.children}
    </section>
  );
}

export function StatusTag(props: { status: BatchStatus }) {
  const cls = () => {
    switch (props.status) {
      case 'passed': return 'tag ok';
      case 'failed': return 'tag bad';
      case 'ready': return 'tag warn';
      case 'archived': return 'tag blue';
      default: return 'tag';
    }
  };
  return <span class={cls()}>{STATUS_LABEL[props.status]}</span>;
}

export function Field(props: { label: string; hint?: string; children: JSX.Element; class?: string }) {
  return (
    <div class={`field ${props.class ?? ''}`}>
      <label>{props.label}</label>
      {props.children}
      <Show when={props.hint}><span class="hint">{props.hint}</span></Show>
    </div>
  );
}

export function RangeInput(props: {
  minLabel: string;
  maxLabel: string;
  unit?: string;
  minValue: number;
  maxValue: number;
  step?: number;
  onChange: (min: number, max: number) => void;
}) {
  return (
    <div class="range-row">
      <input
        class="input mono"
        type="number"
        step={props.step ?? 0.1}
        value={props.minValue}
        onChange={(e) => props.onChange(Number(e.currentTarget.value), props.maxValue)}
      />
      <span class="sep">{props.unit ?? '—'}</span>
      <input
        class="input mono"
        type="number"
        step={props.step ?? 0.1}
        value={props.maxValue}
        onChange={(e) => props.onChange(props.minValue, Number(e.currentTarget.value))}
      />
    </div>
  );
}

export function Gauge(props: { value: number; threshold?: number; bad?: boolean }) {
  return (
    <div class="gauge">
      <div class={`fill${props.bad ? ' bad' : ''}`} style={{ width: `${Math.min(100, Math.max(0, props.value * 100))}%` }} />
      <Show when={props.threshold != null}>
        <div class="mark" style={{ left: `${(props.threshold ?? 0) * 100}%` }} />
      </Show>
    </div>
  );
}

export function RateBar(props: { value: number; threshold?: number }) {
  const bad = () => props.threshold != null && props.value < props.threshold;
  return (
    <div class="rate-bar">
      <div class="track"><span classList={{ bad: bad() }} style={{ width: `${Math.min(100, Math.max(0, props.value * 100))}%` }} /></div>
      <span class="num">{Number.isFinite(props.value) ? `${(props.value * 100).toFixed(1)}%` : '—'}</span>
    </div>
  );
}

export function Empty(props: { text: string; action?: JSX.Element }) {
  return (
    <div class="empty">
      <div style={{ 'margin-bottom': props.action ? '12px' : '0' }}>{props.text}</div>
      {props.action}
    </div>
  );
}

export function Seg<T extends string>(props: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div class="seg">
      <For each={props.options}>
        {(o) => (
          <button classList={{ active: props.value === o.value }} onClick={() => props.onChange(o.value)}>
            {o.label}
          </button>
        )}
      </For>
    </div>
  );
}

export function Kpi(props: { value: JSX.Element; label: string; desc?: JSX.Element; tone?: 'ok' | 'bad' | 'amber' }) {
  const color = () =>
    props.tone === 'ok' ? 'var(--accent)' : props.tone === 'bad' ? 'var(--red)' : props.tone === 'amber' ? 'var(--amber)' : 'var(--ink)';
  return (
    <div class="kpi">
      <div class="v" style={{ color: color() }}>{props.value}</div>
      <div class="l">{props.label}</div>
      <Show when={props.desc}><div class="d">{props.desc}</div></Show>
    </div>
  );
}
