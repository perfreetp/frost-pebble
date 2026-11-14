import { writeFileSync, mkdirSync } from 'node:fs';
import { generateGlyph, DEFAULT_PARAMS } from '../src/lib/generator';
import { SKELETONS } from '../src/lib/skeletons';
import { ringsToPath } from '../src/lib/geometry';

mkdirSync('tests/out', { recursive: true });
const cells: string[] = [];
let i = 0;
for (const sk of SKELETONS) {
  const params = { ...DEFAULT_PARAMS, seed: 20261014 };
  const r = generateGlyph({ char: sk.char, skeleton: sk, params });
  const col = i % 4, row = Math.floor(i / 4);
  const x = 40 + col * 260, y = 40 + row * 290;
  cells.push(`<g transform="translate(${x},${y}) scale(0.22,-0.22) translate(0,-1000)">
    <rect x="0" y="0" width="1000" height="1000" fill="#f5f1e8"/>
    <line x1="0" y1="0" x2="1000" y2="0" stroke="#c33" stroke-width="6"/>
    <line x1="0" y1="880" x2="1000" y2="880" stroke="#999" stroke-width="4" stroke-dasharray="20 14"/>
    <path d="${ringsToPath(r.polys)}" fill="#1b1b1b" fill-rule="evenodd"/>
  </g>`);
  i++;
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1120" height="${40 + Math.ceil(SKELETONS.length/4)*290}" viewBox="0 0 1120 ${40 + Math.ceil(SKELETONS.length/4)*290}">${cells.join('')}</svg>`;
writeFileSync('tests/out/glyphs.svg', svg);
console.log('wrote', svg.length);
