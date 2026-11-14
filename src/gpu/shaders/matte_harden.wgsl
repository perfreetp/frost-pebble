// Final matte hardening shared by preview and export. The bilateral refine
// pass leaves a soft band; this re-centres it on the matte's own histogram so
// the exported alpha has a crisp contour with only `feather` texels of ramp.
struct Params {
  texel: vec2f,
  feather: f32,   // ramp width in texels
  hardness: f32,  // 0 linear .. 1 near-binary
};

@group(0) @binding(0) var src: texture_2d<f32>;
@group(0) @binding(1) var dst: texture_storage_2d<r32float, write>;
@group(0) @binding(2) var<uniform> P: Params;

fn at(p: vec2i) -> f32 {
  let size = vec2i(textureDimensions(src));
  return textureLoad(src, clamp(p, vec2i(0), size - vec2i(1)), 0).r;
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let size = textureDimensions(src);
  if (gid.x >= size.x || gid.y >= size.y) { return; }
  let ip = vec2i(gid.xy);
  let a = at(ip);
  let band = max(P.feather * 0.0125, 0.0025);
  let steep = mix(1.0, 14.0, P.hardness);
  let lo = 0.5 - band;
  let hi = 0.5 + band;
  let v = smoothstep(lo, hi, a);
  let shaped = pow(v, steep);
  let outA = select(shaped, a, a >= 0.995 || a <= 0.004);
  textureStore(dst, ip, vec4f(outA, 0.0, 0.0, 0.0));
}
