/**
 * 报告生成：病害分布图 + 等级/构件统计 + 维修建议清单 + 二维码分享链接。
 * 使用纯 three-free 的 2D canvas 绘制，便于 node 端直接出 PDF。
 */
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import QRCode from 'qrcode';
import fs from 'node:fs';
import path from 'node:path';
import type { Bridge, Defect, Inspection, ReportMeta, ReportStats } from '../src/core/types';
import { COMPONENT_TYPE_LABEL, DEFECT_TYPE_LABEL, SEVERITY_LEVEL_LABEL } from '../src/core/types';
import type { RepairRow } from '../src/core/reports';
import { SEVERITY_FILL, buildDistributionMap } from '../src/core/reports';
import { formatChainage } from '../src/core/math';
import type { DefectFamily } from '../src/core/timeline';

// PDF 坐标单位 pt。A4 横版 842×595。
const PAGE_W = 842;
const PAGE_H = 595;
const MARGIN = 42;

const COLOR = {
  ink: rgb(0.11, 0.13, 0.16),
  muted: rgb(0.42, 0.46, 0.5),
  line: rgb(0.82, 0.85, 0.88),
  accent: rgb(0.08, 0.36, 0.62),
  critical: rgb(0.9, 0.28, 0.3),
  warning: rgb(0.91, 0.69, 0.2),
  normal: rgb(0.31, 0.6, 0.41),
  panel: rgb(0.965, 0.972, 0.98),
};

/**
 * 找一个可嵌入的中文字体。注意 pdf-lib 的 TTC 集合（msyh.ttc / simsun.ttc）无法子集化，
 * 因此这里只用单体 TTF，并在真正使用前做一次“能不能画中文”的探测。
 */
export function findCJKFonts(): { regular: string; bold: string } | null {
  const dirs = process.platform === 'win32' ? ['C:/Windows/Fonts'] : ['/usr/share/fonts/truetype/noto', '/usr/share/fonts/opentype/noto', '/usr/share/fonts'];
  const regularNames = ['Deng.ttf', 'simhei.ttf', 'NotoSansCJKsc-Regular.ttf', 'NotoSansSC-Regular.ttf', 'wqy-zenhei.ttc.ttf'];
  const boldNames = ['Dengb.ttf', 'simhei.ttf', 'NotoSansCJKsc-Bold.ttf', 'NotoSansSC-Bold.ttf'];
  const pick = (names: string[]) => {
    for (const d of dirs) {
      for (const n of names) {
        const f = `${d}/${n}`;
        try {
          if (fs.existsSync(f) && fs.statSync(f).size > 0) return f;
        } catch {
          /* ignore */
        }
      }
    }
    return null;
  };
  const regular = pick(regularNames);
  if (!regular) return null;
  return { regular, bold: pick(boldNames) ?? regular };
}

/** 探测字体能否真正渲染中文（WinAnsi 编码字体会在绘图时抛错，提前试一次） */
async function canRenderCJK(bytes: Uint8Array): Promise<boolean> {
  try {
    const probe = await PDFDocument.create();
    probe.registerFontkit(fontkit);
    const f = await probe.embedFont(bytes, { subset: true });
    const p = probe.addPage([200, 100]);
    p.drawText('桥梁裂缝检测', { x: 10, y: 40, size: 10, font: f });
    await probe.save();
    return true;
  } catch {
    return false;
  }
}

export interface ReportInput {
  bridge: Bridge;
  inspection: Inspection;
  defects: Defect[];
  families: DefectFamily[];
  stats: ReportStats;
  repairs: RepairRow[];
  confirmations: { defectId: string; confirmed: boolean; engineer: string; note: string; at: string }[];
  meta: ReportMeta;
  shareUrl: string;
  photoPaths: Record<string, string>; // url -> 本地绝对路径
}

interface Ctx {
  doc: PDFDocument;
  font: any;
  bold: any;
  page: any;
  y: number;
}

function text(ctx: Ctx, s: string, x: number, y: number, size = 10, opts: { color?: any; bold?: boolean; maxWidth?: number } = {}) {
  const font = opts.bold ? ctx.bold : ctx.font;
  let str = s ?? '';
  if (opts.maxWidth) {
    while (str.length > 1 && font.widthOfTextAtSize(str, size) > opts.maxWidth) {
      str = str.slice(0, -1);
    }
    if (str !== s) str = str.slice(0, -1) + '…';
  }
  ctx.page.drawText(str, { x, y, size, font, color: opts.color ?? COLOR.ink });
  return y;
}

function newPage(ctx: Ctx) {
  ctx.page = ctx.doc.addPage([PAGE_W, PAGE_H]);
  ctx.y = PAGE_H - MARGIN;
}

