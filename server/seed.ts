/**
 * 生成演示数据：三次历史巡检 + 本次定检的病害记录（含跨巡检可归并的历史）。
 * 运行：npm run seed
 */
import { DEFAULT_CONFIG } from '../src/core/bridgeModel';
import { makeDefectCode, measureVolumeDefect } from '../src/core/annotation';
import { gradeDefect } from '../src/core/annotation';
import { buildBridge } from '../src/core/bridgeModel';
import { deckElevationAt, girderBottomAt } from '../src/core/bridgeModel';
import type { CrackGeometry, Defect, Inspection, Vec3 } from '../src/core/types';
import fs from 'node:fs';
import path from 'node:path';
import { ensureDirs, paths, saveState, type ProjectState } from './store';
import { synthPhoto } from './png';

const { bridge } = buildBridge(DEFAULT_CONFIG);
const comp = (id: string) => bridge.components.find((c) => c.id === id)!;

/** 在构件表面生成一条带轻微折转的裂缝路径 */
function crackOnGirder(
  span: number,
  localT: number,
  offset: number,
  lengthM: number,
  angleDeg: number,
  drop = 0,
): CrackGeometry {
  const c = comp(`span-${span}-girder`);
  const x0 = c.x0 + (c.x1 - c.x0) * localT - lengthM / 2;
  const y = girderBottomAt(DEFAULT_CONFIG, x0) + drop;
  const ang = (angleDeg * Math.PI) / 180;
  const p0: Vec3 = [x0, y, offset];
  const p1: Vec3 = [x0 + lengthM * Math.cos(ang), y + lengthM * Math.sin(ang) * 0.08, offset + lengthM * Math.sin(ang)];
  const mid: Vec3 = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 + 0.004, (p0[2] + p1[2]) / 2];
  const path = [p0, mid, p1];
  const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]) * 1000;
  return {
    kind: 'crack',
    endpoints: [p0, p1],
    path,
    normal: [0, 0, offset < 0 ? -1 : 1],
    lengthMm: len,
    azimuthDeg: angleDeg,
    orientation: angleDeg < 20 ? 'longitudinal' : angleDeg > 70 ? 'transverse' : 'diagonal',
    widthMm: 0.2,
    widthAt: 0.5,
    penetrated: false,
  };
}

function crackOnDeck(
  span: number,
  localT: number,
  offset: number,
  lengthM: number,
  angleDeg: number,
): CrackGeometry {
  const c = comp(`span-${span}-deck`);
  const x0 = c.x0 + (c.x1 - c.x0) * localT;
  const y = deckElevationAt(DEFAULT_CONFIG, x0) + 0.002;
  const ang = (angleDeg * Math.PI) / 180;
  const p0: Vec3 = [x0, y, offset];
  const p1: Vec3 = [x0 + lengthM * Math.cos(ang), deckElevationAt(DEFAULT_CONFIG, x0 + lengthM * Math.cos(ang)) + 0.002, offset + lengthM * Math.sin(ang)];
  return {
    kind: 'crack',
    endpoints: [p0, p1],
    path: [p0, p1],
    normal: [0, 1, 0],
    lengthMm: lengthM * 1000,
    azimuthDeg: angleDeg,
    orientation: angleDeg < 20 ? 'longitudinal' : angleDeg > 70 ? 'transverse' : 'diagonal',
    widthMm: 0.2,
    widthAt: 0.5,
    penetrated: false,
  };
}

function crackOnPier(
  support: number,
  offsetZ: number,
  heightT: number,
  lengthM: number,
): CrackGeometry {
  const c = comp(`support-${support}-pier`);
  const y0 = 0.6 + (DEFAULT_CONFIG.pierHeight - 0.6) * heightT;
  const p0: Vec3 = [support * 30 + 0.86, y0, offsetZ];
  const p1: Vec3 = [support * 30 + 0.86, y0 + lengthM, offsetZ + 0.03];
  return {
    kind: 'crack',
    endpoints: [p0, p1],
    path: [p0, p1],
    normal: [1, 0, 0],
    lengthMm: lengthM * 1000,
    azimuthDeg: 85,
    orientation: 'transverse',
    widthMm: 0.2,
    widthAt: 0.5,
    penetrated: false,
  };
}

interface SeedDefect {
  componentId: string;
  type: Defect['type'];
  chainage: number;
  offset: number;
  elevation: number;
  geometry: CrackGeometry | ReturnType<typeof measureVolumeDefect>['geometry'];
  widthMm?: number;
  extra?: Partial<Defect>;
  photos?: { caption: string }[];
  justification?: string;
  description?: string;
}

