import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { clock, simulateRun, validatePlacement, planWarnings } from '../game/engine';
import type {
  Assignment,
  BlockedAttempt,
  BlockedRule,
  Scenario,
  Student,
  Submission,
} from '../game/types';
import {
  addSubmission,
  freshSubmissionId,
  loadDraft,
  saveDraft,
} from '../storage/repo';
import {
  Bar,
  BlockedFeed,
  Chip,
  IncidentList,
  Modal,
  PlanSummary,
  ShipComposer,
  ToastHost,
  type ShipFormState,
  type ToastMsg,
} from '../components/ui';
import { TimelineCanvas } from '../components/TimelineCanvas';
import type { TimelineState } from '../pixi/TimelineView';

const SNAP = 5;
const snap = (n: number) => Math.round(n / SNAP) * SNAP;

type Phase = 'edit' | 'playing' | 'paused' | 'done';

function defaultForm(scenario: Scenario, shipId: string, existing?: Assignment): ShipFormState {
  if (existing) {
    return {
      berthId: existing.berthId,
      pilotId: existing.pilotId ?? '',
      tugIds: [...existing.tugIds],
      startMin: existing.startMin,
    };
  }
  const ship = scenario.ships.find((s) => s.id === shipId)!;
  const berth = scenario.berths.find(
    (b) => ship.draftM <= b.maxDraftM && ship.lengthM <= b.lengthM,
  ) ?? scenario.berths[0];
  return {
    berthId: berth?.id ?? '',
    pilotId: '',
    tugIds: [],
    startMin: Math.max(ship.etaMin, ship.tideFromMin),
  };
}

