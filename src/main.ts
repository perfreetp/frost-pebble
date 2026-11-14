// 应用入口：渲染器/控制器/面板/统计/存储 装配
import './ui/styles.css';
import type { EnvironmentKey, SignElement, StatsResult, TubeElement } from './types';
import { createProject } from './core/defaults';
import { computeQuote, computeStats } from './core/stats';
import { NeonRenderer } from './render/NeonRenderer';
import { buildMeshFor } from './render/NeonRenderer';
import { Overlay } from './editor/overlay';
import { EditorStore } from './editor/store';
import { EditorController, type Tool } from './editor/controller';
import { storage } from './core/storage';
import {
  exportBOM, exportClientHTML, exportConstructionDrawing, exportProjectJSON,
  importProjectJSON, downloadText,
} from './export/exporters';
import { loadDefaultFont, loadFontFile, type LoadedFont } from './core/font';

const $ = <T extends HTMLElement = HTMLElement>(id: string): T => document.getElementById(id) as T;
const input = (id: string): HTMLInputElement => $(id) as HTMLInputElement;
const selectEl = (id: string): HTMLSelectElement => $(id) as HTMLSelectElement;

const glCanvas = $<HTMLCanvasElement>('gl-canvas');
const overlayCanvas = $<HTMLCanvasElement>('overlay-canvas');
const previewCanvas = $<HTMLCanvasElement>('preview-canvas');

const store = new EditorStore();
let renderer: NeonRenderer;
let preview: NeonRenderer;
let overlay: Overlay;
let controller: EditorController;
let stats: StatsResult;
let badCornerMap = new Map<string, Set<number>>;
let loadedFonts: LoadedFont[] = [];
let saveTimer: number | undefined;

// ---------- 初始化 ----------
function init(): void {
  renderer = new NeonRenderer(glCanvas, store.project);
  preview = new NeonRenderer(previewCanvas, store.project);
  overlay = new Overlay(overlayCanvas);
  controller = new EditorController(store, renderer, overlay, glCanvas);
  stats = recomputeStats();

  bindGlobalUI();
  bindToolUI();
  bindWallSettings();
  bindBloomEnv();
  bindAcrylicUI();
  bindSelectionUI();
  bindExportUI();

  store.subscribe(() => {
    scheduleSave();
    refreshPanels();
  });

  // 渲染循环（按需 + rAF 合并）
  let raf = 0;
  const loop = () => {
    renderFrame();
    overlay.resize();
    overlay.draw({
      project: store.project,
      camera: renderer.camera,
      selectedId: store.selectedId,
      draftPoints: store.drafting?.points ?? [],
      snap: controller.currentSnap,
      badCornerMap,
      cursor: controller.currentCursor,
      hoverId: controller.currentHoverId,
    });
    updateStatusBar();
    raf = requestAnimationFrame(loop);
  };
  loop();
  void raf;

  // 预览画布尺寸变化时自适应
  new ResizeObserver(() => {
    preview.resize();
    store.lightChange();
  }).observe(previewCanvas);
  new ResizeObserver(() => overlay.resize()).observe(overlayCanvas);

  refreshPanels();
  loadDefaultFont().then((f) => { loadedFonts = [f]; }).catch(() => undefined);
  refreshLocalList();
}

// ---------- 渲染 ----------
/** 把正在绘制的草稿灯管作为临时元素并入网格，绘制中即可看到发光 */
function activeElements(): SignElement[] {
  const draft = store.drafting;
  if (!draft || draft.points.length < 2) return store.project.elements;
  const d = store.project.settings.defaultTubeDiameter;
  const ghost: TubeElement = {
    id: '__draft__',
    kind: draft.kind,
    points: draft.points.map((p) => ({ ...p })),
    diameter: d,
    cornerRadii: draft.points.slice(1, -1).map(() => d * 2.5),
    color: { ...controller.activeColor },
    ...(draft.kind === 'tube-dual'
      ? { color2: { ...controller.activeColor2 }, dualPeriod: controller.dualPeriod }
      : {}),
  };
  return [...store.project.elements, ghost];
}

