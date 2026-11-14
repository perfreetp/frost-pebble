import { For, Show, createSignal, onCleanup, onMount } from 'solid-js';
import { createItem, createProject, currentPerson, registerImage, state, toast } from '../lib/store';
import { normaliseUpload } from '../lib/image';
import { IconPlus, IconUpload } from '../components/icons';
import type { ImageRecord } from '../lib/types';

export function Modal(p: { title: string; subtitle?: string; onClose: () => void; children: any; footer?: any }) {
  onMount(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') p.onClose();
    };
    window.addEventListener('keydown', onKey);
    onCleanup(() => window.removeEventListener('keydown', onKey));
  });
  return (
    <div class="scrim" onClick={(e) => e.target === e.currentTarget && p.onClose()}>
      <div class="modal">
        <div class="modal-head">
          <div>
            <h3>{p.title}</h3>
            <Show when={p.subtitle}>
              <p>{p.subtitle}</p>
            </Show>
          </div>
          <button class="btn ghost sm icon" onClick={p.onClose}>
            ✕
          </button>
        </div>
        <div class="modal-body">{p.children}</div>
        <Show when={p.footer}>
          <div class="modal-foot">{p.footer}</div>
        </Show>
      </div>
    </div>
  );
}

const SHOT_PRESETS = [
  { key: 'walker-warm', label: '四轮助行器 · 暖棚' },
  { key: 'walker-cool', label: '四轮助行器 · 冷棚' },
  { key: 'wheelchair-neutral', label: '康复轮椅 · 中性棚' },
  { key: 'crutches-grey', label: '前臂拐杖 · 灰棚' },
  { key: 'cane-warm', label: '可调手杖 · 暖棚' },
  { key: 'bars-cool', label: '双杠训练架 · 冷棚' },
  { key: 'grip-neutral', label: '握力训练器 · 中性棚' },
  { key: 'walker-grey', label: '四轮助行器 · 灰棚' },
];

