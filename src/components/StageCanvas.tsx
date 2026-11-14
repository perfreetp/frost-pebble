import { createEffect, createMemo, createSignal, onCleanup, onMount, Show } from 'solid-js';
import { For } from 'solid-js';
import type { JointDef, PartDef, StagePart, TrackData } from '../types';
import { buildStageParts, evalTrack } from '../lib/anim';
import { loadImage } from '../lib/idb';
import { createRenderer, type Renderer } from '../lib/renderer';

export type StageMode = 'bind' | 'animate' | 'play';

interface Props {
  parts: PartDef[];
  joints: JointDef[];
  track: TrackData;
  frame: number;
  mode: StageMode;
  selectedJointId: string | null;
  onSelectJoint: (id: string | null) => void;
  /** 绑骨模式：拖动关节改变关节静态位置（同时吸附绑定部件的枢轴） */
  onMoveJointBind?: (joint: JointDef, x: number, y: number) => void;
  /** 动画模式：拖动改变当前帧姿态（由父级写入关键帧/草稿） */
  onPoseChange?: (jointId: string, x: number, y: number) => void;
  rendererKind?: (kind: 'webgpu' | 'canvas2d', reason?: string) => void;
  height?: number;
}

const STAGE_W = 960;
const STAGE_H = 600;

