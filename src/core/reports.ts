/**
 * 维修建议库 + 报告统计 + 病害分布图数据（纯函数，报告与分享页共用）。
 */
import type {
  ComponentInfo,
  ComponentType,
  Defect,
  DefectType,
  ReportStats,
  RepairItem,
  SeverityLevel,
} from './types';
import { COMPONENT_TYPE_LABEL, COMPONENT_TYPE_ORDER } from './types';
import type { DefectFamily } from './timeline';

export const REPAIR_LIBRARY: Record<string, RepairItem> = {
  crack_inject_surf: {
    key: 'crack_inject_surf',
    title: '表面封闭法处理裂缝',
    detail: '宽度 ≤ 0.2 mm 的非受力区表面裂缝，清理后用环氧树脂或聚合物水泥浆封闭，防止水汽侵入。',
    method: '沿缝打磨清洁 → 涂刷环氧底胶 → 刮涂封闭层 → 养护 24 h',
    urgency: '下次定检',
    unit: 'm',
    quantityHint: '按裂缝长度计量',
  },
  crack_inject_pressure: {
    key: 'crack_inject_pressure',
    title: '压力灌浆法修补裂缝',
    detail: '宽度 0.2–0.3 mm 裂缝，采用改性环氧树脂压力灌注，恢复截面整体性并封闭缝隙。',
    method: '埋设注浆嘴（间距 20–30 cm）→ 封缝 → 0.3 MPa 压力灌注 → 剔凿清理',
    urgency: '汛前',
    unit: 'm',
    quantityHint: '按裂缝长度计量，注浆量按缝宽估算',
  },
  crack_plate_strip: {
    key: 'crack_plate_strip',
    title: '粘贴钢板/碳纤维布加固',
    detail: '宽度 > 0.3 mm 或贯通的梁体受力裂缝，灌浆后进行抗弯/抗剪补强，并做长期观测。',
    method: '卸载 → 灌浆 → 基面处理 → 粘钢/碳布 + 锚栓 → 防腐涂装',
    urgency: '立即',
    unit: 'm²',
    quantityHint: '按加固面积计量，需专项设计',
  },
  crack_monitor: {
    key: 'crack_monitor',
    title: '裂缝观测标志与定期量测',
    detail: '对发展中的裂缝设置石膏条/裂缝计，每次定检量测宽度与长度，纳入时间线跟踪。',
    method: '布设观测点 → 编号建档 → 每次定检量测并记录发展速率',
    urgency: '观察',
    unit: '处',
    quantityHint: '每处布 1–2 个测点',
  },
  bearing_reseat: {
    key: 'bearing_reseat',
    title: '支座脱空顶升复位与垫实',
    detail: '脱空率 > 30% 或深度 > 5 mm 的支座，同步顶升梁体后更换/垫实支座，恢复均匀受力。',
    method: '搭设顶升支架 → 同步顶升（位移 ≤ 2 mm 级差）→ 更换支座 → 落梁复测反力',
    urgency: '立即',
    unit: '个',
    quantityHint: '按支座个数计量，需同步顶升方案',
  },
  bearing_grout: {
    key: 'bearing_grout',
    title: '支座下垫层灌浆找平',
    detail: '轻度脱空（≤ 15%）采用无收缩灌浆料填充支承面空隙，改善局部承压。',
    method: '清理支承面 → 支模 → 重力/压力灌注无收缩灌浆料 → 养护',
    urgency: '汛前',
    unit: '个',
    quantityHint: '每支座灌浆量约 0.02–0.05 m³',
  },
  bearing_observe: {
    key: 'bearing_observe',
    title: '支座变形与脱空观测',
    detail: '对早期脱空支座建立观测档案，量测剪切变形与压缩量，超限时转入复位处理。',
    method: '布置百分表/位移计 → 定期读数 → 与设计变形量对比',
    urgency: '观察',
    unit: '个',
    quantityHint: '按支座个数计量',
  },
  joint_seal: {
    key: 'joint_seal',
    title: '铰缝渗水封堵与排水改进',
    detail: '清除铰缝内松散物后采用聚合物砂浆封堵，并检查桥面排水，防止积水沿铰缝下渗。',
    method: '剔凿清理 → 高压水清洗 → 聚合物砂浆/环氧砂浆填塞 → 表面防水层',
    urgency: '汛前',
    unit: 'm',
    quantityHint: '按铰缝处理长度计量',
  },
  joint_grout_deep: {
    key: 'joint_grout_deep',
    title: '铰缝深部注浆与植筋连接',
    detail: '贯通性渗水伴锈迹的铰缝，需深部注浆恢复铰缝传力并补植连接钢筋。',
    method: '钻孔探查 → 高压注浆 → 植筋/粘贴横向连接 → 防水层恢复',
    urgency: '立即',
    unit: 'm',
    quantityHint: '按渗水影响长度计量，需专项方案',
  },
  deck_overlay: {
    key: 'deck_overlay',
    title: '桥面铺装局部修补',
    detail: '桥面铺装网裂、坑槽区域凿除后重新摊铺，恢复平整度与防水功能。',
    method: '切割凿除 → 界面处理 → 浇筑快硬混凝土/沥青 → 碾压养生',
    urgency: '汛前',
    unit: 'm²',
    quantityHint: '按修补面积计量',
  },
  railing_repair: {
    key: 'railing_repair',
    title: '护栏构件修复与防腐',
    detail: '护栏锈蚀、变形部位进行除锈防腐或更换构件，保证防撞等级。',
    method: '除锈 → 更换变形杆件 → 热浸镀锌/涂装 → 螺栓紧固检查',
    urgency: '汛前',
    unit: 'm',
    quantityHint: '按修复长度计量',
  },
};

