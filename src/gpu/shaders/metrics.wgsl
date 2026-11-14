// Matte measurement pass. Edge quality is counted on-GPU with atomics so a
// review never reads back a full 4K alpha texture; the subject's mean colour
// (the input to the colour-temperature check) is accumulated at the same time.
//
//   stats[0] boundary pixels (hard silhouette transitions)
//   stats[1] fringe   boundary pixels carrying saturated colour (backdrop spill)
//   stats[2] soft     mid-alpha pixels that are not obviously intentional
//   stats[3] subject samples
//   stats[4..6] subject sum r/g/b in 8-bit fixed point
struct Params {
  texel: vec2f,
  ring: f32,      // ring radius in texels
  pad: f32,
  thresholds: vec4f, // minAlpha, maxAlpha, opaque, empty
};

@group(0) @binding(0) var subjectTex: texture_2d<f32>;
@group(0) @binding(1) var matteTex: texture_2d<f32>;
@group(0) @binding(2) var<storage, read_write> stats: array<atomic<u32>, 8>;
@group(0) @binding(3) var<uniform> P: Params;

fn alphaAt(ip: vec2i, size: vec2i) -> f32 {
  return textureLoad(matteTex, clamp(ip, vec2i(0), size - vec2i(1)), 0).r;
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let size = vec2i(textureDimensions(matteTex));
  let ip = vec2i(gid.xy);
  if (ip.x >= size.x || ip.y >= size.y) { return; }

  let a = alphaAt(ip, size);
  let T = P.thresholds;

  // Subject colour: only pixels that are solidly inside the product.
  if (a >= T.z) {
    let c = textureLoad(subjectTex, ip, 0).rgb;
    atomicAdd(&stats[3], 1u);
    atomicAdd(&stats[4], u32(clamp(c.r, 0.0, 1.0) * 255.0 + 0.5));
    atomicAdd(&stats[5], u32(clamp(c.g, 0.0, 1.0) * 255.0 + 0.5));
    atomicAdd(&stats[6], u32(clamp(c.b, 0.0, 1.0) * 255.0 + 0.5));
  }

  if (a > T.x && a < T.y) {
    atomicAdd(&stats[2], 1u);
  }

  // A boundary pixel is one sitting on the silhouette: opaque on at least one
  // side and empty on another. A hard-edged matte has almost no mid-alpha band
  // at all, so requiring the pixel itself to be semi-transparent would report
  // a crisp edge as having no boundary whatsoever.
  let r = i32(round(P.ring));
  var hasOpaque = false;
  var hasEmpty = false;
  for (var k = 0; k < 8; k++) {
    let ang = f32(k) * 0.785398;
    let off = vec2i(i32(round(cos(ang) * f32(r))), i32(round(sin(ang) * f32(r))));
    let v = alphaAt(ip + off, size);
    if (v >= T.z) { hasOpaque = true; }
    if (v <= T.w) { hasEmpty = true; }
  }
  if (!(hasOpaque && hasEmpty)) { return; }

  atomicAdd(&stats[0], 1u);
  if (a <= 0.06) { return; }
  let c = textureLoad(subjectTex, ip, 0).rgb;
  let mx = max(c.r, max(c.g, c.b));
  let mn = min(c.r, min(c.g, c.b));
  let sat = select(0.0, (mx - mn) / mx, mx > 0.001);
  let luma = dot(c, vec3f(0.2126, 0.7152, 0.0722));
  // Saturated colour surviving on a hard boundary is backdrop spill: the halo
  // that shows up as a coloured rim once the product is composited.
  if (sat > 0.40 && luma > 0.26) {
    atomicAdd(&stats[1], 1u);
  }
}
