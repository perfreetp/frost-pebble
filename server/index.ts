import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { buildBridge, DEFAULT_CONFIG } from '../src/core/bridgeModel';
import { buildTimelines } from '../src/core/timeline';
import { buildRepairList, computeStats } from '../src/core/reports';
import type { Defect, Inspection, ReportMeta } from '../src/core/types';
import {
  ensureDirs,
  listShares,
  loadShare,
  loadState,
  newId,
  parseMultipart,
  paths,
  readStateOrFail,
  saveShare,
  saveState,
  saveUpload,
  type ProjectState,
} from './store';
import { buildReportPdf } from './pdf';

const PORT = Number(process.env.PORT ?? 8787);
const app = express();
app.use(cors());
app.use(express.json({ limit: '4mb' }));
// 照片上传需要原始字节：用 raw 解析器保存 Buffer（在 json 之前匹配 multipart）
app.use('/api/photos', express.raw({ type: 'multipart/form-data', limit: '8mb' }));

ensureDirs();

// 静态资源：照片 + 构建后的前端
app.use('/uploads', express.static(paths.UPLOAD_DIR, { maxAge: '1h', index: false }));
const distDir = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distDir)) app.use(express.static(distDir));

function requireState(): ProjectState | null {
  try {
    return readStateOrFail();
  } catch {
    return null;
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, seeded: !!loadState() });
});

// ---------------------------------------------------------------- project

app.get('/api/project', (_req, res) => {
  const state = requireState();
  if (!state) return res.status(404).json({ error: '项目数据未初始化，请先运行 npm run seed' });
  const { bridge } = buildBridge(state.bridgeConfig ?? DEFAULT_CONFIG);
  res.json({ ...state, bridge });
});

app.put('/api/project/bridge', (req, res) => {
  const state = requireState();
  if (!state) return res.status(404).json({ error: '未初始化' });
  const next = req.body?.bridgeConfig;
  if (!next || !Array.isArray(next.spans) || next.spans.length === 0) {
    return res.status(400).json({ error: '桥梁参数不完整' });
  }
  state.bridgeConfig = { ...DEFAULT_CONFIG, ...next };
  saveState(state);
  res.json({ bridge: buildBridge(state.bridgeConfig).bridge });
});

// ---------------------------------------------------------------- inspections

app.get('/api/inspections', (_req, res) => {
  const s = requireState();
  if (!s) return res.status(404).json({ error: '未初始化' });
  res.json({ inspections: s.inspections, activeInspectionId: s.activeInspectionId });
});

app.post('/api/inspections', (req, res) => {
  const s = requireState();
  if (!s) return res.status(404).json({ error: '未初始化' });
  const body = req.body ?? {};
  if (!body.date || !body.title) return res.status(400).json({ error: '巡检日期与批次名称必填' });
  const insp: Inspection = {
    id: newId('ins'),
    bridgeId: s.bridgeConfig.id,
    date: body.date,
    title: body.title,
    inspector: body.inspector ?? '',
    weather: body.weather ?? '',
    equipment: body.equipment ?? '',
    note: body.note ?? '',
    createdAt: new Date().toISOString(),
  };
  s.inspections.push(insp);
  saveState(s);
  res.json(insp);
});

app.post('/api/inspections/:id/activate', (req, res) => {
  const s = requireState();
  if (!s) return res.status(404).json({ error: '未初始化' });
  if (!s.inspections.some((i) => i.id === req.params.id)) return res.status(404).json({ error: '巡检不存在' });
  s.activeInspectionId = req.params.id;
  saveState(s);
  res.json({ ok: true, activeInspectionId: s.activeInspectionId });
});

// ---------------------------------------------------------------- defects

app.get('/api/defects', (req, res) => {
  const s = requireState();
  if (!s) return res.status(404).json({ error: '未初始化' });
  const inspectionId = req.query.inspectionId as string | undefined;
  res.json(inspectionId ? s.defects.filter((d) => d.inspectionId === inspectionId) : s.defects);
});

