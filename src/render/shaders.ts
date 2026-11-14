// GLSL 着色器：HDR 场景、泛光提取、高斯模糊、合成（WebGL2 / GLSL ES 3.00）

// 通用 2D 世界坐标 VS（灯管丝带、实心三角、墙面）
export const SCENE_VS = `#version 300 es
precision highp float;
layout(location=0) in vec2 aPos;
layout(location=1) in vec3 aColor;
layout(location=2) in float aAlpha;
uniform vec2 uViewport;
uniform vec2 uCamCenter;
out vec3 vColor;
out float vAlpha;
void main() {
  vec2 ndc = (aPos - uCamCenter) / (uViewport * 0.5);
  gl_Position = vec4(ndc, 0.0, 1.0);
  vColor = aColor;
  vAlpha = aAlpha;
}`;

export const SCENE_FS = `#version 300 es
precision highp float;
in vec3 vColor;
in float vAlpha;
out vec4 outColor;
void main() {
  outColor = vec4(vColor * vAlpha, vAlpha);
}`;

export const PHOTO_VS = `#version 300 es
precision highp float;
layout(location=0) in vec2 aPos;
layout(location=1) in vec2 aUv;
uniform vec2 uCamCenter;
uniform vec2 uViewport;
out vec2 vUv;
void main() {
  vec2 ndc = (aPos - uCamCenter) / (uViewport * 0.5);
  gl_Position = vec4(ndc, 0.0, 1.0);
  vUv = aUv;
}`;

export const PHOTO_FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uPhoto;
uniform float uDim;
out vec4 outColor;
void main() {
  vec3 c = texture(uPhoto, vUv).rgb;
  outColor = vec4(c * uDim, 1.0);
}`;

// 全屏幕三角形（无 VBO，gl_VertexID 生成）
export const FULLSCREEN_VS = `#version 300 es
precision highp float;
out vec2 vUv;
void main() {
  vec2 p = vec2((gl_VertexID == 2) ? 3.0 : -1.0, (gl_VertexID == 1) ? 3.0 : -1.0);
  vUv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

export const THRESHOLD_FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTex;
uniform float uThreshold;
out vec4 outColor;
void main() {
  vec3 c = texture(uTex, vUv).rgb;
  float l = max(max(c.r, c.g), c.b);
  float k = smoothstep(uThreshold, uThreshold + 0.6, l);
  outColor = vec4(c * k, 1.0);
}`;

export const BLUR_FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uTexel;
uniform vec2 uDir;
uniform float uRadius;
out vec4 outColor;
void main() {
  float spread = mix(1.0, 4.0, uRadius);
  vec3 sum = texture(uTex, vUv).rgb * 0.227027;
  float total = 0.227027;
  for (int i = 1; i <= 6; i++) {
    float fi = float(i);
    float w = 0.227027 * exp(-fi * fi / 18.0);
    vec2 off = uTexel * uDir * fi * spread;
    sum += texture(uTex, vUv + off).rgb * w;
    sum += texture(uTex, vUv - off).rgb * w;
    total += w * 2.0;
  }
  outColor = vec4(sum / total, 1.0);
}`;

export const COMPOSITE_FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uScene;
uniform sampler2D uBloom;
uniform float uBloomIntensity;
out vec4 outColor;

vec3 aces(vec3 x) {
  const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}
vec3 gammaCorrect(vec3 c) { return pow(max(c, vec3(0.0)), vec3(1.0 / 2.2)); }

void main() {
  vec3 scene = texture(uScene, vUv).rgb;
  vec3 bloom = texture(uBloom, vUv).rgb;
  vec3 hdr = scene + bloom * uBloomIntensity;
  outColor = vec4(gammaCorrect(aces(hdr)), 1.0);
}`;
