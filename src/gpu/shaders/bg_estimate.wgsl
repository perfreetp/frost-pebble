// Pass A of background estimation: quantise border-ring colours into a
// 16x16x16 histogram with atomics. CPU reads the 4096 counters back and
// picks the dominant bin; Pass B (bg_refine) then measures its true mean
// and spread.
struct Params {
  width: u32,
  height: u32,
  border: u32,
  pad: u32,
};

@group(0) @binding(0) var src: texture_2d<f32>;
@group(0) @binding(1) var<storage, read_write> hist: array<atomic<u32>>;
@group(0) @binding(2) var<uniform> P: Params;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  if (gid.x >= P.width || gid.y >= P.height) { return; }
  let onBorder = gid.x < P.border || gid.y < P.border
    || gid.x >= P.width - P.border || gid.y >= P.height - P.border;
  if (!onBorder) { return; }
  let c = textureLoad(src, vec2i(gid.xy), 0).rgb;
  let q = vec3u(clamp(c * 15.0 + 0.5, vec3f(0.0), vec3f(15.0)));
  let idx = q.x * 256u + q.y * 16u + q.z;
  atomicAdd(&hist[idx], 1u);
}