/** 圆角矩形（pdf-lib 无内建，用折线近似） */
function roundRect(
  p: any,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: any,
  border?: any,
  opacity = 1,
) {
  const rr = Math.min(r, w / 2, h / 2);
  const path = `M ${x + rr} ${y} L ${x + w - rr} ${y} Q ${x + w} ${y} ${x + w} ${y + rr} L ${x + w} ${y + h - rr} Q ${x + w} ${y + h} ${x + w - rr} ${y + h} L ${x + rr} ${y + h} Q ${x} ${y + h} ${x} ${y + h - rr} L ${x} ${y + rr} Q ${x} ${y} ${x + rr} ${y}`;
  p.drawSvgPath(path, {
    x: 0,
    y: 0,
    color,
    borderColor: border,
    borderWidth: border ? 0.8 : 0,
    opacity,
    borderOpacity: border ? 1 : 0,
  });
}

export async function buildReportPdf(input: ReportInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const fonts = findCJKFonts();
  let font: any = null;
  let bold: any = null;
  let cjkOk = false;
  if (fonts) {
    try {
      const regBytes = fs.readFileSync(fonts.regular);
      if (await canRenderCJK(regBytes)) {
        font = await doc.embedFont(regBytes, { subset: true });
        bold = fonts.bold === fonts.regular ? font : await doc.embedFont(fs.readFileSync(fonts.bold), { subset: true });
        cjkOk = true;
      }
    } catch {
      cjkOk = false;
    }
  }
  if (!font) {
    font = await doc.embedFont(StandardFonts.Helvetica);
    bold = await doc.embedFont(StandardFonts.HelveticaBold);
    cjkOk = false;
  }

  const ctx: Ctx = { doc, font, bold, page: null, y: 0 };
  const bridgeName = input.bridge.config.name;

  // --------- 封面
  newPage(ctx);
  const cover = ctx.page;
  cover.drawRectangle({ x: 0, y: PAGE_H - 150, width: PAGE_W, height: 150, color: rgb(0.07, 0.16, 0.27) });
  cover.drawRectangle({ x: 0, y: PAGE_H - 160, width: PAGE_W, height: 10, color: COLOR.accent });
  text(ctx, '既有桥梁定期检查报告', MARGIN, PAGE_H - 70, 26, { color: rgb(1, 1, 1), bold: true });
  text(ctx, '定期检查 · 病害三维标注与定级', MARGIN, PAGE_H - 105, 12, { color: rgb(0.72, 0.82, 0.92) });
  text(ctx, `报告编号 ${input.meta.reportNo}`, PAGE_W - MARGIN - 200, PAGE_H - 70, 10, {
    color: rgb(0.9, 0.94, 0.98),
    maxWidth: 200,
  });

  let y = PAGE_H - 196;
  const rows: [string, string][] = [
    ['桥梁名称', bridgeName],
    ['结构类型', input.bridge.config.structureType],
    ['桥梁全长', `${input.bridge.length} m（${input.bridge.config.spans.join(' + ')} m）`],
    ['中心桩号', `${formatChainage(input.bridge.config.stationStart)} ~ ${formatChainage(input.bridge.config.stationStart + input.bridge.length)}`],
    ['本次检查', `${input.inspection.title}（${input.inspection.date}）`],
    ['检查单位', input.meta.organization],
    ['管养单位', input.bridge.config.owner],
    ['检查人 / 设备', `${input.inspection.inspector} / ${input.inspection.equipment}`],
  ];
  for (const [k, v] of rows) {
    text(ctx, k, MARGIN, y, 9.5, { color: COLOR.muted, maxWidth: 90 });
    text(ctx, v, MARGIN + 100, y, 10, { maxWidth: 470 });
    ctx.page.drawLine({ start: { x: MARGIN, y: y - 5 }, end: { x: MARGIN + 560, y: y - 5 }, thickness: 0.3, color: COLOR.line });
    y -= 22;
  }

  const boxY = 96;
  roundRect(cover, MARGIN, boxY, 300, 130, 8, COLOR.panel, COLOR.line);
  text(ctx, '本次检查结论摘要', MARGIN + 14, boxY + 106, 11, { bold: true, color: COLOR.accent });
  const summaryLines = [
    `病害总数 ${input.stats.total} 处（病害线 ${input.stats.families} 条）`,
    `严重 ${input.stats.critical} 处 / 需关注 ${input.stats.warning} 处 / 一般 ${input.stats.normal} 处`,
    `新增 ${input.stats.newSinceLast} 处，扩展 ${input.stats.expandedSinceLast} 处`,
    `维修建议 ${input.repairs.length} 项，其中立即处理 ${input.repairs.filter((r) => r.item.urgency === '立即').length} 项`,
  ];
  summaryLines.forEach((l, i) => text(ctx, l, MARGIN + 14, boxY + 82 - i * 19, 10));

  // 二维码
  const qr = await QRCode.toBuffer(input.shareUrl, { margin: 1, width: 240, errorCorrectionLevel: 'M' });
  const qrImg = await doc.embedPng(qr);
  const qx = PAGE_W - MARGIN - 150;
  const qy = boxY;
  roundRect(cover, qx - 12, qy - 12, 174, 174, 8, rgb(1, 1, 1), COLOR.line);
  cover.drawImage(qrImg, { x: qx, y: qy + 12, width: 150, height: 150 });
  text(ctx, '扫码查看只读三维成果', qx - 6, qy - 4, 8, { color: COLOR.muted, maxWidth: 160 });

  text(ctx, `编制 ${input.meta.preparedBy}    复核 ${input.meta.reviewedBy}    审核 ${input.meta.approvedBy}`, MARGIN, 62, 9.5);
  text(ctx, `${input.meta.organization}    ${input.meta.date}`, MARGIN, 46, 9, { color: COLOR.muted });
  if (!cjkOk) {
    text(ctx, 'Note: CJK font not found; Chinese glyphs replaced in this PDF.', MARGIN, 30, 8, {
      color: COLOR.muted,
      maxWidth: 500,
    });
  }

  // --------- 第 2 页：病害分布图
  newPage(ctx);
  text(ctx, '一、病害分布图', MARGIN, ctx.y - 8, 15, { bold: true });
  ctx.y -= 34;
  const ve = drawDistribution(ctx, input);
  ctx.y -= 24;
  text(ctx, `图例：颜色表示评定等级，形状表示病害类型；上方立面展开（桩号—标高，竖向放大 ×${ve.toFixed(1)}），下方平面展开（桩号—横向偏距）。`, MARGIN, 56, 8.5, { color: COLOR.muted, maxWidth: 740 });

  // --------- 第 3 页：统计
  newPage(ctx);
  text(ctx, '二、病害统计', MARGIN, ctx.y - 8, 15, { bold: true });
  ctx.y -= 40;
  drawStats(ctx, input);

  // --------- 第 4 页起：清单
  newPage(ctx);
  text(ctx, '三、病害清单（按等级与构件类型）', MARGIN, ctx.y - 8, 15, { bold: true });
  ctx.y -= 34;
  drawDefectTable(ctx, input);

  // --------- 维修建议
  newPage(ctx);
  text(ctx, '四、维修建议清单', MARGIN, ctx.y - 8, 15, { bold: true });
  ctx.y -= 34;
  drawRepairTable(ctx, input);

  // --------- 工程师确认
  newPage(ctx);
  text(ctx, '五、工程师逐条确认', MARGIN, ctx.y - 8, 15, { bold: true });
  ctx.y -= 34;
  drawConfirmations(ctx, input);

  // --------- 照片附录（有特写照片时）
  const photoDefects = input.defects.filter((d) => d.photos.length > 0);
  for (const d of photoDefects) {
    newPage(ctx);
    text(ctx, `附录 · ${d.code} 特写照片与判定依据`, MARGIN, ctx.y - 8, 14, { bold: true });
    ctx.y -= 34;
    text(ctx, `${DEFECT_TYPE_LABEL[d.type]} · ${SEVERITY_LEVEL_LABEL[d.severity]}（${d.grade} 级） · 桩号 ${formatChainage(d.chainage)} · 偏距 ${d.offset.toFixed(2)} m`, MARGIN, ctx.y, 10, { color: COLOR.muted });
    ctx.y -= 20;
    const justifyLines = wrap(ctx, `判定依据：${d.justification}`, 740, 9.5);
    justifyLines.forEach((l, i) => text(ctx, l, MARGIN, ctx.y - i * 14, 9.5));
    ctx.y -= 12 + justifyLines.length * 14;
    let px = MARGIN;
    let imgY = ctx.y - 210;
    for (const ph of d.photos) {
      const local = input.photoPaths[ph.url];
      if (!local || !fs.existsSync(local)) {
        text(ctx, `（照片缺失：${ph.url}）`, px, imgY + 100, 9, { color: COLOR.critical });
        px += 240;
        continue;
      }
      try {
        const bytes = fs.readFileSync(local);
        const img = ph.url.endsWith('.png') ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
        const imgW = Math.min(220, (img.width / img.height) * 200);
        const imgH = imgW * (img.height / img.width);
        ctx.page.drawImage(img, { x: px, y: imgY, width: imgW, height: imgH });
        text(ctx, ph.caption, px, imgY - 12, 8.5, { color: COLOR.muted, maxWidth: 230 });
        px += 240;
        if (px > PAGE_W - MARGIN - 220) {
          px = MARGIN;
          imgY -= 260;
        }
      } catch {
        text(ctx, `（照片无法嵌入：${path.basename(ph.url)}）`, px, imgY + 100, 9, { color: COLOR.critical });
        px += 240;
      }
    }
  }

  // 页眉页脚统一补
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    if (i === 0) return;
    p.drawLine({ start: { x: MARGIN, y: PAGE_H - 34 }, end: { x: PAGE_W - MARGIN, y: PAGE_H - 34 }, thickness: 0.8, color: COLOR.accent });
    p.drawText(`${bridgeName} · ${input.inspection.title}`, { x: MARGIN, y: PAGE_H - 30, size: 8.5, font, color: COLOR.accent });
    p.drawText(`第 ${i + 1} / ${pages.length} 页`, { x: PAGE_W - MARGIN - 70, y: 20, size: 8, font, color: COLOR.muted });
    p.drawLine({ start: { x: MARGIN, y: 32 }, end: { x: PAGE_W - MARGIN, y: 32 }, thickness: 0.4, color: COLOR.line });
  });

  return doc.save();
}

