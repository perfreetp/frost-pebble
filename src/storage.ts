import type { AppState } from './types';
import { MATERIALS } from './data/presets';

export const STORAGE_KEY = 'car-wrap-studio:v1';

export function defaultState(): AppState {
  return {
    schemeName: '我的改色方案',
    vehicle: 'sedan',
    rollWidth: 1.52,
    overlap: 0.02,
    trimAllowance: 0.08,
    selectedPanel: null,
    dualTone: false,
    showSeams: true,
    base: { color: '#c0151f', material: 'glossy', metalness: 0, roughness: 0.18 },
    overrides: {},
    prices: {
      glossy: MATERIALS[0].defaultPrice,
      matte: MATERIALS[1].defaultPrice,
      chrome: MATERIALS[2].defaultPrice,
      chameleon: MATERIALS[3].defaultPrice,
    },
    laborFee: 800,
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    // 与默认值合并，兼容后续新增字段
    return { ...defaultState(), ...parsed, base: { ...defaultState().base, ...(parsed.base ?? {}) } };
  } catch {
    return defaultState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('方案保存失败', e);
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
