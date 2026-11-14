// 设计成果输出：单孔装药表、雷管段位表、爆破设计报告（HTML 打印 / CSV 导出）
import type { BlastDesign, BlastHole } from '../types';
import { STATUS_LABEL } from '../types';
import { computeStats } from './diff';

function escapeHtml(s: string | number | undefined): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function htmlShell(title: string, body: string): string {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"/>
<title>${escapeHtml(title)}</title>
<style>
  body{font-family:"Microsoft YaHei",sans-serif;margin:24px;color:#1a2330;font-size:13px}
  h1{font-size:20px;text-align:center;margin-bottom:4px}
  h2{font-size:15px;border-left:4px solid #2563eb;padding-left:8px;margin-top:22px}
  .meta{color:#556070;text-align:center;margin-bottom:16px}
  table{border-collapse:collapse;width:100%;margin-top:8px}
  th,td{border:1px solid #94a3b8;padding:5px 8px;text-align:center}
  th{background:#e8eef7}
  .skip{color:#b91c1c;background:#fef2f2}
  .note{background:#f8fafc;border:1px solid #cbd5e1;padding:10px;margin-top:8px;line-height:1.7}
  @media print{button{display:none}}
  .btn{margin:8px 4px;padding:6px 16px;background:#2563eb;color:#fff;border:none;border-radius:4px;cursor:pointer}
</style></head><body>
<button class="btn" onclick="window.print()">打印 / 另存为 PDF</button>
${body}</body></html>`;
}

function designHeader(d: BlastDesign): string {
  const stats = computeStats(d);
  return `<h1>${escapeHtml(d.name)}（V${d.version}）</h1>
  <div class="meta">设计员：${escapeHtml(d.designer)} ｜ 状态：${STATUS_LABEL[d.status]} ｜
  建档时间：${escapeHtml(new Date(d.createdAt).toLocaleString('zh-CN'))} ｜
  更新时间：${escapeHtml(new Date(d.updatedAt).toLocaleString('zh-CN'))}</div>
  <div class="note">总孔数 ${stats.totalHoles}（有效 ${stats.effectiveHoles}，避让跳过 ${stats.skippedHoles}）｜
  总装药量 ${stats.totalCharge} kg ｜ 平均孔深 ${stats.avgDepth} m ｜ 总进尺 ${stats.totalMeters} m</div>`;
}

/** 单孔装药表 */
export function buildChargeTableHtml(d: BlastDesign): string {
  const rows = d.holes
    .map((h) => {
      const skipped = h.state === 'skipped';
      return `<tr${skipped ? ' class="skip"' : ''}>
        <td>${escapeHtml(h.code)}</td>
        <td>${h.x.toFixed(2)}</td><td>${h.y.toFixed(2)}</td>
        <td>${h.collarElevation.toFixed(2)}</td>
        <td>${h.depth.toFixed(1)}</td><td>${h.diameter}</td><td>${h.inclination}</td>
        <td>${h.stemming.toFixed(1)}</td>
        <td>${skipped ? '—' : h.charge.toFixed(1)}</td>
        <td>${skipped ? escapeHtml(h.skipReason) : '正常'}</td>
      </tr>`;
    })
    .join('');
  const body = `${designHeader(d)}
  <h2>单孔装药表</h2>
  <table><thead><tr>
    <th>孔号</th><th>X(m)</th><th>Y(m)</th><th>孔口高程(m)</th><th>孔深(m)</th>
    <th>孔径(mm)</th><th>倾角(°)</th><th>堵塞(m)</th><th>装药量(kg)</th><th>备注</th>
  </tr></thead><tbody>${rows}</tbody></table>`;
  return htmlShell(`单孔装药表 - ${d.name}`, body);
}

/** 雷管段位表：按段位汇总 */
export function buildDelayTableHtml(d: BlastDesign): string {
  const groups = new Map<number, BlastHole[]>();
  for (const h of d.holes) {
    if (h.state !== 'normal') continue;
    const list = groups.get(h.detonatorDelay) ?? [];
    list.push(h);
    groups.set(h.detonatorDelay, list);
  }
  const delayMs = new Map(d.delays.map((x) => [x.delay, x.ms]));
  const rows = [...groups.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([delay, list]) => {
      const charge = list.reduce((s, h) => s + h.charge, 0);
      return `<tr><td>${delay}</td><td>${delayMs.get(delay) ?? '—'}</td>
        <td>${list.length}</td><td>${charge.toFixed(1)}</td>
        <td>${escapeHtml(list.map((h) => h.code).join('、'))}</td></tr>`;
    })
    .join('');
  const body = `${designHeader(d)}
  <h2>雷管段位（起爆网路）表</h2>
  <table><thead><tr>
    <th>段位</th><th>延期时间(ms)</th><th>孔数</th><th>本段药量(kg)</th><th>孔号明细</th>
  </tr></thead><tbody>${rows}</tbody></table>`;
  return htmlShell(`雷管段位表 - ${d.name}`, body);
}

/** 爆破设计报告 */
export function buildDesignReportHtml(d: BlastDesign): string {
  const stats = computeStats(d);
  const p = d.chargeParams;
  const reviewRows = d.reviewHistory
    .map(
      (r) => `<tr><td>${escapeHtml(new Date(r.at).toLocaleString('zh-CN'))}</td>
      <td>${escapeHtml(r.reviewer)}</td><td>${escapeHtml(r.action)}</td>
      <td>${escapeHtml(r.comment)}</td></tr>`,
    )
    .join('');
  const body = `${designHeader(d)}
  <h2>一、设计参数</h2>
  <div class="note">
    孔径 ${p.diameter} mm ｜ 设计孔深 ${p.defaultDepth} m ｜ 超深 ${p.subdrill} m ｜
    倾角 ${p.inclination}° ｜ 堵塞长度 ${p.stemming} m ｜ 单位装药量 ${p.chargePerMeter} kg/m
  </div>
  <h2>二、布孔统计</h2>
  <div class="note">
    炮孔总数 ${stats.totalHoles} 个，其中有效孔 ${stats.effectiveHoles} 个，
    因边坡/空区/管线避让自动跳过 ${stats.skippedHoles} 个；
    总装药量 ${stats.totalCharge} kg，平均单孔装药 ${stats.avgCharge} kg，
    平均孔深 ${stats.avgDepth} m，总钻孔进尺 ${stats.totalMeters} m。
  </div>
  <h2>三、安全避让说明</h2>
  <div class="note">
    边坡线 ${d.slopes.length} 条、空区 ${d.voids.length} 处、管线 ${d.pipelines.length} 条已纳入自动避让；
    被跳过孔位于装药表备注栏，逐条标注避让对象与实测距离。
  </div>
  <h2>四、审核记录</h2>
  <table><thead><tr><th>时间</th><th>审核人</th><th>动作</th><th>意见</th></tr></thead>
  <tbody>${reviewRows || '<tr><td colspan="4">暂无审核记录</td></tr>'}</tbody></table>`;
  return htmlShell(`爆破设计报告 - ${d.name}`, body);
}

/** 在新窗口打开可打印文档 */
export function openPrintWindow(html: string): void {
  const w = window.open('', '_blank');
  if (!w) {
    alert('浏览器拦截了弹出窗口，请允许弹窗后重试。');
    return;
  }
  w.document.write(html);
  w.document.close();
}

function toCsv(rows: (string | number)[][]): string {
  return rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\r\n');
}

export function downloadCsv(filename: string, rows: (string | number)[][]): void {
  const blob = new Blob([`﻿${toCsv(rows)}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function buildChargeCsv(d: BlastDesign): (string | number)[][] {
  const rows: (string | number)[][] = [
    ['孔号', 'X(m)', 'Y(m)', '孔口高程(m)', '孔深(m)', '孔径(mm)', '倾角(°)', '堵塞(m)', '装药量(kg)', '备注'],
  ];
  for (const h of d.holes) {
    rows.push([
      h.code, h.x, h.y, h.collarElevation, h.depth, h.diameter, h.inclination,
      h.stemming, h.state === 'skipped' ? 0 : h.charge,
      h.state === 'skipped' ? h.skipReason ?? '' : '正常',
    ]);
  }
  return rows;
}

export function buildDelayCsv(d: BlastDesign): (string | number)[][] {
  const groups = new Map<number, BlastHole[]>();
  for (const h of d.holes) {
    if (h.state !== 'normal') continue;
    const list = groups.get(h.detonatorDelay) ?? [];
    list.push(h);
    groups.set(h.detonatorDelay, list);
  }
  const delayMs = new Map(d.delays.map((x) => [x.delay, x.ms]));
  const rows: (string | number)[][] = [['段位', '延期(ms)', '孔数', '本段药量(kg)', '孔号']];
  for (const [delay, list] of [...groups.entries()].sort((a, b) => a[0] - b[0])) {
    rows.push([
      delay, delayMs.get(delay) ?? '', list.length,
      Math.round(list.reduce((s, h) => s + h.charge, 0) * 10) / 10,
      list.map((h) => h.code).join(';'),
    ]);
  }
  return rows;
}
