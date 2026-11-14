// 自研图像压缩编码器：
// RGB -> YCbCr 4:2:0 -> 8x8 分块 DCT -> 量化表量化 -> ZigZag ->
// DC 差分 + AC 游程 -> Huffman 熵编码 -> 自定义比特流
// 并配套解码器，输出解压图与失真指标（MSE / PSNR）

import { BLOCK, fdct, idct, ZIGZAG, STD_LUMA_Q, STD_CHROMA_Q, scaleQuantTable } from './dct';
import {
  BitWriter, BitReader, buildHuffman, canonicalCodes, HuffDecoder,
  serializeTable, deserializeTable, tableToLengths,
  type HuffCode,
} from './huffman';

export interface CompressResult {
  bytes: Uint8Array;        // 实际编码出的比特流（含头）
  decompressed: ImageData;  // 解码重建图
  mse: number;
  psnr: number;
  yBlocks: number;
  cBlocks: number;
}

const EOB = 0x00;
const ZRL = 0xf0;

function magnitudeSize(v: number): number {
  let a = Math.abs(v);
  let n = 0;
  while (a > 0) { n++; a >>= 1; }
  return n;
}

/** 将一块 64 个量化系数编码为符号序列并累计频率 */
function collectBlockSymbols(
  qcoeffs: Int16Array, prevDC: number,
  dcFreq: Map<number, number>, acFreq: Map<number, number>,
): number {
  const diff = qcoeffs[0] - prevDC;
  const dcSym = magnitudeSize(diff);
  dcFreq.set(dcSym, (dcFreq.get(dcSym) ?? 0) + 1);

  let run = 0;
  for (let k = 1; k < 64; k++) {
    const v = qcoeffs[ZIGZAG[k]];
    if (v === 0) {
      run++;
    } else {
      while (run > 15) {
        acFreq.set(ZRL, (acFreq.get(ZRL) ?? 0) + 1);
        run -= 16;
      }
      const size = magnitudeSize(v);
      const sym = (run << 4) | size;
      acFreq.set(sym, (acFreq.get(sym) ?? 0) + 1);
      run = 0;
    }
  }
  if (run > 0) acFreq.set(EOB, (acFreq.get(EOB) ?? 0) + 1);
  return qcoeffs[0];
}

function writeBlock(
  writer: BitWriter, qcoeffs: Int16Array, prevDC: number,
  dcTable: Map<number, HuffCode>, acTable: Map<number, HuffCode>,
): number {
  const diff = qcoeffs[0] - prevDC;
  const dcSym = magnitudeSize(diff);
  const dc = dcTable.get(dcSym)!;
  writer.writeBits(dc.code, dc.len);
  if (dcSym > 0) {
    const amp = diff < 0 ? diff + (1 << dcSym) - 1 : diff;
    writer.writeBits(amp, dcSym);
  }
  let run = 0;
  for (let k = 1; k < 64; k++) {
    const v = qcoeffs[ZIGZAG[k]];
    if (v === 0) {
      run++;
    } else {
      while (run > 15) {
        const z = acTable.get(ZRL)!;
        writer.writeBits(z.code, z.len);
        run -= 16;
      }
      const size = magnitudeSize(v);
      const sym = (run << 4) | size;
      const ac = acTable.get(sym)!;
      writer.writeBits(ac.code, ac.len);
      const amp = v < 0 ? v + (1 << size) - 1 : v;
      writer.writeBits(amp, size);
      run = 0;
    }
  }
  if (run > 0) {
    const e = acTable.get(EOB)!;
    writer.writeBits(e.code, e.len);
  }
  return qcoeffs[0];
}

function readBlock(
  reader: BitReader, prevDC: number,
  dcDec: HuffDecoder, acDec: HuffDecoder, out: Int16Array,
): number {
  out.fill(0);
  const dcSym = dcDec.decode(reader);
  let diff = 0;
  if (dcSym > 0) {
    const amp = reader.readBits(dcSym);
    diff = amp < 1 << (dcSym - 1) ? amp - (1 << dcSym) + 1 : amp;
  }
  const dc = prevDC + diff;
  out[0] = dc;
  let k = 1;
  while (k < 64) {
    const sym = acDec.decode(reader);
    if (sym === EOB) break;
    if (sym === ZRL) { k += 16; continue; }
    const run = sym >> 4;
    const size = sym & 0xf;
    k += run;
    if (k >= 64) break;
    const amp = reader.readBits(size);
    const v = amp < 1 << (size - 1) ? amp - (1 << size) + 1 : amp;
    out[ZIGZAG[k]] = v;
    k++;
  }
  return dc;
}

