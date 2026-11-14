// localStorage 持久化 + 确定性演示数据
import type {
  ClassInfo, KiteState, Submission, Task, CheckIssue, CriterionScore,
} from '../types';
import { SKELETON_LABEL } from '../types';
import { generateKite } from './generator';
import { runChecks, autoScore } from './validation';
import { rng } from './rng';
import { v } from './geom';

const DB_KEY = 'kite-platform-db-v1';

export interface DB {
  classes: ClassInfo[];
  tasks: Task[];
  submissions: Submission[];
  /** 学员未提交的制作进度: key = `${taskId}:${studentId}` */
  workspaces: Record<string, KiteState>;
}

export function loadDB(): DB {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) {
    try { return JSON.parse(raw) as DB; } catch { /* 损坏则重建 */ }
  }
  const db = seedDemo();
  saveDB(db);
  return db;
}

export function saveDB(db: DB): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function resetDB(): DB {
  const db = seedDemo();
  saveDB(db);
  return db;
}

// ---------- 演示数据 ----------

const FAMILY = ['赵', '钱', '孙', '李', '周', '吴', '郑', '王', '冯', '陈', '褚', '卫'];
const GIVEN = ['雨桐', '浩然', '欣怡', '子轩', '思远', '佳琪', '明哲', '若琳', '嘉懿', '沐阳', '静姝', '云飞'];

function seedDemo(): DB {
  const classes: ClassInfo[] = [
    {
      id: 'class_1', name: '风筝扎制一班',
      students: Array.from({ length: 6 }, (_, i) => ({ id: `s1_${i + 1}`, name: FAMILY[i] + GIVEN[i] })),
    },
    {
      id: 'class_2', name: '风筝扎制二班',
      students: Array.from({ length: 6 }, (_, i) => ({ id: `s2_${i + 1}`, name: FAMILY[i + 6] + GIVEN[i + 6] })),
    },
  ];

  const now = Date.now();
  const day = 86400000;
  const tasks: Task[] = [
    {
      id: 'task_1', title: '菱形板式风筝入门', classId: 'class_1', createdAt: now - 6 * day,
      skeleton: 'diamond', stripCount: 6, wingspan: 1.2, panelCount: 4, tolerancePct: 3,
    },
    {
      id: 'task_2', title: '沙燕硬翅风筝扎制', classId: 'class_1', createdAt: now - 3 * day,
      skeleton: 'hardwing', stripCount: 9, wingspan: 1.0, panelCount: 5, tolerancePct: 4,
    },
    {
      id: 'task_3', title: '软翅金鱼风筝', classId: 'class_2', createdAt: now - 2 * day,
      skeleton: 'softwing', stripCount: 7, wingspan: 0.9, panelCount: 4, tolerancePct: 5,
    },
  ];

  const submissions: Submission[] = [];
  const workspaces: Record<string, KiteState> = {};

  for (const task of tasks) {
    const cls = classes.find(c => c.id === task.classId)!;
    cls.students.forEach((stu, idx) => {
      // 状态分布: 前4人已出结果(2已评/1待评/1退回), 第5人已提交待评, 第6人草稿
      const statusTable: Submission['status'][] = ['graded', 'graded', 'submitted', 'returned'];
      let status: Submission['status'];
      if (idx <= 3) status = statusTable[idx];
      else if (idx === 4) status = 'submitted';
      else status = 'draft';

      const seed = (idx + 1) * 1000 + task.id.charCodeAt(5) * 7;
      let kite = generateKite({
        seed, skeleton: task.skeleton, stripCount: task.stripCount,
        wingspan: task.wingspan, panelCount: task.panelCount, tolerancePct: task.tolerancePct,
      });

      // 确定性地给部分学员"手动失误":挪动竹条/接缝,制造超差和不对称
      const r = rng(seed ^ 0x55aa);
      const makeMistakes = idx !== 0; // 第1名学员保持合格
      if (makeMistakes) {
        const targetStrip = kite.strips.find(s => s.id.endsWith('_r') && s.role !== 'spine');
        if (targetStrip) {
          const shift = (0.02 + r() * 0.05) * (idx % 2 ? 1 : -1);
          kite.overrides.stripOffset[targetStrip.id] = v(shift, shift * 0.4, 0);
        }
        if (kite.seams.length > 1 && r() > 0.4) {
          const sp = kite.seams[0];
          kite.overrides.seamOffset[sp.id] = v(0.03 + r() * 0.03, r() * 0.02, 0);
        }
        kite = generateKite(kite.params, kite.overrides);
      }

      const result = runChecks(kite, task);
      const scoring = autoScore(kite, task, result);
      const errorLog = buildErrorLog(result.issues, now);

      if (status === 'draft') {
        workspaces[`${task.id}:${stu.id}`] = kite;
        return;
      }

      const sub: Submission = {
        id: `sub_${task.id}_${stu.id}`,
        taskId: task.id, classId: task.classId,
        studentId: stu.id, studentName: stu.name,
        status,
        submittedAt: now - (5 - idx) * day,
        snapshot: kite,
        issues: result.issues,
        criteria: scoring.criteria,
        autoTotal: scoring.total,
        comment: '',
        attempts: idx === 3 ? 2 : 1,
        errorLog,
        version: 1,
      };
      if (status === 'graded') {
        sub.gradedAt = now - (4 - idx) * day;
        sub.finalTotal = Math.max(0, Math.round((scoring.total - (idx === 1 ? 6 : 0)) * 10) / 10);
        sub.criteria = scoring.criteria.map((c: CriterionScore) => ({
          ...c, teacherScore: idx === 1 ? Math.max(0, c.autoScore - 1) : c.autoScore,
        }));
        sub.comment = idx === 0
          ? '整体结构规范,左右对称控制得很好,继续保持。'
          : '右侧斜撑偏移明显,注意绑扎定位;提线汇交点再向前调整。';
      }
      if (status === 'returned') {
        sub.comment = '翼展偏差超标且右侧骨架不对称,请按标注位置调整后重新提交。';
      }
      submissions.push(sub);
    });
  }

  return { classes, tasks, submissions, workspaces };
}

function buildErrorLog(issues: CheckIssue[], ts: number) {
  const map = new Map<string, { code: string; label: string; count: number; lastAt: number }>();
  for (const is of issues) {
    if (is.pass) continue;
    const cur = map.get(is.code);
    if (cur) cur.count += 1;
    else map.set(is.code, { code: is.code, label: is.label, count: 1, lastAt: ts });
  }
  return [...map.values()];
}

export function taskSummary(t: Task): string {
  return `${SKELETON_LABEL[t.skeleton]} · ${t.stripCount}根竹条 · 翼展${t.wingspan}m · ${t.panelCount}片蒙面 · 允差±${t.tolerancePct}%`;
}
