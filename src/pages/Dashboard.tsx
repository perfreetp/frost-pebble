import { createMemo, For, Show } from 'solid-js';
import { Card, Empty, Kpi, RateBar, StatusTag } from '../components/ui';
import { Icon } from '../components/Icon';
import { resetAll, state } from '../lib/store';
import { presetInfo } from '../lib/types';
import { fmtDate } from '../lib/utils';

export default function DashboardPage(props: {
  onGo: (p: 'batches' | 'photos' | 'workstation' | 'inspection' | 'reports' | 'archive') => void;
}) {
  const stats = createMemo(() => {
    const total = state.batches.length;
    const archived = state.batches.filter((b) => b.status === 'archived').length;
    const failed = state.batches.filter((b) => b.status === 'failed').length;
    const pending = state.batches.filter((b) => b.status === 'ready' || b.status === 'draft').length;
    const inspected = state.inspections.length;
    const passRate = inspected
      ? state.inspections.reduce((s, i) => s + i.passRate, 0) / inspected
      : 0;
    const totalQty = state.batches.reduce((s, b) => s + (b.status === 'archived' ? b.quantity : 0), 0);
    return { total, archived, failed, pending, inspected, passRate, totalQty };
  });

  const recent = createMemo(() =>
    [...state.batches].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6));

  const recentVersions = createMemo(() =>
    [...state.versions].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4));

  const byVariety = createMemo(() => {
    const rows = new Map<string, { count: number; rates: number[]; qty: number }>();
    for (const b of state.batches) {
      const cur = rows.get(b.variety) ?? { count: 0, rates: [], qty: 0 };
      cur.count += 1;
      cur.qty += b.quantity;
      const insp = state.inspections.find((i) => i.batchId === b.id);
      if (insp) cur.rates.push(insp.passRate);
      rows.set(b.variety, cur);
    }
    return Array.from(rows.entries()).map(([variety, v]) => ({
      variety,
      count: v.count,
      qty: v.qty,
      rate: v.rates.length ? v.rates.reduce((a, b) => a + b, 0) / v.rates.length : null,
    }));
  });

  return (
    <div class="grid" style={{ gap: '16px' }}>
      <Card tight>
        <div class="grid cols-4" style={{ gap: '18px' }}>
          <Kpi value={<>{stats().total}<span style={{ 'font-size': '13px', color: 'var(--ink-3)' }}> 批</span></>} label="在册批次" desc={`${stats().pending} 批待抽检`} />
          <Kpi value={`${(stats().passRate * 100).toFixed(1)}%`} label="平均抽检达标率" tone={stats().passRate >= 0.9 ? 'ok' : 'bad'} desc={`已抽检 ${stats().inspected} 批`} />
          <Kpi value={<>{stats().totalQty}<span style={{ 'font-size': '13px', color: 'var(--ink-3)' }}> 株</span></>} label="已归档出圃" tone="ok" desc={`${stats().archived} 批完成归档`} />
          <Kpi value={<>{state.versions.length}<span style={{ 'font-size': '13px', color: 'var(--ink-3)' }}> 版</span></>} label="规格图版本" desc={`${state.photos.length} 张样苗照片`} />
        </div>
      </Card>

      <div class="grid" style={{ 'grid-template-columns': 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '16px' }}>
        <Card title="最近批次" sub="按建档时间倒序" actions={
          <button class="btn sm" onClick={() => props.onGo('batches')}>全部批次 <Icon name="arrow" size={12} /></button>
        }>
          <Show when={recent().length} fallback={<Empty text="还没有批次档案。" />}>
            <div class="list">
              <For each={recent()}>
                {(b) => (
                  <div class="list-row" onClick={() => props.onGo('archive')}>
                    <div class="grow">
                      <div class="row" style={{ gap: '8px' }}>
                        <span class="mono" style={{ 'font-size': '11.5px', color: 'var(--accent)' }}>{b.code}</span>
                        <StatusTag status={b.status} />
                      </div>
                      <div style={{ 'font-size': '11px', color: 'var(--ink-3)', 'margin-top': '3px' }}>
                        {b.variety} {b.cultivar} · {b.ageYears} 年生 · {b.quantity} 株 · {b.block}
                      </div>
                    </div>
                    <div style={{ 'font-size': '10.5px', color: 'var(--ink-3)' }}>{fmtDate(b.createdAt)}</div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </Card>

        <Card title="按品种达标率" sub="跨批次平均">
          <div class="list" style={{ gap: '10px' }}>
            <For each={byVariety()}>
              {(v) => (
                <div>
                  <div class="row between" style={{ 'margin-bottom': '3px' }}>
                    <span style={{ 'font-size': '12px', 'font-weight': 600 }}>{v.variety}</span>
                    <span class="hint">{v.count} 批 · {v.qty} 株</span>
                  </div>
                  <Show when={v.rate != null} fallback={<span class="hint" style={{ 'font-size': '10.5px' }}>未抽检</span>}>
                    <RateBar value={v.rate!} threshold={0.9} />
                  </Show>
                </div>
              )}
            </For>
          </div>
        </Card>
      </div>

      <div class="grid" style={{ 'grid-template-columns': 'minmax(0, 1fr) minmax(0, 1.2fr)', gap: '16px' }}>
        <Card title="作业流程" sub="从建档到归档的五道关卡">
          <div class="list" style={{ gap: '8px' }}>
            <FlowStep n="1" title="批次建档" desc="品种、苗龄、地径区间、出圃数量 → 生成编号" done={stats().total > 0} onClick={() => props.onGo('batches')} />
            <FlowStep n="2" title="样苗拍照" desc="每批上传若干样苗照片作为加工素材" done={state.photos.length > 0} onClick={() => props.onGo('photos')} />
            <FlowStep n="3" title="加工合成" desc="自动初抠 → 画笔补枝/擦杂物 → 换背景色温投影" done={state.versions.length > 0} onClick={() => props.onGo('workstation')} />
            <FlowStep n="4" title="抽检判定" desc="按地径与苗高区间逐株判定，不达标批注不出圃" done={stats().inspected > 0} onClick={() => props.onGo('inspection')} />
            <FlowStep n="5" title="出圃报告与归档" desc="规格图 + 抽检结论成册，归档后多条件检索" done={stats().archived > 0} onClick={() => props.onGo('reports')} />
          </div>
        </Card>

        <Card title="最新合成版本" sub="每次改动单独留版，可随时叠加比对" actions={
          <button class="btn sm" onClick={() => props.onGo('workstation')}>去加工台 <Icon name="arrow" size={12} /></button>
        }>
          <Show when={recentVersions().length} fallback={<Empty text="还没有合成版本，去加工台完成第一版。" />}>
            <div class="ver-strip">
              <For each={recentVersions()}>
                {(v) => {
                  const b = state.batches.find((x) => x.id === v.batchId);
                  return (
                    <div class="ver-card" style={{ cursor: 'default' }}>
                      <img src={v.thumbUrl} alt={`V${v.no}`} />
                      <div class="meta">
                        <div class="row between">
                          <span class="vno">V{v.no}</span>
                          <span style={{ 'font-size': '9.5px', color: 'var(--ink-3)' }}>
                            {presetInfo(v.settings.background).tempK}K
                          </span>
                        </div>
                        <div class="mono" style={{ 'font-size': '9.5px', color: 'var(--ink-3)', 'white-space': 'nowrap', overflow: 'hidden', 'text-overflow': 'ellipsis' }}>
                          {b?.code ?? '—'}
                        </div>
                        <div style={{ 'font-size': '9.5px', color: 'var(--ink-3)' }}>{fmtDate(v.createdAt).slice(5)}</div>
                      </div>
                    </div>
                  );
                }}
              </For>
            </div>
          </Show>
        </Card>
      </div>

      <div class="row between" style={{ 'margin-top': '4px' }}>
        <span class="hint">
          数据保存在本机浏览器（IndexedDB）。演示种子数据包含 {state.batches.length} 个批次、{state.versions.length} 个版本、{state.inspections.length} 份抽检记录。
        </span>
        <button class="btn sm danger" onClick={() => { if (confirm('重置将清空本机全部档案并恢复演示数据，确认继续？')) void resetAll(); }}>
          <Icon name="refresh" size={12} /> 重置演示数据
        </button>
      </div>
    </div>
  );
}

function FlowStep(props: { n: string; title: string; desc: string; done: boolean; onClick: () => void }) {
  return (
    <div class="list-row" style={{ padding: '9px 12px' }} onClick={props.onClick}>
      <span
        style={{
          width: '24px', height: '24px', 'border-radius': '50%', display: 'grid', 'place-items': 'center',
          'font-size': '11px', 'font-family': 'var(--mono)', flex: 'none',
          background: props.done ? 'rgba(47,143,91,.24)' : '#1f2a24',
          color: props.done ? 'var(--accent)' : 'var(--ink-3)',
          border: `1px solid ${props.done ? 'rgba(126,226,168,.4)' : 'var(--line)'}`,
        }}
      >
        {props.done ? '✓' : props.n}
      </span>
      <div class="grow">
        <div style={{ 'font-size': '12.5px', 'font-weight': 600 }}>{props.title}</div>
        <div style={{ 'font-size': '10.5px', color: 'var(--ink-3)', 'line-height': 1.5 }}>{props.desc}</div>
      </div>
      <Icon name="arrow" size={13} />
    </div>
  );
}