export const SEVERITY_URGENCY: Record<SeverityLevel, RepairItem['urgency']> = {
  critical: '立即',
  warning: '汛前',
  normal: '下次定检',
};

/** 依据病害类型 + 等级 + 是否发展，给出建议维修措施 */
export function suggestRepair(d: Defect, family?: DefectFamily): RepairItem {
  if (d.type === 'crack') {
    if (d.severity === 'critical') {
      return d.componentId.includes('girder')
        ? REPAIR_LIBRARY.crack_plate_strip
        : REPAIR_LIBRARY.crack_inject_pressure;
    }
    if (d.severity === 'warning') return REPAIR_LIBRARY.crack_inject_pressure;
    if (family && (family.nearLimit || family.isExpanded)) return REPAIR_LIBRARY.crack_monitor;
    return REPAIR_LIBRARY.crack_inject_surf;
  }
  if (d.type === 'bearing_void') {
    if (d.severity === 'critical') return REPAIR_LIBRARY.bearing_reseat;
    if (d.severity === 'warning') return REPAIR_LIBRARY.bearing_grout;
    return REPAIR_LIBRARY.bearing_observe;
  }
  if (d.severity === 'critical') return REPAIR_LIBRARY.joint_grout_deep;
  if (d.severity === 'warning') return REPAIR_LIBRARY.joint_seal;
  return REPAIR_LIBRARY.joint_seal;
}

export interface RepairRow {
  item: RepairItem;
  defects: Defect[];
  quantity: string;
  severity: SeverityLevel;
  /** 重点说明，如“发展速率 0.08 mm/年” */
  note: string;
}

export const REPAIR_URGENCY_ORDER: RepairItem['urgency'][] = ['立即', '汛前', '下次定检', '观察'];

