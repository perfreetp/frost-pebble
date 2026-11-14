<script>
  import { onMount } from 'svelte';
  import { route, navigate } from './lib/stores.js';
  import * as db from './lib/db.js';
  import { SAMPLE_INFORMANTS } from './lib/data/sampleCounty.js';
  import Informants from './components/Informants.svelte';
  import Batches from './components/Batches.svelte';
  import Workbench from './components/Workbench.svelte';
  import VersionDiff from './components/VersionDiff.svelte';
  import Review from './components/Review.svelte';
  import Search from './components/Search.svelte';
  import Settings from './components/Settings.svelte';

  const NAV = [
    ['informants', '发音人建档'],
    ['batches', '批次记音表'],
    ['workbench', '区划加工台'],
    ['versions', '版本比对'],
    ['review', '审核归档'],
    ['search', '成果检索'],
    ['settings', '数据设置']
  ];

  let current = 'informants';
  $: current = ($route || '#/informants').replace(/^#\//, '') || 'informants';

  onMount(async () => {
    // 首次启动播种示例发音人
    if (!(await db.kvGet('seeded'))) {
      for (const inf of SAMPLE_INFORMANTS) await db.add('informants', { ...inf, createdAt: Date.now() });
      await db.kvSet('seeded', true);
    }
  });
</script>

<div class="layout">
  <header>
    <h1>方言调查档案与区划图加工系统</h1>
    <nav>
      {#each NAV as [key, label]}
        <a href="#/{key}" class:active={current === key}>{label}</a>
      {/each}
    </nav>
  </header>
  <main>
    {#if current === 'informants'}<Informants />
    {:else if current === 'batches'}<Batches />
    {:else if current === 'workbench'}<Workbench />
    {:else if current === 'versions'}<VersionDiff />
    {:else if current === 'review'}<Review />
    {:else if current === 'search'}<Search />
    {:else if current === 'settings'}<Settings />
    {/if}
  </main>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
    background: #10151d;
    color: #dfe6ee;
  }
  :global(*) { box-sizing: border-box; }
  .layout { display: flex; flex-direction: column; height: 100vh; }
  header {
    padding: 10px 20px;
    background: #18202c;
    border-bottom: 1px solid #2a3646;
  }
  header h1 { font-size: 17px; margin: 0 0 8px; color: #7ec8ff; }
  nav { display: flex; gap: 6px; flex-wrap: wrap; }
  nav a {
    color: #aebdd0; text-decoration: none; font-size: 13px;
    padding: 4px 12px; border-radius: 4px; background: #222d3d;
  }
  nav a.active { background: #2f6db3; color: #fff; }
  main { flex: 1; overflow: auto; padding: 14px 20px; }
  :global(button) {
    background: #2f6db3; color: #fff; border: none; border-radius: 4px;
    padding: 5px 12px; cursor: pointer; font-size: 13px;
  }
  :global(button:disabled) { background: #3a4656; color: #8895a8; cursor: not-allowed; }
  :global(button.danger) { background: #b03a2e; }
  :global(button.ghost) { background: #2a3646; }
  :global(input), :global(select), :global(textarea) {
    background: #1b2431; color: #dfe6ee; border: 1px solid #33445c;
    border-radius: 4px; padding: 5px 8px; font-size: 13px;
  }
  :global(table) { border-collapse: collapse; width: 100%; font-size: 13px; }
  :global(th), :global(td) { border: 1px solid #2a3646; padding: 6px 10px; text-align: left; }
  :global(th) { background: #1c2634; color: #8fb8e8; }
  :global(.card) { background: #18202c; border: 1px solid #2a3646; border-radius: 6px; padding: 14px; margin-bottom: 14px; }
  :global(.muted) { color: #8895a8; font-size: 12px; }
</style>