function mk(
  inspId: string,
  idx: number,
  seed: SeedDefect,
  allThisInspection: Defect[],
  inspDate: string,
): Defect {
  const c = comp(seed.componentId);
  const g = seed.geometry;
  const width = g.kind === 'crack' ? g.widthMm : undefined;
  const graded = gradeDefect({
    type: seed.type,
    widthMm: width,
    lengthMm: g.kind === 'crack' ? g.lengthMm : Math.sqrt(g.areaM2) * 1000,
    penetrated: g.kind === 'crack' ? g.penetrated : undefined,
    depthMm: g.kind === 'volume' ? g.depthMm : undefined,
    voidRatio: g.kind === 'volume' ? g.voidRatio : undefined,
    componentType: c.type,
  });
  return {
    id: `${inspId}-d${String(idx).padStart(2, '0')}`,
    bridgeId: DEFAULT_CONFIG.id,
    inspectionId: inspId,
    componentId: seed.componentId,
    type: seed.type,
    code: makeDefectCode(allThisInspection, seed.type, inspDate, seed.componentId),
    geometry: g,
    chainage: seed.chainage,
    offset: seed.offset,
    elevation: seed.elevation,
    grade: graded.grade,
    severity: graded.severity,
    description: seed.description ?? '',
    justification: seed.justification ?? '',
    photos: (seed.photos ?? []).map((p, i) => ({
      id: `${inspId}-d${idx}-p${i}`,
      url: `/uploads/seed-${inspId}-${idx}-${i}.png`,
      caption: p.caption,
    })),
    createdAt: new Date(`${inspId.slice(0, 4)}-05-01`).toISOString(),
    createdBy: '演示数据',
    updatedAt: new Date().toISOString(),
    ...seed.extra,
  };
}

const inspections: Inspection[] = [
  {
    id: 'insp-2022',
    bridgeId: DEFAULT_CONFIG.id,
    date: '2022-05-12',
    title: '2022 年定期检查',
    inspector: '李工 · 王工',
    weather: '晴，22 ℃',
    equipment: '无人机 M300 + 手持裂缝观测仪',
    note: '首次建立三维病害档案。',
    createdAt: '2022-05-12T02:00:00.000Z',
  },
  {
    id: 'insp-2023',
    bridgeId: DEFAULT_CONFIG.id,
    date: '2023-05-18',
    title: '2023 年定期检查',
    inspector: '李工 · 赵工',
    weather: '多云，19 ℃',
    equipment: '无人机 M350 + 裂缝宽度仪',
    note: '对 2022 年重点裂缝复测。',
    createdAt: '2023-05-18T02:00:00.000Z',
  },
  {
    id: 'insp-2024',
    bridgeId: DEFAULT_CONFIG.id,
    date: '2024-06-03',
    title: '2024 年定期检查',
    inspector: '王工 · 陈工',
    weather: '小雨后转晴，24 ℃',
    equipment: '无人机 + 三维激光扫描',
    note: '增加箱梁内部检查。',
    createdAt: '2024-06-03T02:00:00.000Z',
  },
  {
    id: 'insp-2025',
    bridgeId: DEFAULT_CONFIG.id,
    date: '2025-04-22',
    title: '2025 年汛前定期检查',
    inspector: '李工 · 陈工',
    weather: '晴，26 ℃',
    equipment: '无人机 M350 + 手持裂缝仪 + 内窥镜',
    note: '汛前专项，重点复核支座与铰缝。',
    createdAt: '2025-04-22T02:00:00.000Z',
  },
];

function yearInsp(y: string) {
  return `insp-${y}`;
}


const all: Defect[] = [];

function push(inspId: string, seed: SeedDefect) {
  const thisInsp = all.filter((d) => d.inspectionId === inspId);
  const inspDate = inspections.find((i) => i.id === inspId)?.date ?? '2025-04-22';
  // 编号在年份内全局唯一：用已生成的全部病害做序号基准
  all.push(mk(inspId, thisInsp.length + 1, seed, all, inspDate));
}

