import { For, Show } from 'solid-js';
import { createMemo, createSignal } from 'solid-js';
import type { JointDef, TrackData } from '../types';

interface Props {
  track: TrackData;
  joints: JointDef[];
  frame: number;
  playing: boolean;
  selectedJointId: string | null;
  selectedKfFrame: number | null;
  onSeek: (frame: number) => void;
  onTogglePlay: () => void;
  onSelectKf: (jointId: string, frame: number) => void;
  onDeleteKf: (jointId: string, frame: number) => void;
  onDurationChange: (duration: number) => void;
}

const RULER_W = 760;
const ROW_H = 34;

export default function Timeline(props: Props) {
  const pxPerFrame = createMemo(() => RULER_W / Math.max(1, props.track.duration));
  const [dragScrub, setDragScrub] = createSignal(false);

  const frameFromEvent = (e: MouseEvent, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const f = Math.round(((e.clientX - rect.left) / rect.width) * props.track.duration);
    return Math.max(0, Math.min(props.track.duration, f));
  };

  const ticks = createMemo(() => {
    const step = props.track.duration <= 32 ? 4 : props.track.duration <= 64 ? 8 : 16;
    const arr: number[] = [];
    for (let f = 0; f <= props.track.duration; f += step) arr.push(f);
    return arr;
  });

  return (
    <div class="timeline">
      <div class="timeline-controls">
        <button class="small primary" onClick={props.onTogglePlay}>
          {props.playing ? '⏸ 暂停' : '▶ 播放'}
        </button>
        <button class="small" onClick={() => props.onSeek(0)}>⏮ 首帧</button>
        <button class="small" onClick={() => props.onSeek(Math.max(0, props.frame - 1))}>◀ 上一帧</button>
        <button class="small" onClick={() => props.onSeek(Math.min(props.track.duration, props.frame + 1))}>
          下一帧 ▶
        </button>
        <span class="frame-readout mono">
          第 {props.frame} / {props.track.duration} 帧　·　{props.track.fps}fps（{(props.track.duration / props.track.fps).toFixed(2)}s）
        </span>
        <div style={{ flex: 1 }} />
        <label class="field" style={{ 'flex-direction': 'row', 'align-items': 'center', gap: '6px' }}>
          <span>时长(帧)</span>
          <input
            type="number" min={4} max={240} value={props.track.duration}
            style={{ width: '76px' }}
            onChange={(e) => props.onDurationChange(Math.max(4, Math.min(240, Number(e.currentTarget.value) || 0)))}
          />
        </label>
      </div>

      <div style={{ width: `${RULER_W}px`, 'max-width': '100%', 'overflow-x': 'auto' }}>
        {/* 关键动作色带 */}
        <Show when={props.track.actions.length > 0}>
          <div style={{ position: 'relative', height: '16px', 'margin-bottom': '2px' }}>
            <For each={props.track.actions}>
              {(a) => (
                <div
                  class="action-band"
                  style={{
                    left: `${a.startFrame * pxPerFrame()}px`,
                    width: `${Math.max(8, (a.endFrame - a.startFrame) * pxPerFrame())}px`,
                  }}
                  title={`${a.name}：${a.startFrame}-${a.endFrame} 帧`}
                >
                  {a.name}
                </div>
              )}
            </For>
          </div>
        </Show>

        {/* 标尺 */}
        <div
          class="ruler"
          onMouseDown={(e) => {
            setDragScrub(true);
            props.onSeek(frameFromEvent(e, e.currentTarget));
          }}
          onMouseMove={(e) => dragScrub() && props.onSeek(frameFromEvent(e, e.currentTarget))}
          onMouseUp={() => setDragScrub(false)}
          onMouseLeave={() => setDragScrub(false)}
          style={{ cursor: 'pointer' }}
        >
          <For each={ticks()}>
            {(f) => (
              <span class="tick-label mono" style={{ left: `${f * pxPerFrame()}px` }}>{f}</span>
            )}
          </For>
          <div class="playhead" style={{ left: `${props.frame * pxPerFrame()}px` }} />
        </div>

        {/* 每关节轨道 */}
        <For each={props.joints}>
          {(j) => {
            const jt = createMemo(() => props.track.joints.find((t) => t.jointId === j.id));
            return (
              <div class="track-row" style={{ height: `${ROW_H}px` }}>
                <span class="track-name">{j.name}</span>
                <For each={jt()?.keyframes ?? []}>
                  {(kf) => (
                    <div
                      class={`kf-diamond ${props.selectedJointId === j.id && props.selectedKfFrame === kf.frame ? 'selected' : ''}`}
                      style={{ left: `${kf.frame * pxPerFrame()}px` }}
                      title={`第 ${kf.frame} 帧 · 位置(${kf.x.toFixed(0)},${kf.y.toFixed(0)}) 旋转 ${kf.rotation}°`}
                      onClick={() => {
                        props.onSelectKf(j.id, kf.frame);
                        props.onSeek(kf.frame);
                      }}
                      onDblClick={() => props.onDeleteKf(j.id, kf.frame)}
                    />
                  )}
                </For>
                <div class="playhead" style={{ left: `${props.frame * pxPerFrame()}px` }} />
              </div>
            );
          }}
        </For>
      </div>
      <div class="muted" style={{ 'font-size': '11px', 'margin-top': '6px' }}>
        单击菱形跳转并选中关键帧，双击菱形删除；在画布上拖动关节后点「打关键帧」记录姿态。
      </div>
    </div>
  );
}
