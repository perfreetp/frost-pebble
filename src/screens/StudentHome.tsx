import { For, Show, createMemo, createSignal } from 'solid-js';
import type { Submission, TrackData } from '../types';
import { useStore } from '../lib/store';
import { autoCheckSubmission } from '../lib/anim';
import { Modal, StatusTag, useToast } from '../components/ui';

interface Props {
  onOpenWorkshop: (courseId: string) => void;
  onOpenDemo: (courseId: string) => void;
}

function IssuePanel(props: { sub: Submission }) {
  return (
    <div class="issue-list check-report">
      <div class="row spread">
        <strong>系统自动核对</strong>
        <span class={props.sub.autoCheck.passed ? 'pill-good' : 'pill-bad'}>
          {props.sub.autoCheck.passed ? '全部通过' : '存在扣分项'}
        </span>
      </div>
      <div class="meta-row mt8">
        <span class="tag">关键帧 {props.sub.autoCheck.keyframeCount} 个</span>
        <span class="tag">
          时长 {props.sub.autoCheck.duration} 帧（偏差 {props.sub.autoCheck.durationDelta > 0 ? '+' : ''}
          {props.sub.autoCheck.durationDelta}，容忍 ±5）
        </span>
        <span class={props.sub.autoCheck.loopClosed ? 'tag diff-入门' : 'tag diff-高级'}>
          循环首尾{props.sub.autoCheck.loopClosed ? '已闭合' : '未闭合'}
        </span>
      </div>
      <For each={props.sub.autoCheck.actionsFound}>
        {(a) => (
          <div class={`issue-item ${a.found ? 'ok' : ''}`}>
            关键动作「{a.name}」：{a.found ? `区间内 ${a.keyframeCount} 个关键帧，符合要求` : '未在指定帧区间检出关键帧'}
          </div>
        )}
      </For>
      <Show when={props.sub.autoCheck.issues.length === 0}>
        <div class="issue-item ok">自动核对无扣分项，等待老师复核。</div>
      </Show>
      <For each={props.sub.autoCheck.issues}>
        {(iss) => (
          <div class="issue-item">
            <span class="ded">−{iss.deduction} 分</span>
            {iss.message}
          </div>
        )}
      </For>
      <Show when={props.sub.comment}>
        <hr class="soft" />
        <strong>老师评语{props.sub.status === 'returned' ? '（退回原因）' : ''}：</strong>
        <div class="card mt8" style={{ background: 'var(--panel-2)', 'box-shadow': 'none' }}>
          {props.sub.comment}
        </div>
      </Show>
      <Show when={props.sub.teacherScore !== null}>
        <div class="row mt8 spread">
          <span class="muted">老师评分</span>
          <strong class="score-big good">{props.sub.teacherScore}</strong>
        </div>
      </Show>
    </div>
  );
}