/** 平面补齐到 8 的倍数（边缘复制） */
function padPlane(src: Float32Array, w: number, h: number): { data: Float32Array; pw: number; ph: number } {
  const pw = Math.ceil(w / BLOCK) * BLOCK;
  const ph = Math.ceil(h / BLOCK) * BLOCK;
  if (pw === w && ph === h) return { data: src, pw, ph };
  const data = new Float32Array(pw * ph);
  for (let y = 0; y < ph; y++) {
    const sy = Math.min(y, h - 1);
    for (let x = 0; x < pw; x++) {
      data[y * pw + x] = src[sy * w + Math.min(x, w - 1)];
    }
  }
  return { data, pw, ph };
}

interface PlaneJob {
  data: Float32Array;
  pw: number;
  ph: number;
  quant: Uint16Array;
  blocks: Int16Array[]; // 每块 64 个量化系数
  dcFreq: Map<number, number>;
  acFreq: Map<number, number>;
}

function quantizePlane(plane: { data: Float32Array; pw: number; ph: number }, quant: Uint16Array): PlaneJob {
  const { data, pw, ph } = plane;
  const blocks: Int16Array[] = [];
  const dcFreq = new Map<number, number>();
  const acFreq = new Map<number, number>();
  const sample = new Float32Array(64);
  const coeff = new Float32Array(64);
  let prevDC = 0;
  for (let by = 0; by < ph; by += BLOCK) {
    for (let bx = 0; bx < pw; bx += BLOCK) {
      for (let y = 0; y < BLOCK; y++) {
        for (let x = 0; x < BLOCK; x++) {
          sample[y * 8 + x] = data[(by + y) * pw + bx + x] - 128;
        }
      }
      fdct(sample, coeff);
      const q = new Int16Array(64);
      for (let i = 0; i < 64; i++) q[i] = Math.round(coeff[i] / quant[i]);
      blocks.push(q);
      prevDC = collectBlockSymbols(q, prevDC, dcFreq, acFreq);
    }
  }
  return { data, pw, ph, quant, blocks, dcFreq, acFreq };
}