/** 保存病害：服务端重新执行“严重级必须有照片和判定依据”的硬性校验，旧数据不能靠前端绕过 */
app.post('/api/defects', (req, res) => {
  const s = requireState();
  if (!s) return res.status(404).json({ error: '未初始化' });
  const d = req.body as Defect;
  if (!d?.id || !d.componentId || !d.type) return res.status(400).json({ error: '病害数据不完整' });
  if (d.severity === 'critical') {
    if (!d.justification?.trim()) {
      return res.status(422).json({ error: '严重级病害必须填写判定依据', code: 'NEED_JUSTIFICATION', defectId: d.id });
    }
    if (!Array.isArray(d.photos) || d.photos.length < 1) {
      return res.status(422).json({ error: '严重级病害必须上传至少一张特写照片', code: 'NEED_PHOTO', defectId: d.id });
    }
  }
  if (d.photos?.some((p) => !p.url?.startsWith('/uploads/'))) {
    return res.status(422).json({ error: '照片地址非法', code: 'BAD_PHOTO' });
  }
  const idx = s.defects.findIndex((x) => x.id === d.id);
  if (idx >= 0) s.defects[idx] = { ...d, updatedAt: new Date().toISOString() };
  else s.defects.push({ ...d, createdAt: d.createdAt || new Date().toISOString() });
  saveState(s);
  res.json({ ok: true, defect: s.defects.find((x) => x.id === d.id) });
});

app.delete('/api/defects/:id', (req, res) => {
  const s = requireState();
  if (!s) return res.status(404).json({ error: '未初始化' });
  const before = s.defects.length;
  s.defects = s.defects.filter((d) => d.id !== req.params.id);
  if (s.defects.length === before) return res.status(404).json({ error: '病害不存在' });
  saveState(s);
  res.json({ ok: true });
});

// ---------------------------------------------------------------- photos