/** 立面/平面展开分布图 */
function drawDistribution(ctx: Ctx, input: ReportInput): number {
  const cfg = input.bridge.config;
  const map = buildDistributionMap(input.defects, input.bridge.components, {
    stationStart: cfg.stationStart,
    length: input.bridge.length,
    spans: cfg.spans,
    deckWidth: cfg.deckWidth,
  });
  const W = PAGE_W - MARGIN * 2;
  const panelH = 210;
  const topY = ctx.y - panelH;
  const exaggeration = computeVerticalExaggeration(map, input.bridge.length, W, 170);

  for (const [kind, top] of [
    ['elevation', ctx.y],
    ['plan', topY - 16],
  ] as [string, number][]) {
    if (kind === 'plan') {
      text(ctx, '平面展开（病害横向位置，左负右正）', MARGIN, top - 4, 9, { color: COLOR.muted, bold: true });
    } else {
      text(ctx, '立面展开', MARGIN, top - 4, 9, { color: COLOR.muted, bold: true });
    }
    const y0 = top - 22;
    const h = 170;
    ctx.page.drawRectangle({ x: MARGIN, y: y0 - h, width: W, height: h, color: rgb(0.985, 0.988, 0.993), borderColor: COLOR.line, borderWidth: 0.6 });
    // 跨分界线
    for (let i = 0; i < map.spanBounds.length; i++) {
      const x = MARGIN + (map.spanBounds[i] / input.bridge.length) * W;
      ctx.page.drawLine({ start: { x, y: y0 }, end: { x, y: y0 - h }, thickness: 0.5, color: COLOR.line });
      if (i < map.spanBounds.length - 1) {
        const mid = MARGIN + ((map.spanBounds[i] + map.spanBounds[i + 1]) / 2 / input.bridge.length) * W;
        text(ctx, `第 ${i + 1} 跨`, mid - 12, y0 - h - 12, 8, { color: COLOR.muted });
      }
    }
    const lo = kind === 'elevation' ? map.extent.elevation[0] : map.extent.offset[0];
    const hi = kind === 'elevation' ? map.extent.elevation[1] : map.extent.offset[1];
    const vp = (v: number) => y0 - ((v - lo) / Math.max(1e-6, hi - lo)) * h;
    // 轴线：立面画结构轮廓，平面画桥面中线
    if (kind === 'elevation') {
      const xOfM = (mx: number) => MARGIN + (mx / input.bridge.length) * W;
      const shape = (type: string) =>
        type === 'girder'
          ? rgb(0.72, 0.76, 0.8)
          : type === 'pier'
            ? rgb(0.6, 0.65, 0.7)
            : type === 'abutment'
              ? rgb(0.66, 0.7, 0.74)
              : rgb(0.85, 0.87, 0.9);
      // 先画结构（浅灰），再画病害点，避免点被盖住
      for (const st of map.structure) {
        const xa = xOfM(st.x0);
        const xb = xOfM(st.x1);
        const yTop = vp(st.elevMax);
        const yBot = vp(st.elevMin);
        ctx.page.drawRectangle({
          x: xa,
          y: Math.min(yTop, yBot),
          width: Math.max(1, xb - xa),
          height: Math.max(1, Math.abs(yTop - yBot)),
          color: shape(st.type),
          opacity: st.type === 'deck' ? 0.55 : 0.85,
        });
      }
      // 桥面线
      ctx.page.drawLine({
        start: { x: xOfM(0), y: vp(input.bridge.config.elevationStart) },
        end: { x: xOfM(input.bridge.length), y: vp(input.bridge.config.elevationStart) },
        thickness: 1,
        color: COLOR.accent,
      });
      text(ctx, `${lo.toFixed(1)} m`, MARGIN + 2, y0 - h + 2, 7, { color: COLOR.muted });
      text(ctx, `${hi.toFixed(1)} m`, MARGIN + W - 46, y0 - 9, 7, { color: COLOR.muted });
    } else {
      ctx.page.drawLine({ start: { x: MARGIN, y: vp(0) }, end: { x: MARGIN + W, y: vp(0) }, thickness: 1, color: COLOR.accent });
      text(ctx, '桥面中线', MARGIN + 2, vp(0) + 3, 7, { color: COLOR.muted });
      text(ctx, `左 ${Math.abs(lo).toFixed(1)} m`, MARGIN + 2, y0 - h + 2, 7, { color: COLOR.muted });
      text(ctx, `右 ${hi.toFixed(1)} m`, MARGIN + 2, y0 - 9, 7, { color: COLOR.muted });
    }
    for (const mk of map.elevationView) {
      const cx = MARGIN + ((mk.chainage - map.extent.chainage[0]) / input.bridge.length) * W;
      const cy = vp(kind === 'elevation' ? mk.elevation : mk.offset);
      const col = SEVERITY_FILL[mk.severity];
      const fill = rgb(...hexToRgb(col));
      const r = 4.5;
      if (mk.type === 'crack') {
        ctx.page.drawCircle({ x: cx, y: cy, size: r, color: fill, borderColor: rgb(1, 1, 1), borderWidth: 0.8 });
      } else if (mk.type === 'bearing_void') {
        ctx.page.drawRectangle({ x: cx - r, y: cy - r, width: r * 2, height: r * 2, color: fill, borderColor: rgb(1, 1, 1), borderWidth: 0.8 });
      } else {
        ctx.page.drawSvgPath(`M ${cx} ${cy + r} L ${cx + r} ${cy} L ${cx} ${cy - r} L ${cx - r} ${cy} Z`, {
          x: 0,
          y: 0,
          color: fill,
          borderColor: rgb(1, 1, 1),
          borderWidth: 0.8,
        });
      }
    }
    // 桩号标注
    text(ctx, formatChainage(map.extent.chainage[0]), MARGIN, y0 - h - 12, 7.5, { color: COLOR.muted });
    text(ctx, formatChainage(map.extent.chainage[1]), MARGIN + W - 52, y0 - h - 12, 7.5, { color: COLOR.muted });
    ctx.y = y0 - h - 24;
  }
  return exaggeration;
}

