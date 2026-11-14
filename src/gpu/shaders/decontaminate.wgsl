// Export-time edge decontamination. Matte pixels with partial alpha still hold
// backdrop colour; against a new background they read as a halo. Pull those
// pixels toward the nearest strongly opaque subject colour, weighted by how
// transparent they are.
struct Params {
  radius: f32,
  pad: vec3f,
};

@group(0) @binding(0) var subjectTex: texture_2d<f32>;
@group(0) @binding(1) var matteTex: texture_2d<f32>;
@group(0) @binding(2) var outTex: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(3) var<uniform> P: Params;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let ip = vec2i(gid.xy);
  let size = vec2i(textureDimensions(subjectTex));
  if (ip.x >= size.x || ip.y >= size.y) { return; }
  let c = textureLoad(subjectTex, ip, 0).rgb;
  let a = textureLoad(matteTex, ip, 0).r;
  if (a <= 0.002) {
    textureStore(outTex, ip, vec4f(0.0, 0.0, 0.0, 0.0));
    return;
  }
  var col = c;
  if (a < 0.92) {
    let r = i32(round(P.radius));
    var acc = vec3f(0.0);
    var wsum = 0.0;
    for (var dy = -r; dy <= r; dy++) {
      for (var dx = -r; dx <= r; dx++) {
        let q = clamp(ip + vec2i(dx, dy), vec2i(0), size - vec2i(1));
        let qa = textureLoad(matteTex, q, 0).r;
        if (qa < 0.8) { continue; }
        let w = qa * qa;
        acc += textureLoad(subjectTex, q, 0).rgb * w;
        wsum += w;
      }
    }
    if (wsum > 0.0001) {
      let core = acc / wsum;
      col = mix(core, c, smoothstep(0.2, 0.92, a));
    }
  }
  textureStore(outTex, ip, vec4f(col, a));
}
