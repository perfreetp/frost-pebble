import { createMemo, createSignal, For, Show } from 'solid-js';
import { actions, useStore } from '../store';
import { runChecks } from '../lib/validation';
import { TYPE_SPEC } from '../lib/generator';
import { mm } from '../lib/geom';
import { SKELETON_LABEL } from '../types';
import type { SelectionInfo } from '../three/KiteScene';
import type { Vec3 } from '../types';
import View3D from '../components/View3D';
import { exportCSV, exportJSON, exportSVG } from '../lib/exporter';

export default function StudentWorkspace() {
  const { state } = useStore();
  const [selection, setSelection] = createSignal<SelectionInfo | null>(null);
  const [toast, setToast] = createSignal('');

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2400);
  };

  const tasks = createMemo(() =>
    state.tasks.filter(t => t.classId === state.classes.find(c =>
      c.students.some(s => s.id === state.currentStudentId))?.id));

  const kite = createMemo(() => actions.currentKite());
  const task = createMemo(() => actions.currentTask());
  const checks = createMemo(() => {
    const k = kite();
    const t = task();
    if (!k || !t) return null;
    return runChecks(k, t);
  });

  const openTask = (taskId: string) => {
    setSelection(null);
    actions.openWorkspace(taskId);
  };

  const submit = () => {
    const c = checks();
    if (!c) return;
    const failCount = c.issues.filter(i => !i.pass).length;
    if (failCount > 0 && !confirm(`当前还有 ${failCount} 项校验未通过,确认提交?提交后老师将看到全部偏差数据。`)) return;
    actions.submit();
    setSelection(null);
    notify('已提交,等待老师复核');
  };

  return (
    <div style={{ height: '100%', display: 'flex', 'flex-direction': 'column', 'min-height': "0px" }}>
      <Show when={toast()}><div class="toast">{toast()}</div></Show>
      <Show when={!task()} fallback={
        <div style={{ height: '100%', overflow: 'auto' }}>
          <div class="page-head">
            <h2>学员制作台</h2>
            <span class="sub">当前学员:
              <select value={state.currentStudentId} style={{ width: '150px', display: 'inline-block' }}
                onChange={e => actions.setStudent(e.currentTarget.value)}>
                <For each={state.classes.flatMap(c => c.students)}>
                  {s => <option value={s.id}>{s.name}</option>}
                </For>
              </select>
            </span>
          </div>
          <div class="grid cols-2">
            <For each={tasks()}>{t => {
              const sub = actions.mySubmission(t.id);
              return (
                <div class="card">
                  <div style={{ 'font-weight': 700, 'font-size': "15px" }}>{t.title}</div>
                  <div class="hint" style={{ margin: '8px 0' }}>
                    {SKELETON_LABEL[t.skeleton]} · {t.stripCount}根竹条 · 翼展{t.wingspan}m · {t.panelCount}片蒙面
                  </div>
                  <Show when={sub} fallback={
                    <button class="primary" onClick={() => openTask(t.id)}>开始制作</button>
                  }>
                    <div style={{ display: 'flex', gap: "8px", 'align-items': 'center', margin: '8px 0' }}>
                      <span class={`tag ${sub!.status}`}>{statusLabel(sub!.status)}</span>
                      <Show when={sub!.finalTotal != null}>
                        <span class="muted">最终得分 <b style={{ color: 'var(--brand)' }}>{sub!.finalTotal}</b></span>
                      </Show>
                    </div>
                    <button class="primary" onClick={() => openTask(t.id)}>
                      {sub!.status === 'returned' ? '退回重做' : sub!.status === 'graded' ? '查看结果' : '继续制作'}
                    </button>
                  </Show>
                </div>
              );
            }}</For>
          </div>
        </div>
      }>
        <WorkspaceEditor
          selection={selection()}
          setSelection={setSelection}
          notify={notify}
          onSubmit={submit}
          onExit={() => { setSelection(null); actions.goto('workspace'); setStateActiveNull(); }}
        />
      </Show>
    </div>
  );
}

function setStateActiveNull() {
  const { setState } = useStore();
  setState('activeTaskId', null);
}

function statusLabel(s: string): string {
  return { draft: '草稿', submitted: '待复核', graded: '已评分', returned: '退回重做' }[s] ?? s;
}

// ---------- 制作台三栏 ----------