/** 立面图的竖向放大倍数：图面竖向比例 / 横向比例，页脚明确标注以免误读坡度 */
function computeVerticalExaggeration(
  map: ReturnType<typeof buildDistributionMap>,
  bridgeLength: number,
  panelWidth: number,
  panelHeight: number,
): number {
  const elevSpan = Math.max(1e-6, map.extent.elevation[1] - map.extent.elevation[0]);
  const hScale = panelHeight / elevSpan;
  const vScale = panelWidth / Math.max(1e-6, bridgeLength);
  return hScale / vScale;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const v = parseInt(h, 16);
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
}

/** 柱状图：等级 / 类型 / 构件 */
function drawStats(ctx: Ctx, input: ReportInput) {
  const blocks: { title: string; items: { label: string; value: number; color: number[] }[] }[] = [
    {
      title: '按等级',
      items: [
        { label: '严重', value: input.stats.critical, color: hexToRgb(SEVERITY_FILL.critical) },
        { label: '需关注', value: input.stats.warning, color: hexToRgb(SEVERITY_FILL.warning) },
        { label: '一般', value: input.stats.normal, color: hexToRgb(SEVERITY_FILL.normal) },
      ],
    },
    {
      title: '按病害类型',
      items: (Object.keys(DEFECT_TYPE_LABEL) as (keyof typeof DEFECT_TYPE_LABEL)[]).map((k) => ({
        label: DEFECT_TYPE_LABEL[k],
        value: input.stats.byType[k as 'crack' | 'bearing_void' | 'joint_seepage']?.total ?? 0,
        color: [0.36, 0.47, 0.6],
      })),
    },
    {
      title: '按构件类型',
      items: (Object.keys(COMPONENT_TYPE_LABEL) as (keyof typeof COMPONENT_TYPE_LABEL)[]).map((k) => ({
        label: COMPONENT_TYPE_LABEL[k],
        value: input.stats.byComponent[k] ?? 0,
        color: [0.28, 0.52, 0.62],
      })),
    },
  ];

  const colW = (PAGE_W - MARGIN * 2 - 24) / 3;
  blocks.forEach((b, bi) => {
    const x = MARGIN + bi * (colW + 12);
    const top = ctx.y - 6;
    roundRect(ctx.page, x, top - 214, colW, 214, 6, COLOR.panel, COLOR.line);
    text(ctx, b.title, x + 12, top - 22, 10.5, { bold: true, color: COLOR.accent });
    const maxV = Math.max(1, ...b.items.map((i) => i.value));
    const barAreaH = 140;
    const baseY = top - 190;
    const barW = (colW - 32) / b.items.length - 10;
    b.items.forEach((it, i) => {
      const bx = x + 14 + i * (barW + 10);
      const hh = Math.max(2, (it.value / maxV) * barAreaH);
      ctx.page.drawRectangle({ x: bx, y: baseY, width: barW, height: hh, color: rgb(...(it.color as [number, number, number])) });
      text(ctx, String(it.value), bx + barW / 2 - 4, baseY + hh + 6, 9, { bold: true });
      const labelY = baseY - 14;
      text(ctx, it.label, bx, labelY, 8.5, { color: COLOR.muted, maxWidth: barW + 4 });
    });
    ctx.page.drawLine({ start: { x: x + 12, y: baseY - 4 }, end: { x: x + colW - 12, y: baseY - 4 }, thickness: 0.6, color: COLOR.line });
  });
  ctx.y -= 232;

  // 每跨严重病害
  const perSpan = input.stats.bySpanCritical;
  const maxSpan = Math.max(1, ...perSpan);
  text(ctx, '各跨严重病害分布', MARGIN, ctx.y, 10.5, { bold: true, color: COLOR.accent });
  ctx.y -= 16;
  perSpan.forEach((v, i) => {
    const x = MARGIN + i * 60;
    const hh = Math.max(1.5, (v / maxSpan) * 74);
    ctx.page.drawRectangle({ x, y: ctx.y - 82, width: 34, height: hh, color: v > 0 ? COLOR.critical : COLOR.line });
    text(ctx, String(v), x + 13, ctx.y - 82 + hh + 4, 8);
    text(ctx, `第${i + 1}跨`, x - 2, ctx.y - 96, 7.5, { color: COLOR.muted });
  });
  ctx.y -= 118;

  // 新增/扩展/预警
  const cards: [string, number, string][] = [
    ['病害线', input.stats.families, '#5b6672'],
    ['新增', input.stats.newSinceLast, '#2f6f9e'],
    ['扩展', input.stats.expandedSinceLast, '#c8732f'],
    ['严重', input.stats.critical, '#e2464b'],
  ];
  const cw = (PAGE_W - MARGIN * 2 - 36) / 4;
  cards.forEach(([label, val, color], i) => {
    const x = MARGIN + i * (cw + 12);
    roundRect(ctx.page, x, ctx.y - 60, cw, 60, 6, rgb(...hexToRgb(color)));
    text(ctx, String(val), x + 14, ctx.y - 34, 20, { bold: true, color: rgb(1, 1, 1) });
    text(ctx, label, x + 14, ctx.y - 50, 9, { color: rgb(1, 1, 1) });
  });
  ctx.y -= 76;
}