app.post('/api/photos', (req, res) => {
  try {
    const ct = req.headers['content-type'] ?? '';
    if (!String(ct).includes('multipart/form-data')) {
      return res.status(400).json({ error: '请使用 multipart/form-data 上传' });
    }
    const raw = req.body as Buffer;
    if (!Buffer.isBuffer(raw) || raw.length === 0) {
      return res.status(400).json({ error: '未收到文件内容' });
    }
    const { fields, file } = parseMultipart(String(ct), raw);
    if (!file) return res.status(400).json({ error: '缺少文件字段 file' });
    const saved = saveUpload(file.name, file.mime, file.data);
    res.json({
      id: saved.id,
      url: saved.url,
      caption: fields.caption ?? path.parse(file.name).name,
      takenAt: fields.takenAt,
    });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

// ---------------------------------------------------------------- reports

app.get('/api/report/preview', (_req, res) => {
  const s = requireState();
  if (!s) return res.status(404).json({ error: '未初始化' });
  const { bridge } = buildBridge(s.bridgeConfig ?? DEFAULT_CONFIG);
  const families = buildTimelines(s.defects, s.inspections, { criticalWidthMm: 0.3 });
  const inspection = s.inspections.find((i) => i.id === s.activeInspectionId) ?? s.inspections[s.inspections.length - 1];
  const activeDefects = s.defects.filter((d) => d.inspectionId === inspection.id);
  const stats = computeStats(activeDefects, bridge.components, families);
  const repairs = buildRepairList(activeDefects, families);
  res.json({
    bridge,
    inspection,
    defects: activeDefects,
    families,
    stats,
    repairs,
    confirmations: s.confirmations,
    meta: s.reportMeta,
  });
});

app.get('/api/report/pdf', async (req, res) => {
  const s = requireState();
  if (!s) return res.status(404).json({ error: '未初始化' });
  try {
    const { bridge } = buildBridge(s.bridgeConfig ?? DEFAULT_CONFIG);
    const inspection = s.inspections.find((i) => i.id === s.activeInspectionId) ?? s.inspections[s.inspections.length - 1];
    const activeDefects = s.defects.filter((d) => d.inspectionId === inspection.id);
    const families = buildTimelines(s.defects, s.inspections, { criticalWidthMm: 0.3 });
    const stats = computeStats(activeDefects, bridge.components, families);
    const repairs = buildRepairList(activeDefects, families);
    const pending = activeDefects.filter(
      (d) => !s.confirmations.some((c) => c.defectId === d.id && c.confirmed),
    );
    if (pending.length) {
      return res.status(409).json({
        error: `还有 ${pending.length} 条病害未经工程师确认，暂不能导出正式报告`,
        code: 'UNCONFIRMED',
        pending: pending.map((d) => ({ id: d.id, code: d.code })),
      });
    }

    // 二维码指向只读分享链接；先落一份快照，保证扫码后看到的内容与 PDF 一致
    const token = newId('shr').replace(/_/g, '-');
    const origin = `${req.protocol}://${req.get('host')}`;
    const shareUrl = `${origin}/share/${token}`;
    saveShare({
      token,
      createdAt: new Date().toISOString(),
      snapshot: {
        bridge,
        inspection,
        defects: activeDefects,
        families,
        stats,
        repairs,
        confirmations: s.confirmations,
        meta: s.reportMeta,
        readOnly: true,
      },
    });

    const photoPaths: Record<string, string> = {};
    for (const d of activeDefects) {
      for (const p of d.photos ?? []) {
        const rel = p.url.replace(/^\/uploads\//, '');
        photoPaths[p.url] = path.join(paths.UPLOAD_DIR, rel);
      }
    }

    const pdf = await buildReportPdf({
      bridge,
      inspection,
      defects: activeDefects,
      families,
      stats,
      repairs,
      confirmations: s.confirmations,
      meta: s.reportMeta as ReportMeta,
      shareUrl,
      photoPaths,
    });
    const file = path.join(paths.REPORT_DIR, `${s.reportMeta.reportNo}-${Date.now()}.pdf`);
    fs.writeFileSync(file, pdf);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="bridge-report.pdf"`);
    res.setHeader('X-Share-Url', shareUrl);
    res.setHeader('Access-Control-Expose-Headers', 'X-Share-Url');
    res.send(Buffer.from(pdf));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: `报告生成失败：${(e as Error).message}` });
  }
});

// ---------------------------------------------------------------- confirmations

app.get('/api/confirmations', (_req, res) => {
  const s = requireState();
  if (!s) return res.status(404).json({ error: '未初始化' });
  res.json(s.confirmations);
});

app.post('/api/confirmations', (req, res) => {
  const s = requireState();
  if (!s) return res.status(404).json({ error: '未初始化' });
  const body = req.body ?? {};
  if (!body.defectId) return res.status(400).json({ error: '缺少 defectId' });
  if (!s.defects.some((d) => d.id === body.defectId)) return res.status(404).json({ error: '病害不存在' });
  if (body.confirmed && !String(body.engineer ?? '').trim()) {
    return res.status(422).json({ error: '确认需要填写工程师姓名' });
  }
  const rec = {
    defectId: body.defectId,
    confirmed: !!body.confirmed,
    engineer: body.engineer ?? '',
    note: body.note ?? '',
    at: new Date().toISOString(),
  };
  const idx = s.confirmations.findIndex((c) => c.defectId === body.defectId);
  if (idx >= 0) s.confirmations[idx] = rec;
  else s.confirmations.push(rec);
  saveState(s);
  res.json(rec);
});

// ---------------------------------------------------------------- shares

app.get('/api/shares', (_req, res) => res.json(listShares()));

app.get('/api/share/:token', (req, res) => {
  const rec = loadShare(req.params.token);
  if (!rec) return res.status(404).json({ error: '分享链接不存在或已失效' });
  res.json(rec);
});

// 只读分享页面（无登录，仅展示快照）
app.get('/share/:token', (req, res) => {
  if (!loadShare(req.params.token)) return res.status(404).send('<h1>链接不存在或已失效</h1>');
  const indexFile = path.join(distDir, 'index.html');
  if (fs.existsSync(indexFile)) return res.sendFile(indexFile);
  res.send('<h1>请先构建前端（npm run build）</h1>');
});

// 客户端路由回退
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
  const indexFile = path.join(distDir, 'index.html');
  if (fs.existsSync(indexFile)) return res.sendFile(indexFile);
  next();
});

app.listen(PORT, () => {
  console.log(`[bridge] API ready on http://127.0.0.1:${PORT}`);
});
