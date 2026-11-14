export type Vec3 = [number, number, number];
export type Mat4 = Float32Array;

export const v3 = (x: number, y: number, z: number): Vec3 => [x, y, z];
export const addV = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const subV = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scaleV = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
export const dotV = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const crossV = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const lenV = (a: Vec3): number => Math.hypot(a[0], a[1], a[2]);
export const normV = (a: Vec3): Vec3 => {
  const l = lenV(a);
  return l > 1e-9 ? [a[0] / l, a[1] / l, a[2] / l] : [0, 0, 0];
};

/** 列主序 4x4 */
export function mul(a: Mat4, b: Mat4): Mat4 {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      out[c * 4 + r] =
        a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
  }
  return out;
}

/** 右手系视图矩阵，相机沿 -z 观察 */
export function viewMatrix(right: Vec3, up: Vec3, forward: Vec3, eye: Vec3): Mat4 {
  const z: Vec3 = [-forward[0], -forward[1], -forward[2]];
  const m = new Float32Array(16);
  m[0] = right[0]; m[4] = right[1]; m[8] = right[2]; m[12] = -dotV(right, eye);
  m[1] = up[0]; m[5] = up[1]; m[9] = up[2]; m[13] = -dotV(up, eye);
  m[2] = z[0]; m[6] = z[1]; m[10] = z[2]; m[14] = -dotV(z, eye);
  m[3] = 0; m[7] = 0; m[11] = 0; m[15] = 1;
  return m;
}

/** 透视投影，深度范围 [0,1]（D3D 风格） */
export function perspective(fovY: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1 / Math.tan(fovY / 2);
  const m = new Float32Array(16);
  m[0] = f / aspect;
  m[5] = f;
  m[10] = -far / (far - near);
  m[11] = -1;
  m[14] = -(far * near) / (far - near);
  return m;
}

/** 正交投影，深度范围 [0,1] */
export function orthographic(halfW: number, halfH: number, near: number, far: number): Mat4 {
  const m = new Float32Array(16);
  m[0] = 1 / halfW;
  m[5] = 1 / halfH;
  m[10] = -1 / (far - near);
  m[14] = -near / (far - near);
  m[15] = 1;
  return m;
}

export interface OrthoExtent {
  halfW: number;
  halfH: number;
}

export interface Camera {
  eye: Vec3;
  right: Vec3;
  up: Vec3;
  forward: Vec3;
  near: number;
  far: number;
  /** 有值时为正交相机 */
  ortho: OrthoExtent | null;
  tanHalfFov: number;
}

export interface CameraParams {
  eye: Vec3;
  target: Vec3;
  /** 视线参考上方向 */
  upHint?: Vec3;
  fovDeg?: number;
  near?: number;
  far?: number;
  orthoHalfHeight?: number;
  orthoAspect?: number;
  /** 屏幕右方向参考；用于立面图让世界 +x 落在屏幕右侧 */
  rightHint?: Vec3;
}

export function makeCamera(p: CameraParams): Camera {
  const forward = normV(subV(p.target, p.eye));
  let upHint = p.upHint ?? [0, 1, 0];
  if (Math.abs(dotV(forward, normV(upHint))) > 0.9995) upHint = [0, 0, -1];
  let right: Vec3;
  if (p.rightHint) {
    const rh = normV(p.rightHint);
    right = normV(subV(rh, scaleV(forward, dotV(rh, forward))));
  } else {
    right = normV(crossV(forward, upHint));
  }
  // up = forward × right；立面图采用镜像基（关闭背面剔除），保证 +x 向右
  const up = normV(crossV(forward, right));
  const ortho =
    p.orthoHalfHeight !== undefined
      ? {
          halfH: p.orthoHalfHeight,
          halfW: p.orthoHalfHeight * (p.orthoAspect ?? 1),
        }
      : null;
  return {
    eye: p.eye,
    right,
    up,
    forward,
    near: p.near ?? 0.1,
    far: p.far ?? 2000,
    ortho,
    tanHalfFov: Math.tan(((p.fovDeg ?? 45) * Math.PI) / 360),
  };
}

export function cameraMatrix(cam: Camera, aspect: number): Mat4 {
  const view = viewMatrix(cam.right, cam.up, cam.forward, cam.eye);
  const proj = cam.ortho
    ? orthographic(cam.ortho.halfW, cam.ortho.halfH, cam.near, cam.far)
    : perspective(cam.tanHalfFov * 2, aspect, cam.near, cam.far);
  return mul(proj, view);
}

