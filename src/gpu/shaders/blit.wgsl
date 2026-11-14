// Fullscreen blit used to present the computed texture on a canvas. A render
// pass is the portable way to get a storage-written texture onto a
// GPUCanvasContext: WebGPU does not allow a canvas texture as a compute
// storage target on every backend.

struct VSOut {
  @builtin(position) pos: vec4f,
  @location(0) uv: vec2f,
};

@vertex
fn vs(@builtin(vertex_index) idx: u32) -> VSOut {
  // Oversized triangle covering the viewport.
  var p = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  var out: VSOut;
  out.pos = vec4f(p[idx], 0.0, 1.0);
  out.uv = vec2f((p[idx].x + 1.0) * 0.5, 1.0 - (p[idx].y + 1.0) * 0.5);
  return out;
}

@group(0) @binding(0) var src: texture_2d<f32>;
@group(0) @binding(1) var samp: sampler;

@fragment
fn fs(in: VSOut) -> @location(0) vec4f {
  return textureSample(src, samp, in.uv);
}