function renderFrame(): void {
  if (store.meshDirty) {
    const mesh = buildMeshFor(store.project, badCornerMap, activeElements());
    renderer.render(mesh);
    preview.render(buildMeshFor(store.project, badCornerMap, activeElements()));
    store.meshDirty = false;
  } else {
    renderer.render();
    preview.render();
  }
}

function recomputeStats(): StatsResult {
  stats = computeStats(store.project);
  badCornerMap = new Map();
  for (const w of stats.radiusWarnings) {
    const set = badCornerMap.get(w.id) ?? new Set<number>();
    set.add(w.cornerIndex);
    badCornerMap.set(w.id, set);
  }
  return stats;
}

// ---------- 自动保存 ----------
function scheduleSave(): void {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    storage.save(store.project).then(() => refreshLocalList()).catch(() => undefined);
  }, 800);
}

// ---------- 全局/顶栏 ----------
function bindGlobalUI(): void {
  $('project-name').addEventListener('change', (e) => {
    store.snapshot();
    store.project.name = (e.target as HTMLInputElement).value || '未命名招牌方案';
    store.markMeshDirty();
  });
  $('btn-new').addEventListener('click', () => {
    if (!confirm('新建将清空当前画布（已保存的方案不受影响），继续？')) return;
    store.replaceProject(createProject());
    syncWallInputs();
  });
  $('btn-save').addEventListener('click', async () => {
    await storage.save(store.project);
    toast('已保存到浏览器本地');
    refreshLocalList();
  });
  $('btn-open').addEventListener('click', () => refreshLocalList(true));
  $('btn-import').addEventListener('click', () => $('file-import').click());
  $('file-import').addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      const data = await importProjectJSON(file);
      store.replaceProject(data);
      renderer.setPhoto(data.wall.photo);
      syncWallInputs();
      toast('方案已导入');
    } catch (err) {
      alert('导入失败：' + (err as Error).message);
    }
    (e.target as HTMLInputElement).value = '';
  });
}

// ---------- 工具 ----------
function bindToolUI(): void {
  document.querySelectorAll<HTMLButtonElement>('.tool-btn').forEach((btn) => {
    btn.addEventListener('click', () => setTool(btn.dataset.tool as Tool));
  });
  $('btn-finish-draft').addEventListener('click', () => controller.finishDraft());
  $('btn-cancel-draft').addEventListener('click', () => controller.cancelDraft());

  const swatches = $('swatches');
  const palette = ['#ff3cb4', '#ff2e2e', '#ff9f1a', '#ffe93c', '#39ff7a', '#35d6ff', '#4d6bff', '#b14dff', '#ffffff'];
  for (const c of palette) {
    const d = document.createElement('div');
    d.className = 'swatch';
    d.style.background = c;
    d.addEventListener('click', () => {
      input('color-main').value = c;
      controller.activeColor = hexToRgb(c);
    });
    swatches.appendChild(d);
  }
  $('color-main').addEventListener('input', (e) => {
    controller.activeColor = hexToRgb((e.target as HTMLInputElement).value);
  });
  $('color-second').addEventListener('input', (e) => {
    controller.activeColor2 = hexToRgb((e.target as HTMLInputElement).value);
  });
  $('dual-period').addEventListener('input', (e) => {
    controller.dualPeriod = Number((e.target as HTMLInputElement).value) || 300;
  });
}

function setTool(tool: Tool): void {
  controller.setTool(tool);
  document.querySelectorAll('.tool-btn').forEach((b) => b.classList.toggle('active', (b as HTMLElement).dataset.tool === tool));
  $('draw-actions').classList.toggle('hidden', tool !== 'tube-single' && tool !== 'tube-dual');
  $('group-acrylic').classList.toggle('hidden', tool !== 'acrylic');
  $('group-radius').classList.toggle('hidden', tool !== 'radius');
  $('row-color2').classList.toggle('hidden', tool !== 'tube-dual');
  $('row-dual-period').classList.toggle('hidden', tool !== 'tube-dual');
  glCanvas.style.cursor = tool === 'select' ? 'default' : 'crosshair';
}

