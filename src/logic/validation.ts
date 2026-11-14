import type { CabinConfig, Conflict, ProjectSpec, SurfaceId } from '../types';
import { COP_DEF } from '../data/catalog';

/** 门洞宽度(mm):按梯型与轿厢宽度估算 */
export function doorOpeningWidth(spec: ProjectSpec): number {
  const base = spec.width * (spec.doorType === 'center' ? 0.5 : 0.55);
  return Math.round(Math.min(1300, Math.max(700, base)) / 10) * 10;
}

/** 门洞高度(mm) */
export function doorOpeningHeight(spec: ProjectSpec): number {
  return Math.min(2100, spec.height - 300);
}

/** 门垛(门扇收纳区)宽度 mm,旁开/双折用 */
export function doorStackWidth(spec: ProjectSpec): number {
  return spec.doorType === 'center' ? 0 : Math.round(doorOpeningWidth(spec) * 0.35);
}

export interface CopRegion {
  surface: SurfaceId;
  /** 在所在壁面上的水平区间(mm,壁面局部坐标,从壁面左缘看) */
  from: number;
  to: number;
  yBottom: number;
  yTop: number;
}

/** 计算操纵箱在轿厢内的占位区域 */
export function copRegion(spec: ProjectSpec, config: CabinConfig): CopRegion {
  const openW = doorOpeningWidth(spec);
  const { width, height } = spec;
  const yBottom = COP_DEF.bottom;
  const yTop = Math.min(height - 200, COP_DEF.bottom + COP_DEF.height);
  switch (config.copPosition) {
    case 'front-left':
    case 'front-right': {
      // 前壁(门所在壁),局部坐标 x∈[0,width],门洞居中
      const jamb = (width - openW) / 2;
      const cx = config.copPosition === 'front-left' ? jamb / 2 : width - jamb / 2;
      return {
        surface: 'door-frame',
        from: cx - COP_DEF.width / 2,
        to: cx + COP_DEF.width / 2,
        yBottom,
        yTop,
      };
    }
    case 'side-left':
    case 'side-right': {
      // 侧壁前端,局部坐标 z∈[0,depth](从前缘起)
      return {
        surface: config.copPosition === 'side-left' ? 'wall-left' : 'wall-right',
        from: 100,
        to: 100 + COP_DEF.width,
        yBottom,
        yTop,
      };
    }
  }
}

/**
 * 校验操纵箱/扶手与门机的冲突。
 * 返回冲突列表;每个冲突带需高亮的壁面与原因说明。
 */
export function validateConflicts(spec: ProjectSpec, config: CabinConfig): Conflict[] {
  const conflicts: Conflict[] = [];
  const openW = doorOpeningWidth(spec);
  const jamb = (spec.width - openW) / 2;

  // 门型可行性
  if (spec.doorType !== 'center' && spec.width < 1100) {
    conflicts.push({ surface: 'door-frame', message: '轿厢内宽不足 1100mm,无法布置旁开/双折门,请改用中分门或加宽轿厢。' });
  }
  if (spec.doorType === 'center' && spec.width < 1200) {
    conflicts.push({ surface: 'door-frame', message: '轿厢内宽不足 1200mm,中分门门机无法布置,建议改用旁开门。' });
  }

  const cop = copRegion(spec, config);

  // 门机占位:前壁顶部(门洞上方,全门机宽) + 旁开/双折的门垛侧竖向通长区域
  if (cop.surface === 'door-frame') {
    if (jamb < COP_DEF.width) {
      conflicts.push({
        surface: 'door-frame',
        message: `门侧前壁净宽仅 ${Math.round(jamb)}mm,小于操纵箱宽度 ${COP_DEF.width}mm,操纵箱与门套/门机冲突,请改选侧壁安装。`,
      });
    }
    if (spec.doorType !== 'center') {
      const stackW = doorStackWidth(spec);
      const stackFrom = spec.doorStackSide === 'left' ? 0 : spec.width - stackW;
      const stackTo = spec.doorStackSide === 'left' ? stackW : spec.width;
      if (cop.to > stackFrom && cop.from < stackTo) {
        conflicts.push({
          surface: 'door-frame',
          message: `操纵箱位于${spec.doorStackSide === 'left' ? '左' : '右'}侧门垛收纳区(宽 ${stackW}mm)内,门扇开启时会与门机/门扇碰撞,请将操纵箱移到另一侧。`,
        });
      }
    }
  } else {
    // 侧壁前端 COP:旁开/双折门同侧时,门机导轨延伸至侧壁前缘
    const copSide = config.copPosition === 'side-left' ? 'left' : 'right';
    if (spec.doorType !== 'center' && copSide === spec.doorStackSide) {
      conflicts.push({
        surface: cop.surface,
        message: `门扇向${copSide === 'left' ? '左' : '右'}侧收纳,门机导轨占用该侧壁前端 ${doorStackWidth(spec)}mm,操纵箱会压到门机行程,请改到另一侧壁。`,
      });
    }
  }

  // 扶手与操纵箱互压
  const hr = config.handrail;
  if (hr.enabled && cop.surface !== 'door-frame' && hr.wall === cop.surface) {
    // 扶手沿壁面居中布置,局部坐标 z∈[(depth-L)/2,(depth+L)/2](从后缘起)→ 统一为从前缘
    const hrFrom = spec.depth - (spec.depth + hr.length) / 2; // 从前缘量
    const hrTo = hrFrom + hr.length;
    const hrYBottom = hr.height - 100;
    const hrYTop = hr.height + 100;
    const overlapZ = hrFrom < cop.to && hrTo > cop.from;
    const overlapY = hrYBottom < cop.yTop && hrYTop > cop.yBottom;
    if (overlapZ && overlapY) {
      conflicts.push({
        surface: cop.surface,
        message: `扶手(高 ${hr.height}mm、长 ${hr.length}mm)与操纵箱(高 ${cop.yBottom}–${cop.yTop}mm)在同一壁面重叠,请调整扶手高度/长度或移到其他壁面。`,
      });
    }
  }

  return conflicts;
}

/** 仅校验"扶手压操纵箱",用于点选扶手时拦截 */
export function handrailHitsCop(spec: ProjectSpec, config: CabinConfig): boolean {
  return validateConflicts(spec, config).some((c) => c.message.includes('扶手'));
}
