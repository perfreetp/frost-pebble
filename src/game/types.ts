/** 引航站泊位调度训练 —— 领域模型 */

export type Tier = 'beginner' | 'advanced';

export interface Ship {
  id: string;
  name: string;
  /** 船长（米） */
  lengthM: number;
  /** 吃水（米） */
  draftM: number;
  /** 预计到港，相对场景起点的分钟数 */
  etaMin: number;
  /** 潮窗开始（相对分钟） */
  tideFromMin: number;
  /** 潮窗结束（相对分钟） */
  tideToMin: number;
  /** 靠泊作业总时长（含引航、靠泊），分钟 */
  mooringMin: number;
  /** 需要的拖轮数量 */
  tugsNeeded: number;
  cargo: string;
}

export interface Berth {
  id: string;
  name: string;
  /** 泊位限吃水（米） */
  maxDraftM: number;
  /** 泊位可用船长（米） */
  lengthM: number;
}

export interface Pilot {
  id: string;
  name: string;
  note?: string;
}

export interface Tug {
  id: string;
  name: string;
  /** 拖力（吨） */
  powerTon: number;
}

export interface TidePoint {
  /** 相对场景起点的分钟数 */
  min: number;
  /** 潮高（米，理论最低潮面以上） */
  heightM: number;
}

export interface Scenario {
  id: string;
  title: string;
  tier: Tier;
  brief: string;
  /** 场景起点，一天中的分钟数，如 06:00 = 360 */
  startClockMin: number;
  /** 训练时限（分钟），从场景起点算 */
  horizonMin: number;
  berths: Berth[];
  ships: Ship[];
  pilots: Pilot[];
  tugs: Tug[];
  tide: TidePoint[];
  /** 准点容差（分钟） */
  ontimeTolMin: number;
  /** 教师自编题目标记 */
  custom?: boolean;
  /** 内置关卡的参考排班（用于校验关卡可解 / 演示数据） */
  referencePlan?: AssignmentSeed[];
  /** 固定的初始引航员 / 拖轮分配偏好（测试用） */
  referenceNote?: string;
}

export interface AssignmentSeed {
  shipId: string;
  berthId: string;
  pilotId: string;
  tugIds: string[];
  startMin: number;
}

export interface Assignment {
  id: string;
  shipId: string;
  berthId: string;
  /** null = 尚未指派引航员 */
  pilotId: string | null;
  tugIds: string[];
  startMin: number;
}

/* ------------------------------ 拦截规则 ------------------------------ */

export type BlockedRule =
  | 'duplicate-ship'
  | 'eta'
  | 'horizon'
  | 'draft'
  | 'berth-length'
  | 'tide-window'
  | 'berth-overlap'
  | 'pilot-overlap';

export const BLOCKED_RULE_LABELS: Record<BlockedRule, string> = {
  'duplicate-ship': '重复排船',
  eta: '早于预计到港',
  horizon: '超出训练时限',
  draft: '吃水超泊位限制',
  'berth-length': '船长超泊位',
  'tide-window': '错过潮窗',
  'berth-overlap': '泊位时段重叠',
  'pilot-overlap': '引航员时间重叠',
};

export interface BlockedAttempt {
  id: string;
  rule: BlockedRule;
  message: string;
  /** 尝试动作发生的场景分钟（用于回放定位） */
  atMin: number;
  shipId?: string;
  shipName?: string;
  berthName?: string;
  /** 真实时间戳 */
  attemptedAt: string;
  scenarioId: string;
}

export type WarningRule = 'pilot-pending' | 'tug-shortage' | 'tug-overlap' | 'unassigned-ship';

export const WARNING_RULE_LABELS: Record<WarningRule, string> = {
  'pilot-pending': '待指派引航员',
  'tug-shortage': '拖轮不足',
  'tug-overlap': '拖轮时段重叠',
  'unassigned-ship': '未安排靠泊',
};

export interface PlanWarning {
  rule: WarningRule;
  message: string;
  shipId?: string;
  assignmentId?: string;
}

/* ------------------------------ 推演结果 ------------------------------ */

export type OutcomeStatus = 'on-time' | 'late' | 'missed' | 'unassigned';

export interface ShipOutcome {
  shipId: string;
  shipName: string;
  status: OutcomeStatus;
  plannedStartMin: number | null;
  actualStartMin: number | null;
  berthId: string | null;
  pilotId: string | null;
  /** 等待时长（分钟）。未靠泊的船按训练结束时刻计。 */
  waitMin: number;
  /** 相对计划 / ETA 的延误 */
  delayMin: number;
}

export type IncidentCode =
  | 'unassigned'
  | 'pilot-missing'
  | 'tide-delay'
  | 'overrun'
  | 'berth-chain'
  | 'pilot-chain'
  | 'tug-chain'
  | 'tug-shortage';

export interface Incident {
  id: string;
  code: IncidentCode;
  timeMin: number;
  message: string;
  shipIds: string[];
  severity: 'error';
}

export interface ScoreBreakdown {
  /** 准点分（满分 50） */
  punctuality: number;
  /** 无冲突分（满分 30） */
  conflict: number;
  /** 效率分（满分 20） */
  efficiency: number;
}

export interface RunMetrics {
  ships: number;
  berthed: number;
  onTimeCount: number;
  onTimeRate: number;
  incidentCount: number;
  avgWaitMin: number;
  objective: number;
  breakdown: ScoreBreakdown;
}

export interface RunResult {
  outcomes: ShipOutcome[];
  incidents: Incident[];
  metrics: RunMetrics;
}

/* ------------------------------ 教学数据 ------------------------------ */

export interface Student {
  id: string;
  name: string;
  classCode: string;
}

export interface Submission {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  tier: Tier;
  studentId: string;
  studentName: string;
  classCode: string;
  /** 提交时的关卡快照，保证回放稳定 */
  scenario: Scenario;
  assignments: Assignment[];
  result: RunResult;
  blocked: BlockedAttempt[];
  submittedAt: string;
  durationSec: number;
}

export interface Review {
  submissionId: string;
  deduction: number;
  comment: string;
  gradedBy: string;
  gradedAt: string;
}

export interface MistakeStat {
  rule: BlockedRule;
  label: string;
  count: number;
  examples: string[];
}
