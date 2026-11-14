import { Match, Show, Switch } from 'solid-js';
import { actions, useStore, type Page, type Role } from './store';
import TeacherTasks from './pages/TeacherTasks';
import StudentWorkspace from './pages/StudentWorkspace';
import TeacherReview from './pages/TeacherReview';
import ClassStats from './pages/ClassStats';

const TEACHER_NAV: { page: Page; label: string }[] = [
  { page: 'tasks', label: '出题布置' },
  { page: 'review', label: '复核评分' },
  { page: 'stats', label: '班级统计' },
];
const STUDENT_NAV: { page: Page; label: string }[] = [
  { page: 'workspace', label: '三维制作台' },
];

export default function App() {
  const { state } = useStore();

  const nav = () => (state.role === 'teacher' ? TEACHER_NAV : STUDENT_NAV);

  const switchRole = (role: Role) => {
    actions.setRole(role);
  };

  return (
    <div class="app">
      <header class="topbar">
        <div class="logo">🪁 风筝扎制教学与考核平台</div>
        <nav>
          {nav().map(item => (
            <button
              class={state.page === item.page ? 'active' : ''}
              onClick={() => actions.goto(item.page)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div class="role-switch">
          <button class={state.role === 'teacher' ? 'active' : ''} onClick={() => switchRole('teacher')}>
            老师端
          </button>
          <button class={state.role === 'student' ? 'active' : ''} onClick={() => switchRole('student')}>
            学员端
          </button>
        </div>
      </header>

      <main>
        <Switch>
          <Match when={state.page === 'tasks' && state.role === 'teacher'}>
            <TeacherTasks />
          </Match>
          <Match when={state.page === 'review' && state.role === 'teacher'}>
            <TeacherReview />
          </Match>
          <Match when={state.page === 'stats' && state.role === 'teacher'}>
            <ClassStats />
          </Match>
          <Match when={state.role === 'student'}>
            <StudentWorkspace />
          </Match>
          {/* 角色切换后停留在无权限页时的兜底 */}
          <Match when={true}>
            <TeacherTasks />
          </Match>
        </Switch>
      </main>

      <Show when={state.role === 'student'}>
        <div style={{
          padding: '6px 24px', background: '#ede6d8', 'font-size': "12px", color: '#6b6257',
          display: 'flex', gap: "12px", 'align-items': 'center'}}>
          <span>当前学员身份:</span>
          <select
            style={{ width: "160px" }}
            value={state.currentStudentId}
            onChange={e => actions.setStudent(e.currentTarget.value)}
          >
            {state.classes.flatMap(c =>
              c.students.map(s => <option value={s.id}>{c.name} · {s.name}</option>))}
          </select>
          <span class="muted">演示环境:可切换任意学员身份查看其任务、提交与成绩</span>
        </div>
      </Show>
    </div>
  );
}
