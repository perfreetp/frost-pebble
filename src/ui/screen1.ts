import type { AppState, MaterialType, PanelAppearance, VehicleType } from '../types';
import { COLOR_CARDS, MATERIALS } from '../data/presets';
import { VEHICLES } from '../data/vehicles';
import { store } from '../store';
import { h, swatch } from './dom';
import type { SceneManager } from '../three/scene';

const VEHICLE_TABS: { type: VehicleType; label: string; icon: string }[] = [
  { type: 'sedan', label: '轿车', icon: '🚗' },
  { type: 'suv', label: 'SUV', icon: '🚙' },
  { type: 'pickup', label: '皮卡', icon: '🛻' },
];

export function initDesignScreen(root: HTMLElement, scene: SceneManager): void {
  const viewerCard = h('div', { class: 'card viewer-card' });
  const canvasHost = h('div', { class: 'canvas-host' });
  const viewBar = h('div', { class: 'view-bar' },
    h('span', { class: 'view-bar-label', text: '视角' }),
    h('button', { class: 'btn', onClick: () => scene.setView('front'), text: '前 45°' }),
    h('button', { class: 'btn', onClick: () => scene.setView('side'), text: '正侧面' }),
    h('button', { class: 'btn', onClick: () => scene.setView('rear'), text: '尾部' }),
    h('label', { class: 'seam-toggle' },
      (() => {
        const cb = h('input', { type: 'checkbox' }) as HTMLInputElement;
        cb.checked = store.get().showSeams;
        cb.addEventListener('change', () => store.update({ showSeams: cb.checked }));
        return cb;
      })(),
      h('span', { text: '显示红色接缝' })
    )
  );
  const hint = h('p', { class: 'viewer-hint', text: '拖拽旋转 · 滚轮缩放 · 双拼模式下点击车身分块即可单独换色' });
  viewerCard.append(canvasHost, viewBar, hint);

  // ---- 右侧控制面板 ----
  const panel = h('div', { class: 'control-panel' });

  const nameInput = h('input', { class: 'input', value: store.get().schemeName }) as HTMLInputElement;
  nameInput.addEventListener('change', () => store.update({ schemeName: nameInput.value || '未命名方案' }));

  const vehicleTabs = h('div', { class: 'segmented' },
    ...VEHICLE_TABS.map((t) =>
      h('button', {
        class: 'segmented-btn',
        'data-vehicle': t.type,
        onClick: () => store.update({ vehicle: t.type, selectedPanel: null, overrides: {} }),
      }, h('span', { class: 'seg-icon', text: t.icon }), h('span', { text: t.label }))
    )
  );

  // 材质类别
  const materialGrid = h('div', { class: 'material-grid' },
    ...MATERIALS.map((m) =>
      h('button', {
        class: 'material-card',
        'data-material': m.type,
        onClick: () => applyEdit((a) => {
          a.material = m.type;
          a.metalness = m.defaults.metalness;
          a.roughness = m.defaults.roughness;
        }),
      },
        h('strong', { text: m.label }),
        h('span', { class: 'material-desc', text: m.desc }))
    )
  );

  // 色卡
  const colorGrid = h('div', { class: 'color-grid' },
    ...COLOR_CARDS.map((c) =>
      h('button', {
        class: 'color-cell',
        title: c.name,
        'data-color': c.hex,
        onClick: () => applyEdit((a) => (a.color = c.hex)),
      }, swatch(c.hex), h('span', { class: 'color-name', text: c.name }))
    )
  );

  const customColor = h('input', { type: 'color' }) as HTMLInputElement;
  customColor.addEventListener('input', () => applyEdit((a) => (a.color = customColor.value)));
  const customRow = h('div', { class: 'custom-color' }, h('span', { text: '自定义颜色' }), customColor);

  // 金属度 / 粗糙度
  const metalSlider = makeSlider('金属度', 0, 1, 0.01, (v) => applyEdit((a) => (a.metalness = v)));
  const roughSlider = makeSlider('粗糙度', 0, 1, 0.01, (v) => applyEdit((a) => (a.roughness = v)));

  // 双拼
  const dualSwitch = h('input', { type: 'checkbox' }) as HTMLInputElement;
  dualSwitch.addEventListener('change', () =>
    store.update({ dualTone: dualSwitch.checked, selectedPanel: dualSwitch.checked ? store.get().selectedPanel : null })
  );
  const dualRow = h('label', { class: 'switch-row' },
    h('span', {}, h('strong', { text: '双拼改色模式' }), h('span', { class: 'sub', text: '引擎盖、车顶等大面可单独换色' })),
    dualSwitch
  );

  const editTarget = h('div', { class: 'edit-target' });
  const panelList = h('div', { class: 'panel-list' });

  scene.onPick = ({ panelId }) => {
    if (!store.get().dualTone) store.update({ dualTone: true });
    store.update({ selectedPanel: panelId });
  };

  panel.append(
    h('div', { class: 'card' },
      h('label', { class: 'field-label', text: '方案名称' }), nameInput,
      h('label', { class: 'field-label', style: 'margin-top:12px', text: '车型' }), vehicleTabs
    ),
    h('div', { class: 'card' },
      h('h3', { class: 'card-title', text: '贴膜材质' }), materialGrid,
      h('h3', { class: 'card-title', text: '预设色卡' }), colorGrid,
      customRow,
      h('h3', { class: 'card-title', text: '质感调节' }), metalSlider, roughSlider
    ),
    h('div', { class: 'card' }, dualRow, editTarget, panelList)
  );

  root.append(viewerCard, panel);

  function applyEdit(fn: (a: PanelAppearance) => void): void {
    const s = store.get();
    if (s.dualTone && s.selectedPanel) {
      const cur: PanelAppearance = s.overrides[s.selectedPanel]
        ? { ...s.overrides[s.selectedPanel] }
        : { ...s.base };
      fn(cur);
      store.mutate((d) => {
        d.overrides = { ...d.overrides, [s.selectedPanel!]: cur };
      });
    } else {
      const cur = { ...s.base };
      fn(cur);
      store.update({ base: cur });
    }
  }

  function makeSlider(label: string, min: number, max: number, step: number, onInput: (v: number) => void): HTMLElement {
    const val = h('span', { class: 'slider-val' });
    const input = h('input', { type: 'range', min: String(min), max: String(max), step: String(step) }) as HTMLInputElement;
    input.addEventListener('input', () => {
      onInput(parseFloat(input.value));
      val.textContent = parseFloat(input.value).toFixed(2);
    });
    return h('div', { class: 'slider-row' },
      h('label', {}, h('span', { text: label }), val),
      input
    );
  }

  // ---- 状态 → 视图同步 ----
  store.subscribe((s) => sync(s));

  function currentAppearance(s: AppState): PanelAppearance {
    return s.dualTone && s.selectedPanel ? s.overrides[s.selectedPanel] ?? s.base : s.base;
  }

  function sync(s: AppState): void {
    vehicleTabs.querySelectorAll<HTMLElement>('[data-vehicle]').forEach((b) =>
      b.classList.toggle('active', b.dataset.vehicle === s.vehicle));
    dualSwitch.checked = s.dualTone;

    const cur = currentAppearance(s);
    materialGrid.querySelectorAll<HTMLElement>('[data-material]').forEach((b) =>
      b.classList.toggle('active', b.dataset.material === cur.material));
    colorGrid.querySelectorAll<HTMLElement>('[data-color]').forEach((b) =>
      b.classList.toggle('active', b.dataset.color?.toLowerCase() === cur.color.toLowerCase()));
    customColor.value = cur.color;
    const inputs = panel.querySelectorAll<HTMLInputElement>('input[type=range]');
    inputs[0].value = String(cur.metalness);
    (inputs[0].previousElementSibling?.querySelector('.slider-val') as HTMLElement).textContent = cur.metalness.toFixed(2);
    inputs[1].value = String(cur.roughness);
    (inputs[1].previousElementSibling?.querySelector('.slider-val') as HTMLElement).textContent = cur.roughness.toFixed(2);

    // 编辑目标提示
    editTarget.replaceChildren();
    if (s.dualTone) {
      const spec = VEHICLES[s.vehicle];
      const target = s.selectedPanel ? spec.panels.find((p) => p.id === s.selectedPanel) : null;
      editTarget.append(
        h('div', { class: 'target-banner' },
          swatch(cur.color),
          h('div', {},
            h('strong', { text: target ? `正在编辑：${target.label}` : '正在编辑：全车基础色' }),
            h('span', { class: 'sub', text: target ? '调整将只作用于该分块' : '点击车身分块或下方列表开始双拼' })
          )
        )
      );
      renderPanelList(s);
      panelList.style.display = '';
    } else {
      panelList.style.display = 'none';
    }
  }

  function renderPanelList(s: AppState): void {
    const spec = VEHICLES[s.vehicle];
    panelList.replaceChildren();
    for (const p of spec.panels) {
      const ap = s.overrides[p.id] ?? s.base;
      const isSel = s.selectedPanel === p.id;
      const row = h('button', {
        class: 'panel-row' + (isSel ? ' selected' : ''),
        onClick: () => store.update({ selectedPanel: p.id }),
      },
        swatch(ap.color),
        h('span', { class: 'panel-row-name', text: p.label }),
        h('span', { class: `bigface-tag ${p.bigFace ? 'yes' : 'no'}`, text: p.bigFace ? '大面' : '常规' }),
        s.overrides[p.id]
          ? h('button', {
              class: 'btn btn-mini',
              onClick: (e: Event) => {
                e.stopPropagation();
                store.mutate((d) => {
                  delete d.overrides[p.id];
                  if (d.selectedPanel === p.id) d.selectedPanel = null;
                });
              },
              text: '恢复同色',
            })
          : h('span', { class: 'sub', text: '跟随全车' })
      );
      panelList.append(row);
    }
  }

  sync(store.get());
}
