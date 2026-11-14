// 墓区静态配置与几何换算（单位：米）
export const AREAS = [
  { id: 'A', name: '松鹤苑', rows: 30, cols: 40, plotW: 1.0, plotH: 1.2, gapX: 0.3, rowPitch: 1.8, pathEvery: 5, pathWidth: 1.5 },
  { id: 'B', name: '福寿苑', rows: 20, cols: 30, plotW: 1.0, plotH: 1.2, gapX: 0.3, rowPitch: 1.8, pathEvery: 4, pathWidth: 1.5 },
  { id: 'C', name: '青山苑', rows: 16, cols: 24, plotW: 1.0, plotH: 1.2, gapX: 0.3, rowPitch: 1.8, pathEvery: 4, pathWidth: 1.2 }
]

// 吸附网格：30cm
export const GRID = 0.3

export function getArea(id) {
  return AREAS.find(a => a.id === id)
}

// 墓位左上角坐标（含通道偏移）
export function plotRect(area, r, c) {
  return {
    x: c * (area.plotW + area.gapX),
    y: r * area.rowPitch + Math.floor(r / area.pathEvery) * area.pathWidth,
    w: area.plotW,
    h: area.plotH
  }
}

export function areaSize(area) {
  return {
    w: area.cols * (area.plotW + area.gapX) - area.gapX,
    h: area.rows * area.rowPitch + Math.floor((area.rows - 1) / area.pathEvery) * area.pathWidth
  }
}

// 横向通道矩形列表
export function pathRects(area) {
  const rects = []
  const { w } = areaSize(area)
  for (let k = 1; k * area.pathEvery < area.rows; k++) {
    rects.push({
      x: 0,
      y: k * area.pathEvery * area.rowPitch + (k - 1) * area.pathWidth,
      w,
      h: area.pathWidth
    })
  }
  return rects
}

export function plotKey(r, c) {
  return r + ',' + c
}
