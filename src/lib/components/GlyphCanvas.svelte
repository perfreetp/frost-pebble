<script lang="ts">
  import { onMount, type Snippet } from 'svelte';
  import { GlyphRenderer, type Layer, type ViewBox, fitView, GLYPH_VIEW } from '../render/index';
  import { triangulate } from '../geometry';

  interface Props {
    layers: Layer[];
    view?: ViewBox;
    /** 显示字面框辅助线 */
    guides?: boolean;
    class?: string;
    onready?: (r: GlyphRenderer) => void;
    onview?: (v: ViewBox) => void;
    children?: Snippet;
  }

  let { layers, view = GLYPH_VIEW, guides = true, class: cls = '', onready, onview, children }: Props = $props();

  let canvas: HTMLCanvasElement | undefined = $state();
  let wrap: HTMLDivElement | undefined = $state();
  let renderer = $state<GlyphRenderer | null>(null);
  let error = $state<string | null>(null);
  let size = $state({ w: 0, h: 0 });
  let effective = $state<ViewBox>(GLYPH_VIEW);

  onMount(() => {
    if (!canvas || !wrap) return;
    let ro: ResizeObserver | undefined;
    try {
      renderer = new GlyphRenderer(canvas);
      onready?.(renderer);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
      return;
    }
    const measure = () => {
      const r = wrap!.getBoundingClientRect();
      size = { w: r.width, h: r.height };
      renderer?.resize(r.width, r.height);
      paint();
    };
    ro = new ResizeObserver(measure);
    ro.observe(wrap);
    measure();
    return () => {
      ro?.disconnect();
      renderer?.dispose();
      renderer = null;
    };
  });

  function paint() {
    if (!renderer) return;
    const aspect = size.h > 0 && size.w > 0 ? size.w / size.h : 1;
    const v = fitView(view, aspect);
    effective = v;
    onview?.(v);
    renderer.clear();
    for (const layer of layers) {
      if (!layer.polys.length) continue;
      const mesh = triangulate(layer.polys);
      if (!mesh.indices.length) continue;
      renderer.setMesh(mesh);
      renderer.draw(v, layer.style);
    }
  }

  $effect(() => {
    layers;
    view;
    size;
    paint();
  });
</script>

<div class="stage {cls}" bind:this={wrap}>
  <canvas bind:this={canvas} aria-label="字形渲染画布"></canvas>
  {#if guides}
    <svg class="guides" viewBox="-120 -1030 1240 1240" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <g transform="scale(1,-1)">
        <line x1="-120" y1="0" x2="1120" y2="0" class="baseline" />
        <line x1="-120" y1="880" x2="1120" y2="880" class="cap" />
        <line x1="-120" y1="180" x2="1120" y2="180" class="desc" />
        <line x1="0" y1="-210" x2="0" y2="1030" class="side" />
        <line x1="1000" y1="-210" x2="1000" y2="1030" class="side" />
        <rect x="0" y="0" width="1000" height="1000" class="box" />
      </g>
    </svg>
  {/if}
  {#if error}
    <div class="fallback">WebGL2 初始化失败：{error}</div>
  {/if}
  {@render children?.()}
</div>

<style>
  .stage {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 0;
    background: var(--card-raised);
    overflow: hidden;
    touch-action: none;
  }
  canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
  }
  .guides {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .guides line {
    stroke: #c9bfa8;
    stroke-width: 1.4;
    vector-effect: non-scaling-stroke;
  }
  .guides .baseline {
    stroke: #b8443a;
    stroke-width: 1.6;
    opacity: 0.85;
  }
  .guides .cap,
  .guides .desc {
    stroke-dasharray: 6 7;
    opacity: 0.7;
  }
  .guides .side {
    stroke-dasharray: 3 9;
    opacity: 0.4;
  }
  .guides .box {
    fill: none;
    stroke: #cfc4ad;
    stroke-width: 1;
    opacity: 0.5;
  }
  .fallback {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    color: var(--cinnabar);
    font-size: 12px;
    padding: 20px;
    text-align: center;
  }
</style>
