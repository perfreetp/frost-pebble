// 组件共享样式与工具函数

export const SHARED_CSS = `
  :host { box-sizing: border-box; font-family: "Microsoft YaHei", "PingFang SC", sans-serif; }
  *, *::before, *::after { box-sizing: inherit; }
  .panel { background: #fff; border: 1px solid #e2e6ec; border-radius: 10px; padding: 16px; }
  h2 { font-size: 17px; margin: 0 0 12px; color: #1c2430; }
  h3 { font-size: 14px; margin: 0 0 8px; color: #33404f; }
  label { display: block; font-size: 12px; color: #5a6675; margin-bottom: 3px; }
  input, select, textarea {
    width: 100%; padding: 7px 9px; border: 1px solid #ccd4de; border-radius: 6px;
    font-size: 13px; font-family: inherit; background: #fbfcfe; color: #1c2430;
  }
  input:focus, select:focus { outline: 2px solid #2f6fdd44; border-color: #2f6fdd; }
  button {
    padding: 7px 14px; border: none; border-radius: 6px; font-size: 13px; cursor: pointer;
    background: #2f6fdd; color: #fff; font-family: inherit; transition: background .15s;
  }
  button:hover { background: #255cb8; }
  button.ghost { background: #eef2f7; color: #33404f; }
  button.ghost:hover { background: #dde5ee; }
  button.danger { background: #d84a4a; }
  button.danger:hover { background: #b93a3a; }
  button.ok { background: #2e9e5b; }
  button.ok:hover { background: #24824a; }
  button:disabled { background: #b9c2cd; cursor: not-allowed; }
  .row { display: flex; gap: 10px; }
  .row > * { flex: 1; }
  .badge {
    display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px;
    background: #eef2f7; color: #33404f; margin-right: 4px;
  }
  .badge.warn { background: #fde8e8; color: #b03030; }
  .badge.good { background: #e2f6e9; color: #1e7a41; }
  .badge.info { background: #e3edfd; color: #2456a8; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #edf0f4; }
  th { color: #5a6675; font-weight: 600; font-size: 12px; background: #f7f9fb; }
  .muted { color: #8a94a3; font-size: 12px; }
`;

export function fmtTime(t: number): string {
  const d = new Date(t);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getMonth() + 1}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K, cls?: string, text?: string,
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

/** ImageData -> canvas */
export function imageDataToCanvas(img: ImageData): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  c.getContext('2d')!.putImageData(img, 0, 0);
  return c;
}

/** 生成块效应放大图：中心区域 4 倍最近邻放大 + 8x8 块网格 */
export function makeBlockZoomCanvas(decompressed: ImageData): HTMLCanvasElement {
  const w = decompressed.width;
  const h = decompressed.height;
  const crop = Math.max(64, Math.min(w, h, 256) & ~7); // 对齐到 8
  const ox = Math.floor((w - crop) / 2 / 8) * 8;
  const oy = Math.floor((h - crop) / 2 / 8) * 8;
  const scale = Math.max(2, Math.floor(512 / crop));
  const c = document.createElement('canvas');
  c.width = crop * scale;
  c.height = crop * scale;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  const src = imageDataToCanvas(decompressed);
  ctx.drawImage(src, ox, oy, crop, crop, 0, 0, c.width, c.height);
  // 叠加 8x8 块网格（放大后每格 8*scale 像素）
  ctx.strokeStyle = 'rgba(255,60,60,0.55)';
  ctx.lineWidth = 1;
  const step = 8 * scale;
  for (let x = 0; x <= c.width; x += step) {
    ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, c.height); ctx.stroke();
  }
  for (let y = 0; y <= c.height; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(c.width, y + 0.5); ctx.stroke();
  }
  return c;
}

/** 读取图片文件并限制最长边，返回 ImageData 与 dataURL */
export function loadImageFile(file: File, maxSide = 768): Promise<{ img: ImageData; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      const w = Math.max(8, Math.round(image.width * scale));
      const h = Math.max(8, Math.round(image.height * scale));
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(image, 0, 0, w, h);
      resolve({ img: ctx.getImageData(0, 0, w, h), dataUrl: c.toDataURL('image/png') });
    };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('图片读取失败')); };
    image.src = url;
  });
}

/** 生成一张测试图（渐变 + 纯色块 + 碎细节噪声 + 文字），方便无素材时演示 */
export function makeTestImage(size = 512): ImageData {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#2c5fa8');
  grad.addColorStop(0.5, '#7fc8e8');
  grad.addColorStop(1, '#e8b27f');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  // 纯色区域
  ctx.fillStyle = '#f2f2ee';
  ctx.fillRect(size * 0.55, size * 0.05, size * 0.4, size * 0.35);
  // 圆形与文字
  ctx.fillStyle = '#c8452c';
  ctx.beginPath();
  ctx.arc(size * 0.3, size * 0.35, size * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1c2430';
  ctx.font = `bold ${size / 12}px "Microsoft YaHei"`;
  ctx.fillText('彩印打样 TEST', size * 0.08, size * 0.62);
  // 碎细节噪声区
  const noiseSize = size / 3;
  const noise = ctx.createImageData(noiseSize, noiseSize);
  let seed = 42;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let i = 0; i < noise.data.length; i += 4) {
    const v = Math.floor(rnd() * 255);
    noise.data[i] = v;
    noise.data[i + 1] = 255 - v;
    noise.data[i + 2] = (v * 7) % 255;
    noise.data[i + 3] = 255;
  }
  const tmp = document.createElement('canvas');
  tmp.width = noiseSize;
  tmp.height = noiseSize;
  tmp.getContext('2d')!.putImageData(noise, 0, 0);
  ctx.drawImage(tmp, size * 0.08, size * 0.68);
  // 细条纹
  for (let x = 0; x < size * 0.3; x += 3) {
    ctx.fillStyle = x % 6 === 0 ? '#111' : '#eee';
    ctx.fillRect(size * 0.6 + x, size * 0.55, 1, size * 0.35);
  }
  return ctx.getImageData(0, 0, size, size);
}
