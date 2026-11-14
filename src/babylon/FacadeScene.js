import {
  Engine, Scene, FreeCamera, Vector3, Color3, Color4, Camera,
  MeshBuilder, StandardMaterial, Matrix, Quaternion
} from '@babylonjs/core'
import { AdvancedDynamicTexture, TextBlock } from '@babylonjs/gui'

// 四个可开关图层(layerMask 位)
export const LAYERS = {
  structure: 0x00010000, // 结构线
  grid: 0x00020000,      // 分格线
  embed: 0x00040000,     // 埋件点位
  zone: 0x00080000       // 吊装分区
}

// 板块着色类别(每类一个 thin-instance 网格,避免逐块建 mesh)
const CLASS_COLORS = {
  normal: '#d7e6f5',
  selected: '#ffd54d',
  violation: '#ff6b5e',
  approved: '#9fd8a8',
  rejected: '#f2a7a7',
  rework: '#ffb14d'
}

const MAX_LABELS = 400 // 同屏标注上限,保证跟手

export class FacadeScene {
  /**
   * @param canvas 渲染画布
   * @param facade 立面数据(panels/embeds/structureLines/zones)
   * @param opts   { getStyle(panel)->className, onSelect(ids) }
   */
  constructor(canvas, facade, opts = {}) {
    this.canvas = canvas
    this.facade = facade
    this.opts = opts
    this.selected = new Set()
    this.boxMode = false
    this.layers = { structure: true, grid: true, embed: true, zone: true }

    this.engine = new Engine(canvas, true, { stencil: false }, true)
    this.scene = new Scene(this.engine)
    this.scene.clearColor = new Color4(0.957, 0.965, 0.973, 1)

    const W = facade.width, H = facade.height
    this.camera = new FreeCamera('cam', new Vector3(W / 2, H / 2, -100), this.scene)
    this.camera.mode = Camera.ORTHOGRAPHIC_CAMERA
    this.camera.minZ = 0.1
    this.camera.maxZ = 500
    // 默认朝 +Z 看,平移只改 position
    this.viewH = H * 1.4            // 当前可视世界高度(米)
    this.labelTh = H * 0.8          // 低于该可视高度才出编号/规格标注
    this.fillTh = H * 2.5           // 高于该可视高度只画分格线
    this._updateOrtho()
    this._applyLayers()

    this._buildClassMeshes()
    this.adt = AdvancedDynamicTexture.CreateFullscreenUI('ui', true, this.scene)

    // 框选橡皮筋(DOM 覆盖层)
    this._rubber = document.createElement('div')
    this._rubber.style.cssText =
      'position:absolute;border:1.5px dashed #2f6fd0;background:rgba(47,111,208,.12);display:none;pointer-events:none;z-index:5;'
    canvas.parentElement.appendChild(this._rubber)

    this.rebuild()
    this._initPointer()

    this._ro = new ResizeObserver(() => {
      this.engine.resize()
      this._updateOrtho()
      this._scheduleLabels()
    })
    this._ro.observe(canvas.parentElement)
    this.engine.runRenderLoop(() => this.scene.render())
  }

  // ---------- 相机 / 坐标 ----------
  _updateOrtho() {
    const w = this.engine.getRenderWidth() || 1
    const h = this.engine.getRenderHeight() || 1
    const a = w / h
    this.camera.orthoLeft = -this.viewH * a / 2
    this.camera.orthoRight = this.viewH * a / 2
    this.camera.orthoTop = this.viewH / 2
    this.camera.orthoBottom = -this.viewH / 2
  }

  screenToWorld(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect()
    const viewW = this.viewH * rect.width / rect.height
    return {
      x: this.camera.position.x - viewW / 2 + (clientX - rect.left) / rect.width * viewW,
      y: this.camera.position.y + this.viewH / 2 - (clientY - rect.top) / rect.height * this.viewH
    }
  }

  worldToScreen(wx, wy) {
    const rect = this.canvas.getBoundingClientRect()
    const viewW = this.viewH * rect.width / rect.height
    return {
      x: (wx - (this.camera.position.x - viewW / 2)) / viewW * rect.width,
      y: (1 - (wy - (this.camera.position.y - this.viewH / 2)) / this.viewH) * rect.height
    }
  }

