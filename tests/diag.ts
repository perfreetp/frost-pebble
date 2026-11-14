import { getSkeleton } from '../src/lib/skeletons';
import { buildStrokeNodes, renderStroke, DEFAULT_PARAMS, generateGlyph } from '../src/lib/generator';
import { unionRings, signedArea } from '../src/lib/geometry';
import { SKELETONS } from '../src/lib/skeletons';

const sk = getSkeleton('永')!;
const rings = sk.strokes.map(st => renderStroke(buildStrokeNodes(st, DEFAULT_PARAMS.seed, '永', 0), DEFAULT_PARAMS));
const u = unionRings(rings);
console.log('rings in:', rings.length, 'polys out:', u.length);
u.forEach((p, i) => {
  console.log(` poly ${i}:`, p.map(r => `area=${Math.abs(signedArea(r)).toFixed(0)} pts=${r.length}`).join(' | '));
});
// single stroke unions
rings.forEach((r, i) => {
  const single = unionRings([r]);
  if (single.length !== 1 || single[0].length !== 1) console.log('self-intersect stroke', i, 'polys', single.length, 'rings', single.map(p=>p.length));
});
