import { useMemo, useState } from 'react';
import { useStore, selectActiveDesign } from '../store/useStore';
import type { BlastHole } from '../types';

type Tab = 'hole' | 'rows' | 'skips';

export function RightPanel() {
  const design = useStore(selectActiveDesign);
  const selectedHoleId = useStore((s) => s.selectedHoleId);
  const [tab, setTab] = useState<Tab>('hole');

  const selected = useMemo(
    () => design?.holes.find((h) => h.id === selectedHoleId) ?? null,
    [design, selectedHoleId],
  );

  if (!design) return <aside className="panel right-panel"><p className="muted">无活动设计</p></aside>;
  const readOnly = design.status === 'archived';
  const skipped = design.holes.filter((h) => h.state === 'skipped');

  return (
    <aside className="panel right-panel">
      <div className="tab-head">
        {([['hole', '孔参数'], ['rows', '排距重算'], ['skips', `避让明细(${skipped.length})`]] as [Tab, string][]).map(
          ([id, label]) => (
            <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
              {label}
            </button>
          ),
        )}
      </div>

      {tab === 'hole' && <HoleTab hole={selected} readOnly={readOnly} />}
      {tab === 'rows' && <RowsTab readOnly={readOnly} />}
      {tab === 'skips' && <SkipsTab />}
    </aside>
  );
}

function HoleTab({ hole, readOnly }: { hole: BlastHole | null; readOnly: boolean }) {
  const updateHole = useStore((s) => s.updateHole);
  if (!hole) {
    return <div className="tab-body"><p className="muted">在图上点击任一炮孔，这里联动显示并可编辑其参数。</p></div>;
  }
  return (
    <div className="tab-body">
      <div className={`hole-card ${hole.state === 'skipped' ? 'skipped' : ''}`}>
        <div className="hole-card-head">
          <b>{hole.code}</b>
          <span className={`state-tag ${hole.state}`}>
            {hole.state === 'skipped' ? '已避让跳过' : '有效孔'}
          </span>
        </div>
        {hole.skipReason && <p className="warn-text">避让原因：{hole.skipReason}</p>}
        <div className="form-grid">
          <label>X 坐标 (m)
            <input type="number" value={hole.x} disabled
              onChange={(e) => updateHole(hole.id, { x: Number(e.target.value) })} />
          </label>
          <label>Y 坐标 (m)
            <input type="number" value={hole.y} disabled
              onChange={(e) => updateHole(hole.id, { y: Number(e.target.value) })} />
          </label>
          <label>孔口高程 (m)
            <input type="number" value={hole.collarElevation} disabled />
          </label>
          <label>孔深 (m)
            <input type="number" step={0.1} value={hole.depth} disabled={readOnly || hole.state === 'skipped'}
              onChange={(e) => updateHole(hole.id, { depth: Number(e.target.value) })} />
          </label>
          <label>孔径 (mm)
            <input type="number" value={hole.diameter} disabled={readOnly || hole.state === 'skipped'}
              onChange={(e) => updateHole(hole.id, { diameter: Number(e.target.value) })} />
          </label>
          <label>倾角 (°)
            <input type="number" value={hole.inclination} disabled={readOnly || hole.state === 'skipped'}
              onChange={(e) => updateHole(hole.id, { inclination: Number(e.target.value) })} />
          </label>
          <label>堵塞长度 (m)
            <input type="number" step={0.1} value={hole.stemming} disabled={readOnly || hole.state === 'skipped'}
              onChange={(e) => updateHole(hole.id, { stemming: Number(e.target.value) })} />
          </label>
          <label>装药量 (kg)
            <input type="number" step={0.1} value={hole.charge} disabled={readOnly || hole.state === 'skipped'}
              onChange={(e) => updateHole(hole.id, { charge: Number(e.target.value) })} />
          </label>
          <label>雷管段位
            <input type="number" value={hole.detonatorDelay < 0 ? '—' : hole.detonatorDelay} disabled />
          </label>
        </div>
        <p className="hint-text">修改孔深或堵塞长度后，装药量按 (孔深−堵塞)×单位装药量 自动重算。</p>
      </div>
    </div>
  );
}

function RowsTab({ readOnly }: { readOnly: boolean }) {
  const design = useStore(selectActiveDesign)!;
  const updateRowSpacing = useStore((s) => s.updateRowSpacing);
  const updateRowBurden = useStore((s) => s.updateRowBurden);
  const removeArray = useStore((s) => s.removeArray);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    const next = new Set(collapsed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCollapsed(next);
  };

  return (
    <div className="tab-body">
      <p className="hint-text">修改任一排的孔间距，该排立即重算；修改排距，该排及其后各排沿法向整体平移重算。</p>
      {design.arrays.map((arr) => (
        <div key={arr.id} className="array-card">
          <div className="array-head" onClick={() => toggle(arr.id)}>
            <b>{arr.name}</b>
            <span>{arr.rows.length} 排 ｜ {arr.rows[0]?.plannedCount ?? 0} 孔/排
              {collapsed.has(arr.id) ? ' ▸' : ' ▾'}</span>
          </div>
          {!collapsed.has(arr.id) && (
            <>
              <div className="row-edit-list">
                {arr.rows.map((row, idx) => {
                  const isLast = idx === arr.rows.length - 1;
                  return (
                    <div key={row.id} className="row-edit">
                      <span className="row-idx">第{idx + 1}排</span>
                      <label>间距
                        <input
                          type="number" step={0.1} min={0.5} value={row.spacing}
                          disabled={readOnly}
                          onChange={(e) => updateRowSpacing(row.id, Number(e.target.value))}
                        />
                      </label>
                      <label>排距{idx > 0 ? '' : '（至下排）'}
                        <input
                          type="number" step={0.1} min={0.5} value={row.burden}
                          disabled={readOnly || isLast}
                          title={isLast ? '末排之后无相邻排，该值不影响孔位' : '决定与下一排之间的法向距离'}
                          onChange={(e) => updateRowBurden(row.id, Number(e.target.value))}
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
              {!readOnly && (
                <button className="danger-btn" onClick={() => removeArray(arr.id)}>删除该阵列</button>
              )}
            </>
          )}
        </div>
      ))}
      {design.arrays.length === 0 && <p className="muted">暂无阵列，请先在图上布孔。</p>}
    </div>
  );
}

function SkipsTab() {
  const design = useStore(selectActiveDesign)!;
  const selectHole = useStore((s) => s.selectHole);
  const skipped = design.holes.filter((h) => h.state === 'skipped');
  const reasons = useMemo(() => {
    const map = new Map<string, number>();
    for (const h of skipped) {
      const key = h.skipReason ?? '未知原因';
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()];
  }, [skipped]);

  return (
    <div className="tab-body">
      <div className="skip-summary">
        {reasons.map(([reason, count]) => (
          <div key={reason} className="skip-reason-row">
            <span>{reason}</span><b>{count}</b>
          </div>
        ))}
        {reasons.length === 0 && <p className="ok-text">全部孔位有效，无避让。</p>}
      </div>
      <div className="skip-hole-list">
        {skipped.slice(0, 200).map((h) => (
          <button key={h.id} className="skip-hole-item" onClick={() => selectHole(h.id)}>
            <b>{h.code}</b>
            <span>{h.skipReason}</span>
          </button>
        ))}
        {skipped.length > 200 && <p className="muted">仅显示前 200 条，共 {skipped.length} 条。</p>}
      </div>
    </div>
  );
}
