export type Route =
  | { name: 'courses' }
  | { name: 'student-home' }
  | { name: 'editor'; courseId: string; mode: 'teacher-demo' | 'student-work' }
  | { name: 'demo-view'; courseId: string }
  | { name: 'review'; courseId: string };
