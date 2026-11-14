// 全局常量(单位:米)
export const GRID = 0.5;               // 吸附网格
export const MAX_LAYERS = 4;           // 叠放层数上限(>4 标红)
export const MIN_AISLE = 1.0;          // 最小走道宽度(俯视图提示)
export const STORAGE_KEY = 'mushroom-delivery-v1';

// 棚区默认尺寸(米)
export const DEFAULT_SHED = { w: 12, d: 30, h: 4.5 };

// 设备目录:type -> 名称、默认尺寸(w 宽 x, d 深 z, h 高 y)、颜色、单位
export const EQUIP_TYPES = {
  rack:     { name: '层架',   w: 1.5, d: 5.0, h: 2.6, color: 0x8d6e63, unit: '套' },
  tray:     { name: '托盘',   w: 1.3, d: 1.1, h: 0.15, color: 0xc0a06a, unit: '个' },
  pipe:     { name: '加湿管道', w: 0.12, d: 4.0, h: 0.12, color: 0x4fc3f7, unit: '米' },
  fan:      { name: '环流风机', w: 0.7, d: 0.7, h: 0.7, color: 0x90a4ae, unit: '台' },
  light:    { name: '采光灯',  w: 0.6, d: 0.15, h: 0.1, color: 0xffe082, unit: '盏' },
  column:   { name: '立柱',   w: 0.4, d: 0.4, h: 4.5, color: 0x546e7a, unit: '根' }
};

export const STATUS_FLOW = ['草稿', '制作中', '待审核', '已退回', '已交付'];

export const ROLE_LABEL = { maker: '制作员', supervisor: '主管', customer: '客户' };
