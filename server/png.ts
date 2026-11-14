/**
 * 极简 PNG 编码器（仅用于生成演示照片，避免依赖 canvas/sharp）。
 * 生成带噪声的混凝土质感 + 裂缝线条的合成图，供报告附录与前端展示。
 */
import zlib from 'node:zlib';

function crc32(buf: Buffer): number {
  const table = crcTable();
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

let tableCache: Uint32Array | null = null;
function crcTable(): Uint32Array {
  if (tableCache) return tableCache;
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  tableCache = t;
  return t;
}

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

export function encodePng(width: number, height: number, rgb: Uint8Array): Buffer {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 3 + 1)] = 0;
    for (let x = 0; x < width * 3; x++) raw[y * (width * 3 + 1) + 1 + x] = rgb[y * width * 3 + x];
  }
  const idat = zlib.deflateSync(raw, { level: 6 });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** 确定性伪随机 */
function rand(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export interface PhotoOptions {
  seed: number;
  width?: number;
  height?: number;
  /** 裂缝走向（像素坐标折线） */
  crack?: 'horizontal' | 'vertical' | 'diagonal' | 'none';
  /** 脱空：画一片深色楔形阴影 */
  voidPatch?: boolean;
  /** 渗水：画水渍与析白 */
  seepage?: boolean;
}

export function synthPhoto(opts: PhotoOptions): Buffer {
  const w = opts.width ?? 800;
  const h = opts.height ?? 600;
  const rnd = rand(opts.seed);
  const buf = new Uint8Array(w * h * 3);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const vign = 1 - 0.45 * Math.pow(Math.hypot((x - w / 2) / w, (y - h / 2) / h) * 1.7, 2);
      const base = 132 + Math.sin(x * 0.02 + y * 0.006) * 9 + Math.sin(y * 0.05) * 4;
      const n = (rnd() - 0.5) * 26;
      const v = Math.max(0, Math.min(255, (base + n) * vign));
      const i = (y * w + x) * 3;
      buf[i] = v * 1.02;
      buf[i + 1] = v * 0.99;
      buf[i + 2] = v * 0.94;
    }
  }
  // 模板拼缝 / 纹理线
  for (let k = 0; k < 5; k++) {
    const yy = h * (0.18 + k * 0.16);
    for (let x = 0; x < w; x++) {
      const y = Math.floor(yy + Math.sin(x * 0.01 + k) * 6);
      const i = (y * w + x) * 3;
      for (let c = 0; c < 3; c++) buf[i + c] *= 0.92;
    }
  }

  const strokeCrack = (pts: [number, number][], width: number, dark: number) => {
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0));
      for (let s = 0; s < steps; s++) {
        const t = s / Math.max(1, steps);
        const cx = x0 + (x1 - x0) * t;
        const cy = y0 + (y1 - y0) * t;
        for (let dx = -width; dx <= width; dx++) {
          for (let dy = -width; dy <= width; dy++) {
            if (dx * dx + dy * dy > width * width) continue;
            const px = Math.round(cx + dx);
            const py = Math.round(cy + dy);
            if (px < 0 || py < 0 || px >= w || py >= h) continue;
            const i = (py * w + px) * 3;
            const f = dark + (rnd() - 0.5) * 0.08;
            buf[i] *= f;
            buf[i + 1] *= f;
            buf[i + 2] *= f;
          }
        }
      }
    }
  };

  if (opts.crack && opts.crack !== 'none') {
    const pts: [number, number][] = [];
    const n = 26;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const jitter = (rnd() - 0.5) * 8;
      if (opts.crack === 'horizontal') pts.push([w * (0.08 + 0.84 * t), h * 0.5 + jitter + Math.sin(t * 8) * 6]);
      else if (opts.crack === 'vertical') pts.push([w * 0.5 + jitter, h * (0.08 + 0.84 * t)]);
      else pts.push([w * (0.08 + 0.84 * t), h * (0.18 + 0.62 * t) + jitter]);
    }
    strokeCrack(pts, 3, 0.24);
    strokeCrack(pts.map(([x, y]) => [x, y + 2] as [number, number]), 1, 0.5);
  }

  if (opts.voidPatch) {
    const cx = w * 0.35;
    const cy = h * 0.58;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const d = Math.hypot((x - cx) / (w * 0.42), (y - cy) / (h * 0.07));
        if (d < 1) {
          const i = (y * w + x) * 3;
          const f = 0.5 + d * 0.18;
          buf[i] *= f;
          buf[i + 1] *= f;
          buf[i + 2] *= f * 1.04;
        }
      }
    }
  }
  if (opts.seepage) {
    // 水渍：沿水平带状的深浅斑块
    const cy = h * 0.62;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const band = Math.exp(-Math.pow((y - cy - Math.sin(x * 0.008) * 18) / (h * 0.09), 2));
        const streak = 0.5 + 0.5 * Math.sin(x * 0.03 + y * 0.02);
        if (band * streak > 0.55) {
          const i = (y * w + x) * 3;
          const f = 0.72 - 0.12 * band;
          buf[i] *= f * 0.98;
          buf[i + 1] *= f;
          buf[i + 2] *= f * 1.12;
        }
      }
    }
    // 析白/锈迹：白斑与浅褐色斑点
    for (let k = 0; k < 220; k++) {
      const cx = w * (0.1 + rnd() * 0.8);
      const cyy = cy + (rnd() - 0.5) * h * 0.22;
      const r = 1 + rnd() * 4;
      const white = rnd() > 0.4;
      for (let dy = -6; dy <= 6; dy++) {
        for (let dx = -6; dx <= 6; dx++) {
          if (dx * dx + dy * dy > r * r) continue;
          const px = Math.round(cx + dx);
          const py = Math.round(cyy + dy);
          if (px < 0 || py < 0 || px >= w || py >= h) continue;
          const i = (py * w + px) * 3;
          if (white) {
            buf[i] = Math.min(255, buf[i] * 1.35 + 20);
            buf[i + 1] = Math.min(255, buf[i + 1] * 1.35 + 18);
            buf[i + 2] = Math.min(255, buf[i + 2] * 1.3 + 12);
          } else {
            buf[i] = Math.min(255, buf[i] * 1.05 + 16);
            buf[i + 1] *= 0.82;
            buf[i + 2] *= 0.7;
          }
        }
      }
    }
  }
  return encodePng(w, h, buf);
}
