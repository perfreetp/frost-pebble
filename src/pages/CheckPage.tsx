import { useMemo } from 'react'
import { useStore } from '../store'
import { computeStats } from '../lib/check'

const CODE_LABEL: Record<string, string> = {
  'out-of-roof': '超出屋面',
  'overlap-obstacle': '禁布区碰撞',
  'parapet-margin': '女儿墙退距',
  orientation: '朝向超限',
  shadow: '阴影间距',
  'panel-overlap': '组件重叠',
}

export default function CheckPage() {
  const store = useStore()
  const roof = store.currentRoof()
  const scheme = store.currentScheme()

  const stats = useMemo(() => {
    if (!roof || !scheme) return null
    return computeStats(scheme, roof.planes, store.modules)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheme, roof, store.modules])

  if (!roof || !scheme || !stats) {
    return (
      <div className="empty">
        <p>请先打开一个方案</p>
        <button className="btn primary" onClick={() => store.setView('roofs')}>
          去屋面列表
        </button>
      </div>
    )
  }

  const planeName = (id: string) => roof.planes.find((p) => p.id === id)?.name ?? id
  const panelMap = new Map(scheme.panels.map((p) => [p.id, p]))

  const grouped = new Map<string, typeof stats.issues>()
  for (const issue of stats.issues) {
    const key = issue.code
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(issue)
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>校核结果 · {scheme.name}</h2>
          <p className="muted">
            红色问题必须消除后方可出图；黄色为阴影间距警告，可结合场地条件评估
          </p>
        </div>
        <button className="btn" onClick={() => store.setView('editor')}>
          ← 返回编辑
        </button>
      </div>

      <div className="check-summary">
        <div className="metric">
          <span className="metric-label">组件总数</span>
          <strong>{stats.panelCount}</strong>
        </div>
        <div className="metric">
          <span className="metric-label">装机容量</span>
          <strong>{stats.capacityKw.toFixed(2)} kWp</strong>
        </div>
        <div className="metric">
          <span className="metric-label">屋面利用率</span>
          <strong>{(stats.utilization * 100).toFixed(1)}%</strong>
        </div>
        <div className="metric">
          <span className="metric-label">组串数</span>
          <strong>{stats.strings.length}</strong>
        </div>
        <div className={`metric ${stats.redCount ? 'bad' : 'good'}`}>
          <span className="metric-label">红色问题</span>
          <strong>{stats.redCount}</strong>
        </div>
        <div className={`metric ${stats.warnCount ? 'warn-m' : 'good'}`}>
          <span className="metric-label">黄色警告</span>
          <strong>{stats.warnCount}</strong>
        </div>
      </div>

      <h3>问题分类明细</h3>
      {!stats.issues.length && (
        <div className="pass-banner">✓ 全部校核项通过，可导出排布图与组串表</div>
      )}
      <div className="issue-groups">
        {[...grouped.entries()].map(([code, list]) => (
          <div className="card issue-group" key={code}>
            <div className="card-title">
              <span className={`badge ${list[0].level}`}>{list[0].level === 'red' ? '红' : '黄'}</span>
              <strong>
                {CODE_LABEL[code] ?? code} · {list.length} 处
              </strong>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>组件</th>
                  <th>所在屋面</th>
                  <th>坐标 (u, v) m</th>
                  <th>原因说明</th>
                </tr>
              </thead>
              <tbody>
                {list.slice(0, 50).map((issue, i) => {
                  const p = panelMap.get(issue.panelId)
                  return (
                    <tr key={i}>
                      <td>{issue.panelId.slice(-6)}</td>
                      <td>{p ? planeName(p.planeId) : '-'}</td>
                      <td>{p ? `${p.u.toFixed(2)}, ${p.v.toFixed(2)}` : '-'}</td>
                      <td>{issue.message}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {list.length > 50 && <p className="muted small">仅显示前 50 条，共 {list.length} 条</p>}
          </div>
        ))}
      </div>

      <h3>组串编号表（按屋面分排自动编号）</h3>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>组串号</th>
              <th>屋面分区</th>
              <th>组件数</th>
              <th>容量 (kWp)</th>
              <th>组件 ID 尾号</th>
            </tr>
          </thead>
          <tbody>
            {stats.strings.map((st) => (
              <tr key={st.id}>
                <td><strong>{st.id}</strong></td>
                <td>{planeName(st.planeId)}</td>
                <td>{st.panelIds.length}</td>
                <td>{(st.powerW / 1000).toFixed(2)}</td>
                <td className="muted small">{st.panelIds.map((id) => id.slice(-4)).join(' ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>容量与收益估算（业主版口径）</h3>
      <div className="check-summary">
        <div className="metric">
          <span className="metric-label">首年发电量</span>
          <strong>{stats.firstYearKwh.toFixed(0)} kWh</strong>
        </div>
        <div className="metric">
          <span className="metric-label">25 年累计发电</span>
          <strong>{(stats.total25YKwh / 10000).toFixed(1)} 万 kWh</strong>
        </div>
        <div className="metric">
          <span className="metric-label">25 年累计收益</span>
          <strong>{(stats.total25YIncome / 10000).toFixed(1)} 万元</strong>
        </div>
        <div className="metric">
          <span className="metric-label">总投资</span>
          <strong>{(stats.totalCost / 10000).toFixed(1)} 万元</strong>
        </div>
        <div className="metric">
          <span className="metric-label">静态回收期</span>
          <strong>{Number.isFinite(stats.paybackYears) ? `${stats.paybackYears.toFixed(1)} 年` : '-'}</strong>
        </div>
      </div>
    </div>
  )
}
