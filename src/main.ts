import './style.css';
import type { Conflict, DoorType, LightingPreset, Project, ProjectSpec, ViewMode } from './types';
import { CabinScene } from './scene/cabin';
import { buildQuote } from './logic/pricing';
import { handrailHitsCop, validateConflicts } from './logic/validation';
import { defaultConfig, findTemplate, saveTemplate } from './state';
import { buildPanel, renderConflicts, renderLampInfo, renderSummary } from './ui/panel';
import { exportConfigFile, exportQuote, parseConfigFile } from './ui/quote';

const $ = <T extends HTMLElement>(sel: string) => document.querySelector(sel) as T;

const scene = new CabinScene($<HTMLCanvasElement>('#viewport'));
window.addEventListener('resize', () => scene.resize());

let project: Project | null = null;
let conflicts: Conflict[] = [];

// ---------- 渲染管线 ----------

function refresh() {
  if (!project) return;
  conflicts = validateConflicts(project.spec, project.config);
  scene.setProject(project, conflicts);
  const quote = buildQuote(project);
  renderConflicts(conflicts);
  renderLampInfo(quote, project.config.ceilingType);
  renderSummary(quote);
  saveTemplate(project.spec, project.config);
  updateTemplateButton();
}

function toast(msg: string) {
  const el = $('#toast');
  el.textContent = msg;
  el.hidden = false;
  setTimeout(() => (el.hidden = true), 3200);
}

function updateTemplateButton() {
  const btn = $<HTMLButtonElement>('#btn-apply-template');
  btn.disabled = !project || !findTemplate(project.spec);
}

// ---------- 面板回调 ----------

function mountPanel() {
  if (!project) return;
  $('#panel-empty').hidden = true;
  const body = $('#panel-body');
  body.hidden = false;
  buildPanel(body, project, {
    onMaterial(surface, matId) {
      project!.config.materials[surface] = matId as never;
      refresh();
    },
    onCeilingType(t) {
      project!.config.ceilingType = t;
      refresh();
    },
    onCopPosition(p) {
      project!.config.copPosition = p;
      refresh();
    },
    onHandrail(patch) {
      const prev = JSON.parse(JSON.stringify(project!.config.handrail));
      Object.assign(project!.config.handrail, patch);
      // 扶手压到操纵箱 → 拦截并回退
      if (project!.config.handrail.enabled && handrailHitsCop(project!.spec, project!.config)) {
        project!.config.handrail = prev;
        toast('⚠ 扶手与操纵箱位置冲突,已拦截本次修改');
        mountPanel(); // 重建面板恢复控件值
        refresh();
        return;
      }
      refresh();
    },
  });
}

// ---------- 新建项目 ----------

const dlg = $<HTMLDialogElement>('#dlg-new');
const form = $<HTMLFormElement>('#form-new');

$('#btn-new').addEventListener('click', () => dlg.showModal());

form.addEventListener('submit', (e) => {
  if ((e.submitter as HTMLButtonElement)?.value !== 'ok') return;
  const fd = new FormData(form);
  const doorType = fd.get('doorType') as DoorType;
  const spec: ProjectSpec = {
    name: String(fd.get('name') || '未命名项目'),
    carType: fd.get('carType') as ProjectSpec['carType'],
    width: +fd.get('width')!,
    depth: +fd.get('depth')!,
    height: +fd.get('height')!,
    load: +fd.get('load')!,
    doorType,
    doorStackSide: 'right',
  };
  project = { spec, config: defaultConfig() };
  $('#project-label').textContent = `${spec.name} · ${spec.width}×${spec.depth}×${spec.height}`;
  for (const id of ['#btn-export-quote', '#btn-export-config']) {
    $(id).removeAttribute('disabled');
  }
  mountPanel();
  refresh();
  if (findTemplate(spec)) toast('检测到同型号历史配置,可点击「套用同型号配置」');
});

// ---------- 顶栏 ----------

$('#mode-seg').addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest('button');
  if (!btn) return;
  document.querySelectorAll('#mode-seg button').forEach((b) => b.classList.toggle('active', b === btn));
  scene.setMode(btn.dataset.mode as ViewMode);
});

$('#lighting-select').addEventListener('change', (e) => {
  scene.setLighting((e.target as HTMLSelectElement).value as LightingPreset);
});

$('#btn-apply-template').addEventListener('click', () => {
  if (!project) return;
  const tpl = findTemplate(project.spec);
  if (!tpl) return;
  project.config = JSON.parse(JSON.stringify(tpl));
  mountPanel();
  refresh();
  toast('已套用同型号配置');
});

$('#btn-export-quote').addEventListener('click', () => project && exportQuote(project));
$('#btn-export-config').addEventListener('click', () => project && exportConfigFile(project));

$('#btn-import-config').addEventListener('click', () => $<HTMLInputElement>('#import-file').click());
$('#import-file').addEventListener('change', async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  try {
    project = parseConfigFile(await file.text());
    $('#project-label').textContent = `${project.spec.name} · ${project.spec.width}×${project.spec.depth}×${project.spec.height}`;
    for (const id of ['#btn-export-quote', '#btn-export-config']) {
      $(id).removeAttribute('disabled');
    }
    mountPanel();
    refresh();
    toast('方案导入成功');
  } catch (err) {
    toast(`导入失败:${(err as Error).message}`);
  }
  (e.target as HTMLInputElement).value = '';
});