/**
 * 按包围盒角点求正交取景：返回恰好框住所有角点的半高。
 * viewDir 为相机视线方向（从 eye 指向 target）。
 */
export function fitOrtho(
  viewDir: Vec3,
  upHint: Vec3,
  rightHint: Vec3,
  corners: Vec3[],
  center: Vec3,
  aspect: number,
  margin = 0.9,
): { halfH: number; shiftRight: number; shiftUp: number } {
  const forward = normV(viewDir);
  let right = normV(subV(normV(rightHint), scaleV(forward, dotV(normV(rightHint), forward))));
  if (lenV(right) < 1e-6) right = normV(crossV(forward, upHint));
  const up = normV(crossV(forward, right));
  let maxR = 0;
  let maxU = 0;
  let minR = Infinity;
  let maxRu = -Infinity;
  let minU = Infinity;
  let maxUu = -Infinity;
  for (const c of corners) {
    const d = subV(c, center);
    const r = dotV(d, right);
    const u = dotV(d, up);
    maxR = Math.max(maxR, Math.abs(r));
    maxU = Math.max(maxU, Math.abs(u));
    minR = Math.min(minR, r);
    maxRu = Math.max(maxRu, r);
    minU = Math.min(minU, u);
    maxUu = Math.max(maxUu, u);
  }
  const halfH = Math.max(maxU, maxR / aspect) / margin;
  return {
    halfH,
    shiftRight: (minR + maxRu) / 2,
    shiftUp: (minU + maxUu) / 2,
  };
}

/** 世界包围盒的 8 个角点 */
export function bboxCorners(minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number): Vec3[] {
  const out: Vec3[] = [];
  for (const x of [minX, maxX]) {
    for (const y of [minY, maxY]) {
      for (const z of [minZ, maxZ]) {
        out.push([x, y, z]);
      }
    }
  }
  return out;
}

/**
 * 精确求解透视相机取景：
 * 求最小相机距离 d 与画面中心偏移 (ox, oy)，使所有角点都落在视锥内。
 * 对 d 做二分（可行性关于 d 单调），再取可行偏移的中点居中。
 */
export function solveFrustum(
  corners: Vec3[],
  forward: Vec3,
  upHint: Vec3,
  rightHint: Vec3,
  tanH: number,
  tanW: number,
  margin = 1,
): { distance: number; ox: number; oy: number; zRef: number } {
  const fwd = normV(forward);
  let right = normV(subV(normV(rightHint), scaleV(fwd, dotV(normV(rightHint), fwd))));
  if (lenV(right) < 1e-6) right = normV(crossV(fwd, upHint));
  const up = normV(crossV(right, fwd));

  const pts = corners.map((c) => ({
    x: dotV(c, right),
    y: dotV(c, up),
    z: dotV(c, fwd), // 相对世界原点，最后统一减基准
  }));
  const zRef = pts.reduce((s, p) => s + p.z, 0) / Math.max(1, pts.length);
  const xRef = pts.reduce((s, p) => s + p.x, 0) / Math.max(1, pts.length);
  const yRef = pts.reduce((s, p) => s + p.y, 0) / Math.max(1, pts.length);

  const tH = tanH * margin;
  const tW = tanW * margin;

  const feasible = (d: number) => {
    // 深度 = d + (z_i - zRef)
    let okW = false;
    let loW = -Infinity;
    let hiW = Infinity;
    let okH = false;
    let loH = -Infinity;
    let hiH = Infinity;
    for (const p of pts) {
      const depth = d + (p.z - zRef);
      if (depth <= 0.01) return false;
      const halfW = depth * tW;
      const halfH = depth * tH;
      const x = p.x - xRef;
      const y = p.y - yRef;
      loW = Math.max(loW, x - halfW);
      hiW = Math.min(hiW, x + halfW);
      loH = Math.max(loH, y - halfH);
      hiH = Math.min(hiH, y + halfH);
      okW = loW <= hiW;
      okH = loH <= hiH;
      if (!okW || !okH) return false;
    }
    return okW && okH;
  };

  let lo = 0.5;
  let hi = 4000;
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    if (feasible(m)) hi = m;
    else lo = m;
  }
  const d = hi;

  // 在最优距离下求居中偏移
  let loW = -Infinity;
  let hiW = Infinity;
  let loH = -Infinity;
  let hiH = Infinity;
  for (const p of pts) {
    const depth = d + (p.z - zRef);
    loW = Math.max(loW, p.x - xRef - depth * tW);
    hiW = Math.min(hiW, p.x - xRef + depth * tW);
    loH = Math.max(loH, p.y - yRef - depth * tH);
    hiH = Math.min(hiH, p.y - yRef + depth * tH);
  }
  return {
    distance: d,
    ox: xRef + (loW + hiW) / 2,
    oy: yRef + (loH + hiH) / 2,
    zRef,
  };
}

