<script lang="ts">
  import { studio } from '../store.svelte';
  import { SKELETONS } from '../skeletons';
  import { DEFAULT_PARAMS } from '../generator';
  import { LIBRARIES, WEIGHTS } from '../seed';
  import { buildStrokePreview } from '../preview';
  import type { GenParams } from '../types';
  import { ringsToPath } from '../geometry';

  interface Props {
    onclose: () => void;
  }
  let { onclose }: Props = $props();

  const available = SKELETONS;
  let char = $state(SKELETONS[0]?.char ?? '永');
  let library = $state<string>(LIBRARIES[0]);
  let weightName = $state<string>('常规 400');
  let kind = $state('碑帖中心线描摹');
  let params = $state<GenParams>({ ...DEFAULT_PARAMS, seed: 20261014 });
  let note = $state('');

  const skel = $derived(available.find((s) => s.char === char));
  const preview = $derived.by(() => {
    if (!skel) return null;
    return buildStrokePreview(skel, params);
  });

  function submit() {
    if (!skel) return;
    const rec = studio.createRecord({
      char,
      library,
      weightName,
      skeletonSourceKind: kind,
      skeletonRef: skel.source,
      params: { ...params, weight: params.weight },
      note: note.trim() || `初版样张：${skel.source}，按参数自动生成。`,
    });
    if (rec) onclose();
  }

  const dup = $derived(studio.records.some((r) => r.char === char && r.library === library && r.weightName === weightName));

  function randSeed() {
    params = { ...params, seed: Math.floor(Math.random() * 900000) + 100000 };
  }
</script>