export function NewProjectModal(p: { onClose: () => void }) {
  const [brand, setBrand] = createSignal('康步 RECOVIA');
  const [model, setModel] = createSignal('');
  const [scenario, setScenario] = createSignal('电商主图 + 目录册');
  const [count, setCount] = createSignal(8);
  const [days, setDays] = createSignal(7);
  const [notes, setNotes] = createSignal('');
  const [busy, setBusy] = createSignal(false);

  const submit = async () => {
    if (!model().trim()) {
      toast('warn', '请填写产品型号', '型号会印在交付包和看板卡上。');
      return;
    }
    setBusy(true);
    try {
      const proj = await createProject({
        brand: brand().trim(),
        model: model().trim(),
        scenario: scenario().trim(),
        deliverableCount: count(),
        dueAt: Date.now() + days() * 86400000,
        notes: notes().trim(),
      });
      toast('ok', '项目已创建', `${proj.code} · 交付 ${count()} 张 · 截止 ${new Date(proj.dueAt).toLocaleDateString('zh-CN')}`);
      p.onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title="新建定制项目"
      subtitle="填写产品型号、用途场景、交付张数与截止时间，制作员即可在项目里建条目。"
      onClose={p.onClose}
      footer={
        <>
          <button class="btn" onClick={p.onClose}>取消</button>
          <button class="btn primary" disabled={busy()} onClick={submit}>
            <IconPlus size={14} /> 创建项目
          </button>
        </>
      }
    >
      <div class="grid-2">
        <label class="field">
          <span class="field-label"><span>品牌</span></span>
          <input class="text-input" value={brand()} onInput={(e) => setBrand(e.currentTarget.value)} />
        </label>
        <label class="field">
          <span class="field-label"><span>产品型号</span><b>必填</b></span>
          <input class="text-input" placeholder="例如 RX-W450 四轮助行器" value={model()} onInput={(e) => setModel(e.currentTarget.value)} />
        </label>
      </div>
      <label class="field">
        <span class="field-label"><span>用途场景</span></span>
        <input class="text-input" placeholder="例如 2026 春季电商主图 + 线下目录册" value={scenario()} onInput={(e) => setScenario(e.currentTarget.value)} />
      </label>
      <div class="grid-2">
        <label class="field">
          <span class="field-label"><span>交付张数</span></span>
          <input class="num-input" type="number" min="1" max="99" value={count()} onInput={(e) => setCount(Math.max(1, Number(e.currentTarget.value) || 1))} />
        </label>
        <label class="field">
          <span class="field-label"><span>截止时间</span><b>{days()} 天后</b></span>
          <input class="num-input" type="number" min="1" max="90" value={days()} onInput={(e) => setDays(Math.max(1, Number(e.currentTarget.value) || 1))} />
        </label>
      </div>
      <label class="field">
        <span class="field-label"><span>备注要求</span></span>
        <textarea class="text-input" placeholder="透明底要求、背景风格、排版尺寸…" value={notes()} onInput={(e) => setNotes(e.currentTarget.value)} />
      </label>
      <div class="hint">
        下单身份：<b>{currentPerson().name} · {currentPerson().org}</b>。项目创建后，制作员在项目里为每张实拍图建一个条目。
      </div>
    </Modal>
  );
}

export function NewItemModal(p: { projectId: string; onClose: () => void; onCreated?: (id: string) => void }) {
  const [picked, setPicked] = createSignal<{ id: string; name: string; width: number; height: number; thumb: string } | null>(null);
  const [title, setTitle] = createSignal('');
  const [busy, setBusy] = createSignal(false);
  let fileRef: HTMLInputElement | undefined;

  const libraryImages = () =>
    Object.values(state.images)
      .filter((im) => im.id.startsWith('img-'))
      .slice(0, 8);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const { bitmap, blob, thumb } = await normaliseUpload(file);
      const id = `img-upl-${Date.now().toString(36)}`;
      const rec: ImageRecord = {
        id,
        blob,
        width: bitmap.width,
        height: bitmap.height,
        name: file.name,
        thumb,
      };
      bitmap.close();
      await registerImage(rec);
      setPicked({ id, name: rec.name, width: rec.width, height: rec.height, thumb: rec.thumb });
      if (!title()) setTitle(file.name.replace(/\.[^.]+$/, ''));
      toast('ok', '实拍图已载入', `${rec.width}×${rec.height}`);
    } catch (err) {
      toast('error', '图片载入失败', String(err));
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    const img = picked();
    if (!img) {
      toast('warn', '先选一张实拍图', '每个条目对应一张实拍图。');
      return;
    }
    setBusy(true);
    try {
      const item = await createItem(p.projectId, img, title().trim() || undefined);
      toast('ok', '条目已创建', item.title);
      p.onCreated?.(item.id);
      p.onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title="新建条目"
      subtitle="每条对应一张实拍图。载入后进入制作台，计算着色器会先做一次初抠。"
      onClose={p.onClose}
      footer={
        <>
          <button class="btn" onClick={p.onClose}>取消</button>
          <button class="btn primary" disabled={busy() || !picked()} onClick={submit}>
            <IconPlus size={14} /> 建条目并开始抠图
          </button>
        </>
      }
    >
      <div class="file-pick" onClick={() => fileRef?.click()}>
        <IconUpload size={20} />
        <b>上传实拍图</b>
        <span>JPG / PNG · 长边不超过 2400px 自动压缩</span>
      </div>
      <input
        ref={fileRef}
        class="hidden-input"
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.currentTarget.files?.[0];
          if (f) void upload(f);
          e.currentTarget.value = '';
        }}
      />

      <div class="section-title" style={{ 'margin-top': '4px' }}>
        或从样片库选择
        <span class="rule" />
      </div>
      <div class="bg-strip">
        <For each={libraryImages()}>
          {(im) => (
            <div
              class={`bg-thumb ${picked()?.id === im.id ? 'on' : ''}`}
              style={{ 'background-image': `url(${im.thumb})` }}
              onClick={() => {
                setPicked({ id: im.id, name: im.name, width: im.width, height: im.height, thumb: im.thumb });
                if (!title()) setTitle(SHOT_PRESETS.find((s) => `img-${s.key}` === im.id)?.label ?? im.name.replace(/\.[^.]+$/, ''));
              }}
            >
              <span>{SHOT_PRESETS.find((s) => `img-${s.key}` === im.id)?.label ?? im.name}</span>
            </div>
          )}
        </For>
      </div>

      <Show when={picked()}>
        <div class="dq-panel">
          <div class="dq-row">
            <span class="k">已选实拍图</span>
            <span class="v" style={{ 'font-size': '11px' }}>{picked()!.name}</span>
          </div>
          <div class="dq-row">
            <span class="k">尺寸</span>
            <span class="v">{picked()!.width}×{picked()!.height}</span>
          </div>
        </div>
      </Show>

      <label class="field">
        <span class="field-label"><span>条目标题</span></span>
        <input class="text-input" placeholder="例如 四轮助行器 · 主图 01" value={title()} onInput={(e) => setTitle(e.currentTarget.value)} />
      </label>
    </Modal>
  );
}