// ---------------- 2022
push(yearInsp('2022'), {
  componentId: 'span-1-girder',
  type: 'crack',
  chainage: DEFAULT_CONFIG.stationStart + 12.4,
  offset: -2.1,
  elevation: girderBottomAt(DEFAULT_CONFIG, 12.4) + 0.05,
  geometry: { ...crackOnGirder(1, 0.41, -2.1, 1.2, 8), widthMm: 0.16 },
  description: '第 1 跨箱梁底板纵向裂缝，位于左肋附近。',
});
push(yearInsp('2022'), {
  componentId: 'span-2-deck',
  type: 'crack',
  chainage: DEFAULT_CONFIG.stationStart + 44.0,
  offset: 1.4,
  elevation: deckElevationAt(DEFAULT_CONFIG, 44),
  geometry: { ...crackOnDeck(2, 0.47, 1.4, 2.4, 78), widthMm: 0.18 },
  description: '桥面铺装横向裂缝，跨中附近。',
});
push(yearInsp('2022'), {
  componentId: 'support-1-bearing-0',
  type: 'bearing_void',
  chainage: DEFAULT_CONFIG.stationStart + 30,
  offset: -4.2,
  elevation: girderBottomAt(DEFAULT_CONFIG, 30) - 0.12,
  geometry: measureVolumeDefect({
    a: [29.94, girderBottomAt(DEFAULT_CONFIG, 30) - 0.12, -4.3],
    b: [30.17, girderBottomAt(DEFAULT_CONFIG, 30) - 0.12, -4.1],
    depthMm: 1.5,
    referenceAreaM2: 0.26,
  }).geometry,
  description: '1# 墩左外侧支座边缘轻微脱空。',
});
push(yearInsp('2022'), {
  componentId: 'support-2-pier',
  type: 'crack',
  chainage: DEFAULT_CONFIG.stationStart + 60,
  offset: -3.0,
  elevation: 3.4,
  geometry: { ...crackOnPier(2, -3.0, 0.35, 0.9), widthMm: 0.12 },
  description: '2# 墩柱左侧竖向裂缝，长约 0.9 m。',
});

// ---------------- 2023
push(yearInsp('2023'), {
  componentId: 'span-1-girder',
  type: 'crack',
  chainage: DEFAULT_CONFIG.stationStart + 12.5,
  offset: -2.05,
  elevation: girderBottomAt(DEFAULT_CONFIG, 12.5) + 0.05,
  geometry: { ...crackOnGirder(1, 0.415, -2.05, 1.5, 8), widthMm: 0.2 },
  description: '第 1 跨箱梁底板纵向裂缝，长度较上期增加。',
});
push(yearInsp('2023'), {
  componentId: 'support-1-bearing-0',
  type: 'bearing_void',
  chainage: DEFAULT_CONFIG.stationStart + 30,
  offset: -4.2,
  elevation: girderBottomAt(DEFAULT_CONFIG, 30) - 0.12,
  geometry: measureVolumeDefect({
    a: [29.90, girderBottomAt(DEFAULT_CONFIG, 30) - 0.12, -4.32],
    b: [30.18, girderBottomAt(DEFAULT_CONFIG, 30) - 0.12, -4.08],
    depthMm: 2.4,
    referenceAreaM2: 0.26,
  }).geometry,
  description: '1# 墩左外侧支座脱空范围扩大。',
});
push(yearInsp('2023'), {
  componentId: 'span-3-girder',
  type: 'joint_seepage',
  chainage: DEFAULT_CONFIG.stationStart + 73.0,
  offset: 3.8,
  elevation: girderBottomAt(DEFAULT_CONFIG, 73) + 0.9,
  geometry: measureVolumeDefect({
    a: [71.6, girderBottomAt(DEFAULT_CONFIG, 71.6) + 0.9, 3.8],
    b: [74.4, girderBottomAt(DEFAULT_CONFIG, 74.4) + 0.9, 3.8],
    depthMm: 15,
  }).geometry,
  description: '第 3 跨右幅铰缝渗水，湿渍沿纵向分布。',
});

