import { createMemo, createSignal, For, Show } from 'solid-js';
import { Card, Empty, Field, StatusTag } from '../components/ui';
import { Icon } from '../components/Icon';
import {
  createBatch, deleteBatch, makeCode, setActiveBatch, state,
} from '../lib/store';
import { fmtDate } from '../lib/utils';
import type { BatchMeta } from '../lib/types';

const VARIETIES = ['紫薇', '女贞', '鸡爪槭', '银杏', '桂花', '香樟', '樱花', '海棠', '黄山栾', '无患子'];

export default function BatchesPage(props: { onGo: (page: 'photos' | 'workstation') => void }) {
  const year = new Date().getFullYear();
  const [variety, setVariety] = createSignal('紫薇');
  const [cultivar, setCultivar] = createSignal('速生紫薇');
  const [age, setAge] = createSignal(3);
  const [dMin, setDMin] = createSignal(1.2);
  const [dMax, setDMax] = createSignal(2.0);
  const [hMin, setHMin] = createSignal(90);
  const [hMax, setHMax] = createSignal(140);
  const [qty, setQty] = createSignal(400);
  const [block, setBlock] = createSignal('东区 3 号床');
  const [code, setCode] = createSignal('');
  const [error, setError] = createSignal('');

  const previewCode = createMemo(() => code().trim() || makeCode(variety(), year));

  function submit(e: Event) {
    e.preventDefault();
    const meta: BatchMeta = {
      code: code().trim(),
      variety: variety(),
      cultivar: cultivar(),
      ageYears: age(),
      diameterMin: dMin(),
      diameterMax: dMax(),
      heightMin: hMin(),
      heightMax: hMax(),
      quantity: qty(),
      block: block(),
    };
    const res = createBatch(meta);
    if (!res.ok) {
      setError(res.error ?? '建档失败');
      return;
    }
    setError('');
    setCode('');
  }

  const latest = () => state.batches.slice(0, 12);

  return (
    <div class="grid" style={{ 'grid-template-columns': 'minmax(0, 1.05fr) minmax(0, 1fr)', gap: '16px' }}>
      <Card title="新建批次档案" sub="填写品种信息与出圃规格区间，系统自动生成批次编号">
        <form onSubmit={submit} class="grid" style={{ gap: '14px' }}>
          <div class="grid cols-2" style={{ gap: '12px' }}>
            <Field label="品种">
              <input
                class="input"
                list="variety-list"
                value={variety()}
                onInput={(e) => setVariety(e.currentTarget.value)}
                placeholder="如：紫薇"
                required
              />
              <datalist id="variety-list">
                <For each={VARIETIES}>{(v) => <option value={v} />}</For>
              </datalist>
            </Field>
            <Field label="品种/品系（可选）">
              <input class="input" value={cultivar()} onInput={(e) => setCultivar(e.currentTarget.value)} placeholder="如：速生紫薇" />
            </Field>
          </div>

          <div class="grid cols-2" style={{ gap: '12px' }}>
            <Field label="苗龄（年）">
              <input class="input mono" type="number" min="0" step="0.5" value={age()} onInput={(e) => setAge(Number(e.currentTarget.value))} />
            </Field>
            <Field label="出圃数量（株）">
              <input class="input mono" type="number" min="0" step="1" value={qty()} onInput={(e) => setQty(Number(e.currentTarget.value))} />
            </Field>
          </div>

          <Field label="地径区间（cm）" hint="质检按此区间判定每株样苗是否达标">
            <div class="range-row">
              <input class="input mono" type="number" min="0" step="0.1" value={dMin()} onInput={(e) => setDMin(Number(e.currentTarget.value))} />
              <span class="sep">至</span>
              <input class="input mono" type="number" min="0" step="0.1" value={dMax()} onInput={(e) => setDMax(Number(e.currentTarget.value))} />
            </div>
          </Field>

          <Field label="苗高区间（cm）">
            <div class="range-row">
              <input class="input mono" type="number" min="0" step="1" value={hMin()} onInput={(e) => setHMin(Number(e.currentTarget.value))} />
              <span class="sep">至</span>
              <input class="input mono" type="number" min="0" step="1" value={hMax()} onInput={(e) => setHMax(Number(e.currentTarget.value))} />
            </div>
          </Field>

          <Field label="苗床 / 地块">
            <input class="input" value={block()} onInput={(e) => setBlock(e.currentTarget.value)} placeholder="如：东区 3 号床" />
          </Field>

          <Field label="批次编号" hint="留空则自动生成；结束后仍可手动指定">
            <input
              class="input mono"
              value={code()}
              onInput={(e) => setCode(e.currentTarget.value)}
              placeholder={previewCode()}
            />
          </Field>

          <div class="card flat" style={{ padding: '12px 14px' }}>
            <div class="row between">
              <span style={{ 'font-size': '11.5px', color: 'var(--ink-3)' }}>将生成的批次编号</span>
              <span class="code-preview" style={{ padding: '5px 10px', 'font-size': '13px' }}>{previewCode()}</span>
            </div>
          </div>

          <Show when={error()}>
            <div class="tag bad" style={{ padding: '8px 12px', 'border-radius': '8px' }}>{error()}</div>
          </Show>

          <div class="row">
            <button class="btn primary" type="submit">
              <Icon name="plus" size={15} /> 建立档案
            </button>
            <button
              class="btn ghost"
              type="button"
              onClick={() => {
                setVariety('紫薇');
                setCultivar('');
                setAge(3);
                setDMin(1.2);
                setDMax(2.0);
                setHMin(90);
                setHMax(140);
                setQty(400);
                setBlock('');
                setCode('');
                setError('');
              }}
            >
              清空
            </button>
          </div>
        </form>
      </Card>

      <Card
        title="批次台账"
        sub={`共 ${state.batches.length} 个批次 · 点击行设为当前批次`}
        actions={
          <span class="tag mono">{year}</span>
        }
      >
        <Show when={latest().length} fallback={<Empty text="还没有批次，先在左侧建立第一份出圃档案。" />}>
          <div class="list">
            <For each={latest()}>
              {(b) => (
                <div
                  class="list-row"
                  classList={{ sel: state.activeBatchId === b.id }}
                  onClick={() => setActiveBatch(b.id)}
                >
                  <div style={{ 'min-width': 0, flex: 1 }}>
                    <div class="row" style={{ gap: '8px' }}>
                      <span class="mono" style={{ 'font-size': '12px', color: 'var(--accent)' }}>{b.code}</span>
                      <StatusTag status={b.status} />
                    </div>
                    <div class="row" style={{ gap: '8px', 'margin-top': '4px', 'flex-wrap': 'wrap' }}>
                      <span style={{ 'font-weight': 600 }}>{b.variety}</span>
                      <span style={{ color: 'var(--ink-3)' }}>{b.cultivar}</span>
                      <span class="tag mono">{b.ageYears} 年生</span>
                      <span class="tag mono">地径 {b.diameterMin}–{b.diameterMax} cm</span>
                      <span class="tag mono">苗高 {b.heightMin}–{b.heightMax} cm</span>
                    </div>
                    <div style={{ 'font-size': '11px', color: 'var(--ink-3)', 'margin-top': '4px' }}>
                      {b.block} · 出圃 {b.quantity} 株 · 建档 {fmtDate(b.createdAt)}
                    </div>
                  </div>
                  <div class="row" style={{ gap: '4px' }}>
                    <Show when={state.activeBatchId === b.id}>
                      <button class="btn sm" onClick={(e) => { e.stopPropagation(); props.onGo('photos'); }}>
                        拍照 <Icon name="arrow" size={13} />
                      </button>
                    </Show>
                    <button
                      class="btn sm icon ghost"
                      title="删除批次"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`确认删除批次 ${b.code}？其照片、版本与抽检记录将一并删除。`)) deleteBatch(b.id);
                      }}
                    >
                      <Icon name="trash" size={13} />
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Card>
    </div>
  );
}
