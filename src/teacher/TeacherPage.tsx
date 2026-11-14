import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Review, Scenario, Submission } from '../game/types';
import { clock } from '../game/engine';
import { planScenario } from '../game/planner';
import {
  subscribeData,
  buildMistakeBook,
  deleteCustomScenario,
  formatDateTime,
  listCustomScenarios,
  listReviews,
  listSubmissions,
  saveCustomScenario,
  saveReview,
  summarizeByClass,
  tierLabel,
} from '../storage/repo';
import { BlockedFeed, Chip, IncidentList, Modal, StatCard, ToastHost, type ToastMsg } from '../components/ui';
import { TimelineCanvas } from '../components/TimelineCanvas';
import type { TimelineState } from '../pixi/TimelineView';
import { BlankScenarioEditor } from './ScenarioEditor';

type Tab = 'review' | 'classes' | 'mistakes' | 'author';

export function TeacherPage({
  focusSubmissionId,
  onReview,
  onReplay,
}: {
  focusSubmissionId?: string;
  onReview: (submissionId: string) => void;
  onReplay: (scenarioId: string) => void;
}) {
  const [tab, setTab] = useState<Tab>(focusSubmissionId ? 'review' : 'review');
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const pushToast = useCallback((kind: 'error' | 'ok', text: string) => {
    setToasts((l) => [...l, { id: Date.now() + Math.random(), kind, text }]);
  }, []);

  const [dataVersion, setDataVersion] = useState(0);
  useEffect(() => subscribeData(() => setDataVersion((v) => v + 1)), []);

  const submissions = useMemo(() => listSubmissions(), [dataVersion]);
  const reviews = useMemo(() => listReviews(), [dataVersion]);
  const custom = useMemo(() => listCustomScenarios(), [dataVersion]);

  const focus = focusSubmissionId ? submissions.find((s) => s.id === focusSubmissionId) : undefined;

  const allBlocked = useMemo(() => submissions.flatMap((s) => s.blocked), [submissions]);
  const mistakes = useMemo(() => buildMistakeBook(allBlocked), [allBlocked]);

  const classRows = useMemo(() => summarizeByClass(submissions, reviews), [submissions, reviews]);

  if (focus) {
    return (
      <TeacherReview
        submission={focus}
        onDone={() => {
          pushToast('ok', '复核已保存，队列与班级成绩已更新。');
          window.location.hash = '/teacher';
        }}
        toasts={toasts}
        onDismiss={(id) => setToasts((l) => l.filter((t) => t.id !== id))}
        onReplay={onReplay}
      />
    );
  }

  return (
    <main className="page">
      <div className="pageHeader">
        <div>
          <h1>教师端</h1>
          <p>复核学员提交、按班级查看成绩、统计错题类型，或自己出题。</p>
        </div>
        <div className="headSpacer" />
        <Chip tone="blue">{submissions.length} 份提交</Chip>
        <Chip tone="teal">{custom.length} 道自编题</Chip>
      </div>

      <div className="tabs" role="tablist">
        {([
          ['review', '复核队列'],
          ['classes', '班级成绩'],
          ['mistakes', '错题本'],
          ['author', '出题'],
        ] as Array<[Tab, string]>).map(([key, label]) => (
          <button
            key={key}
            className="tab"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            data-testid={`tab-${key}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'review' && (
        <ReviewQueue submissions={submissions} reviews={reviews} onReview={onReview} />
      )}
      {tab === 'classes' && <ClassTable rows={classRows} submissions={submissions} reviews={reviews} onOpen={onReview} />}
      {tab === 'mistakes' && <Mistakes mistakes={mistakes} submissions={submissions} />}
      {tab === 'author' && (
        <AuthorTab
          custom={custom}
          onSaved={(msg) => pushToast('ok', msg)}
          onOpen={(scenarioId) => onReplay(scenarioId)}
        />
      )}

      <ToastHost toasts={toasts} onDismiss={(id) => setToasts((l) => l.filter((t) => t.id !== id))} />
    </main>
  );
}

/* ------------------------------ 复核队列 ------------------------------ */

function ReviewQueue({
  submissions,
  reviews,
  onReview,
}: {
  submissions: Submission[];
  reviews: Review[];
  onReview: (id: string) => void;
}) {
  const reviewedIds = new Set(reviews.map((r) => r.submissionId));
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('pending');
  const list = submissions.filter((s) => {
    if (filter === 'pending') return !reviewedIds.has(s.id);
    if (filter === 'done') return reviewedIds.has(s.id);
    return true;
  });
  return (
    <div className="panel">
      <div className="panelHead">
        <h3>复核队列</h3>
        <div className="headSpacer" />
        <select
          className="select small"
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
        >
          <option value="pending">待复核</option>
          <option value="done">已复核</option>
          <option value="all">全部</option>
        </select>
      </div>
      {list.length === 0 ? (
        <div className="emptyState">队列里暂时没有提交。</div>
      ) : (
        <div style={{ overflow: 'auto' }}>
          <table className="dataTable">
            <thead>
              <tr>
                <th>学员</th>
                <th>班级</th>
                <th>关卡</th>
                <th className="right">客观分</th>
                <th className="right">准点率</th>
                <th className="right">冲突</th>
                <th className="right">拦截</th>
                <th>状态</th>
                <th>提交时间</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.map((s) => {
                const r = reviews.find((x) => x.submissionId === s.id);
                return (
                  <tr key={s.id}>
                    <td>{s.studentName}</td>
                    <td className="small faint">{s.classCode}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span>{s.scenarioTitle}</span>
                        <Chip tone={s.tier === 'advanced' ? 'amber' : 'teal'}>{tierLabel(s.tier)}</Chip>
                      </div>
                    </td>
                    <td className="right num">{s.result.metrics.objective.toFixed(1)}</td>
                    <td className="right num">{Math.round(s.result.metrics.onTimeRate * 100)}%</td>
                    <td className="right num">{s.result.metrics.incidentCount}</td>
                    <td className="right num">{s.blocked.length}</td>
                    <td>{r ? <Chip tone="green">已复核 -{r.deduction}</Chip> : <Chip tone="amber">待复核</Chip>}</td>
                    <td className="small faint">{formatDateTime(s.submittedAt)}</td>
                    <td>
                      <button className="btn tiny" onClick={() => onReview(s.id)} data-testid={`review-${s.id}`}>
                        复核
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ 班级成绩 ------------------------------ */

function ClassTable({
  rows,
  submissions,
  reviews,
  onOpen,
}: {
  rows: ReturnType<typeof summarizeByClass>;
  submissions: Submission[];
  reviews: Review[];
  onOpen: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(rows[0]?.classCode ?? null);
  const reviewMap = new Map(reviews.map((r) => [r.submissionId, r]));
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="statGrid">
        <StatCard value={rows.length} label="班级数" />
        <StatCard value={submissions.length} label="提交总数" />
        <StatCard
          value={rows.length ? (rows.reduce((a, r) => a + r.avgObjective, 0) / rows.length).toFixed(1) : '—'}
          label="全体平均客观分"
        />
        <StatCard value={reviews.length} label="已复核" tone="amber" />
      </div>
      {rows.length === 0 ? (
        <div className="panel">
          <div className="emptyState">还没有任何提交。</div>
        </div>
      ) : (
        rows.map((row) => {
          const subs = submissions.filter((s) => s.classCode === row.classCode);
          const open = expanded === row.classCode;
          return (
            <div className="panel" key={row.classCode}>
              <div className="panelHead" style={{ cursor: 'pointer' }} onClick={() => setExpanded(open ? null : row.classCode)}>
                <h3>{row.classCode}</h3>
                <div className="headSpacer" />
                <span className="small faint">
                  {row.students} 名学员 · {row.submissions} 份提交 · 已复核 {row.reviewed}
                </span>
                <span className="mono" style={{ color: 'var(--teal)' }}>
                  {row.finalAvg.toFixed(1)} 分
                </span>
                <span className="faint">{open ? '▲' : '▼'}</span>
              </div>
              {open && (
                <div style={{ overflow: 'auto' }}>
                  <table className="dataTable">
                    <thead>
                      <tr>
                        <th>学员</th>
                        <th>关卡</th>
                        <th className="right">客观分</th>
                        <th className="right">准点率</th>
                        <th className="right">冲突</th>
                        <th className="right">平均等待</th>
                        <th className="right">扣分</th>
                        <th className="right">最终</th>
                        <th>评语</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subs.map((s) => {
                        const r = reviewMap.get(s.id);
                        const final = Math.max(0, s.result.metrics.objective - (r?.deduction ?? 0));
                        return (
                          <tr key={s.id} className="clickable" onClick={() => onOpen(s.id)}>
                            <td>{s.studentName}</td>
                            <td className="small">{s.scenarioTitle}</td>
                            <td className="right num">{s.result.metrics.objective.toFixed(1)}</td>
                            <td className="right num">{Math.round(s.result.metrics.onTimeRate * 100)}%</td>
                            <td className="right num">{s.result.metrics.incidentCount}</td>
                            <td className="right num">{s.result.metrics.avgWaitMin.toFixed(0)} 分</td>
                            <td className="right num" style={{ color: r ? 'var(--red)' : 'var(--text-faint)' }}>
                              {r ? `-${r.deduction}` : '—'}
                            </td>
                            <td className="right num">
                              <b>{final.toFixed(1)}</b>
                            </td>
                            <td className="small faint" style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {r?.comment || '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })
      )}
      <div className="panel panelPad">
        <div className="small muted">
          说明：客观分 = 准点率×50 + (30 − 冲突×8) + 效率分（平均等待越短越高）。最终分 = 客观分 − 教员扣分，最低 0 分。
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ 错题本 ------------------------------ */

function Mistakes({
  mistakes,
  submissions,
}: {
  mistakes: ReturnType<typeof buildMistakeBook>;
  submissions: Submission[];
}) {
  const total = mistakes.reduce((a, m) => a + m.count, 0);
  const byClass = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    for (const sub of submissions) {
      for (const b of sub.blocked) {
        const classMap = map.get(sub.classCode) ?? new Map<string, number>();
        classMap.set(b.rule, (classMap.get(b.rule) ?? 0) + 1);
        map.set(sub.classCode, classMap);
      }
    }
    return map;
  }, [submissions]);

  const rules = mistakes.map((m) => m.rule);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="statGrid">
        <StatCard value={total} label="拦截总次数" tone="amber" />
        <StatCard value={mistakes.length} label="冲突类型数" />
        <StatCard value={mistakes[0]?.label ?? '—'} label="最高频类型" tone="red" />
        <StatCard value={submissions.length} label="样本提交" />
      </div>

      <div className="panel">
        <div className="panelHead">
          <h3>冲突类型统计</h3>
          <div className="headSpacer" />
          <span className="small faint">来源：所有提交中的当场拦截记录</span>
        </div>
        <div className="panelPad" data-testid="mistake-list">
          {mistakes.length === 0 ? (
            <div className="emptyState">还没有被拦截的记录。</div>
          ) : (
            mistakes.map((m) => (
              <div key={m.rule} className="mistakeRow">
                <div>
                  <div style={{ fontWeight: 600 }}>{m.label}</div>
                  <div className="tiny faint mono">{m.rule}</div>
                </div>
                <div className="mistakeCount">{m.count}</div>
                <div className="mistakeExamples">
                  {m.examples.map((e, i) => (
                    <div key={i}>· {e}</div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {byClass.size > 0 && (
        <div className="panel">
          <div className="panelHead">
            <h3>按班级分布</h3>
          </div>
          <div style={{ overflow: 'auto' }}>
            <table className="dataTable">
              <thead>
                <tr>
                  <th>班级</th>
                  {rules.map((r) => (
                    <th key={r} className="right">
                      {mistakes.find((m) => m.rule === r)?.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...byClass.entries()].map(([cls, map]) => (
                  <tr key={cls}>
                    <td>{cls}</td>
                    {rules.map((r) => (
                      <td key={r} className="right num">
                        {map.get(r) ?? 0}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ 复核详情 ------------------------------ */

function TeacherReview({
  submission,
  onDone,
  toasts,
  onDismiss,
  onReplay,
}: {
  submission: Submission;
  onDone: () => void;
  toasts: ToastMsg[];
  onDismiss: (id: number) => void;
  onReplay: (scenarioId: string) => void;
}) {
  const existing = listReviews().find((r) => r.submissionId === submission.id);
  const [deduction, setDeduction] = useState(existing?.deduction ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? '');
  const [playhead, setPlayhead] = useState(0);
  const scenario = submission.scenario;
  const result = submission.result;

  const replayState = useMemo<TimelineState>(
    () => ({
      scenario,
      assignments: submission.assignments,
      selectedShipId: null,
      selectedAssignmentId: null,
      playheadMin: playhead,
      outcomes: playhead >= scenario.horizonMin ? result.outcomes : null,
      incidents: result.incidents.filter((i) => i.timeMin <= playhead),
    }),
    [playhead, result, scenario, submission.assignments],
  );

  const save = () => {
    const review: Review = {
      submissionId: submission.id,
      deduction: Math.max(0, Math.min(100, Math.round(deduction))),
      comment: comment.trim(),
      gradedBy: '教员',
      gradedAt: new Date().toISOString(),
    };
    saveReview(review);
    onDone();
  };

  return (
    <main className="page" style={{ maxWidth: 1620 }}>
      <div className="pageHeader">
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 5 }}>
            <Chip tone="blue">复核</Chip>
            <Chip>{submission.studentName} · {submission.classCode}</Chip>
            <Chip>{formatDateTime(submission.submittedAt)}</Chip>
          </div>
          <h1>{submission.scenarioTitle}</h1>
        </div>
        <div className="headSpacer" />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn ghost small" onClick={() => onReplay(submission.scenarioId)}>
            重做本关
          </button>
          <button className="btn small" onClick={() => { window.location.hash = '/teacher'; }}>
            返回列表
          </button>
        </div>
      </div>

      <div className="reviewLayout">
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="panel">
            <div className="panelHead">
              <h3>回放</h3>
              <div className="headSpacer" />
              <span className="clockBadge">{clock(scenario, Math.round(playhead))}</span>
              <input
                className="playScrub"
                type="range"
                min={0}
                max={scenario.horizonMin}
                value={Math.round(playhead)}
                onChange={(e) => setPlayhead(Number(e.target.value))}
                aria-label="回放时间"
                data-testid="review-scrub"
                style={{ maxWidth: 220 }}
              />
              <button className="btn tiny ghost" onClick={() => setPlayhead(scenario.horizonMin)}>
                跳到结束
              </button>
            </div>
            <TimelineCanvas
              state={replayState}
              handlers={{
                onSelectShip: () => {},
                onSelectAssignment: () => {},
                onPlace: () => {},
                onMove: () => {},
                validate: () => ({ ok: true }),
              }}
            />
          </div>

          <div className="panel">
            <div className="panelHead">
              <h3>逐船结果</h3>
              <div className="headSpacer" />
              <span className="small faint">靠泊 {result.metrics.berthed}/{result.metrics.ships}</span>
            </div>
            <div style={{ overflow: 'auto' }}>
              <table className="dataTable">
                <thead>
                  <tr>
                    <th>船</th>
                    <th>泊位</th>
                    <th>引航员</th>
                    <th>计划</th>
                    <th>实际</th>
                    <th className="right">等待</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {result.outcomes.map((o) => {
                    const a = submission.assignments.find((x) => x.shipId === o.shipId);
                    const berth = scenario.berths.find((b) => b.id === o.berthId);
                    return (
                      <tr key={o.shipId}>
                        <td>{o.shipName}</td>
                        <td>{berth?.name.split(' · ')[0] ?? '—'}</td>
                        <td>{scenario.pilots.find((p) => p.id === a?.pilotId)?.name ?? '未指派'}</td>
                        <td className="mono">{a ? clock(scenario, a.startMin) : '—'}</td>
                        <td className="mono">{o.actualStartMin === null ? '—' : clock(scenario, o.actualStartMin)}</td>
                        <td className="right mono">{o.waitMin.toFixed(0)}</td>
                        <td>
                          <Chip tone={o.status === 'on-time' ? 'green' : o.status === 'late' ? 'amber' : 'red'}>
                            {o.status === 'on-time' ? '准点' : o.status === 'late' ? '延误' : '未达成'}
                          </Chip>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel">
            <div className="panelHead">
              <h3>推演事故</h3>
              <div className="headSpacer" />
              <span className="small faint">{result.incidents.length} 起</span>
            </div>
            <div className="panelPad">
              <IncidentList scenario={scenario} incidents={result.incidents} />
            </div>
          </div>

          <div className="panel">
            <div className="panelHead">
              <h3>学员被拦截的动作</h3>
              <div className="headSpacer" />
              <span className="small faint">{submission.blocked.length} 次</span>
            </div>
            <div className="panelPad">
              <BlockedFeed items={submission.blocked} scenario={scenario} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          <div className="panel panelPad">
            <h3 style={{ fontSize: 15, marginBottom: 4 }}>客观分</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
              <b style={{ fontSize: 32, color: 'var(--teal)' }}>{result.metrics.objective.toFixed(1)}</b>
              <span className="faint">/ 100</span>
            </div>
            <dl className="kv">
              <dt>准点率</dt>
              <dd>{Math.round(result.metrics.onTimeRate * 100)}%</dd>
              <dt>冲突次数</dt>
              <dd>{result.metrics.incidentCount}</dd>
              <dt>平均等待</dt>
              <dd>{result.metrics.avgWaitMin.toFixed(0)} 分钟</dd>
              <dt>拦截次数</dt>
              <dd>{submission.blocked.length}</dd>
            </dl>
          </div>

          <div className="panel panelPad">
            <h3 style={{ fontSize: 15, marginBottom: 10 }}>复核扣分</h3>
            <div className="field" style={{ marginBottom: 12 }}>
              <label className="fieldLabel" htmlFor="deduction">
                扣分（0–100）
              </label>
              <input
                id="deduction"
                className="input"
                type="number"
                min={0}
                max={100}
                value={deduction}
                onChange={(e) => setDeduction(Number(e.target.value))}
                data-testid="deduction-input"
              />
            </div>
            <div className="field" style={{ marginBottom: 12 }}>
              <label className="fieldLabel" htmlFor="comment">
                评语
              </label>
              <textarea
                id="comment"
                className="textarea"
                value={comment}
                placeholder="例如：忽略了潮窗关闭时刻，北辰应在 05:20 前完成靠泊；引航员轮转留 15 分钟转场。"
                onChange={(e) => setComment(e.target.value)}
                data-testid="comment-input"
              />
            </div>
            <div className="okBox" style={{ marginBottom: 12 }}>
              最终分：{Math.max(0, result.metrics.objective - deduction).toFixed(1)}
            </div>
            <button className="btn primary" style={{ width: '100%', justifyContent: 'center' }} onClick={save} data-testid="save-review">
              保存复核
            </button>
            {existing && (
              <div className="small faint" style={{ marginTop: 8 }}>
                上次复核：{formatDateTime(existing.gradedAt)} · 扣 {existing.deduction} 分
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastHost toasts={toasts} onDismiss={onDismiss} />
    </main>
  );
}

/* ------------------------------ 出题 ------------------------------ */

function AuthorTab({
  custom,
  onSaved,
  onOpen,
}: {
  custom: ReturnType<typeof listCustomScenarios>;
  onSaved: (msg: string) => void;
  onOpen: (scenarioId: string) => void;
}) {
  const [editing, setEditing] = useState<Scenario | null>(null);
  const [preview, setPreview] = useState<Scenario | null>(null);

  const startNew = () => {
    setEditing(null);
    setPreview(null);
  };

  const handleSave = (scenario: Scenario) => {
    saveCustomScenario(scenario);
    onSaved(`已保存自编题「${scenario.title}」，学员端可见。`);
    setEditing(null);
    setPreview(scenario);
  };

  const handleDelete = (id: string) => {
    deleteCustomScenario(id);
    setEditing(null);
    onSaved('已删除该自编题。');
  };

  const plan = preview ? planScenario(preview) : null;

  return (
    <div className="scenarioEditor">
      <div className="panel panelPad">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: 15 }}>自编关卡</h3>
            <p className="small faint" style={{ margin: '4px 0 0' }}>
              设定船舶清单、泊位数、潮汐表与训练时限。保存后出现在学员端关卡列表。
            </p>
          </div>
          <div className="headSpacer" />
          <button className="btn primary" onClick={() => { startNew(); setEditing(null); }} data-testid="new-scenario">
            ＋ 新建题目
          </button>
        </div>
      </div>

      <BlankScenarioEditor
        initial={editing}
        existingIds={custom.map((c) => c.scenario.id)}
        onSave={handleSave}
        onPreview={(s) => setPreview(s)}
        key={editing?.id ?? 'new'}
      />

      {preview && (
        <div className="panel">
          <div className="panelHead">
            <h3>「{preview.title}」预览</h3>
            <div className="headSpacer" />
            <Chip tone={plan && plan.length === preview.ships.length ? 'green' : 'red'}>
              {plan && plan.length === preview.ships.length ? '存在可行排班' : '资源不足 · 无法全部靠泊'}
            </Chip>
            <button className="btn tiny" onClick={() => onOpen(preview.id)}>
              去学员端试玩
            </button>
          </div>
          <div className="panelPad">
            <PreviewTimeline scenario={preview} />
            <div className="divider" />
            <table className="dataTable">
              <thead>
                <tr>
                  <th>船</th>
                  <th className="right">吃水</th>
                  <th className="right">船长</th>
                  <th>ETA</th>
                  <th>潮窗</th>
                  <th className="right">作业</th>
                  <th className="right">拖轮</th>
                </tr>
              </thead>
              <tbody>
                {preview.ships.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td className="right num">{s.draftM.toFixed(1)}</td>
                    <td className="right num">{s.lengthM}</td>
                    <td className="mono">{clock(preview, s.etaMin)}</td>
                    <td className="mono">
                      {clock(preview, s.tideFromMin)}–{clock(preview, s.tideToMin)}
                    </td>
                    <td className="right num">{s.mooringMin} 分</td>
                    <td className="right num">{s.tugsNeeded}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panelHead">
          <h3>已保存的自编题</h3>
          <div className="headSpacer" />
          <span className="small faint">{custom.length} 道</span>
        </div>
        {custom.length === 0 ? (
          <div className="emptyState">还没有自编题。点「新建题目」开始。</div>
        ) : (
          <table className="dataTable">
            <thead>
              <tr>
                <th>标题</th>
                <th>船舶</th>
                <th>泊位</th>
                <th>潮汐点</th>
                <th>时限</th>
                <th>创建时间</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {custom.map((c) => (
                <tr key={c.scenario.id}>
                  <td>{c.scenario.title}</td>
                  <td>{c.scenario.ships.length}</td>
                  <td>{c.scenario.berths.length}</td>
                  <td>{c.scenario.tide.length}</td>
                  <td className="mono">{clock(c.scenario, c.scenario.horizonMin)}</td>
                  <td className="small faint">{formatDateTime(c.createdAt)}</td>
                  <td>
                    <button className="btn tiny ghost" onClick={() => setEditing(c.scenario)}>
                      编辑
                    </button>
                    <button className="btn tiny danger" onClick={() => handleDelete(c.scenario.id)}>
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <Modal title={`编辑：${editing.title}`} onClose={() => setEditing(null)} width={520}>
          <p className="small muted">
            在此调整题目结构。修改后请回到上方编辑器保存。
          </p>
        </Modal>
      )}
    </div>
  );
}

function PreviewTimeline({ scenario }: { scenario: Scenario }) {
  const plan = useMemo(() => planScenario(scenario), [scenario]);
  const [playhead, setPlayhead] = useState<number | null>(null);
  const state = useMemo<TimelineState>(
    () => ({
      scenario,
      assignments: plan ?? [],
      selectedShipId: null,
      selectedAssignmentId: null,
      playheadMin: playhead,
      outcomes: null,
      incidents: [],
    }),
    [plan, playhead, scenario],
  );
  return (
    <div>
      <div className="hud" style={{ marginBottom: 8 }}>
        <span className="hudPill">
          自动排班：<b>{plan ? `${plan.length}/${scenario.ships.length}` : '无解'}</b>
        </span>
        <button className="btn tiny ghost" onClick={() => setPlayhead(0)}>
          显示时间轴
        </button>
      </div>
      <TimelineCanvas
        state={state}
        handlers={{
          onSelectShip: () => {},
          onSelectAssignment: () => {},
          onPlace: () => {},
          onMove: () => {},
          validate: () => ({ ok: true }),
        }}
      />
    </div>
  );
}
