/* Index of works: a wall of project names, at the foot of the home page. Type only, no pictures.
   The wall is even, and swells like a lens at the cursor: the letters under it grow and take their project's
   colour, and settle back as it moves away, left, right, up or down. The row under the cursor drifts; the others
   hardly do. With no cursor (and on touch screens) a gentler swell wanders about by itself.
   Nothing opens on hover, and the page arriving under a resting cursor does nothing: only moving the mouse counts.

   The type is drawn once into textures and bent on one WebGL canvas, kept and reused between visits to the page.
   The rows themselves are ordinary links. With reduced motion, or no WebGL 2, it is a still list. */
(() => {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const SWELL = 1.15;                  // how much the type grows at the cursor (0 is not at all)
  const ROWS = .95, WIDE = .2;         // how far the swell reaches: rows up and down, and share of the width left and right
  const FOLLOW = 2.2;                  // how quickly it follows the cursor (higher is quicker)
  const FAST = 16, REST = 3;           // px a second: the row under the cursor, and the rows furthest from it
  const CALM = .7, LAP = 46;           // left alone: how strong the swell is, and seconds for one wander
  const TH = 320, GAP1 = 22, GAP2 = 58, COL = 6;
  const FAM = '"Bricolage", "Helvetica Neue", Arial, sans-serif', ITAL = '"Fraunces", Georgia, serif';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v)), mix = (a, b, t) => a + (b - a) * t;
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  let list = [], cameFrom = false, G = null;

  function render(projects, link) {
    list = projects.slice();
    return `<section class="iw" aria-label="Index of works"><h2>Index of works</h2>
      <div class="iw-wall"><canvas class="iw-cv" aria-hidden="true"></canvas>
      <ol>${list.map((p) => `<li><a class="iw-row" href="${link(p)}" data-slug="${esc(p.slug)}"><span>${esc(p.title)}, ${esc(parseInt(p.year, 10))}</span></a></li>`).join("")}</ol></div></section>`;
  }

  /* ---------- type ---------- */
  const big = (c, px) => { c.font = `800 ${px.toFixed(2)}px ${FAM}`; if ("letterSpacing" in c) c.letterSpacing = (-.04 * px).toFixed(2) + "px"; };
  const ital = (c, px) => { c.font = `italic 300 ${px.toFixed(2)}px ${ITAL}`; if ("letterSpacing" in c) c.letterSpacing = (-.02 * px).toFixed(2) + "px"; };
  /* widths for a row 100 tall, whose caps and figures are 70 high */
  function metrics() {
    const c = document.createElement("canvas").getContext("2d");
    big(c, 100); const cap = (c.measureText("H").actualBoundingBoxAscent || 72) / 100; ital(c, 100); const icap = (c.measureText("2").actualBoundingBoxAscent || 70) / 100;
    return list.map((p) => {
      const name = p.title.toUpperCase(), year = String(parseInt(p.year, 10));
      big(c, 70 / cap); const w1 = c.measureText(name).width; ital(c, 70 / icap); const w2 = c.measureText(year).width;
      return { name, year, w1, w2, cap, icap, period: w1 + GAP1 + w2 + GAP2 };
    });
  }
  /* one name and year, at x, for a row of scale s centred on mid */
  const type = (c, m, x, mid, s) => { c.textBaseline = "alphabetic"; big(c, 70 / m.cap * s); c.fillText(m.name, x, mid + 35 * s); ital(c, 70 / m.icap * s); c.fillText(m.year, x + (m.w1 + GAP1) * s, mid + 35 * s); };

  /* ---------- WebGL, made once ---------- */
  function makeGL() {
    const cv = document.createElement("canvas"); cv.className = "iw-cv"; cv.setAttribute("aria-hidden", "true");
    const gl = cv.getContext("webgl2", { alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: "low-power" }); if (!gl) return null;
    const g = { cv, gl, tex: [], white: null };
    g.init = () => {
      const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; }, p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, `#version 300 es
        in vec2 a; in vec3 b; uniform vec2 size; out vec3 v; void main(){ v = b; gl_Position = vec4(a / size * vec2(2., -2.) + vec2(-1., 1.), 0., 1.); }`));
      gl.attachShader(p, sh(gl.FRAGMENT_SHADER, `#version 300 es
        precision highp float; in vec3 v; uniform sampler2D t; uniform vec3 col; uniform float op; out vec4 o;
        void main(){ float a = texture(t, v.xy, -.6).r * op; o = vec4(col * v.z * a, a); }`));
      gl.bindAttribLocation(p, 0, "a"); gl.bindAttribLocation(p, 1, "b"); gl.linkProgram(p); gl.useProgram(p);
      g.u = { size: gl.getUniformLocation(p, "size"), col: gl.getUniformLocation(p, "col"), op: gl.getUniformLocation(p, "op") };
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.enableVertexAttribArray(0); gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 20, 0); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 20, 8);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      g.white = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, g.white); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
      g.tex = [];
    };
    g.type = (M) => {
      const aniso = gl.getExtension("EXT_texture_filter_anisotropic"), max = Math.min(8192, gl.getParameter(gl.MAX_TEXTURE_SIZE));
      M.forEach((m, i) => {
        const t = document.createElement("canvas"), k = TH / 100; t.height = TH; t.width = Math.min(max, Math.round(m.period * k));
        const c = t.getContext("2d"); c.fillStyle = "#000"; c.fillRect(0, 0, t.width, TH); c.fillStyle = "#fff"; c.setTransform(t.width / (m.period * k), 0, 0, 1, 0, 0); type(c, m, GAP2 / 2 * k, TH / 2, k);
        if (!g.tex[i]) g.tex[i] = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, g.tex[i]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, gl.RED, gl.UNSIGNED_BYTE, t); gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        if (aniso) gl.texParameteri(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, 4);
      });
    };
    cv.addEventListener("webglcontextlost", (e) => e.preventDefault());
    cv.addEventListener("webglcontextrestored", () => { g.init(); if (g.again) g.again(); });
    g.init(); return g;
  }

  function wire() {
    const sec = document.querySelector(".iw"); if (!sec) return;
    const wall = sec.querySelector(".iw-wall"), N = list.length;
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches, reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cv = sec.querySelector(".iw-cv"), flat = null;
    if (!reduce) { try { G = G || makeGL(); } catch (e) { G = null; } }
    const gl = !reduce && G && !G.gl.isContextLost() ? G.gl : null;
    if (gl) { cv.replaceWith(G.cv); cv = G.cv; } else flat = cv.getContext("2d");

    let W = 1, H = 1, M = [], amp = 0, f = 2, cx = 0, time = 0, over = false, mx = 0, my = 0, key = -1, last = 0, raf = 0, seen = false, lit = -1, cols = 2, buf = null, Y = null, rate = 0;
    const R = [...sec.querySelectorAll(".iw-row")].map((el, i) => ({ el, i, col: rgb(list[i].colour || "#000000").map((v) => v / 255), dir: i % 2 ? 1 : -1, pos: null, top: 0, h: 0 }));

    function measure() {
      W = wall.clientWidth; H = wall.clientHeight; if (!W || !H) return;
      const d = Math.min(devicePixelRatio || 1, 2); cv.width = Math.round(W * d); cv.height = Math.round(H * d);
      if (flat) flat.setTransform(d, 0, 0, d, 0, 0); else { gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(G.u.size, W, H); }
      cols = Math.ceil(W / COL) + 1; buf = new Float32Array(cols * 2 * 5); Y = new Float32Array(cols * (N + 1));
      if (!cx) cx = W / 2;
      if (!raf) draw();
    }
    function type_() {
      M = metrics(); R.forEach((r, i) => { if (r.pos === null) r.pos = M[i].period * ((i * .618 + .17) % 1); });
      if (gl) G.type(M); if (!raf) draw();
    }

    /* ---------- the swell ---------- */
    const bell = (i) => Math.exp(-((i - f) ** 2) / (2 * ROWS * ROWS));
    const reach = () => Math.max(90, W * WIDE), hump = (x) => Math.exp(-((x - cx) ** 2) / (2 * reach() ** 2));
    const power = () => amp * SWELL * (W < H ? .8 : 1);
    /* the tops of every row (and the foot of the last) at one x */
    const tops = (x) => { const a = power() * hump(x), w = R.map((r) => 1 + a * bell(r.i)), k = H / w.reduce((p, q) => p + q, 0), o = [0]; w.forEach((v, i) => o.push(o[i] + v * k)); return o; };
    const rowAt = (x, y) => { const t = flat ? R.map((r) => r.top).concat(H) : tops(x); for (let i = N - 1; i > 0; i--) if (y >= t[i]) return i; return 0; };
    /* which row number (with its fraction) is under y, in the wall as it stands */
    const under = (x, y) => { const t = tops(x), i = rowAt(x, y); return clamp(i + (y - t[i]) / Math.max(1, t[i + 1] - t[i]) - .5, -.4, N - .6); };

    function step(dt) {
      time += dt;
      let tx, ty, ta = 1;
      if (over) { tx = mx; ty = under(mx, my); }
      else if (key >= 0) { tx = W / 2; ty = key; }
      else { const a = time * Math.PI * 2 / LAP; tx = W * (.5 - .3 * Math.cos(a * 1.6)); ty = (N - 1) * (.5 - .42 * Math.cos(a)); ta = CALM; }
      rate += ((over || key >= 0 ? FOLLOW : .7) - rate) * Math.min(1, dt * 2);      // eases into following, and out of it
      const k = 1 - Math.exp(-dt * rate);
      const nx = cx + (tx - cx) * k, was = cx;
      // the letters under the middle of the swell stay put as it moves across them
      R.forEach((r, i) => { const x = (was + nx) / 2, t = tops(x), s = Math.max(.05, (t[i + 1] - t[i]) / 100), b = bell(i); r.pos += (nx - was) / s - r.dir * mix(REST, FAST, b * b) * dt / s; if (M[i]) r.pos = ((r.pos % M[i].period) + M[i].period) % M[i].period; });
      cx = nx; f += (ty - f) * k; amp += (ta - amp) * Math.min(1, dt * 1.2);
    }

    function place(x) { const t = tops(x); R.forEach((r, i) => { r.top = t[i]; r.h = t[i + 1] - t[i]; r.el.style.top = r.top.toFixed(1) + "px"; r.el.style.height = r.h.toFixed(1) + "px"; }); }
    function still() {
      const c = flat; c.clearRect(0, 0, W, H);
      R.forEach((r, i) => {
        r.h = H / N; r.top = i * r.h; r.el.style.top = r.top + "px"; r.el.style.height = r.h + "px"; if (!M[i]) return;
        c.fillStyle = i === lit ? `rgb(${r.col.map((v) => Math.round(v * 255))})` : "#000"; type(c, M[i], Math.max(16, W * .03), r.top + r.h / 2, Math.min(r.h / 100, W * .94 / M[i].period));
        if (i) { c.fillStyle = "rgba(0,0,0,.14)"; c.fillRect(0, Math.round(r.top) - 1, W, 1); }
      });
    }
    function draw() {
      if (flat) return still();
      if (!M.length || !buf || gl.isContextLost()) return;
      place(over ? mx : cx);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      const X = (j) => Math.min(j * COL, W), J = clamp(Math.round(cx / COL), 0, cols - 1), hum = new Float32Array(cols);
      for (let j = 0; j < cols; j++) { const x = X(j), t = tops(x); hum[j] = hump(x); for (let i = 0; i <= N; i++) Y[j * (N + 1) + i] = t[i]; }
      const strip = (n) => { gl.bufferData(gl.ARRAY_BUFFER, buf, gl.DYNAMIC_DRAW); gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); };
      const put = (j, y0, y1, u, v0, v1, k) => { const o = j * 10, x = X(j); buf[o] = x; buf[o + 1] = y0; buf[o + 2] = u; buf[o + 3] = v0; buf[o + 4] = k; buf[o + 5] = x; buf[o + 6] = y1; buf[o + 7] = u; buf[o + 8] = v1; buf[o + 9] = k; };
      R.forEach((r, i) => {
        const m = M[i], per = m.period, at = (j) => Y[j * (N + 1) + i], hh = (j) => Y[j * (N + 1) + i + 1] - at(j), ink = clamp((bell(i) - .45) / .5, 0, 1) * clamp(amp, 0, 1);
        const glow = (j) => { const t = clamp((hum[j] - .12) / .7, 0, 1); return ink * t * t * (3 - 2 * t); };
        // how far along the text each column is, worked outwards from the middle of the swell
        let u = r.pos + (X(J) - cx) / (hh(J) / 100), u0 = u; put(J, at(J), at(J) + hh(J), u / per, 0, 1, glow(J));
        for (let j = J + 1; j < cols; j++) { u += (X(j) - X(j - 1)) * 200 / (hh(j) + hh(j - 1)); put(j, at(j), at(j) + hh(j), u / per, 0, 1, glow(j)); }
        for (let j = J - 1; j >= 0; j--) { u0 -= (X(j + 1) - X(j)) * 200 / (hh(j) + hh(j + 1)); put(j, at(j), at(j) + hh(j), u0 / per, 0, 1, glow(j)); }
        gl.bindTexture(gl.TEXTURE_2D, G.tex[i]); gl.uniform3fv(G.u.col, r.col); gl.uniform1f(G.u.op, 1); strip(cols * 2);
      });
      gl.bindTexture(gl.TEXTURE_2D, G.white); gl.uniform3f(G.u.col, 0, 0, 0); gl.uniform1f(G.u.op, .14);
      for (let i = 1; i < N; i++) { for (let j = 0; j < cols; j++) { const y = Y[j * (N + 1) + i]; put(j, y - .5, y + .5, 0, 0, 0, 0); } strip(cols * 2); }
    }

    const tick = (now) => { raf = 0; if (!sec.isConnected || !seen) return; const dt = Math.min(.05, (now - last) / 1000); last = now; step(dt); draw(); raf = requestAnimationFrame(tick); };
    const start = () => { if (!raf && seen && !flat && sec.isConnected) { last = performance.now(); raf = requestAnimationFrame(tick); } };

    /* ---------- cursor, keyboard, tap (a tap is just the link) ---------- */
    let sx = null, sy = null;
    const light = (i) => { if (flat && i !== lit) { lit = i; draw(); } };
    const local = (e) => { const b = wall.getBoundingClientRect(); return [clamp(e.clientX - b.left, 0, W), clamp(e.clientY - b.top, 0, H)]; };
    const moved = (e) => {
      if (e.pointerType === "touch") return;
      const real = sx !== null && (e.screenX !== sx || e.screenY !== sy); sx = e.screenX; sy = e.screenY;      // a scroll under a still mouse also reports a "move": ignore it
      const inside = !!(e.target.closest && e.target.closest(".iw-wall")), [x, y] = local(e);
      if (!inside) over = false; else if (real) { over = true; mx = x; my = y; }
      light(inside ? rowAt(x, y) : -1);
    };
    if (fine) {
      const ons = [[document, "pointermove", moved], [document.documentElement, "pointerleave", () => { over = false; light(-1); }], [window, "scroll", () => { over = false; }]];      // scrolling lets the wall go until the mouse moves again
      ons.forEach(([on, name, fn]) => { const h = (e) => { if (sec.isConnected) fn(e); else on.removeEventListener(name, h); }; on.addEventListener(name, h, { passive: true }); });
    }
    R.forEach((r) => {
      r.el.addEventListener("focus", () => { if (r.el.matches(":focus-visible")) { key = r.i; light(r.i); } });
      r.el.addEventListener("blur", () => { key = -1; light(-1); });
      r.el.addEventListener("click", (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        cameFrom = true;
        if (e.detail) { const i = rowAt(...local(e)); if (i !== r.i) { e.preventDefault(); location.hash = R[i].el.getAttribute("href"); } }      // the rows bend: go by what is under the point
      });
    });

    if (gl) G.again = () => { if (sec.isConnected) { measure(); type_(); } };
    measure(); type_();
    if (document.fonts && document.fonts.load) Promise.all([document.fonts.load('800 100px "Bricolage"'), document.fonts.load('italic 300 100px "Fraunces"', "2026")]).then(() => { if (sec.isConnected) type_(); }, () => {});
    if (window.ResizeObserver) new ResizeObserver(() => { if (sec.isConnected) measure(); }).observe(wall); else addEventListener("resize", () => sec.isConnected && measure());
    if ("IntersectionObserver" in window) new IntersectionObserver((e) => { seen = e[e.length - 1].isIntersecting; if (seen) start(); else over = false; }).observe(wall);
    else { seen = true; start(); }
    sec.sim = { step: (s) => { for (let t = 0; t < s; t += 1 / 60) step(1 / 60); draw(); }, rows: R, at: (x, y) => { over = y != null; mx = x; my = y; }, over: () => over, rowAt, info: () => ({ cx, f, amp }) };
  }

  window.INDEXWALL = { render, wire, took: () => { const v = cameFrom; cameFrom = false; return v; } };
})();
