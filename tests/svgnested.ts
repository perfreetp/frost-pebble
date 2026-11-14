import { writeFileSync } from 'node:fs';
import { buildSeedRecords } from '../src/lib/seed';
const recs = buildSeedRecords();
const g = recs.map((r, i) => {
  const v = r.versions[r.versions.length-1];
  const x = 20 + (i%6)*180, y = 20 + Math.floor(i/6)*200;
  return `<g transform="translate(${x},${y}) scale(0.16,-0.16) translate(0,-1000)"><rect width="1000" height="1000" fill="#f7f3e9" stroke="#ddd"/><path d="${v.svgPath}" fill="#1a1712" fill-rule="evenodd"/></g>`;
}).join('');
writeFileSync('tests/out/seed.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="1120" height="440">${g}</svg>`);
