import type { Obstacle, Point2, Roof, RoofPlane } from '../types'
import { uid } from './defaults'

function rect(x: number, y: number, w: number, h: number): Point2[] {
  return [
    { x, y },
    { x: x + w, y },
    { x: x + w, y: y + h },
    { x, y: y + h },
  ]
}

/** 内置示例厂房屋面：平屋面（带女儿墙+天窗+风机+排烟井）+ 单侧坡屋面 */
export function createSampleRoof(): Roof {
  const W = 60
  const D = 30

  const obstacles: Obstacle[] = [
    {
      id: uid('ob'),
      type: 'skylight',
      polygon: rect(12, 8, 10, 2.5),
      height: 0.6,
      name: '天窗-1',
    },
    {
      id: uid('ob'),
      type: 'skylight',
      polygon: rect(34, 8, 10, 2.5),
      height: 0.6,
      name: '天窗-2',
    },
    {
      id: uid('ob'),
      type: 'fan',
      polygon: rect(8, 20, 2.4, 2.4),
      height: 0.8,
      name: '风机-1',
    },
    {
      id: uid('ob'),
      type: 'fan',
      polygon: rect(28, 22, 2.4, 2.4),
      height: 0.8,
      name: '风机-2',
    },
    {
      id: uid('ob'),
      type: 'fan',
      polygon: rect(46, 20, 2.4, 2.4),
      height: 0.8,
      name: '风机-3',
    },
    {
      id: uid('ob'),
      type: 'shaft',
      polygon: rect(44, 4, 5, 4),
      height: 1.6,
      name: '排烟井-1',
    },
    {
      id: uid('ob'),
      type: 'shaft',
      polygon: rect(20, 24, 4, 3.5),
      height: 1.6,
      name: '排烟井-2',
    },
  ]

  const main: RoofPlane = {
    id: uid('pl'),
    name: '平屋面 A',
    outline: rect(0, 0, W, D),
    slopeDeg: 0,
    aspectDeg: 180,
    parapetHeight: 1.1,
    obstacles,
  }

  const shed: RoofPlane = {
    id: uid('pl'),
    name: '坡屋面 B（10°）',
    outline: rect(0, 0, 24, 12),
    slopeDeg: 10,
    aspectDeg: 180,
    parapetHeight: 0.6,
    obstacles: [
      {
        id: uid('ob'),
        type: 'skylight',
        polygon: rect(10, 5, 4, 2),
        height: 0.5,
        name: '坡顶天窗',
      },
    ],
  }

  return {
    id: uid('roof'),
    name: '示例：某机械加工厂厂房',
    origin: { x: 0, y: 0, z: 0 },
    planes: [main, shed],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}
