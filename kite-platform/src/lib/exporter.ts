// 导出:SVG 图纸(骨架+蒙面+接缝+标红)、CSV 参数清单、JSON 快照
import type { KiteState, Task } from '../types';
import { SKELETON_LABEL } from '../types';
import { mm } from './geom';
import { stripPoints } from './generator';
import type { CheckIssue } from '../types';

function download(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** 世界坐标(米, y 向上) → SVG 坐标(毫米, y 向下),整体居中并留边 */
function makeProjector(kite: KiteState, padMm = 40) {
  const allX: number[] = [];
  const allY: number[] = [];
  kite.silhouette.forEach(p => { allX.push(p.x); allY.push(p.y); });
  const minX = Math.min(...allX), maxX = Math.max(...allX);
  const minY = Math.min(...allY), maxY = Math.max(...allY);
  const wMm = mm(maxX - minX) + padMm * 2;
  const hMm = mm(maxY - minY) + padMm * 2;
  return {
    wMm, hMm, padMm,
    px: (x: number) => mm(x - minX) + padMm,
    py: (y: number) => mm(maxY - y) + padMm,
  };
}

export function exportSVG(kite: KiteState, task: Task, issues: CheckIssue[]): void {
  const { wMm, hMm, padMm, px, py } = makeProjector(kite);
  const redIds = new Set(
    issues.filter(i => !i.pass && i.targetId).map(i => i.targetId as string),
  );
  const L: string[] = [];
  L.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${wMm}mm" height="${hMm}mm" viewBox="0 0 ${wMm} ${hMm}" font-family="sans-serif">`);
  L.push('<rect width="100%" height="100%" fill="#fbfaf6"/>');
  L.push(`<text x="${padMm}" y="20" font-size="9" fill="#333">${task.title} · ${SKELETON_LABEL[task.skeleton]} · 种子 ${kite.params.seed} · 翼展 ${mm(kite.params.wingspan)}mm</text>`);

  // 蒙面分片
  kite.panels.forEach(p => {
    const pts = p.vertices.map(q => `${px(q.x).toFixed(1)},${py(q.y).toFixed(1)}`).join(' ');
    L.push(`<polygon points="${pts}" fill="${p.color}" fill-opacity="0.55" stroke="#4a7a5c" stroke-width="0.6"/>`);
  });

  // 骨架竹条
  kite.strips.forEach(s => {
    const pts = stripPoints(s, 18).map(p => `${px(p.x).toFixed(1)},${py(p.y).toFixed(1)}`).join(' ');
    const red = redIds.has(s.id);
    L.push(`<polyline points="${pts}" fill="none" stroke="${red ? '#d32f2f' : '#7a5230'}" stroke-width="${red ? 2.2 : 1.4}" ${red ? 'stroke-dasharray="4 2"' : ''}/>`);
  });

  // 接缝点
  kite.seams.forEach(p => {
    const red = redIds.has(p.id);
    L.push(`<circle cx="${px(p.pos.x).toFixed(1)}" cy="${py(p.pos.y).toFixed(1)}" r="1.8" fill="${red ? '#d32f2f' : '#1f6fbf'}"/>`);
  });

  // 提线
  const b = kite.bridle;
  const redB = redIds.has('bridle');
  L.push(`<line x1="${px(b.attach.x).toFixed(1)}" y1="${py(b.attach.y).toFixed(1)}" x2="${px(b.knot.x).toFixed(1)}" y2="${py(b.knot.y).toFixed(1)}" stroke="${redB ? '#d32f2f' : '#555'}" stroke-width="0.8" stroke-dasharray="3 2"/>`);
  L.push(`<circle cx="${px(b.knot.x).toFixed(1)}" cy="${py(b.knot.y).toFixed(1)}" r="2.4" fill="none" stroke="${redB ? '#d32f2f' : '#333'}" stroke-width="1"/>`);

  // 翼展尺寸线
  const ys = kite.silhouette.map(p => p.y);
  const dimY = Math.min(...ys);
  const y0 = py(dimY) + 22;
  L.push(`<line x1="${px(-kite.params.wingspan / 2).toFixed(1)}" y1="${y0}" x2="${px(kite.params.wingspan / 2).toFixed(1)}" y2="${y0}" stroke="#333" stroke-width="0.5"/>`);
  L.push(`<text x="${(wMm / 2).toFixed(1)}" y="${y0 + 7}" font-size="7" text-anchor="middle" fill="#333">翼展 ${mm(kite.params.wingspan)}mm</text>`);
  L.push('</svg>');
  download(`${task.title}-图纸.svg`, L.join('\n'), 'image/svg+xml');
}

export function exportCSV(kite: KiteState, task: Task): void {
  const rows: string[][] = [['类别', '编号/名称', '参数项', '数值', '单位/说明']];
  rows.push(['任务', task.title, '骨架类型', SKELETON_LABEL[task.skeleton], '']);
  rows.push(['任务', task.title, '随机种子', String(kite.params.seed), '同种子结果一致']);
  rows.push(['任务', task.title, '要求竹条数', String(task.stripCount), '根']);
  rows.push(['任务', task.title, '实际竹条数', String(kite.strips.length), '根']);
  rows.push(['任务', task.title, '要求翼展', String(mm(task.wingspan)), 'mm']);
  rows.push(['任务', task.title, '实际翼展', String(mm(kite.params.wingspan)), 'mm']);
  rows.push(['任务', task.title, '要求分片数', String(task.panelCount), '片']);
  rows.push(['任务', task.title, '实际分片数', String(kite.panels.length), '片']);
  rows.push(['任务', task.title, '允差', `±${task.tolerancePct}%`, '']);
  kite.strips.forEach((s, i) => {
    rows.push(['竹条', `${i + 1}.${s.name}(${s.id})`, '起点 x/y', `${mm(s.a.x)} / ${mm(s.a.y)}`, 'mm']);
    rows.push(['竹条', `${i + 1}.${s.name}(${s.id})`, '终点 x/y', `${mm(s.b.x)} / ${mm(s.b.y)}`, 'mm']);
    rows.push(['竹条', `${i + 1}.${s.name}(${s.id})`, '长度', mm(Math.hypot(s.b.x - s.a.x, s.b.y - s.a.y)).toFixed(1), 'mm']);
    rows.push(['竹条', `${i + 1}.${s.name}(${s.id})`, '弧度系数', s.curvature.toFixed(3), '-1~1']);
  });
  kite.seams.forEach((p, i) => {
    rows.push(['接缝', `接缝${i + 1}(${p.id})`, '位置 x/y', `${mm(p.pos.x)} / ${mm(p.pos.y)}`, 'mm']);
  });
  rows.push(['提线', '附着点', 'x/y/z', `${mm(b(kite).attach.x)} / ${mm(b(kite).attach.y)} / ${mm(b(kite).attach.z)}`, 'mm']);
  rows.push(['提线', '汇交点', 'x/y/z', `${mm(b(kite).knot.x)} / ${mm(b(kite).knot.y)} / ${mm(b(kite).knot.z)}`, 'mm']);
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  download(`${task.title}-参数清单.csv`, '﻿' + csv, 'text/csv;charset=utf-8');
}

function b(kite: KiteState) { return kite.bridle; }

export function exportJSON(kite: KiteState, task: Task): void {
  download(`${task.title}-快照.json`, JSON.stringify({ task, kite }, null, 2), 'application/json');
}
