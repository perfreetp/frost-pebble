import { For, Show, createMemo, createSignal } from 'solid-js';
import { formatCct, formatDate, formatPct, remainingLabel } from '../lib/color';
import { bgById, currentPerson, decideReview, itemsOfProject, projectById, setActiveItem, state, toast } from '../lib/store';
import type { Item } from '../lib/types';
import { IconCheck, IconClock, IconPackage, IconRework, IconSend, IconX } from '../components/icons';

export function ReviewView(p: { onOpenItem: (id: string) => void }) {
  const [selected, setSelected] = createSignal<string | null>(null);
  const [comment, setComment] = createSignal('');
  const [busy, setBusy] = createSignal(false);

  const queue = createMemo(() =>
    state.items
      .filter((i) => i.status === 'review')
      .sort((a, b) => (a.submittedAt ?? 0) - (b.submittedAt ?? 0) || a.index - b.index),
  );
  const active = createMemo(() => {
    const id = selected();
    return state.items.find((i) => (id ? i.id === id : i.status === 'review')) ?? queue()[0];
  });
  const project = () => (active() ? projectById(active()!.projectId) : undefined);

  const decide = async (decision: 'approved' | 'rejected') => {
    const item = active();
    if (!item) return;
    if (decision === 'rejected' && comment().trim().length < 4) {
      toast('warn', '退回需要写明意见', '主管意见会直接推给制作员，请至少写清楚具体问题。');
      return;
    }
    setBusy(true);
    try {
      await decideReview(item.id, decision, comment().trim() || '验收通过。', item.proofMetrics);
      toast(
        decision === 'approved' ? 'ok' : 'warn',
        decision === 'approved' ? '已通过' : '已退回',
        decision === 'approved'
          ? '条目将进入项目打包清单。'
          : `返工次数已累加到 ${item.reworkCount + 1} 次。`,
      );
      setComment('');
      setSelected(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div class="review-layout">
      <div class="queue">
        <div class="queue-head">
          <div class="section-title" style={{ margin: 0 }}>
            <IconSend size={13} /> 待审核
            <span class="rule" style={{ width: '24px' }} />
          </div>
          <span class="chip amber">{queue().length}</span>
        </div>
        <Show when={queue().length === 0}>
          <div class="empty-col" style={{ padding: '34px 0' }}>
            没有待审核的条目
            <div style={{ 'margin-top': '6px', 'font-size': '11px', color: '#4a5766' }}>制作员提交后会出现在这里</div>
          </div>
        </Show>
        <For each={queue()}>
          {(item) => (
            <div class={`queue-item ${active()?.id === item.id ? 'on' : ''}`} onClick={() => setSelected(item.id)}>
              <div class="qi-thumb" style={{ 'background-image': `url(${item.proof || item.thumb})` }} />
              <div class="qi-body">
                <div class="qi-title">{item.title}</div>
                <div class="qi-meta">
                  <span class="mono">#{String(item.index).padStart(2, '0')}</span>
                  <span>·</span>
                  <span>{item.ownerName}</span>
                  <Show when={item.reworkCount > 0}>
                    <span class="chip red" style={{ height: '16px', 'font-size': '10px', padding: '0 5px' }}>
                      返工 {item.reworkCount}
                    </span>
                  </Show>
                </div>
              </div>
            </div>
          )}
        </For>
      </div>

      <div class="review-main">
        <Show
          when={active()}
          fallback={
            <div class="empty-col" style={{ 'padding-top': '80px', 'font-size': '13px' }}>
              审核队列已清空
              <div style={{ 'margin-top': '8px', 'font-size': '11.5px', color: '#4a5766' }}>
                制作员提交新条目后会出现在左侧队列
              </div>
            </div>
          }
        >
          {(item) => (
            <>
              <div class="review-head">
                <div>
                  <h2 class="review-title">{item().title}</h2>
                  <div class="review-sub">
                    {project()?.code} · {project()?.brand} · 制作 {item().ownerName} · 提交于{' '}
                    {item().submittedAt ? formatDate(item().submittedAt!) : '—'}
                  </div>
                </div>
                <div style={{ flex: 1 }} />
                <Show when={item().reworkCount > 0}>
                  <span class="chip red dot">已返工 {item().reworkCount} 次</span>
                </Show>
                <span class={`chip ${remainingLabel(project()?.dueAt ?? Date.now(), Date.now()).urgency === 'over' ? 'red' : 'amber'}`}>
                  <IconClock size={11} /> {remainingLabel(project()?.dueAt ?? Date.now(), Date.now()).text}
                </span>
                <button class="btn sm" onClick={() => p.onOpenItem(item().id)}>
                  在制作台打开
                </button>
              </div>

              <div class="review-preview">
                <Show when={item().proof} fallback={<div class="empty-col">制作员未附合成预览</div>}>
                  <img src={item().proof!} alt="审核预览" />
                </Show>
                <span class="preview-tag">
                  提交快照 · {item().proofMetrics ? '含质检数据' : '无质检数据'}
                </span>
              </div>

              <CheckSheet item={item()} />

              <div class="review-note" style={{ 'margin-top': '16px' }}>
                <label class="field">
                  <span class="field-label">
                    <span>审核意见</span>
                    <b>{comment().length} 字</b>
                  </span>
                  <textarea
                    class="text-input"
                    placeholder="退回时请写清具体问题，例如：左轮下沿有底色残留、主体色温偏冷 800K、投影方向与背景光向不一致…"
                    value={comment()}
                    onInput={(e) => setComment(e.currentTarget.value)}
                  />
                </label>
              </div>

              <div class="review-actions">
                <button class="btn danger" disabled={busy()} onClick={() => decide('rejected')}>
                  <IconRework size={14} /> 退回返工
                </button>
                <div style={{ flex: 1 }} />
                <button class="btn primary" disabled={busy() || !item().proof} onClick={() => decide('approved')}>
                  <IconCheck size={14} /> 验收通过
                </button>
              </div>

              <div class="section" style={{ 'margin-top': '26px' }}>
                <div class="section-title">
                  审核时间线
                  <span class="rule" />
                </div>
                <div class="timeline">
                  <For each={[...item().reviews].reverse()}>
                    {(rev) => (
                      <div class="tl-item">
                        <div class={`tl-dot ${rev.decision === 'approved' ? 'ok' : 'no'}`}>
                          <Show when={rev.decision === 'approved'} fallback={<IconX size={11} />}>
                            <IconCheck size={11} />
                          </Show>
                        </div>
                        <div class="tl-body">
                          <div class="tl-top">
                            <b>{rev.reviewerName}</b>
                            <span>{formatDate(rev.at)}</span>
                            <span class={`chip ${rev.decision === 'approved' ? 'green' : 'red'}`} style={{ height: '17px', 'font-size': '10px' }}>
                              {rev.decision === 'approved' ? (rev.comment === '提交审核' ? '提交' : '通过') : '退回'}
                            </span>
                          </div>
                          <div class="tl-text">{rev.comment}</div>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </>
          )}
        </Show>
      </div>
    </div>
  );
}

function CheckSheet(p: { item: Item }) {
  const m = () => p.item.proofMetrics;
  const bg = () => (p.item.doc.bg ? bgById(p.item.doc.bg.backgroundId) : null);
  return (
    <div class="check-grid">
      <div class="check-card">
        <h4>边缘毛刺</h4>
        <Show when={m()} fallback={<div class="muted">无质检数据</div>}>
          <div class={`check-value ${m()!.edgeScore < 0.06 ? 'good' : m()!.edgeScore < 0.24 ? 'warn' : 'bad'}`}>
            {m()!.edgeLabel}
          </div>
          <div class="check-bar">
            <i
              style={{
                width: `${Math.min(100, m()!.edgeScore * 300)}%`,
                background: m()!.edgeScore < 0.06 ? '#4fbf87' : m()!.edgeScore < 0.24 ? '#d9a441' : '#e2605f',
              }}
            />
          </div>
          <div class="check-desc">
            底色溢出边界 {(formatPct(m()!.fringeRatio))} · 羽化带占比 {(formatPct(m()!.softRatio))}
          </div>
        </Show>
      </div>
      <div class="check-card">
        <h4>色温偏差</h4>
        <Show when={m()} fallback={<div class="muted">无质检数据</div>}>
          <div
            class={`check-value ${!m()!.bgCct ? 'warn' : m()!.tempDeviation < 600 ? 'good' : m()!.tempDeviation < 1400 ? 'warn' : 'bad'}`}
            style={{ 'font-size': m()!.bgCct ? '20px' : '14px' }}
          >
            {m()!.tempLabel}
          </div>
          <Show when={m()!.bgCct}>
            <div class="check-bar">
              <i
                style={{
                  width: `${Math.min(100, (m()!.tempDeviation / 2500) * 100)}%`,
                  background: m()!.tempDeviation < 600 ? '#4fbf87' : m()!.tempDeviation < 1400 ? '#d9a441' : '#e2605f',
                }}
              />
            </div>
            <div class="check-desc mono">
              主体 {formatCct(m()!.subjectCct)} / 背景 {formatCct(m()!.bgCct)} · 偏差 {Math.round(m()!.tempDeviation)}K
            </div>
            <div class="check-desc" style={{ 'font-size': '10.5px' }}>
              校正强度 {Math.round(p.item.doc.comp.tempStrength * 100)}% · 背景 {p.item.doc.bg?.name}
            </div>
          </Show>
        </Show>
      </div>
      <div class="check-card" style={{ 'grid-column': '1 / -1' }}>
        <h4>制作参数</h4>
        <div style={{ display: 'grid', 'grid-template-columns': 'repeat(4, 1fr)', gap: '10px', 'font-size': '11.5px' }}>
          <div>
            <div class="muted">背景色容差</div>
            <div class="mono">{p.item.doc.cut.bgTolerance.toFixed(2)}σ</div>
          </div>
          <div>
            <div class="muted">羽化 / 硬度</div>
            <div class="mono">
              {p.item.doc.cut.feather.toFixed(1)}px / {Math.round(p.item.doc.cut.hardness * 100)}%
            </div>
          </div>
          <div>
            <div class="muted">笔刷笔数</div>
            <div class="mono">{p.item.doc.strokes.length} 笔</div>
          </div>
          <div>
            <div class="muted">投影</div>
            <div class="mono">
              {p.item.doc.comp.shadowAngle.toFixed(0)}° / {Math.round(p.item.doc.comp.shadowOpacity * 100)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
