import { buildSeedRecords } from '../src/lib/seed';
const recs = buildSeedRecords();
const full = JSON.stringify(recs);
const reduce = JSON.stringify(recs.map(r => ({...r, versions: r.versions.map(v => ({...v, polys: undefined, svgPath: ''}))})));
console.log('full KB', (full.length/1024).toFixed(0), 'reduced KB', (reduce.length/1024).toFixed(0));
let polyPts=0, pathLen=0;
for (const r of recs) for (const v of r.versions) { polyPts += v.polys.reduce((a,p)=>a+p.reduce((b,ring)=>b+ring.length,0),0); pathLen += v.svgPath.length; }
console.log('polyPts', polyPts, 'pathLen', pathLen);
