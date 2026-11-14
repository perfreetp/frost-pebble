import type { ReactNode } from 'react';
import type { OrderStatus, RectifyItem } from '../domain/types';
import { STATUS_META } from '../domain/workflow';
import { fmtDateTime } from '../domain/workflow';

export function StatusChip({ status, small }: { status: OrderStatus; small?: boolean }) {
  const meta = STATUS_META[status];
  return (
    <span className={`chip chip-${meta.tone}`} style={small ? { height: 19, fontSize: 10.5 } : undefined}>
      <span className={`tone-dot tone-${meta.tone}`} />
      {meta.label}
    </span>
  );
}

export function Panel({
  title,
  right,
  children,
  className,
  bodyClassName,
  style,
}: {
  title?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`panel ${className ?? ''}`} style={style}>
      {title !== undefined && (
        <div className="panel-head">
          <div className="panel-title">{title}</div>
          <div className="spacer" />
          {right}
        </div>
      )}
      <div className={`panel-body ${bodyClassName ?? ''}`}>{children}</div>
    </div>
  );
}

export function KV({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="kv">
      <span>{k}</span>
      <span>{v}</span>
    </div>
  );
}

export function StatCard({
  label,
  value,
  unit,
  accent,
  sub,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  accent?: 'amber' | 'teal' | 'red' | 'green' | 'blue' | '';
  sub?: ReactNode;
}) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${accent ? `stat-${accent}` : ''}`}>
        {value}
        {unit && <small>{unit}</small>}
      </div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export function Notice({ level, children }: { level: 'warn' | 'error' | 'info' | 'ok'; children: ReactNode }) {
  return <div className={`notice notice-${level}`}>{children}</div>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}

export function RectifyList({ items }: { items: RectifyItem[] }) {
  if (!items.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((it) => (
        <div key={it.id} className="check-row on" style={{ cursor: 'default' }}>
          <span className="check-code">{it.code}</span>
          <span style={{ fontSize: 12 }}>{it.text}</span>
        </div>
      ))}
    </div>
  );
}

export function Modal({
  title,
  onClose,
  children,
  footer,
  wide,
}: {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'modal-lg' : ''}`}>
        <div className="modal-head">
          <div className="modal-title">{title}</div>
          <div className="spacer" />
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Timeline({ entries }: { entries: { id: string; at: number; actorName: string; action: string; detail?: string; role?: string }[] }) {
  return (
    <div className="timeline">
      {entries
        .slice()
        .reverse()
        .map((e) => (
          <div className="timeline-item" key={e.id}>
            <div className="timeline-dot" />
            <div className="timeline-body">
              <div className="timeline-head">
                <span className="timeline-action">{e.action}</span>
                <span className="timeline-meta">{e.actorName}</span>
                <span className="timeline-meta">·</span>
                <span className="timeline-meta mono">{fmtDateTime(e.at)}</span>
              </div>
              {e.detail && <div className="timeline-detail">{e.detail}</div>}
            </div>
          </div>
        ))}
    </div>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <div className="field">
      <label>
        {label}
        {suffix ? <span style={{ color: '#57697c', marginLeft: 4 }}>{suffix}</span> : null}
      </label>
      <input
        className="input mono"
        type="number"
        value={Number.isFinite(value) ? value : ''}
        min={min}
        max={max}
        step={step ?? 1}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onChange(n);
        }}
      />
    </div>
  );
}
