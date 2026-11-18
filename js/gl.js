/* Hero: a raw WebGL2 fragment-shader "signal terrain" — a contour-line landscape
   seen in perspective, floor and ceiling, reacting to pointer and scroll.
   No libraries. Falls back to a CSS gradient when WebGL2 is unavailable. */
(function () {
  var canvas = document.getElementById('gl');
  if (!canvas) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!gl) { canvas.classList.add('gl-fallback'); window.BPGL = { setTheme: function () {} }; return; }

  var vs = '#version 300 es\nin vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var fs = '#version 300 es\nprecision highp float;\n' +
  'uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;uniform vec3 uAcc;uniform vec3 uBg;uniform float uScroll;uniform float uLight;\n' +
  'out vec4 o;\n' +
  'float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}\n' +
  'float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}\n' +
  'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(17.1,9.2);a*=.5;}return v;}\n' +
  'void main(){\n' +
  ' vec2 frag=gl_FragCoord.xy;vec2 uv=frag/uRes;vec2 p=(frag-.5*uRes)/uRes.y;\n' +
  ' float t=uTime*.18;\n' +
  ' float hz=(uMouse.y-.5)*.10-uScroll*.12;\n' +
  ' float d=abs(p.y-hz);\n' +
  ' float side=p.y<hz?0.:1.;\n' +
  ' float z=.22/max(d,.0015);\n' +
  ' vec2 w=vec2(p.x*z+uMouse.x*3.2,z*1.0+t*3.2+side*31.);\n' +
  ' float h=fbm(w*.30)+.35*fbm(w*.9+t);\n' +
  ' float v=h*13.;\n' +
  ' float g=abs(fract(v)-.5);\n' +
  ' float aa=fwidth(v)*1.2;\n' +
  ' float line=1.-smoothstep(0.,.07+aa,g);\n' +
  ' float major=1.-smoothstep(0.,.03+aa*.25,abs(fract(v/4.)-.5)*.25);\n' +
  ' float grid=1.-smoothstep(0.,.05+fwidth(w.x*.4)*1.5,abs(fract(w.x*.4)-.5)-.46);\n' +
  ' float fade=smoothstep(.0,.3,d);\n' +
  ' float depthFade=clamp(1.-z*.018,0.,1.);\n' +
  ' float k=(line*.55+major*.7+grid*.12)*fade*depthFade;\n' +
  ' vec3 col=uBg;\n' +
  ' vec3 ink=mix(uAcc,uAcc*.9,uLight);\n' +
  ' col+=ink*k*(.62+.2*h);\n' +
  ' float glow=exp(-abs(p.y-hz)*5.5);\n' +
  ' col+=ink*glow*.16;\n' +
  ' vec2 m=vec2((uMouse.x-.5)*uRes.x/uRes.y,uMouse.y-.5);\n' +
  ' col+=ink*exp(-length(p-m)*4.2)*.10;\n' +
  ' float vig=smoothstep(1.25,.25,length(p*vec2(.9,1.15)));\n' +
  ' col=mix(uBg,col,vig);\n' +
  ' col+=(hash(frag+uTime)-.5)*.018;\n' +
  ' o=vec4(col,1.);\n' +
  '}';

  function sh(type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  var v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
  if (!v || !f) { canvas.classList.add('gl-fallback'); window.BPGL = { setTheme: function () {} }; return; }
  var pr = gl.createProgram(); gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { canvas.classList.add('gl-fallback'); window.BPGL = { setTheme: function () {} }; return; }
  gl.useProgram(pr);
  var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var U = {}; ['uRes', 'uTime', 'uMouse', 'uAcc', 'uBg', 'uScroll', 'uLight'].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });

  var palettes = {
    dark:  { bg: [0.027, 0.031, 0.039], acc: [0.83, 1.0, 0.23], light: 0 },
    light: { bg: [0.937, 0.925, 0.894], acc: [0.12, 0.17, 1.0], light: 1 }
  };
  var pal = palettes[document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'];
  var mouse = { x: .5, y: .5, tx: .5, ty: .5 };
  var scroll = 0, visible = true, raf = 0, t0 = performance.now(), frozenT = 4.0;
  var dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  function resize() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    var s = (w * h * dpr * dpr > 2.2e6) ? .75 : 1;
    canvas.width = Math.max(2, Math.floor(w * dpr * s)); canvas.height = Math.max(2, Math.floor(h * dpr * s));
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  function draw(now) {
    mouse.x += (mouse.tx - mouse.x) * .05; mouse.y += (mouse.ty - mouse.y) * .05;
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform1f(U.uTime, reduce ? frozenT : (now - t0) / 1000);
    gl.uniform2f(U.uMouse, mouse.x, mouse.y);
    gl.uniform3fv(U.uAcc, pal.acc); gl.uniform3fv(U.uBg, pal.bg);
    gl.uniform1f(U.uScroll, scroll); gl.uniform1f(U.uLight, pal.light);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function loop(now) { raf = 0; if (!visible || document.hidden) return; draw(now); raf = requestAnimationFrame(loop); }
  function start() { if (!raf && !reduce) raf = requestAnimationFrame(loop); }

  window.addEventListener('resize', function () { resize(); if (reduce) draw(performance.now()); });
  window.addEventListener('pointermove', function (e) { mouse.tx = e.clientX / innerWidth; mouse.ty = 1 - e.clientY / innerHeight; }, { passive: true });
  window.addEventListener('scroll', function () { scroll = Math.min(1, scrollY / Math.max(1, innerHeight)); if (reduce) draw(performance.now()); }, { passive: true });
  document.addEventListener('visibilitychange', start);
  new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) start(); }).observe(canvas);

  resize(); draw(performance.now()); start();
  window.BPGL = { setTheme: function (n) { pal = palettes[n === 'light' ? 'light' : 'dark']; if (reduce) draw(performance.now()); } };
})();
