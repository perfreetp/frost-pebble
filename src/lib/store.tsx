// 全局响应式状态（SolidJS signals）+ IndexedDB 持久化
import { createContext, useContext } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import type { Course, Submission, TrackData, User } from '../types';
import { autoCheckSubmission, countKeyframes, uid } from './anim';
import { buildSeedBundle } from './seed';
import { idb, seedIfEmpty } from './idb';

export interface DraftRecord {
  id: string; // `${courseId}:${studentId}`
  track: TrackData;
  updatedAt: number;
}

interface AppState {
  ready: boolean;
  currentUserId: string | null;
  users: User[];
  courses: Course[];
  submissions: Submission[];
  drafts: DraftRecord[];
}

export interface StoreApi {
  state: AppState;
  currentUser: () => User | null;
  login: (userId: string) => void;
  logout: () => void;
  saveCourse: (course: Course) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  getCourse: (courseId: string) => Course | undefined;
  getSubmissions: (courseId: string) => Submission[];
  getStudentSubmissions: (courseId: string, studentId: string) => Submission[];
  getDraft: (courseId: string, studentId: string) => DraftRecord | undefined;
  saveDraft: (courseId: string, studentId: string, track: TrackData) => Promise<void>;
  submit: (course: Course, studentId: string, track: TrackData) => Promise<Submission>;
  grade: (submissionId: string, score: number, comment: string) => Promise<void>;
  returnSubmission: (submissionId: string, comment: string) => Promise<void>;
  resetDemo: () => Promise<void>;
}

const StoreContext = createContext<StoreApi>();

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('StoreProvider 未挂载');
  return ctx;
}

export function createAppStore(): StoreApi {
  // Solid store 代理不能直接进 IndexedDB 结构化克隆，统一深转为普通对象
  const plain = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

  const [state, setState] = createStore<AppState>({
    ready: false,
    currentUserId: localStorage.getItem('currentUserId'),
    users: [],
    courses: [],
    submissions: [],
    drafts: [],
  });

  async function init() {
    const seed = await buildSeedBundle();
    await seedIfEmpty(seed.users, seed.courses, seed.submissions, seed.blobs);
    const [users, courses, submissions, drafts] = await Promise.all([
      idb.getAll<User>('users'),
      idb.getAll<Course>('courses'),
      idb.getAll<Submission>('submissions'),
      idb.getAll<DraftRecord>('drafts'),
    ]);
    setState({ ready: true, users, courses, submissions, drafts });
  }
  void init();

  const currentUser = () => state.users.find((u) => u.id === state.currentUserId) ?? null;

  const login = (userId: string) => {
    localStorage.setItem('currentUserId', userId);
    setState('currentUserId', userId);
  };
  const logout = () => {
    localStorage.removeItem('currentUserId');
    setState('currentUserId', null);
  };

  const saveCourse = async (course: Course) => {
    const value = plain(course);
    await idb.put('courses', value);
    const idx = state.courses.findIndex((c) => c.id === value.id);
    setState(
      produce((s) => {
        if (idx >= 0) s.courses[idx] = value;
        else s.courses.push(value);
      }),
    );
  };

  const deleteCourse = async (courseId: string) => {
    await idb.remove('courses', courseId);
    setState(produce((s) => {
      s.courses = s.courses.filter((c) => c.id !== courseId);
      s.submissions = s.submissions.filter((x) => x.courseId !== courseId);
      s.drafts = s.drafts.filter((d) => !d.id.startsWith(courseId + ':'));
    }));
  };

  const getCourse = (courseId: string) => state.courses.find((c) => c.id === courseId);
  const getSubmissions = (courseId: string) =>
    state.submissions
      .filter((s) => s.courseId === courseId)
      .sort((a, b) => b.submittedAt - a.submittedAt);
  const getStudentSubmissions = (courseId: string, studentId: string) =>
    getSubmissions(courseId)
      .filter((s) => s.studentId === studentId)
      .sort((a, b) => b.version - a.version);

  const draftId = (courseId: string, studentId: string) => `${courseId}:${studentId}`;
  const getDraft = (courseId: string, studentId: string) =>
    state.drafts.find((d) => d.id === draftId(courseId, studentId));

  const saveDraft = async (courseId: string, studentId: string, track: TrackData) => {
    const rec: DraftRecord = { id: draftId(courseId, studentId), track: plain(track), updatedAt: Date.now() };
    await idb.put('drafts', rec);
    setState(
      produce((s) => {
        const i = s.drafts.findIndex((d) => d.id === rec.id);
        if (i >= 0) s.drafts[i] = rec;
        else s.drafts.push(rec);
      }),
    );
  };

  const submit = async (course: Course, studentId: string, track: TrackData) => {
    const prev = getStudentSubmissions(course.id, studentId);
    const version = prev.length ? Math.max(...prev.map((p) => p.version)) + 1 : 1;
    const sub: Submission = {
      id: uid('sub'),
      courseId: course.id,
      studentId,
      version,
      status: 'submitted',
      track: plain(track),
      autoCheck: autoCheckSubmission(course, plain(track)),
      teacherScore: null,
      comment: '',
      submittedAt: Date.now(),
      reviewedAt: null,
    };
    await idb.put('submissions', sub);
    setState(produce((s) => s.submissions.push(sub)));
    return sub;
  };

  const grade = async (submissionId: string, score: number, comment: string) => {
    const sub = state.submissions.find((s) => s.id === submissionId);
    if (!sub) return;
    const updated: Submission = { ...plain(sub), status: 'graded', teacherScore: score, comment, reviewedAt: Date.now() };
    await idb.put('submissions', updated);
    setState(produce((s) => {
      const i = s.submissions.findIndex((x) => x.id === submissionId);
      s.submissions[i] = updated;
    }));
  };

  const returnSubmission = async (submissionId: string, comment: string) => {
    const sub = state.submissions.find((s) => s.id === submissionId);
    if (!sub) return;
    const updated: Submission = { ...plain(sub), status: 'returned', reviewedAt: Date.now(), comment };
    await idb.put('submissions', updated);
    setState(produce((s) => {
      const i = s.submissions.findIndex((x) => x.id === submissionId);
      s.submissions[i] = updated;
    }));
  };

  const resetDemo = async () => {
    for (const store of ['users', 'courses', 'submissions', 'drafts', 'blobs'] as const) {
      await idb.clear(store);
    }
    const seed = await buildSeedBundle();
    await seedIfEmpty(seed.users, seed.courses, seed.submissions, seed.blobs);
    setState({
      users: seed.users,
      courses: seed.courses,
      submissions: seed.submissions,
      drafts: [],
    });
  };

  return {
    state,
    currentUser,
    login,
    logout,
    saveCourse,
    deleteCourse,
    getCourse,
    getSubmissions,
    getStudentSubmissions,
    getDraft,
    saveDraft,
    submit,
    grade,
    returnSubmission,
    resetDemo,
  };
}

export { StoreContext };
export function kfCount(track: TrackData): number {
  return countKeyframes(track);
}
