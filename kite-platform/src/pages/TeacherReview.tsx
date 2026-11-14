import { createMemo, createSignal, For, Show } from 'solid-js';
import { actions, useStore } from '../store';
import type { Submission } from '../types';
import { SKELETON_LABEL } from '../types';
import { fmtDate } from '../lib/geom';
import { exportCSV, exportJSON, exportSVG } from '../lib/exporter';
import { runChecks } from '../lib/validation';
import View3D from '../components/View3D';
import type { SelectionInfo } from '../three/KiteScene';
import type { Vec3 } from '../types';

export default function TeacherReview() {
  const { state } = useStore();
  const [filter, setFilter] = createSignal<'all' | 'submitted' | 'graded' | 'returned'>('all');
  const [selection, setSelection] = createSignal<SelectionInfo | null>(null);

  const list = createMemo(() =>
    state.submissions
      .filter(s => filter() === 'all' || s.status === filter())
      .sort((a, b) => (b.submittedAt ?? 0) - (a.submittedAt ?? 0)));

  const current = createMemo(() =>
    state.submissions.find(s => s.id === state.reviewSubmissionId) ?? list()[0]);

  // 复核用只读视图:回调全部空操作
  const noopVec = (_id: string, _o: Vec3) => {};
  const noopKnot = (_knot: Vec3) => {};

  return (
    <div style={{ height: '100%', display: 'flex', 'flex-direction': 'column', 'min-height': "0px" }}>
      <div class="page-head">
        <h2>作业复核评分</h2>
        <span class="sub">逐项打分、写评语,可退回学员重做</span>
      </div>

      <div class="toolbar">
        <div class="pill-list">
          {(['all', 'submitted', 'graded', 'returned'] as const).map(f => (
            <button class={filter() === f ? 'primary' : ''} onClick={() => setFilter(f)}>
              {({ all: '全部', submitted: '待复核', graded: '已评分', returned: '已退回' })[f]}
              ({state.submissions.filter(s => f === 'all' || s.status === f).length})
            </button>
          ))}
        </div>
      </div>

      <Show when={current()} fallback={<div class="card muted">暂无提交记录</div>}>
        {(() => {
          const sub0 = current()!;
          const task = state.tasks.find(t => t.id === sub0.taskId);
          return (
            <div class="review-layout">
              {/* 左:提交列表 + 只读三维 */}
              <div style={{ display: 'flex', 'flex-direction': 'column', 'min-height': "0px", gap: "12px" }}>
                <div class="panel" style={{ 'max-height': '38%' }}>
                  <div class="panel-head">提交列表</div>
                  <div class="panel-body" style={{ padding: "0px" }}>
                    <table>
                      <thead><tr><th>学员</th><th>任务</th><th>状态</th><th>自动分</th><th></th></tr></thead>
                      <tbody>
                        <For each={list()}>{s => (
                          <tr style={s.id === sub0.id ? { background: '#f7ede0' } : {}}>
                            <td>{s.studentName}<div class="hint">第{s.attempts}次提交</div></td>
                            <td class="muted" style={{ 'font-size': "12px" }}>{state.tasks.find(t => t.id === s.taskId)?.title}</td>
                            <td><span class={`tag ${s.status}`}>{statusLabel(s.status)}</span></td>
                            <td><b>{s.autoTotal}</b></td>
                            <td><button class="ghost" onClick={() => actions.openReview(s.id)}>查看</button></td>
                          </tr>
                        )}</For>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div class="panel" style={{ flex: 1, 'min-height': "0px" }}>
                  <div class="panel-head">
                    复核三维视图 · {sub0.studentName} · {task ? SKELETON_LABEL[task.skeleton] : ''}
                    <span class="muted" style={{ 'font-weight': 400, 'font-size': "12px", 'margin-left': "8px" }}>
                      种子 {sub0.snapshot.params.seed} · {fmtDate(sub0.submittedAt ?? 0)}
                    </span>
                  </div>
                  <div style={{ flex: 1, 'min-height': "0px" }}>
                    <View3D
                      kite={sub0.snapshot}
                      issues={sub0.issues}
                      selection={selection()}
                      onDragStrip={noopVec}
                      onDragSeam={noopVec}
                      onDragBridle={noopKnot}
                      onSelect={setSelection}
                    />
                  </div>
                </div>
              </div>

              {/* 右:评分表单(key 变化时整体重建,重置本地打分状态) */}
              <GradeForm
                key={sub0.id}
                sub={sub0}
                onExport={(kind) => {
                  if (!task) return;
                  if (kind === 'svg') exportSVG(sub0.snapshot, task, sub0.issues);
                  if (kind === 'csv') exportCSV(sub0.snapshot, task);
                  if (kind === 'json') exportJSON(sub0.snapshot, task);
                }}
              />
            </div>
          );
        })()}
      </Show>
    </div>
  );
}

