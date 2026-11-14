import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LayoutParams, Order, Overrides, Photo, RectifyItem, User } from '../domain/types';
import { USERS, orderDeadline, canTransition } from '../domain/workflow';
import { generateLayout, normalizeParams } from '../domain/layout';
import { buildSeedOrders, seedOverridesFor } from '../data/seed';
import { isSampledSubmit, makeAudit, nextSeq } from '../domain/orders';
import { rectifyText } from '../domain/stats';

const STORAGE_KEY = 'gas-street-riser.v1';

export interface AppState {
  version: 1;
  orders: Order[];
  currentUserId: string;
  /** 建单计数，用于工单号 */
  orderSeq: number;
}

export interface NewOrderDraft {
  community: string;
  address: string;
  contact: string;
  params: LayoutParams;
  assigneeId: string | null;
}

function seedState(): AppState {
  const orders = buildSeedOrders().map((o) => ({
    ...o,
    overrides: seedOverridesFor(o),
    rectifications: o.rectifications.map((r) => ({ ...r, text: rectifyText(r.code) })),
  }));
  return { version: 1, orders, currentUserId: 'u-clerk', orderSeq: 30 };
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.orders)) return seedState();
    // 老数据缺少字段时补默认值
    const orders = parsed.orders.map((o) => ({
      ...o,
      overrides: o.overrides ?? { boxes: {}, segments: {} },
      qcSampled: o.qcSampled ?? false,
      submitSeq: o.submitSeq ?? null,
      log: o.log ?? [],
      photos: o.photos ?? [],
      qcRounds: o.qcRounds ?? [],
      rectifications: o.rectifications ?? [],
    }));
    return { ...parsed, orders };
  } catch {
    return seedState();
  }
}

