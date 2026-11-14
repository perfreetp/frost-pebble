import { buildSeedRecords } from '../src/lib/seed';
import { generateGlyph } from '../src/lib/generator';
import { getSkeleton } from '../src/lib/skeletons';

const recs = buildSeedRecords();
const rec = recs[0]; // 永
const sk = getSkeleton(rec.char)!;
const v = rec.versions[0];
const p = v.params;
const a = generateGlyph({ char: rec.char, skeleton: sk, params: p });
const b = generateGlyph({ char: rec.char, skeleton: sk, params: { ...p } });
console.log('deterministic:', a.fingerprint === b.fingerprint && a.path === b.path);

// manual lock preservation
const m = v.strokes.map((s,i) => i===2 ? {...s, manual: true, poly: [{x:0,y:0},{x:10,y:0},{x:5,y:10}]} : s);
const c = generateGlyph({ char: rec.char, skeleton: sk, params: { ...p, weight: p.weight + 20, seed: p.seed + 1 }, previous: m });
console.log('lockedCount after regen:', c.lockedCount, 'expected 1');
const lockedStroke = c.strokes.find(s => s.manual);
console.log('locked poly preserved:', JSON.stringify(lockedStroke?.poly));
