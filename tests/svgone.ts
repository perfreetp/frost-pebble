import { writeFileSync, mkdirSync } from 'node:fs';
import { generateGlyph, DEFAULT_PARAMS, renderStroke } from '../src/lib/generator';
import { getSkeleton } from '../src/lib/skeletons';
import { ringsToPath } from '../src/lib/geometry';

mkdirSync('tests/out', { recursive: true });
const chars = process.argv.slice(2).length ? process.argv.slice(2) : ['永'];
const colors = ['#c0392b','#2980b9','#27ae60','#8e44ad','#d35400','#16a085','#7f8c8d'];
let cells = '';
chars.forEach((ch, idx) => {
  const sk = getSkeleton(ch)!;
  const params = { ...DEFAULT_PARAMS };
  const r = generateGlyph({ char: ch, skeleton: sk, params });
  const x = 20 + idx * 620;
  cells += `<g transform="translate(${x},30) scale(0.55,-0.55) translate(0,-1000)">
    <rect x="0" y="0" width="1000" height="1000" fill="#faf7f0" stroke="#ddd"/>
    <line x1="0" y1="0" x2="1000" y2="0" stroke="#c33" stroke-width="3"/>
    <line x1="0" y1="880" x2="1000" y2="880" stroke="#888" stroke-width="2" stroke-dasharray="10 8"/>
    <line x1="0" y1="180" x2="1000" y2="180" stroke="#888" stroke-width="2" stroke-dasharray="10 8"/>
  `;
  r.strokes.forEach((st, i) => {
    const ring = renderStroke(st, params);
    cells += `<path d="${ringsToPath([[ring]])}" fill="${colors[i%7]}" fill-opacity="0.55" stroke="${colors[i%7]}" stroke-width="2"/>`;
  });
  cells += `<path d="${ringsToPath(r.polys)}" fill="none" stroke="#000" stroke-width="1.5" stroke-dasharray="4 4"/>`;
  cells += `<polyline points="${sk.strokes.map(s=>s.pts.map(p=>`${p.x},${p.y}`).join(' ')).join(' ')}" fill="none" stroke="#111" stroke-width="2" stroke-dasharray="2 6"/>`;
  cells += `</g>`;
});
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${20+chars.length*620}" height="600">${cells}</svg>`;
writeFileSync('tests/out/one.svg', svg);
