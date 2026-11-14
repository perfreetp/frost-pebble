// 客户预览单文件查看器源码：纯浏览器 JS（无外部依赖），以字符串形式内嵌进导出 HTML。
// 注意：本文件导出的是脚本文本，内部禁止使用反引号。
export const clientViewerSource = `
(function () {
  var canvas = document.getElementById('stage');
  var gl = canvas.getContext('webgl2', { antialias: false, alpha: false });
  if (!gl) {
    canvas.outerHTML = '<p style="color:#fff;padding:20px">当前浏览器不支持 WebGL2，请使用新版 Chrome / Edge 打开本文件。</p>';
    return;
  }
  gl.getExtension('EXT_color_buffer_float');

  var SCENE_VS = [
    '#version 300 es',
    'precision highp float;',
    'layout(location=0) in vec2 aPos;',
    'layout(location=1) in vec3 aColor;',
    'layout(location=2) in float aAlpha;',
    'uniform vec2 uVP; uniform vec2 uCam;',
    'out vec3 vColor; out float vA;',
    'void main(){ vec2 n=(aPos-uCam)/(uVP*0.5); gl_Position=vec4(n,0.0,1.0); vColor=aColor; vA=aAlpha; }'
  ].join('\\n');
  var SCENE_FS = [
    '#version 300 es',
    'precision highp float; in vec3 vColor; in float vA; out vec4 o;',
    'void main(){ o=vec4(vColor*vA,vA); }'
  ].join('\\n');
  var FS_VS = [
    '#version 300 es',
    'precision highp float; out vec2 vUv;',
    'void main(){ vec2 p=vec2((gl_VertexID==2)?3.0:-1.0,(gl_VertexID==1)?3.0:-1.0); vUv=p*0.5+0.5; gl_Position=vec4(p,0.0,1.0); }'
  ].join('\\n');
  var THRESH = [
    '#version 300 es',
    'precision highp float; in vec2 vUv; uniform sampler2D uT; uniform float uK; out vec4 o;',
    'void main(){ vec3 c=texture(uT,vUv).rgb; float l=max(max(c.r,c.g),c.b); o=vec4(c*smoothstep(uK,uK+0.6,l),1.0); }'
  ].join('\\n');
  var BLUR = [
    '#version 300 es',
    'precision highp float; in vec2 vUv; uniform sampler2D uT; uniform vec2 uTx; uniform vec2 uD; uniform float uR; out vec4 o;',
    'void main(){ float sp=mix(1.0,4.0,uR); vec3 s=texture(uT,vUv).rgb*0.227027; float t=0.227027;',
    'for(int i=1;i<=6;i++){ float fi=float(i); float w=0.227027*exp(-fi*fi/18.0); vec2 of=uTx*uD*fi*sp;',
    's+=texture(uT,vUv+of).rgb*w+texture(uT,vUv-of).rgb*w; t+=w*2.0;} o=vec4(s/t,1.0); }'
  ].join('\\n');
  var COMP = [
    '#version 300 es',
    'precision highp float; in vec2 vUv; uniform sampler2D uS; uniform sampler2D uB; uniform float uI; out vec4 o;',
    'vec3 aces(vec3 x){const float a=2.51,b=0.03,c=2.43,d=0.59,e=0.14;return clamp((x*(a*x+b))/(x*(c*x+d)+e),0.0,1.0);}',
    'void main(){ vec3 h=texture(uS,vUv).rgb+texture(uB,vUv).rgb*uI; o=vec4(pow(max(aces(h),vec3(0.0)),vec3(1.0/2.2)),1.0); }'
  ].join('\\n');

  function sh(type, src) {
    var o = gl.createShader(type);
    gl.shaderSource(o, src); gl.compileShader(o);
    if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o));
    return o;
  }
  function pg(vs, fs) {
    var p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    return p;
  }
  function loc(p, ns) {
    var out = {};
    for (var i = 0; i < ns.length; i++) out[ns[i]] = gl.getUniformLocation(p, ns[i]);
    return out;
  }
  var pScene = pg(SCENE_VS, SCENE_FS);
  var pThr = pg(FS_VS, THRESH);
  var pBlur = pg(FS_VS, BLUR);
  var pComp = pg(FS_VS, COMP);
  var uS = loc(pScene, ['uVP', 'uCam']);
  var uT = loc(pThr, ['uT', 'uK']);
  var uB = loc(pBlur, ['uT', 'uTx', 'uD', 'uR']);
  var uC = loc(pComp, ['uS', 'uB', 'uI']);
  var vao = gl.createVertexArray();
  var vbo = gl.createBuffer();
  var evao = gl.createVertexArray();

  function fbo(w, h) {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    var f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    return { f: f, t: t, w: w, h: h };
  }
  var sceneF = null, bloomA = null, bloomB = null, W = 2, H = 2;
  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(2, Math.floor(canvas.clientWidth * dpr));
    var h = Math.max(2, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width === w) return;
    canvas.width = W = w; canvas.height = H = h;
    var old = [sceneF, bloomA, bloomB];
    for (var i = 0; i < old.length; i++) if (old[i]) { gl.deleteFramebuffer(old[i].f); gl.deleteTexture(old[i].t); }
    sceneF = fbo(w, h);
    bloomA = fbo(w >> 1, h >> 1);
    bloomB = fbo(w >> 1, h >> 1);
  }

  function srgb(c) {
    var s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }
  function sub(a, b) { return { x: a.x - b.x, y: a.y - b.y }; }
  function add(a, b) { return { x: a.x + b.x, y: a.y + b.y }; }
  function mul(a, s) { return { x: a.x * s, y: a.y * s }; }
  function dot(a, b) { return a.x * b.x + a.y * b.y; }
  function d(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function nm(a) { var l = Math.hypot(a.x, a.y) || 1; return { x: a.x / l, y: a.y / l }; }
  function lp(a, b, t) { return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; }

  // 折线路径圆弧采样（与主应用同规则）
  function sample(el) {
    var pts = el.points, out = [pts[0]];
    for (var i = 1; i < pts.length - 1; i++) {
      var prev = pts[i - 1], cur = pts[i], next = pts[i + 1];
      var u1 = nm(sub(prev, cur)), u2 = nm(sub(next, cur));
      var theta = Math.acos(Math.max(-1, Math.min(1, dot(u1, u2))));
      var maxR = Math.min(d(cur, prev), d(cur, next)) * 0.98 * Math.tan(theta / 2);
      var r = Math.min(el.cornerRadii[i - 1] || 0, maxR);
      if (r <= 0 || theta < 1e-3) { out.push(cur); continue; }
      var dd = r / Math.tan(theta / 2);
      var p1 = add(cur, mul(u1, dd)), p2 = add(cur, mul(u2, dd));
      for (var k = 1; k <= 8; k++) out.push(lp(p1, p2, k / 8));
    }
    out.push(pts[pts.length - 1]);
    return out;
  }

  function ribbon(points, dia, col, col2, dual) {
    var hw = dia / 2, v = [];
    function push(p, c) {
      v.push(p.x, p.y, srgb(c.r) * 2.6, srgb(c.g) * 2.6, srgb(c.b) * 2.6, 1);
    }
    var acc = 0, cum = [0];
    for (var i = 1; i < points.length; i++) {
      acc += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
      cum.push(acc);
    }
    var Ls = [], Rs = [];
    for (var j = 0; j < points.length; j++) {
      var a = points[Math.max(0, j - 1)], b = points[Math.min(points.length - 1, j + 1)];
      var dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
      dx /= l; dy /= l;
      Ls.push({ x: points[j].x - dy * hw, y: points[j].y + dx * hw });
      Rs.push({ x: points[j].x + dy * hw, y: points[j].y - dx * hw });
    }
    for (var m = 0; m < points.length - 1; m++) {
      var use2 = col2 && Math.floor(cum[m] / Math.max(1, dual)) % 2 === 1;
      var c = use2 ? col2 : col;
      push(Ls[m], c); push(Rs[m], c); push(Ls[m + 1], c);
      push(Rs[m], c); push(Rs[m + 1], c); push(Ls[m + 1], c);
    }
    return new Float32Array(v);
  }

  function wallVerts(w, h, env) {
    var c = env.wallColor, lv = env.ambientLevel;
    function f(x) { return Math.pow(x, 2.2) * lv; }
    var r = f(c.r), g = f(c.g), b = f(c.b);
    return new Float32Array([
      0, 0, r, g, b, 1, w, 0, r, g, b, 1, w, h, r, g, b, 1,
      0, 0, r, g, b, 1, w, h, r, g, b, 1, 0, h, r, g, b, 1
    ]);
  }

  var cam = { x: PROJECT.wall.width / 2, y: PROJECT.wall.height / 2, vw: PROJECT.wall.width * 1.05 };
  var allVerts = [];
  for (var ei = 0; ei < PROJECT.elements.length; ei++) {
    var el = PROJECT.elements[ei];
    if (el.kind === 'acrylic') {
      for (var ri = 0; ri < el.contours.length; ri++) {
        var closed = el.contours[ri].concat([el.contours[ri][0]]);
        var rb = ribbon(closed, el.strokeWidth, el.color, null, 0);
        for (var z = 0; z < rb.length; z++) allVerts.push(rb[z]);
      }
    } else {
      var tb = ribbon(sample(el), el.diameter, el.color, el.color2, el.dualPeriod || 300);
      for (var z2 = 0; z2 < tb.length; z2++) allVerts.push(tb[z2]);
    }
  }
  var tubeData = new Float32Array(allVerts);

  function upload(data) {
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 8);
    gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 24, 20);
  }

  var photoTex = null;
  if (PROJECT.wall.photo) {
    var img = new Image();
    img.onload = function () {
      photoTex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, photoTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      draw();
    };
    img.src = PROJECT.wall.photo;
  }

  function draw() {
    resize();
    var env = ENVIRONMENTS[PROJECT.environment];
    var vh = cam.vw / (W / H);
    gl.bindFramebuffer(gl.FRAMEBUFFER, sceneF.f);
    gl.viewport(0, 0, W, H);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.BLEND);
    gl.useProgram(pScene);
    gl.uniform2f(uS.uVP, cam.vw, vh);
    gl.uniform2f(uS.uCam, cam.x, cam.y);
    var wd = wallVerts(PROJECT.wall.width, PROJECT.wall.height, env);
    upload(wd);
    gl.drawArrays(gl.TRIANGLES, 0, wd.length / 6);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    upload(tubeData);
    gl.drawArrays(gl.TRIANGLES, 0, tubeData.length / 6);
    gl.disable(gl.BLEND);

    gl.bindVertexArray(evao);
    gl.useProgram(pThr);
    gl.bindFramebuffer(gl.FRAMEBUFFER, bloomA.f);
    gl.viewport(0, 0, bloomA.w, bloomA.h);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sceneF.t);
    gl.uniform1i(uT.uT, 0);
    gl.uniform1f(uT.uK, 1.0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.useProgram(pBlur);
    gl.uniform1f(uB.uR, PROJECT.bloom.radius);
    for (var it = 0; it < 2; it++) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, bloomB.f);
      gl.bindTexture(gl.TEXTURE_2D, bloomA.t);
      gl.uniform1i(uB.uT, 0);
      gl.uniform2f(uB.uTx, 1 / bloomA.w, 1 / bloomA.h);
      gl.uniform2f(uB.uD, 1, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindFramebuffer(gl.FRAMEBUFFER, bloomA.f);
      gl.bindTexture(gl.TEXTURE_2D, bloomB.t);
      gl.uniform2f(uB.uTx, 1 / bloomB.w, 1 / bloomB.h);
      gl.uniform2f(uB.uD, 0, 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, W, H);
    gl.useProgram(pComp);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sceneF.t);
    gl.uniform1i(uC.uS, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, bloomA.t);
    gl.uniform1i(uC.uB, 1);
    gl.uniform1f(uC.uI, PROJECT.bloom.intensity);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  var btns = document.querySelectorAll('[data-env]');
  for (var bi = 0; bi < btns.length; bi++) {
    btns[bi].addEventListener('click', function () {
      PROJECT.environment = this.dataset.env;
      for (var k = 0; k < btns.length; k++) btns[k].classList.toggle('active', btns[k] === this);
      draw();
    });
  }
  document.getElementById('bloom').addEventListener('input', function (e) {
    PROJECT.bloom.intensity = +e.target.value; draw();
  });
  document.getElementById('radius').addEventListener('input', function (e) {
    PROJECT.bloom.radius = +e.target.value; draw();
  });
  canvas.addEventListener('wheel', function (e) {
    e.preventDefault();
    cam.vw = Math.max(200, Math.min(20000, cam.vw * (e.deltaY > 0 ? 1.12 : 1 / 1.12)));
    draw();
  }, { passive: false });
  var pan = null;
  canvas.addEventListener('pointerdown', function (e) {
    pan = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', function (e) {
    if (!pan) return;
    var k = cam.vw / canvas.clientWidth;
    cam.x = pan.cx - (e.clientX - pan.x) * k;
    cam.y = pan.cy + (e.clientY - pan.y) * k;
    draw();
  });
  canvas.addEventListener('pointerup', function () { pan = null; });
  window.addEventListener('resize', draw);
  draw();
})();
`;
