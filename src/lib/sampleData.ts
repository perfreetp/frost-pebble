// 示例采区数据生成：台阶平面、地质分层、等高线、边坡、空区、管线及 8000+ 孔阵列
import type {
  BlastDesign,
  ChargeParams,
  DelayDef,
  LayerState,
  MiningArea,
} from '../types';
import { createArray } from './placement';
import { generateHoles, type PlacementContext } from './placement';
import { uid } from './geometry';

export const DEFAULT_LAYERS: LayerState[] = [
  { id: 'geology', name: '地质分层', visible: true },
  { id: 'contour', name: '等高线', visible: true },
  { id: 'slope', name: '边坡线', visible: true },
  { id: 'void', name: '空区', visible: true },
  { id: 'pipeline', name: '管线标注', visible: true },
  { id: 'hole', name: '炮孔', visible: true },
  { id: 'label', name: '孔号/药量标注', visible: true },
  { id: 'warning', name: '避让提示', visible: true },
];

export const DEFAULT_CHARGE_PARAMS: ChargeParams = {
  diameter: 250,
  defaultDepth: 14,
  inclination: 90,
  chargePerMeter: 9.6, // 乳化炸药，Φ250 孔约 9.6 kg/m
  stemming: 3.5,
  subdrill: 1.0,
};

/** 常用非电雷管段位（ms） */
export const DEFAULT_DELAYS: DelayDef[] = [
  { delay: 1, ms: 0 }, { delay: 2, ms: 25 }, { delay: 3, ms: 50 },
  { delay: 4, ms: 75 }, { delay: 5, ms: 100 }, { delay: 6, ms: 150 },
  { delay: 7, ms: 200 }, { delay: 8, ms: 250 }, { delay: 9, ms: 300 },
  { delay: 10, ms: 350 }, { delay: 11, ms: 400 }, { delay: 12, ms: 450 },
  { delay: 13, ms: 500 }, { delay: 14, ms: 600 }, { delay: 15, ms: 700 },
  { delay: 16, ms: 800 }, { delay: 17, ms: 900 }, { delay: 18, ms: 1000 },
  { delay: 19, ms: 1200 }, { delay: 20, ms: 1400 },
];

export function createSampleArea(): MiningArea {
  return {
    id: uid('area'),
    code: 'CQ-2026-017',
    name: '北采区 1180m 台阶',
    location: '三号露天矿坑北帮',
    createdAt: new Date().toISOString(),
    designer: '张工',
  };
}

export function createSampleDesign(area: MiningArea): BlastDesign {
  // 台阶平面：360m × 300m 矩形（本地坐标系，原点在西南角）
  const benchPolygon = {
    points: [
      { x: 0, y: 0 }, { x: 360, y: 0 },
      { x: 360, y: 300 }, { x: 0, y: 300 },
    ],
  };

  // 地质分层：两块岩性区域
  const geology = [
    {
      id: uid('geo'), name: '花岗闪长岩区', rockType: '花岗闪长岩',
      color: 'rgba(180,160,120,0.25)',
      polygon: { points: [
        { x: 0, y: 0 }, { x: 200, y: 0 }, { x: 180, y: 300 }, { x: 0, y: 300 },
      ] },
    },
    {
      id: uid('geo'), name: '大理岩区', rockType: '大理岩',
      color: 'rgba(120,150,180,0.25)',
      polygon: { points: [
        { x: 200, y: 0 }, { x: 360, y: 0 }, { x: 360, y: 300 }, { x: 180, y: 300 },
      ] },
    },
  ];

  // 等高线：1180~1192m，每 2m 一条，呈缓倾斜面 + 局部弯曲
  const contours = [];
  for (let i = 0; i <= 6; i++) {
    const elev = 1180 + i * 2;
    const yBase = 30 + i * 38;
    const points = [];
    for (let x = 0; x <= 360; x += 30) {
      points.push({ x, y: yBase + Math.sin(x / 60 + i) * 6 });
    }
    contours.push({ id: uid('ctr'), elevation: elev, polyline: { points } });
  }

  // 边坡线：北侧台阶坡顶线，安全距离 3m
  const slopes = [
    {
      id: uid('slp'), name: '北帮坡顶线', clearance: 3,
      polyline: { points: [{ x: 100, y: 155 }, { x: 180, y: 158 }, { x: 260, y: 154 }] },
    },
    {
      id: uid('slp'), name: '西帮坡顶线', clearance: 2.5,
      polyline: { points: [{ x: 8, y: 0 }, { x: 10, y: 120 }, { x: 7, y: 240 }] },
    },
  ];

  // 空区：两处历史采空区
  const voids = [
    {
      id: uid('void'), name: 'KQ-01 老硐空区', reason: '早期地下开采巷道', clearance: 2.5,
      polygon: { points: [
        { x: 152, y: 98 }, { x: 172, y: 96 }, { x: 178, y: 112 },
        { x: 168, y: 124 }, { x: 150, y: 120 }, { x: 147, y: 106 },
      ] },
    },
    {
      id: uid('void'), name: 'KQ-02 溶洞', reason: '岩溶发育带', clearance: 2.5,
      polygon: { points: [
        { x: 196, y: 122 }, { x: 209, y: 121 }, { x: 212, y: 132 }, { x: 201, y: 139 }, { x: 193, y: 131 },
      ] },
    },
  ];

  // 管线：一条电缆沿阵列北缘横穿、一条水管沿阵列东侧纵穿
  const pipelines = [
    {
      id: uid('pipe'), name: 'DL-1 高压电缆', kind: '电缆', clearance: 2,
      polyline: { points: [{ x: 120, y: 158 }, { x: 180, y: 161 }, { x: 240, y: 157 }] },
    },
    {
      id: uid('pipe'), name: 'GS-1 供水管', kind: '水管', clearance: 2,
      polyline: { points: [{ x: 218, y: 25 }, { x: 220, y: 80 }, { x: 217, y: 150 }] },
    },
  ];

  // 阵列：120 排 × 70 孔 = 8400 设计孔位，间距/排距均 1.2m。
  // 排沿 +y 单向展开（总进深 142.8m），排内沿 x 向中心对称（总宽 82.8m），
  // 铺满台阶主体，在边坡、空区与管线附近触发避让。
  const array = createArray({
    name: '主爆区阵列 A',
    origin: { x: 180, y: 20 },
    angle: 0,
    spacing: 1.2,
    burden: 1.2,
    rows: 120,
    holesPerRow: 70,
    placement: 'array',
  });

  const chargeParams = { ...DEFAULT_CHARGE_PARAMS };
  const delays = DEFAULT_DELAYS.map((d) => d.delay);
  const ctx: PlacementContext = {
    benchPolygon, slopes, voids, pipelines, contours,
    chargeParams, delays,
  };
  const holes = generateHoles(array, ctx);

  return {
    id: uid('design'),
    areaId: area.id,
    name: `${area.name}爆破设计`,
    version: 1,
    status: 'draft',
    designer: area.designer,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reviewHistory: [],
    benchPolygon,
    geology,
    contours,
    slopes,
    voids,
    pipelines,
    arrays: [array],
    holes,
    chargeParams,
    delays: DEFAULT_DELAYS.map((d) => ({ ...d })),
    layerStates: DEFAULT_LAYERS.map((l) => ({ ...l })),
  };
}
