import type { EnvironmentKey, EnvironmentPreset, ProjectData, ProjectSettings, RGB } from '../types';

export const DEFAULT_SETTINGS: ProjectSettings = {
  gridSize: 50,
  snapTolerance: 12,
  defaultTubeDiameter: 8,
  maxTubeLength: 2400,
  minRadiusFactor: 2,
  wattsPerM: 9,
  acrylicWattsPerSqm: 350,
  transformerSeries: [60, 100, 150, 200, 300, 400],
  loadMargin: 0.8,
  prices: {
    tubeSinglePerM: 85,
    tubeDualPerM: 140,
    connectorEach: 15,
    transformerByVA: {
      60: 45,
      100: 60,
      150: 80,
      200: 105,
      300: 150,
      400: 195,
    },
    acrylicPerCmHeight: 3.2,
    wallPanelPerSqm: 180,
  },
};

/** 线性 sRGB 近似（着色器与 CPU 侧统计展示共用） */
export const rgb = (r: number, g: number, b: number): RGB => ({ r, g, b });

export const ENVIRONMENTS: Record<EnvironmentKey, EnvironmentPreset> = {
  day: {
    key: 'day',
    label: '白天',
    ambient: rgb(1.0, 0.97, 0.9),
    ambientLevel: 1.05,
    wallColor: rgb(0.78, 0.76, 0.72),
    photoDim: 0.55,
  },
  dusk: {
    key: 'dusk',
    label: '黄昏',
    ambient: rgb(0.55, 0.42, 0.42),
    ambientLevel: 0.55,
    wallColor: rgb(0.36, 0.3, 0.32),
    photoDim: 0.32,
  },
  night: {
    key: 'night',
    label: '深夜',
    ambient: rgb(0.1, 0.12, 0.22),
    ambientLevel: 0.22,
    wallColor: rgb(0.08, 0.09, 0.13),
    photoDim: 0.12,
  },
};

let counter = 0;
export function uid(prefix = 'id'): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`;
}

export function createProject(name = '未命名招牌方案'): ProjectData {
  return {
    version: 1,
    id: uid('proj'),
    name,
    updatedAt: new Date().toISOString(),
    wall: { width: 3000, height: 1200, offsetX: 0, offsetY: 0, photo: '' },
    settings: structuredClone(DEFAULT_SETTINGS),
    environment: 'night',
    bloom: { intensity: 1.0, radius: 0.5 },
    elements: [],
  };
}
