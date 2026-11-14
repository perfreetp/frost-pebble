// 字库生成描边路径：opentype.js 解析 TTF/OTF，输出世界坐标轮廓环
import opentype from 'opentype.js';
import type { Vec2 } from '../types';

export interface LoadedFont {
  name: string;
  font: opentype.Font;
}

let defaultFontPromise: Promise<LoadedFont> | null = null;
const fontCache = new Map<string, LoadedFont>();

/** 内置拉丁字体（Roboto, Apache-2.0，位于 public/fonts，构建后随站点发布） */
export function loadDefaultFont(): Promise<LoadedFont> {
  if (!defaultFontPromise) {
    defaultFontPromise = fetch(`${import.meta.env.BASE_URL}fonts/Roboto-Regular.ttf`)
      .then((r) => r.arrayBuffer())
      .then((buf) => ({ name: 'Roboto（内置）', font: opentype.parse(bufferCopy(buf)) }));
  }
  return defaultFontPromise;
}

// opentype.parse 会持有并修改 buffer，复制一份避免 ArrayBuffer detach 问题
function bufferCopy(buf: ArrayBuffer): ArrayBuffer {
  return buf.slice(0);
}

/** 上传本地字体文件 */
export async function loadFontFile(file: File): Promise<LoadedFont> {
  const cached = fontCache.get(file.name);
  if (cached) return cached;
  const buf = await file.arrayBuffer();
  const font = opentype.parse(bufferCopy(buf));
  const loaded = { name: file.name.replace(/\.(ttf|otf)$/i, ''), font };
  fontCache.set(file.name, loaded);
  return loaded;
}

export interface GeneratedGlyph {
  char: string;
  contours: Vec2[][];
  width: number;
}

export interface TextOutlineResult {
  glyphs: GeneratedGlyph[];
  /** 整体包围盒（字体单位，y 向上） */
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * 生成文字描边轮廓。
 * 两遍处理：先在字体单位排版，再按真实墨迹包围盒二次缩放到目标字高，
 * 保证 sizeMm 就是实测字高（而非含上下留白的 em 高度）。
 * @param text 文字内容
 * @param sizeMm 目标字高(mm)
 * @param tracking 字距(mm)
 */
export function generateTextOutline(
  loaded: LoadedFont,
  text: string,
  sizeMm: number,
  tracking = 0,
): TextOutlineResult {
  const font = loaded.font;
  const upm = font.unitsPerEm;
  const chars = Array.from(text);

  // 第一遍：字体单位下逐字排版
  interface RawGlyph { char: string; contours: Pt[][]; advance: number }
  const raws: RawGlyph[] = [];
  let pen = 0;
  const trackingUnits = tracking * upm / sizeMm; // 先按 em 比例估算，第二遍不再改字距
  for (const ch of chars) {
    const glyph = font.charToGlyph(ch);
    const path = glyph.getPath(pen, 0, upm);
    raws.push({ char: ch, contours: extractContours(path.commands), advance: glyph.advanceWidth ?? upm * 0.5 });
    pen += (glyph.advanceWidth ?? upm * 0.5) + trackingUnits;
  }

  // 整体墨迹包围盒
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const g of raws) for (const ring of g.contours) for (const p of ring) {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
  }
  if (!isFinite(minX)) return { glyphs: [], minX: 0, minY: 0, maxX: 0, maxY: 0 };

  // 第二遍：统一缩放到真实字高
  const unitsScale = sizeMm / (maxY - minY);
  const glyphs: GeneratedGlyph[] = raws.map((g) => ({
    char: g.char,
    contours: g.contours.map((ring) => ring.map((p) => ({ x: p.x * unitsScale, y: p.y * unitsScale }))),
    width: g.advance * unitsScale,
  }));

  return {
    glyphs,
    minX: minX * unitsScale, minY: minY * unitsScale,
    maxX: maxX * unitsScale, maxY: maxY * unitsScale,
  };
}

interface Pt { x: number; y: number }

/** 把 opentype 命令流（M/L/C/Q/Z）展开为闭合轮廓环，曲线按弦差自适应细分 */
export function extractContours(commands: opentype.PathCommand[]): Pt[][] {
  const rings: Pt[][] = [];
  let current: Pt[] = [];
  let cursor: Pt = { x: 0, y: 0 };
  let start: Pt = { x: 0, y: 0 };

  const push = (p: Pt) => {
    const last = current[current.length - 1];
    if (!last || Math.hypot(last.x - p.x, last.y - p.y) > 0.5) current.push(p);
  };

  for (const cmd of commands) {
    switch (cmd.type) {
      case 'M':
        if (current.length > 2) rings.push(current);
        current = [];
        cursor = { x: cmd.x, y: cmd.y };
        start = { ...cursor };
        push(cursor);
        break;
      case 'L':
        cursor = { x: cmd.x, y: cmd.y };
        push(cursor);
        break;
      case 'Q': {
        const p0 = cursor, c = { x: cmd.x1!, y: cmd.y1! }, p1 = { x: cmd.x, y: cmd.y };
        for (let i = 1; i <= 8; i++) {
          const t = i / 8;
          const mt = 1 - t;
          push({
            x: mt * mt * p0.x + 2 * mt * t * c.x + t * t * p1.x,
            y: mt * mt * p0.y + 2 * mt * t * c.y + t * t * p1.y,
          });
        }
        cursor = p1;
        break;
      }
      case 'C': {
        const p0 = cursor;
        const c1 = { x: cmd.x1!, y: cmd.y1! };
        const c2 = { x: cmd.x2!, y: cmd.y2! };
        const p1 = { x: cmd.x, y: cmd.y };
        for (let i = 1; i <= 12; i++) {
          const t = i / 12;
          const mt = 1 - t;
          push({
            x: mt ** 3 * p0.x + 3 * mt ** 2 * t * c1.x + 3 * mt * t ** 2 * c2.x + t ** 3 * p1.x,
            y: mt ** 3 * p0.y + 3 * mt ** 2 * t * c1.y + 3 * mt * t ** 2 * c2.y + t ** 3 * p1.y,
          });
        }
        cursor = p1;
        break;
      }
      case 'Z':
        if (current.length > 2) {
          if (Math.hypot(current[0].x - start.x, current[0].y - start.y) < 0.5) current.pop();
          rings.push(current);
        }
        current = [];
        cursor = { ...start };
        break;
    }
  }
  if (current.length > 2) rings.push(current);
  return rings;
}
