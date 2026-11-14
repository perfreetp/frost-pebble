// 尺寸/对称性校验 + 自动评分
import type { CheckIssue, CriterionScore, KiteState, Task } from '../types';
import { dist, mm, mirrorX, pointSegDist } from './geom';
import { stripPoints } from './generator';

export interface CheckResult {
  issues: CheckIssue[];
  pass: boolean;
}

function issue(code: string, label: string, pass: boolean, message: string,
  extra?: Partial<CheckIssue>): CheckIssue {
  return { code, label, pass, severity: pass ? 'warn' : 'error', message, ...extra };
}

/** 计算当前实际翼展:所有竹条端点 + 轮廓点的最大 x 差 */
function actualWingspan(kite: KiteState): number {
  const xs: number[] = [];
  kite.strips.forEach(s => { xs.push(s.a.x, s.b.x); });
  kite.silhouette.forEach(p => xs.push(p.x));
  return Math.max(...xs) - Math.min(...xs);
}

export function runChecks(kite: KiteState, task: Task): CheckResult {
  const issues: CheckIssue[] = [];
  const tol = task.tolerancePct / 100;
  const tolMm = task.wingspan * tol;

  // 1. 竹条数量
  const stripOk = kite.strips.length === task.stripCount;
  issues.push(issue('strip_count', '竹条数量', stripOk,
    stripOk
      ? `竹条数量 ${kite.strips.length} 根,符合要求`
      : `要求 ${task.stripCount} 根,实际 ${kite.strips.length} 根,偏差 ${Math.abs(kite.strips.length - task.stripCount)} 根`,
    { deviationMm: Math.abs(kite.strips.length - task.stripCount) }));

  // 2. 翼展尺寸
  const ws = actualWingspan(kite);
  const wsDev = Math.abs(ws - task.wingspan);
  const wsOk = wsDev <= tolMm;
  issues.push(issue('wingspan', '翼展尺寸', wsOk,
    `要求翼展 ${mm(task.wingspan)}mm,实际 ${mm(ws)}mm,偏差 ${mm(wsDev)}mm(允许 ±${mm(tolMm)}mm)`,
    { deviationMm: mm(wsDev) }));

  // 3. 分片数量
  const panelOk = kite.panels.length === task.panelCount;
  issues.push(issue('panel_count', '蒙面分片数', panelOk,
    panelOk
      ? `蒙面 ${kite.panels.length} 片,符合要求`
      : `要求 ${task.panelCount} 片,实际 ${kite.panels.length} 片`,
    { deviationMm: Math.abs(kite.panels.length - task.panelCount) }));

  // 4. 左右对称 —— 成对竹条(镜像端点位置偏差)
  const byId = new Map(kite.strips.map(s => [s.id, s]));
  for (const s of kite.strips) {
    if (!s.mirrorId || s.id.endsWith('_l')) continue; // 每对只从右侧检查一次
    const m = byId.get(s.mirrorId);
    if (!m) continue;
    const dA = dist(s.a, mirrorX(m.a));
    const dB = dist(s.b, mirrorX(m.b));
    const d = Math.max(dA, dB);
    const ok = d <= tolMm;
    issues.push(issue('sym_strip', `对称·${s.name}`, ok,
      `${s.name} 与对侧镜像位置偏差 ${mm(d)}mm(允许 ±${mm(tolMm)}mm)`,
      { targetId: s.id, deviationMm: mm(d) }));
  }

  // 中轴竹条(竖脊)自身左右位置:中点 x 应接近 0
  for (const s of kite.strips) {
    if (s.role !== 'spine') continue;
    const midX = (s.a.x + s.b.x) / 2;
    const d = Math.abs(midX);
    const ok = d <= tolMm;
    issues.push(issue('sym_spine', '对称·竖脊居中', ok,
      `竖脊中点偏离中轴线 ${mm(d)}mm(允许 ±${mm(tolMm)}mm)`,
      { targetId: s.id, deviationMm: mm(d) }));
  }

  // 5. 接缝左右对称
  const seamById = new Map(kite.seams.map(p => [p.id, p]));
  for (const p of kite.seams) {
    if (!p.mirrorId) continue;
    const m = seamById.get(p.mirrorId);
    if (!m) continue;
    const d = dist(p.pos, mirrorX(m.pos));
    const ok = d <= tolMm;
    issues.push(issue('sym_seam', `对称·接缝 ${p.id}`, ok,
      `接缝 ${p.id} 与对侧镜像偏差 ${mm(d)}mm(允许 ±${mm(tolMm)}mm)`,
      { targetId: p.id, deviationMm: mm(d) }));
  }

  // 6. 骨架连接:每根非竖脊竹条至少有一个端点落在另一根竹条上(绑扎点)
  for (const s of kite.strips) {
    if (s.role === 'spine') continue;
    const connected = kite.strips.some(other => {
      if (other.id === s.id) return false;
      const pts = stripPoints(other, 12);
      for (let i = 0; i < pts.length - 1; i++) {
        if (pointSegDist(s.a, pts[i], pts[i + 1]) < 0.022 || pointSegDist(s.b, pts[i], pts[i + 1]) < 0.022) return true;
      }
      return false;
    });
    if (!connected) {
      issues.push(issue('connect', `连接·${s.name}`, false,
        `${s.name} 两端均未与其他竹条绑扎(间距 > 22mm),骨架不成立`,
        { targetId: s.id }));
    }
  }

  // 7. 翅条弧度合理性:硬翅/软翅翅条弯曲不得过大或反翘
  for (const s of kite.strips) {
    if (s.role !== 'wing') continue;
    const ok = s.curvature >= 0 && s.curvature <= 0.45;
    if (!ok) {
      issues.push(issue('curvature', `弧度·${s.name}`, false,
        `${s.name} 弧度系数 ${s.curvature.toFixed(2)} 超出合理区间 [0, 0.45]`,
        { targetId: s.id }));
    }
  }

  // 8. 提线点:位于中轴附近,且在蒙面前方(z>0),汇交距离合理
  const b = kite.bridle;
  const knotXOk = Math.abs(b.knot.x) <= tolMm;
  issues.push(issue('bridle_x', '提线·左右居中', knotXOk,
    `提线汇交点左右偏移 ${mm(Math.abs(b.knot.x))}mm(允许 ±${mm(tolMm)}mm)`,
    { targetId: 'bridle', deviationMm: mm(Math.abs(b.knot.x)) }));
  const knotZOk = b.knot.z > 0 && b.knot.z <= task.wingspan * 0.4;
  issues.push(issue('bridle_z', '提线·前后距离', knotZOk,
    knotZOk
      ? `提线汇交点距蒙面 ${mm(b.knot.z)}mm,距离合理`
      : `提线汇交点距蒙面 ${mm(b.knot.z)}mm,应在 0 ~ ${mm(task.wingspan * 0.4)}mm 之间`,
    { targetId: 'bridle', deviationMm: mm(b.knot.z) }));
  const attachOk = kite.strips.some(s => pointSegDist(b.attach, s.a, s.b) < 0.03);
  issues.push(issue('bridle_attach', '提线·附着点', attachOk,
    attachOk ? '提线附着点落在骨架上' : '提线附着点未落在任何竹条上(间距 > 30mm)',
    { targetId: 'bridle' }));

  const pass = issues.filter(i => !i.pass).length === 0;
  return { issues, pass };
}