/** 病害清单表 */
function drawDefectTable(ctx: Ctx, input: ReportInput) {
  const cols = [
    { key: 'code', label: '编号', w: 108 },
    { key: 'type', label: '类型', w: 52 },
    { key: 'comp', label: '构件', w: 150 },
    { key: 'chain', label: '桩号', w: 84 },
    { key: 'off', label: '偏距(m)', w: 58 },
    { key: 'size', label: '尺度', w: 82 },
    { key: 'grade', label: '等级', w: 46 },
    { key: 'sev', label: '评定', w: 52 },
    { key: 'photo', label: '照片', w: 36 },
  ];
  const compById = new Map(input.bridge.components.map((c) => [c.id, c]));
  const rowH = 20;
  const header = (yTop: number) => {
    ctx.page.drawRectangle({ x: MARGIN, y: yTop - rowH, width: PAGE_W - MARGIN * 2, height: rowH, color: rgb(0.9, 0.93, 0.96) });
    let x = MARGIN + 4;
    for (const c of cols) {
      text(ctx, c.label, x, yTop - 14, 8.5, { bold: true, color: COLOR.accent });
      x += c.w;
    }
  };
  header(ctx.y);
  ctx.y -= rowH;

  const sevRank = (s: string) => (s === 'critical' ? 0 : s === 'warning' ? 1 : 2);
  const list = [...input.defects].sort(
    (a, b) => sevRank(a.severity) - sevRank(b.severity) || a.chainage - b.chainage,
  );
  for (const d of list) {
    if (ctx.y < 80) {
      newPage(ctx);
      text(ctx, '三、病害清单（续）', MARGIN, ctx.y - 8, 13, { bold: true });
      ctx.y -= 30;
      header(ctx.y);
      ctx.y -= rowH;
    }
    if (d.severity !== 'normal') {
      ctx.page.drawRectangle({ x: MARGIN, y: ctx.y - rowH + 2, width: PAGE_W - MARGIN * 2, height: rowH - 3, color: d.severity === 'critical' ? rgb(0.995, 0.93, 0.93) : rgb(0.998, 0.97, 0.9) });
    }
    const comp = compById.get(d.componentId);
    const sizeStr =
      d.geometry.kind === 'crack'
        ? `${(d.geometry.lengthMm / 1000).toFixed(2)}m / ${d.geometry.widthMm.toFixed(2)}mm`
        : `${d.geometry.areaM2.toFixed(2)}m² / ${d.geometry.depthMm.toFixed(0)}mm`;
    const cells = [
      d.code,
      DEFECT_TYPE_LABEL[d.type],
      comp?.name ?? '—',
      formatChainage(d.chainage),
      d.offset.toFixed(2),
      sizeStr,
      `${d.grade}`,
      SEVERITY_LEVEL_LABEL[d.severity],
      d.photos.length ? `✓${d.photos.length}` : '—',
    ];
    let x = MARGIN + 4;
    cols.forEach((c, i) => {
      text(ctx, cells[i], x, ctx.y - 14, 8, { maxWidth: c.w - 6, color: i === 7 && d.severity === 'critical' ? COLOR.critical : COLOR.ink });
      x += c.w;
    });
    ctx.page.drawLine({ start: { x: MARGIN, y: ctx.y - rowH }, end: { x: PAGE_W - MARGIN, y: ctx.y - rowH }, thickness: 0.3, color: COLOR.line });
    ctx.y -= rowH;
  }
  text(ctx, `合计 ${list.length} 处；严重级病害均附特写照片与判定依据（见附录）。`, MARGIN, Math.max(44, ctx.y - 16), 9, { color: COLOR.muted });
}