  _afterCameraChange() {
    this._updateFillVisibility()
    this._scheduleLabels()
  }

  // ---------- 图层 ----------
  setLayers(layers) {
    Object.assign(this.layers, layers)
    this._applyLayers()
    this._scheduleLabels()
  }

  _applyLayers() {
    let mask = 0x0000ffff // 板块填充常驻
    for (const k of Object.keys(LAYERS)) if (this.layers[k]) mask |= LAYERS[k]
    this.camera.layerMask = mask
  }

  // ---------- 板块填充(thin instances,按着色类别分桶) ----------
  _buildClassMeshes() {
    this.classMeshes = {}
    for (const [name, hex] of Object.entries(CLASS_COLORS)) {
      const m = MeshBuilder.CreatePlane('cls-' + name, { size: 1 }, this.scene)
      const mat = new StandardMaterial('mat-' + name, this.scene)
      mat.emissiveColor = Color3.FromHexString(hex)
      mat.disableLighting = true
      mat.specularColor = Color3.Black()
      mat.backFaceCulling = false
      m.material = mat
      m.isPickable = false
      this.classMeshes[name] = m
    }
  }

  _styleOf(p) {
    const base = this.opts.getStyle ? this.opts.getStyle(p) : 'normal'
    // 选中高亮,但超限红优先保留
    return this.selected.has(p.id) && base !== 'violation' ? 'selected' : base
  }

  refreshPanels() {
    const buckets = {}
    for (const k of Object.keys(CLASS_COLORS)) buckets[k] = []
    for (const p of this.facade.panels) buckets[this._styleOf(p)].push(p)
    for (const [name, mesh] of Object.entries(this.classMeshes)) {
      const arr = buckets[name]
      const data = new Float32Array(arr.length * 16)
      arr.forEach((p, i) => {
        Matrix.Compose(
          new Vector3(p.w, p.h, 1),
          Quaternion.Identity(),
          new Vector3(p.x + p.w / 2, p.y + p.h / 2, 0)
        ).copyToArray(data, i * 16)
      })
      mesh.thinInstanceSetBuffer('matrix', data, 16)
    }
    this._updateFillVisibility()
  }

  _updateFillVisibility() {
    const vis = this.viewH <= this.fillTh // 缩得太小只画分格线
    for (const mesh of Object.values(this.classMeshes)) mesh.isVisible = vis
  }

  // ---------- 数据重建 ----------
  rebuild() {
    this.refreshPanels()
    this._buildGridLines()
    this._buildStructure()
    this._buildEmbeds()
    this._buildZones()
    this._scheduleLabels()
  }

  _buildGridLines() {
    if (this.gridMesh) this.gridMesh.dispose()
    const f = this.facade
    const lines = []
    for (const p of f.panels) {
      lines.push([
        new Vector3(p.x, p.y, -0.1), new Vector3(p.x + p.w, p.y, -0.1),
        new Vector3(p.x + p.w, p.y + p.h, -0.1), new Vector3(p.x, p.y + p.h, -0.1),
        new Vector3(p.x, p.y, -0.1)
      ])
    }
    lines.push([
      new Vector3(0, 0, -0.1), new Vector3(f.width, 0, -0.1),
      new Vector3(f.width, f.height, -0.1), new Vector3(0, f.height, -0.1),
      new Vector3(0, 0, -0.1)
    ])
    this.gridMesh = MeshBuilder.CreateLineSystem('grid', { lines }, this.scene)
    this.gridMesh.color = Color3.FromHexString('#7f8fa1')
    this.gridMesh.layerMask = LAYERS.grid
    this.gridMesh.isPickable = false
  }

  _buildStructure() {
    if (this.structureMesh) this.structureMesh.dispose()
    const lines = this.facade.structureLines.map(l =>
      [new Vector3(l.x1, l.y1, -0.2), new Vector3(l.x2, l.y2, -0.2)])
    if (!lines.length) { this.structureMesh = null; return }
    this.structureMesh = MeshBuilder.CreateLineSystem('structure', { lines }, this.scene)
    this.structureMesh.color = Color3.FromHexString('#33506e')
    this.structureMesh.layerMask = LAYERS.structure
    this.structureMesh.isPickable = false
  }

