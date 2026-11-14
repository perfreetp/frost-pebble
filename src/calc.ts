import type { AppState, PanelAppearance } from './types';
import { VEHICLES, type PanelSpec } from './data/vehicles';
import { appearanceKey, colorName, materialLabel } from './data/presets';

export interface PanelCalc {
  panel: PanelSpec;
  appearance: PanelAppearance;
  area: number; // 实际贴膜面积
  strips: number; // 下料条数
  seams: number; // 拼接条数
  stripWidth: number; // 每条膜宽（含搭接）
  stripLength: number; // 每条膜长（含包边预留）
  rawArea: number; // 下料毛面积（平米）
  wasteRate: number; // 耗损率
  overWidth: boolean; // 是否超过膜宽、需要红色接缝
}

export interface MaterialGroup {
  key: string;
  appearance: PanelAppearance;
  colorName: string;
  materialLabel: string;
  area: number; // 净面积合计
  rawArea: number; // 下料面积合计
  totalLength: number; // 用膜总长度（米，按膜卷宽度计）
  totalSeams: number; // 拼接条数合计
  wasteRate: number;
  panels: PanelCalc[];
  unitPrice: number;
  subtotal: number;
}

export interface QuoteResult {
  vehicleLabel: string;
  groups: MaterialGroup[];
  totalArea: number;
  totalRawArea: number;
  totalSeams: number;
  overallWaste: number;
  filmCost: number;
  laborFee: number;
  total: number;
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

export function calcPanel(panel: PanelSpec, appearance: PanelAppearance, state: AppState): PanelCalc {
  const { rollWidth, overlap, trimAllowance } = state;
  const overWidth = panel.width > rollWidth + 0.001;
  let strips: number;
  let stripWidth: number;
  if (overWidth) {
    // 超膜宽：沿车长方向分条，条宽 = 膜宽（条间接搭）
    strips = Math.ceil((panel.width - overlap) / (rollWidth - overlap));
    stripWidth = rollWidth;
  } else {
    strips = 1;
    stripWidth = panel.width;
  }
  const stripLength = panel.length + trimAllowance;
  const seams = Math.max(0, strips - 1);
  const rawArea = round2(stripWidth * stripLength * strips);
  const wasteRate = rawArea > 0 ? (rawArea - panel.area) / rawArea : 0;
  return {
    panel,
    appearance,
    area: panel.area,
    strips,
    seams,
    stripWidth: round2(stripWidth),
    stripLength: round2(stripLength),
    rawArea,
    wasteRate,
    overWidth,
  };
}

export function buildQuote(state: AppState): QuoteResult {
  const spec = VEHICLES[state.vehicle];
  const panelCalcs: PanelCalc[] = spec.panels.map((p) => {
    const appearance = state.overrides[p.id] ?? state.base;
    return calcPanel(p, appearance, state);
  });

  const groupMap = new Map<string, MaterialGroup>();
  for (const pc of panelCalcs) {
    const key = appearanceKey(pc.appearance);
    let g = groupMap.get(key);
    if (!g) {
      g = {
        key,
        appearance: pc.appearance,
        colorName: colorName(pc.appearance.color),
        materialLabel: materialLabel(pc.appearance.material),
        area: 0,
        rawArea: 0,
        totalLength: 0,
        totalSeams: 0,
        wasteRate: 0,
        panels: [],
        unitPrice: state.prices[pc.appearance.material],
        subtotal: 0,
      };
      groupMap.set(key, g);
    }
    g.panels.push(pc);
    g.area = round2(g.area + pc.area);
    g.rawArea = round2(g.rawArea + pc.rawArea);
    g.totalLength = round2(g.totalLength + pc.stripLength * pc.strips);
    g.totalSeams += pc.seams;
  }

  const groups = [...groupMap.values()].map((g) => {
    g.wasteRate = g.rawArea > 0 ? (g.rawArea - g.area) / g.rawArea : 0;
    g.subtotal = round2(g.rawArea * g.unitPrice);
    return g;
  });

  const totalArea = round2(groups.reduce((s, g) => s + g.area, 0));
  const totalRawArea = round2(groups.reduce((s, g) => s + g.rawArea, 0));
  const totalSeams = groups.reduce((s, g) => s + g.totalSeams, 0);
  const overallWaste = totalRawArea > 0 ? (totalRawArea - totalArea) / totalRawArea : 0;
  const filmCost = round2(groups.reduce((s, g) => s + g.subtotal, 0));
  const total = round2(filmCost + state.laborFee);

  return {
    vehicleLabel: spec.label,
    groups,
    totalArea,
    totalRawArea,
    totalSeams,
    overallWaste,
    filmCost,
    laborFee: state.laborFee,
    total,
  };
}

export function wasteLevel(rate: number): { label: string; cls: string } {
  if (rate <= 0.12) return { label: '正常', cls: 'waste-ok' };
  if (rate <= 0.22) return { label: '偏高', cls: 'waste-warn' };
  return { label: '过高，建议优化排料', cls: 'waste-bad' };
}

export function fmtMoney(n: number): string {
  return '¥' + n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtPct(n: number): string {
  return (n * 100).toFixed(1) + '%';
}
