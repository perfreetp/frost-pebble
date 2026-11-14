import { For, Show, createMemo, createSignal } from 'solid-js';
import { zip, strToU8 } from 'fflate';
import { CutoutEngine } from '../gpu/engine';
import { balanceGains, formatDate } from '../lib/color';
import { bgById, itemsOfProject, projectById, state, toast, updateItem } from '../lib/store';
import { bitmapFromBlob, downloadBlob, safeFilename } from '../lib/image';
import { IconCheck, IconDownload, IconPackage } from '../components/icons';

export function DeliverView() {
  const [selectedId, setSelectedId] = createSignal<string | null>(state.activeProjectId ?? state.projects[0]?.id ?? null);
  const [busy, setBusy] = createSignal<string | null>(null);
  const [progress, setProgress] = createSignal(0);

  const project = createMemo(() => (selectedId() ? projectById(selectedId()!) : undefined));
  const approved = createMemo(() => (selectedId() ? itemsOfProject(selectedId()!).filter((i) => i.status === 'approved') : []));
  const all = createMemo(() => (selectedId() ? itemsOfProject(selectedId()!) : []));

  /**
   * Render every approved item through a fresh GPU engine and zip the
   * transparent PNGs plus the composites.
   */
  const packageProject = async () => {
    const proj = project();
    if (!proj || approved().length === 0) return;
    setBusy('打包中…');
    setProgress(0);
    const files: Record<string, Uint8Array> = {};
    const manifest: string[] = [`# ${proj.code} ${proj.brand}`, `# 型号: ${proj.model}`, `# 导出时间: ${formatDate(Date.now())}`, ''];
    try {
      for (let i = 0; i < approved().length; i++) {
        const item = approved()[i];
        setBusy(`渲染 ${i + 1}/${approved().length} · ${item.title}`);
        setProgress((i / approved().length) * 100);
        const rec = state.images[item.sourceImageId];
        if (!rec) continue;
        const bitmap = await bitmapFromBlob(rec.blob);
        const eng = await CutoutEngine.create(bitmap);
        eng.sync(item.doc.cut, item.doc.strokes);
        const bgRec = item.doc.bg ? bgById(item.doc.bg.backgroundId) : null;
        let bgBitmap: ImageBitmap | null = null;
        let bgCct: number | null = null;
        if (bgRec) {
          bgBitmap = await bitmapFromBlob(bgRec.blob);
          bgCct = await CutoutEngine.backgroundCct(bgBitmap);
          eng.setBackground(bgBitmap);
        }
        const sCct = eng.subjectStats().cct;
        const gains: [number, number, number] = bgCct ? balanceGains(sCct, bgCct, item.doc.comp.tempStrength) : [1, 1, 1];
        const base = `${String(item.index).padStart(2, '0')}_${safeFilename(item.title)}`;
        const alpha = await eng.exportAlpha(gains, true);
        files[`transparent/${base}_alpha.png`] = new Uint8Array(await alpha.arrayBuffer());
        if (bgRec) {
          const comp = await eng.exportComposite({
            gains,
            bgScale: item.doc.comp.bgScale,
            bgOffsetX: item.doc.comp.bgOffsetX,
            bgOffsetY: item.doc.comp.bgOffsetY,
            shadowAngle: item.doc.comp.shadowAngle,
            shadowSoftness: item.doc.comp.shadowSoftness,
            shadowOpacity: item.doc.comp.shadowOpacity,
            opacity: 1,
            contrast: 0.16,
            hasBackground: true,
            mode: 'scene',
          });
          files[`composite/${base}_bg-${safeFilename(bgRec.name)}.jpg`] = new Uint8Array(await comp.arrayBuffer());
        }
        eng.destroy();
        bgBitmap?.close();
        bitmap.close();
        manifest.push(`${base}\t${item.width}×${item.height}\t${item.reworkCount} 次返工\t${bgRec ? bgRec.name : '透明底'}`);
      }
      files['manifest.txt'] = strToU8(manifest.join('\n'));
      setBusy('压缩…');
      const zipped = await new Promise<Uint8Array>((resolve, reject) =>
        zip(files, { level: 6 }, (err, data) => (err ? reject(err) : resolve(data))),
      );
      downloadBlob(new Blob([zipped as unknown as ArrayBufferView<ArrayBuffer>], { type: 'application/zip' }), `${safeFilename(proj.code)}_${safeFilename(proj.brand)}_交付包.zip`);
      toast('ok', '交付包已生成', `${approved().length} 张透明底 + 合成图 + 清单`);
    } catch (err) {
      toast('error', '打包失败', String(err));
    } finally {
      setBusy(null);
      setProgress(100);
    }
  };

  const markDelivered = async () => {
    for (const it of approved()) await updateItem(it.id, { updatedAt: it.updatedAt });
    toast('ok', '已标记为交付', '客户可在项目详情中查看交付清单。');
  };

  return (
    <div class="board-scroll">
      <div class="board-head">
        <div>
          <h1 class="board-title">交付打包</h1>
          <div class="board-sub">审核通过的条目按项目打包导出：透明底 PNG + 合成图 + 交付清单</div>
        </div>
        <div style={{ flex: 1 }} />
        <select class="select" style={{ width: '260px' }} value={selectedId() ?? ''} onChange={(e) => setSelectedId(e.currentTarget.value)}>
          <For each={state.projects}>{(p) => <option value={p.id}>{p.code} · {p.model.slice(0, 22)}</option>}</For>
        </select>
        <button class="btn primary" disabled={approved().length === 0 || !!busy()} onClick={packageProject}>
          <IconPackage size={14} /> 打包导出 ({approved().length})
        </button>
      </div>

      <Show when={project()}>
        {(proj) => (
          <>
            <div class="stats-row">
              <div class="stat">
                <div class="k">项目</div>
                <div class="v" style={{ 'font-size': '16px' }}>{proj().code}</div>
                <div class="sub">{proj().brand}</div>
              </div>
              <div class="stat">
                <div class="k">已通过 / 总条目</div>
                <div class="v">
                  {approved().length}
                  <span style={{ 'font-size': '15px', color: 'var(--text-3)' }}> / {all().length}</span>
                </div>
                <div class="sub">需全部通过才建议交付</div>
              </div>
              <div class="stat">
                <div class="k">累计返工</div>
                <div class="v" style={{ color: '#e8955a' }}>{all().reduce((s, i) => s + i.reworkCount, 0)}</div>
                <div class="sub">影响交付质检评分</div>
              </div>
              <div class="stat">
                <div class="k">交付截止</div>
                <div class="v" style={{ 'font-size': '17px' }}>{formatDate(proj().dueAt).slice(0, 10)}</div>
                <div class="sub">{proj().deliverableCount} 张合同交付</div>
              </div>
            </div>

            <Show when={busy()}>
              <div class="panel" style={{ padding: '14px 16px', 'margin-bottom': '16px' }}>
                <div style={{ display: 'flex', 'align-items': 'center', gap: '10px', 'margin-bottom': '9px' }}>
                  <span class="spin" />
                  <span style={{ 'font-size': '12.5px' }}>{busy()}</span>
                  <div style={{ flex: 1 }} />
                  <span class="mono muted">{Math.round(progress())}%</span>
                </div>
                <div class="progress" style={{ height: '5px' }}>
                  <i class="p-approved" style={{ width: `${progress()}%` }} />
                </div>
              </div>
            </Show>

            <div class="panel" style={{ padding: '4px' }}>
              <table style={{ width: '100%', 'border-collapse': 'collapse', 'font-size': '12.5px' }}>
                <thead>
                  <tr style={{ 'text-align': 'left', color: 'var(--text-3)', 'font-size': '11px', 'letter-spacing': '0.06em', 'text-transform': 'uppercase' }}>
                    <th style={{ padding: '10px 12px', 'font-weight': 600 }}>条目</th>
                    <th style={{ padding: '10px 12px', 'font-weight': 600 }}>背景</th>
                    <th style={{ padding: '10px 12px', 'font-weight': 600 }}>返工</th>
                    <th style={{ padding: '10px 12px', 'font-weight': 600 }}>状态</th>
                    <th style={{ padding: '10px 12px', 'font-weight': 600 }}>交付文件</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={all()}>
                    {(item) => (
                      <tr style={{ 'border-top': '1px solid var(--line-soft)' }}>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', 'align-items': 'center', gap: '9px' }}>
                            <div class="qi-thumb" style={{ width: '42px', height: '32px', 'background-image': `url(${item.proof || item.thumb})` }} />
                            <div>
                              <div style={{ 'font-weight': 550 }}>#{String(item.index).padStart(2, '0')} {item.title}</div>
                              <div class="muted" style={{ 'font-size': '10.5px' }}>{item.ownerName} · {item.width}×{item.height}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-2)' }}>{item.doc.bg?.name ?? <span class="muted">透明底</span>}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span class={`chip ${item.reworkCount > 0 ? 'red' : 'slate'}`}>{item.reworkCount}</span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <Show when={item.status === 'approved'} fallback={<span class="chip slate">未通过</span>}>
                            <span class="chip green dot">
                              <IconCheck size={10} /> 已通过
                            </span>
                          </Show>
                        </td>
                        <td class="mono muted" style={{ padding: '10px 12px', 'font-size': '11px' }}>
                          {item.status === 'approved' ? (
                            <>
                              alpha.png{item.doc.bg ? ' + comp.jpg' : ''}
                            </>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: '10px', 'margin-top': '16px' }}>
              <button class="btn" onClick={markDelivered} disabled={approved().length === 0}>
                <IconCheck size={14} /> 标记为已交付
              </button>
              <div style={{ flex: 1 }} />
              <span class="muted" style={{ 'font-size': '11.5px', 'align-self': 'center' }}>
                <IconDownload size={12} style={{ display: 'inline', 'vertical-align': '-2px' }} /> 导出包内每个条目附透明底 PNG，合成图按所选背景输出 JPG
              </span>
            </div>
          </>
        )}
      </Show>
    </div>
  );
}
