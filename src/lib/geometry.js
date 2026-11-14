// 包围盒 / 吸附 / 碰撞 / 走道 几何工具(全部纯函数,单位米)
import { GRID, MAX_LAYERS, MIN_AISLE, EQUIP_TYPES } from './constants.js';

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// 物体的世界轴对齐包围盒(考虑旋转,取旋转后外框)
export function objectAABB(o) {
  const t = EQUIP_TYPES[o.type];
  const w = o.size?.w ?? t.w;
  const d = o.size?.d ?? t.d;
  const h = o.size?.h ?? t.h;
  const rot = (o.rotY || 0) % Math.PI;
  const c = Math.abs(Math.cos(rot));
  const s = Math.abs(Math.sin(rot));
  const aw = w * c + d * s;   // 旋转后的轴对齐宽
  const ad = w * s + d * c;
  return {
    minX: o.x - aw / 2, maxX: o.x + aw / 2,
    minZ: o.z - ad / 2, maxZ: o.z + ad / 2,
    minY: o.y, maxY: o.y + h,
    aw, ad, h
  };
}

// 网格吸附:位置取 0.5m 整数倍,角度取 90°
export function snapGrid(o) {
  return {
    ...o,
    x: Math.round(o.x / GRID) * GRID,
    z: Math.round(o.z / GRID) * GRID,
    rotY: Math.round((o.rotY || 0) / (Math.PI / 2)) * (Math.PI / 2)
  };
}

// 贴地:层架/托盘/立柱/风机 y=0;管道与灯可悬空,但不得低于自身最小高度
export function groundY(type) {
  return type === 'pipe' || type === 'light' ? null : 0;
}

const overlap = (a, b) =>
  a.minX < b.maxX - 1e-6 && a.maxX > b.minX + 1e-6 &&
  a.minZ < b.maxZ - 1e-6 && a.maxZ > b.minZ + 1e-6 &&
  a.minY < b.maxY - 1e-6 && a.maxY > b.minY + 1e-6;

// 两个 AABB 在地面投影的重叠量(用于碰撞回退)
export function overlapDepth(a, b) {
  const ox = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX);
  const oz = Math.min(a.maxZ, b.maxZ) - Math.max(a.minZ, b.minZ);
  return { ox: Math.max(0, ox), oz: Math.max(0, oz) };
}

/**
 * 对单个棚做全量校验,返回 { violations: [{objId, level, reason}], collided:Set }
 * 规则:
 *  1. 层架必须贴地(y≈0)
 *  2. 叠放超过 4 层(以同一平面投影叠放链计)
 *  3. 压到立柱(与 column 相交)
 *  4. 物体之间包围盒相交
 *  5. 越出棚区边界
 */
export function validateShed(shed) {
  const objs = shed.objects || [];
  const boxes = objs.map((o) => ({ o, b: objectAABB(o) }));
  const violations = [];
  const collided = new Set();

  const push = (objId, reason) => {
    violations.push({ objId, level: 'error', reason });
    collided.add(objId);
  };

  for (const { o, b } of boxes) {
    // 边界
    if (b.minX < -1e-6 || b.minZ < -1e-6 || b.maxX > shed.w + 1e-6 || b.maxZ > shed.d + 1e-6) {
      push(o.id, `越出棚区边界(棚区 ${shed.w}m × ${shed.d}m)`);
    }
    // 层架贴地:同投影位置的最底层必须 y≈0,上层属正常叠放
    if (o.type === 'rack') {
      const siblings = boxes.filter(
        (x) => x.o.type === 'rack' &&
          Math.abs(x.o.x - o.x) < 0.05 && Math.abs(x.o.z - o.z) < 0.05
      );
      const isBottom = (o.y || 0) <= Math.min(...siblings.map((s) => s.o.y || 0)) + 0.02;
      if (isBottom && Math.abs(o.y || 0) > 0.02) {
        push(o.id, `层架未贴地(当前离地 ${o.y.toFixed(2)}m)`);
      }
    }
    // 立柱
    if (o.type !== 'column') {
      for (const c of boxes.filter((x) => x.o.type === 'column')) {
        if (overlap(b, c.b)) {
          push(o.id, '压到棚体立柱,需移开至少 0.2m');
          collided.add(c.o.id);
        }
      }
    }
  }

  // 物体两两碰撞(立柱之间不判;层架垂直叠放属于正常堆叠,只受层数上限约束)
  const verticalStack = (a, b) => {
    if (a.o.type !== 'rack' || b.o.type !== 'rack') return false;
    const sameFootprint =
      Math.abs(a.o.x - b.o.x) < 0.05 && Math.abs(a.o.z - b.o.z) < 0.05;
    const separated = Math.abs(a.o.y - b.o.y) > 0.05;
    return sameFootprint && separated;
  };
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const A = boxes[i], B = boxes[j];
      if (A.o.type === 'column' && B.o.type === 'column') continue;
      if (verticalStack(A, B)) continue;
      if (overlap(A.b, B.b)) {
        const nA = EQUIP_TYPES[A.o.type].name;
        const nB = EQUIP_TYPES[B.o.type].name;
        push(A.o.id, `与${nB}(${B.o.code})包围盒碰撞`);
        push(B.o.id, `与${nA}(${A.o.code})包围盒碰撞`);
      }
    }
  }

  // 叠放层数:按层架中心投影聚类,统计同一(x,z)位置不同 y 的层架数
  const stacks = new Map();
  for (const o of objs.filter((x) => x.type === 'rack')) {
    const key = `${o.x.toFixed(2)},${o.z.toFixed(2)}`;
    if (!stacks.has(key)) stacks.set(key, []);
    stacks.get(key).push(o);
  }
  for (const list of stacks.values()) {
    if (list.length > MAX_LAYERS) {
      for (const o of list) push(o.id, `叠放 ${list.length} 层,超过 ${MAX_LAYERS} 层上限`);
    }
  }

  return { violations, collided, aisleMap: computeAisles(shed, boxes) };
}

