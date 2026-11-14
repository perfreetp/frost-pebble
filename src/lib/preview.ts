import type { GenParams, GlyphSkeleton, StrokeState } from './types';
import { buildStrokeNodes, renderStroke } from './generator';
import { unionRings, dedupeRing } from './geometry';
import type { MultiPoly, Ring } from './geometry';

/** 建档对话框用的轻量预览：不跑完整 union，只叠轮廓，快。 */
export function buildStrokePreview(skeleton: GlyphSkeleton, params: GenParams): MultiPoly {
  const rings: Ring[] = [];
  for (const sk of skeleton.strokes) {
    const st: StrokeState = buildStrokeNodes(sk, params.seed, skeleton.char, params.slant);
    const r = renderStroke(st, params);
    if (r.length >= 3) rings.push(r);
  }
  return unionRings(rings)
    .map((poly) => poly.map((ring) => dedupeRing(ring)))
    .filter((poly) => poly.length > 0);
}
