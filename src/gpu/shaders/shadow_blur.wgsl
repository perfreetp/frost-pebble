// Separable blur over the matte for the cast shadow. Two dispatches (H, V)
// with a triangular kernel approximate a gaussian; radius is pre-scaled on
// the CPU from the softness slider and the shadow offset.
struct Params {
  dir: vec4f,   // stepX, stepY, radius(texels), unused
};

@group(0) @binding(0) var src: texture_2d<f32>;
@group(0) @binding(1) var dst: texture_storage_2d<r32float, write>;
@group(0) @binding(2) var<uniform> P: Params;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let size = vec2i(textureDimensions(src));
  if (gid.x >= u32(size.x) || gid.y >= u32(size.y)) { return; }
  let ip = vec2i(gid.xy);
  let r = max(i32(P.dir.z), 1);
  var sum = 0.0;
  var wsum = 0.0;
  for (var i = -r; i <= r; i++) {
    let q = clamp(ip + vec2i(i32(P.dir.x), i32(P.dir.y)) * i, vec2i(0), size - vec2i(1));
    let w = 1.0 - f32(abs(i)) / f32(r + 1);
    sum += textureLoad(src, q, 0).r * w;
    wsum += w;
  }
  textureStore(dst, ip, vec4f(sum / max(wsum, 0.0001), 0.0, 0.0, 0.0));
}
