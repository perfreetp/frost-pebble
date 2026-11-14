import { buildStrokeNodes, renderStroke, DEFAULT_PARAMS } from '../src/lib/generator';
import { getSkeleton } from '../src/lib/skeletons';
import { unionRings, subtractWith, polyBounds } from '../src/lib/geometry';
const ch='永';
const p = { ...DEFAULT_PARAMS };
const sk = getSkeleton(ch)!;
const strokes = sk.strokes.map(s => buildStrokeNodes(s, p.seed, ch, p.slant));
const rings = strokes.map(s => renderStroke(s, p));
rings.forEach((r,i)=>{
  const b = polyBounds([[r]]);
  console.log(i, strokes[i].id, 'bbox', b.minX.toFixed(0), b.minY.toFixed(0), b.maxX.toFixed(0), b.maxY.toFixed(0));
});
// test pairwise intersection
import pc from 'polygon-clipping';
const toG = (r) => [[...r.map(q=>[q.x,q.y]), [r[0].x,r[0].y]]];
for (let i=0;i<rings.length;i++) for(let j=i+1;j<rings.length;j++){
  const inter = pc.intersection(toG(rings[i]), toG(rings[j]));
  let area=0; for(const poly of inter) for(const ring of poly){let a=0;for(let k=0;k<ring.length-1;k++){a+=ring[k][0]*ring[k+1][1]-ring[k+1][0]*ring[k][1];}area+=Math.abs(a/2);}
  if(area>20) console.log('overlap', strokes[i].id, strokes[j].id, area.toFixed(0));
}
