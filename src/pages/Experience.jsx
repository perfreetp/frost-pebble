import { useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { sampleProfile, computeGeometry, metrics, checkBlowability, computePrice, WALL_RULES } from '../geometry'
import { getDb, subscribe, submitOrder } from '../store'
import ProfileEditor from '../components/ProfileEditor'
import Preview3D from '../components/Preview3D'
import FlattenView from '../components/FlattenView'

export default function Experience() {
  const db = useSyncExternalStore(subscribe, getDb)
  const [templateId, setTemplateId] = useState(db.templates[0].id)
  const template = db.templates.find((t) => t.id === templateId)
  const [points, setPoints] = useState(() => template.points.map((p) => ({ ...p })))
  const [wall, setWall] = useState(3)
  const [showComb, setShowComb] = useState(true)
  const [colorIds, setColorIds] = useState(['clear'])
  const [patternId, setPatternId] = useState('none')
  const [storeId, setStoreId] = useState(db.stores[0].id)
  const [showNet, setShowNet] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const startRef = useRef(Date.now())

  const samples = useMemo(() => computeGeometry(sampleProfile(points)), [points])
  const m = useMemo(() => metrics(samples), [samples])
  const check = useMemo(() => checkBlowability(m, wall, template), [m, wall, template])

  const layers = colorIds.map((id) => db.colors.find((c) => c.id === id)).filter(Boolean)
  const pattern = db.patterns.find((p) => p.id === patternId)
  const price = computePrice(template, layers, pattern)

  const pickTemplate = (id) => {
    const t = db.templates.find((x) => x.id === id)
    setTemplateId(id)
    setPoints(t.points.map((p) => ({ ...p })))
    setReceipt(null)
    setShowNet(false)
    startRef.current = Date.now()
  }

  const toggleColor = (id) => {
    setColorIds((cur) => (cur.includes(id) ? cur.filter((c) => c !== id) : [...cur, id]))
  }

  const submit = () => {
    const durationSec = (Date.now() - startRef.current) / 1000
    const order = submitOrder({ storeId, template, points, wall, colorIds, patternId, durationSec })
    setReceipt({ order, price, layers, pattern, templateName: template.name, wall })
    setShowNet(false)
    startRef.current = Date.now()
  }

  return (
    <div className="experience">
      <div className="panel left">
        <div className="panel-title">① 选器型模板</div>
        <div className="template-row">
          {db.templates.map((t) => (
            <button key={t.id} className={t.id === templateId ? 'chip active' : 'chip'} onClick={() => pickTemplate(t.id)}>
              {t.name}<span className="chip-sub">¥{t.basePrice}</span>
            </button>
          ))}
        </div>

        <div className="panel-title">② 拖控制点画母线 <span className="hint">双击加点 · 右键删点</span></div>
        <ProfileEditor points={points} samples={samples} wall={wall} showComb={showComb} onChange={setPoints} />
        <label className="row-check">
          <input type="checkbox" checked={showComb} onChange={(e) => setShowComb(e.target.checked)} />
          显示曲率梳(红=拐点过急)
        </label>

        <div className="panel-title">③ 壁厚与可吹制性</div>
        <div className="wall-row">
          {[2, 3, 4].map((w) => (
            <button key={w} className={w === wall ? 'chip active' : 'chip'} onClick={() => setWall(w)}>
              {w}mm
            </button>
          ))}
          <span className={check.blowable ? 'verdict ok' : 'verdict bad'}>
            {check.blowable ? `✓ ${WALL_RULES[wall].label} 可吹制` : '✗ 该壁厚下不宜吹制'}
          </span>
        </div>
        <ul className="check-list">
          {check.checks.map((c) => (
            <li key={c.key} className={c.pass ? 'pass' : 'fail'}>
              {c.pass ? '✓' : '✗'} {c.label} — 当前 {c.fmt(c.value)}
            </li>
          ))}
        </ul>
      </div>

      <div className="panel mid">
        <div className="panel-title">曲面实时预览</div>
        <Preview3D samples={samples} layers={layers} patternId={patternId} />
        <div className="panel-title">④ 色料层(由下到上叠加)</div>
        <div className="color-row">
          {db.colors.map((c) => (
            <button
              key={c.id}
              className={colorIds.includes(c.id) ? 'swatch active' : 'swatch'}
              style={{ background: c.hex }}
              title={`${c.name} +¥${c.surcharge}`}
              onClick={() => toggleColor(c.id)}
            >
              <span>{c.name}</span>
            </button>
          ))}
        </div>
        <div className="panel-title">⑤ 表面纹样</div>
        <div className="template-row">
          {db.patterns.map((p) => (
            <button key={p.id} className={p.id === patternId ? 'chip active' : 'chip'} onClick={() => setPatternId(p.id)}>
              {p.name}{p.surcharge ? <span className="chip-sub">+¥{p.surcharge}</span> : null}
            </button>
          ))}
        </div>
      </div>

      <div className="panel right">
        <div className="panel-title">⑥ 展开与下单</div>
        <div className="price-box">
          <div>基础价({template.name})<b>¥{template.basePrice}</b></div>
          {layers.filter((l) => l.surcharge > 0).map((l) => (
            <div key={l.id}>加色 · {l.name}<b>+¥{l.surcharge}</b></div>
          ))}
          {pattern.surcharge > 0 && <div>纹样 · {pattern.name}<b>+¥{pattern.surcharge}</b></div>}
          <div className="total">合计 <b>¥{price}</b></div>
        </div>
        <label className="field">
          体验门店
          <select value={storeId} onChange={(e) => setStoreId(e.target.value)}>
            {db.stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <button className="btn" onClick={() => setShowNet((v) => !v)}>
          {showNet ? '收起下料图' : '一键展开平面贴花下料图'}
        </button>
        {showNet && (
          <FlattenView samples={samples} layers={layers} patternId={patternId} orderId={receipt?.order.id} />
        )}
        <button className="btn primary" disabled={!check.ok} onClick={submit}>
          {check.ok ? '提交体验单' : '存在超限/过薄项,不可提交'}
        </button>
        {receipt && (
          <div className="receipt">
            <div className="receipt-title">体验单已生成 ✓</div>
            <div>单号:{receipt.order.id}</div>
            <div>器型:{receipt.templateName} · 壁厚 {receipt.wall}mm</div>
            <div>色料:{receipt.layers.map((l) => l.name).join(' + ') || '无'}</div>
            <div>纹样:{receipt.pattern.name}</div>
            <div>体验时长:{Math.round(receipt.order.durationSec / 60)} 分钟</div>
            <div className="total">应付 ¥{receipt.price}</div>
            <div className="hint">已送店长审核,审核通过后安排烧制</div>
          </div>
        )}
      </div>
    </div>
  )
}
