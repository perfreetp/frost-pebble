import { writable, derived } from 'svelte/store';

export const route = writable(location.hash || '#/informants');

export function navigate(path) {
  location.hash = path;
}

window.addEventListener('hashchange', () => route.set(location.hash || '#/informants'));

// 加工台当前编辑的工作版本(内存态,提交时入库)
export const workState = writable({
  zones: [],       // [{id, name, color, geom: MultiPolygon}]
  isoglosses: [],  // [{id, name, points: [[x,y]...]}]
  points: []       // [{id, name, x, y, township}]
});

export const currentRoute = derived(route, ($r) => ($r || '#/informants').replace(/^#\//, ''));