// ---------- 自动评分:参数符合度 40 + 骨架合理性 60 ----------

export interface Scoring {
  criteria: CriterionScore[];
  total: number;
}

export function autoScore(kite: KiteState, task: Task, result: CheckResult): Scoring {
  // 参数符合度 40 分
  const c1Max = 10;
  const c2Max = 18;
  const c3Max = 12;
  const c1 = result.issues.some(i => i.code === 'strip_count' && !i.pass) ? 0 : c1Max;
  const c3 = result.issues.some(i => i.code === 'panel_count' && !i.pass) ? 0 : c3Max;
  const wsIssue = result.issues.find(i => i.code === 'wingspan');
  const tolMm = task.wingspan * (task.tolerancePct / 100) * 1000;
  // 翼展:允差内满分,超差按"偏差/允差"线性扣分,扣完为止
  const c2 = wsIssue?.pass
    ? c2Max
    : Math.max(0, c2Max * (1 - ((wsIssue?.deviationMm ?? tolMm) - tolMm) / tolMm));

  // 骨架合理性 60 分
  const c4Max = 22; // 左右对称
  const symIssues = result.issues.filter(i => i.code.startsWith('sym_'));
  const symFail = symIssues.filter(i => !i.pass).length;
  const c4 = Math.max(0, c4Max - symFail * 5);

  const c5Max = 18; // 连接/弧度
  const structFail = result.issues.filter(i => (i.code === 'connect' || i.code === 'curvature') && !i.pass).length;
  const c5 = Math.max(0, c5Max - structFail * 6);

  const c6Max = 20; // 提线
  const bridleFail = result.issues.filter(i => i.code.startsWith('bridle') && !i.pass).length;
  const c6 = Math.max(0, c6Max - bridleFail * 7);

  const criteria: CriterionScore[] = [
    { code: 'c1', label: '竹条数量符合度', autoScore: c1, maxScore: c1Max },
    { code: 'c2', label: '翼展尺寸精度', autoScore: Math.round(c2 * 10) / 10, maxScore: c2Max },
    { code: 'c3', label: '蒙面分片符合度', autoScore: c3, maxScore: c3Max },
    { code: 'c4', label: '左右对称性', autoScore: c4, maxScore: c4Max },
    { code: 'c5', label: '骨架连接与弧度合理性', autoScore: c5, maxScore: c5Max },
    { code: 'c6', label: '提线布置合理性', autoScore: c6, maxScore: c6Max },
  ];
  const total = Math.round(criteria.reduce((s, c) => s + c.autoScore, 0) * 10) / 10;
  return { criteria, total };
}
