// 8x8 离散余弦变换（DCT-II / DCT-III），可分离实现
// 以及 JPEG 标准量化表与质量档位缩放

export const BLOCK = 8;

// 预计算余弦基 COS[u][x] = cos((2x+1) * u * PI / 16)
const COS: Float32Array[] = [];
for (let u = 0; u < BLOCK; u++) {
  const row = new Float32Array(BLOCK);
  for (let x = 0; x < BLOCK; x++) {
    row[x] = Math.cos(((2 * x + 1) * u * Math.PI) / 16);
  }
  COS.push(row);
}
const C = (i: number) => (i === 0 ? Math.SQRT1_2 : 1);

/** 正向 8x8 DCT，输入输出均为 64 长度（行优先） */
export function fdct(input: Float32Array, output: Float32Array): void {
  const tmp = new Float32Array(64);
  for (let u = 0; u < 8; u++) {
    for (let y = 0; y < 8; y++) {
      let s = 0;
      for (let x = 0; x < 8; x++) s += input[y * 8 + x] * COS[u][x];
      tmp[y * 8 + u] = s;
    }
  }
  for (let u = 0; u < 8; u++) {
    for (let v = 0; v < 8; v++) {
      let s = 0;
      for (let y = 0; y < 8; y++) s += tmp[y * 8 + u] * COS[v][y];
      output[v * 8 + u] = 0.25 * C(u) * C(v) * s;
    }
  }
}

/** 逆向 8x8 DCT */
export function idct(coeff: Float32Array, output: Float32Array): void {
  const tmp = new Float32Array(64);
  for (let x = 0; x < 8; x++) {
    for (let v = 0; v < 8; v++) {
      let s = 0;
      for (let u = 0; u < 8; u++) s += C(u) * coeff[v * 8 + u] * COS[u][x];
      tmp[v * 8 + x] = s;
    }
  }
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      let s = 0;
      for (let v = 0; v < 8; v++) s += C(v) * tmp[v * 8 + x] * COS[v][y];
      output[y * 8 + x] = 0.25 * s;
    }
  }
}

/** ZigZag 扫描顺序：zigzag 序号 -> 自然行优先序号 */
export const ZIGZAG: number[] = (() => {
  const order: number[] = [];
  for (let s = 0; s < 15; s++) {
    if (s % 2 === 0) {
      for (let i = Math.min(s, 7); i >= Math.max(0, s - 7); i--) order.push(i * 8 + (s - i));
    } else {
      for (let i = Math.max(0, s - 7); i <= Math.min(s, 7); i++) order.push(i * 8 + (s - i));
    }
  }
  return order;
})();

/** JPEG 标准亮度量化表 */
export const STD_LUMA_Q = [
  16, 11, 10, 16, 24, 40, 51, 61,
  12, 12, 14, 19, 26, 58, 60, 55,
  14, 13, 16, 24, 40, 57, 69, 56,
  14, 17, 22, 29, 51, 87, 80, 62,
  18, 22, 37, 56, 68, 109, 103, 77,
  24, 35, 55, 64, 81, 104, 113, 92,
  49, 64, 78, 87, 103, 121, 120, 101,
  72, 92, 95, 98, 112, 100, 103, 99,
];

/** JPEG 标准色度量化表 */
export const STD_CHROMA_Q = [
  17, 18, 24, 47, 99, 99, 99, 99,
  18, 21, 26, 66, 99, 99, 99, 99,
  24, 26, 56, 99, 99, 99, 99, 99,
  47, 66, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99,
];

/** 按质量档（1-100，本系统用 30-95）缩放量化表，JPEG 经典公式 */
export function scaleQuantTable(base: number[], quality: number): Uint16Array {
  const q = Math.max(1, Math.min(100, Math.round(quality)));
  const scale = q < 50 ? 5000 / q : 200 - q * 2;
  const out = new Uint16Array(64);
  for (let i = 0; i < 64; i++) {
    let v = Math.floor((base[i] * scale + 50) / 100);
    if (v < 1) v = 1;
    if (v > 255) v = 255;
    out[i] = v;
  }
  return out;
}