export function compressImage(img: ImageData, quality: number): CompressResult {
  const w = img.width;
  const h = img.height;
  const src = img.data;

  // 1. 色彩空间转换 + 4:2:0 色度抽样
  const yPlane = new Float32Array(w * h);
  const cbFull = new Float32Array(w * h);
  const crFull = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = src[i * 4], g = src[i * 4 + 1], b = src[i * 4 + 2];
    yPlane[i] = 0.299 * r + 0.587 * g + 0.114 * b;
    cbFull[i] = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
    crFull[i] = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  }
  const cw = Math.ceil(w / 2);
  const ch = Math.ceil(h / 2);
  const cbPlane = new Float32Array(cw * ch);
  const crPlane = new Float32Array(cw * ch);
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      let sb = 0, sr = 0, n = 0;
      for (let dy = 0; dy < 2; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          const sx = Math.min(x * 2 + dx, w - 1);
          const sy = Math.min(y * 2 + dy, h - 1);
          sb += cbFull[sy * w + sx];
          sr += crFull[sy * w + sx];
          n++;
        }
      }
      cbPlane[y * cw + x] = sb / n;
      crPlane[y * cw + x] = sr / n;
    }
  }

  // 2. 量化表（按质量档缩放）
  const qLuma = scaleQuantTable(STD_LUMA_Q, quality);
  const qChroma = scaleQuantTable(STD_CHROMA_Q, quality);

  // 3. 分块 DCT + 量化，收集符号频率
  const jobs = [
    quantizePlane(padPlane(yPlane, w, h), qLuma),
    quantizePlane(padPlane(cbPlane, cw, ch), qChroma),
    quantizePlane(padPlane(crPlane, cw, ch), qChroma),
  ];

  // 4. 构建 Huffman 码表并写出比特流
  const header: number[] = [0x50, 0x43, 0x31]; // 'PC1'
  header.push((w >> 8) & 0xff, w & 0xff, (h >> 8) & 0xff, h & 0xff, quality & 0xff);
  const tables = jobs.map((j) => ({
    dc: buildHuffman(j.dcFreq) ?? canonicalCodes(new Map([[0, 1]])),
    ac: buildHuffman(j.acFreq) ?? canonicalCodes(new Map([[EOB, 1]])),
  }));
  for (const t of tables) {
    header.push(...serializeTable(tableToLengths(t.dc)));
    header.push(...serializeTable(tableToLengths(t.ac)));
  }
  const writer = new BitWriter();
  for (let c = 0; c < 3; c++) {
    let prevDC = 0;
    for (const blk of jobs[c].blocks) {
      prevDC = writeBlock(writer, blk, prevDC, tables[c].dc, tables[c].ac);
    }
  }
  const payload = writer.finish();
  const bytes = new Uint8Array(header.length + payload.length);
  bytes.set(header, 0);
  bytes.set(payload, header.length);

  // 5. 从比特流解码重建（验证熵编码往返正确）
  const decompressed = decodeImage(bytes);

  // 6. 失真指标
  let sumSq = 0;
  const d = decompressed.data;
  for (let i = 0; i < w * h; i++) {
    for (let c = 0; c < 3; c++) {
      const diff = src[i * 4 + c] - d[i * 4 + c];
      sumSq += diff * diff;
    }
  }
  const mse = sumSq / (w * h * 3);
  const psnr = mse === 0 ? Infinity : 10 * Math.log10((255 * 255) / mse);

  return {
    bytes,
    decompressed,
    mse,
    psnr,
    yBlocks: jobs[0].blocks.length,
    cBlocks: jobs[1].blocks.length + jobs[2].blocks.length,
  };
}

export function decodeImage(bytes: Uint8Array): ImageData {
  if (bytes[0] !== 0x50 || bytes[1] !== 0x43 || bytes[2] !== 0x31) {
    throw new Error('不是本系统的压缩流（缺少 PC1 头）');
  }
  const w = (bytes[3] << 8) | bytes[4];
  const h = (bytes[5] << 8) | bytes[6];
  const quality = bytes[7];
  let offset = 8;

  const qLuma = scaleQuantTable(STD_LUMA_Q, quality);
  const qChroma = scaleQuantTable(STD_CHROMA_Q, quality);
  const quants = [qLuma, qChroma, qChroma];

  const cw = Math.ceil(w / 2);
  const ch = Math.ceil(h / 2);
  const dims: Array<[number, number]> = [
    [Math.ceil(w / BLOCK) * BLOCK, Math.ceil(h / BLOCK) * BLOCK],
    [Math.ceil(cw / BLOCK) * BLOCK, Math.ceil(ch / BLOCK) * BLOCK],
    [Math.ceil(cw / BLOCK) * BLOCK, Math.ceil(ch / BLOCK) * BLOCK],
  ];

  const decoders: Array<{ dc: HuffDecoder; ac: HuffDecoder }> = [];
  for (let c = 0; c < 3; c++) {
    const dc = deserializeTable(bytes, offset);
    offset = dc.next;
    const ac = deserializeTable(bytes, offset);
    offset = ac.next;
    decoders.push({ dc: new HuffDecoder(dc.table), ac: new HuffDecoder(ac.table) });
  }

  const reader = new BitReader(bytes, offset);
  const planes: Float32Array[] = [];
  const coeff = new Int16Array(64);
  const spatial = new Float32Array(64);
  for (let c = 0; c < 3; c++) {
    const [pw, ph] = dims[c];
    const quant = quants[c];
    const plane = new Float32Array(pw * ph);
    let prevDC = 0;
    let bi = 0;
    for (let by = 0; by < ph; by += BLOCK) {
      for (let bx = 0; bx < pw; bx += BLOCK) {
        prevDC = readBlock(reader, prevDC, decoders[c].dc, decoders[c].ac, coeff);
        const deq = new Float32Array(64);
        for (let i = 0; i < 64; i++) deq[i] = coeff[i] * quant[i];
        idct(deq, spatial);
        for (let y = 0; y < BLOCK; y++) {
          for (let x = 0; x < BLOCK; x++) {
            plane[(by + y) * pw + bx + x] = spatial[y * 8 + x] + 128;
          }
        }
        bi++;
      }
    }
    planes.push(plane);
  }

  // 色度上采样（最近邻）+ YCbCr -> RGB
  const out = new ImageData(w, h);
  const od = out.data;
  const [yP, cbP, crP] = planes;
  const [cpw] = [dims[1][0]];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const Y = yP[y * dims[0][0] + x];
      const cb = cbP[(y >> 1) * cpw + (x >> 1)] - 128;
      const cr = crP[(y >> 1) * cpw + (x >> 1)] - 128;
      const i = (y * w + x) * 4;
      od[i] = clamp8(Y + 1.402 * cr);
      od[i + 1] = clamp8(Y - 0.344136 * cb - 0.714136 * cr);
      od[i + 2] = clamp8(Y + 1.772 * cb);
      od[i + 3] = 255;
    }
  }
  return out;
}