/** 维修建议表 */
function drawRepairTable(ctx: Ctx, input: ReportInput) {
  const cols = [
    { label: '优先', w: 46 },
    { label: '维修措施', w: 120 },
    { label: '工程量', w: 68 },
    { label: '适用病害', w: 190 },
    { label: '工艺要点', w: 320 },
  ];
  const rowH = 18;
  const drawHead = (yTop: number) => {
    ctx.page.drawRectangle({ x: MARGIN, y: yTop - rowH, width: PAGE_W - MARGIN * 2, height: rowH, color: rgb(0.9, 0.93, 0.96) });
    let x = MARGIN + 4;
    for (const c of cols) {
      text(ctx, c.label, x, yTop - 13, 8.5, { bold: true, color: COLOR.accent });
      x += c.w;
    }
  };
  drawHead(ctx.y);
  ctx.y -= rowH;
  const groups = new Map<string, RepairRow[]>();
  for (const r of input.repairs) {
    const arr = groups.get(r.item.urgency) ?? [];
    arr.push(r);
    groups.set(r.item.urgency, arr);
  }
  for (const urgency of ['立即', '汛前', '下次定检', '观察']) {
    const rs = groups.get(urgency);
    if (!rs?.length) continue;
    const color = urgency === '立即' ? COLOR.critical : urgency === '汛前' ? COLOR.warning : COLOR.muted;
    ctx.page.drawRectangle({ x: MARGIN, y: ctx.y - 16, width: PAGE_W - MARGIN * 2, height: 15, color: rgb(0.97, 0.975, 0.985) });
    text(ctx, `【${urgency}】共 ${rs.length} 项`, MARGIN + 4, ctx.y - 12, 9, { bold: true, color });
    ctx.y -= 18;
    for (const r of rs) {
      const lines = wrap(ctx, r.item.detail, cols[4].w - 8, 7.4);
      const h = Math.max(rowH, lines.length * 10 + (r.note ? 22 : 8));
      if (ctx.y - h < 60) {
        newPage(ctx);
        text(ctx, '四、维修建议清单（续）', MARGIN, ctx.y - 8, 13, { bold: true });
        ctx.y -= 30;
        drawHead(ctx.y);
        ctx.y -= rowH;
      }
      const codes = r.defects.map((d) => d.code).join('、');
      const cells = [urgency, r.item.title, r.quantity, codes, ''];
      let x = MARGIN + 4;
      cells.forEach((c, i) => {
        const cellColor = i === 0 ? color : COLOR.ink;
        if (i === 4) {
          lines.forEach((l, li) => text(ctx, l, x, ctx.y - 11 - li * 10, 7.4, { maxWidth: cols[i].w - 4, color: COLOR.muted }));
        } else {
          text(ctx, c, x, ctx.y - 11, 7.8, { maxWidth: cols[i].w - 6, color: cellColor });
        }
        x += cols[i].w;
      });
      if (r.note) text(ctx, `※ ${r.note}`, MARGIN + 4, ctx.y - h + 4, 7.2, { color: COLOR.warning, maxWidth: PAGE_W - MARGIN * 2 - 8 });
      ctx.page.drawLine({ start: { x: MARGIN, y: ctx.y - h }, end: { x: PAGE_W - MARGIN, y: ctx.y - h }, thickness: 0.3, color: COLOR.line });
      ctx.y -= h;
    }
  }
}