  _buildEmbeds() {
    if (this.embedMesh) this.embedMesh.dispose()
    const embeds = this.facade.embeds
    if (!embeds.length) { this.embedMesh = null; return }
    const disc = MeshBuilder.CreateDisc('embeds', { radius: 0.12, tessellation: 16 }, this.scene)
    const mat = new StandardMaterial('embedMat', this.scene)
    mat.emissiveColor = Color3.FromHexString('#d9481f')
    mat.disableLighting = true
    mat.backFaceCulling = false
    disc.material = mat
    disc.isPickable = false
    disc.layerMask = LAYERS.embed
    const data = new Float32Array(embeds.length * 16)
    embeds.forEach((e, i) => {
      Matrix.Compose(
        new Vector3(1, 1, 1), Quaternion.Identity(), new Vector3(e.x, e.y, -0.15)
      ).copyToArray(data, i * 16)
    })
    disc.thinInstanceSetBuffer('matrix', data, 16)
    this.embedMesh = disc
  }

  _buildZones() {
    if (this.zoneMeshes) this.zoneMeshes.forEach(m => m.dispose())
    this.zoneMeshes = []
    for (const z of this.facade.zones) {
      const m = MeshBuilder.CreatePlane('zone-' + z.id, { width: z.w, height: z.h }, this.scene)
      const mat = new StandardMaterial('zoneMat-' + z.id, this.scene)
      mat.emissiveColor = Color3.FromHexString(z.color || '#4d9de0')
      mat.disableLighting = true
      mat.backFaceCulling = false
      mat.alpha = 0.14
      m.material = mat
      m.position.set(z.x + z.w / 2, z.y + z.h / 2, 1.5)
      m.isPickable = false
      m.layerMask = LAYERS.zone
      this.zoneMeshes.push(m)
    }
  }

  // ---------- 标注(缩放到一定比例才显示) ----------
  _scheduleLabels() {
    clearTimeout(this._labelTimer)
    this._labelTimer = setTimeout(() => this._refreshLabels(), 120)
  }

  _refreshLabels() {
    this.adt.clear()
    const rect = this.canvas.getBoundingClientRect()
    // 吊装分区名称
    if (this.layers.zone) {
      for (const z of this.facade.zones) {
        const s = this.worldToScreen(z.x + 0.4, z.y + z.h - 0.5)
        if (s.x < 0 || s.x > rect.width || s.y < 0 || s.y > rect.height) continue
        const t = new TextBlock()
        t.text = z.name
        t.fontSize = 13
        t.fontWeight = 'bold'
        t.color = z.color || '#4d9de0'
        t.left = s.x - rect.width / 2
        t.top = s.y - rect.height / 2
        this.adt.addControl(t)
      }
    }
    if (this.viewH > this.labelTh) return // 比例不够不出板块标注
    const viewW = this.viewH * rect.width / rect.height
    let n = 0
    for (const p of this.facade.panels) {
      if (n >= MAX_LABELS) break
      const pw = p.w / viewW * rect.width
      if (pw < 44) continue // 屏幕上太小不标
      const s = this.worldToScreen(p.x + p.w / 2, p.y + p.h / 2)
      if (s.x < -60 || s.x > rect.width + 60 || s.y < -30 || s.y > rect.height + 30) continue
      const t = new TextBlock()
      t.text = `${p.code}\n${Math.round(p.w * 1000)}×${Math.round(p.h * 1000)}`
      t.fontSize = 11
      t.fontFamily = 'Consolas, monospace'
      t.color = (this.opts.getStyle && this.opts.getStyle(p) === 'violation') ? '#c0392b' : '#2c3e50'
      t.left = s.x - rect.width / 2
      t.top = s.y - rect.height / 2
      this.adt.addControl(t)
      n++
    }
  }

