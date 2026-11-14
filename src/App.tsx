import { useCallback, useEffect, useMemo, useState } from 'react';
import { SCENARIOS } from './data/scenarios';
import type { Scenario, Student, Submission } from './game/types';
import {
  formatDateTime,
  listCustomScenarios,
  listReviews,
  listStudents,
  listSubmissions,
  loadSession,
  saveSession,
  subscribeData,
  tierLabel,
  type Session,
} from './storage/repo';
import { Chip } from './components/ui';
import { Landing } from './student/Landing';
import { StagePage } from './student/StagePage';
import { ResultPage } from './student/ResultPage';
import { TeacherPage } from './teacher/TeacherPage';

interface Route {
  path: string;
  parts: string[];
}

function parseRoute(): Route {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const path = raw.split('?')[0];
  const parts = path.split('/').filter(Boolean);
  return { path, parts };
}

function navigate(to: string): void {
  if (window.location.hash === `#${to}`) return;
  window.location.hash = to;
}

export function App() {
  const [route, setRoute] = useState<Route>(parseRoute);
  const [session, setSession] = useState<Session>(() => loadSession());
  const [, setDataVersion] = useState(0);
  const [students] = useState<Student[]>(() => listStudents());
  const [custom, setCustom] = useState(() => listCustomScenarios());

  useEffect(() => {
    const onHash = () => setRoute(parseRoute());
    window.addEventListener('hashchange', onHash);
    const off = subscribeData(() => {
      setCustom(listCustomScenarios());
      setDataVersion((v) => v + 1);
    });
    return () => {
      window.removeEventListener('hashchange', onHash);
      off();
    };
  }, []);

  const scenarios = useMemo<Scenario[]>(() => {
    const extra = custom.map((c) => c.scenario);
    return [...SCENARIOS, ...extra];
  }, [custom]);

  const resolveScenario = useCallback(
    (id: string): Scenario | undefined => scenarios.find((s) => s.id === id),
    [scenarios],
  );

  const updateSession = useCallback((next: Session) => {
    setSession(next);
    saveSession(next);
  }, []);

  const student = useMemo(
    () => students.find((s) => s.id === session.studentId) ?? null,
    [students, session.studentId],
  );

  const go = useCallback((to: string) => navigate(to), []);

  const nav: Array<{ label: string; to: string }> = [
    { label: '训练台', to: '/' },
    { label: '我的成绩', to: '/me' },
    { label: '教师端', to: '/teacher' },
  ];

  const currentTop = route.parts[0] ?? '';

  let content: React.ReactNode = null;
  if (currentTop === '' || currentTop === 'levels') {
    content = (
      <Landing
        scenarios={scenarios}
        students={students}
        session={session}
        onSession={updateSession}
        onOpenLevel={(id) => go(`/stage/${id}`)}
        onTeacher={() => {
          updateSession({ ...session, role: 'teacher' });
          go('/teacher');
        }}
      />
    );
  } else if (currentTop === 'stage') {
    const scenario = resolveScenario(route.parts[1] ?? '');
    content = scenario ? (
      <StagePage
        scenario={scenario}
        student={student}
        onSubmitSuccess={(submissionId) => go(`/result/${submissionId}`)}
        onExit={() => go('/')}
      />
    ) : (
      <MissingView onBack={() => go('/')} />
    );
  } else if (currentTop === 'result') {
    content = (
      <ResultPage
        submissionId={route.parts[1] ?? ''}
        onBack={() => go('/')}
        onReplay={(scenarioId) => go(`/stage/${scenarioId}`)}
      />
    );
  } else if (currentTop === 'me') {
    content = (
      <MyRecords
        student={student}
        onOpen={(id) => go(`/result/${id}`)}
      />
    );
  } else if (currentTop === 'teacher') {
    content = (
      <TeacherPage
        onReview={(id) => go(`/review/${id}`)}
        onReplay={(scenarioId) => go(`/stage/${scenarioId}`)}
      />
    );
  } else if (currentTop === 'review') {
    content = (
      <TeacherPage
        focusSubmissionId={route.parts[1]}
        onReview={(id) => go(`/review/${id}`)}
        onReplay={(scenarioId) => go(`/stage/${scenarioId}`)}
      />
    );
  } else {
    content = <MissingView onBack={() => go('/')} />;
  }

  const hideChrome = route.parts[0] === 'stage';

  return (
    <div className="appShell">
      {!hideChrome && (
        <header className="topBar">
          <div className="brand">
            <div className="brandMark">引</div>
            <div className="brandText">
              <b>引航站调度训练系统</b>
              <span>Pilot Station · Berth &amp; Pilot Dispatch Simulator</span>
            </div>
          </div>
          <nav className="topNav" aria-label="主导航">
            {nav.map((n) => (
              <button
                key={n.to}
                className="navTab"
                aria-current={
                  n.to === '/'
                    ? currentTop === '' || currentTop === 'levels' || currentTop === 'stage' || currentTop === 'result'
                      ? 'page'
                      : undefined
                    : currentTop === n.to.slice(1)
                      ? 'page'
                      : undefined
                }
                onClick={() => go(n.to)}
              >
                {n.label}
              </button>
            ))}
          </nav>
          <div className="topRight">
            {session.role === 'teacher' ? (
              <>
                <div className="identity">
                  <span className="identityDot">教</span>
                  教员 · 复核台
                </div>
                <button
                  className="btn small ghost"
                  onClick={() => updateSession({ role: 'student', studentId: session.studentId })}
                >
                  切换学员
                </button>
              </>
            ) : (
              <div className="identity" data-testid="identity">
                <span className="identityDot">{student ? student.name.slice(0, 1) : '学'}</span>
                {student ? `${student.name} · ${student.classCode}` : '未选择学员'}
              </div>
            )}
          </div>
        </header>
      )}
      {content}
    </div>
  );
}

