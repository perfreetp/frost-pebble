import { createMemo, createSignal, For, Show } from 'solid-js';
import { Card, Empty, Field, RateBar, StatusTag } from '../components/ui';
import { Icon } from '../components/Icon';
import { pushToast, setActiveBatch, state } from '../lib/store';
import type { Batch, Version } from '../lib/types';
import { presetInfo } from '../lib/types';
import { fmtDate, monthKey } from '../lib/utils';

export default function ArchivePage() {
  const [variety, setVariety] = createSignal('');
  const [ageYears, setAgeYears] = createSignal('');
  const [status, setStatus] = createSignal('');
  const [month, setMonth] = createSignal('');
  const [keyword, setKeyword] = createSignal('');
  const [detail, setDetail] = createSignal<Batch | null>(null);

  const varieties = createMemo(() => Array.from(new Set(state.batches.map((b) => b.variety))).sort());
  const ages = createMemo(() => Array.from(new Set(state.batches.map((b) => b.ageYears))).sort((a, b) => a - b));
  const months = createMemo(() =>
    Array.from(new Set(state.batches.filter((b) => b.dispatchMonth).map((b) => b.dispatchMonth!))).sort().reverse());

  const filtered = createMemo(() => {
    const v = variety();
    const a = ageYears();
    const st = status();
    const mo = month();
    const kw = keyword().trim().toLowerCase();
    return state.batches.filter((b) => {
      if (v && b.variety !== v) return false;
      if (a && String(b.ageYears) !== a) return false;
      if (st) {
        const insp = state.inspections.find((i) => i.batchId === b.id);
        if (st === 'pass' && insp?.verdict !== 'pass') return false;
        if (st === 'fail' && insp?.verdict !== 'fail') return false;
        if (st === 'archived' && b.status !== 'archived') return false;
        if (st === 'pending' && insp) return false;
      }
      if (mo) {
        const key = b.dispatchMonth ?? monthKey(b.archivedAt);
        if (key !== mo) return false;
      }
      if (kw) {
        const hay = `${b.code} ${b.variety} ${b.cultivar} ${b.block} ${b.note}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });
  });

  const archivedCount = createMemo(() => state.batches.filter((b) => b.status === 'archived').length);
  const activeFilters = createMemo(() => {
    let n = 0;
    if (variety()) n++;
    if (ageYears()) n++;
    if (status()) n++;
    if (month()) n++;
    if (keyword().trim()) n++;
    return n;
  });

  function reset() {
    setVariety('');
    setAgeYears('');
    setStatus('');
    setMonth('');
    setKeyword('');
  }

  const detailVersions = createMemo(() => {
    const d = detail();
    if (!d) return [];
    return state.versions.filter((v) => v.batchId === d.id).sort((a, b) => {
      if (a.photoId !== b.photoId) return a.photoId.localeCompare(b.photoId);
      return a.no - b.no;
    });
  });

  const detailPhotos = createMemo(() => {
    const d = detail();
    if (!d) return [];
    return state.photos.filter((p) => p.batchId === d.id);
  });

  const detailInsp = createMemo(() => {
    const d = detail();
    return d ? state.inspections.find((i) => i.batchId === d.id) : undefined;
  });

  return (
    <div class="grid" style={{ gap: '16px' }}>
      <Card
        title="多条件档案检索"
        sub="按品种、苗龄、达标状态、出圃月份组合筛选；结果可调出同批次全部历史版本比对"
        actions={<span class="tag mono">{filtered().length} / {state.batches.length} 批次</span>}
      >
        <div class="filters">
          <Field label="品种">
            <select class="input" value={variety()} onChange={(e) => setVariety(e.currentTarget.value)}>
              <option value="">全部品种</option>
              <For each={varieties()}>{(v) => <option value={v}>{v}</option>}</For>
            </select>
          </Field>
          <Field label="苗龄">
            <select class="input" value={ageYears()} onChange={(e) => setAgeYears(e.currentTarget.value)}>
              <option value="">全部苗龄</option>
              <For each={ages()}>{(a) => <option value={String(a)}>{a} 年生</option>}</For>
            </select>
          </Field>
          <Field label="达标状态">
            <select class="input" value={status()} onChange={(e) => setStatus(e.currentTarget.value)}>
              <option value="">全部状态</option>
              <option value="pass">抽检达标</option>
              <option value="fail">不达标</option>
              <option value="archived">已归档出圃</option>
              <option value="pending">待抽检</option>
            </select>
          </Field>
          <Field label="出圃月份">
            <select class="input" value={month()} onChange={(e) => setMonth(e.currentTarget.value)}>
              <option value="">全部月份</option>
              <For each={months()}>{(m) => <option value={m}>{m.replace('-', ' 年 ')} 月</option>}</For>
            </select>
          </Field>
        </div>
        <div class="row" style={{ 'margin-top': '10px' }}>
          <input
            class="input"
            style={{ 'max-width': '300px' }}
            placeholder="搜索编号 / 品系 / 苗床 / 备注"
            value={keyword()}
            onInput={(e) => setKeyword(e.currentTarget.value)}
          />
          <Show when={activeFilters()}>
            <button class="btn sm" onClick={reset}><Icon name="refresh" size={12} /> 清除 {activeFilters()} 个条件</button>
          </Show>
          <span class="grow" />
          <span class="hint">已归档 {archivedCount()} 个批次</span>
        </div>
      </Card>

      <Card title="检索结果" sub="点击任意行查看批次详情与历史版本">
        <Show when={filtered().length} fallback={<Empty text="没有符合条件的档案，试试放宽条件。" action={<button class="btn sm" onClick={reset}>清除全部条件</button>} />}>
          <table class="table">
            <thead>
              <tr>
                <th>批次编号</th>
                <th>品种 / 苗龄</th>
                <th>规格区间</th>
                <th>出圃数量</th>
                <th>达标率</th>
                <th>状态</th>
                <th>出圃月份</th>
                <th>版本</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <For each={filtered()}>
                {(b) => {
                  const insp = () => state.inspections.find((i) => i.batchId === b.id);
                  const vcount = () => state.versions.filter((v) => v.batchId === b.id).length;
                  return (
                    <tr style={{ cursor: 'pointer' }} onClick={() => setDetail(b)}>
                      <td class="mono" style={{ color: 'var(--accent)', 'font-size': '11.5px' }}>{b.code}</td>
                      <td>
                        <div style={{ 'font-weight': 600 }}>{b.variety}</div>
                        <div style={{ 'font-size': '10.5px', color: 'var(--ink-3)' }}>{b.cultivar} · {b.ageYears} 年生</div>
                      </td>
                      <td class="mono" style={{ 'font-size': '11px' }}>
                        Ø{b.diameterMin}–{b.diameterMax}cm<br />
                        <span style={{ color: 'var(--ink-3)' }}>{b.heightMin}–{b.heightMax}cm</span>
                      </td>
                      <td class="mono">{b.quantity} 株</td>
                      <td style={{ width: '130px' }}>
                        <Show when={insp()} fallback={<span class="hint" style={{ 'font-size': '10.5px' }}>未抽检</span>}>
                          {(i) => <RateBar value={i().passRate} threshold={i().threshold / 100} />}
                        </Show>
                      </td>
                      <td><StatusTag status={b.status} /></td>
                      <td class="mono" style={{ 'font-size': '11px' }}>{b.dispatchMonth ?? '—'}</td>
                      <td class="mono">{vcount()} 版</td>
                      <td>
                        <button class="btn sm icon ghost" onClick={(e) => { e.stopPropagation(); setDetail(b); }}>
                          <Icon name="eye" size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                }}
              </For>
            </tbody>
          </table>
        </Show>
      </Card>

      <Show when={detail()}>
        <div class="modal-back" onClick={() => setDetail(null)}>
          <div class="modal" onClick={(e) => e.stopPropagation()}>
            <div class="row between" style={{ 'align-items': 'flex-start' }}>
              <div>
                <div class="row" style={{ gap: '10px' }}>
                  <h3 style={{ margin: 0 }}>{detail()!.code}</h3>
                  <StatusTag status={detail()!.status} />
                </div>
                <div class="sub" style={{ 'margin-top': '4px' }}>
                  {detail()!.variety} {detail()!.cultivar} · {detail()!.ageYears} 年生 ·
                  地径 {detail()!.diameterMin}–{detail()!.diameterMax} cm ·
                  苗高 {detail()!.heightMin}–{detail()!.heightMax} cm ·
                  出圃 {detail()!.quantity} 株 · {detail()!.block}
                </div>
              </div>
              <div class="row" style={{ gap: '8px' }}>
                <button class="btn sm" onClick={() => { setActiveBatch(detail()!.id); pushToast('ok', `已切换当前批次到 ${detail()!.code}`); }}>
                  设为当前批次
                </button>
                <button class="btn sm icon ghost" onClick={() => setDetail(null)}><Icon name="close" size={14} /></button>
              </div>
            </div>

            <div class="grid cols-3" style={{ gap: '12px', 'margin-top': '16px' }}>
              <div class="card flat tight">
                <div class="kpi">
                  <div class="v" style={{ 'font-size': '19px' }}>{detailInsp() ? `${(detailInsp()!.passRate * 100).toFixed(1)}%` : '—'}</div>
                  <div class="l">抽检达标率</div>
                  <div class="d">{detailInsp() ? `${detailInsp()!.passCount}/${detailInsp()!.sampleSize} 株 · 阈值 ${detailInsp()!.threshold}%` : '未抽检'}</div>
                </div>
              </div>
              <div class="card flat tight">
                <div class="kpi">
                  <div class="v" style={{ 'font-size': '19px' }}>{detailVersions().length}</div>
                  <div class="l">历史版本</div>
                  <div class="d">覆盖 {detailPhotos().length} 张样苗</div>
                </div>
              </div>
              <div class="card flat tight">
                <div class="kpi">
                  <div class="v" style={{ 'font-size': '19px' }}>{detail()!.dispatchMonth ?? '—'}</div>
                  <div class="l">出圃月份</div>
                  <div class="d">{detail()!.archivedAt ? `归档于 ${fmtDate(detail()!.archivedAt)}` : '尚未归档'}</div>
                </div>
              </div>
            </div>

            <Show when={detailInsp()}>
              <div class="card flat" style={{ padding: '12px 14px', 'margin-top': '12px' }}>
                <div style={{ 'font-size': '11px', color: 'var(--ink-3)', 'letter-spacing': '1px', 'margin-bottom': '6px' }}>抽检结论</div>
                <div class="row" style={{ gap: '10px' }}>
                  <span class="tag" classList={{ ok: detailInsp()!.verdict === 'pass', bad: detailInsp()!.verdict === 'fail' }}>
                    {detailInsp()!.verdict === 'pass' ? '达标 · 可出圃' : '不达标 · 不出圃'}
                  </span>
                  <span class="hint">{detailInsp()!.notes || '无批注'}</span>
                </div>
              </div>
            </Show>

            <h4 style={{ 'margin-bottom': '8px', 'margin-top': '18px', 'font-size': '12px', color: 'var(--ink-2)' }}>
              同批次历史版本（{detailVersions().length}）
            </h4>
            <Show when={detailVersions().length} fallback={<Empty text="该批次暂无合成版本。" />}>
              <div class="ver-strip">
                <For each={detailVersions()}>
                  {(v: Version) => (
                    <div class="ver-card" style={{ cursor: 'default' }}>
                      <img src={v.thumbUrl} alt={`V${v.no}`} />
                      <div class="meta">
                        <div class="row between">
                          <span class="vno">V{v.no}</span>
                          <span style={{ 'font-size': '9.5px', color: 'var(--ink-3)' }}>{fmtDate(v.createdAt).slice(5)}</span>
                        </div>
                        <div style={{ 'font-size': '10px', color: 'var(--ink-3)', 'line-height': 1.4 }}>
                          {presetInfo(v.settings.background).name} · {v.strokes.length} 笔触
                        </div>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </Show>

            <Show when={detailVersions().length}>
              <div class="grid cols-2" style={{ gap: '12px', 'margin-top': '12px' }}>
                <figure style={{ margin: 0 }}>
                  <img src={detailVersions()[0].specUrl} alt="首版规格图"
                    style={{ width: '100%', 'border-radius': '8px', border: '1px solid var(--line)' }} />
                  <figcaption style={{ 'font-size': '10.5px', color: 'var(--ink-3)', 'text-align': 'center', 'margin-top': '4px' }}>
                    首版 V{detailVersions()[0].no} · 规格图
                  </figcaption>
                </figure>
                <figure style={{ margin: 0 }}>
                  <img src={detailVersions()[detailVersions().length - 1].specUrl} alt="末版规格图"
                    style={{ width: '100%', 'border-radius': '8px', border: '1px solid var(--line)' }} />
                  <figcaption style={{ 'font-size': '10.5px', color: 'var(--ink-3)', 'text-align': 'center', 'margin-top': '4px' }}>
                    末版 V{detailVersions()[detailVersions().length - 1].no} · 规格图
                  </figcaption>
                </figure>
              </div>
            </Show>

            <Show when={detail()!.note}>
              <div class="hint" style={{ 'margin-top': '14px' }}>档案备注：{detail()!.note}</div>
            </Show>
          </div>
        </div>
      </Show>
    </div>
  );
}

