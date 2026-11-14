import { writeFileSync } from 'node:fs';
import { buildSeedRecords } from '../src/lib/seed';
const recs = buildSeedRecords();
const idx = Number(process.argv[2] ?? 0);
const rec = recs[idx];
let cells='';
rec.versions.forEach((v,i)=>{
  const x=20+i*230;
  cells+=`<g transform="translate(${x},20)">
    <rect width="210" height="210" fill="#f7f3e9" stroke="#ddd"/>
    <line x1="0" y1="190" x2="210" y2="190" stroke="#c33" stroke-width="1"/>
    <g transform="translate(5,5) scale(0.2,-0.2) translate(0,-1000)"><path d="${v.svgPath}" fill="#1a1712" fill-rule="evenodd"/></g>
    <text x="8" y="205" font-size="9" fill="#666">v${v.id} w${v.params.weight} c${Math.round(v.params.contrast*100)} s${v.params.seed}</text>
  </g>`;
});
writeFileSync('tests/out/ver.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="${20+rec.versions.length*230}" height="250">${cells}</svg>`);
console.log(rec.char, rec.versions.length);