function statusLabel(s: string): string {
  return { draft: '草稿', submitted: '待复核', graded: '已评分', returned: '退回重做' }[s] ?? s;
}

function GradeForm(props: {
  key: string;
  sub: Submission;
  onExport: (kind: 'svg' | 'csv' | 'json') => void;
}) {
  const s = () => props.sub;
  const [scores, setScores] = createSignal<Record<string, number>>(
    Object.fromEntries(s().criteria.map(c => [c.code, c.teacherScore ?? c.autoScore])),
  );
  const [comment, setComment] = createSignal(s().comment);
  const total = createMemo(() =>
    Math.round(s().criteria.reduce((sum, c) => sum + (scores()[c.code] ?? 0), 0) * 10) / 10);
  const freshIssues = createMemo(() => {
    const task = useStore().state.tasks.find(t => t.id === s().taskId);
    return task ? runChecks(s().snapshot, task) : { issues: s().issues, pass: false };
  });
  const failIssues = createMemo(() => freshIssues().issues.filter(i => !i.pass));

  const save = () => {
    actions.gradeSubmission(s().id, scores(), comment());
  };
  const doReturn = () => {
    if (!comment().trim()) {
      alert('退回重做必须填写修改意见');
      return;
    }
    actions.returnSubmission(s().id, comment());
  };

  return (
    <div class="panel">
      <div class="panel-head">评分与评语</div>
      <div class="panel-body">
        <div style={{ display: 'flex', gap: "10px", 'align-items': 'baseline', 'margin-bottom': "12px" }}>
          <div class="score-big">{total()}<small> /100</small></div>
          <span class={`tag ${s().status}`}>{statusLabel(s().status)}</span>
          <span class={`tag ${failIssues().length ? 'error' : 'ok'}`}>
            {failIssues().length ? `${failIssues().length} 项超差` : '校验全通过'}
          </span>
        </div>

        <div class="section-title">逐项评分(可修改,默认带出系统自动分)</div>
        <For each={s().criteria}>{c => (
          <div class="criterion">
            <label>{c.label}</label>
            <input type="number" min="0" max={c.maxScore} step="0.5"
              value={scores()[c.code] ?? c.autoScore}
              onChange={e => setScores({ ...scores(), [c.code]: Number(e.currentTarget.value) })} />
            <span class="auto">/ {c.maxScore}(自动 {c.autoScore})</span>
          </div>
        )}</For>

        <div class="section-title">超差项与偏差值</div>
        <Show when={failIssues().length} fallback={<div class="hint">无超差项。</div>}>
          <For each={failIssues()}>{is => (
            <div class="check-item fail">
              <div class="dot" />
              <div>
                <div class="lbl">
                  {is.label}
                  <Show when={is.deviationMm != null}><span class="dev"> 偏差 {is.deviationMm}mm</span></Show>
                </div>
                <div class="msg">{is.message}</div>
              </div>
            </div>
          )}</For>
        </Show>

        <div class="section-title">评语 / 退回意见</div>
        <textarea rows={4} style={{
          width: '100%', border: '1px solid var(--line)', 'border-radius': "8px", padding: "10px",
          'font-family': 'inherit', 'font-size': "13px", resize: 'vertical'}}
          placeholder="填写评语;若退回重做,这里的内容会作为修改意见展示给学员"
          value={comment()} onInput={e => setComment(e.currentTarget.value)} />

        <div style={{ display: 'flex', gap: "8px", 'margin-top': "14px", 'flex-wrap': 'wrap' }}>
          <button class="primary" onClick={save}>保存评分并发布</button>
          <button class="danger" onClick={doReturn}>退回重做</button>
        </div>

        <div class="section-title">学员错题记录(累计 {s().errorLog.length} 类)</div>
        <Show when={s().errorLog.length} fallback={<div class="hint">暂无历史错误</div>}>
          <For each={s().errorLog}>{e => (
            <div class="hint">• {e.label} — 累计 {e.count} 次,最近 {fmtDate(e.lastAt)}</div>
          )}</For>
        </Show>

        <div class="section-title">导出该作品</div>
        <div style={{ display: 'flex', gap: "8px" }}>
          <button onClick={() => props.onExport('svg')}>SVG 图纸</button>
          <button onClick={() => props.onExport('csv')}>参数清单 CSV</button>
          <button onClick={() => props.onExport('json')}>JSON 快照</button>
        </div>
      </div>
    </div>
  );
}
