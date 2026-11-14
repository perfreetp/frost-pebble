// Pass B: given the dominant border bin, walk the image with a stride chosen
// on the CPU so that the u32 accumulators cannot overflow, then measure the
// mean and per-channel spread of pixels belonging to that bin. The spread
// feeds the adaptive tolerance floor in matte_distance.
struct Params {
  width: u32,
  height: u32,
  binR: u32,
  binG: u32,
  binB: u32,
  step: u32,
  pad0: u32,
  pad1: u32,
};

@group(0) @binding(0) var src: texture_2d<f32>;
@group(0) @binding(1) var<storage, read_write> acc: array<atomic<u32>, 16>;
@group(0) @binding(2) var<uniform> P: Params;

fn binOf(v: f32) -> u32 {
  return u32(clamp(v, 0.0, 1.0) * 15.0 + 0.5);
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let px = gid.x * P.step;
  let py = gid.y * P.step;
  if (px >= P.width || py >= P.height) { return; }
  let c = textureLoad(src, vec2i(i32(px), i32(py)), 0).rgb;

  // Include the dominant bin and its immediate neighbours so that a slightly
  // banded backdrop still contributes to the measured mean.
  if (abs(i32(binOf(c.r)) - i32(P.binR)) > 1) { return; }
  if (abs(i32(binOf(c.g)) - i32(P.binG)) > 1) { return; }
  if (abs(i32(binOf(c.b)) - i32(P.binB)) > 1) { return; }

  // 8-bit fixed point for the mean, v^2 >> 4 for the second moment: both fit
  // comfortably in u32 for the ~60k samples the CPU stride allows.
  let r = u32(clamp(c.r, 0.0, 1.0) * 255.0 + 0.5);
  let g = u32(clamp(c.g, 0.0, 1.0) * 255.0 + 0.5);
  let b = u32(clamp(c.b, 0.0, 1.0) * 255.0 + 0.5);
  atomicAdd(&acc[0], r);
  atomicAdd(&acc[1], g);
  atomicAdd(&acc[2], b);
  atomicAdd(&acc[3], 1u);
  atomicAdd(&acc[4], (r * r) >> 4u);
  atomicAdd(&acc[5], (g * g) >> 4u);
  atomicAdd(&acc[6], (b * b) >> 4u);
}
