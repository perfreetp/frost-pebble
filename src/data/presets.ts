import type { MaterialType, PanelAppearance } from '../types';

export interface MaterialMeta {
  type: MaterialType;
  label: string;
  desc: string;
  defaults: Omit<PanelAppearance, 'color'>;
  defaultPrice: number; // 元/平米
}

/** 四类材质预设 */
export const MATERIALS: MaterialMeta[] = [
  {
    type: 'glossy',
    label: '亮面',
    desc: '高亮清漆层，镜面反光',
    defaults: { material: 'glossy', metalness: 0, roughness: 0.18 },
    defaultPrice: 88,
  },
  {
    type: 'matte',
    label: '哑光',
    desc: '低光泽丝绒质感',
    defaults: { material: 'matte', metalness: 0, roughness: 0.78 },
    defaultPrice: 98,
  },
  {
    type: 'chrome',
    label: '电镀',
    desc: '全金属镜面反射',
    defaults: { material: 'chrome', metalness: 1, roughness: 0.06 },
    defaultPrice: 168,
  },
  {
    type: 'chameleon',
    label: '变色龙',
    desc: '随角度变色的虹彩膜',
    defaults: { material: 'chameleon', metalness: 0.3, roughness: 0.25 },
    defaultPrice: 138,
  },
];

export const materialLabel = (t: MaterialType): string =>
  MATERIALS.find((m) => m.type === t)?.label ?? t;

/** 预设色卡 */
export interface ColorCard {
  name: string;
  hex: string;
}

export const COLOR_CARDS: ColorCard[] = [
  { name: '珍珠白', hex: '#f2f1ec' },
  { name: '钢琴黑', hex: '#0b0b0e' },
  { name: '烈焰红', hex: '#c0151f' },
  { name: '酒红', hex: '#6e0d25' },
  { name: '活力橙', hex: '#e8641c' },
  { name: '芒果黄', hex: '#f5c518' },
  { name: '荧光绿', hex: '#76e829' },
  { name: '军绿', hex: '#4b5320' },
  { name: '祖母绿', hex: '#0f5132' },
  { name: '薄荷绿', hex: '#9fe2bf' },
  { name: '湖光蓝', hex: '#2aa7c7' },
  { name: '宝石蓝', hex: '#0b3d91' },
  { name: '深蓝', hex: '#10233f' },
  { name: '水晶紫', hex: '#5b3a8e' },
  { name: '樱花粉', hex: '#f2b8c6' },
  { name: '香槟金', hex: '#c9a86a' },
  { name: '钛金灰', hex: '#6e7478' },
  { name: '水泥灰', hex: '#9aa0a3' },
  { name: '银', hex: '#c0c4c8' },
  { name: '摩卡棕', hex: '#6f4e37' },
];

export function colorName(hex: string): string {
  const hit = COLOR_CARDS.find((c) => c.hex.toLowerCase() === hex.toLowerCase());
  return hit ? hit.name : hex.toUpperCase();
}

/** 外观签名：同色同材质的分块合并算料 */
export function appearanceKey(a: PanelAppearance): string {
  return [a.color.toLowerCase(), a.material, a.metalness.toFixed(2), a.roughness.toFixed(2)].join('|');
}
