import type {
  Assignment,
  BlockedAttempt,
  BlockedRule,
  MistakeStat,
  Review,
  RunResult,
  Scenario,
  Student,
  Submission,
  Tier,
} from '../game/types';

/** 持久化层：localStorage 分键存储，教师端与学员端共用。 */

const PREFIX = 'pilot-trainer:v1:';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // 存储满 / 隐私模式：静默降级为内存态
  }
  window.dispatchEvent(new CustomEvent(DATA_CHANGED));
}

export const DATA_CHANGED = 'pilot-trainer:data-changed';

/** 订阅任意数据变更（保存提交、复核、自编题） */
export function subscribeData(listener: () => void): () => void {
  window.addEventListener(DATA_CHANGED, listener);
  return () => window.removeEventListener(DATA_CHANGED, listener);
}

/* ------------------------------ 学员 ------------------------------ */

export function listStudents(): Student[] {
  const existing = read<Student[]>('students', []);
  if (existing.length > 0) return existing;
  const seeded: Student[] = [
    { id: 'stu-01', name: '林川', classCode: '引航 2401' },
    { id: 'stu-02', name: '何静', classCode: '引航 2401' },
    { id: 'stu-03', name: '许洋', classCode: '引航 2401' },
    { id: 'stu-04', name: '赵启', classCode: '引航 2402' },
    { id: 'stu-05', name: '苏禾', classCode: '引航 2402' },
  ];
  write('students', seeded);
  return seeded;
}

export function saveStudent(student: Student): void {
  const list = listStudents().filter((s) => s.id !== student.id);
  write('students', [...list, student]);
}

/* ------------------------------ 提交 ------------------------------ */

export function listSubmissions(): Submission[] {
  return read<Submission[]>('submissions', []);
}

export function getSubmission(id: string): Submission | undefined {
  return listSubmissions().find((s) => s.id === id);
}

export function addSubmission(submission: Submission): void {
  write('submissions', [submission, ...listSubmissions()]);
}

export function listReviews(): Review[] {
  return read<Review[]>('reviews', []);
}

export function saveReview(review: Review): void {
  const list = listReviews().filter((r) => r.submissionId !== review.submissionId);
  write('reviews', [...list, review]);
}

/* ------------------------------ 教师端自编题 ------------------------------ */

export interface CustomScenarioRecord {
  scenario: Scenario;
  createdAt: string;
}

export function listCustomScenarios(): CustomScenarioRecord[] {
  return read<CustomScenarioRecord[]>('custom-scenarios', []);
}

export function saveCustomScenario(scenario: Scenario): void {
  const list = listCustomScenarios().filter((c) => c.scenario.id !== scenario.id);
  write('custom-scenarios', [{ scenario, createdAt: new Date().toISOString() }, ...list]);
}

export function deleteCustomScenario(id: string): void {
  write('custom-scenarios', listCustomScenarios().filter((c) => c.scenario.id !== id));
}

/* ------------------------------ 当前身份 ------------------------------ */

export interface Session {
  role: 'student' | 'teacher';
  studentId?: string;
}

export function loadSession(): Session {
  return read<Session>('session', { role: 'student' });
}

export function saveSession(session: Session): void {
  write('session', session);
}

export function saveDraft(scenarioId: string, assignments: Assignment[]): void {
  write(`draft:${scenarioId}`, assignments);
}

export function loadDraft(scenarioId: string): Assignment[] | null {
  return read<Assignment[] | null>(`draft:${scenarioId}`, null);
}

/* ------------------------------ 汇总与错题本 ------------------------------ */

export interface ClassSummaryRow {
  classCode: string;
  students: number;
  submissions: number;
  avgObjective: number;
  avgPunctuality: number;
  avgConflictRate: number;
  avgWaitMin: number;
  reviewed: number;
  finalAvg: number;
}

export function summarizeByClass(submissions: Submission[], reviews: Review[]): ClassSummaryRow[] {
  const rows = new Map<string, Submission[]>();
  for (const sub of submissions) {
    const list = rows.get(sub.classCode) ?? [];
    list.push(sub);
    rows.set(sub.classCode, list);
  }
  const result: ClassSummaryRow[] = [];
  for (const [classCode, subs] of rows) {
    const students = new Set(subs.map((s) => s.studentId)).size;
    const avgObjective = avg(subs.map((s) => s.result.metrics.objective));
    const avgPunctuality = avg(subs.map((s) => s.result.metrics.onTimeRate * 100));
    const avgConflictRate = avg(subs.map((s) => s.result.metrics.incidentCount));
    const avgWaitMin = avg(subs.map((s) => s.result.metrics.avgWaitMin));
    const reviewMap = new Map(reviews.map((r) => [r.submissionId, r]));
    const finals = subs.map((s) => {
      const r = reviewMap.get(s.id);
      if (!r) return s.result.metrics.objective;
      return Math.max(0, s.result.metrics.objective - r.deduction);
    });
    result.push({
      classCode,
      students,
      submissions: subs.length,
      avgObjective: avgObjective,
      avgPunctuality,
      avgConflictRate,
      avgWaitMin,
      reviewed: subs.filter((s) => reviewMap.has(s.id)).length,
      finalAvg: avg(finals),
    });
  }
  return result.sort((a, b) => a.classCode.localeCompare(b.classCode));
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

/** 错题本：把拦截过的冲突类型归类统计，附真实例子 */
export function buildMistakeBook(
  blocked: BlockedAttempt[],
  filter?: { scenarioId?: string },
): MistakeStat[] {
  const filtered = blocked.filter((b) => {
    if (filter?.scenarioId && b.scenarioId !== filter.scenarioId) return false;
    return true;
  });
  const byRule = new Map<BlockedRule, BlockedAttempt[]>();
  for (const b of filtered) {
    const list = byRule.get(b.rule) ?? [];
    list.push(b);
    byRule.set(b.rule, list);
  }
  return [...byRule.entries()]
    .map(([rule, list]) => ({
      rule,
      label: ruleLabel(rule),
      count: list.length,
      examples: list.slice(0, 3).map((b) => b.message),
    }))
    .sort((a, b) => b.count - a.count);
}

const RULE_LABELS: Record<BlockedRule, string> = {
  'duplicate-ship': '重复排船',
  eta: '早于预计到港',
  horizon: '超出训练时限',
  draft: '吃水超泊位限制',
  'berth-length': '船长超泊位',
  'tide-window': '错过潮窗',
  'berth-overlap': '泊位时段重叠',
  'pilot-overlap': '引航员时间重叠',
};

function ruleLabel(rule: BlockedRule): string {
  return RULE_LABELS[rule] ?? rule;
}

/** 把某位学员的拦截记录从提交里取出来（提交内自带 blocked） */
export function blockedFromSubmissions(submissions: Submission[]): BlockedAttempt[] {
  return submissions.flatMap((s) => s.blocked);
}

export function tierLabel(tier: Tier): string {
  return tier === 'beginner' ? '初级' : '高级';
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function freshSubmissionId(): string {
  return `sub-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(36)}`;
}

export type { RunResult };
