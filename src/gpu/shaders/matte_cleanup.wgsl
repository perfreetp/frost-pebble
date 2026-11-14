// Matte pass 3: enclosed hole filling and speckle removal.
// White plastic on a white sweep is the classic rehab-equipment case: the
// colour-distance matte leaves transparent pockets inside a solid product.
// This pass looks at a ring at radius 3 and decides whether a transparent
// pixel is enclosed by the subject (hole) or floating free (background).
struct Params {
  texel: vec2f,
  holeFill: f32,   // 0..1
  speckle: f32,    // 0..1
  radius: f32,     // ring radius in texels
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
  let r = i32(round(P.radius));

  var ring = 0.0;
  var n = 0.0;
  let dirs = array<vec2i, 16>(
    vec2i(1, 0), vec2i(1, 1), vec2i(0, 1), vec2i(-1, 1),
    vec2i(-1, 0), vec2i(-1, -1), vec2i(0, -1), vec2i(1, -1),
    vec2i(2, 0), vec2i(2, 1), vec2i(0, 2), vec2i(-1, 2),
    vec2i(-2, 0), vec2i(-2, -1), vec2i(0, -2), vec2i(1, -2),
  );
  for (var k = 0u; k < 16u; k++) {
    let d = dirs[k];
    let off = vec2i(i32(f32(d.x) / 2.0 * f32(r)), i32(f32(d.y) / 2.0 * f32(r)));
    if (off.x == 0 && off.y == 0) { continue; }
    ring += at(ip + off);
    n += 1.0;
  }
  ring /= max(n, 1.0);

  // Enclosure needs agreement in *every* direction: a hard hole inside white
  // plastic has opaque neighbours all around, while the soft shadow beside a
  // white product has empty neighbours on its outer half. Counting the
  // minimum ring sample instead of the mean keeps the pass from growing the
  // product body outward into its own cast shadow.
  var ringMin = 1.0;
  for (var k = 0u; k < 16u; k++) {
    let d = dirs[k];
    let off = vec2i(i32(f32(d.x) / 2.0 * f32(r)), i32(f32(d.y) / 2.0 * f32(r)));
    if (off.x == 0 && off.y == 0) { continue; }
    ringMin = min(ringMin, at(ip + off));
  }

  var outA = a;
  if (a < 0.55 && ringMin > 0.85) {
    outA = mix(a, 1.0, P.holeFill * smoothstep(0.85, 0.99, ringMin));
  }
  if (a > 0.45 && ring < 0.18) {
    outA = mix(a, 0.0, P.speckle * smoothstep(0.18, 0.02, ring));
  }
  textureStore(dst, ip, vec4f(clamp(outA, 0.0, 1.0), 0.0, 0.0, 0.0));
}