// ---------------- 2024
push(yearInsp('2024'), {
  componentId: 'span-1-girder',
  type: 'crack',
  chainage: DEFAULT_CONFIG.stationStart + 12.55,
  offset: -2.0,
  elevation: girderBottomAt(DEFAULT_CONFIG, 12.55) + 0.05,
  geometry: { ...crackOnGirder(1, 0.418, -2.0, 1.9, 9), widthMm: 0.24, penetrated: false },
  description: '第 1 跨箱梁底板纵向裂缝，持续扩展。',
});
push(yearInsp('2024'), {
  componentId: 'span-2-deck',
  type: 'crack',
  chainage: DEFAULT_CONFIG.stationStart + 44.1,
  offset: 1.5,
  elevation: deckElevationAt(DEFAULT_CONFIG, 44.1),
  geometry: { ...crackOnDeck(2, 0.47, 1.5, 3.1, 80), widthMm: 0.26 },
  description: '桥面铺装横向裂缝，伴随轻微网裂。',
});
push(yearInsp('2024'), {
  componentId: 'support-1-bearing-0',
  type: 'bearing_void',
  chainage: DEFAULT_CONFIG.stationStart + 30,
  offset: -4.2,
  elevation: girderBottomAt(DEFAULT_CONFIG, 30) - 0.12,
  geometry: measureVolumeDefect({
    a: [29.86, girderBottomAt(DEFAULT_CONFIG, 30) - 0.12, -4.35],
    b: [30.19, girderBottomAt(DEFAULT_CONFIG, 30) - 0.12, -4.05],
    depthMm: 3.6,
    referenceAreaM2: 0.26,
  }).geometry,
  description: '1# 墩左外侧支座脱空，深度增加。',
});
push(yearInsp('2024'), {
  componentId: 'span-3-girder',
  type: 'joint_seepage',
  chainage: DEFAULT_CONFIG.stationStart + 73.1,
  offset: 3.8,
  elevation: girderBottomAt(DEFAULT_CONFIG, 73.1) + 0.9,
  geometry: measureVolumeDefect({
    a: [71.2, girderBottomAt(DEFAULT_CONFIG, 71.2) + 0.9, 3.8],
    b: [74.9, girderBottomAt(DEFAULT_CONFIG, 74.9) + 0.9, 3.8],
    depthMm: 22,
  }).geometry,
  description: '第 3 跨铰缝渗水范围扩大，出现白色析出物。',
});

// ---------------- 2025（本次，当前激活）
push('insp-2025', {
  componentId: 'span-1-girder',
  type: 'crack',
  chainage: DEFAULT_CONFIG.stationStart + 12.6,
  offset: -2.0,
  elevation: girderBottomAt(DEFAULT_CONFIG, 12.6) + 0.05,
  geometry: { ...crackOnGirder(1, 0.42, -2.0, 2.4, 9), widthMm: 0.34, penetrated: true },
  description: '第 1 跨箱梁底板纵向主裂缝，沿底板贯通至腹板根部。',
  justification:
    '实测最大宽度 0.34 mm，超 0.3 mm 严重限值；裂缝沿底板纵向贯通并延伸至腹板根部，位于跨中受拉主筋区，按 JTG/T H21-2011 承重构件裂缝条款判定为 4 级。建议立即灌浆并粘贴碳纤维布补强。',
  photos: [{ caption: '裂缝跨中段特写（0.34 mm）' }, { caption: '裂缝与腹板根部交汇处' }],
});
push('insp-2025', {
  componentId: 'span-2-deck',
  type: 'crack',
  chainage: DEFAULT_CONFIG.stationStart + 44.2,
  offset: 1.55,
  elevation: deckElevationAt(DEFAULT_CONFIG, 44.2),
  geometry: { ...crackOnDeck(2, 0.47, 1.55, 3.8, 82), widthMm: 0.31 },
  description: '桥面铺装横向裂缝，长度与宽度均较上期增长。',
  justification:
    '裂缝宽度 0.31 mm，超 0.3 mm；长度由 3.1 m 扩展至 3.8 m，贯通半幅桥面，判定 4 级，需凿除重铺并检查防水层。',
  photos: [{ caption: '桥面横向裂缝特写' }],
});
push('insp-2025', {
  componentId: 'support-1-bearing-0',
  type: 'bearing_void',
  chainage: DEFAULT_CONFIG.stationStart + 30,
  offset: -4.2,
  elevation: girderBottomAt(DEFAULT_CONFIG, 30) - 0.12,
  geometry: measureVolumeDefect({
    a: [29.84, girderBottomAt(DEFAULT_CONFIG, 30) - 0.12, -4.38],
    b: [30.23, girderBottomAt(DEFAULT_CONFIG, 30) - 0.12, -4.02],
    depthMm: 6.2,
    referenceAreaM2: 0.26,
  }).geometry,
  description: '1# 墩左外侧支座脱空贯通至支座边缘，可插入塞尺 6 mm。',
  justification:
    '脱空深度 6.2 mm > 5 mm，脱空面积占支承面约 35%，支座局部承压失效风险显著，判定 4 级，汛前必须顶升复位。',
  photos: [{ caption: '支座脱空塞尺检测' }],
});
push('insp-2025', {
  componentId: 'span-3-girder',
  type: 'joint_seepage',
  chainage: DEFAULT_CONFIG.stationStart + 73.2,
  offset: 3.8,
  elevation: girderBottomAt(DEFAULT_CONFIG, 73.2) + 0.9,
  geometry: measureVolumeDefect({
    a: [70.8, girderBottomAt(DEFAULT_CONFIG, 70.8) + 0.9, 3.8],
    b: [75.5, girderBottomAt(DEFAULT_CONFIG, 75.5) + 0.9, 3.8],
    depthMm: 28,
  }).geometry,
  description: '第 3 跨铰缝渗水呈线状贯通，腹板内侧析白并有轻微锈迹。',
  justification:
    '渗水影响长度 4.7 m > 1.5 m，沿铰缝呈线状贯通并出现锈迹，判定 4 级，需深部注浆并恢复防水层。',
  photos: [{ caption: '铰缝析白与锈迹特写' }],
});
// 2025 新增病害
push('insp-2025', {
  componentId: 'span-2-girder',
  type: 'crack',
  chainage: DEFAULT_CONFIG.stationStart + 52.8,
  offset: 2.6,
  elevation: girderBottomAt(DEFAULT_CONFIG, 52.8) + 0.1,
  geometry: { ...crackOnGirder(2, 0.76, 2.6, 0.85, 62), widthMm: 0.22 },
  description: '第 2 跨箱梁腹板斜向裂缝，新增。',
});
push('insp-2025', {
  componentId: 'support-2-bearing-3',
  type: 'bearing_void',
  chainage: DEFAULT_CONFIG.stationStart + 60,
  offset: 4.2,
  elevation: girderBottomAt(DEFAULT_CONFIG, 60) - 0.12,
  geometry: measureVolumeDefect({
    a: [59.86, girderBottomAt(DEFAULT_CONFIG, 60) - 0.12, 4.08],
    b: [60.14, girderBottomAt(DEFAULT_CONFIG, 60) - 0.12, 4.28],
    depthMm: 1.8,
    referenceAreaM2: 0.26,
  }).geometry,
  description: '2# 墩右外侧支座轻微脱空，新增。',
});
push('insp-2025', {
  componentId: 'span-1-railing-left',
  type: 'crack',
  chainage: DEFAULT_CONFIG.stationStart + 18.6,
  offset: -5.84,
  elevation: deckElevationAt(DEFAULT_CONFIG, 18.6) + 0.72,
  geometry: {
    kind: 'crack',
    endpoints: [
      [18.5, deckElevationAt(DEFAULT_CONFIG, 18.5) + 0.42, -5.84],
      [18.6, deckElevationAt(DEFAULT_CONFIG, 18.6) + 1.02, -5.84],
    ],
    path: [
      [18.5, deckElevationAt(DEFAULT_CONFIG, 18.5) + 0.42, -5.84],
      [18.6, deckElevationAt(DEFAULT_CONFIG, 18.6) + 1.02, -5.84],
    ],
    normal: [0, 0, -1],
    lengthMm: 604,
    azimuthDeg: 88,
    orientation: 'transverse',
    widthMm: 0.18,
    widthAt: 0.5,
    penetrated: false,
  },
  description: '左侧护栏立柱焊缝开裂。',
});
push('insp-2025', {
  componentId: 'support-2-pier',
  type: 'crack',
  chainage: DEFAULT_CONFIG.stationStart + 60,
  offset: -3.0,
  elevation: 3.6,
  geometry: { ...crackOnPier(2, -3.0, 0.37, 1.25), widthMm: 0.21 },
  description: '2# 墩柱竖向裂缝长度增加。',
});

