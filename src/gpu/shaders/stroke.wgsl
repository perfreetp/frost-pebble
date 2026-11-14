// Stroke rasteriser. Each dispatch is anchored at an 8x8-aligned chunk origin
// (passed in the uniform) that covers the stroke's bounding box, so a long
// diagonal stroke never dispatches over the whole image. The destination
// region is pre-filled with the current matte by the caller before dispatch.
struct Params {
  imgSize: vec4f,   // w, h, originX, originY
  brush: vec4f,     // radius(texels), hardness(0..1), strength(0..1), mode(0 add / 1 erase)
  counts: vec4f,      // pointCount
};

@group(0) @binding(0) var src: texture_2d<f32>;
@group(0) @binding(1) var dst: texture_storage_2d<r32float, write>;
@group(0) @binding(2) var<uniform> P: Params;
@group(0) @binding(3) var<storage, read> pts: array<vec4f>;

fn segDist(p: vec2f, a: vec2f, b: vec2f) -> f32 {
  let ab = b - a;
  let t = clamp(dot(p - a, ab) / max(dot(ab, ab), 0.0001), 0.0, 1.0);
  return length(p - (a + ab * t));
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let ip = vec2i(gid.xy) + vec2i(i32(P.imgSize.z), i32(P.imgSize.w));
  let size = vec2i(textureDimensions(src));
  if (ip.x >= size.x || ip.y >= size.y) { return; }

  let p = vec2f(f32(ip.x), f32(ip.y));
  let n = u32(P.counts.x);
  if (n == 0u) { return; }

  var cov = 0.0;
  if (n == 1u) {
    let d = length(p - pts[0].xy);
    cov = 1.0 - smoothstep(P.brush.x * P.brush.y, P.brush.x, d);
  } else {
    for (var i = 0u; i < n - 1u; i++) {
      let d = segDist(p, pts[i].xy, pts[i + 1u].xy);
      cov = max(cov, 1.0 - smoothstep(P.brush.x * P.brush.y, P.brush.x, d));
    }
  }
  if (cov <= 0.0) {
    textureStore(dst, ip, vec4f(textureLoad(src, ip, 0).r, 0.0, 0.0, 0.0));
    return;
  }

  let a = textureLoad(src, ip, 0).r;
  var outA: f32;
  if (P.brush.w < 0.5) {
    outA = a + (1.0 - a) * cov * P.brush.z;
  } else {
    outA = a * (1.0 - cov * P.brush.z);
  }
  textureStore(dst, ip, vec4f(clamp(outA, 0.0, 1.0), 0.0, 0.0, 0.0));
}
