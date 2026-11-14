import { createEffect, createSignal, Match, onCleanup, Show, Switch } from 'solid-js';
import Shell, { type PageKey } from './components/Shell';
import DashboardPage from './pages/Dashboard';
import BatchesPage from './pages/Batches';
import PhotosPage from './pages/Photos';
import WorkstationPage from './pages/Workstation';
import VersionsPage from './pages/Versions';
import InspectionPage from './pages/Inspection';
import ReportsPage from './pages/Reports';
import ArchivePage from './pages/Archive';
import GuidePage from './pages/Guide';

const VALID: PageKey[] = ['dashboard', 'batches', 'photos', 'workstation', 'versions', 'inspection', 'reports', 'archive', 'guide'];

function fromHash(): PageKey {
  const h = window.location.hash.replace('#/', '').replace('#', '') as PageKey;
  return VALID.includes(h) ? h : 'dashboard';
}

export default function App() {
  const [page, setPage] = createSignal<PageKey>(fromHash());

  // 支持直接通过地址栏 hash 跳转
  createEffect(() => {
    const handler = () => setPage(fromHash());
    window.addEventListener('hashchange', handler);
    onCleanup(() => window.removeEventListener('hashchange', handler));
  });

  const go = (p: PageKey) => {
    setPage(p);
    if (window.location.hash !== `#/${p}`) window.location.hash = `/${p}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Shell page={page()} onNavigate={go}>
      <Switch fallback={<GuidePage />}>
        <Match when={page() === 'dashboard'}><DashboardPage onGo={go} /></Match>
        <Match when={page() === 'batches'}><BatchesPage onGo={(p) => go(p)} /></Match>
        <Match when={page() === 'photos'}><PhotosPage onGo={(p) => go(p)} /></Match>
        <Match when={page() === 'workstation'}><WorkstationPage onGo={(p) => go(p)} /></Match>
        <Match when={page() === 'versions'}><VersionsPage onGo={(p) => go(p)} /></Match>
        <Match when={page() === 'inspection'}><InspectionPage onGo={(p) => go(p)} /></Match>
        <Match when={page() === 'reports'}><ReportsPage onGo={(p) => go(p)} /></Match>
        <Match when={page() === 'archive'}><ArchivePage /></Match>
        <Match when={page() === 'guide'}><GuidePage /></Match>
      </Switch>
      <Show when={page() !== 'workstation'}>
        <div style={{ height: '10px' }} />
      </Show>
    </Shell>
  );
}