function WorkspaceEditor(props: {
  selection: SelectionInfo | null;
  setSelection: (s: SelectionInfo | null) => void;
  notify: (m: string) => void;
  onSubmit: () => void;
  onExit: () => void;
}) {
  const { state } = useStore();
  const kite = () => actions.currentKite()!;
  const task = () => actions.currentTask()!;
  const checks = createMemo(() => runChecks(kite(), task()));
  const spec = createMemo(() => TYPE_SPEC[kite().params.skeleton]);
  const sub = createMemo(() => actions.mySubmission(task().id));
  const failCount = createMemo(() => checks().issues.filter(i => !i.pass).length);

  const selectedStrip = createMemo(() =>
    props.selection?.kind === 'strip'
      ? kite().strips.find(s => s.id === props.selection!.id)
      : undefined);
  const selectedSeam = createMemo(() =>
    props.selection?.kind === 'seam'
      ? kite().seams.find(s => s.id === props.selection!.id)
      : undefined);

  const onDragStrip = (id: string, offset: Vec3) => actions.dragStrip(id, offset);
  const onDragSeam = (id: string, offset: Vec3) => actions.dragSeam(id, offset);
  const onDragBridle = (knot: Vec3) => actions.moveBridleKnot(knot);

  return (
    <div style={{ display: 'flex', 'flex-direction': 'column', height: '100%', 'min-height': "0px" }}>
      <div class="toolbar">
        <button onClick={props.onExit}>← 返回任务列表</button>
        <div>
          <b>{task().title}</b>
          <span class="muted" style={{ 'margin-left': "10px" }}>
            {SKELETON_LABEL[task().skeleton]} · 允差±{task().tolerancePct}%
          </span>
        </div>
        <div class="spacer" />
        <span class={`tag ${failCount() ? 'error' : 'ok'}`}>
          {failCount() ? `${failCount()} 项超差` : '全部校验通过'}
        </span>
        <button onClick={() => { exportSVG(kite(), task(), checks().issues); props.notify('图纸已导出 SVG'); }}>导出图纸</button>
        <button onClick={() => { exportCSV(kite(), task()); props.notify('参数清单已导出 CSV'); }}>导出清单</button>
        <button onClick={() => exportJSON(kite(), task())}>快照</button>
        <button class="primary" onClick={props.onSubmit}>提交作业</button>
      </div>

      <div class="workspace">
        {/* 左栏:参数与生成 */}
        <div class="panel">
          <div class="panel-head">参数与生成</div>
          <div class="panel-body">
            <div class="field">
              <label>随机种子(同种子生成结果一致)</label>
              <div class="row">
                <input type="number" value={kite().params.seed}
                  onChange={e => actions.setSeed(Number(e.currentTarget.value))} />
              </div>
            </div>
            <div class="field">
              <label>竹条数量: {kite().params.stripCount} 根(任务要求 {task().stripCount})</label>
              <input type="range" min={spec().minStrips} max={spec().maxStrips} step={1}
                value={kite().params.stripCount}
                onInput={e => actions.setParam('stripCount', Number(e.currentTarget.value))} />
            </div>
            <div class="field">
              <label>翼展: {kite().params.wingspan.toFixed(2)} m(任务要求 {task().wingspan}m)</label>
              <input type="range" min="0.3" max="3" step="0.05"
                value={kite().params.wingspan}
                onInput={e => actions.setParam('wingspan', Number(e.currentTarget.value))} />
            </div>
            <div class="field">
              <label>蒙面分片: {kite().params.panelCount} 片(任务要求 {task().panelCount})</label>
              <input type="range" min={spec().minPanels} max={spec().maxPanels} step={1}
                value={kite().params.panelCount}
                onInput={e => actions.setParam('panelCount', Number(e.currentTarget.value))} />
            </div>
            <button style={{ width: '100%', margin: '6px 0 12px' }}
              onClick={() => {
                actions.regenerate({ seed: kite().params.seed });
                props.notify('已按当前参数与种子重新生成,手动调整已保留');
              }}>
              重新生成(保留手动调整)
            </button>
            <button class="danger" style={{ width: '100%' }}
              onClick={() => { if (confirm('清空全部手动调整并恢复生成结果?')) { actions.resetAll(); props.setSelection(null); } }}>
              清空手动调整
            </button>

            <div class="section-title">当前提线点</div>
            <div class="hint" style={{ 'line-height': "1.7px" }}>
              附着点:({mm(kite().bridle.attach.x)}, {mm(kite().bridle.attach.y)}, {mm(kite().bridle.attach.z)}) mm<br />
              汇交点:({mm(kite().bridle.knot.x)}, {mm(kite().bridle.knot.y)}, {mm(kite().bridle.knot.z)}) mm<br />
              在视图中拖动黑色汇交点可调整(竖直面内移动)。
            </div>
            <button style={{ width: '100%', 'margin-top': "8px" }} onClick={() => actions.resetBridle()}>
              复位提线点
            </button>

            <Show when={sub()}>
              <div class="section-title">我的成绩与错题</div>
              <div class="card" style={{ padding: '12px', background: '#faf7f1' }}>
                <div style={{ display: 'flex', 'align-items': 'baseline', gap: "8px" }}>
                  <span class="score-big">{sub()!.finalTotal ?? sub()!.autoTotal}</span>
                  <small class="muted">/100 · {statusLabel(sub()!.status)}</small>
                </div>
                <Show when={sub()!.comment}>
                  <div style={{ margin: '8px 0', 'font-size': '12.5px' }}>
                    <b>老师评语:</b>{sub()!.comment}
                  </div>
                </Show>
                <Show when={sub()!.errorLog.length}>
                  <div class="section-title" style={{ margin: '8px 0 6px' }}>错题记录</div>
                  <For each={sub()!.errorLog}>{e => (
                    <div class="hint">• {e.label}(出现 {e.count} 次)</div>
                  )}</For>
                </Show>
              </div>
            </Show>
          </div>
        </div>

        {/* 中栏:三维视图 */}
        <div class="panel">
          <div class="panel-head">三维扎制视图</div>
          <div style={{ flex: 1, 'min-height': "0px" }}>
            <View3D
              kite={kite()}
              issues={checks().issues}
              selection={props.selection}
              onDragStrip={onDragStrip}
              onDragSeam={onDragSeam}
              onDragBridle={onDragBridle}
              onSelect={props.setSelection}
            />
          </div>
        </div>

        {/* 右栏:编辑 + 校验 */}
        <div class="panel">
          <div class="panel-head">调整与校验</div>
          <div class="panel-body">
            <Show when={selectedStrip()} keyed>
              {s => (
                <div class="card" style={{ padding: '12px', 'margin-bottom': "12px" }}>
                  <div class="section-title" style={{ margin: "0px" }}>竹条 · {s.name}</div>
                  <div class="hint" style={{ margin: '6px 0' }}>
                    长度 {mm(Math.hypot(s.b.x - s.a.x, s.b.y - s.a.y)).toFixed(1)} mm ·
                    弧度 {s.curvature.toFixed(2)}
                    <Show when={s.mirrorId}><br />对称对侧 id: <span class="mono">{s.mirrorId}</span></Show>
                  </div>
                  <div class="field">
                    <label>骨架弧度(拖拽视图可平移整根竹条)</label>
                    <input type="range" min="-1" max="1" step="0.01" value={s.curvature}
                      onInput={e => actions.setCurvature(s.id, Number(e.currentTarget.value))} />
                  </div>
                  <button style={{ width: '100%' }} onClick={() => actions.resetStrip(s.id)}>
                    复位此竹条
                  </button>
                </div>
              )}
            </Show>

            <Show when={selectedSeam()} keyed>
              {p => (
                <div class="card" style={{ padding: '12px', 'margin-bottom': "12px" }}>
                  <div class="section-title" style={{ margin: "0px" }}>分片接缝 · {p.id}</div>
                  <div class="hint" style={{ margin: '6px 0' }}>
                    位置 ({mm(p.pos.x)}, {mm(p.pos.y)}) mm
                    <Show when={p.mirrorId}><br />镜像接缝: <span class="mono">{p.mirrorId}</span></Show>
                  </div>
                  <button style={{ width: '100%' }} onClick={() => actions.resetSeam(p.id)}>
                    复位此接缝
                  </button>
                </div>
              )}
            </Show>

            <Show when={props.selection?.kind === 'bridle'}>
              <div class="card" style={{ padding: '12px', 'margin-bottom': "12px" }}>
                <div class="section-title" style={{ margin: "0px" }}>提线汇交点</div>
                <div class="hint" style={{ margin: '6px 0' }}>
                  在视图中拖动黑点,在竖直面(x-z)内调整前后距离与左右位置。
                </div>
                <button style={{ width: '100%' }} onClick={() => actions.resetBridle()}>复位提线点</button>
              </div>
            </Show>

            <div class="section-title">校验结果(超差标红并显示偏差)</div>
            <For each={checks().issues}>{is => (
              <div class={`check-item ${is.pass ? 'pass' : 'fail'}`}>
                <div class="dot" />
                <div>
                  <div class="lbl">
                    {is.label}
                    <Show when={is.deviationMm != null}>
                      {' '}<span class="dev">偏差 {is.deviationMm} mm</span>
                    </Show>
                  </div>
                  <div class="msg">{is.message}</div>
                </div>
              </div>
            )}</For>
          </div>
        </div>
      </div>
    </div>
  );
}