/**
 * 由 solveFrustum 的结果还原相机 eye 与 target（含平移）。
 * 相机位于 fwd 坐标 zRef - d 处，(right, up) 坐标为 ox/oy；target 为其前方 d 处。
 */
export function cameraFromSolve(
  forward: Vec3,
  rightHint: Vec3,
  upHint: Vec3,
  sol: { distance: number; ox: number; oy: number; zRef: number },
): { eye: Vec3; target: Vec3 } {
  const fwd = normV(forward);
  let right = normV(subV(normV(rightHint), scaleV(fwd, dotV(normV(rightHint), fwd))));
  if (lenV(right) < 1e-6) right = normV(crossV(fwd, upHint));
  const up = normV(crossV(right, fwd));
  const eye = addV(addV(scaleV(right, sol.ox), scaleV(up, sol.oy)), scaleV(fwd, sol.zRef - sol.distance));
  const target = addV(eye, scaleV(fwd, sol.distance));
  return { eye, target };
}



export function projectToScreen(cam: Camera, world: Vec3, width: number, height: number) {
  const d = subV(world, cam.eye);
  const depth = dotV(d, cam.forward);
  if (depth <= cam.near) return null;
  let ndcX: number;
  let ndcY: number;
  if (cam.ortho) {
    ndcX = dotV(d, cam.right) / cam.ortho.halfW;
    ndcY = dotV(d, cam.up) / cam.ortho.halfH;
  } else {
    const aspect = width / Math.max(1, height);
    ndcX = dotV(d, cam.right) / (depth * cam.tanHalfFov * aspect);
    ndcY = dotV(d, cam.up) / (depth * cam.tanHalfFov);
  }
  return { x: ((ndcX + 1) / 2) * width, y: ((1 - ndcY) / 2) * height, depth };
}

export function screenRay(cam: Camera, mx: number, my: number, width: number, height: number): { origin: Vec3; dir: Vec3 } {
  const aspect = width / Math.max(1, height);
  const ndcX = (2 * mx) / width - 1;
  const ndcY = 1 - (2 * my) / height;
  if (cam.ortho) {
    const origin = addV(
      addV(cam.eye, scaleV(cam.right, ndcX * cam.ortho.halfW)),
      scaleV(cam.up, ndcY * cam.ortho.halfH),
    );
    return { origin, dir: cam.forward };
  }
  const dir = normV(
    addV(cam.forward, addV(scaleV(cam.right, ndcX * cam.tanHalfFov * aspect), scaleV(cam.up, ndcY * cam.tanHalfFov))),
  );
  return { origin: cam.eye, dir };
}

/** 屏幕像素位移 → 给定深度处的世界单位位移（用于拖动换算） */
export function screenDeltaToWorld(cam: Camera, dx: number, dy: number, width: number, height: number): { x: number; y: number } {
  if (cam.ortho) {
    return {
      x: (dx / width) * cam.ortho.halfW * 2,
      y: (-dy / height) * cam.ortho.halfH * 2,
    };
  }
  const dist = 30;
  const worldPerPixelH = (2 * dist * cam.tanHalfFov) / Math.max(1, height);
  return { x: dx * worldPerPixelH, y: -dy * worldPerPixelH };
}

/** 射线与轴对齐平面求交（axis: 0=x,1=y,2=z） */
export function intersectAxisPlane(origin: Vec3, dir: Vec3, axis: 0 | 1 | 2, value: number): Vec3 | null {
  if (Math.abs(dir[axis]) < 1e-6) return null;
  const t = (value - origin[axis]) / dir[axis];
  if (t <= 0) return null;
  return addV(origin, scaleV(dir, t));
}
