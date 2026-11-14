// Matte pass 1: distance to the *local* backdrop colour.
//
// A studio sweep is never flat: it carries a gradient from the light and a
// vignette toward the corners, so comparing every pixel against one global
// mean eats the bright top-centre of the frame. The CPU solves a smooth
// background field from the border ring (border cells sample the real sweep,
// interior cells are interpolated) and uploads it as a 16x16 texture, which
// this pass reads bilinearly.
//
// Bindings
//   0 subject
//   1 destination alpha
//   2 uniform
//   3 background field (16x16, rgb = local backdrop colour)
struct Params {
  spread: vec4f,   // rgb = per-channel std dev of the border ring
  params: vec4f,   // x = tolerance (sigma/3), y = softness, z = max shadow drop, w = shadow chroma gate
};

@group(0) @binding(0) var src: texture_2d<f32>;
@group(0) @binding(1) var dst: texture_storage_2d<r32float, write>;
@group(0) @binding(2) var<uniform> P: Params;
@group(0) @binding(3) var bgField: texture_2d<f32>;

fn bgAt(uv: vec2f) -> vec3f {
  let dims = vec2f(textureDimensions(bgField));
  let p = uv * dims - vec2f(0.5);
  let i0 = vec2i(floor(p));
  let f = fract(p);
  let hi = vec2i(dims) - vec2i(1);
  let c00 = textureLoad(bgField, clamp(i0, vec2i(0), hi), 0).rgb;
  let c10 = textureLoad(bgField, clamp(i0 + vec2i(1, 0), vec2i(0), hi), 0).rgb;
  let c01 = textureLoad(bgField, clamp(i0 + vec2i(0, 1), vec2i(0), hi), 0).rgb;
  let c11 = textureLoad(bgField, clamp(i0 + vec2i(1, 1), vec2i(0), hi), 0).rgb;
  return mix(mix(c00, c10, f.x), mix(c01, c11, f.x), f.y);
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let size = textureDimensions(src);
  if (gid.x >= size.x || gid.y >= size.y) { return; }
  let uv = (vec2f(f32(gid.x), f32(gid.y)) + 0.5) / vec2f(size);
  let c = textureLoad(src, vec2i(gid.xy), 0).rgb;
  let bg = bgAt(uv);

  let n = (c - bg) / P.spread.rgb;
  // 3 sigma == 1.0: a cool tint inside a warm sweep does not drag the matte,
  // but a genuinely different albedo does.
  var d = length(n) / 3.0;

  // The product's own shadow lands on the sweep: same hue, much lower luma,
  // and — crucially — locally *smooth*, because a shadow is a blurred copy of
  // the silhouette with no detail of its own. Silver tubes and white plastic
  // also sit near the sweep's luma, but they carry specular gradients and hard
  // edges, so the smoothness gate is what keeps them in the subject while
  // letting a cast shadow fall out.
  let lb = max(dot(bg, vec3f(0.2126, 0.7152, 0.0722)), 0.02);
  let lc = dot(c, vec3f(0.2126, 0.7152, 0.0722));
  let bgN = bg / lb;
  let cN = c / max(lc, 0.02);
  let chromaDist = length(cN - bgN) / 2.0;

  // Local luma roughness over a 7x7 neighbourhood.
  let maxIp = vec2i(size) - vec2i(1);
  var mn = 2.0;
  var mx = 0.0;
  for (var dy = -3; dy <= 3; dy += 3) {
    for (var dx = -3; dx <= 3; dx += 3) {
      let q = clamp(vec2i(gid.xy) + vec2i(dx, dy), vec2i(0), maxIp);
      let qc = textureLoad(src, q, 0).rgb;
      let ql = dot(qc, vec3f(0.2126, 0.7152, 0.0722));
      mn = min(mn, ql);
      mx = max(mx, ql);
    }
  }
  let rough = mx - mn;

  let relDrop = (lb - lc) / max(lb, 0.02);

  // Local *luma ratio* against the sweep over a wider neighbourhood. The
  // faint outer rim of a contact shadow is not darker than the sweep at all --
  // only its edge line is -- so a rim pixel cannot be distinguished from the
  // sweep by its own colour. It only looks opaque because the rim is anti-
  // aliased against the darker core inside it. A real product detail, by
  // contrast, always has somewhere inside its own footprint that is
  // substantially darker (a shadow of itself, a seam, a grip). Gate on that:
  // no dark interior nearby means this is the outer edge of a shadow.
  var darkNear = 0.0;
  for (var ry = -5; ry <= 5; ry += 5) {
    for (var rx = -5; rx <= 5; rx += 5) {
      let q = clamp(vec2i(gid.xy) + vec2i(rx, ry), vec2i(0), maxIp);
      let ql = dot(textureLoad(src, q, 0).rgb, vec3f(0.2126, 0.7152, 0.0722));
      if (ql < lb * 0.9) { darkNear = max(darkNear, (lb - ql) / max(lb, 0.02)); }
    }
  }

  let darker = relDrop > 0.022 && relDrop <= P.params.z;
  let isSoft = rough < lb * 0.28;
  if (darker && chromaDist < P.params.w && isSoft) {
    let drop = clamp(relDrop / 0.35, 0.0, 1.0);
    d = min(d, mix(0.35, 0.0, drop));
  }

  let lo = P.params.x - P.params.y;
  let hi = P.params.x + P.params.y;
  let a = smoothstep(lo, hi, d);
  textureStore(dst, vec2i(gid.xy), vec4f(a, 0.0, 0.0, 0.0));
}
