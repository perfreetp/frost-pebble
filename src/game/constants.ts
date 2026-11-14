/** 全局调度常量 —— 同时用于前端校验文案与推演引擎，保证解释一致。 */

/** 前后两船之间泊位清空时间（分钟） */
export const BERTH_TURNOVER_MIN = 10;
/** 引航员离船转场与登船准备（分钟） */
export const PILOT_TRAVEL_MIN = 15;
/** 拖轮解缆、返航与再就位（分钟） */
export const TUG_TURNOVER_MIN = 10;

/** 未指派引航员时，船在锚地等待的时间上限（分钟） */
export const NO_PILOT_GRACE_MIN = 45;

/** 评分权重 */
export const SCORE_WEIGHTS = {
  punctuality: 50,
  conflict: 30,
  efficiency: 20,
} as const;

/** 平均等待时长达此值（分钟）效率分归零 */
export const EFFICIENCY_WAIT_CAP_MIN = 120;

/** 准点默认容差（分钟） */
export const DEFAULT_ONTIME_TOL_MIN = 20;
