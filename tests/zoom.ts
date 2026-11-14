import { writeFileSync } from 'node:fs';
import { generateGlyph, DEFAULT_PARAMS } from '../src/lib/generator';
import { getSkeleton } from '../src/lib/skeletons';
import { ringsToPath } from '../src/lib/geometry';
const chars = process.argv.slice(2);
let cells='';
chars.forEach((ch,i)=>{
  const r = generateGlyph({ char: ch, skeleton: getSkeleton(ch)!, params: { ...DEFAULT_PARAMS } });
  cells += `<g transform="translate(${i*420},0)"><g transform="translate(10,10) scale(0.4,-0.4) translate(0,-1000)"><rect width="1000" height="1000" fill="#f7f3e9" stroke="#ddd"/><path d="${ringsToPath(r.polys)}" fill="#1a1712" fill-rule="evenodd"/></g></g>`;
});
writeFileSync('tests/out/zoom.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="${chars.length*420}" height="420">${cells}</svg>`);
