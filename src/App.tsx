import { createSignal, For, Match, Show, Switch } from 'solid-js';
import { StoreContext, createAppStore, useStore } from './lib/store';
import TeacherCourseList from './screens/TeacherCourseList';
import StudentHome from './screens/StudentHome';
import TeacherReview from './screens/TeacherReview';
import AnimationEditor from './components/AnimationEditor';
import type { Route } from './route-types';

function Login() {
  const store = useStore();
  return (
    <div class="login-wrap">
      <div class="card login-card">
        <div style={{ 'text-align': 'center' }}>
          <div style={{ 'font-size': '22px', 'font-weight': 700, color: 'var(--brand)', 'letter-spacing': '3px' }}>
            刺绣工坊 · 针法动画课件
          </div>
          <div class="muted mt8">2D 骨骼动画教学系统（SolidJS + WebGPU）</div>
        </div>
        <hr class="soft" />
        <div class="muted">请选择身份登录：</div>
        <For each={store.state.users}>
          {(u) => (
            <div class="user-btn" onClick={() => store.login(u.id)}>
              <div>
                <strong>{u.name}</strong>
                <div class="muted" style={{ 'font-size': '12px' }}>
                  {u.role === 'teacher' ? '老师账号：建课目、绑骨备课、复核评分' : '学员账号：仅可见派给自己的课目'}
                </div>
              </div>
              <span class="role-tag">{u.role === 'teacher' ? '教师' : '学员'}</span>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

/** 编辑器路由壳：独立组件，store 数据更新只触发 props 响应式更新，不会重挂载编辑器 */
function EditorRoute(props: { route: Extract<Route, { name: 'editor' }>; onExit: () => void }) {
  const store = useStore();
  const user = store.currentUser;
  const course = () => store.getCourse(props.route.courseId);
  return (
    <Show when={course()} fallback={<div class="page">课目已被删除。</div>}>
      {(c) => (
        <AnimationEditor
          course={c()}
          mode={props.route.mode}
          initialTrack={
            props.route.mode === 'teacher-demo'
              ? c().demoTrack
              : store.getDraft(c().id, user()!.id)?.track ?? c().demoTrack ?? null
          }
          onExit={props.onExit}
        />
      )}
    </Show>
  );
}

function DemoRoute(props: { route: Extract<Route, { name: 'demo-view' }>; onExit: () => void }) {
  const store = useStore();
  const course = () => store.getCourse(props.route.courseId);
  return (
    <Show when={course()?.demoTrack} fallback={<div class="page">无示范动画。</div>}>
      <AnimationEditor
        course={course()!}
        mode="review"
        initialTrack={course()!.demoTrack!}
        onExit={props.onExit}
      />
    </Show>
  );
}

function Shell() {
  const store = useStore();
  const user = store.currentUser;
  const [route, setRoute] = createSignal<Route>({
    name: user()?.role === 'teacher' ? 'courses' : 'student-home',
  });

  return (
    <div class="app-shell">
      <header class="topbar">
        <span class="logo">🧵 刺绣针法动画课件</span>
        <Show when={user()?.role === 'teacher'}>
          <nav>
            <button class={route().name === 'courses' ? 'active' : ''}
              onClick={() => setRoute({ name: 'courses' })}>课目管理</button>
          </nav>
        </Show>
        <Show when={user()?.role === 'student'}>
          <nav>
            <button class={route().name === 'student-home' ? 'active' : ''}
              onClick={() => setRoute({ name: 'student-home' })}>我的课目</button>
          </nav>
        </Show>
        <div class="user-chip">
          <span>{user()?.name}</span>
          <span class="role-tag">{user()?.role === 'teacher' ? '教师' : '学员'}</span>
          <button class="small ghost" style={{ color: '#fbeee6', border: '1px solid rgba(255,255,255,0.4)' }}
            onClick={() => { store.logout(); setRoute({ name: 'courses' }); }}>
            切换账号
          </button>
        </div>
      </header>

      <Switch>
        <Match when={route().name === 'courses' && user()?.role === 'teacher'}>
          <TeacherCourseList
            onOpenEditor={(id) => setRoute({ name: 'editor', courseId: id, mode: 'teacher-demo' })}
            onOpenReview={(id) => setRoute({ name: 'review', courseId: id })}
          />
        </Match>
        <Match when={route().name === 'student-home' && user()?.role === 'student'}>
          <StudentHome
            onOpenWorkshop={(id) => setRoute({ name: 'editor', courseId: id, mode: 'student-work' })}
            onOpenDemo={(id) => setRoute({ name: 'demo-view', courseId: id })}
          />
        </Match>
        <Match when={route().name === 'editor'}>
          <EditorRoute
            route={route() as Extract<Route, { name: 'editor' }>}
            onExit={() => {
              const r = route() as Extract<Route, { name: 'editor' }>;
              setRoute({ name: r.mode === 'teacher-demo' ? 'courses' : 'student-home' });
            }}
          />
        </Match>
        <Match when={route().name === 'demo-view'}>
          <DemoRoute
            route={route() as Extract<Route, { name: 'demo-view' }>}
            onExit={() => setRoute({ name: 'student-home' })}
          />
        </Match>
        <Match when={route().name === 'review' && user()?.role === 'teacher'}>
          <TeacherReview
            courseId={(route() as Extract<Route, { name: 'review' }>).courseId}
            onBack={() => setRoute({ name: 'courses' })}
          />
        </Match>
      </Switch>
    </div>
  );
}

export default function App() {
  const api = createAppStore();
  return (
    <StoreContext.Provider value={api}>
      <Show when={api.state.ready} fallback={<div class="login-wrap muted">正在加载课件数据…</div>}>
        <Show when={api.currentUser()} fallback={<Login />}>
          <Shell />
        </Show>
      </Show>
    </StoreContext.Provider>
  );
}
