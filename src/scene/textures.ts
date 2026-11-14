import * as THREE from 'three';

/** 简单可复现的伪随机 */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return [c, c.getContext('2d')!];
}

function toTexture(canvas: HTMLCanvasElement, repeat = 1): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** 拉丝不锈钢:竖向拉丝纹 + 粗糙度变化 */
export function brushedSteelMaps(): { map: THREE.CanvasTexture; roughnessMap: THREE.CanvasTexture } {
  const S = 512;
  const [c, ctx] = makeCanvas(S);
  const [cr, ctxR] = makeCanvas(S);
  const rnd = mulberry32(42);
  ctx.fillStyle = '#b8bcc2';
  ctx.fillRect(0, 0, S, S);
  ctxR.fillStyle = '#5a5a5a';
  ctxR.fillRect(0, 0, S, S);
  for (let i = 0; i < 2600; i++) {
    const x = rnd() * S;
    const len = 40 + rnd() * 200;
    const y = rnd() * S;
    const v = 150 + rnd() * 90;
    ctx.strokeStyle = `rgba(${v},${v + 4},${v + 10},${0.12 + rnd() * 0.2})`;
    ctx.lineWidth = rnd() < 0.85 ? 1 : 2;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (rnd() - 0.5) * 3, y + len); ctx.stroke();
    const rv = 60 + rnd() * 90;
    ctxR.strokeStyle = `rgba(${rv},${rv},${rv},0.35)`;
    ctxR.lineWidth = 1;
    ctxR.beginPath(); ctxR.moveTo(x, y); ctxR.lineTo(x, y + len); ctxR.stroke();
  }
  return { map: toTexture(c), roughnessMap: toTexture(cr) };
}

/** 木饰面:山形木纹 */
export function woodMaps(): { map: THREE.CanvasTexture; roughnessMap: THREE.CanvasTexture } {
  const S = 512;
  const [c, ctx] = makeCanvas(S);
  const [cr, ctxR] = makeCanvas(S);
  const rnd = mulberry32(7);
  const img = ctx.createImageData(S, S);
  const imgR = ctxR.createImageData(S, S);
  const rings = 9;
  const phase = rnd() * 100;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      // 竖向木纹:沿 x 的扰动条带
      const wave =
        Math.sin((x / S) * Math.PI * 2 * rings + Math.sin(y / 37) * 1.6 + phase) * 0.5 +
        Math.sin((x / S) * Math.PI * 2 * rings * 2.7 + y / 91) * 0.3 +
        Math.sin(y * 0.9 + x * 0.05) * 0.08;
      const t = 0.5 + wave * 0.5;
      const r = 118 + t * 78;
      const g = 74 + t * 52;
      const b = 42 + t * 30;
      const i = (y * S + x) * 4;
      img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255;
      const rv = 100 + t * 60;
      imgR.data[i] = rv; imgR.data[i + 1] = rv; imgR.data[i + 2] = rv; imgR.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  ctxR.putImageData(imgR, 0, 0);
  return { map: toTexture(c), roughnessMap: toTexture(cr) };
}

/** 岩板:大理石纹 */
export function rockMaps(): { map: THREE.CanvasTexture; roughnessMap: THREE.CanvasTexture } {
  const S = 512;
  const [c, ctx] = makeCanvas(S);
  const [cr, ctxR] = makeCanvas(S);
  const rnd = mulberry32(99);
  // 基色
  const grad = ctx.createLinearGradient(0, 0, S, S);
  grad.addColorStop(0, '#d9d7d2');
  grad.addColorStop(0.5, '#cfccc6');
  grad.addColorStop(1, '#d5d2cc');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);
  // 斑块噪声
  for (let i = 0; i < 260; i++) {
    const x = rnd() * S, y = rnd() * S, r = 8 + rnd() * 46;
    const v = 195 + rnd() * 30;
    const g2 = ctx.createRadialGradient(x, y, 0, x, y, r);
    g2.addColorStop(0, `rgba(${v},${v},${v - 4},0.10)`);
    g2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g2;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  // 纹理筋络
  for (let i = 0; i < 14; i++) {
    let x = rnd() * S, y = rnd() * S;
    ctx.strokeStyle = `rgba(120,118,112,${0.25 + rnd() * 0.3})`;
    ctx.lineWidth = 0.6 + rnd() * 1.4;
    ctx.beginPath(); ctx.moveTo(x, y);
    for (let s = 0; s < 26; s++) {
      x += (rnd() - 0.5) * 60;
      y += (rnd() - 0.5) * 60;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctxR.fillStyle = '#3c3c3c';
  ctxR.fillRect(0, 0, S, S);
  return { map: toTexture(c), roughnessMap: toTexture(cr) };
}
