import type { PVModule, SchemeSettings } from '../types'

export const DEFAULT_SETTINGS: SchemeSettings = {
  gapX: 0.02,
  gapY: 0.6,
  orientationLimitDeg: 5,
  latitudeDeg: 31.2, // 上海
  shadowHour: 9,
  safetyMargin: 0.5,
  panelsPerString: 0,
  tiltDegOnFlat: 20,
  fullLoadHours: 1100,
  tariff: 0.4,
  costPerWp: 3.2,
  annualDegrade: 0.005,
}

export const DEFAULT_MODULES: PVModule[] = [
  {
    id: 'mod-550',
    manufacturer: '晶科',
    model: 'JKM550M-72HL4',
    length: 2.278,
    width: 1.134,
    powerW: 550,
    efficiency: 0.213,
  },
  {
    id: 'mod-600',
    manufacturer: '隆基',
    model: 'Hi-MO 6 LR5-72HTH',
    length: 2.278,
    width: 1.134,
    powerW: 600,
    efficiency: 0.232,
  },
  {
    id: 'mod-410',
    manufacturer: '天合',
    model: 'TSM-410 NEG18V',
    length: 1.754,
    width: 1.096,
    powerW: 410,
    efficiency: 0.213,
  },
]

let seq = 0
/** 生成 id（不依赖 Math.random，保证可重复） */
export function uid(prefix = 'id'): string {
  seq += 1
  return `${prefix}-${Date.now().toString(36)}-${seq}`
}
