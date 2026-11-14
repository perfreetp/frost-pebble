import { createStore } from 'solid-js/store';
import type {
  ClassInfo, KiteState, Submission, Task, Vec3, KiteParams, SkeletonType,
} from './types';
import { loadDB, saveDB, resetDB, type DB } from './lib/storage';
import { generateKite, TYPE_SPEC } from './lib/generator';
import { runChecks, autoScore } from './lib/validation';
import { uid, clamp } from './lib/geom';

export type Role = 'teacher' | 'student';
export type Page = 'tasks' | 'workspace' | 'review' | 'stats';

interface AppState extends DB {
  role: Role;
  page: Page;
  currentStudentId: string;
  activeTaskId: string | null;      // 学员制作中的任务
  reviewSubmissionId: string | null; // 复核界面选中的提交
}

const initial = loadDB();

const [state, setState] = createStore<AppState>({
  ...initial,
  role: 'teacher',
  page: 'tasks',
  currentStudentId: initial.classes[0]?.students[0]?.id ?? '',
  activeTaskId: null,
  reviewSubmissionId: null,
});

function persist() {
  const { role, page, currentStudentId, activeTaskId, reviewSubmissionId, ...db } = state;
  void role; void page; void currentStudentId; void activeTaskId; void reviewSubmissionId;
  saveDB(db);
}

export function useStore() {
  return { state, setState };
}

// ---------- 会话/导航 ----------

