import { generateGlyph, DEFAULT_PARAMS } from '../src/lib/generator';
import { getSkeleton } from '../src/lib/skeletons';
import { unionRings, signedArea } from '../src/lib/geometry';
const r = generateGlyph({ char: '口', skeleton: getSkeleton('口')!, params: {...DEFAULT_PARAMS} });
console.log(r.polys.map(p=>p.map(rr=>({area: Math.abs(signedArea(rr)).toFixed(0), pts: rr.length, sign: signedArea(rr)>0?'+':'-'}))));
