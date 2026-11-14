// 工单数据模型与状态机：待接单 -> 制作中 -> 待质检 -> 已完成
//                                    ^          |
//                                    |--- 打回 <-+ (不合格，计一次返工)
// 每次状态变更记录操作人与时间，localStorage 持久化

export type Role = 'frontdesk' | 'master' | 'qc';
export type OrderStatus = 'pending' | 'making' | 'qc' | 'rejected' | 'done';

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: '待接单',
  making: '制作中',
  qc: '待质检',
  rejected: '打回',
  done: '已完成',
};

export const ROLE_LABEL: Record<Role, string> = {
  frontdesk: '前台接单',
  master: '打样师傅',
  qc: '质检员',
};

export interface StatusLog {
  status: OrderStatus;
  operator: string;
  time: number;
  note?: string;
}

export interface ProofInfo {
  imageName: string;
  imageDataUrl: string;  // 原图（已限制尺寸）
  width: number;
  height: number;
  quality: number;       // 30-95
  fileSize: number;      // 压缩后字节数
  psnr: number;
  mse: number;
  warnings: string[];
}

export interface Order {
  id: string;
  customer: string;
  sizeW: number;      // 成品尺寸 cm
  sizeH: number;
  paperWeight: number; // 纸张克重 g/m²
  colors: number;      // 色数
  master: string;      // 分派的师傅
  createdAt: number;
  dueAt: number;       // 交期时间戳
  status: OrderStatus;
  logs: StatusLog[];
  rework: number;      // 返工次数
  proof?: ProofInfo;
  sampled?: boolean;   // 提交质检时按比例抽中
  qcNote?: string;
}

export interface OrderInput {
  customer: string;
  sizeW: number;
  sizeH: number;
  paperWeight: number;
  colors: number;
  master: string;
  dueHours: number;
}

export const MASTERS = ['王师傅', '李师傅', '赵师傅'];

const STORAGE_KEY = 'proof-shop-v1';

interface Persisted {
  orders: Order[];
  operators: Record<Role, string>;
  qcSampleRatio: number;
  seq: number;
}

class Store extends EventTarget {
  orders: Order[] = [];
  operators: Record<Role, string> = { frontdesk: '前台小周', master: MASTERS[0], qc: '质检老陈' };
  qcSampleRatio = 0.5; // 质检抽查比例
  selectedOrderId: string | null = null;
  private seq = 1;