export function StagePage({
  scenario,
  student,
  onSubmitSuccess,
  onExit,
}: {
  scenario: Scenario;
  student: Student | null;
  onSubmitSuccess: (submissionId: string) => void;
  onExit: () => void;
}) {
  const [assignments, setAssignments] = useState<Assignment[]>(() => loadDraft(scenario.id) ?? []);
  const [selectedShipId, setSelectedShipId] = useState<string | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [form, setForm] = useState<ShipFormState | null>(null);
  const [phase, setPhase] = useState<Phase>('edit');
  const [playhead, setPlayhead] = useState(0);
  const [blocked, setBlocked] = useState<BlockedAttempt[]>([]);
  const [flash, setFlash] = useState<{ id: string; message: string } | null>(null);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [speed, setSpeed] = useState(4);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const [showBlocked, setShowBlocked] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);
  const toastSeq = useRef(0);

  const result = useMemo(() => simulateRun(scenario, assignments), [scenario, assignments]);
  const warnings = useMemo(() => planWarnings(scenario, assignments), [scenario, assignments]);

  const pushToast = useCallback((kind: 'error' | 'ok', text: string) => {
    toastSeq.current += 1;
    const id = toastSeq.current;
    setToasts((list) => [...list, { id, kind, text }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (phase !== 'edit') return;
    const t = setTimeout(() => saveDraft(scenario.id, assignments), 250);
    return () => clearTimeout(t);
  }, [assignments, scenario.id, phase]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 7000);
    return () => clearTimeout(t);
  }, [flash]);

  /* ---------------------------- 拦截 ---------------------------- */

  const recordBlocked = useCallback(
    (rule: BlockedRule, message: string, shipId?: string, berthName?: string) => {
      const ship = scenario.ships.find((s) => s.id === shipId);
      const attempt: BlockedAttempt = {
        id: `blk-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(36)}`,
        rule,
        message,
        atMin: phase === 'edit' ? 0 : Math.round(playhead),
        shipId,
        shipName: ship?.name,
        berthName,
        attemptedAt: new Date().toISOString(),
        scenarioId: scenario.id,
      };
      setBlocked((list) => [...list, attempt]);
      setFlash({ id: attempt.id, message });
      pushToast('error', `已拦截 · ${message}`);
    },
    [phase, playhead, pushToast, scenario],
  );

  /* ---------------------------- 排程 ---------------------------- */

  const validate = useCallback(
    (shipId: string, berthId: string, startMin: number, excludeId?: string) => {
      const existing = assignments.find((a) => a.shipId === shipId);
      return validatePlacement(
        scenario,
        assignments,
        {
          shipId,
          berthId,
          pilotId: existing?.pilotId ?? null,
          tugIds: existing?.tugIds ?? [],
          startMin,
        },
        excludeId ?? existing?.id,
      );
    },
    [assignments, scenario],
  );

  const onPlace = useCallback(
    (shipId: string, berthId: string, startMin: number) => {
      if (phase !== 'edit') {
        pushToast('error', '推演已开始，无法修改计划。先点「回到编辑」重置推演。');
        return;
      }
      const existing = assignments.find((a) => a.shipId === shipId);
      const issue = validatePlacement(
        scenario,
        assignments,
        {
          shipId,
          berthId,
          pilotId: existing?.pilotId ?? null,
          tugIds: existing?.tugIds ?? [],
          startMin: snap(startMin),
        },
        existing?.id,
      );
      const berthName = scenario.berths.find((b) => b.id === berthId)?.name;
      if (issue) {
        recordBlocked(issue.rule, issue.message, shipId, berthName);
        return;
      }
      const id = existing?.id ?? `a-${shipId}`;
      setAssignments((list) => [
        ...list.filter((a) => a.shipId !== shipId),
        {
          id,
          shipId,
          berthId,
          pilotId: existing?.pilotId ?? null,
          tugIds: existing?.tugIds ? [...existing.tugIds] : [],
          startMin: snap(startMin),
        },
      ]);
      setSelectedShipId(shipId);
      setSelectedAssignmentId(id);
      setForm(defaultForm(scenario, shipId, existing));
      pushToast(
        'ok',
        existing
          ? `${scenario.ships.find((s) => s.id === shipId)?.name} 已改排到 ${berthName}。`
          : `${scenario.ships.find((s) => s.id === shipId)?.name} 已拖到 ${berthName}，请指派引航员与拖轮。`,
      );
    },
    [assignments, phase, pushToast, recordBlocked, scenario, validate],
  );

  const onMove = useCallback(
    (assignmentId: string, berthId: string, startMin: number) => {
      if (phase !== 'edit') {
        pushToast('error', '推演进行中，无法移动作业块。');
        return;
      }
      const target = assignments.find((a) => a.id === assignmentId);
      if (!target) return;
      const issue = validatePlacement(
        scenario,
        assignments,
        {
          shipId: target.shipId,
          berthId,
          pilotId: target.pilotId,
          tugIds: target.tugIds,
          startMin: snap(startMin),
        },
        assignmentId,
      );
      if (issue) {
        recordBlocked(issue.rule, issue.message, target.shipId, scenario.berths.find((b) => b.id === berthId)?.name);
        return;
      }
      setAssignments((list) =>
        list.map((a) => (a.id === assignmentId ? { ...a, berthId, startMin: snap(startMin) } : a)),
      );
      if (selectedShipId === target.shipId) {
        setForm((f) => (f ? { ...f, berthId, startMin: snap(startMin) } : f));
      }
    },
    [assignments, phase, pushToast, recordBlocked, scenario, selectedShipId],
  );

  const focusShip = useCallback(
    (shipId: string | null) => {
      setSelectedShipId(shipId);
      if (!shipId) {
        setForm(null);
        setSelectedAssignmentId(null);
        return;
      }
      const existing = assignments.find((a) => a.shipId === shipId);
      setSelectedAssignmentId(existing?.id ?? null);
      setForm(defaultForm(scenario, shipId, existing));
    },
    [assignments, scenario],
  );

  const patchForm = useCallback((patch: Partial<ShipFormState>) => {
    setForm((f) => (f ? { ...f, ...patch } : f));
  }, []);

  const liveIssue = useMemo(() => {
    if (!selectedShipId || !form) return null;
    return validatePlacement(
      scenario,
      assignments,
      {
        shipId: selectedShipId,
        berthId: form.berthId,
        pilotId: form.pilotId || null,
        tugIds: form.tugIds,
        startMin: form.startMin,
      },
      selectedAssignmentId ?? undefined,
    );
  }, [assignments, form, scenario, selectedAssignmentId, selectedShipId]);

  const commitForm = useCallback(() => {
    if (!selectedShipId || !form) return;
    if (phase !== 'edit') {
      pushToast('error', '推演进行中，无法修改计划。');
      return;
    }
    const issue = validatePlacement(
      scenario,
      assignments,
      {
        shipId: selectedShipId,
        berthId: form.berthId,
        pilotId: form.pilotId || null,
        tugIds: form.tugIds,
        startMin: snap(form.startMin),
      },
      selectedAssignmentId ?? undefined,
    );
    const berthName = scenario.berths.find((b) => b.id === form.berthId)?.name;
    if (issue) {
      recordBlocked(issue.rule, issue.message, selectedShipId, berthName);
      return;
    }
    const id = selectedAssignmentId ?? `a-${selectedShipId}`;
    setAssignments((list) => {
      const rest = list.filter((a) => a.shipId !== selectedShipId);
      return [
        ...rest,
        {
          id,
          shipId: selectedShipId,
          berthId: form.berthId,
          pilotId: form.pilotId || null,
          tugIds: [...form.tugIds],
          startMin: snap(form.startMin),
        },
      ];
    });
    setSelectedAssignmentId(id);
    pushToast('ok', `${scenario.ships.find((s) => s.id === selectedShipId)?.name} 已排入计划。`);
  }, [assignments, form, phase, pushToast, recordBlocked, scenario, selectedAssignmentId, selectedShipId]);

  const removeAssignment = useCallback(() => {
    if (!selectedShipId) return;
    setAssignments((list) => list.filter((a) => a.shipId !== selectedShipId));
    setSelectedAssignmentId(null);
    setForm(defaultForm(scenario, selectedShipId));
    pushToast('ok', '已从泊位撤下。');
  }, [pushToast, scenario, selectedShipId]);

  /* ---------------------------- 推演 ---------------------------- */

  const startRun = useCallback(() => {
    const uncovered = scenario.ships.filter((s) => !assignments.some((a) => a.shipId === s.id));
    if (assignments.length === 0) {
      pushToast('error', '还没有任何船舶排入计划，推演只会看到空锚地。');
      return;
    }
    if (uncovered.length > 0) {
      pushToast('error', `还有 ${uncovered.length} 条船没有排泊位，推演会记为未靠泊事故。`);
    }
    setFlash(null);
    setPhase('playing');
    setPlayhead(0);
    lastTickRef.current = performance.now();
  }, [assignments, pushToast, scenario.ships]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const durationMs = 14000;
    const step = (now: number) => {
      if (lastTickRef.current === 0) lastTickRef.current = now;
      const dt = now - lastTickRef.current;
      lastTickRef.current = now;
      setPlayhead((p) => {
        const next = p + (dt / durationMs) * scenario.horizonMin * (speed / 4);
        if (next >= scenario.horizonMin) {
          return scenario.horizonMin;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTickRef.current = 0;
    };
  }, [phase, scenario.horizonMin, speed]);

  useEffect(() => {
    if (phase === 'playing' && playhead >= scenario.horizonMin) {
      setPhase('done');
      pushToast(result.incidents.length ? 'error' : 'ok',
        result.incidents.length
          ? `推演结束：${result.incidents.length} 起冲突，${result.metrics.onTimeCount}/${result.metrics.ships} 条准点。`
          : '推演结束：全程无冲突，全部准点靠泊。');
    }
  }, [phase, playhead, result, scenario.horizonMin, pushToast]);

  const pauseRun = () => {
    if (phase === 'playing') {
      setPhase('paused');
      return;
    }
    if (phase === 'edit' || phase === 'paused') {
      if (phase === 'edit') {
        startRun();
      } else {
        lastTickRef.current = 0;
        setPhase('playing');
      }
    }
  };

  const resetRun = () => {
    setPhase('edit');
    setPlayhead(0);
    setFlash(null);
  };

  const clearPlan = () => {
    setAssignments([]);
    setSelectedShipId(null);
    setSelectedAssignmentId(null);
    setForm(null);
    setPhase('edit');
    setPlayhead(0);
    saveDraft(scenario.id, []);
    pushToast('ok', '计划已清空。');
  };

  /* ---------------------------- 提交 ---------------------------- */

  const doSubmit = useCallback(() => {
    if (!student) {
      pushToast('error', '请先在训练台选择学员身份，再提交成绩。');
      setConfirmSubmit(false);
      return;
    }
    const submission: Submission = {
      id: freshSubmissionId(),
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      tier: scenario.tier,
      studentId: student.id,
      studentName: student.name,
      classCode: student.classCode,
      scenario: JSON.parse(JSON.stringify(scenario)),
      assignments: JSON.parse(JSON.stringify(assignments)),
      result,
      blocked,
      submittedAt: new Date().toISOString(),
      durationSec: Math.round((Date.now() - startedAt) / 1000),
    };
    addSubmission(submission);
    saveDraft(scenario.id, []);
    setConfirmSubmit(false);
    onSubmitSuccess(submission.id);
  }, [assignments, blocked, onSubmitSuccess, pushToast, result, scenario, startedAt, student]);

  /* ---------------------------- 画布状态 ---------------------------- */

  const timelineState = useMemo<TimelineState>(() => {
    const visibleIncidents =
      phase === 'done'
        ? result.incidents
        : phase === 'playing' || phase === 'paused'
          ? result.incidents.filter((i) => i.timeMin <= playhead)
          : [];
    return {
      scenario,
      assignments,
      selectedShipId,
      selectedAssignmentId,
      playheadMin: phase === 'edit' ? null : Math.round(playhead),
      outcomes: phase === 'done' ? result.outcomes : null,
      incidents: visibleIncidents,
    };
  }, [
    assignments,
    phase,
    playhead,
    result,
    scenario,
    selectedAssignmentId,
    selectedShipId,
  ]);

  const handlers = useMemo(
    () => ({
      onSelectShip: (id: string | null) => focusShip(id),
      onSelectAssignment: (id: string | null) => {
        if (!id) return;
        const a = assignments.find((x) => x.id === id);
        if (a) focusShip(a.shipId);
      },
      onPlace,
      onMove,
      validate: (shipId: string, berthId: string, startMin: number, excludeId?: string) => {
        const issue = validate(shipId, berthId, startMin, excludeId);
        return issue ? { ok: false, message: issue.message } : { ok: true };
      },
    }),
    [assignments, focusShip, onMove, onPlace, validate],
  );

  const selectedShip = scenario.ships.find((s) => s.id === selectedShipId) ?? null;

  const canSubmit = phase === 'done';
  const uncoveredCount = scenario.ships.filter((s) => !assignments.some((a) => a.shipId === s.id)).length;

  return (
    <main className="page" style={{ maxWidth: 1620 }}>
      <div className="pageHeader" style={{ marginBottom: 12 }}>
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
            <Chip tone={scenario.tier === 'advanced' ? 'amber' : 'teal'}>
              {scenario.tier === 'advanced' ? '高级' : '初级'}
            </Chip>
            <Chip>{scenario.ships.length} 船 / {scenario.berths.length} 泊位</Chip>
            <Chip>{scenario.pilots.length} 引航员 / {scenario.tugs.length} 拖轮</Chip>
            <Chip>训练时限 {clock(scenario, scenario.horizonMin)}</Chip>
          </div>
          <h1>{scenario.title}</h1>
          <p>{scenario.brief}</p>
        </div>
        <div className="headSpacer" />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {student ? (
            <div className="identity">
              <span className="identityDot">{student.name.slice(0, 1)}</span>
              {student.name} · {student.classCode}
            </div>
          ) : (
            <span className="chip amber">未选学员 · 无法提交</span>
          )}
          <button className="btn ghost small" onClick={onExit} data-testid="exit-stage">
            退出本关
          </button>
        </div>
      </div>

      <div className="stageGrid">
        <div className="panel canvasCard">
          <div className="stageToolbar">
            <button
              className={`btn ${phase === 'edit' ? 'primary' : ''}`}
              onClick={phase === 'done' ? startRun : pauseRun}
              data-testid="run-toggle"
            >
              {phase === 'edit'
                ? '▶ 开始推演'
                : phase === 'playing'
                  ? '⏸ 暂停'
                  : phase === 'paused'
                    ? '▶ 继续推演'
                    : '↻ 重新推演'}
            </button>
            {phase !== 'edit' && (
              <button className="btn small ghost" onClick={resetRun} data-testid="reset-run">
                回到编辑
              </button>
            )}
            <span className="clockBadge" data-testid="clock">
              {clock(scenario, Math.round(playhead))}
            </span>
            <input
              className="playScrub"
              type="range"
              min={0}
              max={scenario.horizonMin}
              value={Math.round(playhead)}
              aria-label="推演时间"
              data-testid="scrub"
              onChange={(e) => {
                const v = Number(e.target.value);
                setPlayhead(v);
                if (phase === 'edit') setPhase('done');
                if (phase === 'playing') setPhase('paused');
                if (phase === 'paused' && v >= scenario.horizonMin) setPhase('done');
              }}
            />
            <select
              className="select small"
              value={speed}
              aria-label="播放速度"
              onChange={(e) => setSpeed(Number(e.target.value))}
            >
              <option value={2}>0.5×</option>
              <option value={4}>1×</option>
              <option value={8}>2×</option>
              <option value={16}>4×</option>
            </select>
            <button className="btn small ghost" onClick={() => setShowBlocked((v) => !v)} data-testid="toggle-blocked">
              拦截记录 {blocked.length > 0 && <span style={{ color: 'var(--red)' }}>{blocked.length}</span>}
            </button>
            <button
              className="btn primary small"
              onClick={() => setConfirmSubmit(true)}
              disabled={!canSubmit}
              data-testid="submit-run"
            >
              提交成绩
            </button>
          </div>
          {flash && (
            <div
              key={flash.id}
              className="issueBox"
              data-testid="flash-banner"
              style={{ margin: '10px 14px 0', display: 'flex', gap: 8, alignItems: 'flex-start' }}
            >
              <b style={{ flex: 'none' }}>已拦截</b>
              <span>{flash.message}</span>
            </div>
          )}
          <TimelineCanvas state={timelineState} handlers={handlers} />
        </div>

        <div className="sideCol">
          <div className="panel">
            <div className="panelHead">
              <h3>{selectedShip ? `排程 · ${selectedShip.name}` : '船舶清单'}</h3>
              <div className="headSpacer" />
              {selectedShip && (
                <button className="btn tiny ghost" onClick={() => focusShip(null)}>
                  收起
                </button>
              )}
            </div>
            <div className="panelPad" style={{ padding: 14 }}>
              <div style={{ display: 'grid', gap: 6 }} data-testid="ship-list">
                {scenario.ships.map((s) => {
                  const a = assignments.find((x) => x.shipId === s.id);
                  const active = s.id === selectedShipId;
                  return (
                    <button
                      key={s.id}
                      className="btn ghost small"
                      aria-pressed={active}
                      style={{
                        justifyContent: 'space-between',
                        width: '100%',
                        borderColor: active ? 'rgba(63,208,201,0.6)' : undefined,
                        background: active ? 'rgba(63,208,201,0.09)' : undefined,
                      }}
                      onClick={() => focusShip(s.id)}
                      data-testid={`pick-${s.id}`}
                    >
                      <span style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                        <b>{s.name}</b>
                        <span className="tiny faint">
                          {s.lengthM}m · {s.draftM.toFixed(1)}m
                        </span>
                      </span>
                      {a ? <Chip tone={a.pilotId ? 'teal' : 'amber'}>{a.pilotId ? '已排' : '待引航'}</Chip> : <Chip>未排</Chip>}
                    </button>
                  );
                })}
              </div>
              {selectedShip && form && (
                <>
                  <div className="divider" />
                  <ShipComposer
                    scenario={scenario}
                    ship={selectedShip}
                    value={form}
                    issue={liveIssue}
                    onPatch={patchForm}
                    onSubmit={commitForm}
                    onCancel={() => focusShip(null)}
                    onDelete={selectedAssignmentId ? removeAssignment : undefined}
                    existingPilotLess={Boolean(selectedAssignmentId && !form.pilotId)}
                  />
                </>
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panelHead">
              <h3>计划与预判</h3>
              <div className="headSpacer" />
              {assignments.length > 0 && (
                <button className="btn tiny danger" onClick={clearPlan}>
                  清空
                </button>
              )}
            </div>
            <div className="panelPad" style={{ padding: 14 }}>
              <PlanSummary
                scenario={scenario}
                assignments={assignments}
                selectedId={selectedAssignmentId}
                onSelect={(id) => {
                  const a = assignments.find((x) => x.id === id);
                  if (a) focusShip(a.shipId);
                }}
              />
            </div>
          </div>

          <div className="panel">
            <div className="panelHead">
              <h3>潮汐与限制</h3>
            </div>
            <div className="panelPad" style={{ padding: 14 }}>
              <div style={{ display: 'grid', gap: 6 }}>
                {scenario.berths.map((b) => (
                  <div key={b.id} className="small" style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span className="muted">{b.name}</span>
                    <span className="mono faint">
                      吃水 {b.maxDraftM.toFixed(1)} / {b.lengthM}m
                    </span>
                  </div>
                ))}
              </div>
              <div className="divider" />
              <div className="small faint">
                泊位周转 {10} 分钟 · 引航员转场 15 分钟 · 未指派引航员即无法进港
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBlocked && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panelHead">
            <h3>拦截记录 · 错题来源</h3>
            <div className="headSpacer" />
            <span className="small faint">{blocked.length} 次</span>
            <button className="btn tiny ghost" onClick={() => setShowBlocked(false)}>
              收起
            </button>
          </div>
          <div className="panelPad">
            <BlockedFeed items={blocked} scenario={scenario} />
          </div>
        </div>
      )}

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panelHead">
          <h3>推演结果</h3>
          <div className="headSpacer" />
          {phase === 'done' && (
            <span className="small faint">
              准点率 {Math.round(result.metrics.onTimeRate * 100)}% · 冲突 {result.incidents.length} · 平均等待{' '}
              {result.metrics.avgWaitMin.toFixed(0)} 分
            </span>
          )}
        </div>
        <div className="panelPad">
          {phase !== 'done' ? (
            <div className="small faint">
              完成排程后点「开始推演」，时间推进到训练时限结束时这里会给出每条船的实际靠泊结果与事故清单。
              {uncoveredCount > 0 && (
                <span style={{ color: 'var(--amber)' }}> 当前还有 {uncoveredCount} 条船未排泊位。</span>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <div className="small muted" style={{ marginBottom: 6 }}>
                  每条船的结果
                </div>
                <table className="dataTable">
                  <thead>
                    <tr>
                      <th>船</th>
                      <th>计划开始</th>
                      <th>实际开始</th>
                      <th>等待</th>
                      <th>状态</th>
                      <th>事故</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.outcomes.map((o) => {
                      const shipInc = result.incidents.filter((i) => i.shipIds.includes(o.shipId));
                      return (
                        <tr key={o.shipId}>
                          <td>{o.shipName}</td>
                          <td className="mono">{o.plannedStartMin === null ? '未排' : clock(scenario, o.plannedStartMin)}</td>
                          <td className="mono">{o.actualStartMin === null ? '—' : clock(scenario, o.actualStartMin)}</td>
                          <td className="mono">{o.waitMin.toFixed(0)} 分</td>
                          <td>
                            <span
                              className={`chip ${o.status === 'on-time' ? 'green' : o.status === 'late' ? 'amber' : 'red'}`}
                            >
                              {o.status === 'on-time' ? '准点' : o.status === 'late' ? '延误' : o.status === 'missed' ? '误船' : '未靠泊'}
                            </span>
                          </td>
                          <td className="small" style={{ color: shipInc.length ? 'var(--red)' : 'var(--text-faint)' }}>
                            {shipInc.length ? shipInc.map((i) => i.message).join(' / ') : '无'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div>
                <div className="small muted" style={{ marginBottom: 6 }}>
                  事故清单
                </div>
                <IncidentList scenario={scenario} incidents={result.incidents} />
              </div>
              <div>
                <div className="small muted" style={{ marginBottom: 6 }}>
                  计分拆分
                </div>
                <div className="metricList" style={{ maxWidth: 460 }}>
                  <MetricRow label="准点分" value={result.metrics.breakdown.punctuality} max={50} />
                  <MetricRow label="无冲突分" value={result.metrics.breakdown.conflict} max={30} />
                  <MetricRow label="效率分" value={result.metrics.breakdown.efficiency} max={20} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {confirmSubmit && (
        <Modal
          title="提交成绩"
          onClose={() => setConfirmSubmit(false)}
          footer={
            <>
              <button className="btn ghost" onClick={() => setConfirmSubmit(false)}>
                再看看
              </button>
              <button className="btn primary" onClick={doSubmit} data-testid="confirm-submit">
                确认提交
              </button>
            </>
          }
        >
          {student ? (
            <div style={{ display: 'grid', gap: 12 }}>
              <div className="okBox">
                提交人为 <b>{student.name}</b>（{student.classCode}）。
              </div>
              <dl className="kv">
                <dt>关卡</dt>
                <dd>{scenario.title}</dd>
                <dt>客观分</dt>
                <dd>
                  <b>{result.metrics.objective.toFixed(1)}</b> / 100
                </dd>
                <dt>准点率</dt>
                <dd>{Math.round(result.metrics.onTimeRate * 100)}%</dd>
                <dt>冲突次数</dt>
                <dd>{result.metrics.incidentCount}</dd>
                <dt>平均等待</dt>
                <dd>{result.metrics.avgWaitMin.toFixed(0)} 分钟</dd>
                <dt>拦截记录</dt>
                <dd>{blocked.length} 次</dd>
              </dl>
              <div className="small faint">
                提交后计划与拦截记录会进入复核队列；教员可回放本次推演、扣分并写评语。
              </div>
            </div>
          ) : (
            <div className="warnBox">尚未选择学员身份，请先回到训练台选择姓名与班级。</div>
          )}
        </Modal>
      )}

      <ToastHost toasts={toasts} onDismiss={dismissToast} />
      {warnings.length > 0 && phase === 'edit' && (
        <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Bar value={assignments.length / scenario.ships.length} />
          <span className="small faint">
            排程进度 {assignments.length}/{scenario.ships.length}
          </span>
        </div>
      )}
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
