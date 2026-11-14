import { useState } from 'react'
import Experience from './pages/Experience'
import Admin from './pages/Admin'

export default function App() {
  const [view, setView] = useState('exp')
  return (
    <div className="app">
      <header className="topbar">
        <h1>灯工玻璃体验馆 · 器型曲面设计工坊</h1>
        <nav>
          <button className={view === 'exp' ? 'tab active' : 'tab'} onClick={() => setView('exp')}>体验端</button>
          <button className={view === 'admin' ? 'tab active' : 'tab'} onClick={() => setView('admin')}>运营后台</button>
        </nav>
      </header>
      {view === 'exp' ? <Experience /> : <Admin />}
    </div>
  )
}
