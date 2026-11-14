import type { JSX } from 'solid-js';

type IconName =
  | 'grid' | 'file' | 'camera' | 'wand' | 'layers' | 'check' | 'report' | 'archive' | 'book'
  | 'leaf' | 'plus' | 'undo' | 'eraser' | 'brush' | 'save' | 'trash' | 'download' | 'print'
  | 'eye' | 'search' | 'arrow' | 'close' | 'refresh' | 'upload' | 'sun' | 'ruler' | 'clock' | 'warn' | 'sparkle';

const P: Record<IconName, JSX.Element> = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  file: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h4" /></>,
  camera: <><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" /><circle cx="12" cy="13" r="3.4" /></>,
  wand: <><path d="M5 19L16.5 7.5" /><path d="M14 4l1 2.5L17.5 8 15 9l-1 2.5L13 9 10.5 8 13 6.5z" /><path d="M19 13l.7 1.8L21.5 15l-1.8.7L19 17.5l-.7-1.8L16.5 15l1.8-.2z" /></>,
  layers: <><path d="M12 3l9 5-9 5-9-5z" /><path d="M3 12.5l9 5 9-5" /><path d="M3 17l9 5 9-5" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.5 2.5L16 9.5" /></>,
  report: <><path d="M6 3h9l4 4v14H6z" /><path d="M15 3v4h4" /><path d="M9 12h7M9 16h5" /></>,
  archive: <><rect x="3" y="4" width="18" height="4" rx="1" /><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" /><path d="M10 12h4" /></>,
  book: <><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z" /><path d="M8 3v18" /></>,
  leaf: <><path d="M20 4c0 9-5.5 14-12 14H5c0-8 5-13 12-13 1.5 0 3 -.4 3 -.4z" /><path d="M4 20c2-5 6-8 11-9" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  undo: <><path d="M9 8L4 12l5 4" /><path d="M4 12h9a6 6 0 0 1 0 12h-2" /></>,
  eraser: <><path d="M8 20l-4-4a2 2 0 0 1 0-3l8-8a2 2 0 0 1 3 0l5 5a2 2 0 0 1 0 3l-6 7z" /><path d="M10 9l5 5" /><path d="M9 20h11" /></>,
  brush: <><path d="M15 4l5 5-9 9H6v-5z" /><path d="M5 21c2 0 3-1 3-3" /></>,
  save: <><path d="M5 3h11l4 4v14H5z" /><path d="M9 3v6h7V3" /><rect x="8" y="13" width="8" height="7" /></>,
  trash: <><path d="M4 7h16" /><path d="M9 7V4h6v3" /><path d="M6 7l1 13h10l1-13" /><path d="M10 11v6M14 11v6" /></>,
  download: <><path d="M12 4v11" /><path d="M8 11l4 4 4-4" /><path d="M5 20h14" /></>,
  print: <><path d="M7 9V3h10v6" /><rect x="4" y="9" width="16" height="7" rx="1" /><path d="M7 14h10v7H7z" /></>,
  eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></>,
  arrow: <><path d="M5 12h13" /><path d="M13 7l5 5-5 5" /></>,
  close: <><path d="M6 6l12 12M18 6L6 18" /></>,
  refresh: <><path d="M20 12a8 8 0 1 1-2.4-5.7" /><path d="M20 4v5h-5" /></>,
  upload: <><path d="M12 20V9" /><path d="M8 12l4-4 4 4" /><path d="M5 4h14" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" /></>,
  ruler: <><rect x="2" y="8" width="20" height="8" rx="1.5" transform="rotate(-8 12 12)" /><path d="M7 8v3M11 8v4M15 8v3M19 8v4" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  warn: <><path d="M12 3l9 17H3z" /><path d="M12 9v5M12 17h.01" /></>,
  sparkle: <><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" /></>,
};

export function Icon(props: { name: IconName; size?: number; class?: string }): JSX.Element {
  return (
    <svg
      width={props.size ?? 16}
      height={props.size ?? 16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
      class={props.class}
      aria-hidden="true"
    >
      {P[props.name]}
    </svg>
  );
}

export type { IconName };
