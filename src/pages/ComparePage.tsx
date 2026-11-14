import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { computeStats } from '../lib/check'
import { exportIncomeReport, exportLayoutSvg, exportStringCsv } from '../lib/exporters'
import type { Scheme } from '../types'

export default function ComparePage() {
  const store = useStore()
  const roof = store.currentRoof()
  const [picked, setPicked] = useState<string[]>([])

  const siblings = useMemo(
    () => (roof ? store.schemes.filter((s) => s.roofId === roof.id) : []),
    [roof, store.schemes],
  )

  const rows = useMemo(() => {
    if (!roof) return []
    return picked
      .map((id) => siblings.find((s) => s.id === id))
      .filter((s): s is Scheme => !!s)
      .map((s) => ({ scheme: s, stats: computeStats(s, roof.planes, store.modules) }))
  }, [picked, siblings, roof, store.modules])

  if (!roof) {
    return (
      <div className="empty">
        <p>请先打开一个屋面</p>
        <button className="btn primary" onClick={() => store.setView('roofs')}>
          去屋面列表
        </button>
      </div>
    )
  }

  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id].slice(-4)))

  const metrics: { label: string; get: (r: (typeof rows)[number]) => string; best?: 'max' | 'min' }[] = [
    { label: '组件数', get: (r) => `${r.stats.panelCount}`, best: 'max' },
    { label: '装机容量 (kWp)', get: (r) => r.stats.capacityKw.toFixed(2), best: 'max' },
    { label: '屋面利用率', get: (r) => `${(r.stats.utilization * 100).toFixed(1)}%`, best: 'max' },
    { label: '组串数', get: (r) => `${r.stats.strings.length}` },
    { label: '红色问题', get: (r) => `${r.stats.redCount}`, best: 'min' },
    { label: '黄色警告', get: (r) => `${r.stats.warnCount}`, best: 'min' },
    { label: '首年发电 (kWh)', get: (r) => r.stats.firstYearKwh.toFixed(0), best: 'max' },
    { label: '25年收益 (万元)', get: (r) => (r.stats.total25YIncome / 10000).toFixed(1), best: 'max' },
    { label: '总投资 (万元)', get: (r) => (r.stats.totalCost / 10000).toFixed(1) },
    {
      label: '回收期 (年)',
      get: (r) => (Number.isFinite(r.stats.paybackYears) ? r.stats.paybackYears.toFixed(1) : '—'),
      best: 'min',
    },
  ]

  const bestValue = (idx: number): string | null => {
    const m = metrics[idx]
    if (!m.best || rows.length < 2) return null
    const nums = rows.map((r) => parseFloat(m.get(r))).filter((n) => Number.isFinite(n))
    if (!nums.length) return null
    const target = m.best === 'max' ? Math.max(...nums) : Math.min(...nums)
    return target.toFixed(1)
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>方案对比 · {roof.name}</h2>
          <p className="muted">勾选最多 4 个版本，指标自动标出最优值；选中任一方案可导出交付物</p>
        </div>
      </div>

      <div className="version-picker">
        {siblings.map((s) => (
          <label key={s.id} className={`pick-chip ${picked.includes(s.id) ? 'on' : ''}`}>
            <input type="checkbox" checked={picked.includes(s.id)} onChange={() => toggle(s.id)} />
            {s.name}
            <span className="muted small">（{s.panels.length} 块 · {new Date(s.updatedAt).toLocaleDateString()}）</span>
          </label>
        ))}
        {!siblings.length && <p className="muted">该屋面还没有方案，先去排布编辑器创建</p>}
      </div>

      {rows.length > 0 && (
        <div className="card table-scroll">
          <table className="data-table compare-table">
            <thead>
              <tr>
                <th>指标</th>
                {rows.map((r) => (
                  <th key={r.scheme.id}>
                    <div className="th-scheme">
                      <button
                        className="link"
                        onClick={() => {
                          store.selectScheme(r.scheme.id)
                          store.setView('editor')
                        }}
                      >
                        {r.scheme.name}
                      </button>
                      <div className="export-row">
                        <button
                          className="btn mini"
                          onClick={() =>
                            exportLayoutSvg(roof, r.scheme, store.modules, r.stats)
                          }
                        >
                          排布图
                        </button>
                        <button
                          className="btn mini"
                          onClick={() => exportStringCsv(roof, r.scheme, r.stats)}
                        >
                          组串表
                        </button>
                        <button
                          className="btn mini"
                          onClick={() => exportIncomeReport(roof, r.scheme, r.stats)}
                        >
                          收益估算
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map((m, idx) => (
                <tr key={m.label}>
                  <td className="muted">{m.label}</td>
                  {rows.map((r) => {
                    const val = m.get(r)
                    const highlight = m.best && bestValue(idx) && parseFloat(val).toFixed(1) === bestValue(idx)
                    return (
                      <td key={r.scheme.id} className={highlight ? 'best' : ''}>
                        {val}
                        {highlight && <span className="crown"> ★</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
              <tr>
                <td className="muted">设计参数</td>
                {rows.map((r) => (
                  <td key={r.scheme.id} className="small muted">
                    横距 {r.scheme.settings.gapX}m / 纵距 {r.scheme.settings.gapY}m
                    <br />
                    退距 {r.scheme.settings.safetyMargin}m / 限值 {r.scheme.settings.orientationLimitDeg}°
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
