import type { VehicleType } from '../types';

export type SlotReason = '开槽' | '拼接' | '开槽+拼接';

export interface PanelSpec {
  id: string;
  label: string;
  group: '前脸' | '车顶' | '车侧' | '尾部' | '车厢';
  /** 实际贴膜面积（平米，已含基本曲面展开系数） */
  area: number;
  /** 展开下料矩形 宽（米，车宽方向） */
  width: number;
  /** 展开下料矩形 长（米，车长方向） */
  length: number;
  /** 是否为引擎盖/车顶这类允许双拼的大面 */
  bigFace: boolean;
  /** 施工提示：需要开槽或拼接的位置说明 */
  slotHint: string;
  slotReason: SlotReason;
  /** 建议接缝走向文字（藏在棱线里） */
  seamAdvice: string;
  /** 该分块在车身上的语义位置，用于 3D 取色 */
  zone:
    | 'hood'
    | 'roof'
    | 'trunk'
    | 'leftDoor'
    | 'rightDoor'
    | 'leftFender'
    | 'rightFender'
    | 'frontBumper'
    | 'rearBumper'
    | 'leftQuarter'
    | 'rightQuarter'
    | 'tailgate'
    | 'bedSideL'
    | 'bedSideR';
}

export interface VehicleSpec {
  type: VehicleType;
  label: string;
  /** 外廓尺寸（米） */
  overallLength: number;
  overallWidth: number;
  overallHeight: number;
  panels: PanelSpec[];
}

const commonHints = {
  hood: '机盖锁/喷水嘴/通风口处开槽，膜片沿棱线中线分两片拼接',
  roof: '天窗边框、鲨鱼鳍天线处开槽；超膜宽沿车顶纵向棱线拼接',
  door: '门把手、油箱盖（若在门板）处开槽，门边收边预留 8cm',
  fender: '轮眉弧线开槽收边，后视镜底座单独下料',
  bumper: '雷达孔、格栅、拖车盖逐点开槽，弧度处分片热烤',
  quarter: '油箱盖开槽，轮眉及后风挡边缘收边',
};