  constructor() {
    super();
    this.load();
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw) as Persisted;
        this.orders = p.orders ?? [];
        this.operators = { ...this.operators, ...p.operators };
        this.qcSampleRatio = p.qcSampleRatio ?? 0.5;
        this.seq = p.seq ?? this.orders.length + 1;
      }
    } catch {
      // 存储损坏则从空开始
    }
  }

  private save(): void {
    const p: Persisted = {
      orders: this.orders,
      operators: this.operators,
      qcSampleRatio: this.qcSampleRatio,
      seq: this.seq,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch {
      // 图片较大时可能超出配额：丢弃最老已完成工单的图片再试
      const done = this.orders.filter((o) => o.status === 'done' && o.proof);
      if (done.length > 0) {
        delete done[0].proof;
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* 放弃持久化 */ }
      }
    }
  }

  private emit(): void {
    this.save();
    this.dispatchEvent(new Event('change'));
  }

  get(id: string): Order | undefined {
    return this.orders.find((o) => o.id === id);
  }

  setOperator(role: Role, name: string): void {
    this.operators[role] = name;
    this.emit();
  }

  setQcSampleRatio(ratio: number): void {
    this.qcSampleRatio = Math.max(0, Math.min(1, ratio));
    this.emit();
  }

  private transition(order: Order, to: OrderStatus, operator: string, note?: string): void {
    order.status = to;
    order.logs.push({ status: to, operator, time: Date.now(), note });
  }

  createOrder(input: OrderInput, operator: string): Order {
    const order: Order = {
      id: `GD${String(this.seq++).padStart(4, '0')}`,
      customer: input.customer,
      sizeW: input.sizeW,
      sizeH: input.sizeH,
      paperWeight: input.paperWeight,
      colors: input.colors,
      master: input.master,
      createdAt: Date.now(),
      dueAt: Date.now() + input.dueHours * 3600_000,
      status: 'pending',
      logs: [{ status: 'pending', operator, time: Date.now(), note: '前台录单' }],
      rework: 0,
    };
    this.orders.unshift(order);
    this.emit();
    return order;
  }

  /** 师傅接单：待接单 -> 制作中 */
  accept(id: string, operator: string): void {
    const o = this.get(id);
    if (!o || o.status !== 'pending') return;
    this.transition(o, 'making', operator, '师傅接单');
    this.selectedOrderId = id;
    this.emit();
  }

  /** 保存打样数据（上传原图 + 压缩结果），不改变状态 */
  saveProof(id: string, proof: ProofInfo): void {
    const o = this.get(id);
    if (!o) return;
    o.proof = proof;
    this.emit();
  }

  /** 提交质检：制作中 -> 待质检，按抽查比例决定是否抽中 */
  submitQc(id: string, operator: string): void {
    const o = this.get(id);
    if (!o || o.status !== 'making' || !o.proof) return;
    o.sampled = Math.random() < this.qcSampleRatio;
    this.transition(o, 'qc', operator, o.sampled ? '提交质检（抽中待检）' : '提交质检（未抽中）');
    this.emit();
  }

  /** 质检合格 / 免检放行：待质检 -> 已完成 */
  qcPass(id: string, operator: string): void {
    const o = this.get(id);
    if (!o || o.status !== 'qc') return;
    this.transition(o, 'done', operator, o.sampled ? '抽检合格' : '免检放行');
    this.emit();
  }

  /** 质检不合格：待质检 -> 打回，计一次返工 */
  qcFail(id: string, operator: string, note: string): void {
    const o = this.get(id);
    if (!o || o.status !== 'qc') return;
    o.rework++;
    o.qcNote = note;
    this.transition(o, 'rejected', operator, note ? `不合格：${note}` : '不合格打回');
    this.emit();
  }

  /** 师傅重新制作：打回 -> 制作中 */
  rework(id: string, operator: string): void {
    const o = this.get(id);
    if (!o || o.status !== 'rejected') return;
    this.transition(o, 'making', operator, '打回后重新制作');
    this.selectedOrderId = id;
    this.emit();
  }

  select(id: string | null): void {
    this.selectedOrderId = id;
    this.dispatchEvent(new Event('change'));
  }

  isOverdue(o: Order): boolean {
    const now = Date.now();
    if (o.status === 'done') {
      const doneLog = [...o.logs].reverse().find((l) => l.status === 'done');
      return doneLog ? doneLog.time > o.dueAt : false;
    }
    return now > o.dueAt;
  }

  doneTime(o: Order): number | null {
    const doneLog = [...o.logs].reverse().find((l) => l.status === 'done');
    return doneLog ? doneLog.time : null;
  }

  /** 看板：按师傅统计完成量 / 返工率 / 超期单数 */
  statsByMaster(): Array<{ master: string; done: number; rework: number; reworkRate: number; overdue: number; active: number }> {
    const map = new Map<string, { done: number; rework: number; overdue: number; active: number }>();
    for (const o of this.orders) {
      const s = map.get(o.master) ?? { done: 0, rework: 0, overdue: 0, active: 0 };
      if (o.status === 'done') s.done++;
      else s.active++;
      s.rework += o.rework;
      if (this.isOverdue(o)) s.overdue++;
      map.set(o.master, s);
    }
    return [...map.entries()].map(([master, s]) => ({
      master,
      done: s.done,
      rework: s.rework,
      reworkRate: s.done + s.rework > 0 ? s.rework / (s.done + s.rework) : 0,
      overdue: s.overdue,
      active: s.active,
    }));
  }

  /** 导出对账清单 CSV（带 BOM，Excel 可直接打开） */
  exportCsv(): string {
    const fmt = (t: number | null) => (t ? new Date(t).toLocaleString('zh-CN', { hour12: false }) : '');
    const head = ['工单号', '客户', '成品尺寸(cm)', '纸张克重(g)', '色数', '师傅', '状态', '返工次数',
      '压缩档位', '压缩后体积(KB)', 'PSNR(dB)', '是否超期', '录单时间', '交期', '完成时间'];
    const rows = this.orders.map((o) => [
      o.id,
      o.customer,
      `${o.sizeW}×${o.sizeH}`,
      String(o.paperWeight),
      String(o.colors),
      o.master,
      STATUS_LABEL[o.status],
      String(o.rework),
      o.proof ? String(o.proof.quality) : '',
      o.proof ? (o.proof.fileSize / 1024).toFixed(1) : '',
      o.proof ? o.proof.psnr.toFixed(2) : '',
      this.isOverdue(o) ? '是' : '否',
      fmt(o.createdAt),
      fmt(o.dueAt),
      fmt(this.doneTime(o)),
    ]);
    const esc = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
    return '﻿' + [head, ...rows].map((r) => r.map(esc).join(',')).join('\r\n');
  }
}

export const store = new Store();