function clamp8(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : Math.round(v);
}

// ---------- 可压缩性分析：细节过碎 / 大面积纯色 ----------

export interface BlockAnalysis {
  totalBlocks: number;
  flatBlocks: number;    // 方差极低的纯色块
  busyBlocks: number;    // 高频能量占比过高的碎细节块
  flatRatio: number;
  busyRatio: number;
  warnings: string[];    // 给师傅的提示
}

export function analyzeImage(img: ImageData): BlockAnalysis {
  const w = img.width;
  const h = img.height;
  const src = img.data;
  const yPlane = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    yPlane[i] = 0.299 * src[i * 4] + 0.587 * src[i * 4 + 1] + 0.114 * src[i * 4 + 2];
  }
  const { data, pw, ph } = padPlane(yPlane, w, h);
  const sample = new Float32Array(64);
  const coeff = new Float32Array(64);
  let flat = 0;
  let busy = 0;
  let total = 0;
  for (let by = 0; by < ph; by += BLOCK) {
    for (let bx = 0; bx < pw; bx += BLOCK) {
      let mean = 0;
      for (let yy = 0; yy < BLOCK; yy++) {
        for (let xx = 0; xx < BLOCK; xx++) {
          const v = data[(by + yy) * pw + bx + xx];
          sample[yy * 8 + xx] = v;
          mean += v;
        }
      }
      mean /= 64;
      let variance = 0;
      for (let i = 0; i < 64; i++) variance += (sample[i] - mean) * (sample[i] - mean);
      variance /= 64;
      total++;
      if (variance < 25) { flat++; continue; } // 纯色块不必再算 DCT
      for (let i = 0; i < 64; i++) sample[i] -= mean;
      fdct(sample, coeff);
      let acEnergy = 0;
      let hiEnergy = 0;
      for (let v = 0; v < 8; v++) {
        for (let u = 0; u < 8; u++) {
          if (u === 0 && v === 0) continue;
          const e = coeff[v * 8 + u] * coeff[v * 8 + u];
          acEnergy += e;
          if (u + v >= 6) hiEnergy += e;
        }
      }
      if (acEnergy > 0 && hiEnergy / acEnergy > 0.3) busy++;
    }
  }
  const flatRatio = total ? flat / total : 0;
  const busyRatio = total ? busy / total : 0;
  const warnings: string[] = [];
  if (busyRatio > 0.35) {
    warnings.push(`细节过碎（${(busyRatio * 100).toFixed(0)}% 块高频能量过高），压缩后易糊边，不建议压缩或请用 90 以上档位`);
  }
  if (flatRatio > 0.6) {
    warnings.push(`大面积纯色块（${(flatRatio * 100).toFixed(0)}% 块近乎纯色），压缩收益低且易出现色带/蚊噪，不建议压缩`);
  }
  return { totalBlocks: total, flatBlocks: flat, busyBlocks: busy, flatRatio, busyRatio, warnings };
}
