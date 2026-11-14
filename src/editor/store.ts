// 编辑器状态：当前方案、选中元素、历史栈（撤销/重做）、订阅通知
import type { ProjectData, SignElement, Vec2 } from '../types';
import { createProject, uid } from '../core/defaults';

type Listener = () => void;

export class EditorStore {
  project: ProjectData;
  selectedId: string | null = null;
  /** 正在绘制中的灯管（未提交） */
  drafting: { kind: 'tube-single' | 'tube-dual'; points: Vec2[] } | null = null;
  private undoStack: ProjectData[] = [];
  private redoStack: ProjectData[] = [];
  private listeners = new Set<Listener>();
  /** 几何脏标记：渲染器需要重建网格 */
  meshDirty = true;
  private suppressHistory = false;

  constructor(project?: ProjectData) {
    this.project = project ?? createProject();
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(): void {
    for (const fn of this.listeners) fn();
  }

  /** 快照入栈（结构性修改前调用） */
  snapshot(): void {
    if (this.suppressHistory) return;
    this.undoStack.push(structuredClone(this.project));
    if (this.undoStack.length > 60) this.undoStack.shift();
    this.redoStack = [];
  }

  markMeshDirty(): void {
    this.meshDirty = true;
    this.emit();
  }

  /** 仅换 uniform 类修改（环境、泛光），不重建几何、不入历史 */
  lightChange(): void {
    this.emit();
  }

  undo(): void {
    const prev = this.undoStack.pop();
    if (!prev) return;
    this.redoStack.push(structuredClone(this.project));
    this.project = prev;
    this.selectedId = null;
    this.drafting = null;
    this.meshDirty = true;
    this.emit();
  }

  redo(): void {
    const next = this.redoStack.pop();
    if (!next) return;
    this.undoStack.push(structuredClone(this.project));
    this.project = next;
    this.meshDirty = true;
    this.emit();
  }

  get canUndo(): boolean { return this.undoStack.length > 0; }
  get canRedo(): boolean { return this.redoStack.length > 0; }

  get selected(): SignElement | null {
    return this.project.elements.find((e) => e.id === this.selectedId) ?? null;
  }

  select(id: string | null): void {
    this.selectedId = id;
    this.emit();
  }

  addElement(el: SignElement, select = true): void {
    this.snapshot();
    this.project.elements.push(el);
    if (select) this.selectedId = el.id;
    this.meshDirty = true;
    this.emit();
  }

  updateElement(id: string, patch: Partial<SignElement>): void {
    this.snapshot();
    const idx = this.project.elements.findIndex((e) => e.id === id);
    if (idx >= 0) {
      this.project.elements[idx] = { ...this.project.elements[idx], ...patch } as SignElement;
    }
    this.meshDirty = true;
    this.emit();
  }

  /** 高频拖拽更新：不入历史，松手时由 endDrag() 补一次快照 */
  beginDrag(): void {
    if (this.suppressHistory) return;
    this.snapshot();
    this.suppressHistory = true;
  }

  dragUpdate(fn: (p: ProjectData) => void): void {
    fn(this.project);
    this.meshDirty = true;
    this.emit();
  }

  endDrag(): void {
    this.suppressHistory = false;
  }

  deleteSelected(): void {
    if (!this.selectedId) return;
    this.snapshot();
    this.project.elements = this.project.elements.filter((e) => e.id !== this.selectedId);
    this.selectedId = null;
    this.meshDirty = true;
    this.emit();
  }

  duplicateSelected(): void {
    const el = this.selected;
    if (!el) return;
    this.snapshot();
    const copy = structuredClone(el);
    copy.id = uid(el.kind);
    const shift = (p: Vec2): Vec2 => ({ x: p.x + 40, y: p.y + 40 });
    if (copy.kind === 'acrylic') copy.contours = copy.contours.map((r) => r.map(shift));
    else copy.points = copy.points.map(shift);
    this.project.elements.push(copy);
    this.selectedId = copy.id;
    this.meshDirty = true;
    this.emit();
  }

  replaceProject(next: ProjectData): void {
    this.snapshot();
    this.project = next;
    this.selectedId = null;
    this.drafting = null;
    this.meshDirty = true;
    this.emit();
  }
}