export function buildRepairList(
  defects: Defect[],
  families: DefectFamily[],
): RepairRow[] {
  const famByLatest = new Map(families.map((f) => [f.latest.defect.id, f]));
  const famByDefect = new Map<string, DefectFamily>();
  for (const f of families) for (const p of f.points) famByDefect.set(p.defect.id, f);

  const rows = new Map<string, RepairRow>();
  for (const d of defects) {
    const family = famByDefect.get(d.id);
    const item = suggestRepair(d, family);
    const existing = rows.get(item.key);
    const qty =
      d.geometry.kind === 'crack'
        ? d.geometry.lengthMm / 1000
        : d.type === 'bearing_void'
          ? 1
          : Math.max(0.5, Math.sqrt(d.geometry.areaM2));
    const rank = (s: SeverityLevel) => (s === 'critical' ? 0 : s === 'warning' ? 1 : 2);
    if (existing) {
      existing.defects.push(d);
      if (rank(d.severity) < rank(existing.severity)) existing.severity = d.severity;
    } else {
      rows.set(item.key, {
        item,
        defects: [d],
        quantity: '',
        severity: d.severity,
        note: '',
      });
    }
  }
  for (const row of rows.values()) {
    const unit = row.item.unit;
    if (unit === '个') row.quantity = `${row.defects.length} 个`;
    else if (unit === '处') row.quantity = `${row.defects.length} 处`;
    else {
      const q = row.defects.reduce((s, d) => {
        if (d.geometry.kind === 'crack') return s + d.geometry.lengthMm / 1000;
        return s + Math.max(0.2, Math.sqrt(d.geometry.areaM2));
      }, 0);
      row.quantity = `${q.toFixed(2)} ${unit}`;
    }
    const famGrp = row.defects
      .map((d) => famByDefect.get(d.id))
      .filter((f): f is DefectFamily => !!f && f.widthRatePerYear > 0);
    if (famGrp.length) {
      const maxRate = Math.max(...famGrp.map((f) => f.widthRatePerYear));
      const near = famGrp.some((f) => f.nearLimit);
      row.note = `含发展性病害，最大宽度增长 ${maxRate.toFixed(2)} mm/年${near ? '；已达预警余量，建议本次处理' : ''}`;
    }
  }
  return [...rows.values()].sort(
    (a, b) =>
      REPAIR_URGENCY_ORDER.indexOf(a.item.urgency) - REPAIR_URGENCY_ORDER.indexOf(b.item.urgency) ||
      a.item.title.localeCompare(b.item.title, 'zh'),
  );
}

// ---------------------------------------------------------------- stats

export function computeStats(
  defects: Defect[],
  components: ComponentInfo[],
  families: DefectFamily[],
  previousInspectionId?: string,
): ReportStats {
  const byLevel: Record<SeverityLevel, number> = { normal: 0, warning: 0, critical: 0 };
  const byType: Record<DefectType, { total: number; warning: number; critical: number }> = {
    crack: { total: 0, warning: 0, critical: 0 },
    bearing_void: { total: 0, warning: 0, critical: 0 },
    joint_seepage: { total: 0, warning: 0, critical: 0 },
  };
  const byComponent: Record<ComponentType, number> = {
    girder: 0,
    pier: 0,
    bearing: 0,
    deck: 0,
    railing: 0,
    abutment: 0,
  };
  const compById = new Map(components.map((c) => [c.id, c]));
  const spanCount = Math.max(1, ...components.map((c) => c.spanIndex));
  const bySpanCritical = new Array(spanCount).fill(0);

  let critical = 0;
  let warning = 0;
  let normal = 0;
  for (const d of defects) {
    byLevel[d.severity]++;
    byType[d.type].total++;
    if (d.severity === 'critical') {
      byType[d.type].critical++;
      critical++;
    }
    if (d.severity === 'warning') {
      byType[d.type].warning++;
      warning++;
    }
    if (d.severity === 'normal') normal++;
    const comp = compById.get(d.componentId);
    if (comp) {
      byComponent[comp.type]++;
      if (d.severity === 'critical') bySpanCritical[Math.min(spanCount - 1, comp.spanIndex - 1)]++;
    }
  }
  const prevId = previousInspectionId;
  return {
    byLevel,
    byType,
    byComponent,
    bySpanCritical,
    total: defects.length,
    critical,
    warning,
    normal,
    newSinceLast: families.filter((f) => f.isNew && (!prevId || f.latest.defect.inspectionId === prevId || true))
      .length,
    expandedSinceLast: families.filter((f) => f.isExpanded).length,
    families: families.length,
  };
}

// ---------------------------------------------------------------- distribution map

export interface MapMarker {
  id: string;
  x: number;
  y: number;
  chainage: number;
  offset: number;
  elevation: number;
  type: DefectType;
  severity: SeverityLevel;
  code: string;
  componentType: ComponentType;
  spanIndex: number;
  color: string;
}

export const SEVERITY_FILL: Record<SeverityLevel, string> = {
  critical: '#e5484d',
  warning: '#e8b033',
  normal: '#4f9a68',
};

export const TYPE_SHAPE: Record<DefectType, 'circle' | 'square' | 'diamond'> = {
  crack: 'circle',
  bearing_void: 'square',
  joint_seepage: 'diamond',
};

