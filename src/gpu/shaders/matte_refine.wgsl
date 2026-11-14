// Matte pass 2: edge convergence.
//  * Weighted 5x5 average suppresses sensor noise before anything else.
//  * Where the neighbourhood shows real contrast (a silhouette boundary),
//    the rim is pulled outward to the strongest local alpha. That recovers
//    thin handles, spokes and cable runs a pure colour-distance matte drops.
//  * Mid-alpha pixels sitting in an otherwise empty neighbourhood are
//    trimmed: those are the isolated specks a backdrop estimate leaks.
struct Params {
  texel: vec2f,
  edgeSnap: f32,   // 0..1 how aggressively the rim is pulled outward
  pad: f32,
  pad2: vec2f,
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

  var mx = 0.0;
  var mn = 1.0;
  var sum = 0.0;
  for (var dy = -2; dy <= 2; dy++) {
    for (var dx = -2; dx <= 2; dx++) {
      let v = at(ip + vec2i(dx, dy));
      mx = max(mx, v);
      mn = min(mn, v);
      sum += v;
    }
  }
  let avg = sum / 25.0;
  let contrast = mx - mn;
  let smoothed = mix(a, avg, 0.45);

  // Outward convergence is gated by local contrast so flat interior regions
  // and empty backdrop never drift.
  let pull = mix(smoothed, max(smoothed, mx * 0.98), P.edgeSnap * smoothstep(0.12, 0.6, contrast));

  var outA = pull;
  if (contrast < 0.35 && avg < 0.45) {
    // Lone mid-alpha pixel in a nearly empty area: fade it out.
    outA = pull * smoothstep(0.04, 0.30, avg);
  }
  // A weak alpha that is not supported by *any* neighbour is a leftover rim of
  // the sweep's contact shadow, not part of the product. The distance pass
  // already rejects the smooth core of that shadow, so what survives here is
  // only its faint outer edge; require the local maximum to back the pixel.
  if (a < 0.85 && mx < max(0.72, a + 0.10)) {
    outA = outA * smoothstep(0.0, 0.55, mx);
  }

  // Opening by local mass. Scattered "subject" specks around a cast shadow have
  // strong local contrast but almost no local mass, and a thin anti-aliased
  // rim has neighbouring empty pixels on both sides. A genuine thin structure
  // (a cane shaft, a spoke, a wire bail) is supported along its whole length,
  // so a wide 9x9 mean stays well above zero. This is what turns a dotted
  // shadow rim into clean backdrop without eating the product's fine parts.
  var wide = 0.0;
  for (var wy = -4; wy <= 4; wy += 4) {
    for (var wx = -4; wx <= 4; wx += 4) {
      wide += at(ip + vec2i(wx, wy));
    }
  }
  wide /= 9.0;
  if (wide < 0.42) {
    outA = outA * smoothstep(0.08, 0.42, wide);
  }

  // A crisp thin loop -- the anti-aliased edge of a contact shadow on a light
  // sweep -- passes both the contrast and the mass tests, because its own
  // neighbours along the loop are opaque. What distinguishes it from a real
  // part is that the interior of the loop is empty: a ring whose centre is
  // background is a hole in the product at best, and a shadow rim at worst.
  if (outA > 0.5) {
    let ringIn = at(ip + vec2i(3, 0)) + at(ip + vec2i(-3, 0)) + at(ip + vec2i(0, 3)) + at(ip + vec2i(0, -3));
    let ringOut = at(ip + vec2i(9, 0)) + at(ip + vec2i(-9, 0)) + at(ip + vec2i(0, 9)) + at(ip + vec2i(0, -9));
    // A cane shaft also has empty pixels 3px to either side, but it has opaque
    // product *along* its own axis. Require the ring to be empty in the axial
    // directions too: a ring has no axis, a shaft does.
    let axial = max(
      max(at(ip + vec2i(0, 2)) * at(ip + vec2i(0, 5)), at(ip + vec2i(2, 0)) * at(ip + vec2i(5, 0))),
      max(at(ip + vec2i(0, -2)) * at(ip + vec2i(0, -5)), at(ip + vec2i(-2, 0)) * at(ip + vec2i(-5, 0)),
    ));
    if (ringIn < 0.6 && ringOut < 0.6 && axial < 0.5) {
      outA = outA * smoothstep(0.0, 0.35, max(ringIn, ringOut));
    }
  }
  textureStore(dst, ip, vec4f(clamp(outA, 0.0, 1.0), 0.0, 0.0, 0.0));
}