function saveState(state: AppState) {
  try {
    const slim: AppState = {
      ...state,
      orders: state.orders.map((o) => ({
        ...o,
        photos: o.photos.map((p) => (p.dataUrl.length > 400 ? { ...p, dataUrl: '' } : p)),
      })),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
  } catch {
    /* 存储不可用时静默降级为内存态 */
  }
}

export function currentUser(state: AppState): User {
  return USERS.find((u) => u.id === state.currentUserId) ?? USERS[0];
}

export function useAppStore() {
  const [state, setState] = useState<AppState>(() => loadState());
  const saveTimer = useRef<number | null>(null);
  // 最新状态快照：让 updater 保持纯函数，副作用（生成 id、返回对象）在外层完成
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => saveState(state), 300);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [state]);

  const update = useCallback((fn: (s: AppState) => AppState) => setState(fn), []);

  const setCurrentUser = useCallback((id: string) => {
    update((s) => ({ ...s, currentUserId: id }));
  }, [update]);

  const createOrder = useCallback(
    (draft: NewOrderDraft): Order => {
      const now = Date.now();
      const s = stateRef.current;
      const seq = s.orderSeq + 1;
      const user = currentUser(s);
      const params = normalizeParams(draft.params);
      const d = new Date(now);
      const id = `GD-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}-${String(seq).padStart(3, '0')}`;
      const log = [
        makeAudit(
          user,
          '建单',
          `${draft.community.trim()} · ${params.buildingCount} 栋 × ${params.floors} 层 × ${params.householdsPerFloor} 户 · DN${params.pipeDiameter} · ${params.boxSpecId} · 种子 ${params.seed}`,
          now,
        ),
      ];
      const assignee = draft.assigneeId;
      if (assignee) {
        const fm = USERS.find((u) => u.id === assignee);
        log.push(makeAudit(user, '派单', `指派给 ${fm?.name ?? assignee}`, now));
      }
      const created: Order = {
        id,
        community: draft.community.trim(),
        address: draft.address.trim(),
        contact: draft.contact.trim(),
        params,
        overrides: { boxes: {}, segments: {} },
        status: assignee ? 'working' : 'pending',
        assigneeId: assignee,
        createdAt: now,
        deadline: orderDeadline(now, params.floors, params.buildingCount),
        completedAt: null,
        photos: [],
        qcRounds: [],
        rectifications: [],
        reworkCount: 0,
        submitSeq: null,
        qcSampled: false,
        log,
      };
      setState((prev) => ({ ...prev, orders: [created, ...prev.orders], orderSeq: Math.max(prev.orderSeq, seq) }));
      return created;
    },
    [],
  );

  const assignOrder = useCallback(
    (orderId: string, foremanId: string) => {
      const now = Date.now();
      update((s) => {
        const user = currentUser(s);
        return {
          ...s,
          orders: s.orders.map((o) => {
            if (o.id !== orderId) return o;
            if (o.status !== 'pending' && o.status !== 'rework') return o;
            const fm = USERS.find((u) => u.id === foremanId);
            return {
              ...o,
              assigneeId: foremanId,
              status: 'working',
              log: [...o.log, makeAudit(user, '派单', `指派给 ${fm?.name ?? foremanId}`, now)],
            };
          }),
        };
      });
    },
    [update],
  );

  /** 排布工作台：保存参数与手工覆盖到工单 */
  const saveLayout = useCallback(
    (orderId: string, params: LayoutParams, overrides: Overrides) => {
      const now = Date.now();
      update((s) => {
        const user = currentUser(s);
        const order = s.orders.find((o) => o.id === orderId);
        if (!order) return s;
        const before = generateLayout(order.params, order.overrides);
        const after = generateLayout(params, overrides);
        const changes: string[] = [];
        if (before.fingerprint !== after.fingerprint) changes.push(`排布重算 ${before.fingerprint} → ${after.fingerprint}`);
        if (after.stats.manualBoxes !== before.stats.manualBoxes || after.stats.manualSegments !== before.stats.manualSegments) {
          changes.push(`手工标记 ${before.stats.manualBoxes + before.stats.manualSegments} → ${after.stats.manualBoxes + after.stats.manualSegments} 处`);
        }
        if (!changes.length) changes.push('排布确认无变更');
        return {
          ...s,
          orders: s.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  params: normalizeParams(params),
                  overrides,
                  log: [...o.log, makeAudit(user, '调整排布', changes.join('；'), now)],
                }
              : o,
          ),
        };
      });
    },
    [update],
  );

  /** 师傅提交完工：抽中则进待质检，未抽中按规则免检通过 */
  const submitWork = useCallback(
    (orderId: string, photos: Photo[], note: string) => {
      const now = Date.now();
      update((s) => {
        const user = currentUser(s);
        const order = s.orders.find((o) => o.id === orderId);
        if (!order || !canTransition(order.status, 'qc')) return s;
        const seq = nextSeq(s.orders);
        const rework = order.reworkCount > 0;
        const sampled = isSampledSubmit(seq) || rework;
        const log = [
          ...order.log,
          makeAudit(user, '提交完工', `上传 ${photos.length} 张照片${note ? `；${note}` : ''}`, now),
        ];
        if (!sampled) {
          log.push(makeAudit(user, '免抽检通过', `批次 #${seq} 不在 20% 抽查序列内，自动通过`, now + 1));
        }
        const rounds = sampled
          ? order.qcRounds
          : [
              ...order.qcRounds,
              {
                round: order.qcRounds.length + 1,
                sampled: false,
                decision: 'auto-pass' as const,
                items: [],
                note: `批次 #${seq} 未抽中，免检通过`,
                at: now + 1,
              },
            ];
        return {
          ...s,
          orders: s.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  photos: [...o.photos, ...photos],
                  status: sampled ? 'qc' : 'passed',
                  qcSampled: sampled,
                  submitSeq: seq,
                  completedAt: sampled ? null : now,
                  qcRounds: rounds,
                  rectifications: [],
                  log,
                }
              : o,
          ),
        };
      });
    },
    [update],
  );

  /** 质检裁决 */
  const qcDecide = useCallback(
    (orderId: string, decision: 'pass' | 'reject', items: RectifyItem[], note: string) => {
      const now = Date.now();
      update((s) => {
        const user = currentUser(s);
        const order = s.orders.find((o) => o.id === orderId);
        if (!order || order.status !== 'qc' || !canTransition('qc', decision === 'pass' ? 'passed' : 'rework')) return s;
        const round = {
          round: order.qcRounds.length + 1,
          sampled: order.qcSampled,
          decision,
          items,
          note,
          inspectorName: user.name,
          at: now,
        };
        return {
          ...s,
          orders: s.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: decision === 'pass' ? 'passed' : 'rework',
                  completedAt: decision === 'pass' ? now : null,
                  qcRounds: [...o.qcRounds, round],
                  rectifications: decision === 'reject' ? items : [],
                  reworkCount: decision === 'reject' ? o.reworkCount + 1 : o.reworkCount,
                  log: [
                    ...o.log,
                    makeAudit(
                      user,
                      decision === 'pass' ? '质检通过' : '质检退回',
                      decision === 'pass' ? '抽查合格' : `整改项：${items.map((i) => i.code).join('、')}`,
                      now,
                    ),
                  ],
                }
              : o,
          ),
        };
      });
    },
    [update],
  );

  const resetDemo = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(seedState());
  }, [setState]);

  const now = useMemo(() => Date.now(), [state]);

  return {
    state,
    now,
    user: currentUser(state),
    orders: state.orders,
    setCurrentUser,
    createOrder,
    assignOrder,
    saveLayout,
    submitWork,
    qcDecide,
    resetDemo,
  };
}

export type AppStore = ReturnType<typeof useAppStore>;