export default function StageCanvas(props: Props) {
  let wrapEl: HTMLDivElement | undefined;
  let canvasEl: HTMLCanvasElement | undefined;
  let renderer: Renderer | null = null;
  const [images, setImages] = createSignal<Map<string, HTMLImageElement>>(new Map());
  const [scale, setScale] = createSignal(1);

  // 加载全部部件位图（单个失败不阻断其余部件）
  createEffect(() => {
    let cancelled = false;
    const blobIds = [...new Set(props.parts.map((p) => p.blobId))];
    Promise.all(
      blobIds.map(async (id) => {
        try {
          return [id, await loadImage(id)] as const;
        } catch (err) {
          console.warn('部件图片加载失败，已跳过:', id, err);
          return null;
        }
      }),
    ).then((entries) => {
      if (cancelled) return;
      setImages(new Map(entries.filter((x): x is readonly [string, HTMLImageElement] => x !== null)));
    });
    return () => {
      cancelled = true;
    };
  });

  onMount(async () => {
    const r = await createRenderer(canvasEl!);
    renderer = r.renderer;
    props.rendererKind?.(r.renderer.kind, r.reason);
    const ro = new ResizeObserver(() => {
      if (!wrapEl || !renderer) return;
      const rect = wrapEl.getBoundingClientRect();
      renderer.resize(rect.width, rect.height);
      setScale(Math.min(rect.width / STAGE_W, rect.height / STAGE_H));
    });
    ro.observe(wrapEl!);
    onCleanup(() => {
      ro.disconnect();
      renderer?.destroy();
    });
  });

  const stageParts = createMemo<StagePart[]>(() => {
    const p = evalTrack(props.track, props.frame, props.joints);
    return buildStageParts(props.parts, p, images());
  });

  // 每帧渲染
  createEffect(() => {
    const parts = stageParts();
    const s = scale();
    if (!renderer || !wrapEl || s <= 0) return;
    const rect = wrapEl.getBoundingClientRect();
    renderer.resize(rect.width, rect.height);
    // 缩放 + 居中：模型先按 scale 变换，再平移居中
    const centered = parts.map((sp) => ({
      ...sp,
      x: sp.x * s + (rect.width - STAGE_W * s) / 2,
      y: sp.y * s + (rect.height - STAGE_H * s) / 2,
      width: sp.width * s,
      height: sp.height * s,
      pivotX: sp.pivotX * s,
      pivotY: sp.pivotY * s,
    }));
    renderer.render(centered);
  });

  const toStage = (clientX: number, clientY: number) => {
    const rect = wrapEl!.getBoundingClientRect();
    const s = scale();
    return {
      x: (clientX - rect.left - (rect.width - STAGE_W * s) / 2) / s,
      y: (clientY - rect.top - (rect.height - STAGE_H * s) / 2) / s,
    };
  };

  const dragState = new Map<string, { dx: number; dy: number }>();

  const onPointerDown = (e: PointerEvent, j: JointDef) => {
    if (props.mode === 'play') return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    props.onSelectJoint(j.id);
    const rect = wrapEl!.getBoundingClientRect();
    const s = scale();
    const p = evalTrack(props.track, props.frame, [j]).get(j.id)!;
    const sx = p.x * s + (rect.width - STAGE_W * s) / 2;
    const sy = p.y * s + (rect.height - STAGE_H * s) / 2;
    dragState.set(j.id, { dx: e.clientX - sx, dy: e.clientY - sy });
  };

  const onPointerMove = (e: PointerEvent, j: JointDef) => {
    if (!dragState.has(j.id)) return;
    const off = dragState.get(j.id)!;
    const rect = wrapEl!.getBoundingClientRect();
    const s = scale();
    const x = (e.clientX - off.dx - (rect.width - STAGE_W * s) / 2) / s;
    const y = (e.clientY - off.dy - (rect.height - STAGE_H * s) / 2) / s;
    const clamped = { x: Math.max(0, Math.min(STAGE_W, x)), y: Math.max(0, Math.min(STAGE_H, y)) };
    if (props.mode === 'bind') props.onMoveJointBind?.(j, clamped.x, clamped.y);
    else props.onPoseChange?.(j.id, clamped.x, clamped.y);
  };

  const onPointerUp = (e: PointerEvent, j: JointDef) => {
    dragState.delete(j.id);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const jointPose = (j: JointDef) => evalTrack(props.track, props.frame, [j]).get(j.id)!;

  return (
    <div class="stage-canvas" ref={wrapEl} style={props.height ? { height: `${props.height}px` } : undefined}>
      <canvas ref={canvasEl} />
      <div class="joint-layer">
        <For each={props.joints}>
          {(j) => (
            <JointOverlay
              joint={j}
              parent={props.joints.find((p) => p.id === j.parentId) ?? null}
              selected={props.selectedJointId === j.id}
              mode={props.mode}
              track={props.track}
              frame={props.frame}
              scale={scale()}
              wrapEl={wrapEl!}
              onPointerDown={(e) => onPointerDown(e, j)}
              onPointerMove={(e) => onPointerMove(e, j)}
              onPointerUp={(e) => onPointerUp(e, j)}
            />
          )}
        </For>
      </div>
    </div>
  );
}

/** 独立子组件：保证关节点/骨骼线随帧信号实时重绘 */
function JointOverlay(props: {
  joint: JointDef;
  parent: JointDef | null;
  selected: boolean;
  mode: StageMode;
  track: TrackData;
  frame: number;
  scale: number;
  wrapEl: HTMLDivElement;
  onPointerDown: (e: PointerEvent) => void;
  onPointerMove: (e: PointerEvent) => void;
  onPointerUp: (e: PointerEvent) => void;
}) {
  const pose = () => evalTrack(props.track, props.frame, [props.joint]).get(props.joint.id)!;
  const sp = () => {
    const rect = props.wrapEl.getBoundingClientRect();
    const p = pose();
    return {
      x: p.x * props.scale + (rect.width - STAGE_W * props.scale) / 2,
      y: p.y * props.scale + (rect.height - STAGE_H * props.scale) / 2,
    };
  };
  const bone = () => {
    if (!props.parent) return null;
    const a = evalTrack(props.track, props.frame, [props.parent]).get(props.parent.id)!;
    const b = pose();
    const rect = props.wrapEl.getBoundingClientRect();
    const pa = {
      x: a.x * props.scale + (rect.width - STAGE_W * props.scale) / 2,
      y: a.y * props.scale + (rect.height - STAGE_H * props.scale) / 2,
    };
    const len = Math.hypot(b.x - a.x, b.y - a.y) * props.scale;
    const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    return { pa, len, ang };
  };

  return (
    <>
      <Show when={bone()}>
        {(b) => (
          <div
            class="bone-line"
            style={{
              left: `${b().pa.x}px`,
              top: `${b().pa.y}px`,
              width: `${b().len}px`,
              transform: `rotate(${b().ang}deg)`,
            }}
          />
        )}
      </Show>
      <div
        class={`joint-dot ${props.selected ? 'selected' : ''}`}
        style={{ left: `${sp().x}px`, top: `${sp().y}px`, cursor: props.mode === 'play' ? 'default' : 'grab' }}
        onPointerDown={props.onPointerDown}
        onPointerMove={props.onPointerMove}
        onPointerUp={props.onPointerUp}
      />
      <div class="joint-label" style={{ left: `${sp().x}px`, top: `${sp().y}px` }}>
        {props.joint.name}
      </div>
    </>
  );
}

export { STAGE_W, STAGE_H };
