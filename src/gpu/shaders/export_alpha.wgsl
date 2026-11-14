// Transparent-PNG export. Straight (non-premultiplied) alpha, edge
// decontaminated against the subject's own core colour so no backdrop tint is
// baked into the cut-out.
struct Params {
  gains: vec4f,   // rgb = subject colour-balance gains, w = unused
};

@group(0) @binding(0) var subjectTex: texture_2d<f32>;
@group(0) @binding(1) var matteTex: texture_2d<f32>;
@group(0) @binding(2) var outTex: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(3) var<uniform> P: Params;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let size = vec2i(textureDimensions(subjectTex));
  if (gid.x >= u32(size.x) || gid.y >= u32(size.y)) { return; }
  let ip = vec2i(gid.xy);
  let c = textureLoad(subjectTex, ip, 0).rgb;
  let a = textureLoad(matteTex, ip, 0).r;
  let outC = clamp(c * P.gains.xyz, vec3f(0.0), vec3f(1.0));
  textureStore(outTex, ip, vec4f(outC, a));
}
