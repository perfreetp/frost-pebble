// 内置模拟县域:100km x 100km,8 个乡镇,网格 5km
export const COUNTY_SIZE = 100;
export const GRID_SIZE = 5;

// 乡镇界多边形(闭合环,首尾相同)
export const TOWNSHIPS = [
  { name: '城关镇', ring: [[30,55],[55,55],[55,75],[45,80],[30,75],[30,55]] },
  { name: '东河镇', ring: [[55,55],[80,55],[80,75],[55,75],[55,55]] },
  { name: '西岭乡', ring: [[10,55],[30,55],[30,75],[10,70],[10,55]] },
  { name: '南坪镇', ring: [[30,30],[55,30],[55,55],[30,55],[30,30]] },
  { name: '北原乡', ring: [[30,75],[45,80],[55,75],[80,75],[80,95],[30,95],[30,75]] },
  { name: '临江县', ring: [[55,30],[80,30],[80,55],[55,55],[55,30]] },
  { name: '石门乡', ring: [[10,30],[30,30],[30,55],[10,55],[10,30]] },
  { name: '云溪乡', ring: [[10,70],[30,75],[30,95],[10,95],[10,70]] }
];

export const TOWNSHIP_NAMES = TOWNSHIPS.map((t) => t.name);

// 音系特征候选(用于检索过滤)
export const PHONEME_FEATURES = [
  '古全浊声母清化', '入声保留', '鼻音韵尾合并', '尖团合流',
  '儿化韵丰富', '平翘舌不分', '疑母读零声母', '阳上调独立'
];

// 高程场:若干高斯山丘叠加(确定性,无需随机)
const HILLS = [
  { x: 20, y: 82, h: 260, s: 16 },
  { x: 68, y: 70, h: 320, s: 14 },
  { x: 45, y: 40, h: 140, s: 20 },
  { x: 85, y: 30, h: 220, s: 12 },
  { x: 15, y: 20, h: 180, s: 13 },
  { x: 60, y: 88, h: 200, s: 15 }
];

export function heightAt(x, y) {
  let h = 12;
  for (const k of HILLS) {
    const dx = x - k.x, dy = y - k.y;
    h += k.h * Math.exp(-(dx * dx + dy * dy) / (2 * k.s * k.s));
  }
  // 河谷:沿 y=55 一线下切
  h -= 30 * Math.exp(-Math.pow(y - 55, 2) / 50);
  return Math.max(2, h);
}

// 示例发音人(首次启动时播种)
export const SAMPLE_INFORMANTS = [
  { code: 'F2023-001', name: '王守田', age: 68, township: '城关镇', phonemeCount: 312, year: 2023, features: ['入声保留', '尖团合流'], recordings: [{ name: '字表录音01', note: '声母字表' }, { name: '词汇录音01', note: '日常词汇' }] },
  { code: 'F2023-002', name: '李秀兰', age: 72, township: '东河镇', phonemeCount: 298, year: 2023, features: ['古全浊声母清化'], recordings: [{ name: '字表录音01', note: '' }] },
  { code: 'F2024-003', name: '张建军', age: 61, township: '南坪镇', phonemeCount: 335, year: 2024, features: ['鼻音韵尾合并', '平翘舌不分'], recordings: [{ name: '句法录音01', note: '自然语流' }, { name: '字表录音01', note: '' }] },
  { code: 'F2024-004', name: '陈桂香', age: 75, township: '西岭乡', phonemeCount: 287, year: 2024, features: ['入声保留', '疑母读零声母'], recordings: [{ name: '字表录音01', note: '' }] }
];
