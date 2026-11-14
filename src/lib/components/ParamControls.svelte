<script lang="ts">
  import type { GenParams, TerminalKind } from '../types';
  import { TERMINAL_LABEL } from '../generator';

  interface Props {
    params: GenParams;
    disabled?: boolean;
    onChange: (patch: Partial<GenParams>) => void;
  }
  let { params, disabled = false, onChange }: Props = $props();

  const TERMINALS: TerminalKind[] = ['flat', 'round', 'sharp', 'flare', 'oblique'];

  function clamp(v: number, lo: number, hi: number) {
    return Math.min(hi, Math.max(lo, v));
  }

  function setNum(key: 'weight' | 'corner' | 'seed' | 'slant', raw: string, lo: number, hi: number) {
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    onChange({ [key]: Math.round(clamp(n, lo, hi)) } as Partial<GenParams>);
  }
  function setFloat(key: 'contrast', raw: string, lo: number, hi: number) {
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    onChange({ [key]: clamp(n, lo, hi) } as Partial<GenParams>);
  }

  /** 滑杆填充百分比 */
  function pct(v: number, lo: number, hi: number) {
    return `${((v - lo) / (hi - lo)) * 100}%`;
  }
</script>

<div class="params" class:disabled>
  <div class="p">
    <div class="p-head">
      <label class="lbl" for="p-weight">字重 <em>WEIGHT</em></label>
      <input
        id="p-weight"
        class="num-input mono"
        type="number"
        min="35"
        max="160"
        step="1"
        value={params.weight}
        disabled={disabled}
        oninput={(e) => setNum('weight', e.currentTarget.value, 35, 160)}
      />
    </div>
    <input
      class="rng"
      type="range"
      min="35"
      max="160"
      step="1"
      value={params.weight}
      disabled={disabled}
      style:--fill={pct(params.weight, 35, 160)}
      oninput={(e) => setNum('weight', e.currentTarget.value, 35, 160)}
    />
    <div class="scale mono"><span>35</span><span>97</span><span>160</span></div>
  </div>

  <div class="p">
    <div class="p-head">
      <label class="lbl" for="p-contrast">粗细对比 <em>CONTRAST</em></label>
      <span class="val mono">{Math.round(params.contrast * 100)}%</span>
    </div>
    <input
      id="p-contrast"
      class="rng"
      type="range"
      min="0"
      max="0.9"
      step="0.01"
      value={params.contrast}
      disabled={disabled}
      style:--fill={pct(params.contrast, 0, 0.9)}
      oninput={(e) => setFloat('contrast', e.currentTarget.value, 0, 0.9)}
    />
    <div class="scale mono"><span>均匀</span><span>宋体</span><span>极强</span></div>
  </div>

  <div class="p two">
    <div>
      <div class="p-head">
        <label class="lbl" for="p-slant">倾斜角度 <em>SLANT</em></label>
        <span class="val mono">{params.slant}°</span>
      </div>
      <input
        id="p-slant"
        class="rng"
        type="range"
        min="-12"
        max="18"
        step="1"
        value={params.slant}
        disabled={disabled}
        style:--fill={pct(params.slant, -12, 18)}
        oninput={(e) => setNum('slant', e.currentTarget.value, -12, 18)}
      />
    </div>
    <div>
      <div class="p-head">
        <label class="lbl" for="p-corner">圆角半径 <em>CORNER</em></label>
        <span class="val mono">{params.corner}</span>
      </div>
      <input
        id="p-corner"
        class="rng"
        type="range"
        min="0"
        max="90"
        step="1"
        value={params.corner}
        disabled={disabled}
        style:--fill={pct(params.corner, 0, 90)}
        oninput={(e) => setNum('corner', e.currentTarget.value, 0, 90)}
      />
    </div>
  </div>

  <div class="p">
    <div class="p-head">
      <span class="lbl">收笔形态 <em>TERMINAL</em></span>
      <span class="val mono">{TERMINAL_LABEL[params.terminal]}</span>
    </div>
    <div class="terms" role="radiogroup" aria-label="收笔形态">
      {#each TERMINALS as t (t)}
        <button
          class="term"
          class:on={params.terminal === t}
          role="radio"
          aria-checked={params.terminal === t}
          disabled={disabled}
          onclick={() => onChange({ terminal: t })}
          title={TERMINAL_LABEL[t]}
        >
          <svg viewBox="0 0 40 18" width="38" height="18" aria-hidden="true">
            {#if t === 'flat'}
              <path d="M4 9 L32 9" stroke="currentColor" stroke-width="6" stroke-linecap="butt" />
            {:else if t === 'round'}
              <path d="M6 9 L31 9" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
            {:else if t === 'sharp'}
              <path d="M4 9 L27 9 L37 9" stroke="currentColor" stroke-width="6" stroke-linecap="butt" stroke-dasharray="0" />
              <path d="M27 9 L37 9" stroke="currentColor" stroke-width="2" />
            {:else if t === 'flare'}
              <path d="M6 9 L30 9" stroke="currentColor" stroke-width="5" stroke-linecap="butt" />
              <path d="M28 4 L37 2 L37 16 L28 14 Z" fill="currentColor" />
            {:else}
              <path d="M6 9 L30 9 L36 4" stroke="currentColor" stroke-width="5" stroke-linecap="butt" fill="none" />
            {/if}
          </svg>
          <span>{TERMINAL_LABEL[t]}</span>
        </button>
      {/each}
    </div>
  </div>

  <div class="p">
    <div class="p-head">
      <label class="lbl" for="p-seed">种子 <em>SEED</em></label>
      <div class="seed-actions">
        <button class="btn tiny" disabled={disabled} onclick={() => onChange({ seed: Math.floor(Math.random() * 900000) + 100000 })}>
          换一换
        </button>
      </div>
    </div>
    <input
      id="p-seed"
      class="field mono seed"
      type="number"
      min="1"
      max="999999"
      value={params.seed}
      disabled={disabled}
      oninput={(e) => setNum('seed', e.currentTarget.value, 1, 999999)}
    />
    <p class="seed-note">同一种子 + 同一组参数 = 完全一致的字形。种子决定每笔的细微抖动。</p>
  </div>
</div>

<style>
  .params {
    display: flex;
    flex-direction: column;
  }
  .params.disabled {
    opacity: 0.55;
  }
  .p {
    padding: 11px 0;
    border-bottom: 1px dashed var(--rule-soft);
  }
  .p:last-child {
    border-bottom: 0;
    padding-bottom: 2px;
  }
  .p.two {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  .p-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 6px;
  }
  .lbl {
    margin: 0;
  }
  .lbl em {
    font-style: normal;
    color: #a99e8a;
    letter-spacing: 0.1em;
    font-size: 9px;
  }
  .val {
    font-size: 12px;
    color: var(--ink-soft);
    font-weight: 500;
  }
  .num-input {
    width: 58px;
    text-align: right;
    padding: 2px 5px;
    border: 1px solid var(--rule-soft);
    border-radius: 2px;
    background: #fff;
    font-size: 12px;
  }
  .num-input:focus {
    outline: none;
    border-color: #a2947a;
  }

  /* 滑杆 */
  .rng {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 22px;
    background: transparent;
    cursor: pointer;
    margin: 0;
  }
  .rng:disabled {
    cursor: not-allowed;
  }
  .rng::-webkit-slider-runnable-track {
    height: 3px;
    border-radius: 2px;
    background: linear-gradient(
      to right,
      var(--ink) 0%,
      var(--ink) var(--fill),
      #dcd3bf var(--fill),
      #dcd3bf 100%
    );
  }
  .rng::-moz-range-track {
    height: 3px;
    border-radius: 2px;
    background: #dcd3bf;
  }
  .rng::-moz-range-progress {
    height: 3px;
    border-radius: 2px;
    background: var(--ink);
  }
  .rng::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 13px;
    height: 13px;
    margin-top: -5px;
    border-radius: 50%;
    background: #fffdf7;
    border: 1.5px solid var(--ink);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
    transition: transform 0.1s;
  }
  .rng::-webkit-slider-thumb:hover {
    transform: scale(1.15);
  }
  .rng::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #fffdf7;
    border: 1.5px solid var(--ink);
  }
  .scale {
    display: flex;
    justify-content: space-between;
    font-size: 8.5px;
    color: #b0a591;
    letter-spacing: 0.05em;
    margin-top: 1px;
  }

  /* 收笔形态 */
  .terms {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 4px;
  }
  .term {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 5px 2px 4px;
    border: 1px solid var(--rule-soft);
    background: #fffdf8;
    border-radius: 2px;
    color: var(--ink-mute);
    transition: all 0.13s;
  }
  .term span {
    font-size: 9px;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }
  .term:hover:not(:disabled) {
    border-color: #bfb299;
    color: var(--ink);
  }
  .term.on {
    background: var(--ink);
    border-color: var(--ink);
    color: #f5f0e2;
  }

  .seed-actions {
    display: flex;
    gap: 4px;
  }
  .field.seed {
    width: 100%;
    letter-spacing: 0.12em;
  }
  .seed-note {
    margin: 6px 0 0;
    font-size: 10px;
    line-height: 1.55;
    color: var(--ink-faint);
  }
</style>