function MissingView({ onBack }: { onBack: () => void }) {
  return (
    <main className="page">
      <div className="panel panelPad">
        <h2 style={{ fontSize: 18 }}>页面不存在</h2>
        <p className="muted">链接可能已经失效，或该关卡已被删除。</p>
        <button className="btn primary" onClick={onBack}>
          返回训练台
        </button>
      </div>
    </main>
  );
}

/* ------------------------------ 我的成绩 ------------------------------ */

function MyRecords({ student, onOpen }: { student: Student | null; onOpen: (id: string) => void }) {
  const [version, setVersion] = useState(0);
  useEffect(() => subscribeData(() => setVersion((v) => v + 1)), []);
  const submissions = useMemo(
    () => listSubmissions().filter((s) => !student || s.studentId === student.id),
    [student, version],
  );
  const reviews = useMemo(() => new Map(listReviews().map((r) => [r.submissionId, r])), [version]);

  return (
    <main className="page">
      <div className="pageHeader">
        <div>
          <h1>我的成绩</h1>
          <p>
            {student
              ? `${student.name}（${student.classCode}）的历次训练记录。客观分由系统自动计算，复核分由教员给出。`
              : '尚未选择学员身份。返回训练台选择姓名与班级后即可查看个人记录。'}
          </p>
        </div>
      </div>
      <div className="panel">
        {submissions.length === 0 ? (
          <div className="emptyState">还没有提交记录。去训练台完成一个关卡吧。</div>
        ) : (
          <table className="dataTable">
            <thead>
              <tr>
                <th>关卡</th>
                <th>难度</th>
                <th className="right">客观分</th>
                <th className="right">准点率</th>
                <th className="right">冲突</th>
                <th className="right">平均等待</th>
                <th className="right">复核扣分</th>
                <th className="right">最终分</th>
                <th>提交时间</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub: Submission) => {
                const r = reviews.get(sub.id);
                const final = Math.max(0, sub.result.metrics.objective - (r?.deduction ?? 0));
                return (
                  <tr key={sub.id} className="clickable" onClick={() => onOpen(sub.id)}>
                    <td>{sub.scenarioTitle}</td>
                    <td>
                      <Chip tone={sub.tier === 'advanced' ? 'amber' : 'teal'}>{tierLabel(sub.tier)}</Chip>
                    </td>
                    <td className="right num">{sub.result.metrics.objective.toFixed(1)}</td>
                    <td className="right num">{Math.round(sub.result.metrics.onTimeRate * 100)}%</td>
                    <td className="right num">{sub.result.metrics.incidentCount}</td>
                    <td className="right num">{sub.result.metrics.avgWaitMin.toFixed(0)} 分</td>
                    <td className="right num" style={{ color: r ? 'var(--red)' : 'var(--text-faint)' }}>
                      {r ? `-${r.deduction}` : '待复核'}
                    </td>
                    <td className="right num">
                      <b>{final.toFixed(1)}</b>
                    </td>
                    <td className="small faint">{formatDateTime(sub.submittedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
