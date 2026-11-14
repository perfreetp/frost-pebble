// 导出：施工图 SVG（尺寸标注）、材料清单 CSV、客户预览单文件 HTML、方案 JSON
import type { ProjectData, QuoteResult, StatsResult } from '../types';
import { ENVIRONMENTS } from '../core/defaults';
import { sampleTubePath } from '../core/geometry';
import { computeQuote, computeStats } from '../core/stats';
import { clientViewerSource } from './client-viewer';

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

function cssHex(c: { r: number; g: number; b: number }): string {
  const h = (n: number) => n.toString(16).padStart(2, '0');
  return `#${h(c.r)}${h(c.g)}${h(c.b)}`;
}

/** 带尺寸标注的施工图（SVG 字符串），单位 mm，可直接打印 */
export function buildConstructionSVG(project: ProjectData, stats: StatsResult): string {
  const { wall, elements } = project;
  const pad = 160;
  const W = wall.width + pad * 2;
  const H = wall.height + pad * 2 + 140;
  const ox = pad, oy = pad;
  const svg: string[] = [];

  svg.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}" font-family="Arial, sans-serif">`);
  svg.push('<rect width="100%" height="100%" fill="white"/>');
  svg.push(`<text x="${W / 2}" y="50" font-size="36" text-anchor="middle" font-weight="bold">${esc(project.name)} — 施工图</text>`);
  svg.push(`<text x="${W / 2}" y="85" font-size="20" text-anchor="middle" fill="#555">生成时间 ${new Date().toLocaleString('zh-CN')}</text>`);
  svg.push(`<rect x="${ox}" y="${oy}" width="${wall.width}" height="${wall.height}" fill="none" stroke="#222" stroke-width="3"/>`);

  const tx = (x: number) => ox + x;
  const ty = (y: number) => oy + wall.height - y;

  for (const el of elements) {
    const col = cssHex(el.color);
    if (el.kind === 'acrylic') {
      for (const ring of el.contours) {
        const d = ring.map((p, i) => `${i === 0 ? 'M' : 'L'}${tx(p.x).toFixed(1)},${ty(p.y).toFixed(1)}`).join(' ') + ' Z';
        svg.push(`<path d="${d}" fill="${col}" fill-opacity="0.25" stroke="${col}" stroke-width="2.5"/>`);
      }
    } else {
      const sampled = sampleTubePath(el.points, el.cornerRadii, 8);
      const d = sampled.map((p, i) => `${i === 0 ? 'M' : 'L'}${tx(p.x).toFixed(1)},${ty(p.y).toFixed(1)}`).join(' ');
      svg.push(`<path d="${d}" fill="none" stroke="${col}" stroke-width="${el.diameter}" stroke-linecap="round" stroke-linejoin="round"/>`);
      const bad = stats.radiusWarnings.filter((w) => w.id === el.id);
      el.points.forEach((p, i) => {
        if (i === 0 || i === el.points.length - 1) return;
        const isBad = bad.some((b) => b.cornerIndex === i - 1);
        svg.push(`<circle cx="${tx(p.x)}" cy="${ty(p.y)}" r="10" fill="${isBad ? '#e11' : '#fff'}" stroke="${isBad ? '#e11' : '#333'}" stroke-width="2"/>`);
        if (isBad) {
          const min = bad.find((b) => b.cornerIndex === i - 1)?.min;
          svg.push(`<text x="${tx(p.x) + 14}" y="${ty(p.y) - 12}" font-size="18" fill="#e11">R${el.cornerRadii[i - 1]}&lt;${min}</text>`);
        }
      });
      const joints = stats.connectorDetail.find((c) => c.id === el.id)?.joints ?? 0;
      if (joints > 0) {
        const total = sampled.length - 1;
        for (let j = 1; j <= joints; j++) {
          const idx = Math.floor((total * j) / (joints + 1));
          const p = sampled[idx];
          svg.push(`<rect x="${tx(p.x) - 12}" y="${ty(p.y) - 12}" width="24" height="24" fill="#ffb300" stroke="#333" stroke-width="1.5"/>`);
          svg.push(`<text x="${tx(p.x)}" y="${ty(p.y) + 6}" font-size="16" text-anchor="middle">接</text>`);
        }
      }
    }
  }

  // 尺寸标注
  const dimY = oy + wall.height + 70;
  svg.push(`<line x1="${ox}" y1="${dimY}" x2="${ox + wall.width}" y2="${dimY}" stroke="#333" stroke-width="1.5"/>`);
  svg.push(`<line x1="${ox}" y1="${dimY - 12}" x2="${ox}" y2="${dimY + 12}" stroke="#333" stroke-width="1.5"/>`);
  svg.push(`<line x1="${ox + wall.width}" y1="${dimY - 12}" x2="${ox + wall.width}" y2="${dimY + 12}" stroke="#333" stroke-width="1.5"/>`);
  svg.push(`<text x="${ox + wall.width / 2}" y="${dimY + 34}" font-size="26" text-anchor="middle">${wall.width} mm</text>`);

  const dimX = ox - 70;
  svg.push(`<line x1="${dimX}" y1="${oy}" x2="${dimX}" y2="${oy + wall.height}" stroke="#333" stroke-width="1.5"/>`);
  svg.push(`<line x1="${dimX - 12}" y1="${oy}" x2="${dimX + 12}" y2="${oy}" stroke="#333" stroke-width="1.5"/>`);
  svg.push(`<line x1="${dimX - 12}" y1="${oy + wall.height}" x2="${dimX + 12}" y2="${oy + wall.height}" stroke="#333" stroke-width="1.5"/>`);
  svg.push(`<text x="${dimX - 18}" y="${oy + wall.height / 2}" font-size="26" text-anchor="middle" transform="rotate(-90 ${dimX - 18} ${oy + wall.height / 2})">${wall.height} mm</text>`);

  const legendY = dimY + 80;
  svg.push(`<text x="${ox}" y="${legendY}" font-size="22" font-weight="bold">统计：灯管总长 ${stats.totalTubeM.toFixed(2)}m ｜ 接头 ${stats.connectorCount} 个 ｜ 变压器 ${stats.transformers.length} 台 ｜ 总功率 ${stats.totalWatts.toFixed(1)}W ｜ 带载余量 ${(stats.overallMargin * 100).toFixed(1)}%</text>`);
  if (stats.radiusWarnings.length > 0) {
    svg.push(`<text x="${ox}" y="${legendY + 34}" font-size="20" fill="#e11">⚠ 存在 ${stats.radiusWarnings.length} 处折弯半径小于灯管直径 2 倍，已在图中标红</text>`);
  }
  svg.push('</svg>');
  return svg.join('\n');
}

