// Preview / export composite. One shader serves four display modes so the
// workbench can flip between them without rebuilding pipelines.
//
//   mode 0 = matte on a checkerboard (transparent-background view)
//   mode 1 = original with the discarded region tinted magenta (mask check)
//   mode 2 = catalogue composite (backdrop + shadow + colour balance)
//   mode 3 = original, untouched (hold-to-compare)
//
// Bindings
//   0 subject RGBA
//   1 shaped matte rgba16float (alpha in .r)
//   2 background RGBA
//   3 blurred shadow rgba16float
//   4 output rgba8unorm storage
//   5 uniform
struct Params {
  subject: vec4f,   // gains.xyz, opacity
  bg: vec4f,        // scale, offsetX, offsetY, enabled
  shadow: vec4f,    // dirX, dirY, softness01, opacity
  canvas: vec4f,    // outW, outH, inset, mode
  tint: vec4f,      // shadow tint rgb, contrast
};

@group(0) @binding(0) var subjectTex: texture_2d<f32>;
@group(0) @binding(1) var matteTex: texture_2d<f32>;
@group(0) @binding(2) var bgTex: texture_2d<f32>;
@group(0) @binding(3) var shadowTex: texture_2d<f32>;
@group(0) @binding(4) var outTex: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(5) var<uniform> P: Params;

fn loadClamped(t: texture_2d<f32>, uv: vec2f) -> vec4f {
  let sz = vec2f(textureDimensions(t));
  return textureLoad(t, vec2i(clamp(uv * sz, vec2f(0.0), sz - 1.0)), 0);
}

fn checker(uv: vec2f) -> vec3f {
  let cell = floor(uv * 34.0);
  let odd = (cell.x + cell.y) % 2.0;
  let base = mix(0.60, 0.70, odd);
  return vec3f(base);
}

fn balanceToScene(c: vec3f) -> vec3f {
  // Gentle contrast curve keeps powder-coated metal from looking milky without
  // clipping white plastic at the specular.
  let cc = clamp(c, vec3f(0.0), vec3f(1.0));
  return clamp(mix(cc, cc * cc * (3.0 - 2.0 * cc), P.tint.w), vec3f(0.0), vec3f(1.0));
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let outSize = vec2u(textureDimensions(outTex));
  if (gid.x >= outSize.x || gid.y >= outSize.y) { return; }
  let uv = (vec2f(f32(gid.x), f32(gid.y)) + 0.5) / vec2f(outSize);

  // Subject is fitted into the export frame with an even margin. Clip regions
  // (the alpha ramp at the very edge) stay out of the visible frame.
  let inset = select(0.0, P.canvas.z, P.canvas.w > 1.5);
  let sUv = (uv - vec2f(inset)) / (1.0 - inset * 2.0);
  let inside = sUv.x >= 0.0 && sUv.x <= 1.0 && sUv.y >= 0.0 && sUv.y <= 1.0;
  let alpha = select(0.0, loadClamped(matteTex, sUv).r, inside);
  let scol = loadClamped(subjectTex, sUv).rgb;

  let mode = P.canvas.w;

  var bgc = vec3f(0.90, 0.91, 0.93);
  if (P.bg.w > 0.5) {
    let bUv = (uv - 0.5) / max(P.bg.x, 0.2) + 0.5 + vec2f(P.bg.y, P.bg.z);
    bgc = loadClamped(bgTex, bUv).rgb;
  }

  var shadow = 0.0;
  if (P.shadow.w > 0.001) {
    let off = P.shadow.xy * 0.045;
    let shUv = (uv - off - vec2f(inset)) / (1.0 - inset * 2.0);
    let castS = loadClamped(shadowTex, shUv).r;
    let contact = loadClamped(shadowTex, sUv).r;
    shadow = max(castS, contact * 0.42) * P.shadow.w;
  }

  let corrected = balanceToScene(clamp(scol * P.subject.xyz, vec3f(0.0), vec3f(1.0)));

  var color: vec3f;
  if (mode < 0.5) {
    // Matte on checkerboard: the artist judges the contour rather than the scene.
    let b = checker(uv);
    color = mix(b, balanceToScene(scol), alpha);
  } else if (mode < 1.5) {
    // Original with the discarded area tinted: classic rubylith mask check.
    let removed = vec3f(0.85, 0.10, 0.45);
    color = mix(scol, mix(scol, removed, 0.62), 1.0 - smoothstep(0.05, 0.95, alpha));
  } else if (mode < 2.5) {
    let litBg = bgc * (vec3f(1.0) - P.tint.rgb * shadow * 2.4) + bgc * 0.06;
    color = mix(litBg, corrected, alpha * P.subject.w);
    color = balanceToScene(color);
  } else {
    color = balanceToScene(scol);
  }

  textureStore(outTex, vec2i(gid.xy), vec4f(clamp(color, vec3f(0.0), vec3f(1.0)), 1.0));
}
