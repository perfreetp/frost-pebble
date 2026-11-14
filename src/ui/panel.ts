import type { Conflict, Project, SurfaceId } from '../types';
import { CAR_TYPE_NAMES, CEILING_NAMES, COP_NAMES, DOOR_TYPE_NAMES, SURFACE_NAMES } from '../types';
import type { CeilingType, CopPosition } from '../types';
import { CEILING_DEFS, MATERIAL_LIST, MATERIALS } from '../data/catalog';
import type { QuoteResult } from '../logic/pricing';

export interface PanelCallbacks {
  onMaterial(surface: SurfaceId, matId: string): void;
  onCeilingType(t: CeilingType): void;
  onCopPosition(p: CopPosition): void;
  onHandrail(patch: Partial<Project['config']['handrail']>): void;
}

const SURFACES: SurfaceId[] = ['ceiling', 'floor', 'wall-left', 'wall-right', 'wall-rear', 'door-frame'];

/** 构建整个配置面板(每个项目调用一次) */
export function buildPanel(root: HTMLElement, project: Project, cb: PanelCallbacks) {
  const { spec, config } = project;
  root.innerHTML = '';

  // 项目信息
  root.appendChild(section('项目信息', (el) => {
    el.innerHTML = `
      <div class="kv"><span>梯型</span><b>${CAR_TYPE_NAMES[spec.carType]}</b></div>
      <div class="kv"><span>净尺寸</span><b>${spec.width}×${spec.depth}×${spec.height} mm</b></div>
      <div class="kv"><span>载重</span><b>${spec.load} kg</b></div>
      <div class="kv"><span>开门</span><b>${DOOR_TYPE_NAMES[spec.doorType]}${spec.doorType !== 'center' ? `(门垛${spec.doorStackSide === 'left' ? '左' : '右'}侧)` : ''}</b></div>`;
  }));

  // 冲突提示
  const conflictBox = document.createElement('div');
  conflictBox.id = 'conflicts';
  root.appendChild(conflictBox);

  // 材质选择
  root.appendChild(section('材质选择', (el) => {
    for (const sid of SURFACES) {
      const row = document.createElement('div');
      row.className = 'field';
      const label = document.createElement('label');
      label.textContent = SURFACE_NAMES[sid];
      const sel = document.createElement('select');
      for (const m of MATERIAL_LIST) {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.name;
        sel.appendChild(opt);
      }
      sel.value = config.materials[sid];
      const info = document.createElement('div');
      info.className = 'mat-info';
      const updateInfo = () => {
        const m = MATERIALS[sel.value as keyof typeof MATERIALS];
        info.textContent = `防火 ${m.fireRating} · ${m.unitWeight} kg/m² · ¥${m.unitPrice}/m² · 供货 ${m.leadDays} 天`;
      };
      updateInfo();
      sel.addEventListener('change', () => {
        updateInfo();
        cb.onMaterial(sid, sel.value);
      });
      row.append(label, sel, info);
      el.appendChild(row);
    }
  }));

  // 吊顶
  root.appendChild(section('吊顶', (el) => {
    const row = document.createElement('div');
    row.className = 'field';
    const sel = document.createElement('select');
    (Object.keys(CEILING_DEFS) as CeilingType[]).forEach((t) => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = CEILING_NAMES[t];
      sel.appendChild(opt);
    });
    sel.value = config.ceilingType;
    sel.addEventListener('change', () => cb.onCeilingType(sel.value as CeilingType));
    row.append(labelOf('吊顶形式'), sel);
    el.appendChild(row);
    const lampInfo = document.createElement('div');
    lampInfo.id = 'lamp-info';
    lampInfo.className = 'hint';
    el.appendChild(lampInfo);
  }));

  // 操纵箱
  root.appendChild(section('操纵箱', (el) => {
    const row = document.createElement('div');
    row.className = 'field';
    const sel = document.createElement('select');
    (Object.keys(COP_NAMES) as CopPosition[]).forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p;
      opt.textContent = COP_NAMES[p];
      sel.appendChild(opt);
    });
    sel.value = config.copPosition;
    sel.addEventListener('change', () => cb.onCopPosition(sel.value as CopPosition));
    row.append(labelOf('安装位置'), sel);
    el.appendChild(row);
  }));

  // 扶手
  root.appendChild(section('扶手', (el) => {
    const hr = config.handrail;
    const enableRow = document.createElement('label');
    enableRow.className = 'check';
    const enable = document.createElement('input');
    enable.type = 'checkbox';
    enable.checked = hr.enabled;
    enableRow.append(enable, document.createTextNode(' 配置扶手'));
    el.appendChild(enableRow);

    const wallSel = document.createElement('select');
    (['wall-left', 'wall-right', 'wall-rear'] as const).forEach((w) => {
      const opt = document.createElement('option');
      opt.value = w;
      opt.textContent = SURFACE_NAMES[w];
      wallSel.appendChild(opt);
    });
    wallSel.value = hr.wall;

    const heightIn = numberInput(hr.height, 650, 1000, 10);
    const lengthIn = numberInput(hr.length, 400, 2400, 50);

    const f1 = document.createElement('div'); f1.className = 'field';
    f1.append(labelOf('壁面'), wallSel);
    const f2 = document.createElement('div'); f2.className = 'field';
    f2.append(labelOf('高度 mm'), heightIn);
    const f3 = document.createElement('div'); f3.className = 'field';
    f3.append(labelOf('长度 mm'), lengthIn);
    el.append(f1, f2, f3);

    const syncDisabled = () => {
      wallSel.disabled = heightIn.disabled = lengthIn.disabled = !enable.checked;
    };
    syncDisabled();

    enable.addEventListener('change', () => {
      syncDisabled();
      cb.onHandrail({ enabled: enable.checked });
    });
    wallSel.addEventListener('change', () => cb.onHandrail({ wall: wallSel.value as typeof hr.wall }));
    heightIn.addEventListener('change', () => cb.onHandrail({ height: +heightIn.value }));
    lengthIn.addEventListener('change', () => cb.onHandrail({ length: +lengthIn.value }));
  }));
}

