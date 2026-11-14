import { createMemo, createSignal, For, Show } from 'solid-js';
import { actions, useStore } from '../store';
import { taskSummary } from '../lib/storage';
import { fmtDate } from '../lib/geom';

export default function ClassStats() {
  const { state } = useStore();
  const [classId, setClassId] = createSignal(state.classes[0]?.id ?? '');
  const stats = createMemo(() => actions.classStats(classId()));
  const maxErr = createMemo(() => Math.max(1, ...stats().errors.map(e => e.count)));

  const classTasks = createMemo(() => state.tasks.filter(t => t.classId === classId()));
  const classTaskIds = createMemo(() => new Set(classTasks().map(t => t.id)));

  const rows = createMemo(() => {
    const cls = state.classes.find(c => c.id === classId());
    if (!cls) return [];
    return cls.students.map(stu => {
      const subs = state.submissions.filter(s => s.studentId === stu.id && classTaskIds().has(s.taskId));
      const graded = subs.filter(s => s.status === 'graded');
      const avg = graded.length
        ? Math.round(graded.reduce((a, s) => a + (s.finalTotal ?? s.autoTotal), 0) / graded.length * 10) / 10
        : null;
      const pending = subs.filter(s => s.status === 'submitted').length;
      const returned = subs.filter(s => s.status === 'returned').length;
      const errorCount = subs.reduce((n, s) => n + s.errorLog.reduce((m, e) => m + e.count, 0), 0);
      return { stu, total: subs.length, avg, pending, returned, errorCount };
    });
  });

  return (
    <div>
      <div class="page-head">
        <h2>班级数据统计</h2>
        <span class="sub">提交率、平均分与各类错误出现次数</span>
      </div>

      <div class="toolbar">
        <select style={{ width: "220px" }} value={classId()} onChange={e => setClassId(e.currentTarget.value)}>
          <For each={state.classes}>{c => <option value={c.id}>{c.name}({c.students.length}人)</option>}</For>
        </select>
        <div class="spacer" />
        <button class="danger" onClick={() => {
          if (confirm('重置全部本地数据并恢复演示数据?')) actions.resetDemo();
        }}>重置演示数据</button>
      </div>

      <div class="grid cols-3" style={{ 'margin-bottom': "16px" }}>
        <div class="card stat-card">
          <div class="num">{stats().submitRate}%</div>
          <div class="cap">作业提交率({stats().taskCount} 个任务 × {stats().studentCount} 人)</div>
        </div>
        <div class="card stat-card">
          <div class="num">
            <Show when={stats().avgScore != null} fallback="—">{stats().avgScore}</Show>
          </div>
          <div class="cap">已评分作业平均分(满分100)</div>
        </div>
        <div class="card stat-card">
          <div class="num">{stats().errors.reduce((s, e) => s + e.count, 0)}</div>
          <div class="cap">累计错误次数({stats().errors.length} 类)</div>
        </div>
      </div>

      <div class="grid cols-2">
        <div class="card">
          <div class="section-title">各错误类型出现次数</div>
          <Show when={stats().errors.length} fallback={<div class="hint">暂无错误记录</div>}>
            <For each={stats().errors}>{e => (
              <div style={{ margin: '10px 0' }}>
                <div style={{ display: 'flex', 'justify-content': 'space-between', 'margin-bottom': "4px" }}>
                  <span>{e.label}</span>
                  <b>{e.count} 次</b>
                </div>
                <div class="bar"><i style={{ width: `${(e.count / maxErr()) * 100}%` }} /></div>
              </div>
            )}</For>
          </Show>
        </div>

        <div class="card">
          <div class="section-title">本班任务</div>
          <table>
            <thead><tr><th>任务</th><th>参数</th><th>发布时间</th></tr></thead>
            <tbody>
              <For each={classTasks()}>{t => (
                <tr>
                  <td style={{ 'font-weight': 600 }}>{t.title}</td>
                  <td class="muted" style={{ 'font-size': "12px" }}>{taskSummary(t)}</td>
                  <td class="muted">{fmtDate(t.createdAt)}</td>
                </tr>
              )}</For>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card" style={{ 'margin-top': "16px" }}>
        <div class="section-title">学员明细</div>
        <table>
          <thead>
            <tr><th>学员</th><th>已提交</th><th>待复核</th><th>退回次数</th><th>平均分</th><th>累计错误</th></tr>
          </thead>
          <tbody>
            <For each={rows()}>{r => (
              <tr>
                <td style={{ 'font-weight': 600 }}>{r.stu.name}</td>
                <td>{r.total} / {stats().taskCount}</td>
                <td><Show when={r.pending}><span class="tag submitted">{r.pending}</span></Show></td>
                <td><Show when={r.returned}><span class="tag returned">{r.returned}</span></Show></td>
                <td><b>{r.avg ?? '—'}</b></td>
                <td class={r.errorCount ? '' : 'muted'}>{r.errorCount}</td>
              </tr>
            )}</For>
          </tbody>
        </table>
      </div>
    </div>
  );
}
