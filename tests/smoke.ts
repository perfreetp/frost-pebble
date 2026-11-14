import { generateGlyph, DEFAULT_PARAMS } from '../src/lib/generator';
import { getSkeleton, SKELETONS } from '../src/lib/skeletons';
import { ringsToPath } from '../src/lib/geometry';

for (const sk of SKELETONS) {
  const r = generateGlyph({ char: sk.char, skeleton: sk, params: { ...DEFAULT_PARAMS, seed: 12345 } });
  console.log(sk.char, 'strokes=', r.strokes.length, 'polys=', r.polys.length, 'rings=', r.polys.reduce((a,p)=>a+p.length,0), 'area=', r.metrics.inkArea.toFixed(0), 'w=', r.metrics.inkWidth.toFixed(0), 'h=', r.metrics.inkHeight.toFixed(0), 'fp=', r.fingerprint, 'pathlen=', r.path.length);
}
