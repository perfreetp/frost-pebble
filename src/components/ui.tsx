import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  BLOCKED_RULE_LABELS,
  type Assignment,
  type BlockedAttempt,
  type BlockedRule,
  type Incident,
  type Scenario,
  type Ship,
  type ShipOutcome,
} from '../game/types';
import { clock, planWarnings, simulateRun, timeRange } from '../game/engine';

/* ------------------------------ 小组件 ------------------------------ */

export function Chip({
  tone = 'plain',
  children,
}: {
  tone?: 'plain' | 'teal' | 'amber' | 'red' | 'green' | 'blue';
  children: ReactNode;
}) {
  return <span className={`chip ${tone === 'plain' ? '' : tone}`}>{children}</span>;
}

export function Bar({ value, tone }: { value: number; tone?: 'warn' | 'bad' }) {
  const pct = Math.max(0, Math.min(100, value * 100));
  return (
    <div className={`bar ${tone ?? ''}`}>
      <i style={{ width: `${pct}%` }} />
    </div>
  );
}

export function StatCard({
  value,
  label,
  tone,
}: {
  value: ReactNode;
  label: string;
  tone?: 'amber' | 'red';
}) {
  return (
    <div className={`statCard ${tone ?? ''}`}>
      <b>{value}</b>
      <span>{label}</span>
    </div>
  );
}

/* ------------------------------ 潮汐条 ------------------------------ */

