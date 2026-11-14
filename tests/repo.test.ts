import { beforeEach, describe, expect, it, vi } from 'vitest';

/** 最小 localStorage 桩，用于测持久化汇总逻辑 */
class MemoryStorage {
  private map = new Map<string, string>();
  getItem(k: string) { return this.map.get(k) ?? null; }
  setItem(k: string, v: string) { this.map.set(k, v); }
  removeItem(k: string) { this.map.delete(k); }
  clear() { this.map.clear(); }
}

const store = new MemoryStorage();

beforeEach(() => {
  vi.stubGlobal('window', {
    localStorage: store,
    dispatchEvent: () => true,
    addEventListener: () => {},
    removeEventListener: () => {},
  });
  vi.stubGlobal('localStorage', store);
  store.clear();
});

import {
  addSubmission,
  buildMistakeBook,
  listSubmissions,
  saveReview,
  summarizeByClass,
} from '../src/storage/repo';
import { SCENARIOS, referenceAssignments } from '../src/data/scenarios';
import { simulateRun } from '../src/game/engine';
import type { BlockedAttempt, Submission } from '../src/game/types';

function makeSubmission(id: string, studentId: string, cls: string, scenarioId: string): Submission {
  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;
  const assignments = referenceAssignments(scenario);
  return {
    id,
    scenarioId,
    scenarioTitle: scenario.title,
    tier: scenario.tier,
    studentId,
    studentName: studentId,
    classCode: cls,
    scenario,
    assignments,
    result: simulateRun(scenario, assignments),
    blocked: [],
    submittedAt: new Date().toISOString(),
    durationSec: 100,
  };
}

describe('班级汇总', () => {
  it('按班级聚合平均客观分与复核后最终分', () => {
    const a = makeSubmission('s1', 'u1', 'A班', 'lv-2');
    const b = makeSubmission('s2', 'u2', 'A班', 'lv-3');
    const c = makeSubmission('s3', 'u3', 'B班', 'lv-2');
    const rows = summarizeByClass([a, b, c], [
      { submissionId: 's1', deduction: 10, comment: '', gradedBy: 't', gradedAt: '' },
    ]);
    expect(rows).toHaveLength(2);
    const aClass = rows.find((r) => r.classCode === 'A班')!;
    expect(aClass.students).toBe(2);
    expect(aClass.reviewed).toBe(1);
    expect(aClass.finalAvg).toBeLessThan(aClass.avgObjective);
  });

  it('没有提交时返回空数组', () => {
    expect(summarizeByClass([], [])).toEqual([]);
  });
});

describe('提交与复核持久化', () => {
  it('写入后可按 id 读回，复核覆盖旧值', () => {
    addSubmission(makeSubmission('s1', 'u1', 'A班', 'lv-2'));
    expect(listSubmissions()).toHaveLength(1);

    saveReview({ submissionId: 's1', deduction: 5, comment: '第一次', gradedBy: 't', gradedAt: 'x' });
    saveReview({ submissionId: 's1', deduction: 7, comment: '第二次', gradedBy: 't', gradedAt: 'y' });
    const stored = JSON.parse(store.getItem('pilot-trainer:v1:reviews')!);
    expect(stored).toHaveLength(1);
    expect(stored[0].deduction).toBe(7);
  });
});

describe('错题本', () => {
  it('按规则归类、按次数倒序、保留例子', () => {
    const blocked: BlockedAttempt[] = [
      { id: '1', rule: 'draft', message: '吃水超限 A', atMin: 0, attemptedAt: '', scenarioId: 'lv-2' },
      { id: '2', rule: 'draft', message: '吃水超限 B', atMin: 0, attemptedAt: '', scenarioId: 'lv-2' },
      { id: '3', rule: 'pilot-overlap', message: '引航员重叠', atMin: 0, attemptedAt: '', scenarioId: 'lv-2' },
    ];
    const book = buildMistakeBook(blocked);
    expect(book[0].rule).toBe('draft');
    expect(book[0].count).toBe(2);
    expect(book[0].label).toBe('吃水超泊位限制');
    expect(book[0].examples).toHaveLength(2);
    expect(book[1].count).toBe(1);
  });

  it('无可拦截记录时为空', () => {
    expect(buildMistakeBook([])).toEqual([]);
  });
});
