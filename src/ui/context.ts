import { Store } from '../core/store';

export const store = new Store();

// Mirror the role onto the window so leaf components can gate permissions without importing the store.
store.subscribe((state) => {
  (window as unknown as { __farmRole?: string }).__farmRole = state.role;
});
(window as unknown as { __farmRole?: string }).__farmRole = store.state.role;

export type ViewName = 'projects' | 'animate' | 'review' | 'compare';

export interface RouteState {
  view: ViewName;
  projectId: string | null;
}

export function currentRoute(): RouteState {
  const hash = location.hash.replace(/^#\/?/, '');
  const [viewRaw, projectId] = hash.split('/');
  const view = (['projects', 'animate', 'review', 'compare'] as ViewName[]).includes(viewRaw as ViewName)
    ? (viewRaw as ViewName)
    : 'projects';
  return { view, projectId: projectId || null };
}

export function navigate(view: ViewName, projectId?: string) {
  const pid = projectId ?? store.state.currentProjectId ?? '';
  location.hash = `#/${view}${pid ? `/${pid}` : ''}`;
}

export function syncRouteProject() {
  const route = currentRoute();
  if (route.projectId && route.projectId !== store.state.currentProjectId && store.state.projects.some((p) => p.id === route.projectId)) {
    store.state.currentProjectId = route.projectId;
  }
}

export const ROLE_LABEL = { animator: '动画师', reviewer: '农技审核' } as const;

export function navigateToReview(annotationId?: string) {
  navigate('review');
  if (annotationId) {
    setTimeout(() => window.dispatchEvent(new CustomEvent('focus-annotation', { detail: annotationId })), 60);
  }
}
