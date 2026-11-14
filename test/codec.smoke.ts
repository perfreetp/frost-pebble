// 编解码器冒烟测试：node 环境下运行（esbuild 打包后执行）
// 验证：压缩-解码往返、质量档与体积单调关系、PSNR 合理性、可压缩性分析
import { compressImage, decodeImage, analyzeImage } from '../src/codec/codec';

// Node 没有 ImageData，最小 polyfill
(globalThis as any).ImageData = class ImageData {
  data: Uint8ClampedArray;
  constructor(public width: number, public height: number) {
    this.data = new Uint8ClampedArray(width * height * 4);
  }
};

function makeGradient(w: number, h: number): ImageData {
  const img = new ImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      img.data[i] = (x / w) * 255;
      img.data[i + 1] = (y / h) * 255;
      img.data[i + 2] = ((x + y) / (w + h)) * 255;
      img.data[i + 3] = 255;
    }
  }
  return img;
}

function makeNoise(w: number, h: number): ImageData {
  const img = new ImageData(w, h);
  let seed = 7;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let i = 0; i < img.data.length; i += 4) {
    img.data[i] = rnd() * 255;
    img.data[i + 1] = rnd() * 255;
    img.data[i + 2] = rnd() * 255;
    img.data[i + 3] = 255;
  }
  return img;
}

function makeFlat(w: number, h: number): ImageData {
  const img = new ImageData(w, h);
  for (let i = 0; i < img.data.length; i += 4) {
    img.data[i] = 200; img.data[i + 1] = 200; img.data[i + 2] = 190; img.data[i + 3] = 255;
  }
  return img;
}

let failed = 0;
function check(name: string, cond: boolean, extra = ''): void {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  (' + extra + ')' : ''}`);
  if (!cond) failed++;
}

const grad = makeGradient(160, 128);
const r30 = compressImage(grad, 30);
const r60 = compressImage(grad, 60);
const r95 = compressImage(grad, 95);

console.log(`渐变图 160x128: Q30=${r30.bytes.length}B Q60=${r60.bytes.length}B Q95=${r95.bytes.length}B`);
check('体积随质量档单调递增', r30.bytes.length < r60.bytes.length && r60.bytes.length < r95.bytes.length);
check('Q30 有明显压缩率', r30.bytes.length < 160 * 128 * 3 / 10, `ratio=${(160 * 128 * 3 / r30.bytes.length).toFixed(1)}:1`);
check('渐变图 Q60 PSNR 合理', r60.psnr > 28 && r60.psnr < 55, `psnr=${r60.psnr.toFixed(2)}dB`);
check('Q95 失真小于 Q30', r95.mse < r30.mse);

// 独立解码器往返：从比特流解码应与内部解码一致
const redecoded = decodeImage(r60.bytes);
let maxDiff = 0;
for (let i = 0; i < redecoded.data.length; i++) {
  maxDiff = Math.max(maxDiff, Math.abs(redecoded.data[i] - r60.decompressed.data[i]));
}
check('比特流可独立解码且与编码端重建一致', maxDiff === 0, `maxDiff=${maxDiff}`);
check('解码尺寸正确', redecoded.width === 160 && redecoded.height === 128);

// 非 8 对齐尺寸
const odd = makeGradient(103, 77);
const rOdd = compressImage(odd, 80);
check('非对齐尺寸往返尺寸正确', rOdd.decompressed.width === 103 && rOdd.decompressed.height === 77);

// 噪声图：体积应远大于渐变图，且被标记细节过碎
const noise = makeNoise(160, 128);
const rNoise = compressImage(noise, 60);
const aNoise = analyzeImage(noise);
console.log(`噪声图 Q60=${rNoise.bytes.length}B（渐变图 ${r60.bytes.length}B）busy=${(aNoise.busyRatio * 100).toFixed(0)}%`);
check('噪声图体积显著大于渐变图', rNoise.bytes.length > r60.bytes.length * 2);
check('噪声图被标记为细节过碎', aNoise.warnings.some((w) => w.includes('细节过碎')));

// 纯色图：体积极小，被标记大面积纯色
const flat = makeFlat(160, 128);
const rFlat = compressImage(flat, 60);
const aFlat = analyzeImage(flat);
console.log(`纯色图 Q60=${rFlat.bytes.length}B flat=${(aFlat.flatRatio * 100).toFixed(0)}%`);
check('纯色图体积极小', rFlat.bytes.length < 600);
check('纯色图被标记为不建议压缩', aFlat.warnings.some((w) => w.includes('纯色')));

console.log(failed === 0 ? '\n全部通过' : `\n${failed} 项失败`);
process.exit(failed === 0 ? 0 : 1);
