import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { PlacedPanel, PVModule, Roof, RoofPlane } from '../types'
import { OBSTACLE_LABEL } from '../types'
import { pointInPolygon, rectIntersectsPolygon, rectToPolygonEdgeDist, snapToReference } from '../lib/geometry'
import { uid } from '../lib/defaults'
import type { SchemeSettings } from '../types'

export interface ViewerHandle {
  focus: () => void
}

interface Props {
  roof: Roof
  panels: PlacedPanel[]
  modules: PVModule[]
  settings: SchemeSettings
  selectedIds: string[]
  issuePanelIds: Map<string, 'red' | 'warn'>
  activeModule: PVModule
  onSelect: (ids: string[]) => void
  onPlace: (panel: PlacedPanel) => boolean
  onMovePanels: (ids: string[], delta: { du: number; dv: number }) => void
  onHoverReason: (text: string | null) => void
}

interface PlaneFrame {
  eU: THREE.Vector3
  eV: THREE.Vector3
  eN: THREE.Vector3
}

function planeFrame(plane: RoofPlane): PlaneFrame {
  const a = (plane.aspectDeg * Math.PI) / 180
  const s = (plane.slopeDeg * Math.PI) / 180
  const eU = new THREE.Vector3(Math.cos(a), Math.sin(a), 0)
  const eV = new THREE.Vector3(
    Math.sin(a) * Math.cos(s),
    -Math.cos(a) * Math.cos(s),
    Math.sin(s),
  )
  const eN = new THREE.Vector3().crossVectors(eU, eV).normalize()
  return { eU, eV, eN }
}

function localToWorld(roof: Roof, plane: RoofPlane, u: number, v: number, z = 0): THREE.Vector3 {
  const { eU, eV, eN } = planeFrame(plane)
  return new THREE.Vector3(roof.origin.x, roof.origin.y, roof.origin.z)
    .addScaledVector(eU, u)
    .addScaledVector(eV, v)
    .addScaledVector(eN, z)
}

function worldToLocal(roof: Roof, plane: RoofPlane, p: THREE.Vector3): { u: number; v: number } {
  const a = (plane.aspectDeg * Math.PI) / 180
  const s = (plane.slopeDeg * Math.PI) / 180
  const rx = p.x - roof.origin.x
  const ry = p.y - roof.origin.y
  const rz = p.z - roof.origin.z
  let v: number
  if (Math.abs(Math.sin(s)) > 1e-6) v = rz / Math.sin(s)
  else v = rx * Math.sin(a) - ry * Math.cos(a)
  const hv = v * Math.cos(s)
  const u = (rx - hv * Math.sin(a)) * Math.cos(a) + (ry + hv * Math.cos(a)) * Math.sin(a)
  return { u, v }
}

const OB_COLORS: Record<string, number> = {
  parapet: 0xb5474e,
  skylight: 0x7dd3fc,
  fan: 0xf59e0b,
  shaft: 0xa78bfa,
}

