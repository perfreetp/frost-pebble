import { createSignal, For, Show } from 'solid-js';
import { Card, Empty, Field } from '../components/ui';
import { Icon } from '../components/Icon';
import {
  addPhoto, deletePhoto, pushToast, setActivePhoto, state, updatePhoto,
} from '../lib/store';
import { drawSamplePhoto, type SampleBg, type SampleLeaf } from '../lib/sample';
import { fmtDateTime } from '../lib/utils';
import type { Photo } from '../lib/types';

export function loadImageSize(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('图片无法解析'));
    img.src = dataUrl;
  });
}

export default function PhotosPage(props: { onGo: (p: 'workstation') => void }) {
  const batch = () => state.batches.find((b) => b.id === state.activeBatchId);
  const photoList = () => state.photos.filter((p) => p.batchId === state.activeBatchId);

  const [stream, setStream] = createSignal<MediaStream | null>(null);
  const [camError, setCamError] = createSignal('');
  const [label, setLabel] = createSignal('');
  const [note, setNote] = createSignal('');
  let videoEl: HTMLVideoElement | undefined;
  let fileEl: HTMLInputElement | undefined;

  async function startCamera() {
    setCamError('');
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      setStream(s);
      if (videoEl) {
        videoEl.srcObject = s;
        await videoEl.play().catch(() => undefined);
      }
    } catch (e) {
      setCamError(`无法调用摄像头（${(e as Error).message}）。可改用「导入本地照片」或「生成演示样苗」。`);
    }
  }

  function stopCamera() {
    const s = stream();
    s?.getTracks().forEach((t) => t.stop());
    setStream(null);
  }

  function nextName(): string {
    const idx = photoList().length;
    const letter = String.fromCharCode(65 + (idx % 26));
    return `${letter} 号样苗`;
  }

  async function takeShot() {
    if (!videoEl || !stream() || !batch()) return;
    const vw = videoEl.videoWidth || 1280;
    const vh = videoEl.videoHeight || 1280;
    const c = document.createElement('canvas');
    c.width = vw;
    c.height = vh;
    c.getContext('2d')!.drawImage(videoEl, 0, 0, vw, vh);
    const dataUrl = c.toDataURL('image/jpeg', 0.86);
    saveShot(dataUrl, vw, vh, label() || nextName());
  }

  function saveShot(dataUrl: string, width: number, height: number, name: string) {
    if (!batch()) {
      pushToast('warn', '请先选择或新建批次');
      return;
    }
    addPhoto({
      batchId: batch()!.id,
      name,
      dataUrl,
      width,
      height,
      sampleNote: note().trim() || undefined,
      isPrimary: photoList().length === 0,
    });
    setLabel('');
    setNote('');
    pushToast('ok', '样苗照片已存入批次，可进入加工台初抠');
  }

  async function onFile(e: Event) {
    const files = Array.from((e.currentTarget as HTMLInputElement).files ?? []);
    if (!files.length) return;
    for (const f of files) {
      if (!f.type.startsWith('image/')) continue;
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('读取失败'));
        reader.readAsDataURL(f);
      });
      const size = await loadImageSize(dataUrl);
      saveShot(dataUrl, size.width, size.height, label() || `${f.name.replace(/\.[^.]+$/, '')}${photoList().length ? ` · ${nextName()}` : ''}`);
    }
    if (fileEl) fileEl.value = '';
  }

  const [demoBg, setDemoBg] = createSignal<SampleBg>('soil');
  const [demoLeaf, setDemoLeaf] = createSignal<SampleLeaf>('broad');
  const [demoClutter, setDemoClutter] = createSignal(true);

  function addDemo() {
    const drawn = drawSamplePhoto({
      seed: 700 + photoList().length * 37,
      bg: demoBg(),
      leaf: demoLeaf(),
      clutter: demoClutter(),
      heightRatio: 1,
    });
    saveShot(drawn.dataUrl, drawn.canvas.width, drawn.canvas.height, label() || nextName());
  }

  return (
    <div class="grid" style={{ 'grid-template-columns': 'minmax(0, 1.05fr) minmax(0, 1fr)', gap: '16px' }}>
      <div class="grid" style={{ gap: '16px', 'align-content': 'start' }}>
        <Card
          title="采集样苗照片"
          sub={batch() ? `当前批次 ${batch()!.code} · ${batch()!.variety} ${batch()!.cultivar}` : '请先在顶部选择批次'}
          actions={
            <Show when={stream()}>
              <button class="btn sm danger" onClick={stopCamera}>关闭相机</button>
            </Show>
          }
        >
          <Show when={batch()} fallback={<Empty text="尚未选择批次。建档完成后回到此处拍照。" />}>
            <div class="grid" style={{ gap: '12px' }}>
              <div class="cam-stage">
                <Show
                  when={stream()}
                  fallback={
                    <div style={{ padding: '26px', 'text-align': 'center' }}>
                      <div style={{ 'margin-bottom': '10px', color: 'var(--ink-3)', 'font-size': '12.5px' }}>
                        {camError() || '相机未开启。可拍摄、导入，或生成一株演示样苗用于流程演练。'}
                      </div>
                      <div class="row" style={{ 'justify-content': 'center' }}>
                        <button class="btn primary" onClick={startCamera}><Icon name="camera" size={15} /> 开启相机</button>
                      </div>
                    </div>
                  }
                >
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <video ref={videoEl} autoplay playsinline muted style={{ transform: 'scaleX(-1)', 'max-height': '360px' }} />
                  <div class="cam-guide" />
                  <div class="corner" style={{ top: '10px', left: '10px', 'border-right': '0', 'border-bottom': '0' }} />
                  <div class="corner" style={{ top: '10px', right: '10px', 'border-left': '0', 'border-bottom': '0' }} />
                  <div class="corner" style={{ bottom: '10px', left: '10px', 'border-right': '0', 'border-top': '0' }} />
                  <div class="corner" style={{ bottom: '10px', right: '10px', 'border-left': '0', 'border-top': '0' }} />
                  <div class="guide-labels">
                    <span style={{ position: 'absolute', top: '8px', left: '40px' }}>样苗居中 · 主干垂直</span>
                    <span style={{ position: 'absolute', bottom: '8px', right: '40px' }}>背景纯净 · 白墙或净板</span>
                  </div>
                </Show>
              </div>

              <div class="grid cols-2" style={{ gap: '10px' }}>
                <Field label="样苗编号 / 名称">
                  <input class="input" value={label()} onInput={(e) => setLabel(e.currentTarget.value)} placeholder={nextName()} />
                </Field>
                <Field label="备注（行位、长势）">
                  <input class="input" value={note()} onInput={(e) => setNote(e.currentTarget.value)} placeholder="如：东侧第 4 行" />
                </Field>
              </div>

              <div class="row wrap">
                <button class="btn primary" onClick={takeShot} disabled={!stream()}>
                  <Icon name="camera" size={15} /> 拍摄
                </button>
                <button class="btn" onClick={() => fileEl?.click()}>
                  <Icon name="upload" size={15} /> 导入本地照片
                </button>
                <input ref={fileEl} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={onFile} />
                <span class="hint">建议竖构图、主体占画面 70% 以上，背景与枝叶颜色反差明显。</span>
              </div>
            </div>
          </Show>
        </Card>

        <Card title="演示样苗生成器" sub="没有实拍条件时，快速生成一株带枝叶与杂物的样苗照片，用于验证初抠与画笔修补">
          <div class="grid cols-2" style={{ gap: '10px' }}>
            <Field label="背景材质">
              <select class="input" value={demoBg()} onChange={(e) => setDemoBg(e.currentTarget.value as SampleBg)}>
                <option value="wall">水泥墙</option>
                <option value="soil">圃地土面</option>
                <option value="net">遮阳网</option>
                <option value="white">白板</option>
                <option value="bench">木台面</option>
              </select>
            </Field>
            <Field label="叶型">
              <select class="input" value={demoLeaf()} onChange={(e) => setDemoLeaf(e.currentTarget.value as SampleLeaf)}>
                <option value="broad">阔叶（紫薇/女贞）</option>
                <option value="maple">掌叶（鸡爪槭）</option>
                <option value="ginkgo">扇叶（银杏）</option>
              </select>
            </Field>
          </div>
          <div class="row" style={{ 'margin-top': '12px' }}>
            <label class="row" style={{ gap: '6px', cursor: 'pointer', 'font-size': '12px', color: 'var(--ink-2)' }}>
              <input type="checkbox" checked={demoClutter()} onChange={(e) => setDemoClutter(e.currentTarget.checked)} />
              生成背景杂物（花盆、石块）
            </label>
            <span class="grow" />
            <button class="btn amber" onClick={addDemo} disabled={!batch()}>
              <Icon name="sparkle" size={15} /> 生成样苗
            </button>
          </div>
        </Card>
      </div>

      <Card title="本批样苗" sub={`${photoList().length} 张 · 点击选中后进入加工台`}>
        <Show when={photoList().length} fallback={<Empty text="尚无样苗照片。" />}>
          <div class="shot-grid">
            <For each={photoList()}>
              {(p: Photo) => (
                <div
                  class="shot"
                  classList={{ sel: state.activePhotoId === p.id }}
                  onClick={() => setActivePhoto(p.id)}
                  title={`${p.name} · ${p.width}×${p.height}`}
                >
                  <img src={p.dataUrl} alt={p.name} loading="lazy" />
                  <div class="cap">
                    {p.name}
                    <Show when={p.isPrimary}><span class="pick">主样</span></Show>
                  </div>
                </div>
              )}
            </For>
          </div>

          <hr class="hr" />
          <Show when={state.activePhotoId}>
            <div class="grid" style={{ gap: '10px' }}>
              <div class="row between">
                <div>
                  <div style={{ 'font-weight': 600 }}>{photoList().find((p) => p.id === state.activePhotoId)?.name}</div>
                  <div class="hint">
                    {photoList().find((p) => p.id === state.activePhotoId)?.width}×
                    {photoList().find((p) => p.id === state.activePhotoId)?.height} px ·
                    {' '}{fmtDateTime(photoList().find((p) => p.id === state.activePhotoId)?.createdAt)}
                  </div>
                </div>
                <button class="btn icon danger" title="删除照片" onClick={() => {
                  const id = state.activePhotoId;
                  if (id && confirm('删除该照片及其所有合成版本？')) deletePhoto(id);
                }}>
                  <Icon name="trash" size={14} />
                </button>
              </div>
              <div class="row">
                <button class="btn primary" onClick={() => props.onGo('workstation')}>
                  <Icon name="wand" size={15} /> 进入加工台
                </button>
                <button class="btn" onClick={() => {
                  const p = photoList().find((x) => x.id === state.activePhotoId);
                  if (p) updatePhoto(p.id, { isPrimary: true });
                }}>
                  设为主样
                </button>
              </div>
            </div>
          </Show>
        </Show>
      </Card>
    </div>
  );
}