  // ---------- 交互:平移 / 缩放 / 点选 / 框选 ----------
  _initPointer() {
    const c = this.canvas
    c.style.touchAction = 'none'
    let panning = false, boxing = false, moved = false
    let sx = 0, sy = 0, lastX = 0, lastY = 0

    c.addEventListener('pointerdown', e => {
      if (e.button !== 0) return
      c.setPointerCapture(e.pointerId)
      sx = lastX = e.clientX
      sy = lastY = e.clientY
      moved = false
      if (this.boxMode) boxing = true
      else panning = true
    })

    c.addEventListener('pointermove', e => {
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY
      if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 4) moved = true
      if (panning) {
        const rect = c.getBoundingClientRect()
        const viewW = this.viewH * rect.width / rect.height
        this.camera.position.x -= dx / rect.width * viewW
        this.camera.position.y += dy / rect.height * this.viewH
        this._afterCameraChange()
      } else if (boxing) {
        const rect = c.getBoundingClientRect()
        Object.assign(this._rubber.style, {
          display: 'block',
          left: Math.min(sx, e.clientX) - rect.left + 'px',
          top: Math.min(sy, e.clientY) - rect.top + 'px',
          width: Math.abs(e.clientX - sx) + 'px',
          height: Math.abs(e.clientY - sy) + 'px'
        })
      }
    })

    c.addEventListener('pointerup', e => {
      if (panning && !moved) this._clickSelect(e)
      if (boxing) {
        this._rubber.style.display = 'none'
        if (moved) this._boxSelect(sx, sy, e.clientX, e.clientY, e.ctrlKey || e.metaKey)
      }
      panning = boxing = false
    })

    c.addEventListener('wheel', e => {
      e.preventDefault()
      const factor = e.deltaY > 0 ? 1.15 : 1 / 1.15
      const before = this.screenToWorld(e.clientX, e.clientY)
      const maxView = Math.max(this.facade.width, this.facade.height) * 4
      this.viewH = Math.min(Math.max(this.viewH * factor, 1.5), maxView)
      this._updateOrtho()
      const after = this.screenToWorld(e.clientX, e.clientY)
      this.camera.position.x += before.x - after.x
      this.camera.position.y += before.y - after.y
      this._afterCameraChange()
    }, { passive: false })
  }

  _clickSelect(e) {
    const w = this.screenToWorld(e.clientX, e.clientY)
    let hit = null
    const ps = this.facade.panels
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i]
      if (w.x >= p.x && w.x <= p.x + p.w && w.y >= p.y && w.y <= p.y + p.h) { hit = p; break }
    }
    const additive = e.ctrlKey || e.metaKey
    if (hit) {
      if (additive) {
        this.selected.has(hit.id) ? this.selected.delete(hit.id) : this.selected.add(hit.id)
      } else {
        this.selected = new Set([hit.id])
      }
    } else if (!additive) {
      this.selected.clear()
    }
    this._emitSelect()
  }

  _boxSelect(x0, y0, x1, y1, additive) {
    const a = this.screenToWorld(x0, y0)
    const b = this.screenToWorld(x1, y1)
    const minX = Math.min(a.x, b.x), maxX = Math.max(a.x, b.x)
    const minY = Math.min(a.y, b.y), maxY = Math.max(a.y, b.y)
    const next = additive ? new Set(this.selected) : new Set()
    for (const p of this.facade.panels) {
      if (p.x < maxX && p.x + p.w > minX && p.y < maxY && p.y + p.h > minY) next.add(p.id)
    }
    this.selected = next
    this._emitSelect()
  }

  _emitSelect() {
    this.refreshPanels()
    if (this.opts.onSelect) this.opts.onSelect([...this.selected])
  }

  setSelected(ids) {
    this.selected = new Set(ids)
    this.refreshPanels()
  }

  setBoxMode(on) {
    this.boxMode = on
    this.canvas.style.cursor = on ? 'crosshair' : 'default'
  }

  dispose() {
    clearTimeout(this._labelTimer)
    this._ro && this._ro.disconnect()
    this._rubber && this._rubber.remove()
    this.engine.dispose()
  }
}
