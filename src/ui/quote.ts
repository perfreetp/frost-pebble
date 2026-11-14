import type { Project } from '../types';
import { CAR_TYPE_NAMES, CEILING_NAMES, COP_NAMES, DOOR_TYPE_NAMES } from '../types';
import { buildQuote } from '../logic/pricing';

/** 生成报价单 HTML 并在新窗口打开(可打印/另存 PDF) */
export function exportQuote(project: Project) {
  const q = buildQuote(project);
  const { spec, config } = project;
  const rows = q.lines
    .map(
      (l) => `<tr>
        <td>${l.item}</td><td>${l.material}</td>
        <td class="num">${l.areaM2 ? l.areaM2.toFixed(2) : '—'}</td>
        <td class="num">${l.weightKg.toFixed(1)}</td>
        <td class="num">${l.unitPrice}</td>
        <td class="num">${l.amount.toLocaleString('zh-CN')}</td>
      </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8"><title>报价单 - ${esc(spec.name)}</title>
<style>
  body{font-family:"Microsoft YaHei",sans-serif;margin:40px;color:#222}
  h1{font-size:22px} h2{font-size:16px;margin-top:24px}
  table{border-collapse:collapse;width:100%;margin-top:12px}
  th,td{border:1px solid #999;padding:6px 10px;font-size:13px}
  th{background:#f0f0f0} .num{text-align:right}
  .meta td{border:none;padding:2px 16px 2px 0}
  .warn{color:#c00;font-weight:bold}
  .total{font-weight:bold;background:#fafafa}
  @media print{button{display:none}}
</style></head><body>
<button onclick="window.print()">打印 / 另存 PDF</button>
<h1>电梯轿厢装潢报价单</h1>
<table class="meta"><tr>
  <td>项目名称:${esc(spec.name)}</td>
  <td>梯型:${CAR_TYPE_NAMES[spec.carType]}</td>
  <td>开门方式:${DOOR_TYPE_NAMES[spec.doorType]}</td>
</tr><tr>
  <td>轿厢净尺寸:${spec.width} × ${spec.depth} × ${spec.height} mm</td>
  <td>额定载重:${spec.load} kg</td>
  <td>日期:${new Date().toLocaleDateString('zh-CN')}</td>
</tr></table>

<h2>配置摘要</h2>
<table class="meta"><tr>
  <td>吊顶:${CEILING_NAMES[config.ceilingType]}</td>
  <td>操纵箱位置:${COP_NAMES[config.copPosition]}</td>
  <td>扶手:${config.handrail.enabled ? `有(高 ${config.handrail.height}mm × 长 ${config.handrail.length}mm)` : '无'}</td>
</tr></table>

<h2>明细</h2>
<table>
<thead><tr><th>项目</th><th>材质(防火等级)</th><th>面积 m²</th><th>增重 kg</th><th>单价 元/m²</th><th>金额 元</th></tr></thead>
<tbody>${rows}</tbody>
<tfoot><tr class="total"><td colspan="2">合计</td>
  <td class="num">${q.totalAreaM2.toFixed(2)}</td>
  <td class="num">${q.totalWeightKg.toFixed(1)}</td>
  <td></td>
  <td class="num">¥${q.totalPrice.toLocaleString('zh-CN')}</td></tr></tfoot>
</table>

<h2>增重与交期</h2>
<table class="meta">
<tr><td>装潢总增重:${q.totalWeightKg.toFixed(1)} kg(限值 ${q.weightLimitKg.toFixed(1)} kg,额定载重 5%)
  ${q.weightWarn ? '<span class="warn"> ⚠ 超限,请减配!</span>' : ' ✓ 在限值内'}</td></tr>
<tr><td>灯具数量:${q.lampCount > 0 ? `${q.lampCount} 盏` : '发光顶整体发光'} · 建议照度 ≥ ${q.suggestedLux} lx</td></tr>
<tr><td>预计交期:${q.leadDays} 天(含生产 ${q.leadDays - 0} 天)</td></tr>
</table>
<p style="color:#666;font-size:12px">本报价含材料与安装,不含运输及税费,有效期 30 天。</p>
</body></html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

/** 导出可再导入的方案文件(JSON) */
export function exportConfigFile(project: Project) {
  const payload = {
    app: 'elevator-cabin-configurator',
    version: 1,
    exportedAt: new Date().toISOString(),
    project,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${project.spec.name || 'cabin-config'}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/** 解析导入的方案文件,非法时抛错 */
export function parseConfigFile(text: string): Project {
  const data = JSON.parse(text);
  const p: Project = data?.project ?? data;
  if (!p?.spec || !p?.config) throw new Error('文件格式不正确:缺少 spec/config');
  const s = p.spec;
  if (typeof s.width !== 'number' || typeof s.depth !== 'number' || typeof s.height !== 'number' || typeof s.load !== 'number') {
    throw new Error('文件格式不正确:尺寸/载重缺失');
  }
  return p;
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
