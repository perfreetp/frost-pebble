import { writeFileSync } from 'node:fs';
import { generateGlyph, DEFAULT_PARAMS } from '../src/lib/generator';
import { getSkeleton } from '../src/lib/skeletons';
import { ringsToPath } from '../src/lib/geometry';
const ch = process.argv[2] ?? '永';
const sk = getSkeleton(ch)!;
const r = generateGlyph({ char: ch, skeleton: sk, params: { ...DEFAULT_PARAMS } });
writeFileSync('tests/out/big.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="560"><g transform="translate(30,30) scale(0.5,-0.5) translate(0,-1000)"><rect width="1000" height="1000" fill="#f7f3e9" stroke="#ddd"/><path d="${ringsToPath(r.polys)}" fill="#1a1712" fill-rule="evenodd"/></g></svg>`);
console.log(r.polys.length, r.polys.map(p=>p.length));
