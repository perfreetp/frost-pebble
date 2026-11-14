import { For, Show, createMemo, createSignal } from 'solid-js';
import type { Course, Submission } from '../types';
import { useStore } from '../lib/store';
import AnimationEditor from '../components/AnimationEditor';
import { Modal, StatusTag, useToast } from '../components/ui';

interface Props {
  courseId: string;
  onBack: () => void;
}

const DIFF_ORDER = ['入门', '进阶', '高级'] as const;

export default function TeacherReview(props: Props) {
  const store = useStore();
  const toast = useToast();
  const course = () => store.getCourse(props.courseId)!;
  const students = () => store.state.users.filter((u) => u.role === 'student');

  const [reviewSub, setReviewSub] = createSignal<Submission | null>(null);
  const [score, setScore] = createSignal(85);
  const [comment, setComment] = createSignal('');
  const [tab, setTab] = createSignal<'review' | 'summary'>('review');

  // 每学员最新版本
  const latestByStudent = createMemo(() => {
    const map = new Map<string, Submission>();
    for (const s of store.getSubmissions(props.courseId)) {
      const ex = map.get(s.studentId);
      if (!ex || s.version > ex.version) map.set(s.studentId, s);
    }
    return map;
  });

  const openGrade = (s: Submission) => {
    setReviewSub(s);
    setScore(s.teacherScore ?? Math.max(0, s.autoCheck.score));
    setComment(s.comment);
  };

  const doGrade = async () => {
    const s = reviewSub();
    if (!s) return;
    await store.grade(s.id, score(), comment());
    toast.show(`第 ${s.version} 版评分完成：${score()} 分`);
    setReviewSub(null);
  };

  const doReturn = async () => {
    const s = reviewSub();
    if (!s) return;
    if (!comment().trim()) {
      toast.show('退回时必须写明具体扣分原因，方便学员对照重做');
      return;
    }
    await store.returnSubmission(s.id, comment());
    toast.show('已退回，学员可在历史版本中看到退回原因');
    setReviewSub(null);
  };

  // ---------- 成绩汇总 ----------
  const allGraded = createMemo(() =>
    store.state.submissions.filter((s) => s.status === 'graded' && s.teacherScore !== null),
  );

  const summaryByDifficulty = createMemo(() =>
    DIFF_ORDER.map((diff) => {
      const coursesOfDiff = store.state.courses.filter((c) => c.difficulty === diff);
      const ids = new Set(coursesOfDiff.map((c) => c.id));
      const graded = allGraded().filter((s) => ids.has(s.courseId));
      const avg = graded.length ? graded.reduce((sum, s) => sum + (s.teacherScore ?? 0), 0) / graded.length : null;
      return { diff, count: graded.length, avg, courses: coursesOfDiff.length };
    }),
  );

  const commonErrors = createMemo(() => {
    const counter = new Map<string, { count: number; totalDeduct: number }>();
    for (const s of store.state.submissions) {
      for (const iss of s.autoCheck.issues) {
        const rec = counter.get(iss.code) ?? { count: 0, totalDeduct: 0 };
        rec.count += 1;
        rec.totalDeduct += iss.deduction;
        counter.set(iss.code, rec);
      }
    }
    const labels: Record<string, string> = {
      keyframe_count: '关键帧数量不足',
      duration: '时长误差超过 5 帧',
      loop_close: '循环首尾未闭合',
      action_missing: '缺少必须的关键动作',
      empty: '空作品（无关键帧）',
    };
    return [...counter.entries()]
      .map(([code, v]) => ({ code, label: labels[code] ?? code, ...v }))
      .sort((a, b) => b.count - a.count);
  });

  // 逐帧复核窗口
  const [frameReview, setFrameReview] = createSignal<Submission | null>(null);

  return (
    <Show when={course()} fallback={<div class="page">课目不存在，<button class="small" onClick={props.onBack}>返回</button></div>}>
      <div class="page">
        <div class="page-head">
          <div>
            <h2>
              <button class="ghost small" onClick={props.onBack}>← 返回</button>
              　复核与成绩汇总 · {course()!.name}
            </h2>
            <div class="sub">逐帧查看学员动作，对照自动核对扣分项打分、写评语或退回重做</div>
          </div>
          <div class="row">
            <button class={tab() === 'review' ? 'primary' : ''} onClick={() => setTab('review')}>作业复核</button>
            <button class={tab() === 'summary' ? 'primary' : ''} onClick={() => setTab('summary')}>成绩汇总</button>
          </div>
        </div>

        <Show when={tab() === 'review'}>
          <div class="card">
            <table class="data">
              <thead>
                <tr>
                  <th>学员</th><th>最新版本</th><th>状态</th><th>关键帧</th><th>时长偏差</th>
                  <th>循环闭合</th><th>自动核对分</th><th>扣分项</th><th>操作</th>
                </tr>
              </thead>
              <tbody>
                <For each={course()!.assigneeIds.map((id: string) => students().find((u) => u.id === id)).filter(Boolean)}>
                  {(stu) => {
                    const s = latestByStudent().get(stu!.id);
                    return (
                      <tr>
                        <td>{stu!.name}</td>
                        <Show when={s} fallback={<td colspan="8" class="muted">尚未提交</td>}>
                          <td class="mono">第 {s!.version} 版（共 {store.getStudentSubmissions(props.courseId, stu!.id).length} 版）</td>
                          <td><StatusTag status={s!.status} /></td>
                          <td class="mono">{s!.autoCheck.keyframeCount}</td>
                          <td class="mono">
                            {s!.autoCheck.durationDelta > 0 ? '+' : ''}{s!.autoCheck.durationDelta} 帧
                            {Math.abs(s!.autoCheck.durationDelta) > 5 && <span class="pill-bad"> 超差</span>}
                          </td>
                          <td>
                            {s!.autoCheck.loopClosed
                              ? <span class="pill-good">闭合</span>
                              : <span class="pill-bad">未闭合（{s!.autoCheck.loopError.dx.toFixed(0)}px / {s!.autoCheck.loopError.dRot.toFixed(0)}°）</span>}
                          </td>
                          <td class="mono">{s!.autoCheck.score}</td>
                          <td>
                            <Show when={s!.autoCheck.issues.length === 0} fallback={
                              <span class="pill-bad">{s!.autoCheck.issues.map((i) => i.message.split('（')[0]).join('；')}</span>
                            }>
                              <span class="pill-good">无</span>
                            </Show>
                          </td>
                          <td>
                            <div class="row">
                              <button class="small" onClick={() => setFrameReview(s!)}>逐帧查看</button>
                              <button class="small primary" onClick={() => openGrade(s!)}>
                                {s!.status === 'graded' ? '改分' : '打分/评语'}
                              </button>
                            </div>
                          </td>
                        </Show>
                      </tr>
                    );
                  }}
                </For>
              </tbody>
            </table>
          </div>
        </Show>

        <Show when={tab() === 'summary'}>
          <div class="grid cols-3 mb8">
            <For each={summaryByDifficulty()}>
              {(row) => (
                <div class="stat-tile">
                  <div class="num">
                    {row.avg === null ? '—' : row.avg.toFixed(1)}
                  </div>
                  <div class="lbl">{row.diff}档位平均分（{row.count} 份已评分作业 / {row.courses} 门课目）</div>
                </div>
              )}
            </For>
          </div>

          <div class="grid cols-2">
            <div class="card">
              <h3 style={{ margin: '0 0 12px' }}>常见错误排行（跨全部课目，按出现次数）</h3>
              <Show when={commonErrors().length > 0} fallback={<div class="muted">暂无扣分记录。</div>}>
                <For each={commonErrors()}>
                  {(err, i) => (
                    <div class="joint-list-item" style={{ display: 'flex' }}>
                      <strong style={{ width: '24px' }}>{i() + 1}</strong>
                      <span class="grow">{err.label}</span>
                      <span class="tag">{err.count} 人次</span>
                      <span class="tag pill-bad">累计扣 {err.totalDeduct} 分</span>
                    </div>
                  )}
                </For>
              </Show>
            </div>
            <div class="card">
              <h3 style={{ margin: '0 0 12px' }}>本课目各版本成绩</h3>
              <table class="data">
                <thead><tr><th>学员</th><th>版本</th><th>自动分</th><th>老师分</th></tr></thead>
                <tbody>
                  <For each={store.getSubmissions(props.courseId)}>
                    {(s) => {
                      const stu = students().find((u) => u.id === s.studentId);
                      return (
                        <tr>
                          <td>{stu?.name ?? s.studentId}</td>
                          <td class="mono">v{s.version}</td>
                          <td class="mono">{s.autoCheck.score}</td>
                          <td class="mono">{s.teacherScore ?? <span class="muted">待评</span>}</td>
                        </tr>
                      );
                    }}
                  </For>
                </tbody>
              </table>
            </div>
          </div>
        </Show>
      </div>

      {/* 打分弹窗 */}
      <Show when={reviewSub()}>
        <Modal title={`打分与评语 · ${students().find((u) => u.id === reviewSub()!.studentId)?.name} · 第 ${reviewSub()!.version} 版`}
          width={680} onClose={() => setReviewSub(null)}>
          <div class="issue-list mb8">
            <div class="meta-row">
              <span class="tag">关键帧 {reviewSub()!.autoCheck.keyframeCount}</span>
              <span class="tag">时长 {reviewSub()!.autoCheck.duration} 帧</span>
              <span class={reviewSub()!.autoCheck.loopClosed ? 'tag diff-入门' : 'tag diff-高级'}>
                首尾{reviewSub()!.autoCheck.loopClosed ? '闭合' : '未闭合'}
              </span>
            </div>
            <For each={reviewSub()!.autoCheck.issues}>
              {(iss) => (
                <div class="issue-item"><span class="ded">−{iss.deduction}</span>{iss.message}</div>
              )}
            </For>
            <Show when={reviewSub()!.autoCheck.issues.length === 0}>
              <div class="issue-item ok">自动核对全部通过。</div>
            </Show>
          </div>
          <label class="field">
            分数（0-100，自动核对参考分 {reviewSub()!.autoCheck.score}）
            <input type="number" min={0} max={100} value={score()}
              onInput={(e) => setScore(Math.max(0, Math.min(100, Number(e.currentTarget.value) || 0)))} />
          </label>
          <label class="field mt8">
            评语 / 退回原因（退回后学员可见全文）
            <textarea rows={4} value={comment()} onInput={(e) => setComment(e.currentTarget.value)}
              placeholder="请写明具体动作问题与修改方向…" />
          </label>
          <div class="row mt16" style={{ 'justify-content': 'flex-end' }}>
            <button class="danger" onClick={doReturn}>退回重做</button>
            <button class="primary" onClick={doGrade}>确认评分</button>
          </div>
        </Modal>
      </Show>

      {/* 逐帧复核：全屏编辑器 review 模式 */}
      <Show when={frameReview()}>
        <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', 'z-index': 90, overflow: 'auto' }}>
          <AnimationEditor
            course={course()!}
            mode="review"
            initialTrack={frameReview()!.track}
            onExit={() => setFrameReview(null)}
          />
        </div>
      </Show>

      {toast.msg() && <div class="toast">{toast.msg()}</div>}
    </Show>
  );
}