export const VEHICLES: Record<VehicleType, VehicleSpec> = {
  sedan: {
    type: 'sedan',
    label: '轿车',
    overallLength: 4.8,
    overallWidth: 1.83,
    overallHeight: 1.45,
    panels: [
      { id: 'hood', label: '引擎盖', group: '前脸', area: 1.55, width: 1.62, length: 1.1, bigFace: true, slotHint: commonHints.hood, slotReason: '开槽+拼接', seamAdvice: '接缝沿机盖中央冲压棱线纵向布置，藏于筋线阴影中', zone: 'hood' },
      { id: 'roof', label: '车顶', group: '车顶', area: 1.95, width: 1.6, length: 1.45, bigFace: true, slotHint: commonHints.roof, slotReason: '开槽+拼接', seamAdvice: '沿车顶两条纵向冲压筋之间中线走缝，避开天窗', zone: 'roof' },
      { id: 'trunk', label: '后备箱盖', group: '尾部', area: 1.1, width: 1.5, length: 0.85, bigFace: false, slotHint: '车标、牌照灯、倒车摄像头处开槽', slotReason: '开槽', seamAdvice: '单片可覆盖，接缝沿尾门上部折线收边', zone: 'trunk' },
      { id: 'ldoor', label: '左前门+后门', group: '车侧', area: 2.6, width: 1.15, length: 2.4, bigFace: false, slotHint: commonHints.door, slotReason: '开槽+拼接', seamAdvice: '前后门接缝藏在 B 柱缝隙内，腰线以下分片', zone: 'leftDoor' },
      { id: 'rdoor', label: '右前门+后门', group: '车侧', area: 2.6, width: 1.15, length: 2.4, bigFace: false, slotHint: commonHints.door, slotReason: '开槽+拼接', seamAdvice: '前后门接缝藏在 B 柱缝隙内，腰线以下分片', zone: 'rightDoor' },
      { id: 'lfender', label: '左前翼子板', group: '车侧', area: 0.85, width: 0.9, length: 1.05, bigFace: false, slotHint: commonHints.fender, slotReason: '开槽', seamAdvice: '单片覆盖，边缘沿翼子板棱线收边', zone: 'leftFender' },
      { id: 'rfender', label: '右前翼子板', group: '车侧', area: 0.85, width: 0.9, length: 1.05, bigFace: false, slotHint: commonHints.fender, slotReason: '开槽', seamAdvice: '单片覆盖，边缘沿翼子板棱线收边', zone: 'rightFender' },
      { id: 'lquarter', label: '左后翼子板', group: '车侧', area: 1.15, width: 1.0, length: 1.35, bigFace: false, slotHint: commonHints.quarter, slotReason: '开槽', seamAdvice: '沿 C 柱棱线收边，轮眉处热烤贴合', zone: 'leftQuarter' },
      { id: 'rquarter', label: '右后翼子板', group: '车侧', area: 1.15, width: 1.0, length: 1.35, bigFace: false, slotHint: commonHints.quarter, slotReason: '开槽', seamAdvice: '沿 C 柱棱线收边，轮眉处热烤贴合', zone: 'rightQuarter' },
      { id: 'fbumper', label: '前保险杠', group: '前脸', area: 1.2, width: 1.75, length: 0.7, bigFace: false, slotHint: commonHints.bumper, slotReason: '开槽+拼接', seamAdvice: '左右两片在格栅中线拼接，缝藏进气格栅黑区', zone: 'frontBumper' },
      { id: 'rbumper', label: '后保险杠', group: '尾部', area: 1.05, width: 1.72, length: 0.6, bigFace: false, slotHint: '雷达孔、反光条、排气装饰处开槽', slotReason: '开槽+拼接', seamAdvice: '左右分片，接缝藏在牌照安装位凹陷内', zone: 'rearBumper' },
    ],
  },
  suv: {
    type: 'suv',
    label: 'SUV',
    overallLength: 4.78,
    overallWidth: 1.9,
    overallHeight: 1.72,
    panels: [
      { id: 'hood', label: '引擎盖', group: '前脸', area: 1.7, width: 1.68, length: 1.15, bigFace: true, slotHint: commonHints.hood, slotReason: '开槽+拼接', seamAdvice: '接缝沿机盖中央冲压棱线纵向布置，藏于筋线阴影中', zone: 'hood' },
      { id: 'roof', label: '车顶', group: '车顶', area: 2.35, width: 1.7, length: 1.75, bigFace: true, slotHint: commonHints.roof + '；行李架底座逐点开槽', slotReason: '开槽+拼接', seamAdvice: '沿车顶纵向棱线走缝，行李架与缝保持 5cm 以上间距', zone: 'roof' },
      { id: 'tailgate', label: '尾门', group: '尾部', area: 1.5, width: 1.55, length: 1.1, bigFace: false, slotHint: '后雨刮、车标、摄像头、牌照灯处开槽', slotReason: '开槽+拼接', seamAdvice: '风挡下沿折线为天然分界，必要时竖缝藏尾门棱线', zone: 'tailgate' },
      { id: 'ldoor', label: '左前门+后门', group: '车侧', area: 2.9, width: 1.25, length: 2.5, bigFace: false, slotHint: commonHints.door + '；侧踏板边缘收边', slotReason: '开槽+拼接', seamAdvice: 'B 柱藏缝，门板腰线处分上下两片', zone: 'leftDoor' },
      { id: 'rdoor', label: '右前门+后门', group: '车侧', area: 2.9, width: 1.25, length: 2.5, bigFace: false, slotHint: commonHints.door + '；侧踏板边缘收边', slotReason: '开槽+拼接', seamAdvice: 'B 柱藏缝，门板腰线处分上下两片', zone: 'rightDoor' },
      { id: 'lfender', label: '左前翼子板', group: '车侧', area: 0.95, width: 0.95, length: 1.1, bigFace: false, slotHint: commonHints.fender, slotReason: '开槽', seamAdvice: '单片覆盖，轮眉防擦条边缘收边', zone: 'leftFender' },
      { id: 'rfender', label: '右前翼子板', group: '车侧', area: 0.95, width: 0.95, length: 1.1, bigFace: false, slotHint: commonHints.fender, slotReason: '开槽', seamAdvice: '单片覆盖，轮眉防擦条边缘收边', zone: 'rightFender' },
      { id: 'lquarter', label: '左后围/翼子板', group: '车侧', area: 1.45, width: 1.15, length: 1.5, bigFace: false, slotHint: commonHints.quarter + '；D 柱弧度大需分片热烤', slotReason: '开槽+拼接', seamAdvice: '沿 D 柱与侧窗下沿棱线布置竖缝', zone: 'leftQuarter' },
      { id: 'rquarter', label: '右后围/翼子板', group: '车侧', area: 1.45, width: 1.15, length: 1.5, bigFace: false, slotHint: commonHints.quarter + '；D 柱弧度大需分片热烤', slotReason: '开槽+拼接', seamAdvice: '沿 D 柱与侧窗下沿棱线布置竖缝', zone: 'rightQuarter' },
      { id: 'fbumper', label: '前保险杠', group: '前脸', area: 1.35, width: 1.82, length: 0.75, bigFace: false, slotHint: commonHints.bumper + '；雾灯框单独收边', slotReason: '开槽+拼接', seamAdvice: '左右两片在格栅中线拼接，缝藏进气格栅黑区', zone: 'frontBumper' },
      { id: 'rbumper', label: '后保险杠', group: '尾部', area: 1.2, width: 1.8, length: 0.65, bigFace: false, slotHint: '雷达孔、反光条处开槽', slotReason: '开槽+拼接', seamAdvice: '左右分片，接缝藏在牌照安装位凹陷内', zone: 'rearBumper' },
    ],
  },
  pickup: {
    type: 'pickup',
    label: '皮卡',
    overallLength: 5.4,
    overallWidth: 1.94,
    overallHeight: 1.82,
    panels: [
      { id: 'hood', label: '引擎盖', group: '前脸', area: 1.85, width: 1.75, length: 1.2, bigFace: true, slotHint: commonHints.hood + '；通风口装饰件开槽', slotReason: '开槽+拼接', seamAdvice: '沿机盖两条筋线之间的中线纵向走缝', zone: 'hood' },
      { id: 'roof', label: '车顶', group: '车顶', area: 2.05, width: 1.7, length: 1.5, bigFace: true, slotHint: commonHints.roof, slotReason: '开槽+拼接', seamAdvice: '沿车顶纵向棱线走缝，避开天线底座', zone: 'roof' },
      { id: 'ldoor', label: '左前门+后门', group: '车侧', area: 2.85, width: 1.25, length: 2.45, bigFace: false, slotHint: commonHints.door, slotReason: '开槽+拼接', seamAdvice: 'B 柱藏缝，腰线处分片', zone: 'leftDoor' },
      { id: 'rdoor', label: '右前门+后门', group: '车侧', area: 2.85, width: 1.25, length: 2.45, bigFace: false, slotHint: commonHints.door, slotReason: '开槽+拼接', seamAdvice: 'B 柱藏缝，腰线处分片', zone: 'rightDoor' },
      { id: 'lfender', label: '左前翼子板', group: '车侧', area: 1.0, width: 1.0, length: 1.15, bigFace: false, slotHint: commonHints.fender, slotReason: '开槽', seamAdvice: '单片覆盖，轮眉棱线收边', zone: 'leftFender' },
      { id: 'rfender', label: '右前翼子板', group: '车侧', area: 1.0, width: 1.0, length: 1.15, bigFace: false, slotHint: commonHints.fender, slotReason: '开槽', seamAdvice: '单片覆盖，轮眉棱线收边', zone: 'rightFender' },
      { id: 'bedsidel', label: '左货箱侧围', group: '车厢', area: 2.2, width: 1.2, length: 1.85, bigFace: true, slotHint: '油箱盖、货箱锚点开槽，上沿卷边收边', slotReason: '开槽+拼接', seamAdvice: '超宽沿货箱上沿加强筋下方走水平缝，藏于冲压凹槽', zone: 'bedSideL' },
      { id: 'bedsider', label: '右货箱侧围', group: '车厢', area: 2.2, width: 1.2, length: 1.85, bigFace: true, slotHint: '货箱锚点开槽，上沿卷边收边', slotReason: '开槽+拼接', seamAdvice: '超宽沿货箱上沿加强筋下方走水平缝，藏于冲压凹槽', zone: 'bedSideR' },
      { id: 'tailgate', label: '货箱尾门', group: '尾部', area: 1.6, width: 1.65, length: 1.05, bigFace: true, slotHint: '拉手、车标、倒车摄像头、牌照灯处开槽', slotReason: '开槽+拼接', seamAdvice: '沿尾门冲压凹槽中线竖缝，或藏拉手所在水平棱线', zone: 'tailgate' },
      { id: 'fbumper', label: '前保险杠', group: '前脸', area: 1.4, width: 1.85, length: 0.75, bigFace: false, slotHint: commonHints.bumper, slotReason: '开槽+拼接', seamAdvice: '左右两片在格栅中线拼接，缝藏进气格栅黑区', zone: 'frontBumper' },
      { id: 'rbumper', label: '后保险杠/踏板', group: '尾部', area: 1.1, width: 1.85, length: 0.6, bigFace: false, slotHint: '雷达孔、踏板防滑槽处开槽', slotReason: '开槽+拼接', seamAdvice: '左右分片，中缝藏拖车方口安装位', zone: 'rearBumper' },
    ],
  },
};

export const vehicleList = (): VehicleSpec[] => [VEHICLES.sedan, VEHICLES.suv, VEHICLES.pickup];