/** 更新冲突提示区 */
export function renderConflicts(conflicts: Conflict[]) {
  const box = document.getElementById('conflicts');
  if (!box) return;
  if (conflicts.length === 0) {
    box.innerHTML = '';
    return;
  }
  box.innerHTML = conflicts
    .map((c) => `<div class="conflict">⚠ ${c.message}</div>`)
    .join('');
}

/** 更新灯具/照度建议 */
export function renderLampInfo(quote: QuoteResult, ceilingType: string) {
  const el = document.getElementById('lamp-info');
  if (!el) return;
  el.textContent =
    ceilingType === 'luminous'
      ? `发光顶整体发光,建议照度 ≥ ${quote.suggestedLux} lx`
      : `按吊顶面积建议灯具 ${quote.lampCount} 盏,照度 ≥ ${quote.suggestedLux} lx`;
}

/** 右侧清单 */
export function renderSummary(quote: QuoteResult) {
  const el = document.getElementById('summary-body');
  if (!el) return;
  const rows = quote.lines
    .map(
      (l) => `<tr><td>${l.item}</td><td class="num">${l.areaM2 ? l.areaM2.toFixed(2) : '—'}</td>
      <td class="num">${l.weightKg.toFixed(1)}</td><td class="num">${l.amount.toLocaleString('zh-CN')}</td></tr>`
    )
    .join('');
  const warn = quote.weightWarn
    ? `<div class="weight-warn">⚠ 增重 ${quote.totalWeightKg.toFixed(1)} kg 超过限值 ${quote.weightLimitKg.toFixed(1)} kg(载重 5%),请减配!</div>`
    : `<div class="weight-ok">增重 ${quote.totalWeightKg.toFixed(1)} / ${quote.weightLimitKg.toFixed(1)} kg ✓</div>`;
  el.innerHTML = `
    <table class="summary-table">
      <thead><tr><th>项目</th><th>m²</th><th>kg</th><th>元</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${warn}
    <div class="kv big"><span>材质面积</span><b>${quote.totalAreaM2.toFixed(2)} m²</b></div>
    <div class="kv big"><span>报价合计</span><b>¥${quote.totalPrice.toLocaleString('zh-CN')}</b></div>
    <div class="kv big"><span>预计交期</span><b>${quote.leadDays} 天</b></div>`;
}

function section(title: string, fill: (el: HTMLElement) => void): HTMLElement {
  const sec = document.createElement('section');
  sec.className = 'panel-section';
  const h = document.createElement('h4');
  h.textContent = title;
  sec.appendChild(h);
  fill(sec);
  return sec;
}

function labelOf(text: string): HTMLLabelElement {
  const l = document.createElement('label');
  l.textContent = text;
  return l;
}

function numberInput(value: number, min: number, max: number, step: number): HTMLInputElement {
  const i = document.createElement('input');
  i.type = 'number';
  i.value = String(value);
  i.min = String(min);
  i.max = String(max);
  i.step = String(step);
  return i;
}
