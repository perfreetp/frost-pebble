import type { AppState, MaterialType, SavedScheme } from '../types';
import { MATERIALS, materialLabel } from '../data/presets';
import { VEHICLES } from '../data/vehicles';
import { buildQuote, fmtMoney, fmtPct } from '../calc';
import { store } from '../store';
import { h, swatch } from './dom';
import type { SceneManager } from '../three/scene';

export function initQuoteScreen(root: HTMLElement, scene: SceneManager): void {
  // ---- 单价配置 ----
  const priceCard = h('div', { class: 'card' }, h('h3', { class: 'card-title', text: '门店单价（元 / 平米）' }));
  const priceRows = MATERIALS.map((m) => {
    const input = h('input', { class: 'input price-input', type: 'number', min: '0', step: '1' }) as HTMLInputElement;
    input.addEventListener('change', () => {
      const v = parseFloat(input.value);
      if (Number.isNaN(v) || v < 0) return;
      store.mutate((d) => {
        d.prices = { ...d.prices, [m.type]: v };
      });
    });
    return h('label', { class: 'price-row', 'data-mat': m.type },
      h('span', { class: 'price-name', text: m.label }), input, h('span', { class: 'sub', text: '元/㎡' }));
  });
  const laborInput = h('input', { class: 'input price-input', type: 'number', min: '0', step: '50' }) as HTMLInputElement;
  laborInput.addEventListener('change', () => {
    const v = parseFloat(laborInput.value);
    if (!Number.isNaN(v) && v >= 0) store.update({ laborFee: v });
  });
  priceCard.append(
    h('div', { class: 'price-grid' }, ...priceRows),
    h('label', { class: 'price-row labor-row' }, h('span', { class: 'price-name', text: '施工费（一口价）' }), laborInput, h('span', { class: 'sub', text: '元' }))
  );

  // ---- 报价单 ----
  const quoteCard = h('div', { class: 'card quote-card' },
    h('div', { class: 'quote-head' },
      h('div', {}, h('h2', { id: 'quote-title', text: '' }), h('p', { id: 'quote-sub', class: 'sub', text: '' })),
      h('p', { id: 'quote-date', class: 'sub', text: '' })
    ),
    h('div', { id: 'quote-body' })
  );

  // ---- 导出 / 存档 ----
  const exportCard = h('div', { class: 'card' },
    h('h3', { class: 'card-title', text: '导出与分享' }),
    h('div', { class: 'export-grid' },
      h('button', { class: 'btn btn-primary', id: 'btn-export-imgs', text: '导出客户预览图（3 视角拼图 + 单张）' }),
      h('button', { class: 'btn', id: 'btn-export-txt', text: '导出报价单（TXT）' }),
      h('button', { class: 'btn', id: 'btn-export-json', text: '导出方案文件（JSON）' })
    ),
    h('label', { class: 'btn btn-ghost import-label' },
      '导入方案（JSON）',
      (() => {
        const fi = h('input', { type: 'file', accept: 'application/json,.json', style: 'display:none' }) as HTMLInputElement;
        fi.addEventListener('change', () => {
          const f = fi.files?.[0];
          if (!f) return;
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const data = JSON.parse(String(reader.result)) as SavedScheme;
              if (!data.state || !data.state.vehicle) throw new Error('bad scheme');
              store.mutate((d) => Object.assign(d, data.state));
              alert('方案已导入');
            } catch {
              alert('方案文件格式不正确');
            }
          };
          reader.readAsText(f);
          fi.value = '';
        });
        return fi;
      })()
    ),
    h('h3', { class: 'card-title', style: 'margin-top:16px', text: '本机已存方案' }),
    h('p', { class: 'sub', text: '当前方案自动保存在浏览器，刷新不丢；可另存为快照' }),
    h('div', { class: 'save-row' },
      (() => {
        const si = h('input', { class: 'input', id: 'snapshot-name' }) as HTMLInputElement;
        si.placeholder = '快照名称，如：张先生-红黑双拼';
        return si;
      })(),
      h('button', { class: 'btn btn-primary', id: 'btn-save-snapshot', text: '存为快照' })
    ),
    h('div', { id: 'snapshot-list' })
  );

  root.append(priceCard, quoteCard, exportCard);

  const SNAP_KEY = 'car-wrap-studio:snapshots';
  const loadSnaps = (): SavedScheme[] => {
    try {
      return JSON.parse(localStorage.getItem(SNAP_KEY) ?? '[]') as SavedScheme[];
    } catch {
      return [];
    }
  };
  const writeSnaps = (list: SavedScheme[]) => localStorage.setItem(SNAP_KEY, JSON.stringify(list));

  (exportCard.querySelector('#btn-save-snapshot') as HTMLElement).addEventListener('click', () => {
    const name = (exportCard.querySelector('#snapshot-name') as HTMLInputElement).value.trim() || store.get().schemeName;
    const list = loadSnaps();
    list.unshift({ name, savedAt: new Date().toISOString(), state: structuredClone(store.get()) });
    writeSnaps(list.slice(0, 20));
    renderSnaps();
  });

  function renderSnaps(): void {
    const host = exportCard.querySelector('#snapshot-list') as HTMLElement;
    host.replaceChildren();
    const snaps = loadSnaps();
    if (!snaps.length) {
      host.append(h('p', { class: 'sub', text: '暂无快照' }));
      return;
    }
    snaps.forEach((sp, i) => {
      host.append(h('div', { class: 'snapshot-row' },
        swatch(sp.state.base.color),
        h('div', { class: 'snap-info' },
          h('strong', { text: sp.name }),
          h('span', { class: 'sub', text: `${VEHICLES[sp.state.vehicle].label} · ${new Date(sp.savedAt).toLocaleString('zh-CN')}` })
        ),
        h('button', {
          class: 'btn btn-mini',
          onClick: () => {
            store.mutate((d) => Object.assign(d, structuredClone(sp.state)));
            alert(`已载入快照「${sp.name}」`);
          },
          text: '载入',
        }),
        h('button', {
          class: 'btn btn-mini btn-danger',
          onClick: () => {
            const list = loadSnaps();
            list.splice(i, 1);
            writeSnaps(list);
            renderSnaps();
          },
          text: '删除',
        })
      ));
    });
  }

  // ---- 导出报价 TXT ----
  (exportCard.querySelector('#btn-export-txt') as HTMLElement).addEventListener('click', () => {
    const s = store.get();
    const q = buildQuote(s);
    const lines: string[] = [
      `改色贴膜报价单 — ${s.schemeName}`,
      `车型：${q.vehicleLabel}（${VEHICLES[s.vehicle].overallLength}m 级）`,
      `膜卷宽度：${s.rollWidth}m　拼缝搭接：${s.overlap}m　包边预留：${s.trimAllowance}m`,
      `生成时间：${new Date().toLocaleString('zh-CN')}`,
      '='.repeat(46),
      ...q.groups.flatMap((g) => [
        `【${g.colorName} · ${g.materialLabel}】 单价 ${g.unitPrice} 元/㎡`,
        ...g.panels.map((pc) =>
          `  - ${pc.panel.label}：${pc.area.toFixed(2)}㎡，下料 ${pc.strips} 条 × ${pc.stripWidth.toFixed(2)}×${pc.stripLength.toFixed(2)}m，拼接 ${pc.seams} 条，耗损 ${fmtPct(pc.wasteRate)}`),
        `  小计：净 ${g.area.toFixed(2)}㎡ / 下料 ${g.rawArea.toFixed(2)}㎡，耗损率 ${fmtPct(g.wasteRate)}，金额 ${fmtMoney(g.subtotal)}`,
        '',
      ]),
      '='.repeat(46),
      `净面积合计：${q.totalArea.toFixed(2)}㎡　下料合计：${q.totalRawArea.toFixed(2)}㎡　总拼接：${q.totalSeams} 条　综合耗损：${fmtPct(q.overallWaste)}`,
      `膜材费用：${fmtMoney(q.filmCost)}`,
      `施工费：${fmtMoney(q.laborFee)}`,
      `报价总计：${fmtMoney(q.total)}`,
    ];
    downloadText(`${safeName(s.schemeName)}-报价单.txt`, lines.join('\n'));
  });

  // ---- 导出方案 JSON ----
  (exportCard.querySelector('#btn-export-json') as HTMLElement).addEventListener('click', () => {
    const s = store.get();
    const snap: SavedScheme = { name: s.schemeName, savedAt: new Date().toISOString(), state: structuredClone(s) };
    downloadText(`${safeName(s.schemeName)}-方案.json`, JSON.stringify(snap, null, 2), 'application/json');
  });

  // ---- 导出图片 ----
  (exportCard.querySelector('#btn-export-imgs') as HTMLElement).addEventListener('click', async () => {
    const s = store.get();
    const btn = exportCard.querySelector('#btn-export-imgs') as HTMLButtonElement;
    btn.disabled = true;
    const oldText = btn.textContent;
    try {
      const shots: { view: 'front' | 'side' | 'rear'; label: string; data: string }[] = [];
      for (const [view, label] of [['front', '前45度'], ['side', '正侧面'], ['rear', '尾部']] as const) {
        btn.textContent = `正在渲染 ${label}…`;
        scene.setView(view);
        await nextFrame();
        await wait(120);
        shots.push({ view, label, data: scene.screenshot() });
      }
      shots.forEach((shot) => downloadDataUrl(`${safeName(s.schemeName)}-${shot.label}.png`, shot.data));
      await wait(300);
      const collage = await makeCollage(shots, s);
      downloadDataUrl(`${safeName(s.schemeName)}-预览拼图.png`, collage);
      btn.textContent = '导出完成 ✓';
      await wait(1200);
    } finally {
      btn.disabled = false;
      btn.textContent = oldText;
    }
  });

  function makeCollage(shots: { label: string; data: string }[], s: AppState): Promise<string> {
    return new Promise((resolve, reject) => {
      const imgs = shots.map((shot) => {
        const im = new Image();
        im.onload = () => resolveOnce();
        im.onerror = reject;
        im.src = shot.data;
        return im;
      });
      let loaded = 0;
      const q = buildQuote(s);
      const resolveOnce = () => {
        loaded++;
        if (loaded !== imgs.length) return;
        const w = imgs[0].width;
        const h = imgs[0].height;
        const pad = 28;
        const header = 170;
        const footer = 120;
        const canvas = document.createElement('canvas');
        canvas.width = w * 3 + pad * 4;
        canvas.height = h + header + footer + pad * 3;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#f4f6f9';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText(`${s.schemeName} · ${q.vehicleLabel}改色方案`, pad, 54);
        ctx.font = '22px sans-serif';
        ctx.fillStyle = '#5b6470';
        const colorDesc = q.groups.map((g) => `${g.colorName}(${g.materialLabel}) ${g.rawArea.toFixed(1)}㎡`).join('　');
        ctx.fillText(colorDesc, pad, 92);
        ctx.font = '18px sans-serif';
        ctx.fillStyle = '#8a93a0';
        ctx.fillText(`生成时间 ${new Date().toLocaleString('zh-CN')}`, pad, 124);
        imgs.forEach((im, i) => {
          const x = pad + i * (w + pad);
          const y = header;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
          ctx.drawImage(im, x, y, w, h);
          ctx.fillStyle = '#1f2937';
          ctx.font = 'bold 24px sans-serif';
          ctx.fillText(shots[i].label, x + 12, y - 18);
        });
        const fy = header + h + pad + 8;
        ctx.font = '24px sans-serif';
        ctx.fillStyle = '#111827';
        ctx.fillText(
          `下料合计 ${q.totalRawArea.toFixed(2)}㎡　拼接 ${q.totalSeams} 条　综合耗损 ${fmtPct(q.overallWaste)}　膜材 ${fmtMoney(q.filmCost)} + 施工 ${fmtMoney(q.laborFee)}`,
          pad, fy + 10
        );
        ctx.font = 'bold 32px sans-serif';
        ctx.fillStyle = '#c0151f';
        ctx.fillText(`报价总计：${fmtMoney(q.total)}`, pad, fy + 60);
        resolve(canvas.toDataURL('image/png'));
      };
    });
  }

  store.subscribe((s) => sync(s));

  function sync(s: AppState): void {
    const inputs = priceCard.querySelectorAll<HTMLInputElement>('input[type=number]');
    const mats: MaterialType[] = MATERIALS.map((m) => m.type);
    mats.forEach((t, i) => {
      if (document.activeElement !== inputs[i]) inputs[i].value = String(s.prices[t]);
    });
    if (document.activeElement !== laborInput) laborInput.value = String(s.laborFee);

    const q = buildQuote(s);
    (quoteCard.querySelector('#quote-title') as HTMLElement).textContent = `${s.schemeName} — 改色贴膜报价单`;
    (quoteCard.querySelector('#quote-sub') as HTMLElement).textContent =
      `${q.vehicleLabel}　膜宽 ${s.rollWidth}m　搭接 ${s.overlap}m　包边预留 ${s.trimAllowance}m`;
    (quoteCard.querySelector('#quote-date') as HTMLElement).textContent = new Date().toLocaleDateString('zh-CN');

    const body = quoteCard.querySelector('#quote-body') as HTMLElement;
    body.replaceChildren();
    const table = h('table', { class: 'data-table quote-table' },
      h('thead', {}, h('tr', {},
        h('th', { text: '颜色 / 材质' }), h('th', { text: '分块' }), h('th', { text: '净面积' }),
        h('th', { text: '下料面积' }), h('th', { text: '拼接' }), h('th', { text: '耗损' }),
        h('th', { text: '单价' }), h('th', { text: '小计' })))
    );
    const tb = h('tbody');
    for (const g of q.groups) {
      g.panels.forEach((pc, i) => {
        const row = h('tr');
        if (i === 0) {
          row.append(h('td', { rowspan: String(g.panels.length), class: 'group-cell' },
            h('span', { class: 'cell-color' }, swatch(g.appearance.color), h('strong', { text: `${g.colorName} · ${g.materialLabel}` }))));
        }
        row.append(
          h('td', { text: pc.panel.label }),
          h('td', { text: `${pc.area.toFixed(2)}㎡` }),
          h('td', { text: `${pc.rawArea.toFixed(2)}㎡` }),
          h('td', { text: pc.seams ? `${pc.seams} 条` : '—' }),
          h('td', { text: fmtPct(pc.wasteRate) })
        );
        if (i === 0) {
          row.append(
            h('td', { rowspan: String(g.panels.length), class: 'group-cell', text: `${g.unitPrice} 元/㎡` }),
            h('td', { rowspan: String(g.panels.length), class: 'group-cell subtotal', text: fmtMoney(g.subtotal) })
          );
        }
      tb.append(row);
      });
    }
    table.append(tb, h('tfoot', {},
      h('tr', {}, h('td', { colspan: '2', text: '膜材合计' }),
        h('td', { text: `${q.totalArea.toFixed(2)}㎡` }),
        h('td', { text: `${q.totalRawArea.toFixed(2)}㎡` }),
        h('td', { text: `${q.totalSeams} 条` }),
        h('td', { text: fmtPct(q.overallWaste) }),
        h('td', { text: '' }),
        h('td', { text: fmtMoney(q.filmCost) })),
      h('tr', {}, h('td', { colspan: '7', text: '施工费（一口价）' }), h('td', { text: fmtMoney(q.laborFee) })),
      h('tr', { class: 'grand-total' }, h('td', { colspan: '7', text: '报价总计' }), h('td', { text: fmtMoney(q.total) }))
    ));
    body.append(table);

    renderSnaps();
  }

  sync(store.get());
}

// ---- 工具函数 ----
const nextFrame = (): Promise<void> => new Promise((r) => requestAnimationFrame(() => r()));
const wait = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

function safeName(name: string): string {
  return name.replace(/[\\/:*?"<>|\s]+/g, '_').slice(0, 40) || '方案';
}

function downloadText(filename: string, text: string, mime = 'text/plain;charset=utf-8'): void {
  const blob = new Blob([text], { type: mime });
  triggerDownload(URL.createObjectURL(blob), filename, true);
}

function downloadDataUrl(filename: string, dataUrl: string): void {
  triggerDownload(dataUrl, filename, false);
}

function triggerDownload(href: string, filename: string, revoke: boolean): void {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  if (revoke) setTimeout(() => URL.revokeObjectURL(href), 4000);
}