// ---------- 墙面/参数 ----------
function bindWallSettings(): void {
  syncWallInputs();
  const apply = () => {
    const w = Number(input('wall-w').value);
    const h = Number(input('wall-h').value);
    if (w < 100 || h < 100) return;
    store.snapshot();
    store.project.wall.width = w;
    store.project.wall.height = h;
    store.project.settings.gridSize = Number(input('grid-size').value) || 50;
    store.project.settings.defaultTubeDiameter = Number(input('tube-dia').value) || 8;
    renderer.frameWall(w, h);
    preview.frameWall(w, h);
    store.markMeshDirty();
  };
  ['wall-w', 'wall-h', 'grid-size', 'tube-dia'].forEach((id) => $(id).addEventListener('change', apply));

  $('btn-photo').addEventListener('click', () => $('file-photo').click());
  $('file-photo').addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      store.project.wall.photo = url;
      renderer.setPhoto(url);
      preview.setPhoto(url);
      $('btn-photo-clear').classList.remove('hidden');
      scheduleSave();
    };
    reader.readAsDataURL(file);
    (e.target as HTMLInputElement).value = '';
  });
  $('btn-photo-clear').addEventListener('click', () => {
    store.project.wall.photo = '';
    renderer.setPhoto('');
    preview.setPhoto('');
    $('btn-photo-clear').classList.add('hidden');
    scheduleSave();
  });

  // 电气/单价
  const s = store.project.settings;
  input('set-wm').value = String(s.wattsPerM);
  input('set-maxlen').value = String(s.maxTubeLength);
  input('set-margin').value = String(s.loadMargin);
  input('price-single').value = String(s.prices.tubeSinglePerM);
  input('price-dual').value = String(s.prices.tubeDualPerM);
  input('price-connector').value = String(s.prices.connectorEach);
  input('price-acrylic').value = String(s.prices.acrylicPerCmHeight);
  input('price-wall').value = String(s.prices.wallPanelPerSqm);
  ['set-wm', 'set-maxlen', 'set-margin', 'price-single', 'price-dual', 'price-connector', 'price-acrylic', 'price-wall']
    .forEach((id) => $(id).addEventListener('change', applySettings));
}

function applySettings(): void {
  const s = store.project.settings;
  s.wattsPerM = Number(input('set-wm').value) || 9;
  s.maxTubeLength = Number(input('set-maxlen').value) || 2400;
  s.loadMargin = Number(input('set-margin').value) || 0.8;
  s.prices.tubeSinglePerM = Number(input('price-single').value) || 0;
  s.prices.tubeDualPerM = Number(input('price-dual').value) || 0;
  s.prices.connectorEach = Number(input('price-connector').value) || 0;
  s.prices.acrylicPerCmHeight = Number(input('price-acrylic').value) || 0;
  s.prices.wallPanelPerSqm = Number(input('price-wall').value) || 0;
  store.markMeshDirty();
}

function syncWallInputs(): void {
  input('wall-w').value = String(store.project.wall.width);
  input('wall-h').value = String(store.project.wall.height);
  input('grid-size').value = String(store.project.settings.gridSize);
  input('tube-dia').value = String(store.project.settings.defaultTubeDiameter);
  input('project-name').value = store.project.name;
  $('btn-photo-clear').classList.toggle('hidden', !store.project.wall.photo);
}

// ---------- 环境与泛光 ----------
function bindBloomEnv(): void {
  document.querySelectorAll<HTMLButtonElement>('.env-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const env = btn.dataset.env as EnvironmentKey;
      const t0 = performance.now();
      store.project.environment = env;
      document.querySelectorAll('.env-btn').forEach((b) => b.classList.toggle('active', b === btn));
      store.lightChange();
      const elapsed = performance.now() - t0;
      if (elapsed > 1000) console.warn('场景切换耗时超标', elapsed);
    });
  });
  const bi = input('bloom-intensity');
  const br = input('bloom-radius');
  bi.value = String(store.project.bloom.intensity);
  br.value = String(store.project.bloom.radius);
  bi.addEventListener('input', () => {
    store.project.bloom.intensity = Number(bi.value);
    $('val-bloom-intensity').textContent = bi.value;
    store.lightChange();
  });
  br.addEventListener('input', () => {
    store.project.bloom.radius = Number(br.value);
    $('val-bloom-radius').textContent = br.value;
    store.lightChange();
  });
  $('val-bloom-intensity').textContent = bi.value;
  $('val-bloom-radius').textContent = br.value;
}