/** 材料清单 CSV（含 BOM 与报价） */
export function buildBOMCSV(project: ProjectData, stats: StatsResult, quote: QuoteResult): string {
  const rows: string[][] = [
    ['霓虹招牌材料清单 / 报价单'],
    ['方案名称', project.name],
    ['生成时间', new Date().toLocaleString('zh-CN')],
    ['墙面尺寸(mm)', `${project.wall.width} × ${project.wall.height}`],
    [],
    ['项目', '规格说明', '数量', '单位', '单价(元)', '金额(元)'],
  ];
  for (const l of quote.lines) rows.push([l.item, l.spec, String(l.qty), l.unit, String(l.unitPrice), String(l.amount)]);
  rows.push([]);
  rows.push(['合计(元)', '', '', '', '', String(quote.total)]);
  rows.push([]);
  rows.push(['—— 电气统计 ——']);
  rows.push(['灯管总长(m)', stats.totalTubeM.toFixed(2)]);
  rows.push(['接头数(个)', String(stats.connectorCount)]);
  rows.push(['总功率(W)', stats.totalWatts.toFixed(1)]);
  rows.push(['整体带载余量(%)', (stats.overallMargin * 100).toFixed(1)]);
  stats.transformers.forEach((t, i) => {
    rows.push([
      `变压器${i + 1}`, `${t.capacityVA}VA`,
      `负载 ${t.loadW.toFixed(1)}W`, `负载率 ${(t.loadRatio * 100).toFixed(0)}%`,
      t.overloaded ? `超载！建议 ≥${t.suggestVA}VA` : '正常',
    ]);
  });
  return rows.map((r) => r.map(csvCell).join(',')).join('\r\n');
}

function csvCell(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function downloadText(filename: string, text: string, mime: string): void {
  downloadBlob(filename, new Blob([text], { type: `${mime};charset=utf-8` }));
}

export function exportProjectJSON(project: ProjectData): void {
  downloadText(`${safeName(project.name)}.neon.json`, JSON.stringify(project, null, 2), 'application/json');
}

export async function importProjectJSON(file: File): Promise<ProjectData> {
  const data = JSON.parse(await file.text()) as ProjectData;
  if (data.version !== 1 || !Array.isArray(data.elements)) throw new Error('文件格式不正确');
  return data;
}

function safeName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '_');
}

