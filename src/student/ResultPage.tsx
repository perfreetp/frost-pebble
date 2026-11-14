import { useEffect, useMemo, useRef, useState } from 'react';
import { clock, simulateRun } from '../game/engine';
import type { BlockedAttempt, Review, Submission } from '../game/types';
import { formatDateTime, getSubmission, listReviews, listSubmissions } from '../storage/repo';
import { Bar, BlockedFeed, Chip, IncidentList, Modal, OutcomeBadge, ToastHost, type ToastMsg } from '../components/ui';
import { TimelineCanvas } from '../components/TimelineCanvas';
import type { TimelineState } from '../pixi/TimelineView';
import { BLOCKED_RULE_LABELS } from '../game/types';

export function ResultPage({
  submissionId,
  onBack,
  onReplay,
}: {
  submissionId: string;
  onBack: () => void;
  onReplay: (scenarioId: string) => void;
}) {
  const submission = useMemo(() => getSubmission(submissionId), [submissionId]);
  const [review, setReview] = useState<Review | undefined>(() =>
    listReviews().find((r) => r.submissionId === submissionId),
  );
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [replayOpen, setReplayOpen] = useState(false);
  const [blockedOpen, setBlockedOpen] = useState(false);
  const [playhead, setPlayhead] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);

  useEffect(() => {
    if (submission) setReview(listReviews().find((r) => r.submissionId === submission.id));
  }, [submission]);

  const replayState = useMemo<TimelineState | null>(() => {
    if (!submission) return null;
    const result = simulateRun(submission.scenario, submission.assignments);
    const visible =
      playhead === null ? [] : result.incidents.filter((i) => i.timeMin <= playhead);
    return {
      scenario: submission.scenario,
      assignments: submission.assignments,
      selectedShipId: null,
      selectedAssignmentId: null,
      playheadMin: playhead,
      outcomes: playhead !== null && playhead >= submission.scenario.horizonMin ? result.outcomes : null,
      incidents: visible,
    };
  }, [submission, playhead]);

  useEffect(() => {
    if (!playing || !submission) return;
    const duration = 12000;
    const step = (now: number) => {
      if (!lastRef.current) lastRef.current = now;
      const dt = now - lastRef.current;
      lastRef.current = now;
      setPlayhead((p) => {
        const base = p ?? 0;
        const next = base + (dt / duration) * submission.scenario.horizonMin;
        if (next >= submission.scenario.horizonMin) {
          setPlaying(false);
          return submission.scenario.horizonMin;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastRef.current = 0;
    };
  }, [playing, submission]);

  if (!submission) {
    return (
      <main className="page">
        <div className="panel panelPad">
          <h2 style={{ fontSize: 18 }}>找不到这份提交</h2>
          <p className="muted">它可能已被清除，或链接有误。</p>
          <button className="btn primary" onClick={onBack}>
            返回训练台
          </button>
        </div>
      </main>
    );
  }

  const result = submission.result;
  const scenario = submission.scenario;
  const final = Math.max(0, result.metrics.objective - (review?.deduction ?? 0));
  const history = listSubmissions().filter(
    (s) => s.studentId === submission.studentId && s.scenarioId === submission.scenarioId,
  );

  return (
    <main className="page">
      <div className="pageHeader">
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 5 }}>
            <Chip tone={submission.tier === 'advanced' ? 'amber' : 'teal'}>
              {submission.tier === 'advanced' ? '高级' : '初级'}
            </Chip>
            <Chip>{submission.studentName} · {submission.classCode}</Chip>
            <Chip>{formatDateTime(submission.submittedAt)}</Chip>
            <Chip>用时 {Math.round(submission.durationSec / 60)} 分钟</Chip>
          </div>
          <h1>{submission.scenarioTitle} · 训练结果</h1>
        </div>
        <div className="headSpacer" />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn ghost small" onClick={onBack}>
            返回训练台
          </button>
          <button className="btn small" onClick={() => setReplayOpen(true)} data-testid="open-replay">
            回放推演
          </button>
          <button className="btn primary small" onClick={() => onReplay(submission.scenarioId)}>
            重做本关
          </button>
        </div>
      </div>

      <div className="resultGrid">
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="panel panelPad" style={{ textAlign: 'center' }}>
            <div className="scoreDial">
              <div>
                <b style={{ color: final >= 80 ? 'var(--green)' : final >= 60 ? 'var(--amber)' : 'var(--red)' }}>
                  {final.toFixed(1)}
                </b>
                <div style={{ marginTop: 2, lineHeight: 1.5 }}>
                  <span>
                    最终得分
                    <br />
                    客观 {result.metrics.objective.toFixed(1)} − 复核 {review?.deduction ?? 0}
                  </span>
                </div>
              </div>
            </div>
            <div className="hud" style={{ justifyContent: 'center' }}>
              <span className="hudPill">
                准点率 <b>{Math.round(result.metrics.onTimeRate * 100)}%</b>
              </span>
              <span className="hudPill">
                冲突 <b style={{ color: result.metrics.incidentCount ? 'var(--red)' : 'var(--green)' }}>{result.metrics.incidentCount}</b>
              </span>
              <span className="hudPill">
                平均等待 <b>{result.metrics.avgWaitMin.toFixed(0)} 分</b>
              </span>
            </div>
            <div className="metricList" style={{ marginTop: 16, textAlign: 'left' }}>
              <MetricRow label="准点分" value={result.metrics.breakdown.punctuality} max={50} />
              <MetricRow label="无冲突分" value={result.metrics.breakdown.conflict} max={30} />
              <MetricRow label="效率分" value={result.metrics.breakdown.efficiency} max={20} />
            </div>
          </div>

          <div className="panel">
            <div className="panelHead">
              <h3>逐船结果</h3>
              <div className="headSpacer" />
              <span className="small faint">
                靠泊 {result.metrics.berthed}/{result.metrics.ships}
              </span>
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
                        <td>{berth ? berth.name.split(' · ')[0] : '—'}</td>
                        <td>{scenario.pilots.find((p) => p.id === a?.pilotId)?.name ?? '—'}</td>
                        <td className="mono">{a ? clock(scenario, a.startMin) : '—'}</td>
                        <td className="mono">{o.actualStartMin === null ? '—' : clock(scenario, o.actualStartMin)}</td>
                        <td className="right mono">{o.waitMin.toFixed(0)} 分</td>
                        <td>
                          <OutcomeBadge outcome={o} />
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
              <h3>事故清单</h3>
              <div className="headSpacer" />
              <span className="small faint">未拦截但推演中发生的冲突</span>
            </div>
            <div className="panelPad">
              <IncidentList scenario={scenario} incidents={result.incidents} />
            </div>
          </div>

          <div className="panel">
            <div className="panelHead">
              <h3>拦截记录（错题）</h3>
              <div className="headSpacer" />
              <span className="small faint">{submission.blocked.length} 次</span>
              <button className="btn tiny ghost" onClick={() => setBlockedOpen(true)}>
                查看全部
              </button>
            </div>
            <div className="panelPad">
              {submission.blocked.length === 0 ? (
                <div className="emptyState">本次训练没有被拦截的动作。</div>
              ) : (
                <div style={{ display: 'grid', gap: 6 }}>
                  {summarizeBlocked(submission.blocked).map((b) => (
                    <div key={b.rule} className="small" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Chip tone="red">{BLOCKED_RULE_LABELS[b.rule]}</Chip>
                      <span className="faint">{b.count} 次</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          <div className="panel">
            <div className="panelHead">
              <h3>教员复核</h3>
            </div>
            <div className="panelPad">
              {review ? (
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                    <Chip tone="amber">扣 {review.deduction} 分</Chip>
                    <span className="small faint">{formatDateTime(review.gradedAt)}</span>
                  </div>
                  <div className="commentItem">
                    <b>{review.gradedBy}</b>
                    <p>{review.comment || '（未填写评语）'}</p>
                  </div>
                </div>
              ) : (
                <div className="warnBox" data-testid="pending-review">
                  尚未复核。客观分已生成；教员会在回放后给出扣分与评语。
                </div>
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panelHead">
              <h3>同类记录</h3>
            </div>
            <div className="panelPad">
              {history.length <= 1 ? (
                <div className="small faint">这是本关的第一次提交。</div>
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  {history.map((h) => (
                    <div key={h.id} className="small" style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <span className="faint">{formatDateTime(h.submittedAt)}</span>
                      <span className="mono">{h.result.metrics.objective.toFixed(1)} 分</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panelHead">
              <h3>关卡要点</h3>
            </div>
            <div className="panelPad">
              <p className="small muted" style={{ marginTop: 0 }}>
                {scenario.brief}
              </p>
              <div className="divider" />
              <dl className="kv">
                <dt>船舶</dt>
                <dd>{scenario.ships.length} 条</dd>
                <dt>泊位</dt>
                <dd>{scenario.berths.length} 座</dd>
                <dt>准点容差</dt>
                <dd>±{scenario.ontimeTolMin} 分钟</dd>
                <dt>训练时限</dt>
                <dd>{clock(scenario, scenario.horizonMin)}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {replayOpen && replayState && (
        <Modal title="回放推演" onClose={() => setReplayOpen(false)} width={1180}>
          <div className="stageToolbar" style={{ padding: '0 0 10px' }}>
            <button
              className="btn primary small"
              onClick={() => {
                if (playhead !== null && playhead >= scenario.horizonMin) setPlayhead(0);
                setPlaying((v) => !v);
              }}
            >
              {playing ? '⏸ 暂停' : '▶ 播放'}
            </button>
            <button className="btn small ghost" onClick={() => { setPlaying(false); setPlayhead(0); }}>
              复位
            </button>
            <span className="clockBadge">{clock(scenario, Math.round(playhead ?? 0))}</span>
            <input
              className="playScrub"
              type="range"
              min={0}
              max={scenario.horizonMin}
              value={Math.round(playhead ?? 0)}
              aria-label="回放时间"
              onChange={(e) => {
                setPlaying(false);
                setPlayhead(Number(e.target.value));
              }}
            />
            <span className="small faint">{result.incidents.length} 起事故</span>
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
          <div style={{ marginTop: 12 }}>
            <BlockedFeedInline incidents={result.incidents.filter((i) => (playhead ?? 0) >= i.timeMin)} scenario={scenario} />
          </div>
        </Modal>
      )}

      {blockedOpen && (
        <Modal title="全部拦截记录" onClose={() => setBlockedOpen(false)} width={720}>
          <BlockedFeed items={submission.blocked} scenario={scenario} />
        </Modal>
      )}

      <ToastHost toasts={toasts} onDismiss={(id) => setToasts((l) => l.filter((t) => t.id !== id))} />
    </main>
  );
}

function MetricRow({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="metricRow">
      <span>{label}</span>
      <Bar value={value / max} tone={value / max < 0.5 ? 'warn' : undefined} />
      <b>
        {value.toFixed(1)} / {max}
      </b>
    </div>
  );
}

function summarizeBlocked(blocked: BlockedAttempt[]) {
  const map = new Map<string, number>();
  for (const b of blocked) map.set(b.rule, (map.get(b.rule) ?? 0) + 1);
  return [...map.entries()].map(([rule, count]) => ({ rule: rule as keyof typeof BLOCKED_RULE_LABELS, count }));
}

function BlockedFeedInline({
  incidents,
  scenario,
}: {
  incidents: Submission['result']['incidents'];
  scenario: Submission['scenario'];
}) {
  return <IncidentList scenario={scenario} incidents={incidents} />;
}