// ---------- 亚克力文字 ----------
function bindAcrylicUI(): void {
  $('btn-font-upload').addEventListener('click', () => $('file-font').click());
  $('file-font').addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      const f = await loadFontFile(file);
      loadedFonts.push(f);
      const opt = document.createElement('option');
      opt.value = f.name; opt.textContent = f.name;
      $('font-select').appendChild(opt);
      input('font-select').value = f.name;
    } catch (err) {
      alert('字体解析失败：' + (err as Error).message);
    }
    (e.target as HTMLInputElement).value = '';
  });
  $('btn-place-text').addEventListener('click', async () => {
    const text = (input('acrylic-text')).value.trim();
    if (!text) { alert('请先输入文字内容'); return; }
    const fontName = (selectEl('font-select')).value;
    let font = loadedFonts.find((f) => f.name === fontName);
    if (!font) font = await loadDefaultFont();
    controller.setTextPending({
      font,
      text,
      sizeMm: Number(input('acrylic-size').value) || 300,
      color: hexToRgb(input('color-main').value),
      strokeWidth: Number(input('acrylic-stroke').value) || 10,
    });
    toast('在画布上点击放置发光字');
  });
}

// ---------- 选中元素属性 / 折弯半径 ----------
function bindSelectionUI(): void {
  $('radius-value').addEventListener('change', (e) => {
    controller.setSelectedCornerRadius(Number((e.target as HTMLInputElement).value));
  });
}

function refreshSelectionProps(): void {
  const el = store.selected;
  const box = $('selection-props');
  const rv = input('radius-value');
  if (!el) {
    box.className = 'hint';
    box.textContent = '未选中元素';
    rv.value = '';
    return;
  }
  box.className = '';
  if (el.kind === 'acrylic') {
    box.innerHTML = `<div>类型：亚克力发光字</div><div>轮廓环：${el.contours.length} 个</div><div>描边宽：${el.strokeWidth} mm</div>`;
  } else {
    const t = el as TubeElement;
    box.innerHTML = `<div>类型：${t.kind === 'tube-dual' ? '双色灯管' : '单色灯管'}</div>
      <div>直径：${t.diameter} mm ｜ 折角：${t.cornerRadii.length} 个</div>
      <div>当前默认半径：${t.cornerRadii[0] ?? 0} mm（下限 ${t.diameter * store.project.settings.minRadiusFactor} mm）</div>`;
    rv.value = String(t.cornerRadii[0] ?? 0);
  }
}

// ---------- 导出 ----------
function bindExportUI(): void {
  $('btn-export-drawing').addEventListener('click', () => { exportConstructionDrawing(store.project); toast('施工图 SVG 已导出'); });
  $('btn-export-bom').addEventListener('click', () => { exportBOM(store.project); toast('材料清单 CSV 已导出'); });
  $('btn-export-client').addEventListener('click', () => { exportClientHTML(store.project); toast('客户预览 HTML 已导出（单文件，可直接发送）'); });
  $('btn-export-json').addEventListener('click', () => { exportProjectJSON(store.project); toast('方案文件已导出'); });
}

