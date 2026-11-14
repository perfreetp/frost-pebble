import type { CabinConfig, ProjectSpec } from './types';

/** 同型号 key:梯型 + 内宽x内深x内高 */
export function modelKey(spec: ProjectSpec): string {
  return `${spec.carType}|${spec.width}x${spec.depth}x${spec.height}`;
}

const STORE_KEY = 'cabin-templates-v1';

function loadStore(): Record<string, CabinConfig> {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

/** 保存当前配置为该型号的模板 */
export function saveTemplate(spec: ProjectSpec, config: CabinConfig) {
  const store = loadStore();
  store[modelKey(spec)] = JSON.parse(JSON.stringify(config));
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

/** 查同型号模板 */
export function findTemplate(spec: ProjectSpec): CabinConfig | null {
  return loadStore()[modelKey(spec)] ?? null;
}

export function defaultConfig(): CabinConfig {
  return {
    materials: {
      ceiling: 'ss-brushed',
      floor: 'rock',
      'wall-left': 'ss-brushed',
      'wall-right': 'ss-brushed',
      'wall-rear': 'ss-brushed',
      'door-frame': 'ss-brushed',
    },
    ceilingType: 'flat',
    copPosition: 'front-right',
    handrail: { enabled: false, wall: 'wall-rear', height: 850, length: 1200 },
  };
}
