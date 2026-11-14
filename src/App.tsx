import { useEffect } from 'react'
import { useStore, type ViewKey } from './store'
import RoofListPage from './pages/RoofListPage'
import EditorPage from './pages/EditorPage'
import CheckPage from './pages/CheckPage'
import ComparePage from './pages/ComparePage'
import { exportLayoutSvg, exportStringCsv, exportIncomeReport } from './lib/exporters'

const NAV: { key: ViewKey; label: string; icon: string }[] = [
  { key: 'roofs', label: '屋面列表', icon: '🏠' },
  { key: 'editor', label: '排布编辑', icon: '▦' },
  { key: 'check', label: '校核结果', icon: '✓' },
  { key: 'compare', label: '方案对比', icon: '⇄' },
]

export default function App() {
  const store = useStore()

  useEffect(() => {
    void store.init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const roof = store.currentRoof()
  const scheme = store.currentScheme()

  const doExport = (kind: 'svg' | 'csv' | 'report') => {
    if (!roof || !scheme) return store.toast('请先打开方案', 'warn')
    const stats = store.recompute()
    if (!stats) return
    if (kind === 'svg') exportLayoutSvg(roof, scheme, store.modules, stats)
    if (kind === 'csv') exportStringCsv(roof, scheme, stats)
    if (kind === 'report') exportIncomeReport(roof, scheme, stats)
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">☀ 光伏屋面排布设计台</div>
        <nav className="nav">
          {NAV.map((n) => (
            <button
              key={n.key}
              className={`nav-item ${store.view === n.key ? 'active' : ''}`}
              onClick={() => store.setView(n.key)}
            >
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="top-actions">
          {roof && scheme && (
            <>
              <span className="muted small ellipsis">
                {roof.name} / {scheme.name}
              </span>
              <button className="btn small" onClick={() => doExport('svg')}>
                排布图
              </button>
              <button className="btn small" onClick={() => doExport('csv')}>
                组串表
              </button>
              <button className="btn small primary" onClick={() => doExport('report')}>
                收益估算
              </button>
            </>
          )}
        </div>
      </header>

      <main className="content">
        {store.view === 'roofs' && <RoofListPage />}
        {store.view === 'editor' && <EditorPage />}
        {store.view === 'check' && <CheckPage />}
        {store.view === 'compare' && <ComparePage />}
      </main>

      <div className="toast-stack">
        {store.toasts.map((t) => (
          <div key={t.id} className={`toast ${t.level}`} onClick={() => store.dismissToast(t.id)}>
            {t.text}
          </div>
        ))}
      </div>
    </div>
  )
}