export const actions = {
  goto(page: Page) {
    setState('page', page);
  },
  setRole(role: Role) {
    setState('role', role);
    setState('page', role === 'teacher' ? 'tasks' : 'workspace');
  },
  setStudent(studentId: string) {
    setState('currentStudentId', studentId);
    setState('activeTaskId', null);
  },
  resetDemo() {
    const db = resetDB();
    setState({ ...db, activeTaskId: null, reviewSubmissionId: null });
  },

  // ---------- 教师出题 ----------
  createTask(input: Omit<Task, 'id' | 'createdAt'>): Task {
    const task: Task = { ...input, id: uid('task'), createdAt: Date.now() };
    setState('tasks', (ts) => [task, ...ts]);
    persist();
    return task;
  },
  deleteTask(id: string) {
    setState('tasks', (ts) => ts.filter(t => t.id !== id));
    setState('submissions', (ss) => ss.filter(s => s.taskId !== id));
    persist();
  },

  // ---------- 学员工作区 ----------
  workspaceKey(taskId: string, studentId: string) {
    return `${taskId}:${studentId}`;
  },
  openWorkspace(taskId: string) {
    setState('activeTaskId', taskId);
    setState('page', 'workspace');
    const key = this.workspaceKey(taskId, state.currentStudentId);
    if (!state.workspaces[key]) {
      const task = state.tasks.find(t => t.id === taskId);
      if (task) {
        const kite = generateKite({
          seed: 1000 + hashStudentTask(taskId, state.currentStudentId),
          skeleton: task.skeleton, stripCount: task.stripCount, wingspan: task.wingspan,
          panelCount: task.panelCount, tolerancePct: task.tolerancePct,
        });
        setState('workspaces', key, kite);
        persist();
      }
    }
  },
  currentKite(): KiteState | undefined {
    if (!state.activeTaskId) return undefined;
    return state.workspaces[this.workspaceKey(state.activeTaskId, state.currentStudentId)];
  },
  currentTask(): Task | undefined {
    return state.tasks.find(t => t.id === state.activeTaskId);
  },
  /** 换参数重新生成:同种子结果一致,overrides 中的手动修改按 id 保留 */
  regenerate(patch: Partial<KiteParams>) {
    const kite = this.currentKite();
    if (!kite || !state.activeTaskId) return;
    const next = generateKite({ ...kite.params, ...patch }, kite.overrides);
    setState('workspaces', this.workspaceKey(state.activeTaskId, state.currentStudentId), next);
    persist();
  },
  setSeed(seed: number) {
    this.regenerate({ seed });
  },
  setParam(field: 'stripCount' | 'wingspan' | 'panelCount', value: number) {
    const kite = this.currentKite();
    if (!kite) return;
    const spec = TYPE_SPEC[kite.params.skeleton];
    const ranges: Record<string, [number, number]> = {
      stripCount: [spec.minStrips, spec.maxStrips],
      panelCount: [spec.minPanels, spec.maxPanels],
      wingspan: [0.3, 3],
    };
    const [lo, hi] = ranges[field];
    this.regenerate({ [field]: clamp(value, lo, hi) } as Partial<KiteParams>);
  },

  // ---------- 三维交互编辑 ----------
  commitKite(kite: KiteState) {
    if (!state.activeTaskId) return;
    setState('workspaces', this.workspaceKey(state.activeTaskId, state.currentStudentId), { ...kite });
    persist();
  },
  dragStrip(stripId: string, offset: Vec3) {
    const kite = this.currentKite();
    if (!kite) return;
    const overrides = {
      ...kite.overrides,
      stripOffset: { ...kite.overrides.stripOffset, [stripId]: offset },
    };
    this.commitKite(generateKite(kite.params, overrides));
  },
  setCurvature(stripId: string, curvature: number) {
    const kite = this.currentKite();
    if (!kite) return;
    const overrides = {
      ...kite.overrides,
      curvature: { ...kite.overrides.curvature, [stripId]: clamp(curvature, -1, 1) },
    };
    this.commitKite(generateKite(kite.params, overrides));
  },
  dragSeam(seamId: string, offset: Vec3) {
    const kite = this.currentKite();
    if (!kite) return;
    const overrides = {
      ...kite.overrides,
      seamOffset: { ...kite.overrides.seamOffset, [seamId]: offset },
    };
    this.commitKite(generateKite(kite.params, overrides));
  },
  moveBridleKnot(knot: Vec3) {
    const kite = this.currentKite();
    if (!kite) return;
    const overrides = { ...kite.overrides, bridleKnot: knot };
    this.commitKite(generateKite(kite.params, overrides));
  },
  resetStrip(stripId: string) {
    const kite = this.currentKite();
    if (!kite) return;
    const o = { ...kite.overrides };
    delete o.stripOffset[stripId];
    delete o.curvature[stripId];
    this.commitKite(generateKite(kite.params, o));
  },
  resetSeam(seamId: string) {
    const kite = this.currentKite();
    if (!kite) return;
    const o = { ...kite.overrides };
    delete o.seamOffset[seamId];
    this.commitKite(generateKite(kite.params, o));
  },
  resetBridle() {
    const kite = this.currentKite();
    if (!kite) return;
    const o = { ...kite.overrides };
    delete o.bridleKnot;
    this.commitKite(generateKite(kite.params, o));
  },
  resetAll() {
    const kite = this.currentKite();
    if (!kite) return;
    this.commitKite(generateKite(kite.params));
  },

  // ---------- 提交与评分 ----------
  submit() {
    const kite = this.currentKite();
    const task = this.currentTask();
    if (!kite || !task) return;
    const result = runChecks(kite, task);
    const scoring = autoScore(kite, task, result);
    const key = this.workspaceKey(task.id, state.currentStudentId);
    const existing = state.submissions.find(
      s => s.taskId === task.id && s.studentId === state.currentStudentId,
    );
    const now = Date.now();
    const mergedLog = mergeErrorLog(existing?.errorLog ?? [], result.issues, now);

    if (existing) {
      setState('submissions', (ss) => ss.map(s => s.id === existing.id ? {
        ...s,
        status: 'submitted', submittedAt: now,
        snapshot: kite, issues: result.issues, criteria: scoring.criteria,
        autoTotal: scoring.total, errorLog: mergedLog,
        attempts: s.attempts + 1, version: s.version + 1,
      } : s));
    } else {
      const sub: Submission = {
        id: uid('sub'), taskId: task.id, classId: task.classId,
        studentId: state.currentStudentId,
        studentName: state.classes
          .flatMap(c => c.students).find(x => x.id === state.currentStudentId)?.name ?? '学员',
        status: 'submitted', submittedAt: now,
        snapshot: kite, issues: result.issues, criteria: scoring.criteria,
        autoTotal: scoring.total, comment: '', attempts: 1,
        errorLog: mergedLog, version: 1,
      };
      setState('submissions', (ss) => [sub, ...ss]);
    }
    // 提交后清掉草稿
    setState('workspaces', (w) => {
      const copy = { ...w };
      delete copy[key];
      return copy;
    });
    persist();
  },
  mySubmission(taskId: string): Submission | undefined {
    return state.submissions.find(
      s => s.taskId === taskId && s.studentId === state.currentStudentId,
    );
  },

  // ---------- 教师复核 ----------
  openReview(submissionId: string) {
    setState('reviewSubmissionId', submissionId);
    setState('page', 'review');
  },
  gradeSubmission(submissionId: string, teacherScores: Record<string, number>, comment: string) {
    setState('submissions', (ss) => ss.map(s => {
      if (s.id !== submissionId) return s;
      const criteria = s.criteria.map(c => ({ ...c, teacherScore: clamp(teacherScores[c.code] ?? c.autoScore, 0, c.maxScore) }));
      const finalTotal = Math.round(criteria.reduce((sum, c) => sum + (c.teacherScore ?? c.autoScore), 0) * 10) / 10;
      return { ...s, status: 'graded' as const, gradedAt: Date.now(), criteria, finalTotal, comment };
    }));
    persist();
  },
  returnSubmission(submissionId: string, comment: string) {
    setState('submissions', (ss) => ss.map(s => s.id === submissionId
      ? { ...s, status: 'returned' as const, comment, gradedAt: Date.now() }
      : s));
    persist();
  },

  // ---------- 统计 ----------
  classStats(classId: string) {
    const cls = state.classes.find(c => c.id === classId);
    const taskIds = new Set(state.tasks.filter(t => t.classId === classId).map(t => t.id));
    const subs = state.submissions.filter(s => taskIds.has(s.taskId) && s.classId === classId);
    const graded = subs.filter(s => s.status === 'graded');
    const studentCount = cls?.students.length ?? 0;
    // 提交率:有提交记录(含退回)的学员占比 —— 按 (学员×任务) 组合计
    const totalSlots = studentCount * taskIds.size;
    const submittedSlots = new Set(subs.map(s => `${s.taskId}:${s.studentId}`)).size;
    const avgScore = graded.length
      ? Math.round(graded.reduce((sum, s) => sum + (s.finalTotal ?? s.autoTotal), 0) / graded.length * 10) / 10
      : null;
    const errorCounts = new Map<string, { label: string; count: number }>();
    subs.forEach(s => s.errorLog.forEach(e => {
      const cur = errorCounts.get(e.code) ?? { label: e.label, count: 0 };
      cur.count += e.count;
      errorCounts.set(e.code, cur);
    }));
    return {
      studentCount, taskCount: taskIds.size,
      submitRate: totalSlots ? Math.round(submittedSlots / totalSlots * 1000) / 10 : 0,
      avgScore,
      errors: [...errorCounts.entries()].map(([code, v]) => ({ code, ...v })).sort((a, b) => b.count - a.count),
    };
  },
};

function mergeErrorLog(
  prev: Submission['errorLog'], issues: Submission['issues'], ts: number,
): Submission['errorLog'] {
  const map = new Map(prev.map(e => [e.code, { ...e }]));
  for (const is of issues) {
    if (is.pass) continue;
    const cur = map.get(is.code);
    if (cur) { cur.count += 1; cur.lastAt = ts; }
    else map.set(is.code, { code: is.code, label: is.label, count: 1, lastAt: ts });
  }
  return [...map.values()];
}

function hashStudentTask(taskId: string, studentId: string): number {
  let h = 2166136261;
  const s = `${taskId}:${studentId}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function skeletonOf(t: Task): SkeletonType {
  return t.skeleton;
}

export function allStudents(): ClassInfo['students'] {
  return state.classes.flatMap(c => c.students);
}
