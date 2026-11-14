import { createMemo, createSignal, For, onCleanup, onMount, Show } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import type { Course, Easing, JointDef, Keyframe, PartDef, PartKind, TrackData } from '../types';
import { EASE_EASING } from '../types';
import {
  copyActionRange, countKeyframes, defaultActions, emptyTrack, ensureJointTracks,
  evalTrack, findKeyframe, removeKeyframe, uid, upsertKeyframe,
} from '../lib/anim';
import { saveBlob } from '../lib/idb';
import { useStore } from '../lib/store';
import StageCanvas, { type StageMode } from './StageCanvas';
import Timeline from './Timeline';
import EasingEditor from './EasingEditor';
import { useToast } from './ui';
import { PART_KIND_LABEL } from '../types';

interface Props {
  course: Course;
  mode: 'teacher-demo' | 'student-work' | 'review';
  initialTrack: TrackData | null;
  onExit: () => void;
  onSubmit?: (track: TrackData) => void;
  reviewStudentId?: string;
}

export default function AnimationEditor(props: Props) {
  const store = useStore();
  const toast = useToast();
  const readonly = props.mode === 'review';
  const canRig = props.mode === 'teacher-demo';

  const [parts, setParts] = createStore<PartDef[]>(JSON.parse(JSON.stringify(props.course.parts)) as PartDef[]);
  const [joints, setJoints] = createStore<JointDef[]>(JSON.parse(JSON.stringify(props.course.joints)) as JointDef[]);
  const [track, setTrack] = createStore<TrackData>(
    JSON.parse(JSON.stringify(props.initialTrack ?? emptyTrack(props.course.requiredDuration, 24))) as TrackData,
  );

  const [stageMode, setStageMode] = createSignal<StageMode>(canRig ? 'bind' : 'animate');
  const [frame, setFrame] = createSignal(0);
  const [playing, setPlaying] = createSignal(false);
  const [selectedJointId, setSelectedJointId] = createSignal<string | null>(joints[0]?.id ?? null);
  const [selectedKfFrame, setSelectedKfFrame] = createSignal<number | null>(null);
  const [selectedPartId, setSelectedPartId] = createSignal<string | null>(parts[0]?.id ?? null);
  const [rendererKind, setRendererKind] = createSignal<'webgpu' | 'canvas2d'>('webgpu');
  const [fallbackReason, setFallbackReason] = createSignal<string>('');
  const [copyRange, setCopyRange] = createSignal({ start: 0, end: 16, dest: 24 });
  const [dirty, setDirty] = createSignal(false);

  // 确保每个关节都有轨道
  if (track.joints.length === 0 && joints.length > 0) {
    const filled = ensureJointTracks(track, joints);
    setTrack(filled);
  }

  const selectedJoint = () => joints.find((j) => j.id === selectedJointId()) ?? null;
  const selectedPart = () => parts.find((p) => p.id === selectedPartId()) ?? null;
  const selectedKf = createMemo<Keyframe | undefined>(() => {
    const jid = selectedJointId();
    const f = selectedKfFrame();
    if (!jid || f === null) return undefined;
    return findKeyframe(track, jid, f);
  });

  // ---------- 播放循环 ----------
  let raf = 0;
  let lastTs = 0;
  const tick = (ts: number) => {
    if (!playing()) return;
    if (!lastTs) lastTs = ts;
    const delta = ((ts - lastTs) / 1000) * track.fps;
    lastTs = ts;
    let f = frame() + delta;
    if (f >= track.duration) f = f % track.duration; // 循环播放
    setFrame(Math.floor(f));
    raf = requestAnimationFrame(tick);
  };
  const togglePlay = () => {
    if (playing()) {
      setPlaying(false);
      cancelAnimationFrame(raf);
      lastTs = 0;
    } else {
      setStageMode('play');
      setPlaying(true);
      lastTs = 0;
      raf = requestAnimationFrame(tick);
    }
  };
  onCleanup(() => {
    cancelAnimationFrame(raf);
  });

  const seek = (f: number) => {
    setFrame(f);
    setSelectedKfFrame(null);
  };

  // ---------- 绑骨 ----------
  const moveJointBind = (j: JointDef, x: number, y: number) => {
    setDirty(true);
    setJoints((item) => item.id === j.id, produce((it) => {
      it.x = x;
      it.y = y;
    }));
    // 绑定该关节的部件，枢轴跟随
    setParts(
      (p) => p.jointId === j.id,
      produce((p) => {
        p.pivotX = x - p.x;
        p.pivotY = y - p.y;
      }),
    );
  };

  const addJoint = () => {
    const j: JointDef = { id: uid('j'), name: `新关节 ${joints.length + 1}`, x: 480, y: 300, parentId: null };
    setJoints(produce((arr) => arr.push(j)));
    setTrack(produce((t) => {
      if (!t.joints.some((x) => x.jointId === j.id)) t.joints.push({ jointId: j.id, keyframes: [] });
    }));
    setSelectedJointId(j.id);
    setDirty(true);
  };

  const removeJoint = (id: string) => {
    setJoints(produce((arr) => {
      const idx = arr.findIndex((j) => j.id === id);
      if (idx >= 0) arr.splice(idx, 1);
      arr.forEach((j) => { if (j.parentId === id) j.parentId = null; });
    }));
    setParts(produce((arr) => arr.forEach((p) => { if (p.jointId === id) p.jointId = null; })));
    setTrack(produce((t) => {
      const i = t.joints.findIndex((x) => x.jointId === id);
      if (i >= 0) t.joints.splice(i, 1);
    }));
    if (selectedJointId() === id) setSelectedJointId(joints[0]?.id ?? null);
    setDirty(true);
  };

  // ---------- 部件导入 ----------
  const uploadPart = async (e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const blobId = uid('blob');
    await saveBlob(blobId, file);
    const url = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = reject;
      im.src = url;
    });
    URL.revokeObjectURL(url);
    const maxW = 320;
    const scale = img.naturalWidth > maxW ? maxW / img.naturalWidth : 1;
    const part: PartDef = {
      id: uid('p'),
      name: file.name.replace(/\.[^.]+$/, '').slice(0, 16),
      kind: 'other',
      blobId,
      width: Math.round(img.naturalWidth * scale),
      height: Math.round(img.naturalHeight * scale),
      x: 60, y: 60,
      jointId: null, pivotX: 0, pivotY: 0,
      z: parts.length, visible: true,
    };
    setParts(produce((arr) => arr.push(part)));
    setSelectedPartId(part.id);
    setDirty(true);
    input.value = '';
  };

  const bindPartToJoint = (partId: string, jointId: string | null) => {
    setParts(
      (p) => p.id === partId,
      produce((p) => {
        p.jointId = jointId;
        if (jointId) {
          const j = joints.find((x) => x.id === jointId);
          if (j) {
            p.pivotX = j.x - p.x;
            p.pivotY = j.y - p.y;
          }
        }
      }),
    );
    setDirty(true);
  };

  const removePart = (id: string) => {
    setParts(produce((arr) => {
      const i = arr.findIndex((p) => p.id === id);
      if (i >= 0) arr.splice(i, 1);
    }));
    setDirty(true);
  };

  // ---------- 关键帧 ----------
  const currentPose = (jointId: string) => evalTrack(track, frame(), joints).get(jointId)!;

  const bakeKeyframe = () => {
    const j = selectedJoint();
    if (!j || readonly) return;
    const pose = currentPose(j.id);
    const easing: Easing = selectedKf()?.easing ?? { ...EASE_EASING };
    const kf: Keyframe = {
      frame: frame(),
      x: pose.x,
      y: pose.y,
      rotation: Math.round((pose.rotation * 180) / Math.PI),
      easing,
    };
    setTrack(upsertKeyframe(track, j.id, kf));
    setSelectedKfFrame(frame());
    setDirty(true);
  };

  const deleteKf = (jointId: string, f: number) => {
    if (readonly) return;
    setTrack(removeKeyframe(track, jointId, f));
    if (selectedKfFrame() === f) setSelectedKfFrame(null);
    setDirty(true);
  };

  const onPoseChange = (jointId: string, x: number, y: number) => {
    // 实时拖动：直接把姿态写入当前帧的临时关键帧（松开即落帧）
    const existing = findKeyframe(track, jointId, frame());
    const rotation = existing?.rotation ?? Math.round((currentPose(jointId).rotation * 180) / Math.PI);
    const easing = existing?.easing ?? { ...EASE_EASING };
    setTrack(upsertKeyframe(track, jointId, { frame: frame(), x, y, rotation, easing }));
    setSelectedKfFrame(frame());
    setDirty(true);
  };

  const setRotation = (deg: number) => {
    const j = selectedJoint();
    if (!j || readonly) return;
    const pose = currentPose(j.id);
    const existing = findKeyframe(track, j.id, frame());
    const kf: Keyframe = {
      frame: frame(),
      x: existing?.x ?? pose.x,
      y: existing?.y ?? pose.y,
      rotation: deg,
      easing: existing?.easing ?? { ...EASE_EASING },
    };
    setTrack(upsertKeyframe(track, j.id, kf));
    setSelectedKfFrame(frame());
    setDirty(true);
  };

  const updateEasing = (e: Easing) => {
    const kf = selectedKf();
    const j = selectedJoint();
    if (!kf || !j || readonly) return;
    setTrack(upsertKeyframe(track, j.id, { ...kf, easing: e }));
    setDirty(true);
  };

  const doCopyRange = () => {
    const r = copyRange();
    if (r.end <= r.start || r.dest < 0) return;
    setTrack(copyActionRange(track, r.start, r.end, r.dest));
    setDirty(true);
  };

  // ---------- 保存 / 提交 ----------
  const buildCourseSnapshot = (): Course => ({
    ...props.course,
    parts: JSON.parse(JSON.stringify(parts)),
    joints: JSON.parse(JSON.stringify(joints)),
  });

  const saveDemo = async () => {
    const c = buildCourseSnapshot();
    c.demoTrack = JSON.parse(JSON.stringify(track));
    await store.saveCourse(c);
    setDirty(false);
    toast.show('备课已保存（绑骨结构与示范动画）');
  };

  const saveDraft = async () => {
    if (props.mode !== 'student-work') return;
    const me = store.currentUser()!;
    await store.saveDraft(props.course.id, me.id, JSON.parse(JSON.stringify(track)));
    setDirty(false);
    toast.show('草稿已保存');
  };

  // 学员离开前自动存草稿
  const exit = async () => {
    if (props.mode === 'student-work' && dirty()) await saveDraft();
    if (props.mode === 'teacher-demo' && dirty()) await saveDemo();
    props.onExit();
  };

  onMount(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty()) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', beforeUnload);
    onCleanup(() => window.removeEventListener('beforeunload', beforeUnload));
  });

  const totalKf = createMemo(() => countKeyframes(track));

  return (
    <div class="page" style={{ 'max-width': 'none' }}>
      <div class="page-head">
        <div>
          <h2>
            {props.course.name}
            <span class={`tag diff-${props.course.difficulty}`} style={{ margin: '0 10px' }}>{props.course.difficulty}</span>
            <span class="tag">{props.mode === 'teacher-demo' ? '老师备课台' : props.mode === 'student-work' ? '学员练习台' : '逐帧复核'}</span>
          </h2>
          <div class="sub">
            渲染管线：{rendererKind() === 'webgpu'
              ? 'WebGPU 硬件加速'
              : `Canvas2D 降级（${fallbackReason()}）`}
            　·　关键帧 {totalKf()} 个
          </div>
        </div>
        <div class="row">
          <Show when={!readonly}>
            <button onClick={() => setStageMode(stageMode() === 'bind' ? 'animate' : 'bind')} disabled={!canRig}>
              {stageMode() === 'bind' ? '当前：绑骨模式 → 切动画' : '当前：动画模式 → 切绑骨'}
            </button>
            <Show when={props.mode === 'teacher-demo'}>
              <button class="primary" onClick={saveDemo}>保存备课（绑骨+示范）</button>
            </Show>
            <Show when={props.mode === 'student-work'}>
              <button onClick={saveDraft}>存草稿</button>
              <button class="primary" onClick={() => props.onSubmit?.(JSON.parse(JSON.stringify(track)))}>
                提交作品
              </button>
            </Show>
          </Show>
          <button onClick={exit}>返回列表</button>
        </div>
      </div>

      <div class="editor-layout">
        {/* 左栏：部件与关节 */}
        <div class="editor-panel">
          <h4>部件图层（手/针/线/绷架/底稿）</h4>
          <Show when={canRig}>
            <label class="btn small" style={{ display: 'block', 'text-align': 'center', border: '1px dashed var(--line)', 'border-radius': '8px', padding: '8px', cursor: 'pointer', 'margin-bottom': '10px' }}>
              ＋ 上传底稿/部件图
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadPart} />
            </label>
          </Show>
          <For each={parts}>
            {(p) => (
              <div class={`part-list-item ${selectedPartId() === p.id ? 'selected' : ''}`} onClick={() => setSelectedPartId(p.id)}>
                <span class="grow">{p.name}</span>
                <span class="tag">{PART_KIND_LABEL[p.kind]}</span>
                <button
                  class="small ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setParts((x) => x.id === p.id, produce((it) => (it.visible = !it.visible)));
                  }}
                >
                  {p.visible ? '👁' : '🚫'}
                </button>
                <Show when={canRig}>
                  <button class="small ghost danger" onClick={(e) => { e.stopPropagation(); removePart(p.id); }}>删</button>
                </Show>
              </div>
            )}
          </For>

          <Show when={selectedPart() && canRig}>
            <hr class="soft" />
            <label class="field">
              部件类型
              <select
                value={selectedPart()!.kind}
                onChange={(e) => setParts((p) => p.id === selectedPartId(), produce((it) => (it.kind = e.currentTarget.value as PartKind)))}
              >
                <For each={Object.entries(PART_KIND_LABEL)}>
                  {([v, label]) => <option value={v}>{label}</option>}
                </For>
              </select>
            </label>
            <label class="field mt8">
              绑定关节（绑骨）
              <select
                value={selectedPart()!.jointId ?? ''}
                onChange={(e) => bindPartToJoint(selectedPartId()!, e.currentTarget.value || null)}
              >
                <option value="">不绑骨（静止）</option>
                <For each={joints}>
                  {(j) => <option value={j.id}>{j.name}</option>}
                </For>
              </select>
            </label>
            <div class="row mt8">
              <label class="field" style={{ flex: 1 }}>
                枢轴 X
                <input
                  type="number" value={Math.round(selectedPart()!.pivotX)}
                  onChange={(e) => setParts((p) => p.id === selectedPartId(), produce((it) => (it.pivotX = Number(e.currentTarget.value))))}
                />
              </label>
              <label class="field" style={{ flex: 1 }}>
                枢轴 Y
                <input
                  type="number" value={Math.round(selectedPart()!.pivotY)}
                  onChange={(e) => setParts((p) => p.id === selectedPartId(), produce((it) => (it.pivotY = Number(e.currentTarget.value))))}
                />
              </label>
            </div>
          </Show>

          <hr class="soft" />
          <div class="row spread mb8">
            <h4 style={{ margin: 0 }}>骨骼关节</h4>
            <Show when={canRig}><button class="small" onClick={addJoint}>＋ 关节</button></Show>
          </div>
          <For each={joints}>
            {(j) => (
              <div class={`joint-list-item ${selectedJointId() === j.id ? 'selected' : ''}`} onClick={() => setSelectedJointId(j.id)}>
                <span class="grow">{j.name}（{Math.round(j.x)},{Math.round(j.y)}）</span>
                <Show when={canRig}>
                  <select
                    value={j.parentId ?? ''}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setJoints((x) => x.id === j.id, produce((it) => (it.parentId = e.currentTarget.value || null)))}
                  >
                    <option value="">根关节</option>
                    <For each={joints.filter((x) => x.id !== j.id)}>
                      {(p) => <option value={p.id}>父：{p.name}</option>}
                    </For>
                  </select>
                  <button class="small ghost danger" onClick={(e) => { e.stopPropagation(); removeJoint(j.id); }}>删</button>
                </Show>
              </div>
            )}
          </For>
        </div>

        {/* 中栏：画布 + 时间轴 */}
        <div class="stage-wrap">
          <StageCanvas
            parts={parts}
            joints={joints}
            track={track}
            frame={frame()}
            mode={stageMode()}
            selectedJointId={selectedJointId()}
            onSelectJoint={setSelectedJointId}
            onMoveJointBind={moveJointBind}
            onPoseChange={onPoseChange}
            rendererKind={(kind, reason) => { setRendererKind(kind); setFallbackReason(reason ?? ''); }}
          />
          <Timeline
            track={track}
            joints={joints}
            frame={frame()}
            playing={playing()}
            selectedJointId={selectedJointId()}
            selectedKfFrame={selectedKfFrame()}
            onSeek={seek}
            onTogglePlay={togglePlay}
            onSelectKf={(jid, f) => { setSelectedJointId(jid); setSelectedKfFrame(f); }}
            onDeleteKf={deleteKf}
            onDurationChange={(d) => { setTrack('duration', d); setDirty(true); }}
          />
        </div>

        {/* 右栏：姿态/缓动/动作区间 */}
        <div class="editor-panel">
          <h4>当前关节：{selectedJoint()?.name ?? '未选择'}</h4>
          <Show when={selectedJoint() && !readonly}>
            <Show when={stageMode() === 'animate'}>
              <button class="primary small" style={{ width: '100%', 'margin-bottom': '10px' }} onClick={bakeKeyframe}>
                ◆ 在第 {frame()} 帧打关键帧
              </button>
              <label class="field">
                旋转角度（度）
                <input
                  type="range" min={-180} max={180}
                  value={Math.round((currentPose(selectedJoint()!.id).rotation * 180) / Math.PI)}
                  onInput={(e) => setRotation(Number(e.currentTarget.value))}
                />
              </label>
              <div class="muted mono mt8">
                位置 X {currentPose(selectedJoint()!.id).x.toFixed(1)}　Y {currentPose(selectedJoint()!.id).y.toFixed(1)}
              </div>
            </Show>
            <Show when={stageMode() === 'bind'}>
              <div class="muted">在画布上直接拖动关节即可完成绑骨，绑定该关节的部件枢轴会自动跟随。</div>
            </Show>

            <hr class="soft" />
            <h4>插值曲线（缓入/缓出独立调）</h4>
            <Show when={selectedKf()} fallback={<div class="muted">选中一个关键帧后调节它到下一帧之间的缓动曲线。</div>}>
              <EasingEditor easing={selectedKf()!.easing} onChange={updateEasing} />
            </Show>

            <hr class="soft" />
            <h4>复制动作到其他帧区间</h4>
            <div class="row">
              <label class="field" style={{ flex: 1 }}>源起 <input type="number" value={copyRange().start}
                onChange={(e) => setCopyRange({ ...copyRange(), start: Number(e.currentTarget.value) })} /></label>
              <label class="field" style={{ flex: 1 }}>源止 <input type="number" value={copyRange().end}
                onChange={(e) => setCopyRange({ ...copyRange(), end: Number(e.currentTarget.value) })} /></label>
            </div>
            <label class="field mt8">目标起始帧 <input type="number" value={copyRange().dest}
              onChange={(e) => setCopyRange({ ...copyRange(), dest: Number(e.currentTarget.value) })} /></label>
            <button class="small mt8" style={{ width: '100%' }} onClick={doCopyRange}>
              复制 [{copyRange().start}-{copyRange().end}] → 第 {copyRange().dest} 帧起
            </button>

            <Show when={canRig}>
              <hr class="soft" />
              <h4>关键动作区间（核对依据）</h4>
              <For each={track.actions}>
                {(a, i) => (
                  <div class="joint-list-item">
                    <span class="grow">{a.name}</span>
                    <input class="mono" style={{ width: '58px' }} type="number" value={a.startFrame}
                      onChange={(e) => setTrack('actions', i(), produce((x) => (x.startFrame = Number(e.currentTarget.value))))} />
                    <span>–</span>
                    <input class="mono" style={{ width: '58px' }} type="number" value={a.endFrame}
                      onChange={(e) => setTrack('actions', i(), produce((x) => (x.endFrame = Number(e.currentTarget.value))))} />
                  </div>
                )}
              </For>
              <button class="small" style={{ width: '100%' }} onClick={() => setTrack('actions', defaultActions(props.course.requiredActions, track.duration))}>
                按课目要求重排动作区间
              </button>
            </Show>
          </Show>

          <Show when={readonly}>
            <div class="muted">复核模式：拖动播放头或播放按钮逐帧查看动作，不可编辑。</div>
          </Show>
        </div>
      </div>
      {toast.msg() && <div class="toast">{toast.msg()}</div>}
    </div>
  );
}
