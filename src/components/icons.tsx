import type { JSX } from 'solid-js';
import type { JSX as J } from 'solid-js';
type P = { size?: number; class?: string; style?: J.CSSProperties };

const base = (size = 16) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }) as const;

export function IconBoard(p: P): JSX.Element {
  return <svg {...base(p.size)} class={p.class}><rect x="3" y="4" width="5.5" height="16" rx="1.5" /><rect x="9.5" y="4" width="5.5" height="11" rx="1.5" /><rect x="16" y="4" width="5" height="7" rx="1.5" /></svg>;
}
export function IconScissors(p: P) {
  return <svg {...base(p.size)} class={p.class}><circle cx="6" cy="6.5" r="2.6" /><circle cx="6" cy="17.5" r="2.6" /><path d="M8.2 8.4 20 19M8.2 15.6 20 5" /></svg>;
}
export function IconCheck(p: P) {
  return <svg {...base(p.size)} class={p.class}><path d="M4 12.5 9.5 18 20 6" /></svg>;
}
export function IconX(p: P) {
  return <svg {...base(p.size)} class={p.class}><path d="M6 6l12 12M18 6 6 18" /></svg>;
}
export function IconPlus(p: P) {
  return <svg {...base(p.size)} class={p.class}><path d="M12 5v14M5 12h14" /></svg>;
}
export function IconArrowLeft(p: P) {
  return <svg {...base(p.size)} class={p.class}><path d="M19 12H5M11 18l-6-6 6-6" /></svg>;
}
export function IconDownload(p: P) {
  return <svg {...base(p.size)} class={p.class}><path d="M12 4v11M7.5 10.5 12 15l4.5-4.5" /><path d="M5 18.5h14" /></svg>;
}
export function IconBrush(p: P) {
  return <svg {...base(p.size)} class={p.class}><path d="M4 20c3 0 3.5-2 5-3.5" /><path d="M9.5 16 18.5 7a2.6 2.6 0 0 0-3.7-3.7L5.8 12.2c-.7.7-1 1.6-1 2.5 0 1.3.3 2.6-.8 5.3 2.7 0 4 .3 5.5 0Z" /></svg>;
}
export function IconEraser(p: P) {
  return <svg {...base(p.size)} class={p.class}><path d="M8 19.5H20" /><path d="M13.5 4.5 4.5 13.5a2 2 0 0 0 0 2.8l4.2 4.2a2 2 0 0 0 2.8 0l8.5-8.5-6-6Z" /><path d="m10 8 6 6" /></svg>;
}
export function IconCompare(p: P) {
  return <svg {...base(p.size)} class={p.class}><path d="M12 6.5v11" /><path d="M8 14l-4-2.5 4-2.5" /><path d="m16 14 4-2.5-4-2.5" /></svg>;
}
export function IconLayers(p: P) {
  return <svg {...base(p.size)} class={p.class}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></svg>;
}
export function IconImage(p: P) {
  return <svg {...base(p.size)} class={p.class}><rect x="3" y="4.5" width="18" height="15" rx="2" /><circle cx="8.5" cy="10" r="1.6" /><path d="m4 17 5.5-4.5L14 17l3-2.5 3 2.5" /></svg>;
}
export function IconSend(p: P) {
  return <svg {...base(p.size)} class={p.class}><path d="M20 4 3.5 10.5l6.5 2.5 2.5 6.5L20 4Z" /><path d="m10 13 4.5-4.5" /></svg>;
}
export function IconRework(p: P) {
  return <svg {...base(p.size)} class={p.class}><path d="M4 11a8 8 0 0 1 13.6-5.6L20 8" /><path d="M20 4v4h-4" /><path d="M20 13a8 8 0 0 1-13.6 5.6L4 16" /><path d="M4 20v-4h4" /></svg>;
}
export function IconClock(p: P) {
  return <svg {...base(p.size)} class={p.class}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>;
}
export function IconWave(p: P) {
  return <svg {...base(p.size)} class={p.class}><path d="M3 12h3.5l2-5 3 10 3-7 2 2H21" /></svg>;
}
export function IconSun(p: P) {
  return <svg {...base(p.size)} class={p.class}><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.7 5.7l1.4 1.4M16.9 16.9l1.4 1.4M18.3 5.7 16.9 7.1M7.1 16.9 5.7 18.3" /></svg>;
}
export function IconAperture(p: P) {
  return <svg {...base(p.size)} class={p.class}><circle cx="12" cy="12" r="8.5" /><path d="M12 3.5 8.5 12h11M20.5 12l-5-8M16 20l-4-8M8 20l4-8" /></svg>;
}
export function IconUpload(p: P) {
  return <svg {...base(p.size)} class={p.class}><path d="M12 16V5M7.5 9.5 12 5l4.5 4.5" /><path d="M5 15.5v2.5h14v-2.5" /></svg>;
}
export function IconFolder(p: P) {
  return <svg {...base(p.size)} class={p.class}><path d="M3.5 7.5a2 2 0 0 1 2-2h3.7l2 2h7.3a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2V7.5Z" /></svg>;
}
export function IconTrash(p: P) {
  return <svg {...base(p.size)} class={p.class}><path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l.9 12.5h9.2l.9-12.5" /></svg>;
}
export function IconUndo(p: P) {
  return <svg {...base(p.size)} class={p.class}><path d="M4 9h9a5 5 0 0 1 0 10H9" /><path d="m7.5 5.5-3.5 3.5 3.5 3.5" /></svg>;
}
export function IconZoom(p: P) {
  return <svg {...base(p.size)} class={p.class}><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 4 4" /></svg>;
}
export function IconPackage(p: P) {
  return <svg {...base(p.size)} class={p.class}><path d="M12 3 21 7.5v9L12 21 3 16.5v-9L12 3Z" /><path d="M3 7.5 12 12l9-4.5M12 12v9" /></svg>;
}
export function IconInfo(p: P) {
  return <svg {...base(p.size)} class={p.class}><circle cx="12" cy="12" r="8.5" /><path d="M12 8.2v.2M12 11v5" /></svg>;
}
export function IconChevron(p: P) {
  return <svg {...base(p.size)} class={p.class}><path d="m9 7 5 5-5 5" /></svg>;
}
export function IconGrid(p: P) {
  return <svg {...base(p.size)} class={p.class}><rect x="4" y="4" width="6.5" height="6.5" rx="1" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1" /></svg>;
}
export function IconList(p: P) {
  return <svg {...base(p.size)} class={p.class}><path d="M8 6h12M8 12h12M8 18h12" /><path d="M4.2 6h.1M4.2 12h.1M4.2 18h.1" /></svg>;
}
export function IconEye(p: P) {
  return <svg {...base(p.size)} class={p.class}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.6" /></svg>;
}
