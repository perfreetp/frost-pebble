<script>
import { login } from '../lib/store.svelte.js';

  const accounts = [
    { role: 'customer', name: '客户·张社长', icon: '👤', desc: '下需求单、跟踪项目进度、导出物料清单' },
    { role: 'maker', name: '制作员·李工', icon: '🛠', desc: '逐棚摆放层架与设备、碰撞自检、提交审核' },
    { role: 'supervisor', name: '主管·王主任', icon: '✔', desc: '逐棚审核碰撞告警与清单、退回/通过打包' }
  ];

  function pick(a) {
    login(a.name, a.role);
  }
</script>

<div class="login-wrap">
  <div class="card login-card">
    <h1 style="text-align:center">菇棚层架三维布置交付系统</h1>
    <p class="muted small" style="text-align:center;margin-top:0">
      请选择身份进入(演示环境,无需密码)
    </p>
    {#each accounts as a}
      <button class="role-btn" onclick={() => pick(a)}>
        <span class="ico">{a.icon}</span>
        <span>
          <b>{a.name}</b>
          <small>{a.desc}</small>
        </span>
      </button>
    {/each}
    <p class="muted small" style="text-align:center;margin-bottom:0">
      制作员与主管看到的页面与待办不同 · 所有操作记录时间线与操作人
    </p>
  </div>
</div>
