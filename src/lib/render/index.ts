import type { MultiPoly } from '../geometry';
import { GlyphRenderer, type InkStyle, type ViewBox } from './webgl';

export function fitView(view: ViewBox, aspect: number): ViewBox {
  const w = view.x1 - view.x0;
  const h = view.y1 - view.y0;
  const targetAspect = Math.max(0.2, aspect);
  if (w / h > targetAspect) {
    const nh = w / targetAspect;
    const cy = (view.y0 + view.y1) / 2;
    return { x0: view.x0, x1: view.x1, y0: cy - nh / 2, y1: cy + nh / 2 };
  }
  const nw = h * targetAspect;
  const cx = (view.x0 + view.x1) / 2;
  return { x0: cx - nw / 2, x1: cx + nw / 2, y0: view.y0, y1: view.y1 };
}

export interface Layer {
  polys: MultiPoly;
  style: InkStyle;
}

export function drawLayers(renderer: GlyphRenderer, layers: Layer[], view: ViewBox) {
  renderer.clear();
  for (const layer of layers) {
    if (!layer.polys.length) continue;
    const mesh = triangulatePolys(layer.polys);
    if (!mesh.indices.length) continue;
    renderer.setMesh(mesh);
    renderer.draw(view, layer.style);
  }
}

import { triangulate } from '../geometry';

const meshCache = new Map<string, { vertices: Float32Array; indices: Uint32Array }>();

export function triangulatePolys(polys: MultiPoly) {
  const t = triangulate(polys);
  return t;
}

export { GlyphRenderer, type InkStyle, type ViewBox };

export const GLYPH_VIEW: ViewBox = { x0: -120, x1: 1120, y0: -210, y1: 1030 };

export const INK_STYLE: InkStyle = { color: [0.085, 0.078, 0.062], alpha: 1, grain: 1 };
export const LOCK_STYLE: InkStyle = { color: [0.61, 0.17, 0.13], alpha: 0.92, grain: 0.3 };
export const GHOST_STYLE: InkStyle = { color: [0.61, 0.19, 0.14], alpha: 0.28, grain: 0 };

export const B_VIEW: ViewBox = GLYPH_VIEW;