/**
 * 走道宽度:扫描每排层架之间的净距(按 z 向投影条带聚合)。
 * 返回 { min, rows:[{index, gap}] },俯视图标注用。
 */
export function computeAisles(shed, boxes) {
  const racks = boxes
    .filter(({ o }) => o.type === 'rack')
    .map(({ b }) => b)
    .sort((a, b) => (a.minX + a.maxX) / 2 - (b.minX + b.maxX) / 2);
  if (racks.length < 2) return { min: null, rows: [] };

  // 按 x 中心聚类成"排"(间距 < 2m 视为同排不同列)
  const rows = [];
  for (const b of racks) {
    const cx = (b.minX + b.maxX) / 2;
    const row = rows.find((r) => Math.abs(r.cx - cx) < 2);
    if (row) {
      row.boxes.push(b);
      row.cx = (row.cx * (row.boxes.length - 1) + cx) / row.boxes.length;
    } else {
      rows.push({ cx, boxes: [b] });
    }
  }
  rows.sort((a, b) => a.cx - b.cx);

  const gaps = [];
  for (let i = 0; i < rows.length - 1; i++) {
    const rightA = Math.max(...rows[i].boxes.map((b) => b.maxX));
    const leftB = Math.min(...rows[i + 1].boxes.map((b) => b.minX));
    const zVals = [...rows[i].boxes, ...rows[i + 1].boxes].map((b) => (b.minZ + b.maxZ) / 2);
    gaps.push({
      index: i + 1,
      gap: +(leftB - rightA).toFixed(2),
      x: +((rightA + leftB) / 2).toFixed(2),
      z: +(zVals.reduce((a, b) => a + b, 0) / zVals.length).toFixed(2)
    });
  }
  const min = gaps.length ? Math.min(...gaps.map((g) => g.gap)) : null;
  return { min, rows: gaps, minAisle: MIN_AISLE };
}

// 物料清单汇总
export function buildBOM(sheds) {
  const items = {
    rack: { qty: 0, unit: EQUIP_TYPES.rack.unit, name: EQUIP_TYPES.rack.name },
    tray: { qty: 0, unit: EQUIP_TYPES.tray.unit, name: EQUIP_TYPES.tray.name },
    pipe: { qty: 0, unit: '米', name: EQUIP_TYPES.pipe.name },
    fan: { qty: 0, unit: EQUIP_TYPES.fan.unit, name: EQUIP_TYPES.fan.name },
    light: { qty: 0, unit: EQUIP_TYPES.light.unit, name: EQUIP_TYPES.light.name },
    column: { qty: 0, unit: EQUIP_TYPES.column.unit, name: EQUIP_TYPES.column.unit }
  };
  for (const shed of sheds) {
    for (const o of shed.objects || []) {
      if (o.type === 'pipe') {
        // 管道按长度计米:旋转后取长边
        const t = EQUIP_TYPES.pipe;
        const w = o.size?.w ?? t.w, d = o.size?.d ?? t.d;
        const rot = (o.rotY || 0) % Math.PI;
        const long = Math.abs(Math.cos(rot)) > 0.5 ? d : w;
        items.pipe.qty = +(items.pipe.qty + long).toFixed(2);
      } else if (items[o.type]) {
        items[o.type].qty += 1;
      }
    }
  }
  return Object.entries(items).map(([type, v]) => ({ type, ...v }));
}
