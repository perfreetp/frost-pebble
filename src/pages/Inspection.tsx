import { createEffect, createMemo, createSignal, For, Show } from 'solid-js';
import { Card, Empty, Field, Gauge, RateBar } from '../components/ui';
import { Icon } from '../components/Icon';
import { evaluateMeasurements, saveInspection, state } from '../lib/store';
import { fmtDateTime } from '../lib/utils';
import type { Measurement } from '../lib/types';

function blankRow(no: number, batch: { diameterMin: number; diameterMax: number; heightMin: number; heightMax: number }): Measurement {
  return {
    no,
    diameterCm: Number(((batch.diameterMin + batch.diameterMax) / 2).toFixed(1)),
    heightCm: Number(((batch.heightMin + batch.heightMax) / 2).toFixed(0)),
  };
}

export default function InspectionPage(props: { onGo: (p: 'reports' | 'versions') => void }) {
  const batch = () => state.batches.find((b) => b.id === state.activeBatchId) ?? null;
  const existing = () => (batch() ? state.inspections.find((i) => i.batchId === batch()!.id) : undefined);

  const [threshold, setThreshold] = createSignal(existing()?.threshold ?? 90);
  const [sampleSize, setSampleSize] = createSignal(existing()?.sampleSize ?? 5);
  const [rows, setRows] = createSignal<Measurement[]>([]);
  const [notes, setNotes] = createSignal(existing()?.notes ?? '');
  const [loadedBatch, setLoadedBatch] = createSignal<string | null>(null);

  // 切换批次时载入已有抽检数据或初始化样苗
  createEffect(() => {
    const b = batch();
    if (!b) return;
    if (loadedBatch() === b.id) return;
    setLoadedBatch(b.id);
    const insp = state.inspections.find((i) => i.batchId === b.id);
    if (insp) {
      setRows(insp.measurements.map((m) => ({ ...m })));
      setSampleSize(insp.sampleSize);
      setThreshold(insp.threshold);
      setNotes(insp.notes);
    } else {
      const n = 5;
      setSampleSize(n);
      setThreshold(90);
      setRows(Array.from({ length: n }, (_, i) => blankRow(i + 1, b)));
      setNotes('');
    }
  });

  const result = createMemo(() => {
    const b = batch();
    if (!b) return null;
    return evaluateMeasurements(b, rows(), threshold());
  });

  function addRow() {
    const b = batch();
    if (!b) return;
    const n = rows().length + 1;
    setRows([...rows(), blankRow(n, b)]);
    setSampleSize(n);
  }

  function removeRow(no: number) {
    const next = rows().filter((r) => r.no !== no).map((r, i) => ({ ...r, no: i + 1 }));
    setRows(next);
    setSampleSize(next.length);
  }

  function updateRow(no: number, patch: Partial<Measurement>) {
    setRows((rs) => rs.map((r) => (r.no === no ? { ...r, ...patch } : r)));
  }

  function submit() {
    const b = batch();
    if (!b) return;
    if (!rows().length) return;
    const insp = saveInspection({
      batchId: b.id,
      sampleSize: rows().length,
      threshold: threshold(),
      notes: notes(),
      measurements: rows(),
    });
    setLoadedBatch(b.id);
    if (insp.verdict === 'pass') {
      props.onGo('reports');
    }
  }

  const rowFail = (r: Measurement): string[] => {
    const b = batch();
    if (!b) return [];
    const why: string[] = [];
    if (r.diameterCm < b.diameterMin) why.push('地径偏细');
    if (r.diameterCm > b.diameterMax) why.push('地径超粗');
    if (r.heightCm < b.heightMin) why.push('苗高偏矮');
    if (r.heightCm > b.heightMax) why.push('苗高超高');
    return why;
  };

  const versionCount = createMemo(() => {
    if (!state.activeBatchId) return 0;
    return state.versions.filter((v) => v.batchId === state.activeBatchId).length;
  });

  return (
    <div class="grid" style={{ 'grid-template-columns': 'minmax(0, 1.15fr) minmax(0, 1fr)', gap: '16px', 'align-items': 'start' }}>
      <Card
        title="抽检数据录入"
        sub={batch() ? `${batch()!.code} · ${batch()!.variety} ${batch()!.cultivar} · 出圃 ${batch()!.quantity} 株` : '请选择批次'}
        actions={
          <Show when={batch()}>
            <span class="tag mono">判定区间 地径 {batch()!.diameterMin}–{batch()!.diameterMax} cm / 苗高 {batch()!.heightMin}–{batch()!.heightMax} cm</span>
          </Show>
        }
      >
        <Show
          when={batch()}
          fallback={<Empty text="请先在顶部选择批次。" />}
        >
          <div class="grid" style={{ gap: '12px' }}>
            <div class="grid cols-3" style={{ gap: '10px' }}>
              <Field label="抽检株数">
                <input class="input mono" type="number" min="1" max="30" step="1" value={sampleSize()}
                  onChange={(e) => {
                    const n = Math.max(1, Math.min(30, Number(e.currentTarget.value)));
                    setSampleSize(n);
                    const b = batch()!;
                    setRows((rs) => Array.from({ length: n }, (_, i) => rs[i] ?? blankRow(i + 1, b)));
                  }} />
              </Field>
              <Field label="达标率阈值（%）">
                <input class="input mono" type="number" min="1" max="100" step="1" value={threshold()}
                  onInput={(e) => setThreshold(Number(e.currentTarget.value))} />
              </Field>
              <Field label="质检员">
                <input class="input" value="周敏" disabled />
              </Field>
            </div>

            <div class="card flat" style={{ padding: '12px 14px' }}>
              <div class="row between" style={{ 'margin-bottom': '8px' }}>
                <span style={{ 'font-size': '11px', color: 'var(--ink-3)', 'letter-spacing': '1px' }}>样苗实测 · 逐株判定</span>
                <button class="btn sm" onClick={addRow}><Icon name="plus" size={12} /> 增加一株</button>
              </div>
              <div class="meas-row" style={{ 'margin-bottom': '6px' }}>
                <span class="no">#</span>
                <span style={{ 'font-size': '11px', color: 'var(--ink-3)' }}>地径 cm</span>
                <span style={{ 'font-size': '11px', color: 'var(--ink-3)' }}>苗高 cm</span>
                <span />
              </div>
              <div class="list" style={{ gap: '7px' }}>
                <For each={rows()}>
                  {(r) => (
                    <div class="meas-row">
                      <span class="no">{String(r.no).padStart(2, '0')}</span>
                      <input class="input mono" type="number" min="0" step="0.1" value={r.diameterCm}
                        onInput={(e) => updateRow(r.no, { diameterCm: Number(e.currentTarget.value) })} />
                      <input class="input mono" type="number" min="0" step="1" value={r.heightCm}
                        onInput={(e) => updateRow(r.no, { heightCm: Number(e.currentTarget.value) })} />
                      <div class="row" style={{ gap: '4px', 'justify-content': 'flex-end' }}>
                        <Show when={rowFail(r).length} fallback={<span class="tag ok" style={{ 'font-size': '10px', padding: '2px 6px' }}>达标</span>}>
                          <span class="tag bad" style={{ 'font-size': '10px', padding: '2px 6px' }} title={rowFail(r).join('、')}>
                            {rowFail(r)[0]}
                          </span>
                        </Show>
                        <button class="btn sm icon ghost" title="移除" onClick={() => removeRow(r.no)}>
                          <Icon name="close" size={11} />
                        </button>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </div>

            <Field label="批注 / 原因说明">
              <textarea class="input" value={notes()} onInput={(e) => setNotes(e.currentTarget.value)}
                placeholder="不达标批次须写明原因与处置建议，例如：地径普遍偏细，建议留床再养一季。" />
            </Field>

            <div class="row">
              <button class="btn primary" onClick={submit}>
                <Icon name="check" size={15} /> 提交判定结果
              </button>
              <Show when={versionCount() === 0}>
                <span class="tag warn">尚无合成版本，报告需先存版</span>
              </Show>
              <span class="grow" />
              <Show when={existing()}>
                <span class="hint">上次判定 {fmtDateTime(existing()!.sampledAt)}</span>
              </Show>
            </div>
          </div>
        </Show>
      </Card>

      <div class="grid" style={{ gap: '16px', 'align-content': 'start' }}>
        <Show when={result()} fallback={<Card title="判定结果"><Empty text="录入数据后自动判定。" /></Card>}>
          {(r) => (
            <div class="verdict-banner" classList={{ pass: r().verdict === 'pass', fail: r().verdict === 'fail' }}>
              <Icon name={r().verdict === 'pass' ? 'check' : 'warn'} size={30} />
              <div class="grow">
                <h4>{r().verdict === 'pass' ? '抽检达标 · 可以出圃' : '不达标 · 不出圃'}</h4>
                <div style={{ 'font-size': '12px', color: 'var(--ink-2)' }}>
                  {r().passCount}/{rows().length} 株达标，阈值 {threshold()}%
                </div>
              </div>
              <div class="big" style={{ color: r().verdict === 'pass' ? 'var(--accent)' : 'var(--red)' }}>
                {(r().passRate * 100).toFixed(0)}<span style={{ 'font-size': '15px' }}>%</span>
              </div>
            </div>
          )}
        </Show>

        <Card title="判定明细" sub="按地径与苗高区间逐株比对">
          <Show when={result()} fallback={<Empty text="—" />}>
            {(r) => (
              <div class="grid" style={{ gap: '12px' }}>
                <Gauge value={r().passRate} threshold={threshold() / 100} bad={r().verdict === 'fail'} />
                <div class="grid cols-2" style={{ gap: '10px' }}>
                  <div class="card flat tight">
                    <div class="kpi"><div class="v" style={{ 'font-size': '18px' }}>{r().avgDiameter.toFixed(2)} cm</div><div class="l">平均地径</div></div>
                  </div>
                  <div class="card flat tight">
                    <div class="kpi"><div class="v" style={{ 'font-size': '18px' }}>{r().avgHeight.toFixed(0)} cm</div><div class="l">平均苗高</div></div>
                  </div>
                </div>

                <Show when={r().fails.length} fallback={<span class="tag ok">全部样苗均在区间内。</span>}>
                  <div class="list" style={{ gap: '6px' }}>
                    <For each={r().fails}>
                      {(f) => (
                        <div class="card flat" style={{ padding: '9px 11px' }}>
                          <div class="row" style={{ gap: '8px', 'align-items': 'flex-start' }}>
                            <span class="tag bad mono">#{String(f.no).padStart(2, '0')}</span>
                            <div style={{ 'font-size': '11.5px', color: 'var(--ink-2)', 'line-height': 1.6 }}>
                              <For each={f.why}>{(w) => <div>· {w}</div>}</For>
                            </div>
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                </Show>

                <Show when={r().reasons.length}>
                  <div class="card flat" style={{ padding: '11px 13px', 'border-color': 'rgba(239,123,104,.3)' }}>
                    <div style={{ 'font-size': '11px', color: 'var(--red)', 'letter-spacing': '1px', 'margin-bottom': '6px' }}>不出圃原因汇总</div>
                    <For each={r().reasons}>
                      {(x) => <div style={{ 'font-size': '11.5px', color: 'var(--ink-2)', 'line-height': 1.65 }}>· {x}</div>}
                    </For>
                  </div>
                </Show>
              </div>
            )}
          </Show>
        </Card>

        <Card title="批次达标率速览" sub="负责人视角 · 当前所有批次的抽检结论">
          <table class="table">
            <thead>
              <tr><th>批次</th><th>达标率</th><th>结论</th></tr>
            </thead>
            <tbody>
              <For each={state.batches}>
                {(b) => {
                  const insp = () => state.inspections.find((i) => i.batchId === b.id);
                  return (
                    <tr onClick={() => {}} style={{ cursor: 'default' }}>
                      <td>
                        <div class="mono" style={{ 'font-size': '11px', color: 'var(--accent)' }}>{b.code}</div>
                        <div style={{ 'font-size': '10.5px', color: 'var(--ink-3)' }}>{b.variety} {b.cultivar}</div>
                      </td>
                      <td style={{ width: '42%' }}>
                        <Show when={insp()} fallback={<span class="hint">未抽检</span>}>
                          {(i) => <RateBar value={i().passRate} threshold={i().threshold / 100} />}
                        </Show>
                      </td>
                      <td>
                        <Show when={insp()} fallback={<span class="tag">待检</span>}>
                          {(i) => <span class="tag" classList={{ ok: i().verdict === 'pass', bad: i().verdict === 'fail' }}>
                            {i().verdict === 'pass' ? '达标' : '不达标'}
                          </span>}
                        </Show>
                      </td>
                    </tr>
                  );
                }}
              </For>
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
