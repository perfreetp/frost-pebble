import { createMemo, createSignal, For, Show } from 'solid-js';
import { actions, useStore } from '../store';
import { SKELETON_LABEL, type SkeletonType, type Task } from '../types';
import { TYPE_SPEC } from '../lib/generator';
import { taskSummary } from '../lib/storage';
import { fmtDate } from '../lib/geom';

const SKELETONS: SkeletonType[] = ['diamond', 'hexagon', 'hardwing', 'softwing'];

export default function TeacherTasks() {
  const { state } = useStore();
  const [title, setTitle] = createSignal('');
  const [classId, setClassId] = createSignal(state.classes[0]?.id ?? '');
  const [skeleton, setSkeleton] = createSignal<SkeletonType>('diamond');
  const [stripCount, setStripCount] = createSignal(6);
  const [wingspan, setWingspan] = createSignal(1.2);
  const [panelCount, setPanelCount] = createSignal(4);
  const [tolerancePct, setTolerancePct] = createSignal(3);
  const [toast, setToast] = createSignal('');

  const spec = createMemo(() => TYPE_SPEC[skeleton()]);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  const submit = () => {
    if (!title().trim()) {
      notify('请填写任务名称');
      return;
    }
    const t = actions.createTask({
      title: title().trim(),
      classId: classId(),
      skeleton: skeleton(),
      stripCount: stripCount(),
      wingspan: wingspan(),
      panelCount: panelCount(),
      tolerancePct: tolerancePct(),
    });
    setTitle('');
    notify(`任务「${t.title}」已发布`);
  };

  const statusOf = (task: Task) => {
    const subs = state.submissions.filter(s => s.taskId === task.id);
    const submitted = subs.length;
    const graded = subs.filter(s => s.status === 'graded').length;
    return { submitted, graded, total: state.classes.find(c => c.id === task.classId)?.students.length ?? 0 };
  };

  return (
    <div>
      <Show when={toast()}><div class="toast">{toast()}</div></Show>
      <div class="page-head">
        <h2>出题布置任务</h2>
        <span class="sub">老师按骨架类型、竹条数量、翼展、蒙面分片数设定考核要求</span>
      </div>

      <div class="grid cols-2">
        <div class="card">
          <div class="section-title">新建任务</div>
          <div class="field">
            <label>任务名称</label>
            <input value={title()} onInput={e => setTitle(e.currentTarget.value)} placeholder="例如:板式菱形风筝考核一" />
          </div>
          <div class="field">
            <label>布置班次</label>
            <select value={classId()} onChange={e => setClassId(e.currentTarget.value)}>
              <For each={state.classes}>{c => <option value={c.id}>{c.name}({c.students.length}人)</option>}</For>
            </select>
          </div>
          <div class="field">
            <label>骨架类型</label>
            <select value={skeleton()} onChange={e => {
              setSkeleton(e.currentTarget.value as SkeletonType);
              const sp = TYPE_SPEC[e.currentTarget.value as SkeletonType];
              setStripCount(Math.min(stripCount(), sp.maxStrips));
              setPanelCount(Math.min(panelCount(), sp.maxPanels));
            }}>
              <For each={SKELETONS}>{k => <option value={k}>{SKELETON_LABEL[k]}</option>}</For>
            </select>
            <div class="hint">
              竹条 {spec().minStrips}~{spec().maxStrips} 根 · 分片 {spec().minPanels}~{spec().maxPanels} 片
            </div>
          </div>
          <div class="grid cols-2">
            <div class="field">
              <label>竹条数量(根)</label>
              <input type="number" min={spec().minStrips} max={spec().maxStrips}
                value={stripCount()}
                onChange={e => setStripCount(Number(e.currentTarget.value))} />
            </div>
            <div class="field">
              <label>翼展(米)</label>
              <input type="number" step="0.05" min="0.3" max="3"
                value={wingspan()}
                onChange={e => setWingspan(Number(e.currentTarget.value))} />
            </div>
            <div class="field">
              <label>蒙面分片数(片)</label>
              <input type="number" min={spec().minPanels} max={spec().maxPanels}
                value={panelCount()}
                onChange={e => setPanelCount(Number(e.currentTarget.value))} />
            </div>
            <div class="field">
              <label>允许偏差(±%)</label>
              <input type="number" step="0.5" min="1" max="10"
                value={tolerancePct()}
                onChange={e => setTolerancePct(Number(e.currentTarget.value))} />
            </div>
          </div>
          <button class="primary" style={{ width: '100%' }} onClick={submit}>发布任务</button>
          <div class="hint" style={{ 'margin-top': '10px' }}>
            学员将按同一份参数与各自种子生成风筝;同种子每次生成结果一致,手动调整会在重新生成时保留。
          </div>
        </div>

        <div class="card">
          <div class="section-title">已发布任务({state.tasks.length})</div>
          <table>
            <thead>
              <tr><th>任务</th><th>班次</th><th>参数要求</th><th>提交</th><th></th></tr>
            </thead>
            <tbody>
              <For each={state.tasks}>{task => {
                const st = statusOf(task);
                return (
                  <tr>
                    <td>
                      <div style={{ 'font-weight': 600 }}>{task.title}</div>
                      <div class="hint">{fmtDate(task.createdAt)}</div>
                    </td>
                    <td>{state.classes.find(c => c.id === task.classId)?.name ?? '—'}</td>
                    <td class="muted" style={{ 'font-size': '12px' }}>{taskSummary(task)}</td>
                    <td>{st.submitted}/{st.total} <span class="muted">已评{st.graded}</span></td>
                    <td style={{ 'white-space': 'nowrap' }}>
                      <button class="ghost" onClick={() => {
                        setStateReview(task.id);
                      }}>去复核</button>
                      <button class="ghost danger" onClick={() => {
                        if (confirm(`确认删除任务「${task.title}」及其提交记录?`)) actions.deleteTask(task.id);
                      }}>删除</button>
                    </td>
                  </tr>
                );
              }}</For>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function setStateReview(taskId: string) {
  const { state } = useStore();
  const first = state.submissions.find(s => s.taskId === taskId);
  if (first) actions.openReview(first.id);
  else actions.goto('review');
}
