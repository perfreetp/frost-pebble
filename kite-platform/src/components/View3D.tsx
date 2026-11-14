import { onCleanup, onMount, createEffect, createSignal } from 'solid-js';
import { KiteScene, type SelectionInfo } from '../three/KiteScene';
import type { CheckIssue, KiteState, Vec3 } from '../types';

interface Props {
  kite: KiteState;
  issues: CheckIssue[];
  selection: SelectionInfo | null;
  onDragStrip: (id: string, offset: Vec3) => void;
  onDragSeam: (id: string, offset: Vec3) => void;
  onDragBridle: (knot: Vec3) => void;
  onSelect: (info: SelectionInfo | null) => void;
}

export default function View3D(props: Props) {
  let host: HTMLDivElement | undefined;
  let scene: KiteScene | undefined;
  const [ready, setReady] = createSignal(false);

  onMount(() => {
    if (!host) return;
    scene = new KiteScene(host, {
      onDragStrip: props.onDragStrip,
      onDragSeam: props.onDragSeam,
      onDragBridle: props.onDragBridle,
      onSelect: props.onSelect,
    });
    setReady(true);
  });

  // 数据变化时命令式刷新(kite 在 store 中以不可变方式替换)
  createEffect(() => {
    // 跟踪所有响应式依赖
    props.kite;
    props.issues;
    props.selection;
    if (!ready() || !scene) return;

    // 选中对象因重新生成而消失时,收敛为空选中,避免持有失效 id
    const sel = props.selection;
    if (sel) {
      const valid = sel.kind === 'strip'
        ? props.kite.strips.some(s => s.id === sel.id)
        : sel.kind === 'seam'
          ? props.kite.seams.some(s => s.id === sel.id)
          : true; // bridle 恒存在
      if (!valid) {
        props.onSelect(null);
        return;
      }
    }
    scene.update(props.kite, props.issues, props.selection);
  });

  onCleanup(() => scene?.dispose());

  return (
    <div class="view3d" style={{ height: '100%' }}>
      <div ref={host} style={{ width: '100%', height: '100%' }} />
      <div class="view-tip">
        左键拖拽竹条/接缝/提线点调整 · 空白处拖动旋转视角 · 滚轮缩放 · 右键平移
      </div>
    </div>
  );
}
