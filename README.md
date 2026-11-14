# 矿山爆破设计 · 炮孔布置与档案管理系统

基于 **React 18 + TypeScript + Vite + Zustand + WebGPU** 的矿山爆破设计平台，支持单图 8000+ 炮孔的分层渲染、自动避让布设、版本归档与成果出表。

## 启动

```bash
npm install
npm run dev        # 开发服务器 http://127.0.0.1:5173
npm run build      # 类型检查 + 生产构建
npm test           # 核心算法与审核状态流冒烟测试（node 直接运行）
```

首次进入在「档案管理」页点击 **载入示例采区（8000+孔）**，即可获得一份含 8400 设计孔位、地质分层、等高线、边坡线、两处空区与两条管线的完整图纸。

## 需求与实现对照

| 需求 | 实现位置 |
| --- | --- |
| 采区建档编号、台阶平面/地质分层 | `ArchiveView` 建档表单；`lib/sampleData.ts` 数据模型与示例 |
| 单孔 / 排孔 / 整排阵列布设，1.2m 默认间距排距 | `lib/placement.ts`（createSingleArray / createRowArray / createArray），左侧面板参数 |
| 碰边坡线/空区自动避开并提示原因 | `checkAvoidance()`：台阶边界、空区面+避让圈、边坡线、管线距离判定，原因写入 `hole.skipReason`，右栏「避让明细」分类汇总 |
| 8000+ 孔 WebGPU 分层渲染 | `render/webgpu.ts`：存储缓冲区实例化，单次 draw call；矢量/文字由叠加 Canvas2D 绘制，浏览器不支持时整体回退 Canvas2D |
| 视口外裁剪 | GPU 着色器按屏幕包围盒丢弃实例；2D 回退在遍历时按世界包围盒 `continue` |
| 远景只画孔点，1:500 才出孔号/装药量 | `render2d.ts` 的 `labelsVisible()`（按 96dpi 换算比例尺分母）+ LOD 分支 |
| 图层单独开关 | 左栏图层复选框 → `layerStates`，渲染器逐层判断 |
| 点孔高亮联动右侧参数表 | 空间网格拾取（4m 格网，避免 8000 孔全量遍历）→ `selectedHoleId` → 右栏孔参数卡片 |
| 改一处排距整排重算 | 右栏「排距重算」→ `updateRowSpacing/updateRowBurden` → `regenerate()` 全量重算，排距按法向累计平移后续各排 |
| 定稿归档版本、与上一版对比 | `saveAsNewVersion` 独立 ID 谱系；`VersionDiffDialog` + `lib/diff.ts` 输出孔数/总装药/平均孔深等 6 项差值，超容差标红 |
| 单孔装药表 / 雷管段位表 / 设计报告 | `lib/reports.ts`：可打印 HTML 新窗口（另存 PDF）+ CSV 导出 |
| 按采区/日期/设计员/状态检索 | `ArchiveView` 多条件过滤栏 |
| 审核未过不能归档 | 状态机 draft→submitted→approved/rejected→archived；`archive()` 仅在 approved 放行，store 测试覆盖该门禁 |

## 架构

```
src/
├── types.ts              领域模型（采区/设计/炮孔/排/阵列/审核/图层）
├── lib/
│   ├── geometry.ts       点在多边形、点线距离、高程内插等纯几何
│   ├── placement.ts      阵列生成、避让引擎、装药与雷管段位计算
│   ├── diff.ts           统计指标与版本对比（容差标红）
│   ├── reports.ts        装药表/段位表/设计报告 HTML+CSV
│   └── sampleData.ts     8400 孔示例采区
├── render/
│   ├── webgpu.ts         WebGPU 实例化孔点渲染器（WGSL）
│   └── render2d.ts       Canvas2D 分层渲染（含完整回退路径）
├── store/useStore.ts     Zustand 全局状态 + localStorage 持久化 + 审核状态机
├── components/           画布、左右面板、顶栏、弹窗、档案视图
└── hooks/useViewport.ts  以鼠标为中心的缩放/平移
```

### 关键设计决策

- **双画布分层**：WebGPU 画布只承担高频变化的孔点（8400 实例/帧），Canvas2D 叠加层画地质面、等高线、边坡、管线、文字与高亮环，两层共享同一视口矩阵。
- **阵列与孔位分离**：只持久化排定义（原点、角度、间距、排距、孔数），孔位由 `generateHoles()` 确定性派生；改任何参数都是改排定义后重算，不存在局部状态漂移。
- **手工编辑保护**：单孔参数手工修改后打 `manualOverride` 标记，整图重算时按孔号保留其值。
- **数据持久化**：全部档案存浏览器 localStorage，可通过顶栏「导出 JSON / 导入 JSON」跨机交换，无需后端。

## 测试

- `scripts/smoke.ts`：8400 孔生成、五类避让原因、排距重算位移量、版本对比超差、雷管段位覆盖。
- `scripts/smoke-store.ts`：草稿/驳回禁归档、审核通过放行、归档只读、新版本 ID 谱系、持久化。