// ---------- 右侧统计/报价面板 ----------
function refreshPanels(): void {
  recomputeStats();
  refreshSelectionProps();
  const p = store.project;
  $('stats-table').innerHTML = `
    <tr><th>指标</th><th>数值</th></tr>
    <tr><td>灯管总长</td><td class="num">${stats.totalTubeM.toFixed(2)} m</td></tr>
    <tr><td>接头数量</td><td class="num">${stats.connectorCount} 个</td></tr>
    <tr><td>变压器</td><td class="num">${stats.transformers.length} 台</td></tr>
    <tr><td>总功率</td><td class="num">${stats.totalWatts.toFixed(1)} W</td></tr>
    <tr><td>整体带载余量</td><td class="num ${stats.overallMargin < 0 ? 'warn-row' : 'ok-row'}">${(stats.overallMargin * 100).toFixed(1)}%</td></tr>
    <tr><td>亚克力面积</td><td class="num">${stats.acrylicAreaSqm.toFixed(3)} ㎡</td></tr>`;

  const warnBox = $('warnings');
  const warns: string[] = [];
  for (const w of stats.lengthWarnings) {
    warns.push(`灯管 ${shortId(w.id)} 长 ${w.lengthM.toFixed(2)}m，超过 ${p.settings.maxTubeLength / 1000}m，需加接头（已计入统计）`);
  }
  for (const w of stats.radiusWarnings) {
    warns.push(`灯管 ${shortId(w.id)} 第 ${w.cornerIndex + 1} 个折角 R${w.radius} < 下限 R${w.min}，已标红`);
  }
  for (const t of stats.transformers) {
    if (t.overloaded) warns.push(`变压器 ${t.capacityVA}VA 超载，建议换 ≥ ${t.suggestVA}VA 的型号`);
  }
  warnBox.innerHTML = warns.map((w) => `<div class="item">⚠ ${w}</div>`).join('');

  $('transformer-table').innerHTML = `<tr><th>#</th><th>容量</th><th>负载 W</th><th>负载率</th><th>状态</th></tr>` +
    stats.transformers.map((t, i) => `<tr class="${t.overloaded ? 'warn-row' : 'ok-row'}">
      <td>${i + 1}</td><td>${t.capacityVA}VA</td><td class="num">${t.loadW.toFixed(1)}</td>
      <td class="num">${(t.loadRatio * 100).toFixed(0)}%</td>
      <td>${t.overloaded ? `换 ≥${t.suggestVA}VA` : '正常'}</td></tr>`).join('');

  const quote = computeQuote(p, stats);
  $('quote-table').innerHTML = `<tr><th>项目</th><th>数量</th><th class="num">金额</th></tr>` +
    quote.lines.map((l) => `<tr><td title="${l.spec}">${l.item}</td><td class="num">${l.qty}${l.unit}</td><td class="num">${l.amount.toFixed(2)}</td></tr>`).join('');
  $('quote-total').textContent = `合计：¥ ${quote.total.toFixed(2)}`;
}

async function refreshLocalList(openPicker = false): Promise<void> {
  const list = await storage.list();
  const box = $('local-projects');
  if (list.length === 0) {
    box.innerHTML = '<div class="hint">暂无本地保存的方案</div>';
    return;
  }
  box.innerHTML = '';
  for (const item of list) {
    const row = document.createElement('div');
    row.className = 'local-item';
    row.innerHTML = `<span class="name" title="${item.name}">${item.name}</span>
      <span class="time">${new Date(item.updatedAt).toLocaleDateString('zh-CN')}</span>
      <button class="btn small act-open">打开</button>
      <button class="btn small act-export">导出</button>
      <button class="btn small act-del">删</button>`;
    row.querySelector('.act-open')!.addEventListener('click', () => {
      store.replaceProject(structuredClone(item));
      renderer.setPhoto(item.wall.photo);
      preview.setPhoto(item.wall.photo);
      syncWallInputs();
      if (openPicker) toast('方案已载入');
    });
    row.querySelector('.act-export')!.addEventListener('click', () => {
      downloadText(`${item.name.replace(/[\\/:*?"<>|]/g, '_')}.neon.json`, JSON.stringify(item, null, 2), 'application/json');
    });
    row.querySelector('.act-del')!.addEventListener('click', async () => {
      if (!confirm(`删除本地方案「${item.name}」？`)) return;
      await storage.remove(item.id);
      refreshLocalList();
    });
    box.appendChild(row);
  }
}

// ---------- 工具函数 ----------
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function shortId(id: string): string {
  return id.slice(-4);
}

function updateStatusBar(): void {
  const c = controller.currentCursor;
  $('status-coords').textContent = c ? `X ${c.x.toFixed(0)} , Y ${c.y.toFixed(0)} mm` : '— , —';
  const s = controller.currentSnap;
  $('status-snap').textContent = s && s.source !== 'none'
    ? (s.source === 'endpoint' ? '◉ 端点吸附' : '⊞ 网格吸附')
    : '';
}
let toastTimer: number | undefined;
function toast(msg: string): void {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.style.cssText = 'position:fixed;left:50%;bottom:60px;transform:translateX(-50%);background:#2f6fed;color:#fff;padding:9px 18px;border-radius:9px;font-size:13px;z-index:99;box-shadow:0 6px 24px rgba(0,0,0,.4);transition:opacity .3s';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = '1';
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { el.style.opacity = '0'; }, 2200);
}

init();
