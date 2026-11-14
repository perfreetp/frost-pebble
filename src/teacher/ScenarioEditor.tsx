import { useMemo, useState } from 'react';
import type { Berth, Pilot, Scenario, Ship, TidePoint, Tug } from '../game/types';
import { clock } from '../game/engine';
import { planScenario } from '../game/planner';
import { Chip } from '../components/ui';

export interface EditorResult {
  scenario: Scenario;
}

const NEW_BERTH = (i: number): Berth => ({
  id: `berth-c${i}`,
  name: `${i}号泊位 · 自编`,
  maxDraftM: 10,
  lengthM: 220,
});

const NEW_PILOT = (i: number): Pilot => ({ id: `pilot-c${i}`, name: `引航员 ${i}` });

const NEW_TUG = (i: number): Tug => ({ id: `tug-c${i}`, name: `拖${i}`, powerTon: 2600 });

const NEW_SHIP = (i: number): Ship => ({
  id: `ship-c${i}`,
  name: `新船 ${i}`,
  lengthM: 180,
  draftM: 8.5,
  etaMin: (i - 1) * 20,
  tideFromMin: (i - 1) * 20,
  tideToMin: 220,
  mooringMin: 55,
  tugsNeeded: 1,
  cargo: '自编货种',
});

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000).toString(36)}`;
}

export function BlankScenarioEditor({
  initial,
  existingIds,
  onSave,
  onPreview,
}: {
  initial: Scenario | null;
  existingIds: string[];
  onSave: (scenario: Scenario) => void;
  onPreview: (scenario: Scenario) => void;
}) {
  const [draft, setDraft] = useState<Scenario>(() =>
    initial
      ? structuredClone(initial)
      : {
          id: uid('custom'),
          title: '自编训练题 1',
          tier: 'beginner',
          brief: '教员自编：根据本班进度设定船舶、泊位与潮汐约束。',
          startClockMin: 360,
          horizonMin: 300,
          ontimeTolMin: 20,
          berths: [NEW_BERTH(1), NEW_BERTH(2), NEW_BERTH(3)],
          ships: [NEW_SHIP(1), NEW_SHIP(2), NEW_SHIP(3)],
          pilots: [NEW_PILOT(1), NEW_PILOT(2)],
          tugs: [NEW_TUG(1), NEW_TUG(2), NEW_TUG(3)],
          tide: [
            { min: 0, heightM: 2.4 },
            { min: 60, heightM: 3.8 },
            { min: 120, heightM: 4.6 },
            { min: 180, heightM: 3.6 },
            { min: 240, heightM: 2.6 },
            { min: 300, heightM: 3.4 },
          ],
          custom: true,
        },
  );
  const [error, setError] = useState<string | null>(null);
  const [notice] = useState<string | null>(null);

  const patch = (p: Partial<Scenario>) => {
    setDraft((d) => ({ ...d, ...p }));
    setError(null);
  };

  const patchShip = (i: number, p: Partial<Ship>) => {
    setDraft((d) => ({
      ...d,
      ships: d.ships.map((s, idx) => (idx === i ? { ...s, ...p } : s)),
    }));
    setError(null);
  };

  const patchBerth = (i: number, p: Partial<Berth>) => {
    setDraft((d) => ({
      ...d,
      berths: d.berths.map((b, idx) => (idx === i ? { ...b, ...p } : b)),
    }));
    setError(null);
  };

  const patchTide = (i: number, p: Partial<TidePoint>) => {
    setDraft((d) => ({
      ...d,
      tide: d.tide.map((t, idx) => (idx === i ? { ...t, ...p } : t)),
    }));
    setError(null);
  };

  const plan = useMemo(() => planScenario(draft), [draft]);
  const ids = useMemo(() => new Set(draft.ships.map((s) => s.id)), [draft.ships]);

  const validateAndBuild = (): Scenario | null => {
    if (!draft.title.trim()) {
      setError('请填写题目标题。');
      return null;
    }
    if (draft.ships.length === 0) {
      setError('至少需要一条船。');
      return null;
    }
    if (draft.berths.length === 0) {
      setError('至少需要一个泊位。');
      return null;
    }
    if (ids.size !== draft.ships.length) {
      setError('船舶 ID 重复，请重新添加船舶。');
      return null;
    }
    if (draft.tide.length < 2) {
      setError('潮汐表至少需要两个潮高采样点。');
      return null;
    }
    const unfit = draft.ships.filter((s) =>
      draft.berths.every((b) => s.draftM > b.maxDraftM || s.lengthM > b.lengthM),
    );
    if (unfit.length > 0) {
      setError(`以下船舶没有任何适配泊位：${unfit.map((s) => s.name).join('、')}`);
      return null;
    }
    return { ...draft, custom: true };
  };

  const save = () => {
    const s = validateAndBuild();
    if (!s) return;
    onSave(s);
  };

  const handlePreview = () => {
    const s = validateAndBuild();
    if (!s) return;
    onPreview(s);
  };

  const addShip = () => {
    setDraft((d) => ({ ...d, ships: [...d.ships, NEW_SHIP(d.ships.length + 1)] }));
  };

  const removeShip = (i: number) => {
    setDraft((d) => ({ ...d, ships: d.ships.filter((_, idx) => idx !== i) }));
  };

  return (
    <div className="panel panelPad" style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="small faint">编辑中：{initial ? '修改既有题目' : '新题目'}</span>
        {notice && <Chip tone="green">{notice}</Chip>}
        {error && <Chip tone="red">{error}</Chip>}
      </div>

      <div className="fieldRow">
        <div className="field" style={{ flex: 2, minWidth: 220 }}>
          <label className="fieldLabel" htmlFor="s-title">题目标题</label>
          <input
            id="s-title"
            className="input"
            value={draft.title}
            onChange={(e) => patch({ title: e.target.value })}
            data-testid="scenario-title"
          />
        </div>
        <div className="field">
          <label className="fieldLabel" htmlFor="s-tier">难度档</label>
          <select
            id="s-tier"
            className="select"
            value={draft.tier}
            onChange={(e) => patch({ tier: e.target.value === 'advanced' ? 'advanced' : 'beginner' })}
          >
            <option value="beginner">初级</option>
            <option value="advanced">高级</option>
          </select>
        </div>
        <div className="field">
          <label className="fieldLabel" htmlFor="s-clock">开始时刻（分钟）</label>
          <input
            id="s-clock"
            className="input num"
            type="number"
            min={0}
            max={1439}
            value={draft.startClockMin}
            onChange={(e) => patch({ startClockMin: Math.max(0, Math.min(1439, Number(e.target.value))) })}
          />
        </div>
        <div className="field">
          <label className="fieldLabel" htmlFor="s-horizon">训练时限（分钟）</label>
          <input
            id="s-horizon"
            className="input num"
            type="number"
            min={60}
            max={900}
            step={30}
            value={draft.horizonMin}
            onChange={(e) => patch({ horizonMin: Math.max(60, Math.min(900, Number(e.target.value))) })}
            data-testid="scenario-horizon"
          />
        </div>
        <div className="field">
          <label className="fieldLabel" htmlFor="s-tol">准点容差（分钟）</label>
          <input
            id="s-tol"
            className="input num"
            type="number"
            min={5}
            max={60}
            value={draft.ontimeTolMin}
            onChange={(e) => patch({ ontimeTolMin: Math.max(5, Math.min(60, Number(e.target.value))) })}
          />
        </div>
      </div>

      <div className="field">
        <label className="fieldLabel" htmlFor="s-brief">题目说明</label>
        <textarea
          id="s-brief"
          className="textarea"
          value={draft.brief}
          onChange={(e) => patch({ brief: e.target.value })}
          style={{ minHeight: 60 }}
        />
      </div>

      {/* 泊位 */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <b style={{ fontSize: 13 }}>泊位（{draft.berths.length}）</b>
          <div className="headSpacer" />
          <button
            className="btn tiny"
            onClick={() =>
              setDraft((d) => ({ ...d, berths: [...d.berths, NEW_BERTH(d.berths.length + 1)] }))
            }
          >
            ＋ 泊位
          </button>
        </div>
        <div style={{ display: 'grid', gap: 6 }}>
          {draft.berths.map((b, i) => (
            <div key={b.id} className="shipEditorRow" style={{ gridTemplateColumns: '1.4fr 1fr 1fr 32px' }}>
              <input
                className="input"
                value={b.name}
                onChange={(e) => patchBerth(i, { name: e.target.value })}
                aria-label={`泊位 ${i + 1} 名称`}
              />
              <input
                className="input"
                type="number"
                step={0.1}
                value={b.maxDraftM}
                onChange={(e) => patchBerth(i, { maxDraftM: Number(e.target.value) })}
                aria-label={`泊位 ${i + 1} 限吃水`}
              />
              <input
                className="input"
                type="number"
                value={b.lengthM}
                onChange={(e) => patchBerth(i, { lengthM: Number(e.target.value) })}
                aria-label={`泊位 ${i + 1} 可容纳船长`}
              />
              <button
                className="iconBtn"
                onClick={() => setDraft((d) => ({ ...d, berths: d.berths.filter((_, idx) => idx !== i) }))}
                aria-label="删除泊位"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="tiny faint" style={{ marginTop: 4 }}>泊位名称 · 限吃水(m) · 可容纳船长(m)</div>
      </div>

      {/* 船舶 */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <b style={{ fontSize: 13 }}>船舶清单（{draft.ships.length}）</b>
          <div className="headSpacer" />
          <button className="btn tiny" onClick={addShip} data-testid="add-ship">
            ＋ 船舶
          </button>
        </div>
        <div className="shipEditorRow" style={{ paddingBottom: 2 }}>
          {['船名', '吃水m', '船长m', 'ETA', '潮窗起', '潮窗止', '作业分', '拖轮', ''].map((h) => (
            <div key={h} className="rowHead">{h}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gap: 6 }}>
          {draft.ships.map((s, i) => (
            <div key={s.id} className="shipEditorRow">
              <input className="input" value={s.name} onChange={(e) => patchShip(i, { name: e.target.value })} aria-label={`船 ${i + 1} 名称`} />
              <input className="input" type="number" step={0.1} value={s.draftM} onChange={(e) => patchShip(i, { draftM: Number(e.target.value) })} aria-label={`船 ${i + 1} 吃水`} />
              <input className="input" type="number" value={s.lengthM} onChange={(e) => patchShip(i, { lengthM: Number(e.target.value) })} aria-label={`船 ${i + 1} 船长`} />
              <input className="input" type="number" step={5} value={s.etaMin} onChange={(e) => patchShip(i, { etaMin: Number(e.target.value) })} aria-label={`船 ${i + 1} ETA`} />
              <input className="input" type="number" step={5} value={s.tideFromMin} onChange={(e) => patchShip(i, { tideFromMin: Number(e.target.value) })} aria-label={`船 ${i + 1} 潮窗起`} />
              <input className="input" type="number" step={5} value={s.tideToMin} onChange={(e) => patchShip(i, { tideToMin: Number(e.target.value) })} aria-label={`船 ${i + 1} 潮窗止`} />
              <input className="input" type="number" step={5} value={s.mooringMin} onChange={(e) => patchShip(i, { mooringMin: Number(e.target.value) })} aria-label={`船 ${i + 1} 作业时长`} />
              <input className="input" type="number" min={0} max={6} value={s.tugsNeeded} onChange={(e) => patchShip(i, { tugsNeeded: Number(e.target.value) })} aria-label={`船 ${i + 1} 拖轮数`} />
              <button className="iconBtn" onClick={() => removeShip(i)} aria-label="删除船舶">×</button>
            </div>
          ))}
        </div>
        <div className="tiny faint" style={{ marginTop: 6 }}>
          ETA / 潮窗为相对场景起点的分钟数，当前起点 {clock(draft, 0)}。
        </div>
      </div>

      {/* 引航员与拖轮 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <b style={{ fontSize: 13 }}>引航员（{draft.pilots.length}）</b>
            <div className="headSpacer" />
            <button
              className="btn tiny"
              onClick={() => setDraft((d) => ({ ...d, pilots: [...d.pilots, NEW_PILOT(d.pilots.length + 1)] }))}
            >
              ＋
            </button>
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            {draft.pilots.map((p, i) => (
              <div key={p.id} style={{ display: 'flex', gap: 6 }}>
                <input
                  className="input"
                  value={p.name}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      pilots: d.pilots.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)),
                    }))
                  }
                  aria-label={`引航员 ${i + 1} 名称`}
                />
                <button className="iconBtn" onClick={() => setDraft((d) => ({ ...d, pilots: d.pilots.filter((_, idx) => idx !== i) }))} aria-label="删除引航员">×</button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <b style={{ fontSize: 13 }}>拖轮（{draft.tugs.length}）</b>
            <div className="headSpacer" />
            <button
              className="btn tiny"
              onClick={() => setDraft((d) => ({ ...d, tugs: [...d.tugs, NEW_TUG(d.tugs.length + 1)] }))}
            >
              ＋
            </button>
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            {draft.tugs.map((t, i) => (
              <div key={t.id} style={{ display: 'flex', gap: 6 }}>
                <input
                  className="input"
                  value={t.name}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      tugs: d.tugs.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)),
                    }))
                  }
                  aria-label={`拖轮 ${i + 1} 名称`}
                />
                <button className="iconBtn" onClick={() => setDraft((d) => ({ ...d, tugs: d.tugs.filter((_, idx) => idx !== i) }))} aria-label="删除拖轮">×</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 潮汐表 */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <b style={{ fontSize: 13 }}>潮汐表（{draft.tide.length} 个采样点）</b>
          <div className="headSpacer" />
          <button
            className="btn tiny"
            onClick={() =>
              setDraft((d) => ({
                ...d,
                tide: [...d.tide, { min: Math.min(d.horizonMin, (d.tide.at(-1)?.min ?? 0) + 60), heightM: 3.5 }],
              }))
            }
          >
            ＋ 采样点
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
          {draft.tide.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              <input
                className="input num"
                type="number"
                step={5}
                min={0}
                value={t.min}
                onChange={(e) => patchTide(i, { min: Number(e.target.value) })}
                aria-label={`潮汐 ${i + 1} 分钟`}
              />
              <input
                className="input num"
                type="number"
                step={0.1}
                value={t.heightM}
                onChange={(e) => patchTide(i, { heightM: Number(e.target.value) })}
                aria-label={`潮汐 ${i + 1} 潮高`}
              />
              <button className="iconBtn" onClick={() => setDraft((d) => ({ ...d, tide: d.tide.filter((_, idx) => idx !== i) }))} aria-label="删除潮汐点">×</button>
            </div>
          ))}
        </div>
        <div className="tiny faint" style={{ marginTop: 4 }}>顺序为「分钟 · 潮高(m)」，曲线在相邻采样点之间线性插值。</div>
      </div>

      <div className="divider" />

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip tone={plan && plan.length === draft.ships.length ? 'green' : 'red'}>
          {plan && plan.length === draft.ships.length
            ? `可行：${plan.length} 条船全部可排`
            : '资源不足：无法为全部船舶找到合法时段'}
        </Chip>
        <div className="headSpacer" />
        <button className="btn ghost" onClick={handlePreview} data-testid="preview-scenario">
          预览时间轴
        </button>
        <button className="btn primary" onClick={save} data-testid="save-scenario">
          保存题目
        </button>
      </div>
      <div className="small faint">
        保存后题目立即出现在学员端关卡列表；学员提交后进入复核队列。{existingIds.length > 0 && `（已有 ${existingIds.length} 道自编题）`}
      </div>
      {notice && <div className="okBox">{notice}</div>}
    </div>
  );
}
