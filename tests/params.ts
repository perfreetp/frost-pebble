import { writeFileSync } from 'node:fs';
import { generateGlyph, DEFAULT_PARAMS } from '../src/lib/generator';
import { getSkeleton } from '../src/lib/skeletons';
import { ringsToPath } from '../src/lib/geometry';
const ch = process.argv[2] ?? '永';
const variants = [
  { weight: 50, contrast: 0.1, corner: 6, terminal: 'flat' },
  { weight: 86, contrast: 0.3, corner: 22, terminal: 'flat' },
  { weight: 86, contrast: 0.8, corner: 22, terminal: 'flat' },
  { weight: 130, contrast: 0.5, corner: 10, terminal: 'round' },
  { weight: 86, contrast: 0.3, corner: 60, terminal: 'flare' },
  { weight: 86, contrast: 0.3, corner: 22, terminal: 'sharp' },
];
const sk = getSkeleton(ch)!;
let cells='';
variants.forEach((v,i)=>{
  const p = { ...DEFAULT_PARAMS, ...v } as any;
  const r = generateGlyph({ char: ch, skeleton: sk, params: p });
  cells += `<g transform="translate(${(i%3)*330},${Math.floor(i/3)*360})">
    <g transform="translate(10,10) scale(0.31,-0.31) translate(0,-1000)"><rect width="1000" height="1000" fill="#f7f3e9" stroke="#e2d9c6"/><path d="${ringsToPath(r.polys)}" fill="#1a1712" fill-rule="evenodd"/></g>
    <text x="15" y="340" font-size="10" fill="#666">w${p.weight} c${Math.round(p.contrast*100)} r${p.corner} ${p.terminal} · ${r.metrics.inkWidth.toFixed(0)}×${r.metrics.inkHeight.toFixed(0)}</text>
  </g>`;
});
writeFileSync('tests/out/params.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="990" height="720">${cells}</svg>`);
