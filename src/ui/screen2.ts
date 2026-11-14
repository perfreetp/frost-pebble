import type { AppState } from '../types';
import { VEHICLES } from '../data/vehicles';
import { buildQuote, fmtPct, wasteLevel } from '../calc';
import { store } from '../store';
import { h, swatch } from './dom';

export function initSeamsScreen(root: HTMLElement): void {
  const paramsCard = h('div', { class: 'card' },
    h('h3', { class: 'card-title', text: '施工与膜卷参数' }),
    h('p', { class: 'sub', text: '修改后下方拼接条数、红色接缝与用料自动重算' })
  );

  const rollInput = numInput('膜卷宽度（米）', 1, 2, 0.01, (v) => store.update({ rollWidth: v }));
  const overlapInput = numInput('拼缝搭接量（米）', 0, 0.1, 0.005, (v) => store.update({ overlap: v }));
  const trimInput = numInput('包边预留总量（米）', 0, 0.3, 0.01, (v) => store.update({ trimAllowance: v }));
  paramsCard.append(h('div', { class: 'params-grid' }, rollInput, overlapInput, trimInput));

  const summaryCard = h('div', { class: 'card' },
    h('h3', { class: 'card-title', text: '按颜色/材质汇总用料' }),
    h('div', { id: 'material-summary' })
  );

  const panelsCard = h('div', { class: 'card' },
    h('h3', { class: 'card-title', text: '车身分块施工提示' }),
    h('div', { class: 'legend' },
      h('span', { class: 'legend-dot red' }), h('span', { class: 'sub', text: '超膜宽分块：已在 3D 场景用红色标出接缝' }),
      h('span', { class: 'legend-dot amber' }), h('span', { class: 'sub', text: '需要开槽或分片拼接' })
    ),
    h('div', { id: 'panel-table' })
  );

  root.append(paramsCard, summaryCard, panelsCard);

  function numInput(label: string, min: number, max: number, step: number, onCommit: (v: number) => void): HTMLElement {
    const input = h('input', { class: 'input', type: 'number', min: String(min), max: String(max), step: String(step) }) as HTMLInputElement;
    input.addEventListener('change', () => {
      const v = parseFloat(input.value);
      if (!Number.isNaN(v)) onCommit(Math.min(max, Math.max(min, v)));
    });
    return h('label', { class: 'num-field' }, h('span', { text: label }), input);
  }

  store.subscribe((s) => sync(s));

  function sync(s: AppState): void {
    // 参数输入（聚焦时不回写，避免打断输入）
    const nums = paramsCard.querySelectorAll<HTMLInputElement>('input[type=number]');
    const values = [s.rollWidth, s.overlap, s.trimAllowance];
    nums.forEach((inp, i) => {
      if (document.activeElement !== inp) inp.value = values[i].toFixed(i === 1 ? 3 : 2);
    });

    const quote = buildQuote(s);

    // 汇总表
    const sumHost = summaryCard.querySelector('#material-summary') as HTMLElement;
    sumHost.replaceChildren();
    const sumTable = h('table', { class: 'data-table' },
      h('thead', {}, h('tr', {},
        h('th', { text: '颜色 / 材质' }), h('th', { text: '净面积(㎡)' }), h('th', { text: '下料(㎡)' }),
        h('th', { text: '用膜长度(m)' }), h('th', { text: '拼接条数' }), h('th', { text: '耗损率' }))),
      h('tbody', {},
        ...quote.groups.map((g) => h('tr', {},
          h('td', {}, h('span', { class: 'cell-color' }, swatch(g.appearance.color), h('span', { text: `${g.colorName} · ${g.materialLabel}` }))),
          h('td', { text: g.area.toFixed(2) }),
          h('td', { text: g.rawArea.toFixed(2) }),
          h('td', { text: g.totalLength.toFixed(2) }),
          h('td', {}, h('span', { class: g.totalSeams > 0 ? 'seam-badge' : 'sub', text: String(g.totalSeams) })),
          h('td', {}, wasteBadge(g.wasteRate))
        )),
        h('tr', { class: 'total-row' },
          h('td', { text: '合计' }),
          h('td', { text: quote.totalArea.toFixed(2) }),
          h('td', { text: quote.totalRawArea.toFixed(2) }),
          h('td', { text: '—' }),
          h('td', { text: String(quote.totalSeams) }),
          h('td', { text: fmtPct(quote.overallWaste) })
        )
      )
    );
    sumHost.append(sumTable);

    // 分块明细
    const spec = VEHICLES[s.vehicle];
    const host = panelsCard.querySelector('#panel-table') as HTMLElement;
    host.replaceChildren();
    const groups: { name: string; panels: typeof spec.panels }[] = [];
    for (const grpName of ['前脸', '车顶', '车侧', '尾部', '车厢'] as const) {
      const ps = spec.panels.filter((p) => p.group === grpName);
      if (ps.length) groups.push({ name: grpName, panels: ps });
    }
    for (const grp of groups) {
      const block = h('div', { class: 'panel-group' },
        h('h4', { class: 'panel-group-title', text: grp.name }),
        ...grp.panels.map((p) => {
          const pc = quote.groups.flatMap((g) => g.panels).find((x) => x.panel.id === p.id)!;
          const ap = s.overrides[p.id] ?? s.base;
          return h('div', { class: 'panel-item' + (pc.overWidth ? ' over-width' : '') },
            h('div', { class: 'panel-item-head' },
              swatch(ap.color),
              h('strong', { text: p.label }),
              h('span', {
                class: `slot-tag tag-${pc.overWidth ? 'red' : p.slotReason === '开槽' ? 'amber' : 'red'}`,
                text: pc.overWidth ? `${p.slotReason} · 超膜宽` : p.slotReason,
              }),
              p.bigFace ? h('span', { class: 'bigface-tag yes', text: '双拼大面' }) : null
            ),
            h('p', { class: 'hint-line' }, h('span', { class: 'hint-key', text: '开槽/拼接：' }), h('span', { text: p.slotHint })),
            h('p', { class: 'hint-line' }, h('span', { class: 'hint-key', text: '接缝走向：' }), h('span', { text: p.seamAdvice })),
            h('div', { class: 'panel-stats' },
              stat('下料条数', `${pc.strips} 条`),
              stat('每条尺寸', `${pc.stripWidth.toFixed(2)} × ${pc.stripLength.toFixed(2)} m`),
              stat('拼接', pc.seams > 0 ? `${pc.seams} 条（红色接缝）` : '无'),
              stat('下料面积', `${pc.rawArea.toFixed(2)} ㎡`),
              stat('耗损率', fmtPct(pc.wasteRate))
            )
          );
        })
      );
      host.append(block);
    }
  }

  function stat(label: string, value: string): HTMLElement {
    return h('div', { class: 'stat' }, h('span', { class: 'sub', text: label }), h('strong', { text: value }));
  }

  function wasteBadge(rate: number): HTMLElement {
    const lv = wasteLevel(rate);
    return h('span', { class: `waste-badge ${lv.cls}`, text: `${fmtPct(rate)} · ${lv.label}` });
  }

  sync(store.get());
}
