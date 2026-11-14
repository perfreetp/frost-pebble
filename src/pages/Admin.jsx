import { useMemo, useState } from 'react'
import { getDb, subscribe, reviewOrder, updateTemplates, updateColors, updatePatterns, PRICE_TIERS } from '../store'
import { useSyncExternalStore } from 'react'

function useDb() {
  return useSyncExternalStore(subscribe, getDb)
}

const fmtDate = (ts) => {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/* ---------------- 审核 ---------------- */
function ReviewTab({ db }) {
  const [reasons, setReasons] = useState({})
  const pending = db.orders.filter((o) => o.status === 'pending')
  const done = db.orders.filter((o) => o.status !== 'pending').slice(0, 20)
  const tName = (id) => db.templates.find((t) => t.id === id)?.name || id
  const sName = (id) => db.stores.find((s) => s.id === id)?.name || id

  const reject = (o) => {
    const reason = (reasons[o.id] || '').trim()
    if (!reason) { alert('驳回必须填写原因'); return }
    reviewOrder(o.id, 'rejected', reason)
  }

  const OrderCard = ({ o, actionable }) => {
    const t = db.templates.find((x) => x.id === o.templateId)
    const oversize = t && (o.height > t.maxHeight || o.maxDiameter > t.maxDiameter)
    const tooThin = t && o.wall < t.minWall
    const autoReason = [
      oversize ? `尺寸超限:高 ${o.height.toFixed(0)}mm / 直径 ${o.maxDiameter.toFixed(0)}mm 超出模板「${t.name}」上限 ${t.maxHeight}mm / ${t.maxDiameter}mm` : '',
      tooThin ? `壁厚过薄:${o.wall}mm 低于模板下限 ${t.minWall}mm,退火易炸裂` : '',
    ].filter(Boolean).join(';')
    return (
      <div className={`order-card ${o.status}`}>
        <div className="order-head">
          <b>{o.id}</b>
          <span className={`badge ${o.status}`}>{o.status === 'pending' ? '待审核' : o.status === 'approved' ? '已通过' : '已驳回'}</span>
        </div>
        <div className="order-meta">
          {fmtDate(o.createdAt)} · {sName(o.storeId)} · {tName(o.templateId)} · 壁厚 {o.wall}mm · ¥{o.price}
        </div>
        <div className="order-meta">
          高 {o.height.toFixed(0)}mm · 直径 {o.maxDiameter.toFixed(0)}mm · 时长 {Math.round(o.durationSec / 60)} 分钟
        </div>
        {o.violations?.length > 0 && (
          <div className="violations">⚠ 提交时校验未过:{o.violations.join(';')}</div>
        )}
        {o.status === 'rejected' && <div className="violations">驳回原因:{o.rejectReason}</div>}
        {actionable && (
          <div className="review-actions">
            {(oversize || tooThin) && <div className="violations">⚠ {autoReason}</div>}
            <input
              placeholder="驳回原因(必填)"
              value={reasons[o.id] ?? (oversize || tooThin ? autoReason : '')}
              onChange={(e) => setReasons((r) => ({ ...r, [o.id]: e.target.value }))}
            />
            <div>
              <button className="btn small primary" onClick={() => reviewOrder(o.id, 'approved')}>通过(可烧制)</button>
              <button className="btn small danger" onClick={() => reject(o)}>驳回</button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <h3>待审核({pending.length})</h3>
      {pending.length === 0 && <p className="hint">没有待审核作品</p>}
      {pending.map((o) => <OrderCard key={o.id} o={o} actionable />)}
      <h3>近期已处理</h3>
      {done.map((o) => <OrderCard key={o.id} o={o} />)}
    </div>
  )
}

/* ---------------- 模板与定价配置 ---------------- */
function ConfigTab({ db }) {
  const setT = (id, key, val) => {
    updateTemplates(db.templates.map((t) => (t.id === id ? { ...t, [key]: Number(val) || 0 } : t)))
  }
  return (
    <div>
      <h3>器型模板定价</h3>
      <table className="tbl">
        <thead><tr><th>器型</th><th>基础价(元)</th><th>壁厚下限(mm)</th><th>高度上限(mm)</th><th>直径上限(mm)</th></tr></thead>
        <tbody>
          {db.templates.map((t) => (
            <tr key={t.id}>
              <td>{t.name}</td>
              {[['basePrice', t.basePrice], ['minWall', t.minWall], ['maxHeight', t.maxHeight], ['maxDiameter', t.maxDiameter]].map(([k, v]) => (
                <td key={k}><input type="number" value={v} onChange={(e) => setT(t.id, k, e.target.value)} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <h3>色料加价</h3>
      <table className="tbl">
        <thead><tr><th>色料</th><th>色样</th><th>加价(元)</th></tr></thead>
        <tbody>
          {db.colors.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td><span className="swatch-mini" style={{ background: c.hex }} /></td>
              <td>
                <input type="number" value={c.surcharge}
                  onChange={(e) => updateColors(db.colors.map((x) => (x.id === c.id ? { ...x, surcharge: Number(e.target.value) || 0 } : x)))} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>纹样加价</h3>
      <table className="tbl">
        <thead><tr><th>纹样</th><th>加价(元)</th></tr></thead>
        <tbody>
          {db.patterns.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>
                <input type="number" value={p.surcharge}
                  onChange={(e) => updatePatterns(db.patterns.map((x) => (x.id === p.id ? { ...x, surcharge: Number(e.target.value) || 0 } : x)))} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ---------------- 统计 ---------------- */
function StatsTab({ db }) {
  const today = fmtDate(Date.now())
  const [from, setFrom] = useState('2026-01-01')
  const [to, setTo] = useState(today)
  const [storeId, setStoreId] = useState('all')

  const filtered = useMemo(() => {
    const f = new Date(from).getTime()
    const t = new Date(to).getTime() + 86400000
    return db.orders.filter((o) => o.createdAt >= f && o.createdAt < t && (storeId === 'all' || o.storeId === storeId))
  }, [db.orders, from, to, storeId])

  const rows = db.templates.map((t) => {
    const list = filtered.filter((o) => o.templateId === t.id)
    const approved = list.filter((o) => o.status === 'approved')
    const avgSec = list.length ? list.reduce((s, o) => s + o.durationSec, 0) / list.length : 0
    const tiers = PRICE_TIERS.map((tier) => ({
      ...tier,
      count: approved.filter((o) => tier.test(o.price)).length,
    }))
    return { t, count: list.length, avgSec, tiers, approved: approved.length }
  })

  return (
    <div>
      <div className="filter-bar">
        <label>从 <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
        <label>到 <input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
        <label>门店
          <select value={storeId} onChange={(e) => setStoreId(e.target.value)}>
            <option value="all">全部门店</option>
            {db.stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <span className="hint">共 {filtered.length} 单</span>
      </div>
      <table className="tbl">
        <thead>
          <tr><th>器型</th><th>被选次数</th><th>平均体验时长</th><th>成交单数</th>{PRICE_TIERS.map((t) => <th key={t.key}>{t.label}占比</th>)}</tr>
        </thead>
        <tbody>
          {rows.map(({ t, count, avgSec, tiers, approved }) => (
            <tr key={t.id}>
              <td>{t.name}</td>
              <td>{count}</td>
              <td>{count ? `${Math.round(avgSec / 60)} 分钟` : '—'}</td>
              <td>{approved}</td>
              {tiers.map((tier) => {
                const pct = approved ? Math.round((tier.count / approved) * 100) : 0
                return (
                  <td key={tier.key}>
                    <div className="bar-cell">
                      <div className="bar" style={{ width: `${pct}%` }} />
                      <span>{pct}%</span>
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Admin() {
  const db = useDb()
  const [tab, setTab] = useState('review')
  return (
    <div className="admin">
      <div className="admin-tabs">
        {[['review', '烧制审核'], ['config', '模板与定价'], ['stats', '经营统计']].map(([k, label]) => (
          <button key={k} className={tab === k ? 'tab active' : 'tab'} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>
      {tab === 'review' && <ReviewTab db={db} />}
      {tab === 'config' && <ConfigTab db={db} />}
      {tab === 'stats' && <StatsTab db={db} />}
    </div>
  )
}
