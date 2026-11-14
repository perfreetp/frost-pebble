import { useRef, useState } from 'react'
import { useStore } from '../store'
import { parseDxf } from '../lib/dxf'
import { OBSTACLE_LABEL } from '../types'
import type { ObstacleType } from '../types'

export default function RoofListPage() {
  const { roofs, schemes, init, saveRoof, deleteRoof, openRoof, toast } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)

  const onFile = async (file: File) => {
    setImporting(true)
    try {
      const text = await file.text()
      const result = parseDxf(file.name.replace(/\.[^.]+$/, ''), text)
      await saveRoof(result.roof)
      const counts = new Map<ObstacleType, number>()
      result.roof.planes.forEach((p) =>
        p.obstacles.forEach((o) => counts.set(o.type, (counts.get(o.type) ?? 0) + 1)),
      )
      const summary = [...counts.entries()].map(([t, n]) => `${OBSTACLE_LABEL[t]}×${n}`).join('，')
      toast(
        `导入成功：识别出 ${result.roof.planes[0].obstacles.length} 处禁布区${summary ? '（' + summary + '）' : ''}`,
        'info',
      )
      if (result.unknownLayers.length) {
        toast(`未识别图层：${result.unknownLayers.join('、')}，可在库中手工归类`, 'warn')
      }
    } catch (err) {
      toast(`DXF 导入失败：${(err as Error).message}`, 'error')
    } finally {
      setImporting(false)
    }
  }

  const schemeCount = (roofId: string) => schemes.filter((s) => s.roofId === roofId).length

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>屋面列表</h2>
          <p className="muted">导入 CAD 屋面轮廓（DXF），系统按图层自动识别女儿墙、天窗、风机基础与排烟井并划为禁布区</p>
        </div>
        <div className="head-actions">
          <button className="btn primary" onClick={() => fileRef.current?.click()} disabled={importing}>
            {importing ? '解析中…' : '导入 DXF 屋面'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".dxf"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void onFile(f)
              e.target.value = ''
            }}
          />
        </div>
      </div>

      <div className="card-grid">
        {roofs.map((roof) => {
          const obstacleCount = roof.planes.reduce((s, p) => s + p.obstacles.length, 0)
          const area = roof.planes.reduce((s, p) => {
            let a = 0
            for (let i = 0; i < p.outline.length; i++) {
              const q = p.outline[(i + 1) % p.outline.length]
              a += p.outline[i].x * q.y - q.x * p.outline[i].y
            }
            return s + Math.abs(a) / 2
          }, 0)
          return (
            <div className="card roof-card" key={roof.id}>
              <div className="card-title">
                <span className="roof-icon">🏭</span>
                <div>
                  <strong>{roof.name}</strong>
                  <div className="muted small">
                    {roof.planes.length} 个屋面 · {area.toFixed(0)} m² · 禁布区 {obstacleCount} 处
                  </div>
                </div>
              </div>
              <div className="plane-tags">
                {roof.planes.map((p) => (
                  <span className="tag" key={p.id}>
                    {p.name}
                    {p.slopeDeg > 0 ? ` · ${p.slopeDeg}°坡` : ' · 平屋面'}
                    {p.parapetHeight > 0 ? ` · 女儿墙${p.parapetHeight}m` : ''}
                  </span>
                ))}
              </div>
              <div className="card-actions">
                <button className="btn primary" onClick={() => void openRoof(roof.id)}>
                  进入排布 →
                </button>
                <span className="muted small">已有 {schemeCount(roof.id)} 版方案</span>
                <button
                  className="btn danger ghost"
                  onClick={() => {
                    if (confirm(`删除屋面「${roof.name}」及其全部方案？`)) void deleteRoof(roof.id)
                  }}
                >
                  删除
                </button>
              </div>
            </div>
          )
        })}
        {!roofs.length && (
          <div className="empty">
            <p>暂无屋面。点击右上角导入 DXF，或</p>
            <button className="btn" onClick={() => void init()}>
              重新载入示例屋面
            </button>
          </div>
        )}
      </div>

      <div className="hint-box">
        <strong>DXF 图层命名约定（自动识别规则）</strong>
        <ul>
          <li>屋面轮廓：图层名含 <code>屋面 / 屋顶 / roof / outline</code></li>
          <li>女儿墙：含 <code>女儿墙 / parapet</code>　天窗：含 <code>天窗 / skylight / 采光</code></li>
          <li>风机基础：含 <code>风机 / fan / 风帽</code>　排烟井：含 <code>排烟 / 烟道 / 井 / shaft</code></li>
          <li>支持 LWPOLYLINE / POLYLINE / LINE 断线拼环 / CIRCLE；坐标单位自动识别毫米与米</li>
        </ul>
      </div>
    </div>
  )
}