export interface DistributionMap {
  /** 立面展开：x = 桩号(米)，y = 标高(米) */
  elevationView: MapMarker[];
  /** 平面展开：x = 桩号(米)，y = 横向偏距(米) */
  planView: MapMarker[];
  extent: {
    chainage: [number, number];
    elevation: [number, number];
    offset: [number, number];
  };
  spanBounds: number[];
  legends: { key: string; label: string; color: string; shape: string }[];
  structure: { type: ComponentType; x0: number; x1: number; elevMin: number; elevMax: number }[];
}

export function buildDistributionMap(
  defects: Defect[],
  components: ComponentInfo[],
  bridgeMeta: { stationStart: number; length: number; spans: number[]; deckWidth: number },
): DistributionMap {
  const compById = new Map(components.map((c) => [c.id, c]));
  const markers: MapMarker[] = defects.map((d) => {
    const comp = compById.get(d.componentId);
    return {
      id: d.id,
      x: d.chainage,
      y: d.elevation,
      chainage: d.chainage,
      offset: d.offset,
      elevation: d.elevation,
      type: d.type,
      severity: d.severity,
      code: d.code,
      componentType: comp?.type ?? 'girder',
      spanIndex: comp?.spanIndex ?? 1,
      color: SEVERITY_FILL[d.severity],
    };
  });
  const c0 = bridgeMeta.stationStart;
  const c1 = bridgeMeta.stationStart + bridgeMeta.length;
  // 立面范围取“结构本体 + 病害”的并集：桥梁立面图要能看到墩、梁和病害的相对高度
  const elevs = markers.map((m) => m.elevation);
  const structElevs = components.flatMap((c) => [c.elevMin, c.elevMax]);
  let elevMin = Math.min(...elevs, ...structElevs);
  let elevMax = Math.max(...elevs, ...structElevs);
  // 立面展开图的可视窗口至少 12 m 高，避免近水平桥梁被压成一条线；报告页脚注明竖向放大倍数
  const minWindow = 12;
  if (elevMax - elevMin < minWindow) {
    const mid = (elevMax + elevMin) / 2;
    elevMin = mid - minWindow / 2;
    elevMax = mid + minWindow / 2;
  }
  const padE = Math.max(0.5, (elevMax - elevMin) * 0.04);
  const spanBounds = [0];
  for (const s of bridgeMeta.spans) spanBounds.push(spanBounds[spanBounds.length - 1] + s);
  const legends: DistributionMap['legends'] = [
    ...(['critical', 'warning', 'normal'] as SeverityLevel[]).map((s) => ({
      key: `sev-${s}`,
      label: s === 'critical' ? '严重（红）' : s === 'warning' ? '需关注（黄）' : '一般（绿）',
      color: SEVERITY_FILL[s],
      shape: 'circle',
    })),
    { key: 'crack', label: '裂缝 ○', color: '#888', shape: 'circle' },
    { key: 'bearing_void', label: '支座脱空 □', color: '#888', shape: 'square' },
    { key: 'joint_seepage', label: '铰缝渗水 ◇', color: '#888', shape: 'diamond' },
  ];
  return {
    elevationView: markers,
    planView: markers,
    extent: {
      chainage: [c0, c1],
      elevation: [elevMin - padE, elevMax + padE],
      offset: [-bridgeMeta.deckWidth / 2, bridgeMeta.deckWidth / 2],
    },
    /** 立面轮廓用的构件（梁体、墩、桥台），供报告绘制真实桥梁外形 */
    structure: components
      .filter((c) => c.type === 'girder' || c.type === 'pier' || c.type === 'abutment' || c.type === 'deck')
      .map((c) => ({
        type: c.type,
        x0: c.x0,
        x1: c.x1,
        elevMin: c.elevMin,
        elevMax: c.elevMax,
      })),
    spanBounds,
    legends,
  };
}

export function componentTypeLabel(t: ComponentType): string {
  return COMPONENT_TYPE_LABEL[t] ?? t;
}

export function sortedComponentTypes(types: ComponentType[]): ComponentType[] {
  return [...types].sort(
    (a, b) => COMPONENT_TYPE_ORDER.indexOf(a) - COMPONENT_TYPE_ORDER.indexOf(b),
  );
}
