import { writeFileSync } from 'node:fs';
import { getSkeleton } from '../src/lib/skeletons';
import { buildStrokeNodes, renderStroke, DEFAULT_PARAMS } from '../src/lib/generator';
import { unionRings, ringsToPath } from '../src/lib/geometry';

const ch = process.argv[2] ?? '口';
const sk = getSkeleton(ch)!;
let cells = '';
sk.strokes.forEach((st, i) => {
  const s = buildStrokeNodes(st, DEFAULT_PARAMS.seed, ch, 0);
  const ring = renderStroke(s, DEFAULT_PARAMS);
  const merged = unionRings([ring]);
  const x = i * 300;
  cells += `<g transform="translate(${x},10) scale(0.28,-0.28) translate(0,-1000)">
    <rect width="1000" height="1000" fill="#f7f3e9"/>
    <path d="${ringsToPath([[ring]])}" fill="#c0392b" fill-opacity="0.5" stroke="#900" stroke-width="2"/>
    <path d="${ringsToPath(merged)}" fill="none" stroke="#1a6" stroke-width="3"/>
    <circle cx="${s.nodes[0].x}" cy="${s.nodes[0].y}" r="8" fill="#00f"/>
  </g>`;
});
writeFileSync('tests/out/strokes.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="${sk.strokes.length*300}" height="300">${cells}</svg>`);
console.log(ch, sk.strokes.length);
