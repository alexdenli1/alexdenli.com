/* The opening: Alex's name fills the screen and the work plays inside the letters, cut like an edit.
   The cursor drags heavy water through the type (js/water.js), bending the letters and the footage.
   Scrolling compresses the name and slides it into the logo's place in the nav.

   One WebGL2 canvas does the drawing. Without WebGL2 a 2D canvas draws the same thing without the
   ripple; with reduced motion it is one still frame: the name with one hero inside it.

   OPENING.html(site)            the section's markup
   OPENING.start(section, site)  run it; returns stop()
*/
(() => {
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const ease = (x) => { /* the house curve, cubic-bezier(.7, 0, .2, 1), solved for y at x */
    let t = x; for (let i = 0; i < 6; i++) { const cx = 3 * .7 * t * (1 - t) * (1 - t) + 3 * .2 * t * t * (1 - t) + t * t * t - x;
      const d = 3 * .7 * (1 - t) * (1 - 3 * t) + 3 * .2 * t * (2 - 3 * t) + 3 * t * t; if (Math.abs(d) < 1e-6) break; t = clamp01(t - cx / d); }
    return 3 * t * t * (1 - t) + t * t * t; };

  /* ?name=title on the address shows "Alex Denli" in title case instead of capitals, for comparing the two */
  const nameOf = (site) => {
    const q = new URLSearchParams(location.search).get("name");
    const n = site.owner.name || "Alex Denli";
    return q === "title" ? n : n.toUpperCase();
  };

  /* The edit: every project's hero, with a few process shots cut in between. Order follows data.js. */
  const EXTRA = { aeropress: ["images/aeropress/gesture.webp", "images/aeropress/head.webp"], shield: ["images/shield/hero-render.webp", "images/shield/lift.webp"] };
  const shotsOf = (site) => {
    const out = [];
    site.projects.forEach((p) => { if (p.hero && !/placeholder/.test(p.hero)) out.push(p.hero); });
    const extra = [].concat(...Object.values(EXTRA));
    // weave the extras in so two shots of one project never sit side by side
    extra.forEach((s, i) => out.splice(Math.min(out.length, 2 + i * 3), 0, s));
    return out;
  };

  function html(site) {
    const o = site.owner;
    return `<section class="op" aria-label="Introduction">
      <h1 class="op-name">${esc(o.name)}</h1>
      <canvas class="op-type" aria-hidden="true"></canvas>
      <p class="op-line">${esc(o.intro || o.role || "")}</p>
    </section>`;
  }

  const VS = `#version 300 es
in vec2 aP; out vec2 vUv;
void main() { vUv = vec2(aP.x * .5 + .5, .5 - aP.y * .5); gl_Position = vec4(aP, 0., 1.); }`;
  /* The water is a height field. Its slope bends where the letters and the footage are read from
     (the footage a little more than the letters, so the picture swims inside the type), and a soft
     light catches the slopes that face the top left. */
  const FS = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uMask, uEdit, uField;
uniform vec2 uCell, uAmp;
uniform vec4 uBox;
void main() {
  float hl = texture(uField, vUv - vec2(uCell.x, 0.)).r, hr = texture(uField, vUv + vec2(uCell.x, 0.)).r;
  float hu = texture(uField, vUv - vec2(0., uCell.y)).r, hd = texture(uField, vUv + vec2(0., uCell.y)).r;
  vec2 g = vec2(hr - hl, hd - hu);
  vec2 off = g * uAmp;
  float m = texture(uMask, vUv - off).r;
  if (m < .003) { o = vec4(0.); return; }
  // blacks inside the letters lift a touch, so a dark shot never loses the name against the black page
  vec3 c = texture(uEdit, (vUv - off * 2.4 - uBox.xy) / uBox.zw).rgb * .9 + .085;
  float lit = clamp(dot(g, vec2(-.75, -.66)) * 2.6, -1., 1.);
  c = c * (1. - .28 * max(0., -lit)) + vec3(.933, .914, .89) * .42 * max(0., lit);
  o = vec4(c * m, m);
}`;

  function start(root, site) {
    const cv = root.querySelector(".op-type"), line = root.querySelector(".op-line");
    if (!cv) return () => {};
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const NAME = nameOf(site);
    const nav = document.getElementById("nav"), logo = nav && nav.querySelector(".nav-home .logo");
    let alive = true, raf = 0, last = 0, W = 0, H = 0, dpr = 1;
    let box = { x: 0, y: 0, w: 1, h: 1 }, edges = [], prog = -1, seen = !document.hidden;

    /* ---------- the type as a mask ---------- */
    const mask = document.createElement("canvas"), mx = mask.getContext("2d");
    const FONT = (px) => `condensed 800 ${px}px Bricolage, "Helvetica Neue", Arial, sans-serif`;
    const setFont = (ctx, px) => { ctx.font = FONT(px); if ("fontStretch" in ctx) ctx.fontStretch = "condensed"; };
    function layout() {
      W = innerWidth; H = innerHeight; dpr = Math.min(1.5, devicePixelRatio || 1);
      const pad = parseFloat(getComputedStyle(root).getPropertyValue("--op-pad")) || W * 0.023;
      const m = mx; setFont(m, 100);
      const t = m.measureText(NAME), w100 = t.actualBoundingBoxLeft + t.actualBoundingBoxRight;
      const F = 100 * (W - 2 * pad) / w100;
      setFont(m, F);
      const tm = m.measureText(NAME), asc = tm.actualBoundingBoxAscent, desc = Math.max(0, tm.actualBoundingBoxDescent);
      // the letters are drawn taller than they are wide (as the old "Projects" word was), so the name
      // fills the screen rather than sitting in a thin band across it
      const SY = Math.max(1, Math.min(1.7, (H * 0.44) / (asc + desc)));
      const h = (asc + desc) * SY, top = Math.round(H * 0.45 - h / 2);
      const x = pad + tm.actualBoundingBoxLeft, base = top + asc * SY;
      box = { x: pad, y: top, w: W - 2 * pad, h, F, base, left: x, sy: SY };
      // where each letter starts, so the edit can cut letter by letter
      edges = [];
      for (let i = 1; i < NAME.length; i++) if (NAME[i] !== " ") edges.push(m.measureText(NAME.slice(0, i)).width + x - box.x);
      edges.push(box.w + 4);
      // draw the mask at full resolution
      mask.width = Math.round(W * dpr); mask.height = Math.round(H * dpr);
      mx.setTransform(dpr, 0, 0, dpr, 0, 0); mx.clearRect(0, 0, W, H);
      setFont(mx, F); mx.fillStyle = "#fff"; mx.textBaseline = "alphabetic";
      mx.translate(0, base); mx.scale(1, SY); mx.fillText(NAME, x, 0);
      cv.width = mask.width; cv.height = mask.height;
      root.style.setProperty("--op-top", (box.y + box.h).toFixed(1) + "px");
      root.style.setProperty("--op-left", box.x.toFixed(1) + "px");
      sizeEdit(); upMask = true; fieldFor(); drawn = false;
    }

    /* ---------- the edit: shots cut together, drawn just behind the type ---------- */
    const SHOTS = shotsOf(site), pics = SHOTS.map(() => null);
    const edit = document.createElement("canvas"), ex = edit.getContext("2d", { alpha: false });
    let ES = 1;                                 // edit canvas pixels per css pixel
    const sizeEdit = () => { ES = Math.min(1, 1500 / box.w) * Math.min(1.25, dpr); edit.width = Math.round(box.w * ES); edit.height = Math.max(2, Math.round(box.h * ES)); };
    const load = (i) => new Promise((res) => {
      const im = new Image(); im.decoding = "async"; im.src = SHOTS[i];
      (im.decode ? im.decode() : new Promise((r) => (im.onload = r))).then(() => { pics[i] = im; res(im); }, () => res(null));
    });
    /* each shot: which part of the picture to show, and the slow drift through it, left to right */
    const FOCUS = { "images/xfly/hero.jpg": 0.42, "images/adverts/hero.jpg": 0.45, "images/signature-logo/hero.jpg": 0.5,
      "images/rescue/hero.jpg": 0.35, "images/relinquit/hero.jpg": 0.62, "images/shield/hero.jpg": 0.45, "images/aeropress/hero.jpg": 0.55 };
    function paintShot(ctx, i, t, dx, clip) {
      const im = pics[i]; if (!im) return false;
      const w = edit.width, h = edit.height, s = (w * 1.16) / im.naturalWidth, iw = im.naturalWidth * s, ih = im.naturalHeight * s;
      const fy = FOCUS[SHOTS[i]] ?? 0.5, z = 1 + 0.035 * t;
      const x = -(iw - w) * (1 - t) + dx, y = -(ih * fy - h / 2);
      ctx.save();
      if (clip != null) { ctx.beginPath(); ctx.rect(0, 0, clip * ES, h); ctx.clip(); }
      ctx.translate(x + iw / 2, y + ih / 2); ctx.scale(z, z); ctx.drawImage(im, -iw / 2, -ih / 2, iw, ih);
      ctx.restore();
      return true;
    }
    /* the cut pattern: letter by letter, a push in from the left, a hard cut */
    const CUTS = ["flap", "push", "cut", "flap", "cut", "push"];
    const ed = { cur: 0, at: 0, hold: 1500, k: 0, ready: false };
    const nextReady = () => { let n = (ed.cur + 1) % SHOTS.length, g = 0; while (!pics[n] && g++ < SHOTS.length) n = (n + 1) % SHOTS.length; return n; };
    function paintEdit(now) {
      const since = now - ed.at, TR = 430;
      let nx = nextReady();
      if (since > ed.hold + TR) { ed.cur = nx; ed.at = now; ed.k = (ed.k + 1) % CUTS.length; ed.hold = 1250 + Math.random() * 650; nx = nextReady(); }
      const s2 = now - ed.at, tc = clamp01(s2 / (ed.hold + TR));
      ex.fillStyle = "#000"; ex.fillRect(0, 0, edit.width, edit.height);
      const into = s2 - ed.hold;
      if (into <= 0 || nx === ed.cur) { paintShot(ex, ed.cur, tc, 0); return; }
      const f = clamp01(into / TR), kind = CUTS[ed.k];
      if (kind === "push") {
        const e = ease(f), w = edit.width;
        paintShot(ex, ed.cur, tc, e * w);
        paintShot(ex, nx, 0, -(1 - e) * w);
      } else if (kind === "flap") {
        // one letter at a time, left to right
        const n = Math.min(edges.length, Math.floor(f * (edges.length + 1)));
        paintShot(ex, ed.cur, tc, 0);
        if (n > 0) paintShot(ex, nx, 0, 0, edges[n - 1]);
      } else {
        paintShot(ex, f < 0.5 ? ed.cur : nx, f < 0.5 ? tc : 0, 0);
      }
    }

    /* ---------- the water ---------- */
    let water = null;
    const fieldFor = () => { if (!window.RIPPLE) return; water = window.RIPPLE.create({ gw: 160, gh: Math.max(20, Math.round(160 * H / W)) }); };

    /* ---------- drawing: WebGL2, or 2D as a fallback ---------- */
    let gl = null, prog_ = null, tex = {}, U = {}, upMask = true, drawn = false;
    if (!reduce) gl = cv.getContext("webgl2", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (gl) {
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; } return s; };
      const v = sh(gl.VERTEX_SHADER, VS), f = sh(gl.FRAGMENT_SHADER, FS);
      prog_ = v && f && gl.createProgram();
      if (prog_) { gl.attachShader(prog_, v); gl.attachShader(prog_, f); gl.linkProgram(prog_); if (!gl.getProgramParameter(prog_, gl.LINK_STATUS)) prog_ = null; }
      if (!prog_) gl = null;
    }
    if (gl) {
      gl.useProgram(prog_);
      const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const a = gl.getAttribLocation(prog_, "aP"); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
      ["uMask", "uEdit", "uField", "uCell", "uAmp", "uBox"].forEach((n) => (U[n] = gl.getUniformLocation(prog_, n)));
      const mk = (unit) => { const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t; };
      tex = { mask: mk(0), edit: mk(1), field: mk(2) };
      gl.uniform1i(U.uMask, 0); gl.uniform1i(U.uEdit, 1); gl.uniform1i(U.uField, 2);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    }
    const ctx2 = gl ? null : cv.getContext("2d");
    root.classList.toggle("op-flat", !gl);

    function render(now) {
      paintEdit(now);
      if (gl) {
        gl.viewport(0, 0, cv.width, cv.height);
        if (upMask) { gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex.mask);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mask); upMask = false; }
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tex.edit);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, edit);
        gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, tex.field);
        if (water) gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, water.gw, water.gh, 0, gl.RED, gl.FLOAT, water.wet);
        gl.uniform2f(U.uCell, water ? 1 / water.gw : 0, water ? 1 / water.gh : 0);
        // about 10 css pixels of bend for the letters at the steepest slope (the footage twice that), the same both ways
        gl.uniform2f(U.uAmp, 0.0095, 0.0095 * W / H);
        gl.uniform4f(U.uBox, box.x / W, box.y / H, box.w / W, box.h / H);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      } else {
        const c = ctx2; c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = "source-over";
        c.clearRect(0, 0, cv.width, cv.height);
        c.fillStyle = "#161616"; c.fillRect(box.x * dpr, box.y * dpr, box.w * dpr, box.h * dpr);
        c.globalAlpha = .91; c.drawImage(edit, box.x * dpr, box.y * dpr, box.w * dpr, box.h * dpr); c.globalAlpha = 1;
        c.globalCompositeOperation = "destination-in"; c.drawImage(mask, 0, 0);
        c.globalCompositeOperation = "source-over";
      }
      drawn = true;
    }

    /* ---------- scroll: the name compresses and slides into the logo's place ---------- */
    function scrub() {
      const p = reduce ? 0 : clamp01(scrollY / (innerHeight * 0.92));
      if (p === prog) return;
      prog = p;
      if (reduce) return;
      // the logo's top line ("Alex Denli") is where the name lands
      let tx = 0, ty = 0, sx = 1, sy = 1;
      if (logo && p > 0) {
        const r = logo.getBoundingClientRect(), tw = r.width, th = r.height * 0.5;
        const s = tw / box.w, sY = th / box.h;
        // the width gives way first and the height follows, so the name visibly compresses on its way
        const pw = Math.pow(p, 0.62), ph = Math.pow(p, 1.35), pm = p;
        sx = 1 + (s - 1) * pw; sy = 1 + (sY - 1) * ph;
        tx = (r.left - box.x * 1) * pm; ty = (r.top - box.y) * pm;
        // keep the left edge travelling with the scale (the origin is the name's own top left)
      }
      cv.style.transformOrigin = `${box.x}px ${box.y}px`;
      cv.style.transform = p > 0 ? `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${sx.toFixed(5)}, ${sy.toFixed(5)})` : "";
      // the line underneath holds its place and wipes away, left to right, as the name lifts off
      if (line) { const w = clamp01(p / 0.32);
        line.style.transform = p > 0 ? `translate3d(0, ${(p * innerHeight * 0.92).toFixed(1)}px, 0)` : "";
        line.style.clipPath = w > 0 ? `inset(-.2em 0 -.2em ${(w * 100).toFixed(2)}%)` : ""; }
      const hand = clamp01((p - 0.86) / 0.14);          // the last stretch hands over to the logo
      cv.style.opacity = (1 - hand).toFixed(3);
      cv.style.visibility = p >= 1 ? "hidden" : "";
      if (nav) { nav.style.setProperty("--logo-in", hand.toFixed(3)); nav.classList.toggle("nav-open", p < 1); }
      if (p < 1) kick();
    }

    /* ---------- the loop ---------- */
    let autoAt = 0, auto = null, lastMove = 0, nextDrop = 0;
    function frame(now) {
      raf = 0;
      if (!alive) return;
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
      if (water) {
        // the opening stroke: a hand drawn once through the name, left to right
        if (auto) {
          const u = (now - auto.t0) / auto.dur;
          if (u >= 1) { water.lift(); auto = null; }
          else { const e = u; water.trail((box.x + box.w * (0.02 + 0.96 * e)) / W * water.gw, (box.y + box.h * (0.55 + 0.12 * Math.sin(e * 6.28))) / H * water.gh); }
        }
        // a stray drop now and then when nobody is touching it
        if (!auto && now - lastMove > 5000 && now > nextDrop) {
          nextDrop = now + 3800 + Math.random() * 2600;
          const e = edges[Math.floor(Math.random() * edges.length)] - 20;
          water.ring((box.x + e) / W * water.gw, (box.y + box.h * (0.3 + 0.4 * Math.random())) / H * water.gh, 0.5);
        }
        water.step(dt);
      }
      render(now);
      if (prog < 1 && seen) raf = requestAnimationFrame(frame);
    }
    const kick = () => { if (!raf && alive && seen && prog < 1 && !reduce) { last = performance.now(); raf = requestAnimationFrame(frame); } };

    /* the pointer, mapped through wherever the name currently sits */
    const move = (e) => {
      if (!water || prog > 0.25) return;
      const r = cv.getBoundingClientRect();
      const gx = (e.clientX - r.left) / r.width * water.gw, gy = (e.clientY - r.top) / r.height * water.gh;
      if (gx < 0 || gy < 0 || gx > water.gw || gy > water.gh) { water.lift(); return; }
      lastMove = performance.now(); water.trail(gx, gy); kick();
    };
    const leave = () => water && water.lift();
    const onScroll = () => scrub();
    const onResize = () => { layout(); prog = -1; scrub(); if (reduce) still(); kick(); };
    const onVis = () => { seen = !document.hidden; kick(); };
    const stroke = () => { if (water && !reduce) { auto = { t0: performance.now(), dur: 1500 }; kick(); } };

    /* reduced motion: one still frame, the name with one hero inside it */
    const STILL = Math.max(0, SHOTS.indexOf("images/shield/hero.jpg"));   // a light frame, so the name reads clearly
    function still() { if (!pics[STILL]) return; ed.cur = STILL; ed.at = performance.now(); ed.hold = 1e9; render(performance.now()); }

    const ready = document.fonts && document.fonts.load ? document.fonts.load(FONT(100), NAME).catch(() => {}) : Promise.resolve();
    ready.then(() => {
      if (!alive) return;
      layout(); scrub();
      load(reduce ? STILL : 0).then(() => {
        if (!alive) return;
        root.classList.add("op-ready");
        ed.at = performance.now();
        if (reduce) { still(); return; }
        kick();
        // the stroke runs as soon as the opening is actually visible (after the intro film, if it plays)
        if (document.documentElement.classList.contains("intro-on")) addEventListener("intro:done", stroke, { once: true });
        else setTimeout(stroke, 250);
        // the rest of the shots load in order behind the first
        SHOTS.reduce((pr, _, i) => i ? pr.then(() => alive && load(i)) : pr, Promise.resolve());
      });
    });

    addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      alive = false; cancelAnimationFrame(raf);
      removeEventListener("pointermove", move); document.removeEventListener("pointerleave", leave);
      removeEventListener("scroll", onScroll); removeEventListener("resize", onResize);
      removeEventListener("intro:done", stroke); document.removeEventListener("visibilitychange", onVis);
      if (nav) { nav.classList.remove("nav-open"); nav.style.removeProperty("--logo-in"); }
      if (gl) { const x = gl.getExtension("WEBGL_lose_context"); x && x.loseContext(); }
    };
  }

  window.OPENING = { html, start };
})();
