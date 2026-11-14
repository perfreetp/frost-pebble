import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../store'
import RoofViewer from '../components/RoofViewer'
import { autoLayoutPlane, duplicatePanels } from '../lib/autoLayout'
import { checkPanel, computeStats } from '../lib/check'
import { snapToReference } from '../lib/geometry'
import type { PlacedPanel, SchemeStats } from '../types'

export default function EditorPage() {
  const store = useStore()
  const roof = store.currentRoof()
  const scheme = store.currentScheme()
  const [hoverReason, setHoverReason] = useState<string | null>(null)
  const [activePlaneId, setActivePlaneId] = useState<string | null>(null)

  useEffect(() => {
    if (roof && !activePlaneId) setActivePlaneId(roof.planes[0]?.id ?? null)
  }, [roof, activePlaneId])

  // 纯派生统计，不在渲染期写库
  const stats: SchemeStats | null = useMemo(() => {
    if (!roof || !scheme) return null
    return computeStats(scheme, roof.planes, store.modules)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheme, roof, store.modules])

  if (!roof || !scheme) {
    return (
      <div className="empty">
        <p>请先从屋面列表选择一个屋面</p>
        <button className="btn primary" onClick={() => store.setView('roofs')}>
          去屋面列表
        </button>
      </div>
    )
  }

  const activeModule = store.modules.find((m) => m.id === store.activeModuleId) ?? store.modules[0]
  const plane = roof.planes.find((p) => p.id === activePlaneId) ?? roof.planes[0]
  const issueMap = new Map<string, 'red' | 'warn'>(
    (stats?.issues ?? []).map((i) => [i.panelId, i.level]),
  )

  const handlePlace = (panel: PlacedPanel): boolean => {
    const mod = store.modules.find((m) => m.id === panel.moduleId)!
    const targetPlane = roof.planes.find((p) => p.id === panel.planeId)!
    const reason = checkPanel(panel, targetPlane, mod, scheme.settings, scheme.panels).find(
      (i) => i.level === 'red',
    )
    if (reason) {
      store.toast(`无法放置：${reason.message}`, 'error')
      return false
    }
    store.updateSchemePanels((ps) => [...ps, panel])
    return true
  }

  const handleMove = (ids: string[], delta: { du: number; dv: number }) => {
    if (!ids.length || (!delta.du && !delta.dv)) return
    const idSet = new Set(ids)
    store.updateSchemePanels((ps) =>
      ps.map((p) => (idSet.has(p.id) ? { ...p, u: p.u + delta.du, v: p.v + delta.dv } : p)),
    )
  }

  const snapSelected = () => {
    const sel = new Set(store.selectedPanelIds)
    if (!sel.size) return store.toast('请先框选组件', 'warn')
    store.updateSchemePanels((ps) => {
      const same = ps.filter((p) => p.planeId === plane.id)
      const refU = same.length ? Math.min(...same.map((p) => p.u)) : 0
      const refV = same.length ? Math.min(...same.map((p) => p.v)) : 0
      return ps.map((p) =>
        sel.has(p.id)
          ? {
              ...p,
              u: snapToReference(p.u, activeModule.length + scheme.settings.gapX, refU),
              v: snapToReference(p.v, activeModule.width + scheme.settings.gapY, refV),
            }
          : p,
      )
    })
    store.toast('已按横纵间距吸附对齐')
  }

  const deleteSelected = () => {
    const sel = new Set(store.selectedPanelIds)
    if (!sel.size) return
    store.updateSchemePanels((ps) => ps.filter((p) => !sel.has(p.id)))
    store.setSelectedPanels([])
  }

  const copyRow = (direction: 1 | -1) => {
    const sel = new Set(store.selectedPanelIds)
    if (!sel.size) return store.toast('请先框选要复制的整排组件', 'warn')
    const source = scheme.panels.filter((p) => sel.has(p.id))
    const stepV = activeModule.width + scheme.settings.gapY
    const { created, rejected } = duplicatePanels(
      source,
      { du: 0, dv: direction * stepV },
      scheme.panels,
      plane,
      scheme.settings,
      store.modules,
    )
    if (!created.length) {
      store.toast('屋面空间不足，无法复制该排（不会硬塞）', 'warn')
      return
    }
    store.updateSchemePanels((ps) => [...ps, ...created])
    store.setSelectedPanels(created.map((p) => p.id))
    if (rejected > 0) store.toast(`已复制 ${created.length} 块，${rejected} 块因空间不足被跳过`, 'warn')
    else store.toast(`已向${direction > 0 ? '前' : '后'}复制整排 ${created.length} 块`)
  }

  const rotateSelected = () => {
    const sel = new Set(store.selectedPanelIds)
    if (!sel.size) return
    store.updateSchemePanels((ps) =>
      ps.map((p) => (sel.has(p.id) ? { ...p, rotationDeg: (p.rotationDeg + 90) % 180 } : p)),
    )
  }

  const runAutoLayout = () => {
    const result = autoLayoutPlane(plane, activeModule, scheme.settings, 0)
    if (!result.placed) {
      store.toast('该屋面在当前间距与退距下无法布下任何组件，请调小间距或更换组件', 'warn')
      return
    }
    store.updateSchemePanels((ps) => [...ps, ...result.panels])
    const skipText = result.skipped.map((s) => `${s.reason} ${s.count} 格位`).join('；')
    store.toast(
      `自动排布完成：本屋面新增 ${result.placed} 块${skipText ? `，跳过 ${skipText}` : ''}`,
      result.skipped.length ? 'warn' : 'info',
    )
  }

  const clearPlane = () => {
    if (!confirm(`清空「${plane.name}」上的全部组件？`)) return
    store.updateSchemePanels((ps) => ps.filter((p) => p.planeId !== plane.id))
    store.setSelectedPanels([])
  }

  const s = scheme.settings
  const setS = (patch: Partial<typeof s>) => store.updateSettings(patch)

  return (
    <div className="editor">
      <aside className="side-left">
        <section className="panel">
          <h3>方案版本</h3>
          <select
            value={scheme.id}
            onChange={(e) => store.selectScheme(e.target.value)}
          >
            {store.schemes
              .filter((x) => x.roofId === roof.id)
              .map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}（{x.panels.length} 块）
                </option>
              ))}
          </select>
          <div className="btn-row">
            <button
              className="btn small"
              onClick={async () => {
                const n = await store.createScheme(roof.id)
                store.toast(`已创建 ${n.name}`)
              }}
            >
              新建版本
            </button>
            <button
              className="btn small"
              onClick={() => {
                const name = prompt('另存为新版本名称：', `${scheme.name}-副本`)
                if (name) void store.forkScheme(scheme.id, name)
              }}
            >
              另存副本
            </button>
          </div>
        </section>

        <section className="panel">
          <h3>组件库（拖到屋面或双击屋面布板）</h3>
          <div className="module-list">
            {store.modules.map((m) => (
              <div
                key={m.id}
                className={`module-item ${m.id === activeModule.id ? 'active' : ''}`}
                draggable
                onDragStart={(e) => {
                  store.setActiveModule(m.id)
                  e.dataTransfer.setData('text/plain', m.id)
                }}
                onClick={() => store.setActiveModule(m.id)}
              >
                <strong>
                  {m.manufacturer} {m.model}
                </strong>
                <div className="muted small">
                  {m.length}×{m.width}m · {m.powerW}Wp · 效率 {(m.efficiency * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h3>屋面分区</h3>
          <div className="plane-switch">
            {roof.planes.map((p) => (
              <button
                key={p.id}
                className={`chip ${p.id === plane.id ? 'on' : ''}`}
                onClick={() => setActivePlaneId(p.id)}
              >
                {p.name}
                <span className="muted">
                  {' '}
                  · {scheme.panels.filter((x) => x.planeId === p.id).length} 块
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <h3>排布操作（{plane.name}）</h3>
          <div className="btn-grid">
            <button className="btn primary" onClick={runAutoLayout}>
              一键自动排布
            </button>
            <button className="btn" onClick={snapSelected}>
              吸附对齐
            </button>
            <button className="btn" onClick={() => copyRow(1)}>
              框选复制整排 ↓
            </button>
            <button className="btn" onClick={() => copyRow(-1)}>
              框选复制整排 ↑
            </button>
            <button className="btn" onClick={rotateSelected}>
              旋转 90°
            </button>
            <button className="btn danger ghost" onClick={deleteSelected}>
              删除选中
            </button>
            <button className="btn danger ghost" onClick={clearPlane}>
              清空本屋面
            </button>
          </div>
          <p className="muted small">
            左键空白拖出框选；按住 Ctrl 点选加选；左键拖组件移动；双击屋面布板；右键旋转视角
          </p>
        </section>
      </aside>

      <main className="stage">
        <div className="stage-toolbar">
          <div className="stat-pills">
            <span className="pill">组件 {stats?.panelCount ?? 0} 块</span>
            <span className="pill">装机 {((stats?.capacityKw ?? 0)).toFixed(2)} kWp</span>
            <span className="pill">利用率 {((stats?.utilization ?? 0) * 100).toFixed(1)}%</span>
            <span className="pill red">{stats?.redCount ?? 0} 红</span>
            <span className="pill warn">{stats?.warnCount ?? 0} 黄</span>
          </div>
          {hoverReason && <span className="hover-reason">{hoverReason}</span>}
        </div>
        <RoofViewer
          roof={roof}
          panels={scheme.panels}
          modules={store.modules}
          settings={scheme.settings}
          selectedIds={store.selectedPanelIds}
          issuePanelIds={issueMap}
          activeModule={activeModule}
          onSelect={store.setSelectedPanels}
          onPlace={handlePlace}
          onMovePanels={handleMove}
          onHoverReason={setHoverReason}
        />
        <div className="legend">
          <span><i className="sw normal" />正常</span>
          <span><i className="sw red" />红色：超限/碰撞（必须处理）</span>
          <span><i className="sw warn" />黄色：阴影间距不足（警告）</span>
          <span><i className="sw sel" />金色：已选中</span>
        </div>
      </main>

      <aside className="side-right">
        <section className="panel">
          <h3>设计参数</h3>
          <label className="field">
            横向净距（m）
            <input
              type="number"
              step="0.01"
              value={s.gapX}
              onChange={(e) => setS({ gapX: +e.target.value })}
            />
          </label>
          <label className="field">
            纵向净距（m）
            <input
              type="number"
              step="0.05"
              value={s.gapY}
              onChange={(e) => setS({ gapY: +e.target.value })}
            />
          </label>
          <label className="field">
            安全退距（m）
            <input
              type="number"
              step="0.1"
              value={s.safetyMargin}
              onChange={(e) => setS({ safetyMargin: +e.target.value })}
            />
          </label>
          <label className="field">
            朝向偏差限值（°）
            <input
              type="number"
              step="1"
              value={s.orientationLimitDeg}
              onChange={(e) => setS({ orientationLimitDeg: +e.target.value })}
            />
          </label>
          <label className="field">
            平屋面支架倾角（°）
            <input
              type="number"
              step="1"
              value={s.tiltDegOnFlat}
              onChange={(e) => setS({ tiltDegOnFlat: +e.target.value })}
            />
          </label>
          <label className="field">
            项目纬度（°）
            <input
              type="number"
              step="0.1"
              value={s.latitudeDeg}
              onChange={(e) => setS({ latitudeDeg: +e.target.value })}
            />
          </label>
          <label className="field">
            阴影校核时刻（冬至真太阳时）
            <input
              type="number"
              step="1"
              min="6"
              max="18"
              value={s.shadowHour}
              onChange={(e) => setS({ shadowHour: +e.target.value })}
            />
          </label>
          <label className="field">
            每串组件数（0=自动按排）
            <input
              type="number"
              step="1"
              value={s.panelsPerString}
              onChange={(e) => setS({ panelsPerString: +e.target.value })}
            />
          </label>
        </section>

        <section className="panel">
          <h3>收益参数</h3>
          <label className="field">
            等效利用小时（h）
            <input
              type="number"
              value={s.fullLoadHours}
              onChange={(e) => setS({ fullLoadHours: +e.target.value })}
            />
          </label>
          <label className="field">
            电价（元/kWh）
            <input
              type="number"
              step="0.01"
              value={s.tariff}
              onChange={(e) => setS({ tariff: +e.target.value })}
            />
          </label>
          <label className="field">
            单位造价（元/Wp）
            <input
              type="number"
              step="0.1"
              value={s.costPerWp}
              onChange={(e) => setS({ costPerWp: +e.target.value })}
            />
          </label>
          <label className="field">
            年衰减率
            <input
              type="number"
              step="0.001"
              value={s.annualDegrade}
              onChange={(e) => setS({ annualDegrade: +e.target.value })}
            />
          </label>
        </section>

        <section className="panel issue-panel">
          <h3>本屋面问题（{stats?.issues.length ?? 0}）</h3>
          <div className="issue-list">
            {(stats?.issues ?? [])
              .filter((i) => scheme.panels.find((p) => p.id === i.panelId)?.planeId === plane.id)
              .slice(0, 30)
              .map((i, idx) => (
                <div key={idx} className={`issue-item ${i.level}`}>
                  <span className="dot" />
                  {i.message}
                </div>
              ))}
            {!stats?.issues.length && <p className="muted small">全部通过，无校核问题</p>}
          </div>
        </section>
      </aside>
    </div>
  )
}