/** 发给客户的单文件 HTML：内嵌方案 JSON + 零依赖 WebGL2 查看器 */
export function buildClientHTML(project: ProjectData): string {
  const stats = computeStats(project);
  const quote = computeQuote(project, stats);
  const json = JSON.stringify(project).replace(/</g, '\\u003c');
  const envButtons = (Object.keys(ENVIRONMENTS) as (keyof typeof ENVIRONMENTS)[])
    .map((k) => `<button data-env="${k}"${k === project.environment ? ' class="active"' : ''}>${ENVIRONMENTS[k].label}</button>`)
    .join('');

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(project.name)} — 霓虹招牌效果预览</title>
<style>
  * { box-sizing: border-box; }
  body { margin:0; background:#0b0d14; color:#e8ecf4; font-family:"Microsoft YaHei",system-ui,sans-serif; }
  header { padding:14px 20px; display:flex; align-items:baseline; gap:16px; flex-wrap:wrap; }
  h1 { font-size:18px; margin:0; }
  .meta { color:#9aa4b8; font-size:13px; }
  .bar { padding:0 20px 12px; display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
  button { background:#1d2433; color:#dbe4f2; border:1px solid #33405a; border-radius:8px; padding:7px 14px; cursor:pointer; font-size:13px; }
  button.active { background:#3b82f6; border-color:#3b82f6; color:#fff; }
  label { font-size:13px; color:#9aa4b8; display:flex; align-items:center; gap:6px; }
  input[type=range] { width:130px; }
  #stage { display:block; width:calc(100vw - 40px); height:62vh; margin:0 20px; border-radius:12px; background:#000; touch-action:none; }
  table { border-collapse:collapse; margin:16px 20px; font-size:13px; width:calc(100% - 40px); }
  th,td { border:1px solid #2a3349; padding:7px 10px; text-align:left; }
  th { background:#161c2b; }
  tfoot td { font-weight:bold; background:#161c2b; }
  .warn { color:#ff7676; font-weight:bold; }
  h2 { font-size:15px; margin:18px 20px 0; }
</style>
</head>
<body>
<header>
  <h1>${esc(project.name)}</h1>
  <span class="meta">墙面 ${project.wall.width}×${project.wall.height}mm ｜ 灯管 ${stats.totalTubeM.toFixed(2)}m ｜ 接头 ${stats.connectorCount} 个 ｜ 变压器 ${stats.transformers.length} 台 ｜ 总功率 ${stats.totalWatts.toFixed(1)}W</span>
</header>
<div class="bar">
  ${envButtons}
  <label>泛光强度 <input id="bloom" type="range" min="0" max="2" step="0.05" value="${project.bloom.intensity}"></label>
  <label>光晕半径 <input id="radius" type="range" min="0" max="1" step="0.05" value="${project.bloom.radius}"></label>
</div>
<canvas id="stage"></canvas>
<h2>报价明细（元）</h2>
<table>
  <thead><tr><th>项目</th><th>规格</th><th>数量</th><th>单位</th><th>单价</th><th>金额</th></tr></thead>
  <tbody>
  ${quote.lines.map((l) => `<tr><td>${esc(l.item)}</td><td class="${l.spec.includes('超载') ? 'warn' : ''}">${esc(l.spec)}</td><td>${l.qty}</td><td>${esc(l.unit)}</td><td>${l.unitPrice}</td><td>${l.amount}</td></tr>`).join('')}
  </tbody>
  <tfoot><tr><td colspan="5">合计</td><td>${quote.total}</td></tr></tfoot>
</table>
<script>
const PROJECT = ${json};
const ENVIRONMENTS = ${JSON.stringify(ENVIRONMENTS)};
${clientViewerSource}
<\/script>
</body>
</html>`;
}

export function exportClientHTML(project: ProjectData): void {
  downloadText(`${safeName(project.name)}-客户预览.html`, buildClientHTML(project), 'text/html');
}

export function exportConstructionDrawing(project: ProjectData): void {
  const stats = computeStats(project);
  downloadText(`${safeName(project.name)}-施工图.svg`, buildConstructionSVG(project, stats), 'image/svg+xml');
}

export function exportBOM(project: ProjectData): void {
  const stats = computeStats(project);
  const quote = computeQuote(project, stats);
  downloadText(`${safeName(project.name)}-材料清单.csv`, '﻿' + buildBOMCSV(project, stats, quote), 'text/csv');
}
