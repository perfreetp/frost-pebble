# 彩印打样门店系统

图像压缩 + 工单管理一体化 Web 系统。原生 TypeScript + Web Components 界面，three.js 三维贴图对比，自研 8×8 分块 DCT 压缩编码器（量化表 + Huffman 熵编码）。

## 运行

```bash
npm install
npm run dev      # 开发服务器 http://localhost:5173
npm run build    # 生产构建
```

编解码器冒烟测试：

```bash
npx esbuild test/codec.smoke.ts --bundle --platform=node --format=esm --outfile=.tmp-smoke.mjs && node .tmp-smoke.mjs
```

## 功能流程

1. **前台录单**：客户名、成品尺寸、纸张克重、色数、分派师傅、交期
2. **工单流转**：待接单 → 制作中 → 待质检 → 已完成（不合格 → 打回 → 重新制作），每次变更记录操作人与时间
3. **打样工作台**：师傅上传原图（或生成测试图），质量档 30–95 实时可调，即时显示压缩后体积、压缩比、PSNR、MSE；原图 / 压缩图 / 块效应放大（4× + 8×8 网格）并排贴在三维场景中，可拖拽旋转、滚轮缩放；细节过碎或大面积纯色的图自动标出"不建议压缩"
4. **质检台**：按可调比例随机抽查，抽中的判合格/不合格（不合格打回并计一次返工），未抽中的免检放行
5. **统计看板**：按师傅统计完成量、返工率、超期单数，一键导出对账清单 CSV

## 自研编码器（src/codec/）

- `dct.ts` — 8×8 可分离 DCT/IDCT、ZigZag 扫描、JPEG 标准量化表按质量档缩放
- `huffman.ts` — 基于符号频率的规范 Huffman 编码、位流读写器、码表序列化
- `codec.ts` — RGB→YCbCr 4:2:0 → 分块 DCT → 量化 → DC 差分 + AC 游程 → Huffman → 自定义 `PC1` 比特流；配套解码器；MSE/PSNR 失真指标；按块方差与高频能量做可压缩性分析

数据持久化在 localStorage（键 `proof-shop-v1`）。
