import { createMemo, createSignal, For, Show } from 'solid-js';
import { Card, Empty, RateBar } from '../components/ui';
import { Icon } from '../components/Icon';
import { archiveBatch, pushToast, state } from '../lib/store';
import { presetInfo } from '../lib/types';
import { download, fmtDate, fmtDateTime, safeFile } from '../lib/utils';

export default function ReportsPage(props: { onGo: (p: 'inspection' | 'versions') => void }) {
  const batch = () => state.batches.find((b) => b.id === state.activeBatchId) ?? null;
  const insp = () => (batch() ? state.inspections.find((i) => i.batchId === batch()!.id) : undefined);
  const versions = createMemo(() => (batch() ? state.versions.filter((v) => v.batchId === batch()!.id) : []));
  const latestVersion = createMemo(() => {
    const list = versions();
    if (!list.length) return null;
    return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  });
  const allVersions = createMemo(() => {
    if (!batch()) return [];
    return state.versions.filter((v) => v.batchId === batch()!.id)
      .sort((a, b) => a.no - b.no || a.createdAt.localeCompare(b.createdAt));
  });

  const [archiveError, setArchiveError] = createSignal('');

  function canArchive(): { ok: boolean; why: string } {
    const b = batch();
    if (!b) return { ok: false, why: '未选择批次' };
    if (b.status === 'archived') return { ok: false, why: '已归档' };
    if (!insp()) return { ok: false, why: '尚未抽检' };
    if (insp()!.verdict === 'fail') return { ok: false, why: '不达标不出圃' };
    if (!versions().length) return { ok: false, why: '尚无合成版本' };
    return { ok: true, why: '' };
  }

  function doArchive() {
    const b = batch();
    if (!b) return;
    const res = archiveBatch(b.id);
    if (!res.ok) setArchiveError(res.error ?? '归档失败');
    else setArchiveError('');
  }

  function exportReportHtml() {
    const b = batch();
    const i = insp();
    const v = latestVersion();
    if (!b || !i || !v) return;
    const html = renderReportHtml(b, i, v, allVersions().length);
    download(`${safeFile(b.code)}_出圃报告.html`, html, 'text/html');
    pushToast('ok', '出圃报告已导出（含规格图与查验图为内嵌图片）');
  }

  function exportReportCsv() {
    const b = batch();
    const i = insp();
    if (!b || !i) return;
    const head = ['序号', '地径(cm)', '苗高(cm)', '判定', '原因'];
    const lines = [head.join(',')];
    for (const m of i.measurements) {
      const why: string[] = [];
      if (m.diameterCm < b.diameterMin) why.push('地径低于下限');
      if (m.diameterCm > b.diameterMax) why.push('地径超出上限');
      if (m.heightCm < b.heightMin) why.push('苗高低于下限');
      if (m.heightCm > b.heightMax) why.push('苗高超出上限');
      lines.push([m.no, m.diameterCm, m.heightCm, why.length ? '不达标' : '达标', why.join('；')].join(','));
    }
    download(`${safeFile(b.code)}_抽检明细.csv`, `﻿${lines.join('\n')}`, 'text/csv');
  }

  function printReport() {
    window.print();
  }

  return (
    <div class="grid" style={{ 'grid-template-columns': 'minmax(0, 1fr) 300px', gap: '16px', 'align-items': 'start' }}>
      <div>
        <Show when={batch()} fallback={<Card title="出圃报告"><Empty text="请选择批次。" /></Card>}>
          <Show
            when={insp() && latestVersion()}
            fallback={
              <Card title="出圃报告" sub={batch()!.code}>
                <Empty
                  text={!insp() ? '该批次还没有抽检结论。完成抽检后即可生成出圃报告。' : '该批次还没有合成规格图版本，报告需要附规格图。'}
                  action={
                    <button class="btn primary" onClick={() => props.onGo(!insp() ? 'inspection' : 'versions')}>
                      {!insp() ? '去抽检' : '去加工台存版'}
                    </button>
                  }
                />
              </Card>
            }
          >
            <div class="paper">
              <div class="row between" style={{ 'align-items': 'flex-start' }}>
                <div>
                  <div style={{ 'font-size': '10px', 'letter-spacing': '3px', color: '#7d8a7f' }}>苗圃出圃档案 · DISPATCH DOSSIER</div>
                  <h1 style={{ 'margin-top': '6px' }}>苗 木 出 圃 报 告</h1>
                  <div style={{ 'font-size': '11px', color: '#6c7a70', 'margin-top': '4px', 'letter-spacing': '1px' }}>
                    NURSERY OUTBOUND INSPECTION &amp; SPECIFICATION REPORT
                  </div>
                </div>
                <div style={{ 'text-align': 'right' }}>
                  <div class="mono" style={{ 'font-size': '14px', 'font-weight': 700, color: '#1f3a2a' }}>{batch()!.code}</div>
                  <div style={{ 'font-size': '10.5px', color: '#7d8a7f', 'margin-top': '3px' }}>
                    第 {allVersions().length} 版规格图 · {fmtDate(batch()!.createdAt)}
                  </div>
                  <Show when={batch()!.status === 'archived'}>
                    <div style={{ 'margin-top': '8px' }}>
                      <span class="stamp" style={{ 'font-size': '13px', padding: '4px 10px' }}>已归档</span>
                    </div>
                  </Show>
                </div>
              </div>

              <h2>一、批次信息</h2>
              <div class="kv">
                <span class="k">品种</span><span class="v">{batch()!.variety}</span>
                <span class="k">品系</span><span class="v">{batch()!.cultivar}</span>
                <span class="k">苗龄</span><span class="v">{batch()!.ageYears} 年生</span>
                <span class="k">出圃数量</span><span class="v">{batch()!.quantity} 株</span>
                <span class="k">地径区间</span><span class="v">{batch()!.diameterMin}–{batch()!.diameterMax} cm</span>
                <span class="k">苗高区间</span><span class="v">{batch()!.heightMin}–{batch()!.heightMax} cm</span>
                <span class="k">苗床</span><span class="v">{batch()!.block}</span>
                <span class="k">建档人</span><span class="v">{batch()!.createdBy}</span>
              </div>

              <h2>二、规格图与查验图</h2>
              <div class="sheet-pair">
                <figure>
                  <img src={latestVersion()!.specUrl} alt="规格图" />
                  <figcaption>规格图 · V{latestVersion()!.no} · {presetInfo(latestVersion()!.settings.background).name}</figcaption>
                </figure>
                <figure>
                  <img src={latestVersion()!.inspectUrl} alt="查验图" />
                  <figcaption>查验图 · V{latestVersion()!.no} · 网格 10cm</figcaption>
                </figure>
              </div>
              <div style={{ 'font-size': '10.5px', color: '#7d8a7f', 'margin-top': '6px', 'line-height': '1.6' }}>
                成像参数：色温 {presetInfo(latestVersion()!.settings.background).tempK}K（{presetInfo(latestVersion()!.settings.background).temp}）·
                投影 {Math.round(latestVersion()!.settings.shadow * 100)}% ·
                羽化 {latestVersion()!.settings.feather.toFixed(1)}px ·
                实测苗高 {latestVersion()!.settings.measuredHeightCm} cm / 地径 Ø{latestVersion()!.settings.measuredDiameterMm} mm ·
                版本存于 {fmtDate(latestVersion()!.createdAt)}
              </div>

              <h2>三、抽检数据与判定</h2>
              <div class="kv" style={{ 'margin-bottom': '6px' }}>
                <span class="k">抽检时间</span><span class="v">{fmtDate(insp()!.sampledAt)}</span>
                <span class="k">质检员</span><span class="v">{insp()!.inspector}</span>
                <span class="k">抽检株数</span><span class="v">{insp()!.sampleSize} 株</span>
                <span class="k">达标率阈值</span><span class="v">{insp()!.threshold}%</span>
              </div>
              <table>
                <thead>
                  <tr><th style={{ width: '48px' }}>序号</th><th>地径 cm</th><th>苗高 cm</th><th>区间判定</th><th>说明</th></tr>
                </thead>
                <tbody>
                  <For each={insp()!.measurements}>
                    {(m) => {
                      const why: string[] = [];
                      if (m.diameterCm < batch()!.diameterMin) why.push('地径低于下限');
                      if (m.diameterCm > batch()!.diameterMax) why.push('地径超出上限');
                      if (m.heightCm < batch()!.heightMin) why.push('苗高低于下限');
                      if (m.heightCm > batch()!.heightMax) why.push('苗高超出上限');
                      return (
                        <tr>
                          <td>{m.no}</td>
                          <td>{m.diameterCm.toFixed(1)}</td>
                          <td>{m.heightCm.toFixed(0)}</td>
                          <td style={{ color: why.length ? '#a8382a' : '#2f6b45', 'font-weight': 600 }}>{why.length ? '不达标' : '达标'}</td>
                          <td style={{ color: '#6c7a70' }}>{why.join('；') || '—'}</td>
                        </tr>
                      );
                    }}
                  </For>
                </tbody>
              </table>

              <div style={{ display: 'flex', gap: '18px', 'align-items': 'center', 'margin-top': '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 'font-size': '11px', color: '#6c7a70', 'margin-bottom': '4px' }}>
                    达标率 {insp()!.passCount}/{insp()!.sampleSize} = {(insp()!.passRate * 100).toFixed(1)}%（阈值 {insp()!.threshold}%）
                  </div>
                  <div class="gauge" style={{ background: '#ddd8ca' }}>
                    <div
                      class="fill"
                      classList={{ bad: insp()!.verdict === 'fail' }}
                      style={{ width: `${(insp()!.passRate * 100).toFixed(1)}%` }}
                    />
                  </div>
                </div>
                <div class="stamp" style={{ color: insp()!.verdict === 'pass' ? 'rgba(40,105,66,.9)' : 'rgba(180,60,45,.9)', 'border-color': insp()!.verdict === 'pass' ? 'rgba(40,105,66,.85)' : 'rgba(180,60,45,.85)' }}>
                  {insp()!.verdict === 'pass' ? '准 予 出 圃' : '不 予 出 圃'}
                </div>
              </div>

              <Show when={insp()!.verdict === 'fail'}>
                <div style={{ 'margin-top': '10px', padding: '9px 12px', border: '1px solid #d9b4ab', background: '#fbf0ee', 'border-radius': '5px', 'font-size': '11.5px' }}>
                  <b style={{ color: '#a8382a' }}>不出圃原因：</b>
                  <For each={insp()!.reasons}>{(r) => <div style={{ color: '#7d3a30' }}>· {r}</div>}</For>
                </div>
              </Show>

              <Show when={insp()!.notes}>
                <div style={{ 'margin-top': '10px', 'font-size': '11.5px' }}>
                  <b>质检批注：</b><span style={{ color: '#3d4c42' }}>{insp()!.notes}</span>
                </div>
              </Show>

              <h2>四、规格图版本沿革</h2>
              <table>
                <thead>
                  <tr><th>版本</th><th>存版时间</th><th>背景 / 色温</th><th>投影</th><th>说明</th></tr>
                </thead>
                <tbody>
                  <For each={allVersions()}>
                    {(v) => (
                      <tr>
                        <td>V{v.no}</td>
                        <td>{fmtDate(v.createdAt)}</td>
                        <td>{presetInfo(v.settings.background).name} / {presetInfo(v.settings.background).tempK}K</td>
                        <td>{Math.round(v.settings.shadow * 100)}%</td>
                        <td style={{ color: '#6c7a70' }}>{v.note}</td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>

              <div class="sig">
                <span>技术员：{batch()!.createdBy}　签名：__________</span>
                <span>质检员：{insp()!.inspector}　签名：__________</span>
                <span>负责人：黄成　签名：__________</span>
                <span>出具日期：{fmtDate(new Date().toISOString())}</span>
              </div>
              <div style={{ 'margin-top': '14px', 'border-top': '1px solid #d8d2c4', 'padding-top': '8px', 'font-size': '9.5px', color: '#98a29a', 'letter-spacing': '.5px' }}>
                本报告由苗圃出圃档案加工系统生成 · 规格图与查验图同源合成 · 每版改动均留存可回溯
              </div>
            </div>
          </Show>
        </Show>
      </div>

      <div class="grid no-print" style={{ gap: '16px', 'align-content': 'start' }}>
        <Card tight title="报告操作">
          <div class="grid" style={{ gap: '8px' }}>
            <button class="btn" onClick={printReport}><Icon name="print" size={14} /> 打印 / 存为 PDF</button>
            <button class="btn" onClick={exportReportHtml} disabled={!insp() || !latestVersion()}>
              <Icon name="download" size={14} /> 导出报告（HTML）
            </button>
            <button class="btn" onClick={exportReportCsv} disabled={!insp()}>
              <Icon name="download" size={14} /> 导出抽检明细（CSV）
            </button>
            <hr class="hr" style={{ margin: '4px 0' }} />
            <button class="btn primary" onClick={doArchive} disabled={!canArchive().ok}>
              <Icon name="archive" size={14} /> 归档出圃档案
            </button>
            <Show when={!canArchive().ok}>
              <span class="hint">{canArchive().why === '已归档' ? '该批次已归档，可在档案检索中查阅。' : `暂不能归档：${canArchive().why}`}</span>
            </Show>
            <Show when={archiveError()}>
              <span class="tag bad">{archiveError()}</span>
            </Show>
          </div>
        </Card>

        <Card tight title="批次达标率" sub="全部批次汇总">
          <div class="list" style={{ gap: '7px' }}>
            <For each={state.batches}>
              {(b) => {
                const i = () => state.inspections.find((x) => x.batchId === b.id);
                return (
                  <div class="row" style={{ 'font-size': '11px', gap: '8px' }}>
                    <span class="mono" style={{ width: '118px', color: b.id === state.activeBatchId ? 'var(--accent)' : 'var(--ink-3)', 'font-size': '10px' }}>
                      {b.code}
                    </span>
                    <Show when={i()} fallback={<span class="hint" style={{ 'font-size': '10px' }}>未抽检</span>}>
                      {(ins) => <RateBar value={ins().passRate} threshold={ins().threshold / 100} />}
                    </Show>
                  </div>
                );
              }}
            </For>
          </div>
        </Card>

        <Show when={latestVersion()}>
          <Card tight title="当前报告版本" sub={fmtDateTime(latestVersion()!.createdAt)}>
            <div class="row" style={{ gap: '8px' }}>
              <img src={latestVersion()!.thumbUrl} alt="当前版本" style={{ width: '76px', 'border-radius': '7px', border: '1px solid var(--line)' }} />
              <div style={{ 'font-size': '11.5px' }}>
                <div class="mono" style={{ color: 'var(--accent)' }}>V{latestVersion()!.no}</div>
                <div style={{ color: 'var(--ink-3)', 'line-height': 1.6 }}>
                  {presetInfo(latestVersion()!.settings.background).name}<br />
                  {latestVersion()!.note}
                </div>
              </div>
            </div>
          </Card>
        </Show>
      </div>
    </div>
  );
}

function renderReportHtml(
  b: ReturnType<typeof state.batches.find> & object,
  i: NonNullable<ReturnType<typeof state.inspections.find>>,
  v: NonNullable<ReturnType<typeof state.versions.find>>,
  versionCount: number,
): string {
  const rows = i.measurements.map((m) => {
    const why: string[] = [];
    if (m.diameterCm < b.diameterMin) why.push('地径低于下限');
    if (m.diameterCm > b.diameterMax) why.push('地径超出上限');
    if (m.heightCm < b.heightMin) why.push('苗高低于下限');
    if (m.heightCm > b.heightMax) why.push('苗高超出上限');
    return `<tr><td>${m.no}</td><td>${m.diameterCm.toFixed(1)}</td><td>${m.heightCm.toFixed(0)}</td>
      <td style="color:${why.length ? '#a8382a' : '#2f6b45'};font-weight:600">${why.length ? '不达标' : '达标'}</td>
      <td style="color:#6c7a70">${why.join('；') || '—'}</td></tr>`;
  }).join('');

  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8">
<title>${b.code} 出圃报告</title>
<style>
body{font-family:"Microsoft YaHei","Segoe UI",sans-serif;background:#eceae4;margin:0;padding:26px;color:#25302a}
.paper{background:#f4efe5;max-width:820px;margin:0 auto;padding:34px 38px;box-shadow:0 12px 40px rgba(0,0,0,.18);font-size:12.5px;line-height:1.7}
h1{font-size:22px;letter-spacing:2px;margin:6px 0} h2{font-size:13px;letter-spacing:1.4px;border-bottom:1px solid #d8d2c4;padding-bottom:5px;margin:20px 0 10px;color:#3a4a3e}
table{width:100%;border-collapse:collapse;font-size:11.5px} th{border-bottom:1px solid #cfc9bb;padding:6px 5px;text-align:left;color:#5c6a60}
td{border-bottom:1px solid #e3ddd0;padding:6px 5px}
.kv{display:grid;grid-template-columns:88px 1fr 88px 1fr;gap:4px 12px;font-size:12px}
.kv .k{color:#6c7a70} .kv .v{font-weight:600}
.sheet{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px}
.sheet img{width:100%;border:1px solid #cfc9bb;border-radius:4px}
.stamp{display:inline-block;border:3px solid ${i.verdict === 'pass' ? 'rgba(40,105,66,.85)' : 'rgba(180,60,45,.85)'};color:${i.verdict === 'pass' ? 'rgba(40,105,66,.9)' : 'rgba(180,60,45,.9)'};padding:5px 14px;transform:rotate(-8deg);font-weight:700;letter-spacing:3px;font-size:16px}
.mono{font-family:Consolas,monospace}
</style></head><body><div class="paper">
<div style="display:flex;justify-content:space-between">
<div><div style="font-size:10px;letter-spacing:3px;color:#7d8a7f">苗圃出圃档案 · DISPATCH DOSSIER</div>
<h1>苗 木 出 圃 报 告</h1></div>
<div style="text-align:right"><div class="mono" style="font-size:14px;font-weight:700">${b.code}</div>
<div style="font-size:10.5px;color:#7d8a7f">第 ${versionCount} 版规格图 · ${b.createdAt.slice(0, 10)}</div></div>
</div>
<h2>一、批次信息</h2>
<div class="kv">
<span class="k">品种</span><span class="v">${b.variety}</span><span class="k">品系</span><span class="v">${b.cultivar}</span>
<span class="k">苗龄</span><span class="v">${b.ageYears} 年生</span><span class="k">出圃数量</span><span class="v">${b.quantity} 株</span>
<span class="k">地径区间</span><span class="v">${b.diameterMin}–${b.diameterMax} cm</span><span class="k">苗高区间</span><span class="v">${b.heightMin}–${b.heightMax} cm</span>
<span class="k">苗床</span><span class="v">${b.block}</span><span class="k">建档人</span><span class="v">${b.createdBy}</span>
</div>
<h2>二、规格图与查验图</h2>
<div class="sheet"><figure style="margin:0"><img src="${v.specUrl}"><figcaption style="text-align:center;font-size:10.5px;color:#6c7a70">规格图 V${v.no}</figcaption></figure>
<figure style="margin:0"><img src="${v.inspectUrl}"><figcaption style="text-align:center;font-size:10.5px;color:#6c7a70">查验图 V${v.no}</figcaption></figure></div>
<h2>三、抽检数据与判定</h2>
<div class="kv"><span class="k">抽检时间</span><span class="v">${i.sampledAt.slice(0, 10)}</span>
<span class="k">质检员</span><span class="v">${i.inspector}</span>
<span class="k">抽检株数</span><span class="v">${i.sampleSize} 株</span>
<span class="k">达标率阈值</span><span class="v">${i.threshold}%</span></div>
<table><thead><tr><th>序号</th><th>地径 cm</th><th>苗高 cm</th><th>区间判定</th><th>说明</th></tr></thead><tbody>${rows}</tbody></table>
<p style="margin-top:10px">达标率 <b>${(i.passRate * 100).toFixed(1)}%</b>（${i.passCount}/${i.sampleSize}）　<span class="stamp">${i.verdict === 'pass' ? '准 予 出 圃' : '不 予 出 圃'}</span></p>
${i.verdict === 'fail' ? `<div style="padding:9px 12px;border:1px solid #d9b4ab;background:#fbf0ee;border-radius:5px;font-size:11.5px"><b style="color:#a8382a">不出圃原因：</b>${i.reasons.map((r) => `· ${r}`).join('<br>')}</div>` : ''}
${i.notes ? `<p><b>质检批注：</b>${i.notes}</p>` : ''}
<div style="display:flex;justify-content:space-between;margin-top:26px;font-size:11px;color:#5c6a60">
<span>技术员：${b.createdBy}</span><span>质检员：${i.inspector}</span><span>负责人：黄成</span></div>
</div></body></html>`;
}