export default function RoofViewer(props: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const marqueeRef = useRef<HTMLDivElement>(null)
  const propsRef = useRef(props)
  propsRef.current = props

  useEffect(() => {
    const mount = mountRef.current!
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f172a)
    scene.fog = new THREE.Fog(0x0f172a, 120, 260)

    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 1000)
    camera.position.set(45, 55, 55)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.shadowMap.enabled = true
    mount.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    // 左键让给框选/拖板；右键旋转、中键平移、滚轮缩放
    controls.mouseButtons = {
      LEFT: null as unknown as THREE.MOUSE,
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: THREE.MOUSE.ROTATE,
    }
    controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }

    scene.add(new THREE.AmbientLight(0xffffff, 0.55))
    const sun = new THREE.DirectionalLight(0xffffff, 1.4)
    sun.position.set(40, 70, 30)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.left = -80
    sun.shadow.camera.right = 80
    sun.shadow.camera.top = 80
    sun.shadow.camera.bottom = -80
    scene.add(sun)
    scene.add(new THREE.HemisphereLight(0xbcd3ff, 0x334155, 0.5))

    const root = new THREE.Group()
    scene.add(root)
    const planeMeshes = new Map<string, THREE.Mesh>()
    const obstacleMeshes: THREE.Mesh[] = []
    let panelMesh: THREE.InstancedMesh | null = null
    const tmpObj = new THREE.Object3D()
    const tmpColor = new THREE.Color()

    // ---------- 屋面 / 女儿墙 / 障碍构建 ----------
    function buildRoof(roof: Roof) {
      [...root.children].forEach((c) => {
        if (!(c as THREE.Object3D & { __panel?: boolean }).__panel) root.remove(c)
      })
      planeMeshes.clear()
      obstacleMeshes.length = 0

      const grid = new THREE.GridHelper(200, 100, 0x334155, 0x1e293b)
      grid.position.y = -0.02
      root.add(grid)

      for (const plane of roof.planes) {
        const shape = new THREE.Shape()
        plane.outline.forEach((p, i) => {
          if (i === 0) shape.moveTo(p.x, p.y)
          else shape.lineTo(p.x, p.y)
        })
        shape.closePath()
        const geo = new THREE.ShapeGeometry(shape)
        const pos = geo.attributes.position as THREE.BufferAttribute
        for (let i = 0; i < pos.count; i++) {
          const u = pos.getX(i)
          const v = pos.getY(i)
          const w = localToWorld(roof, plane, u, v, 0)
          pos.setXYZ(i, w.x, w.y, w.z)
        }
        geo.computeVertexNormals()
        const mat = new THREE.MeshStandardMaterial({
          color: 0x475569,
          side: THREE.DoubleSide,
          roughness: 0.9,
          metalness: 0.1,
        })
        const mesh = new THREE.Mesh(geo, mat)
        mesh.receiveShadow = true
        mesh.userData.planeId = plane.id
        root.add(mesh)
        planeMeshes.set(plane.id, mesh)

        // 轮廓边线
        const edges = new THREE.LineSegments(
          new THREE.EdgesGeometry(geo),
          new THREE.LineBasicMaterial({ color: 0x94a3b8 }),
        )
        root.add(edges)

        // 女儿墙
        if (plane.parapetHeight > 0) {
          for (let i = 0; i < plane.outline.length; i++) {
            const a = plane.outline[i]
            const b = plane.outline[(i + 1) % plane.outline.length]
            const wa = localToWorld(roof, plane, a.x, a.y, 0)
            const wb = localToWorld(roof, plane, b.x, b.y, 0)
            const dir = new THREE.Vector3().subVectors(wb, wa)
            const len = dir.length()
            const wall = new THREE.Mesh(
              new THREE.BoxGeometry(len, 0.25, plane.parapetHeight),
              new THREE.MeshStandardMaterial({ color: OB_COLORS.parapet, roughness: 0.8 }),
            )
            wall.position.copy(wa).add(wb).multiplyScalar(0.5)
            wall.position.addScaledVector(planeFrame(plane).eN, plane.parapetHeight / 2)
            wall.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir.normalize())
            wall.castShadow = true
            wall.userData.tip = `女儿墙（高 ${plane.parapetHeight}m）`
            root.add(wall)
            obstacleMeshes.push(wall)
          }
        }

        // 障碍物拉伸体
        for (const ob of plane.obstacles) {
          const sh = new THREE.Shape()
          ob.polygon.forEach((p, i) => {
            if (i === 0) sh.moveTo(p.x, p.y)
            else sh.lineTo(p.x, p.y)
          })
          sh.closePath()
          const og = new THREE.ExtrudeGeometry(sh, { depth: ob.height, bevelEnabled: false })
          const op = og.attributes.position as THREE.BufferAttribute
          for (let i = 0; i < op.count; i++) {
            const w = localToWorld(roof, plane, op.getX(i), op.getY(i), op.getZ(i))
            op.setXYZ(i, w.x, w.y, w.z)
          }
          og.computeVertexNormals()
          const om = new THREE.Mesh(
            og,
            new THREE.MeshStandardMaterial({
              color: OB_COLORS[ob.type],
              roughness: 0.6,
              transparent: ob.type === 'skylight',
              opacity: ob.type === 'skylight' ? 0.75 : 1,
            }),
          )
          om.castShadow = true
          om.userData.tip = `${OBSTACLE_LABEL[ob.type]}${ob.name ? ' ' + ob.name : ''}（高 ${ob.height}m）· 禁布区`
          root.add(om)
          obstacleMeshes.push(om)
        }
      }
    }

    // ---------- 组件实例 ----------
    function panelAxes(
      roof: Roof,
      plane: RoofPlane,
      panel: PlacedPanel,
      settings: SchemeSettings,
    ) {
      const { eU, eV, eN } = planeFrame(plane)
      let uAxis = eU
      let vAxis = eV
      let nAxis = eN
      if (plane.slopeDeg === 0) {
        const t = (settings.tiltDegOnFlat * Math.PI) / 180
        vAxis = eV.clone().multiplyScalar(Math.cos(t)).addScaledVector(eN, Math.sin(t))
        nAxis = eN.clone().multiplyScalar(Math.cos(t)).addScaledVector(eV, -Math.sin(t))
      }
      const r = (panel.rotationDeg * Math.PI) / 180
      const x = uAxis.clone().multiplyScalar(Math.cos(r)).addScaledVector(vAxis, Math.sin(r))
      const z = uAxis.clone().multiplyScalar(-Math.sin(r)).addScaledVector(vAxis, Math.cos(r))
      return { x, y: nAxis, z }
    }

    function buildPanels() {
      const { roof: r, panels, modules, settings, selectedIds, issuePanelIds } = propsRef.current
      if (panelMesh) {
        root.remove(panelMesh)
        panelMesh.geometry.dispose()
        ;(panelMesh.material as THREE.Material).dispose()
        panelMesh = null
      }
      if (!panels.length) return
      const mod0 = modules.find((m) => m.id === panels[0].moduleId) ?? modules[0]
      const geo = new THREE.BoxGeometry(mod0.length, 0.04, mod0.width)
      const mat = new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.3 })
      const mesh = new THREE.InstancedMesh(geo, mat, panels.length)
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
      mesh.castShadow = true
      ;(mesh as THREE.Object3D & { __panel?: boolean }).__panel = true
      mesh.userData.isPanelMesh = true

      const planeMap = new Map(r.planes.map((p) => [p.id, p]))
      const modMap = new Map(modules.map((m) => [m.id, m]))
      const sel = new Set(selectedIds)

      panels.forEach((panel, i) => {
        const plane = planeMap.get(panel.planeId)!
        const mod = modMap.get(panel.moduleId) ?? mod0
        const axes = panelAxes(r, plane, panel, settings)
        const center = localToWorld(r, plane, panel.u, panel.v, 0).addScaledVector(
          axes.y,
          mod.width * 0.18 + 0.05,
        )
        const basis = new THREE.Matrix4().makeBasis(axes.x, axes.y, axes.z)
        const quat = new THREE.Quaternion().setFromRotationMatrix(basis)
        const swap = panel.rotationDeg % 180 !== 0
        tmpObj.position.copy(center)
        tmpObj.quaternion.copy(quat)
        tmpObj.scale.set(swap ? mod.width / mod0.length : 1, 1, swap ? mod.length / mod0.width : 1)
        tmpObj.updateMatrix()
        mesh.setMatrixAt(i, tmpObj.matrix)

        const issue = issuePanelIds.get(panel.id)
        if (issue === 'red') tmpColor.set(0xd92d20)
        else if (issue === 'warn') tmpColor.set(0xe8890c)
        else if (sel.has(panel.id)) tmpColor.set(0xf5b301)
        else tmpColor.set(0x2f7de1)
        mesh.setColorAt(i, tmpColor)
      })
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
      root.add(mesh)
      panelMesh = mesh
    }

    // ---------- 候选合法性（布板/拖拽实时校验） ----------
    function validateCandidate(
      plane: RoofPlane,
      u: number,
      v: number,
      mod: PVModule,
      rotationDeg: number,
      excludeIds: Set<string>,
    ): string | null {
      const halfU = ((rotationDeg % 180 === 0 ? mod.length : mod.width)) / 2
      const halfV = ((rotationDeg % 180 === 0 ? mod.width : mod.length)) / 2
      const center = { x: u, y: v }
      const corners = [
        { x: u - halfU, y: v - halfV },
        { x: u + halfU, y: v - halfV },
        { x: u + halfU, y: v + halfV },
        { x: u - halfU, y: v + halfV },
      ]
      const { settings, panels } = propsRef.current
      if (!corners.every((c) => pointInPolygon(c, plane.outline))) return '超出屋面轮廓，无法放置'
      if (
        plane.parapetHeight > 0 &&
        rectToPolygonEdgeDist(center, halfU, halfV, rotationDeg, plane.outline) < settings.safetyMargin
      )
        return `女儿墙安全退距不足（需 ${settings.safetyMargin}m）`
      for (const ob of plane.obstacles) {
        if (rectIntersectsPolygon(center, halfU, halfV, rotationDeg, ob.polygon))
          return `压到${OBSTACLE_LABEL[ob.type]}禁布区`
        if (rectToPolygonEdgeDist(center, halfU, halfV, rotationDeg, ob.polygon) < settings.safetyMargin)
          return `距${OBSTACLE_LABEL[ob.type]}不足安全退距 ${settings.safetyMargin}m`
      }
      for (const p of panels) {
        if (excludeIds.has(p.id) || p.planeId !== plane.id) continue
        if (Math.abs(p.u - u) < (halfU + mod.length / 2) * 0.9 && Math.abs(p.v - v) < (halfV + mod.width / 2) * 0.9)
          return '与已有组件重叠'
      }
      return null
    }

    // ---------- 交互 ----------
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    let dragMode: null | 'marquee' | 'panel' = null
    let downScreen = { x: 0, y: 0 }
    let lastLocal: { u: number; v: number } | null = null
    let dragPlane: RoofPlane | null = null
    let ghost: THREE.Mesh | null = null
    let hoverTip: string | null = null

    function setPointer(e: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    }

    function hitPlane(): { plane: RoofPlane; point: THREE.Vector3 } | null {
      const r = propsRef.current.roof
      raycaster.setFromCamera(pointer, camera)
      const meshes = [...planeMeshes.values()]
      const hit = raycaster.intersectObjects(meshes, false)[0]
      if (!hit) return null
      const plane = r.planes.find((p) => p.id === hit.object.userData.planeId)!
      return { plane, point: hit.point }
    }

    function hitPanel(): number | null {
      if (!panelMesh) return null
      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.intersectObject(panelMesh, false)[0]
      return hit?.instanceId ?? null
    }

    function ensureGhost(mod: PVModule) {
      if (ghost) return ghost
      ghost = new THREE.Mesh(
        new THREE.BoxGeometry(mod.length, 0.05, mod.width),
        new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.55, color: 0x22c55e }),
      )
      scene.add(ghost)
      return ghost
    }

    function snapUV(plane: RoofPlane, u: number, v: number, mod: PVModule) {
      const { settings, panels } = propsRef.current
      const same = panels.filter((p) => p.planeId === plane.id)
      const refU = same.length ? Math.min(...same.map((p) => p.u)) : 0
      const refV = same.length ? Math.min(...same.map((p) => p.v)) : 0
      return {
        u: snapToReference(u, mod.length + settings.gapX, refU),
        v: snapToReference(v, mod.width + settings.gapY, refV),
      }
    }

    function onPointerDown(e: PointerEvent) {
      if (e.button !== 0) return
      setPointer(e)
      downScreen = { x: e.clientX, y: e.clientY }
      const idx = hitPanel()
      const { panels, selectedIds, onSelect } = propsRef.current
      if (idx !== null && panelMesh) {
        const panel = panels[idx]
        const already = selectedIds.includes(panel.id)
        if (!already) onSelect(e.ctrlKey || e.metaKey ? [...selectedIds, panel.id] : [panel.id])
        dragMode = 'panel'
        const roof = propsRef.current.roof
        dragPlane = roof.planes.find((p) => p.id === panel.planeId)!
        lastLocal = worldToLocal(roof, dragPlane, raycaster.intersectObject(panelMesh)[0].point)
      } else {
        const hp = hitPlane()
        if (hp) {
          dragMode = 'marquee'
          dragPlane = hp.plane
          marqueeRef.current!.style.display = 'block'
          marqueeRef.current!.style.left = `${e.clientX}px`
          marqueeRef.current!.style.top = `${e.clientY}px`
          marqueeRef.current!.style.width = '0px'
          marqueeRef.current!.style.height = '0px'
        }
      }
    }

    function onPointerMove(e: PointerEvent) {
      setPointer(e)
      const { activeModule, settings, roof } = propsRef.current

      if (dragMode === 'marquee') {
        const box = marqueeRef.current!
        const x = Math.min(e.clientX, downScreen.x)
        const y = Math.min(e.clientY, downScreen.y)
        box.style.left = `${x}px`
        box.style.top = `${y}px`
        box.style.width = `${Math.abs(e.clientX - downScreen.x)}px`
        box.style.height = `${Math.abs(e.clientY - downScreen.y)}px`
        return
      }

      if (dragMode === 'panel' && dragPlane && lastLocal) {
        const hp = hitPlane()
        if (!hp) return
        const local = worldToLocal(roof, dragPlane, hp.point)
        const delta = { du: local.u - lastLocal.u, dv: local.v - lastLocal.v }
        lastLocal = local
        propsRef.current.onMovePanels(propsRef.current.selectedIds, delta)
        return
      }

      // 悬停提示
      raycaster.setFromCamera(pointer, camera)
      const obHit = raycaster.intersectObjects(obstacleMeshes, false)[0]
      if (obHit?.object.userData.tip) {
        hoverTip = obHit.object.userData.tip as string
        renderer.domElement.style.cursor = 'help'
      } else {
        hoverTip = null
        renderer.domElement.style.cursor = hitPanel() !== null ? 'pointer' : 'crosshair'
      }
      propsRef.current.onHoverReason(hoverTip)

      // 布板幽灵预览
      const hp = hitPlane()
      if (hp) {
        const g = ensureGhost(activeModule)
        const localPt = worldToLocal(roof, hp.plane, hp.point)
        const snapped = snapUV(hp.plane, localPt.u, localPt.v, activeModule)
        const reason = validateCandidate(hp.plane, snapped.u, snapped.v, activeModule, 0, new Set())
        ;(g.material as THREE.MeshStandardMaterial).color.set(reason ? 0xd92d20 : 0x22c55e)
        const axes = (() => {
          const { eU, eV, eN } = planeFrame(hp.plane)
          let vA = eV
          let nA = eN
          if (hp.plane.slopeDeg === 0) {
            const t = (settings.tiltDegOnFlat * Math.PI) / 180
            vA = eV.clone().multiplyScalar(Math.cos(t)).addScaledVector(eN, Math.sin(t))
            nA = eN.clone().multiplyScalar(Math.cos(t)).addScaledVector(eV, -Math.sin(t))
          }
          return { x: eU, y: nA, z: vA }
        })()
        const center = localToWorld(roof, hp.plane, snapped.u, snapped.v, 0).addScaledVector(
          axes.y,
          activeModule.width * 0.18 + 0.05,
        )
        g.position.copy(center)
        g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(axes.x, axes.y, axes.z))
        g.visible = true
        propsRef.current.onHoverReason(reason ?? hoverTip)
      } else if (ghost) {
        ghost.visible = false
      }
    }

    function onPointerUp(e: PointerEvent) {
      if (dragMode === 'marquee' && dragPlane) {
        const rect = renderer.domElement.getBoundingClientRect()
        const x1 = Math.min(e.clientX, downScreen.x) - rect.left
        const x2 = Math.max(e.clientX, downScreen.x) - rect.left
        const y1 = Math.min(e.clientY, downScreen.y) - rect.top
        const y2 = Math.max(e.clientY, downScreen.y) - rect.top
        marqueeRef.current!.style.display = 'none'
        const { panels, onSelect } = propsRef.current
        const pv = new THREE.Vector3()
        const ids: string[] = []
        panels.forEach((p, i) => {
          if (p.planeId !== dragPlane!.id || !panelMesh) return
          panelMesh.getMatrixAt(i, tmpObj.matrix)
          tmpObj.matrix.decompose(tmpObj.position, tmpObj.quaternion, tmpObj.scale)
          pv.copy(tmpObj.position).project(camera)
          const sx = (pv.x * 0.5 + 0.5) * rect.width
          const sy = (-pv.y * 0.5 + 0.5) * rect.height
          if (sx >= x1 && sx <= x2 && sy >= y1 && sy <= y2) ids.push(p.id)
        })
        if (ids.length) onSelect(ids)
      }
      dragMode = null
      lastLocal = null
      dragPlane = null
    }

    function onDblClick(e: MouseEvent) {
      setPointer(e as unknown as PointerEvent)
      const hp = hitPlane()
      if (!hp) return
      const { roof: r, activeModule, onPlace } = propsRef.current
      const local = worldToLocal(r, hp.plane, hp.point)
      const snapped = snapUV(hp.plane, local.u, local.v, activeModule)
      const reason = validateCandidate(hp.plane, snapped.u, snapped.v, activeModule, 0, new Set())
      if (reason) {
        propsRef.current.onHoverReason(`无法放置：${reason}`)
        return
      }
      onPlace({
        id: uid('pn'),
        moduleId: activeModule.id,
        planeId: hp.plane.id,
        u: snapped.u,
        v: snapped.v,
        rotationDeg: 0,
      })
    }

    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    renderer.domElement.addEventListener('dblclick', onDblClick)
    const blockMenu = (e: Event) => e.preventDefault()
    renderer.domElement.addEventListener('contextmenu', blockMenu)

    // ---------- 尺寸自适应 & 渲染循环 ----------
    const ro = new ResizeObserver(() => {
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    })
    ro.observe(mount)

    let raf = 0
    const loop = () => {
      controls.update()
      renderer.render(scene, camera)
      raf = requestAnimationFrame(loop)
    }
    loop()

    buildRoof(propsRef.current.roof)
    buildPanels()

    // 数据变化时重建实例（位置/朝向/数量/选中/问题任一变化即刷新）
    let lastKey = ''
    const watch = setInterval(() => {
      const key = JSON.stringify({
        id: propsRef.current.roof.id,
        n: propsRef.current.roof.updatedAt,
        p: propsRef.current.panels.map((x) => `${x.id.slice(-4)}:${x.u.toFixed(2)},${x.v.toFixed(2)},${x.rotationDeg}`),
        s: propsRef.current.selectedIds.join(','),
        i: [...propsRef.current.issuePanelIds.keys()].join(','),
      })
      if (lastKey !== key) {
        lastKey = key
        buildPanels()
      }
    }, 120)

    return () => {
      cancelAnimationFrame(raf)
      clearInterval(watch)
      ro.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      renderer.domElement.removeEventListener('dblclick', onDblClick)
      renderer.domElement.removeEventListener('contextmenu', blockMenu)
      controls.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="viewer-wrap" ref={mountRef}>
      <div className="marquee" ref={marqueeRef} />
    </div>
  )
}
