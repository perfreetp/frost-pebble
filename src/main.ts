import './styles.css';
import { store } from './store';
import { SceneManager } from './three/scene';
import { initDesignScreen } from './ui/screen1';
import { initSeamsScreen } from './ui/screen2';
import { initQuoteScreen } from './ui/screen3';
import { VEHICLES } from './data/vehicles';

const designRoot = document.querySelector<HTMLElement>('#screen-design')!;
const seamsRoot = document.querySelector<HTMLElement>('#screen-seams')!;
const quoteRoot = document.querySelector<HTMLElement>('#screen-quote')!;

const scene = new SceneManager();
// 把渲染容器交给界面一的 canvas-host
initDesignScreen(designRoot, scene);
const host = designRoot.querySelector<HTMLElement>('.canvas-host')!;
scene.mount(host);

initSeamsScreen(seamsRoot);
initQuoteScreen(quoteRoot, scene);

// 初始车型
scene.setVehicle(store.get().vehicle, store.get());

// ---- 全局状态 → 3D 同步 ----
let lastVehicle = store.get().vehicle;
let lastRoll = store.get().rollWidth;
store.subscribe((s) => {
  if (s.vehicle !== lastVehicle) {
    lastVehicle = s.vehicle;
    scene.setVehicle(s.vehicle, s);
  } else if (s.rollWidth !== lastRoll) {
    // 膜宽变化影响超宽分块与红色接缝，需要重建
    lastRoll = s.rollWidth;
    scene.rebuildVehicle(s);
  }
  scene.applyAppearance(s);
  scene.setSeamVisible(s.showSeams);
  scene.highlightPanel(s.dualTone ? s.selectedPanel : null);

  const status = document.querySelector<HTMLElement>('#save-status')!;
  status.textContent = `已保存 · ${VEHICLES[s.vehicle].label} · ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
});
scene.applyAppearance(store.get());
scene.setSeamVisible(store.get().showSeams);

// ---- Tab 切换 ----
document.querySelectorAll<HTMLElement>('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    const name = tab.dataset.tab!;
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t === tab));
    document.querySelectorAll('.screen').forEach((sc) => sc.classList.toggle('active', sc.id === `screen-${name}`));
    // 显示后再 resize，避免容器尺寸为 0
    requestAnimationFrame(() => scene.resize());
  });
});

// ---- 恢复默认 ----
document.querySelector<HTMLElement>('#btn-reset')!.addEventListener('click', () => {
  if (!confirm('确定恢复默认方案？当前配色与参数将被重置（快照保留）。')) return;
  store.reset();
});
