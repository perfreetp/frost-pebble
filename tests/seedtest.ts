import { buildSeedRecords } from '../src/lib/seed';
const recs = buildSeedRecords();
for (const r of recs) {
  const v = r.versions[r.versions.length - 1];
  console.log(r.id, r.char, r.library, r.weightName, r.status, 'versions', r.versions.length, 'locked', v.lockedCount, 'cog', v.metrics.cogX.toFixed(1), v.metrics.cogY.toFixed(1), 'w', v.metrics.inkWidth.toFixed(0), 'comments', r.comments.length, 'pathlen', v.svgPath.length);
}
