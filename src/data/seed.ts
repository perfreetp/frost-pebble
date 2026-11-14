import type { LayoutParams, Order, OrderStatus, Overrides, Photo, QcRound, RectifyItem, User } from '../domain/types';
import { DEFAULT_PARAMS, PIPE_DIAMETERS } from '../domain/layout';
import { FOREMEN, USERS, orderDeadline } from '../domain/workflow';
import { makeAudit, modelOf, nextSeq } from '../domain/orders';

const DAY = 86_400_000;

/** 固定的种子基准日，保证每次加载的样例数据一致 */
export const SEED_NOW = new Date(2026, 10, 14, 9, 30).getTime();

const CLERK = USERS.find((u) => u.id === 'u-clerk')!;
const QC = USERS.find((u) => u.id === 'u-qc')!;

function svgPhoto(title: string, hue: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="hsl(${hue},28%,62%)"/><stop offset="1" stop-color="hsl(${hue},30%,34%)"/></linearGradient></defs>
<rect width="480" height="360" fill="url(#g)"/>
<rect y="268" width="480" height="92" fill="hsl(${hue},16%,26%)"/>
<g fill="hsl(${hue},10%,72%)" opacity="0.85">
<rect x="60" y="70" width="120" height="150" rx="4"/><rect x="200" y="70" width="120" height="150" rx="4"/>
<rect x="340" y="70" width="90" height="150" rx="4"/>
</g>
<g fill="hsl(${hue},30%,22%)" opacity="0.7">
<rect x="72" y="84" width="96" height="60"/><rect x="212" y="84" width="96" height="60"/><rect x="352" y="84" width="66" height="60"/>
</g>
<path d="M100 268 L100 120 Q100 112 108 112 L132 112" stroke="hsl(${hue},45%,22%)" stroke-width="7" fill="none"/>
<rect x="128" y="96" width="34" height="30" rx="3" fill="hsl(${hue},55%,34%)" stroke="hsl(${hue},40%,20%)" stroke-width="2"/>
<rect x="248" y="268" width="8" height="150" fill="hsl(${hue},45%,22%)"/>
<rect x="240" y="130" width="26" height="24" rx="2" fill="hsl(${hue},55%,40%)" stroke="hsl(${hue},40%,20%)" stroke-width="2"/>
<text x="24" y="332" font-family="sans-serif" font-size="17" fill="hsla(${hue},20%,96%,0.92)">${title}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function photo(title: string, hue: number, at: number, actor: User): Photo {
  return {
    id: `PH-${at.toString(36)}-${Math.round(hue)}`,
    dataUrl: svgPhoto(title, hue),
    at,
    actorName: actor.name,
    caption: title,
  };
}

interface SeedSpec {
  id: string;
  community: string;
  address: string;
  contact: string;
  params: Partial<LayoutParams>;
  status: OrderStatus;
  assigneeId: string | null;
  createdDaysAgo: number;
  completedDaysAgo?: number;
  reworkCount: number;
  tcq: boolean;
  qcSampled: boolean;
  deadlineDays?: number;
  photos?: number;
  lastQc?: { decision: QcRound['decision']; codes: string[] };
  rectifications?: string[];
}

const SPECS: SeedSpec[] = [
  {
    id: 'GD-2609-014',
    community: '槐荫里小区',
    address: '槐荫路 18 号 1~5 号楼',
    contact: '李志强 138****2210',
    params: { seed: 'HUA IYIN-A', buildingCount: 5, floors: 6, householdsPerFloor: 6, pipeDiameter: 50, boxSpecId: 'BX-2' },
    status: 'working',
    assigneeId: 'u-f1',
    createdDaysAgo: 6,
    reworkCount: 0,
    tcq: false,
    qcSampled: false,
    photos: 0,
  },
  {
    id: 'GD-2609-021',
    community: '光华路四村',
    address: '光华路 102 弄 3~7 号楼',
    contact: '王彩凤 139****7742',
    params: { seed: 'GUANGHUA-4C', buildingCount: 4, floors: 7, householdsPerFloor: 4, pipeDiameter: 40, boxSpecId: 'BX-1' },
    status: 'qc',
    assigneeId: 'u-f2',
    createdDaysAgo: 11,
    reworkCount: 0,
    tcq: false,
    qcSampled: false,
    photos: 4,
  },
  {
    id: 'GD-2609-026',
    community: '紫竹苑东区',
    address: '紫竹路 66 号 8~12 号楼',
    contact: '陈慧 137****5589',
    params: { seed: 'ZIZHU-E', buildingCount: 5, floors: 8, householdsPerFloor: 6, pipeDiameter: 65, boxSpecId: 'BX-2' },
    status: 'passed',
    assigneeId: 'u-f3',
    createdDaysAgo: 34,
    completedDaysAgo: 21,
    reworkCount: 1,
    tcq: false,
    qcSampled: true,
    photos: 5,
    lastQc: { decision: 'pass', codes: [] },
  },
  {
    id: 'GD-2610-003',
    community: '南园北路社区',
    address: '南园北路 9 号 1~3 号楼',
    contact: '赵国强 135****3301',
    params: { seed: 'NANYUAN-N', buildingCount: 3, floors: 5, householdsPerFloor: 4, pipeDiameter: 40, boxSpecId: 'BX-1', floorHeight: 2.9 },
    status: 'rework',
    assigneeId: 'u-f1',
    createdDaysAgo: 16,
    reworkCount: 1,
    tcq: false,
    qcSampled: true,
    photos: 3,
    lastQc: { decision: 'reject', codes: ['R01', 'R05'] },
    rectifications: ['R01', 'R05'],
  },
  {
    id: 'GD-2610-008',
    community: '同福里',
    address: '同福路 22 号 2 号楼',
    contact: '孙桂英 136****9012',
    params: { seed: 'TONGFU-2', buildingCount: 1, floors: 4, householdsPerFloor: 3, pipeDiameter: 32, boxSpecId: 'BX-1' },
    status: 'pending',
    assigneeId: null,
    createdDaysAgo: 1,
    reworkCount: 0,
    tcq: false,
    qcSampled: false,
  },
  {
    id: 'GD-2610-009',
    community: '文昌花园',
    address: '文昌街 5 号 1~6 号楼',
    contact: '刘建平 138****6620',
    params: { seed: 'WENCHANG-G', buildingCount: 6, floors: 6, householdsPerFloor: 6, pipeDiameter: 50, boxSpecId: 'BX-2' },
    status: 'pending',
    assigneeId: null,
    createdDaysAgo: 2,
    reworkCount: 0,
    tcq: false,
    qcSampled: false,
  },
  {
    id: 'GD-2610-011',
    community: '龙湖里三期',
    address: '龙湖路 88 号 15 号楼',
    contact: '周晓东 139****4471',
    params: { seed: 'LONGHU-3', buildingCount: 1, floors: 11, householdsPerFloor: 4, pipeDiameter: 65, boxSpecId: 'BX-2' },
    status: 'working',
    assigneeId: 'u-f2',
    createdDaysAgo: 9,
    reworkCount: 0,
    tcq: false,
    qcSampled: false,
  },
  {
    id: 'GD-2610-015',
    community: '民安里小区',
    address: '民安路 31 号 4~8 号楼',
    contact: '吴敏 137****1188',
    params: { seed: 'MINAN-L', buildingCount: 5, floors: 6, householdsPerFloor: 5, pipeDiameter: 50, boxSpecId: 'BX-2' },
    status: 'passed',
    assigneeId: 'u-f3',
    createdDaysAgo: 48,
    completedDaysAgo: 33,
    reworkCount: 0,
    tcq: false,
    qcSampled: false,
    photos: 4,
    lastQc: { decision: 'auto-pass', codes: [] },
  },
  {
    id: 'GD-2610-019',
    community: '康乐新村',
    address: '康乐路 12 号 1~2 号楼',
    contact: '郑爱华 135****2266',
    params: { seed: 'KANGLE-X', buildingCount: 2, floors: 5, householdsPerFloor: 4, pipeDiameter: 40, boxSpecId: 'BX-1' },
    status: 'working',
    assigneeId: 'u-f3',
    createdDaysAgo: 4,
    reworkCount: 0,
    tcq: false,
    qcSampled: false,
  },
  {
    id: 'GD-2611-001',
    community: '育才路小区',
    address: '育才路 7 号 3 号楼',
    contact: '黄立群 138****7753',
    params: { seed: 'YUCAI-3', buildingCount: 1, floors: 6, householdsPerFloor: 6, pipeDiameter: 50, boxSpecId: 'BX-3' },
    status: 'qc',
    assigneeId: 'u-f1',
    createdDaysAgo: 7,
    reworkCount: 1,
    tcq: false,
    qcSampled: true,
    photos: 3,
    lastQc: { decision: 'reject', codes: ['R02'] },
    rectifications: ['R02'],
  },
];

export function buildSeedOrders(): Order[] {
  const orders: Order[] = [];
  let seq = 0;

  for (const spec of SPECS) {
    const createdAt = SEED_NOW - spec.createdDaysAgo * DAY;
    const params: LayoutParams = { ...DEFAULT_PARAMS, ...spec.params, rules: { ...DEFAULT_PARAMS.rules, ...(spec.params.rules ?? {}) } };
    if (!PIPE_DIAMETERS.includes(params.pipeDiameter)) params.pipeDiameter = 50;
    const deadline = spec.deadlineDays
      ? createdAt + spec.deadlineDays * DAY
      : orderDeadline(createdAt, params.floors, params.buildingCount);

    const log = [makeAudit(CLERK, '建单', `小区 ${spec.community}，${params.buildingCount} 栋 × ${params.floors} 层 × ${params.householdsPerFloor} 户，DN${params.pipeDiameter}，${params.boxSpecId}`, createdAt)];

    const status: OrderStatus = spec.status;

    if (spec.assigneeId) {
      const fm = FOREMEN.find((f) => f.id === spec.assigneeId)!;
      log.push(makeAudit(CLERK, '派单', `指派给 ${fm.name}`, createdAt + 0.4 * DAY));
    }

    const photos: Photo[] = [];
    if (spec.photos) {
      const fmUser = USERS.find((u) => u.id === spec.assigneeId) ?? CLERK;
      const titles = ['立管安装完成', '表箱固定', '穿墙套管封堵', '整体外观', '表箱标高复测'];
      const submitAt = createdAt + Math.max(1, spec.createdDaysAgo - 2) * DAY;
      for (let i = 0; i < spec.photos; i++) {
        photos.push(photo(titles[i % titles.length], 195 + i * 26, submitAt - (titles.length - i) * 600_000, fmUser));
      }
    }

    const qcRounds: QcRound[] = [];
    if (spec.lastQc) {
      const at = createdAt + Math.max(2, spec.createdDaysAgo - 1) * DAY;
      const items: RectifyItem[] = spec.lastQc.codes.map((code, i) => ({
        id: `RC-${spec.id}-${i}`,
        code,
        text: '',
      }));
      qcRounds.push({
        round: qcRounds.length + 1,
        sampled: spec.qcSampled,
        decision: spec.lastQc.decision,
        items,
        inspectorName: QC.name,
        note: spec.lastQc.decision === 'reject' ? '现场复核未达标，整改后重新提交' : '抽查合格',
        at,
      });
    }

    const completedAt = status === 'passed' ? SEED_NOW - (spec.completedDaysAgo ?? 1) * DAY : null;

    if (status === 'passed') {
      log.push(makeAudit(USERS.find((u) => u.id === spec.assigneeId) ?? CLERK, '提交完工', `上传 ${photos.length} 张现场照片`, (completedAt ?? SEED_NOW) - 3 * 3600_000));
      log.push(makeAudit(QC, '质检通过', `返工 ${spec.reworkCount} 次`, completedAt ?? SEED_NOW));
    } else if (status === 'qc') {
      log.push(makeAudit(USERS.find((u) => u.id === spec.assigneeId) ?? CLERK, '提交质检', `上传 ${photos.length} 张现场照片`, SEED_NOW - 0.6 * DAY));
    } else if (status === 'rework') {
      log.push(makeAudit(QC, '质检退回', `整改项 ${spec.rectifications?.length ?? 0} 条`, SEED_NOW - 1.2 * DAY));
    }

    seq += 1;
    orders.push({
      id: spec.id,
      community: spec.community,
      address: spec.address,
      contact: spec.contact,
      params,
      overrides: { boxes: {}, segments: {} },
      status,
      assigneeId: spec.assigneeId,
      createdAt,
      deadline,
      completedAt,
      photos,
      qcRounds,
      rectifications: (spec.rectifications ?? []).map((code, i) => ({ id: `RC-${spec.id}-${i}`, code, text: '' })),
      reworkCount: spec.reworkCount,
      submitSeq: status === 'pending' || status === 'working' ? null : seq,
      qcSampled: spec.qcSampled,
      log,
    });
  }

  return orders;
}

/** 为样例数据补充手工标记，展示"改过的位置" */
export function seedOverridesFor(order: Order): Overrides {
  if (order.id !== 'GD-2609-014') return { boxes: {}, segments: {} };
  const model = modelOf(order);
  const boxes = model.boxes.filter((b) => b.buildingIndex === 0 && b.floor === 1);
  if (boxes.length < 2) return { boxes: {}, segments: {} };
  const [b0, b1] = boxes;
  const seg = model.segments.find((s) => s.buildingIndex === 0 && s.index === 1);
  const out: Overrides = {
    boxes: {
      [b0.id]: { x: b0.x + 0.35, y: b0.y + 0.18, z: b0.z },
      [b1.id]: { x: b1.x, y: b1.y + 0.55, z: b1.z },
    },
    segments: {},
  };
  if (seg) out.segments[seg.id] = 3.65;
  return out;
}

export { nextSeq };
