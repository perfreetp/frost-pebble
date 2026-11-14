import type { Scenario, Student, Submission, Tier } from '../game/types';
import {
  listSubmissions,
  loadDraft,
  type Session,
} from '../storage/repo';
import { Bar, Chip } from '../components/ui';

export function Landing({
  scenarios,
  students,
  session,
  onSession,
  onOpenLevel,
  onTeacher,
}: {
  scenarios: Scenario[];
  students: Student[];
  session: Session;
  onSession: (s: Session) => void;
  onOpenLevel: (id: string) => void;
  onTeacher: () => void;
}) {
  const submissions = listSubmissions();
  const history = new Map<string, Submission[]>();
  for (const sub of submissions) {
    const list = history.get(sub.scenarioId) ?? [];
    list.push(sub);
    history.set(sub.scenarioId, list);
  }

  const beginner = scenarios.filter((s) => s.tier === 'beginner');
  const advanced = scenarios.filter((s) => s.tier === 'advanced');
  const selected = students.find((s) => s.id === session.studentId);

  return (
    <main className="page">
      <div className="heroGrid">
        <div className="panel heroCard">
          <Chip tone="teal">引航站 · 学徒训练</Chip>
          <h2 style={{ marginTop: 12 }}>把船排进泊位，让每条船都有引航员和拖轮</h2>
          <p>
            左上是港口时间轴：每一行是一座泊位，下方是当日潮高。从锚地队列把船拖到泊位，
            再指派引航员和拖轮。吃水超过泊位限制、同一引航员时段重叠、错过潮窗 —— 违规动作会当场被拦下并给出原因。
            点「开始推演」，时间往前走，事故会逐条记在成绩里。
          </p>
          <div className="heroStats">
            <div className="heroStat">
              <b>{scenarios.length}</b>
              <span>训练关卡</span>
            </div>
            <div className="heroStat">
              <b>2 → 8</b>
              <span>船舶规模</span>
            </div>
            <div className="heroStat">
              <b>{submissions.length}</b>
              <span>累计提交</span>
            </div>
            <div className="heroStat">
              <b>3 项</b>
              <span>客观指标</span>
            </div>
          </div>
        </div>
        <div className="panel panelPad">
          <h3 style={{ fontSize: 15, marginBottom: 4 }}>学员身份</h3>
          <p className="faint small" style={{ marginTop: 0 }}>
            选择姓名后提交的成绩会汇总到对应班级。
          </p>
          <div className="field" style={{ marginTop: 12 }}>
            <label className="fieldLabel" htmlFor="student-select">
              学员
            </label>
            <select
              id="student-select"
              className="select"
              data-testid="student-select"
              value={session.studentId ?? ''}
              onChange={(e) => onSession({ ...session, role: 'student', studentId: e.target.value })}
            >
              <option value="">— 选择学员 —</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.classCode}
                </option>
              ))}
            </select>
          </div>
          {selected && (
            <div className="okBox" style={{ marginTop: 12 }}>
              当前身份：{selected.name}（{selected.classCode}）
            </div>
          )}
          {!selected && (
            <div className="warnBox" style={{ marginTop: 12 }} data-testid="need-student">
              请先选择学员，提交时才能记录成绩。
            </div>
          )}
          <div className="divider" />
          <h3 style={{ fontSize: 15, marginBottom: 8 }}>训练流程</h3>
          <dl className="kv">
            <dt>1</dt>
            <dd>选关卡，看船舶清单与泊位限制</dd>
            <dt>2</dt>
            <dd>拖船入泊位，指派引航员与拖轮</dd>
            <dt>3</dt>
            <dd>开始推演，观察事故与等待</dd>
            <dt>4</dt>
            <dd>提交，系统算出客观分</dd>
            <dt>5</dt>
            <dd>教员回放复核，扣分写评语</dd>
          </dl>
          <div className="divider" />
          <button className="btn ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={onTeacher}>
            进入教师端 · 出题与复核
          </button>
        </div>
      </div>

      <Section
        title="初级档"
        hint="2–5 条船，单引航员约束，潮窗较宽"
        scenarios={beginner}
        history={history}
        disabled={!selected}
        onOpenLevel={onOpenLevel}
      />
      <Section
        title="高级档"
        hint="5–8 条船，潮窗收口，拖轮争用"
        scenarios={advanced}
        history={history}
        disabled={!selected}
        onOpenLevel={onOpenLevel}
      />
    </main>
  );
}

function Section({
  title,
  hint,
  scenarios,
  history,
  disabled,
  onOpenLevel,
}: {
  title: string;
  hint: string;
  scenarios: Scenario[];
  history: Map<string, Submission[]>;
  disabled: boolean;
  onOpenLevel: (id: string) => void;
}) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 24 }}>
        <h3 style={{ fontSize: 15.5 }}>{title}</h3>
        <span className="small faint">{hint}</span>
      </div>
      <div className="levelGrid">
        {scenarios.map((scenario, i) => {
          const subs = history.get(scenario.id) ?? [];
          const best = subs.reduce<number | null>(
            (acc, s) => (acc === null ? s.result.metrics.objective : Math.max(acc, s.result.metrics.objective)),
            null,
          );
          const draft = loadDraft(scenario.id);
          const tier: Tier = scenario.tier;
          return (
            <button
              key={scenario.id}
              className={`levelCard ${best !== null ? 'done' : ''}`}
              onClick={() => onOpenLevel(scenario.id)}
              data-testid={`level-${scenario.id}`}
            >
              <div className="levelTop">
                <span className="levelIndex">{i + 1}</span>
                <h4>{scenario.title.replace(/^第 \d+ 关 · |^高级 \d+ · /, '')}</h4>
                <span style={{ marginLeft: 'auto' }}>
                  <Chip tone={tier === 'advanced' ? 'amber' : 'teal'}>{tier === 'advanced' ? '高级' : '初级'}</Chip>
                </span>
              </div>
              <div className="levelMeta">
                <Chip>{scenario.ships.length} 船</Chip>
                <Chip>{scenario.berths.length} 泊位</Chip>
                <Chip>{scenario.pilots.length} 引航员</Chip>
                <Chip>{Math.round(scenario.horizonMin / 60)} 小时</Chip>
              </div>
              <div className="levelBrief">{scenario.brief}</div>
              {best !== null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Bar value={best / 100} />
                  <span className="small mono" style={{ color: 'var(--teal)' }}>
                    {best.toFixed(0)} 分
                  </span>
                </div>
              )}
              <div className="levelFoot">
                {disabled ? '请先选择学员' : subs.length > 0 ? `已提交 ${subs.length} 次` : '未训练'}
                {draft && draft.length > 0 && <Chip tone="amber">有草稿</Chip>}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
