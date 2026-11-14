<script>
import { state as appState, go, logout } from './lib/store.svelte.js';
  import Login from './pages/Login.svelte';
  import Dashboard from './pages/Dashboard.svelte';
  import OrderNew from './pages/OrderNew.svelte';
  import ProjectList from './pages/ProjectList.svelte';
  import ProjectDetail from './pages/ProjectDetail.svelte';
  import ShedEditor from './pages/ShedEditor.svelte';
  import Review from './pages/Review.svelte';
  import Deliverables from './pages/Deliverables.svelte';
  import { ROLE_LABEL } from './lib/constants.js';

  const NAV = {
    customer: [
      { name: 'dashboard', label: '首页看板', icon: '▦' },
      { name: 'project-list', label: '我的项目', icon: '☰' },
      { name: 'order-new', label: '下需求单', icon: '✚' }
    ],
    maker: [
      { name: 'dashboard', label: '首页看板', icon: '▦' },
      { name: 'project-list', label: '项目列表', icon: '☰' }
    ],
    supervisor: [
      { name: 'dashboard', label: '首页看板', icon: '▦' },
      { name: 'project-list', label: '项目列表', icon: '☰' },
      { name: 'review', label: '审核台', icon: '⚑' }
    ]
  };

  const routeKey = $derived(
    appState.route.name + JSON.stringify(appState.route.params ?? {})
  );
</script>

{#if !appState.user || appState.route.name === 'login'}
  <Login />
{:else}
  <div class="layout">
    <aside class="sidebar">
      <div class="logo">
        菇棚层架三维布置
        <small>菌菇合作社交付系统</small>
      </div>
      <nav>
        {#each NAV[appState.user.role] ?? [] as item}
          <button
            class="navlink"
            class:active={appState.route.name === item.name ||
              (item.name === 'project-list' && ['project-detail', 'shed-editor', 'deliverables'].includes(appState.route.name)) ||
              (item.name === 'review' && appState.route.name === 'review')}
            onclick={() => go(item.name)}
          >
            <span style="margin-right:8px">{item.icon}</span>{item.label}
          </button>
        {/each}
      </nav>
      <div class="me">
        <b>{appState.user.name}</b><br />
        {ROLE_LABEL[appState.user.role]}
        <div style="margin-top:8px">
          <button class="sm" onclick={logout}>切换账号</button>
        </div>
      </div>
    </aside>

    <div class="main">
      <div class="topbar">
        <strong>{NAV[appState.user.role]?.find((n) => n.name === appState.route.name)?.label ?? '项目工作台'}</strong>
        <span class="spacer"></span>
        <span class="muted small">数据存储于浏览器本地 · localStorage</span>
      </div>
      <div class="content">
        {#key routeKey}
          {#if appState.route.name === 'dashboard'}
            <Dashboard />
          {:else if appState.route.name === 'order-new'}
            <OrderNew />
          {:else if appState.route.name === 'project-list'}
            <ProjectList />
          {:else if appState.route.name === 'project-detail'}
            <ProjectDetail {...appState.route.params} />
          {:else if appState.route.name === 'shed-editor'}
            <ShedEditor {...appState.route.params} />
          {:else if appState.route.name === 'review'}
            <Review {...appState.route.params} />
          {:else if appState.route.name === 'deliverables'}
            <Deliverables {...appState.route.params} />
          {:else}
            <Dashboard />
          {/if}
        {/key}
      </div>
    </div>
  </div>
{/if}
