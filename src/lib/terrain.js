// three.js 三维地形底图:程序化高程 + 乡镇界 3D 线框 + 网格
// 相机为顶视正交,视图状态 {cx, cy, k} 与 Canvas2D 矢量层共享
import * as THREE from 'three';
import { COUNTY_SIZE, GRID_SIZE, heightAt } from './data/sampleCounty.js';

export function createTerrain(container, townships, onViewChange) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0e1520);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.inset = '0';

  // 视图状态:中心(世界坐标 km)与比例(像素/km)
  const view = { cx: COUNTY_SIZE / 2, cy: COUNTY_SIZE / 2, k: 8 };

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1000, 2000);
  camera.up.set(0, 0, -1);
  camera.position.set(0, 500, 0);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.75));
  const sun = new THREE.DirectionalLight(0xffffff, 1.4);
  sun.position.set(120, 300, 80);
  scene.add(sun);

  // 地形网格
  const SEG = 128;
  const geo = new THREE.PlaneGeometry(COUNTY_SIZE, COUNTY_SIZE, SEG, SEG);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const cLow = new THREE.Color(0x2d5a3d), cMid = new THREE.Color(0x8a7f56), cHigh = new THREE.Color(0xd8d4c8);
  const tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + COUNTY_SIZE / 2;
    const y = pos.getZ(i) + COUNTY_SIZE / 2;
    const h = heightAt(x, y);
    pos.setY(i, h * 0.06); // 高程缩放,避免过陡
    const t = Math.min(1, h / 320);
    if (t < 0.5) tmp.copy(cLow).lerp(cMid, t * 2);
    else tmp.copy(cMid).lerp(cHigh, (t - 0.5) * 2);
    colors[i * 3] = tmp.r; colors[i * 3 + 1] = tmp.g; colors[i * 3 + 2] = tmp.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const terrain = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true }));
  scene.add(terrain);

  // 乡镇界 3D 线框
  const boundaryGroup = new THREE.Group();
  for (const t of townships) {
    const pts = t.ring.map(([x, y]) =>
      new THREE.Vector3(x - COUNTY_SIZE / 2, heightAt(x, y) * 0.06 + 0.6, y - COUNTY_SIZE / 2));
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    boundaryGroup.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xffd166 })));
  }
  scene.add(boundaryGroup);

  // 公里网格
  const gridGroup = new THREE.Group();
  const gridMat = new THREE.LineBasicMaterial({ color: 0x3a4a5f, transparent: true, opacity: 0.6 });
  for (let i = 0; i <= COUNTY_SIZE; i += GRID_SIZE) {
    for (const horiz of [true, false]) {
      const pts = [];
      for (let j = 0; j <= COUNTY_SIZE; j += 2) {
        const x = horiz ? j : i, y = horiz ? i : j;
        pts.push(new THREE.Vector3(x - COUNTY_SIZE / 2, heightAt(x, y) * 0.06 + 0.3, y - COUNTY_SIZE / 2));
      }
      gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
    }
  }
  scene.add(gridGroup);

  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h);
    applyCamera();
  }

  function applyCamera() {
    const w = container.clientWidth, h = container.clientHeight;
    const halfW = w / 2 / view.k, halfH = h / 2 / view.k;
    camera.left = -halfW; camera.right = halfW;
    camera.top = halfH; camera.bottom = -halfH;
    camera.position.set(view.cx - COUNTY_SIZE / 2, 500, view.cy - COUNTY_SIZE / 2);
    camera.lookAt(view.cx - COUNTY_SIZE / 2, 0, view.cy - COUNTY_SIZE / 2);
    camera.updateProjectionMatrix();
    if (onViewChange) onViewChange(view);
  }

  // 交互:拖拽平移,滚轮缩放
  let dragging = false, lastX = 0, lastY = 0;
  const el = renderer.domElement;
  el.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.button !== 1) return;
    dragging = true; lastX = e.clientX; lastY = e.clientY;
  });
  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    view.cx -= (e.clientX - lastX) / view.k;
    view.cy -= (e.clientY - lastY) / view.k;
    view.cx = Math.max(0, Math.min(COUNTY_SIZE, view.cx));
    view.cy = Math.max(0, Math.min(COUNTY_SIZE, view.cy));
    lastX = e.clientX; lastY = e.clientY;
    applyCamera();
  });
  window.addEventListener('pointerup', () => { dragging = false; });
  el.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    view.k = Math.max(2, Math.min(80, view.k * factor));
    applyCamera();
  }, { passive: false });

  window.addEventListener('resize', resize);
  resize();

  function render() { renderer.render(scene, camera); }

  // 世界坐标(km) -> 屏幕像素
  function worldToScreen(x, y) {
    const w = container.clientWidth, h = container.clientHeight;
    return [(x - view.cx) * view.k + w / 2, (y - view.cy) * view.k + h / 2];
  }
  function screenToWorld(px, py) {
    const w = container.clientWidth, h = container.clientHeight;
    return [(px - w / 2) / view.k + view.cx, (py - h / 2) / view.k + view.cy];
  }

  return { render, resize, view, worldToScreen, screenToWorld, domElement: el };
}