<div class="scrim">
  <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-title">
    <div class="dhead">
      <div>
        <div class="eyebrow">NEW RECORD · 建档</div>
        <h2 id="dlg-title" class="serif">新建字形档案</h2>
      </div>
      <button class="btn ghost sm" onclick={onclose} aria-label="关闭">✕</button>
    </div>

    <div class="dmain">
      <div class="col-left">
        <div class="charlist">
          <div class="lbl">选择骨架</div>
          <div class="cgrid">
            {#each available as s (s.char)}
              <button class="cbtn" class:on={char === s.char} onclick={() => (char = s.char)} title={s.pinyin}>
                <span class="serif ch">{s.char}</span>
              </button>
            {/each}
          </div>
        </div>
        <div class="preview">
          <span class="eyebrow">PREVIEW · 初版样张预览</span>
          <div class="pvbox">
            <svg viewBox="-120 -1030 1240 1240" aria-hidden="true">
              <g transform="scale(1,-1)">
                <rect x="0" y="0" width="1000" height="1000" fill="#f3edde" />
                <line x1="0" y1="0" x2="1000" y2="0" stroke="#bb4038" stroke-width="4" opacity="0.7" />
                {#if preview}
                  <path d={ringsToPath(preview)} fill="#1a1712" fill-rule="evenodd" />
                {/if}
              </g>
            </svg>
          </div>
          <div class="pvmeta mono">
            <span>{skel?.pinyin}</span>
            <span>{available.length} 个可选骨架</span>
          </div>
        </div>
      </div>

      <div class="col-right">
        <div class="frow">
          <div class="f">
            <label class="lbl" for="d-lib">字库</label>
            <select id="d-lib" class="field" bind:value={library}>
              {#each [...LIBRARIES] as lib (lib)}<option value={lib}>{lib}</option>{/each}
            </select>
          </div>
          <div class="f">
            <label class="lbl" for="d-wt">字重</label>
            <select id="d-wt" class="field" bind:value={weightName}>
              {#each WEIGHTS as w (w.name)}<option value={w.name}>{w.name}</option>{/each}
            </select>
          </div>
        </div>
        <div class="f">
          <label class="lbl" for="d-kind">骨架来源类型</label>
          <select id="d-kind" class="field" bind:value={kind}>
            <option>碑帖中心线描摹</option>
            <option>手写扫描骨架</option>
            <option>旧铅字重绘</option>
            <option>教学示范骨架</option>
          </select>
        </div>
        <div class="f">
          <div class="lbl">骨架来源说明（随档案记录）</div>
          <div class="srcbox">
            <span class="srck">{skel?.source.split('，')[0]}</span>
            <span class="srcr">{skel?.source}</span>
          </div>
        </div>

        <div class="pblock">
          <div class="pbhead">
            <span class="lbl">初版生成参数</span>
            <button class="btn tiny" onclick={randSeed}>随机种子</button>
          </div>
          <div class="pgrid">
            <label class="pf">
              <span>字重 <em class="mono">{params.weight}</em></span>
              <input type="range" min="35" max="160" class="rng" value={params.weight} oninput={(e) => (params = { ...params, weight: +e.currentTarget.value })} />
            </label>
            <label class="pf">
              <span>粗细对比 <em class="mono">{Math.round(params.contrast * 100)}%</em></span>
              <input type="range" min="0" max="0.9" step="0.01" class="rng" value={params.contrast} oninput={(e) => (params = { ...params, contrast: +e.currentTarget.value })} />
            </label>
            <label class="pf">
              <span>倾斜 <em class="mono">{params.slant}°</em></span>
              <input type="range" min="-12" max="18" class="rng" value={params.slant} oninput={(e) => (params = { ...params, slant: +e.currentTarget.value })} />
            </label>
            <label class="pf">
              <span>圆角 <em class="mono">{params.corner}</em></span>
              <input type="range" min="0" max="90" class="rng" value={params.corner} oninput={(e) => (params = { ...params, corner: +e.currentTarget.value })} />
            </label>
          </div>
          <div class="seedrow">
            <label class="lbl" for="d-seed">种子</label>
            <input id="d-seed" type="number" class="field mono" min="1" max="999999" bind:value={params.seed} />
          </div>
        </div>

        <div class="f">
          <label class="lbl" for="d-note">建档备注（写入初版样张记录）</label>
          <textarea id="d-note" class="field" rows="2" bind:value={note} placeholder="例如：依《九成宫》拓本描摹，横画取右上斜势。"></textarea>
        </div>

        {#if dup}
          <p class="dupwarn">同一字库 + 字重下已有「{char}」档案，新建将生成新的独立编号。</p>
        {/if}
      </div>
    </div>

    <div class="dfoot">
      <div class="fid mono">编号将按建档日自动分配 · GF-YYMM-NNNN</div>
      <div class="dfacts">
        <button class="btn ghost sm" onclick={onclose}>取消</button>
        <button class="btn primary" onclick={submit} disabled={!skel}>建档并入初版样张</button>
      </div>
    </div>
  </div>
</div>

<style>
  .scrim {
    position: fixed;
    inset: 0;
    background: rgba(30, 25, 17, 0.42);
    backdrop-filter: blur(1.5px);
    z-index: 70;
    display: grid;
    place-items: center;
    padding: 24px;
    animation: rise 0.16s ease-out;
  }
  .dialog {
    width: min(880px, 100%);
    max-height: 100%;
    display: flex;
    flex-direction: column;
    background: #f9f5eb;
    border: 1px solid #c9bda2;
    border-radius: 4px;
    box-shadow: 0 28px 70px rgba(30, 25, 17, 0.35);
    overflow: hidden;
  }
  .dhead {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 14px 18px 11px;
    border-bottom: 1px solid var(--rule);
    background: #f4eede;
  }
  .dhead h2 {
    margin: 3px 0 0;
    font-size: 21px;
    letter-spacing: 0.14em;
    font-weight: 600;
  }
  .dmain {
    display: grid;
    grid-template-columns: 236px 1fr;
    gap: 0;
    min-height: 0;
    overflow-y: auto;
  }
  .col-left {
    border-right: 1px solid var(--rule-soft);
    padding: 14px 15px;
    background: #f6f1e4;
  }
  .cgrid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    margin-top: 4px;
  }
  .cbtn {
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    background: #fbf8f0;
    border: 1px solid #ddd3bd;
    border-radius: 2px;
    padding: 0;
    transition: all 0.12s;
  }
  .cbtn .ch {
    font-size: 20px;
    line-height: 1;
    color: var(--ink-soft);
  }
  .cbtn:hover {
    border-color: #b8a988;
    background: #fff;
  }
  .cbtn.on {
    background: var(--ink);
    border-color: var(--ink);
  }
  .cbtn.on .ch {
    color: #f6f1e3;
  }
  .preview {
    margin-top: 14px;
  }
  .pvbox {
    margin-top: 5px;
    border: 1px solid #ddd3bd;
    background: #fbf8f0;
  }
  .pvbox svg {
    display: block;
    width: 100%;
    height: auto;
  }
  .pvmeta {
    display: flex;
    justify-content: space-between;
    font-size: 8.5px;
    color: var(--ink-faint);
    margin-top: 4px;
    letter-spacing: 0.06em;
  }

  .col-right {
    padding: 14px 18px 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .frow {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .srcbox {
    border: 1px solid #ded4bf;
    background: #fdfaf2;
    padding: 7px 9px;
    border-radius: 2px;
  }
  .srck {
    font-size: 10.5px;
    color: var(--cinnabar);
    font-weight: 500;
  }
  .srcr {
    display: block;
    font-size: 10.5px;
    color: var(--ink-mute);
    margin-top: 2px;
    line-height: 1.6;
  }

  .pblock {
    border: 1px solid #ded4bf;
    background: #fdfaf2;
    padding: 10px 12px;
    border-radius: 2px;
  }
  .pbhead {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 6px;
  }
  .pgrid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 16px;
  }
  .pf {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .pf span {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: var(--ink-mute);
  }
  .pf em {
    font-style: normal;
    color: var(--ink);
    font-size: 10px;
  }
  .seedrow {
    margin-top: 8px;
    max-width: 180px;
  }
  .rng {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 18px;
    background: transparent;
    cursor: pointer;
    margin: 0;
  }
  .rng::-webkit-slider-runnable-track {
    height: 3px;
    background: #d8ceb9;
    border-radius: 2px;
  }
  .rng::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: #fffdf7;
    border: 1.4px solid var(--ink);
    margin-top: -4px;
  }
  .rng::-moz-range-thumb {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #fffdf7;
    border: 1.4px solid var(--ink);
  }

  .dupwarn {
    margin: 0;
    font-size: 10px;
    color: #a0661f;
    line-height: 1.6;
  }

  .dfoot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 11px 18px;
    border-top: 1px solid var(--rule);
    background: #f4eede;
    gap: 12px;
  }
  .fid {
    font-size: 9px;
    color: var(--ink-faint);
    letter-spacing: 0.06em;
  }
  .dfacts {
    display: flex;
    gap: 7px;
  }
</style>