export default function StudentHome(props: Props) {
  const store = useStore();
  const me = store.currentUser()!;
  const toast = useToast();
  const [historyCourse, setHistoryCourse] = createSignal<string | null>(null);
  const [previewSub, setPreviewSub] = createSignal<Submission | null>(null);

  const myCourses = createMemo(() =>
    store.state.courses.filter((c) => c.assigneeIds.includes(me.id)),
  );

  const mySubs = (courseId: string) => store.getStudentSubmissions(courseId, me.id);
  const latest = (courseId: string) => mySubs(courseId)[0];
  const draft = (courseId: string) => store.getDraft(courseId, me.id);

  const stateOf = (courseId: string): { label: string; cls: string } => {
    const s = latest(courseId)?.status;
    if (s === 'graded') return { label: '已评分', cls: 'status-graded' };
    if (s === 'returned') return { label: '已退回·需重做', cls: 'status-returned' };
    if (s === 'submitted') return { label: '待老师复核', cls: 'status-submitted' };
    return { label: draft(courseId) ? '草稿未提交' : '未开始', cls: '' };
  };

  // 提交前本地预检（不写库，仅提示）
  const precheck = async (courseId: string) => {
    const c = store.getCourse(courseId)!;
    const d = draft(courseId);
    if (!d) {
      toast.show('请先进入练习台制作动画');
      return;
    }
    const check = autoCheckSubmission(c, d.track);
    if (check.issues.length > 0) {
      const msg = `预检发现 ${check.issues.length} 项扣分（约 ${check.score} 分）：\n` +
        check.issues.map((i) => `· ${i.message}`).join('\n') +
        '\n\n仍要提交吗？提交后可在历史记录查看扣分明细。';
      if (!confirm(msg)) return;
    }
    const sub = await store.submit(c, me.id, JSON.parse(JSON.stringify(d.track)) as TrackData);
    toast.show(`第 ${sub.version} 版已提交，自动核对：${sub.autoCheck.passed ? '通过' : sub.autoCheck.issues.length + ' 项扣分'}`);
  };

  return (
    <div class="page">
      <div class="page-head">
        <div>
          <h2>我的针法课目</h2>
          <div class="sub">仅显示派发给 {me.name} 的课目；退回作品可查看具体扣分原因后重做再交</div>
        </div>
      </div>

      <div class="grid cols-3">
        <For each={myCourses()}>
          {(c) => {
            const st = stateOf(c.id);
            const subs = mySubs(c.id);
            const d = draft(c.id);
            return (
              <div class="card course-card">
                <div class="row spread">
                  <h3>{c.name}</h3>
                  <span class={`tag diff-${c.difficulty}`}>{c.difficulty}</span>
                </div>
                <div class="meta-row">
                  <span class="tag">要求 {c.requiredDuration} 帧（±5 帧）</span>
                  <span class="tag">必含 {c.requiredActions.join('、')}</span>
                </div>
                <div class="row spread">
                  <span class={`tag ${st.cls}`}>{st.label}</span>
                  <Show when={subs.length > 0}>
                    <span class="muted" style={{ 'font-size': '12px' }}>已提交 {subs.length} 个版本</span>
                  </Show>
                </div>
                <Show when={latest(c.id)?.status === 'returned'}>
                  <div class="issue-item">
                    退回提醒：{latest(c.id)!.autoCheck.issues.length} 项自动扣分，点开历史查看老师评语与扣分原因。
                  </div>
                </Show>
                <Show when={d}>
                  <div class="muted" style={{ 'font-size': '12px' }}>
                    草稿更新于 {new Date(d!.updatedAt).toLocaleString('zh-CN')}
                  </div>
                </Show>
                <div class="foot">
                  <div class="wrap-gap">
                    <button class="small primary" onClick={() => props.onOpenWorkshop(c.id)}>
                      {subs.length === 0 && !d ? '开始制作' : latest(c.id)?.status === 'returned' ? '重做' : '继续制作'}
                    </button>
                    <Show when={c.demoTrack}>
                      <button class="small" onClick={() => props.onOpenDemo(c.id)}>看示范</button>
                    </Show>
                    <button class="small" disabled={!d} onClick={() => precheck(c.id)}>提交作品</button>
                    <button class="small ghost" disabled={subs.length === 0} onClick={() => setHistoryCourse(c.id)}>
                      历史版本
                    </button>
                  </div>
                </div>
              </div>
            );
          }}
        </For>
      </div>

      {/* 历史版本对比 */}
      <Show when={historyCourse()}>
        <Modal title={`历史版本 · ${store.getCourse(historyCourse()!)?.name ?? ''}`} width={760}
          onClose={() => setHistoryCourse(null)}>
          <table class="data">
            <thead>
              <tr>
                <th>版本</th><th>提交时间</th><th>状态</th><th>关键帧</th><th>时长</th>
                <th>循环闭合</th><th>自动分</th><th>老师分</th><th></th>
              </tr>
            </thead>
            <tbody>
              <For each={mySubs(historyCourse()!)}>
                {(s) => (
                  <tr>
                    <td>第 {s.version} 版</td>
                    <td>{new Date(s.submittedAt).toLocaleString('zh-CN')}</td>
                    <td><StatusTag status={s.status} /></td>
                    <td class="mono">{s.autoCheck.keyframeCount}</td>
                    <td class="mono">{s.autoCheck.duration}（{s.autoCheck.durationDelta > 0 ? '+' : ''}{s.autoCheck.durationDelta}）</td>
                    <td>{s.autoCheck.loopClosed ? <span class="pill-good">闭合</span> : <span class="pill-bad">未闭合</span>}</td>
                    <td class="mono">{s.autoCheck.score}</td>
                    <td class="mono">{s.teacherScore ?? '—'}</td>
                    <td><button class="small" onClick={() => setPreviewSub(s)}>扣分明细</button></td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
          <div class="muted mt8">对比各版本的关键帧数量、时长偏差与扣分项，定位每次修改的改进点。</div>
        </Modal>
      </Show>

      <Show when={previewSub()}>
        <Modal title={`第 ${previewSub()!.version} 版核对报告`} width={620} onClose={() => setPreviewSub(null)}>
          <IssuePanel sub={previewSub()!} />
        </Modal>
      </Show>

      {toast.msg() && <div class="toast">{toast.msg()}</div>}
    </div>
  );
}