export function TideStrip({ scenario, from = 0, to }: { scenario: Scenario; from?: number; to?: number }) {
  const end = to ?? scenario.horizonMin;
  const points = scenario.tide.filter((p) => p.min >= from && p.min <= end);
  const max = Math.max(...scenario.tide.map((p) => p.heightM), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 40 }}>
      {points.map((p) => (
        <div
          key={p.min}
          title={`${clock(scenario, p.min)} 潮高 ${p.heightM.toFixed(1)} m`}
          style={{
            width: 8,
            height: `${Math.max(8, (p.heightM / max) * 40)}px`,
            borderRadius: 3,
            background: p.heightM >= 4.2 ? 'rgba(63,208,201,0.75)' : 'rgba(63,208,201,0.3)',
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------ 船舶表单 ------------------------------ */

export interface ShipFormState {
  berthId: string;
  pilotId: string;
  tugIds: string[];
  startMin: number;
}

export function ShipComposer({
  scenario,
  ship,
  value,
  issue,
  onPatch,
  onSubmit,
  onCancel,
  onDelete,
  submitLabel = '排入计划',
  existingPilotLess,
}: {
  scenario: Scenario;
  ship: Ship;
  value: ShipFormState;
  issue: { rule: BlockedRule; message: string } | null;
  onPatch: (patch: Partial<ShipFormState>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  submitLabel?: string;
  existingPilotLess?: boolean;
}) {
  const berths = scenario.berths;
  const pilots = scenario.pilots;
  const minStart = Math.max(ship.etaMin, ship.tideFromMin);
  const maxStart = Math.max(minStart, Math.min(ship.tideToMin - ship.mooringMin, scenario.horizonMin - ship.mooringMin));
  const tugOk = value.tugIds.length >= ship.tugsNeeded;

  return (
    <div className="shipForm" data-testid="ship-composer">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <b style={{ fontSize: 14 }}>{ship.name}</b>
        <Chip tone="blue">{ship.lengthM} m</Chip>
        <Chip tone="teal">吃水 {ship.draftM.toFixed(1)} m</Chip>
        <Chip>{ship.cargo}</Chip>
      </div>
      <div className="small muted">
        潮窗 {timeRange(scenario, ship.tideFromMin, ship.tideToMin)} · 作业 {ship.mooringMin} 分钟 · 需 {ship.tugsNeeded} 艘拖轮
      </div>

      <div className="formGrid">
        <div className="field">
          <label htmlFor="ship-berth">泊位</label>
          <select
            id="ship-berth"
            className="select"
            data-testid="berth-select"
            value={value.berthId}
            onChange={(e) => onPatch({ berthId: e.target.value })}
          >
            {berths.map((b) => {
              const tooDeep = ship.draftM > b.maxDraftM;
              const tooLong = ship.lengthM > b.lengthM;
              return (
                <option key={b.id} value={b.id}>
                  {b.name}
                  {tooDeep || tooLong ? '（不适配）' : ''}
                </option>
              );
            })}
          </select>
        </div>
        <div className="field">
          <label htmlFor="ship-pilot">引航员</label>
          <select
            id="ship-pilot"
            className="select"
            data-testid="pilot-select"
            value={value.pilotId}
            onChange={(e) => onPatch({ pilotId: e.target.value })}
          >
            <option value="">— 待指派 —</option>
            {pilots.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.note ? ` · ${p.note}` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="ship-start">
          开始靠泊 {clock(scenario, value.startMin)}（可填 {clock(scenario, minStart)}–{clock(scenario, maxStart)}）
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            id="ship-start"
            className="playScrub"
            type="range"
            min={minStart}
            max={maxStart}
            step={5}
            value={Math.min(maxStart, Math.max(minStart, value.startMin))}
            data-testid="start-range"
            onChange={(e) => onPatch({ startMin: Number(e.target.value) })}
          />
          <input
            className="input num"
            type="number"
            step={5}
            min={minStart}
            max={maxStart}
            value={value.startMin}
            onChange={(e) => onPatch({ startMin: Number(e.target.value) })}
            aria-label="开始分钟"
          />
        </div>
      </div>

      <div className="field">
        <span className="fieldLabel">
          拖轮（{value.tugIds.length}/{ship.tugsNeeded}）
          {!tugOk && <span style={{ color: 'var(--amber)' }}> · 不足会在推演中延误</span>}
        </span>
        <div className="tugPicker">
          {scenario.tugs.map((t) => {
            const pressed = value.tugIds.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                className="tugToggle"
                aria-pressed={pressed}
                onClick={() =>
                  onPatch({
                    tugIds: pressed
                      ? value.tugIds.filter((id) => id !== t.id)
                      : [...value.tugIds, t.id],
                  })
                }
              >
                <span className="tugDot" />
                {t.name}
                <span className="faint">{t.powerTon} 匹</span>
              </button>
            );
          })}
        </div>
      </div>

      {existingPilotLess && (
        <div className="warnBox">该船已排入泊位，但尚未指派引航员 —— 推演时无法进港。</div>
      )}

      {issue ? (
        <div className="issueBox" data-testid="blocked-message">
          <b>已拦截 · {BLOCKED_RULE_LABELS[issue.rule]}</b>
          <div style={{ marginTop: 3 }}>{issue.message}</div>
        </div>
      ) : (
        <div className="okBox">当前参数符合规则，可排入计划。</div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          className={`btn ${issue ? 'danger' : 'primary'}`}
          onClick={onSubmit}
          data-testid="place-ship"
        >
          {submitLabel}
        </button>
        {onDelete && (
          <button className="btn danger small" onClick={onDelete}>
            撤下泊位
          </button>
        )}
        <button className="btn ghost small" onClick={onCancel}>
          收起
        </button>
      </div>
    </div>
  );
}

/* ------------------------------ 计划概览 ------------------------------ */

export function PlanSummary({
  scenario,
  assignments,
  onSelect,
  selectedId,
}: {
  scenario: Scenario;
  assignments: Assignment[];
  onSelect?: (id: string) => void;
  selectedId?: string | null;
}) {
  const result = useMemo(() => simulateRun(scenario, assignments), [scenario, assignments]);
  const warnings = useMemo(() => planWarnings(scenario, assignments), [scenario, assignments]);

  const byShip = new Map(assignments.map((a) => [a.shipId, a]));
  return (
    <div>
      <div className="hud" style={{ marginBottom: 10 }}>
        <span className="hudPill">
          已排 <b>{assignments.length}</b> / {scenario.ships.length}
        </span>
        <span className="hudPill">
          预计冲突 <b style={{ color: result.incidents.length ? 'var(--red)' : 'var(--green)' }}>{result.incidents.length}</b>
        </span>
        <span className="hudPill">
          预判准点率 <b>{Math.round(result.metrics.onTimeRate * 100)}%</b>
        </span>
      </div>
      <table className="planTable">
        <thead>
          <tr>
            <th>船</th>
            <th>泊位</th>
            <th>引航员</th>
            <th>开始</th>
            <th>拖轮</th>
          </tr>
        </thead>
        <tbody>
          {scenario.ships.map((ship) => {
            const a = byShip.get(ship.id);
            const pilot = scenario.pilots.find((p) => p.id === a?.pilotId);
            const berth = scenario.berths.find((b) => b.id === a?.berthId);
            const selected = a && a.id === selectedId;
            return (
              <tr
                key={ship.id}
                className={`${a ? 'clickable' : ''} ${selected ? 'selected' : ''}`}
                onClick={() => a && onSelect?.(a.id)}
                data-row={`plan-${ship.id}`}
              >
                <td>{ship.name}</td>
                <td style={{ color: a ? undefined : 'var(--text-faint)' }}>
                  {berth ? berth.name.split(' · ')[0] : '未排'}
                </td>
                <td style={{ color: !a?.pilotId ? 'var(--amber)' : undefined }}>
                  {a ? (pilot?.name ?? '未指派') : '—'}
                </td>
                <td className="mono">{a ? clock(scenario, a.startMin) : '—'}</td>
                <td>
                  {a ? (
                    <span style={{ color: a.tugIds.length >= ship.tugsNeeded ? undefined : 'var(--amber)' }}>
                      {a.tugIds.length}/{ship.tugsNeeded}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {warnings.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div className="small" style={{ color: 'var(--amber)' }}>
            待处理提示（不拦截，但推演时可能变成事故）
          </div>
          <div className="warnList">
            {warnings.slice(0, 6).map((w, i) => (
              <div key={`${w.rule}-${i}`} className="warnItem">
                {w.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ 拦截记录 ------------------------------ */

export function BlockedFeed({ items, scenario }: { items: BlockedAttempt[]; scenario: Scenario }) {
  if (items.length === 0) {
    return (
      <div className="emptyState">
        还没有被拦截的动作。
        <div className="small" style={{ marginTop: 4 }}>
          任何违规的拖放都会在这里留下原因说明。
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: 'grid', gap: 8, maxHeight: 260, overflow: 'auto' }}>
      {[...items].reverse().map((b) => (
        <div key={b.id} className="incidentCard">
          <div className="t">
            {clock(scenario, b.atMin)} · {BLOCKED_RULE_LABELS[b.rule]}
          </div>
          {b.message}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ 结果面板 ------------------------------ */

export function OutcomeBadge({ outcome }: { outcome: ShipOutcome }) {
  const map = {
    'on-time': { label: '准点', tone: 'green' as const },
    late: { label: '延误', tone: 'amber' as const },
    missed: { label: '误船', tone: 'red' as const },
    unassigned: { label: '未靠泊', tone: 'red' as const },
  };
  const v = map[outcome.status];
  return <Chip tone={v.tone}>{v.label}</Chip>;
}

export function IncidentList({ scenario, incidents }: { scenario: Scenario; incidents: Incident[] }) {
  if (incidents.length === 0) {
    return (
      <div className="okBox" data-testid="no-incidents">
        推演全程无冲突：所有计划船舶都按规则靠泊。
      </div>
    );
  }
  return (
    <div className="incidentList">
      {incidents.map((inc) => (
        <div key={inc.id} className="incidentCard" data-testid="incident">
          <div className="t">{clock(scenario, inc.timeMin)}</div>
          {inc.message}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ Toast ------------------------------ */

export interface ToastMsg {
  id: number;
  kind: 'error' | 'ok';
  text: string;
}

export function ToastHost({ toasts, onDismiss }: { toasts: ToastMsg[]; onDismiss: (id: number) => void }) {
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => onDismiss(toasts[0].id), 4200);
    return () => clearTimeout(timer);
  }, [toasts, onDismiss]);
  const visible = toasts.slice(-3);
  return (
    <div className="toastWrap" role="status" aria-live="polite">
      {visible.map((t) => (
        <div
          key={t.id}
          className={`toast ${t.kind}`}
          data-testid={`toast-${t.kind}`}
          onClick={() => onDismiss(t.id)}
          style={{ cursor: 'pointer' }}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ 模态框 ------------------------------ */

export function Modal({
  title,
  children,
  footer,
  onClose,
  width,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  width?: number;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modalBackdrop" onClick={onClose}>
      <div
        className="modal"
        style={width ? ({ width: `min(${width}px, 100%)` } as CSSProperties) : undefined}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modalHead">
          <h3>{title}</h3>
          <div className="headSpacer" />
          <button className="iconBtn" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>
        <div className="modalBody">{children}</div>
        {footer && <div className="modalFoot">{footer}</div>}
      </div>
    </div>
  );
}

/* ------------------------------ 工具 ------------------------------ */

/** 输入防抖：拖拽连续更新时减少重绘 */
export function useDebounced<T>(value: T, delay = 40): T {
  const [v, setV] = useState(value);
  const ref = useRef(value);
  ref.current = value;
  useEffect(() => {
    const t = setTimeout(() => setV(ref.current), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