function wrap(ctx: Ctx, s: string, width: number, size: number): string[] {
  const out: string[] = [];
  let line = '';
  for (const ch of s ?? '') {
    const test = line + ch;
    if (ctx.font.widthOfTextAtSize(test, size) > width && line) {
      out.push(line);
      line = ch;
    } else line = test;
  }
  if (line) out.push(line);
  return out.length ? out : [''];
}

/** 工程师确认记录 */
function drawConfirmations(ctx: Ctx, input: ReportInput) {
  const confMap = new Map(input.confirmations.map((c) => [c.defectId, c]));
  const rowH = 19;
  ctx.page.drawRectangle({ x: MARGIN, y: ctx.y - rowH, width: PAGE_W - MARGIN * 2, height: rowH, color: rgb(0.9, 0.93, 0.96) });
  const heads = ['编号', '类型', '桩号', '评定', '确认', '工程师', '意见'];
  const xs = [MARGIN + 4, MARGIN + 110, MARGIN + 168, MARGIN + 250, MARGIN + 316, MARGIN + 380, MARGIN + 470];
  heads.forEach((h, i) => text(ctx, h, xs[i], ctx.y - 13, 8.5, { bold: true, color: COLOR.accent }));
  ctx.y -= rowH;
  for (const d of input.defects) {
    if (ctx.y < 70) {
      newPage(ctx);
      text(ctx, '五、工程师逐条确认（续）', MARGIN, ctx.y - 8, 13, { bold: true });
      ctx.y -= 30;
    }
    const c = confMap.get(d.id);
    const cells = [
      d.code,
      DEFECT_TYPE_LABEL[d.type],
      formatChainage(d.chainage),
      SEVERITY_LEVEL_LABEL[d.severity],
      c?.confirmed ? '✓ 已确认' : '待确认',
      c?.engineer ?? '',
      c?.note ?? '',
    ];
    cells.forEach((v, i) => {
      const w = i === 6 ? PAGE_W - MARGIN - xs[6] : xs[i + 1] ? xs[i + 1] - xs[i] : 120;
      text(ctx, v, xs[i], ctx.y - 13, 8, { maxWidth: w - 4, color: c?.confirmed || i !== 4 ? COLOR.ink : COLOR.muted });
    });
    ctx.page.drawLine({ start: { x: MARGIN, y: ctx.y - rowH }, end: { x: PAGE_W - MARGIN, y: ctx.y - rowH }, thickness: 0.3, color: COLOR.line });
    ctx.y -= rowH;
  }
  const confirmed = input.confirmations.filter((c) => c.confirmed).length;
  ctx.y -= 16;
  text(ctx, `已确认 ${confirmed} / ${input.defects.length} 条。`, MARGIN, ctx.y, 10, { bold: true });
  ctx.y -= 22;
  text(ctx, '确认人签字：________________', MARGIN, ctx.y, 10);
  text(ctx, '日期：________________', MARGIN + 240, ctx.y, 10);
  region(ctx);
}

function region(ctx: Ctx) {
  ctx.y -= 32;
  text(ctx, '说明：本报告由桥检三维标注工作台自动生成，病害位置、桩号、偏距与几何量均由三维模型曲面展开计算；', MARGIN, ctx.y, 8, { color: COLOR.muted, maxWidth: 740 });
  text(ctx, 'PDF 中的分布图标注位置与三维模型中的标注一一对应，可扫描首页二维码打开只读三维视图复核。', MARGIN, ctx.y - 12, 8, { color: COLOR.muted, maxWidth: 740 });
}