const state: ProjectState = {
  bridgeConfig: DEFAULT_CONFIG,
  inspections,
  activeInspectionId: 'insp-2025',
  defects: all,
  confirmations: [],
  reportMeta: {
    reportNo: `QLDJ-2025-${DEFAULT_CONFIG.id.slice(0, 2).toUpperCase()}-014`,
    preparedBy: '李工',
    reviewedBy: '王工',
    approvedBy: '张总工',
    organization: '市政桥梁检测所',
    date: '2025-05-06',
  },
  updatedAt: new Date().toISOString(),
};

ensureDirs();

// 生成演示照片（合成 PNG，无需外部图片）
const photoStyle: Record<string, { crack?: 'horizontal' | 'vertical' | 'diagonal'; voidPatch?: boolean; seepage?: boolean }> = {
  crack: { crack: 'diagonal' },
  bearing_void: { voidPatch: true },
  joint_seepage: { seepage: true },
};
let seedCounter = 7;
for (const d of all) {
  for (const p of d.photos) {
    const file = path.join(paths.UPLOAD_DIR, path.basename(p.url));
    const style = photoStyle[d.type] ?? {};
    const png = synthPhoto({ seed: seedCounter++, width: 800, height: 600, ...style });
    fs.writeFileSync(file, png);
  }
}
for (const f of fs.readdirSync(paths.UPLOAD_DIR)) {
  if (f.startsWith('seed-') && f.endsWith('.svg')) fs.unlinkSync(path.join(paths.UPLOAD_DIR, f));
}

saveState(state);
