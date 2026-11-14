import { createMemo, createSignal, For, Show } from 'solid-js';
import type { Course, Difficulty } from '../types';
import { useStore } from '../lib/store';
import { countKeyframes, defaultActions, emptyTrack, uid } from '../lib/anim';
import { Modal, useToast } from '../components/ui';

interface Props {
  onOpenEditor: (courseId: string) => void;
  onOpenReview: (courseId: string) => void;
}

export default function TeacherCourseList(props: Props) {
  const store = useStore();
  const toast = useToast();
  const [editing, setEditing] = createSignal<Course | null>(null);
  const [creating, setCreating] = createSignal(false);

  const students = () => store.state.users.filter((u) => u.role === 'student');

  const submittedStats = (courseId: string) => {
    const subs = store.getSubmissions(courseId);
    // 每名学员只算其最新版本
    const latest = new Map<string, (typeof subs)[number]>();
    for (const s of subs) {
      const ex = latest.get(s.studentId);
      if (!ex || s.version > ex.version) latest.set(s.studentId, s);
    }
    const submittedIds = new Set(latest.keys());
    return {
      submitted: latest.size,
      total: store.getCourse(courseId)?.assigneeIds.length ?? 0,
      pending: [...latest.values()].filter((s) => s.status === 'submitted').length,
      graded: [...latest.values()].filter((s) => s.status === 'graded').length,
      returned: [...latest.values()].filter((s) => s.status === 'returned').length,
      submittedIds,
    };
  };

  const blankCourse = (): Course => ({
    id: uid('c'),
    name: '',
    difficulty: '入门',
    requiredDuration: 32,
    requiredActions: ['起针', '落针'],
    assigneeIds: [],
    parts: [],
    joints: [],
    demoTrack: null,
    createdAt: Date.now(),
  });

  const [form, setForm] = createSignal<Course>(blankCourse());
  const [actionText, setActionText] = createSignal('起针,落针');

  const openCreate = () => {
    setForm(blankCourse());
    setActionText('起针,落针');
    setCreating(true);
  };
  const openEdit = (c: Course) => {
    setForm(JSON.parse(JSON.stringify(c)));
    setActionText(c.requiredActions.join(','));
    setEditing(c);
  };

  const saveMeta = async () => {
    const c = form();
    if (!c.name.trim()) {
      toast.show('请填写针法名称');
      return;
    }
    const actions = actionText().split(/[,，、\s]+/).map((s) => s.trim()).filter(Boolean);
    if (actions.length === 0) {
      toast.show('至少填写一个必须出现的关键动作');
      return;
    }
    const isCreating = creating();
    const toSave: Course = {
      ...c,
      name: c.name.trim(),
      requiredActions: actions,
      demoTrack: c.demoTrack
        ? { ...c.demoTrack, actions: defaultActions(actions, c.demoTrack.duration) }
        : { ...emptyTrack(c.requiredDuration), actions: defaultActions(actions, c.requiredDuration) },
    };
    await store.saveCourse(toSave);
    toast.show('课目已保存，可进入备课台上传图层并绑骨');
    setCreating(false);
    setEditing(null);
    if (isCreating) props.onOpenEditor(toSave.id);
  };

  const remove = async (c: Course) => {
    if (!confirm(`确认删除课目「${c.name}」？相关提交与草稿将一并清除。`)) return;
    await store.deleteCourse(c.id);
    toast.show('课目已删除');
  };

  const formModal = () => (
    <Modal
      title={creating() ? '新建针法课目' : '编辑课目信息'}
      onClose={() => { setCreating(false); setEditing(null); }}
      width={620}
    >
      <div class="form-grid">
        <label class="field full">
          针法名称
          <input value={form().name} placeholder="如：苏绣套针、滚针、打籽绣"
            onInput={(e) => setForm({ ...form(), name: e.currentTarget.value })} />
        </label>
        <label class="field">
          难度档位
          <select value={form().difficulty}
            onChange={(e) => setForm({ ...form(), difficulty: e.currentTarget.value as Difficulty })}>
            <option value="入门">入门</option>
            <option value="进阶">进阶</option>
            <option value="高级">高级</option>
          </select>
        </label>
        <label class="field">
          要求时长（帧，24fps）
          <input type="number" min={8} max={240} value={form().requiredDuration}
            onInput={(e) => setForm({ ...form(), requiredDuration: Number(e.currentTarget.value) })} />
        </label>
        <label class="field full">
          必须出现的关键动作（逗号分隔，将作为自动核对依据）
          <input value={actionText()} placeholder="起针,行针,收针"
            onInput={(e) => setActionText(e.currentTarget.value)} />
        </label>
        <div class="full">
          <div class="muted mb8">派给学员（学员账号只能看到派给自己的课目）</div>
          <div class="wrap-gap">
            <For each={students()}>
              {(stu) => {
                const checked = createMemo(() => form().assigneeIds.includes(stu.id));
                return (
                  <label class="row tag" style={{ cursor: 'pointer', padding: '6px 12px' }}>
                    <input
                      type="checkbox"
                      checked={checked()}
                      onChange={(e) => {
                        const ids = new Set(form().assigneeIds);
                        e.currentTarget.checked ? ids.add(stu.id) : ids.delete(stu.id);
                        setForm({ ...form(), assigneeIds: [...ids] });
                      }}
                    />
                    {stu.name}
                  </label>
                );
              }}
            </For>
          </div>
        </div>
      </div>
      <div class="row mt16" style={{ 'justify-content': 'flex-end' }}>
        <button onClick={() => { setCreating(false); setEditing(null); }}>取消</button>
        <button class="primary" onClick={saveMeta}>{creating() ? '创建并去绑骨' : '保存'}</button>
      </div>
    </Modal>
  );

  return (
    <div class="page">
      <div class="page-head">
        <div>
          <h2>针法课目管理</h2>
          <div class="sub">建立课目 → 上传底稿与部件图层 → 绑骨 → 时间轴做示范走针动画</div>
        </div>
        <div class="row">
          <button class="danger ghost" onClick={() => { if (confirm('重置为出厂示例数据？所有自建内容将丢失。')) store.resetDemo(); }}>
            重置示例数据
          </button>
          <button class="primary" onClick={openCreate}>＋ 新建针法课目</button>
        </div>
      </div>

      <div class="grid cols-3">
        <For each={store.state.courses}>
          {(c) => {
            const stats = submittedStats(c.id);
            return (
              <div class="card course-card">
                <div class="row spread">
                  <h3>{c.name}</h3>
                  <span class={`tag diff-${c.difficulty}`}>{c.difficulty}</span>
                </div>
                <div class="meta-row">
                  <span class="tag">要求 {c.requiredDuration} 帧</span>
                  <span class="tag">动作 {c.requiredActions.length} 个</span>
                  <span class="tag">部件 {c.parts.length} 层</span>
                  <span class="tag">关节 {c.joints.length} 个</span>
                  {c.demoTrack && <span class="tag">示范 {countKeyframes(c.demoTrack)} 关键帧</span>}
                </div>
                <div class="muted" style={{ 'font-size': '12px' }}>
                  必含动作：{c.requiredActions.join('、')}
                </div>
                <div class="card" style={{ padding: '10px 12px', background: 'var(--panel-2)', 'box-shadow': 'none' }}>
                  <div class="row spread">
                    <strong>交件进度</strong>
                    <span class="mono">{stats.submitted}/{stats.total} 人已交</span>
                  </div>
                  <div class="meta-row mt8">
                    <span class="tag status-submitted">待复核 {stats.pending}</span>
                    <span class="tag status-graded">已评分 {stats.graded}</span>
                    <span class="tag status-returned">已退回 {stats.returned}</span>
                    <span class="tag">未交 {stats.total - stats.submitted}</span>
                  </div>
                </div>
                <div class="foot">
                  <div class="wrap-gap">
                    <button class="small" onClick={() => openEdit(c)}>课目信息</button>
                    <button class="small primary" onClick={() => props.onOpenEditor(c.id)}>
                      {c.parts.length === 0 ? '去绑骨备课' : '备课台'}
                    </button>
                    <button class="small" onClick={() => props.onOpenReview(c.id)}>复核与汇总</button>
                  </div>
                  <button class="small ghost danger" onClick={() => remove(c)}>删除</button>
                </div>
              </div>
            );
          }}
        </For>
      </div>

      <Show when={creating() || editing()}>{formModal()}</Show>
      {toast.msg() && <div class="toast">{toast.msg()}</div>}
    </div>
  );
}
