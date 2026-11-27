/* The opening: Alex's name fills the screen and the work plays inside the letters, one picture fading
   into the next for as long as the opening is on screen.
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

  /* The pictures: one for each project, its opening picture if it has one, otherwise its hero. Order follows data.js. */
  const shotsOf = (site) => {
    const out = [];
    site.projects.forEach((p) => { const s = p.opening || p.hero; if (s && !/placeholder/.test(s)) out.push(s); });
    return out;
  };

  function html(site) {
    const o = site.owner;
    return `<section class="op" aria-label="Introduction">
      <h1 class="op-name">${esc(o.name)}</h1>
      <canvas class="op-type" aria-hidden="true"></canvas>
      <ul class="op-line op-disc" aria-label="Disciplines">${(o.disciplines || []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
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
uniform vec2 uA1, uB1, uA2, uB2; uniform float uK, uSplit;      // the lines joining: where each line was (A) and is (B), and the scale
void main() {
  float hl = texture(uField, vUv - vec2(uCell.x, 0.)).r, hr = texture(uField, vUv + vec2(uCell.x, 0.)).r;
  float hu = texture(uField, vUv - vec2(0., uCell.y)).r, hd = texture(uField, vUv + vec2(0., uCell.y)).r;
  vec2 g = vec2(hr - hl, hd - hu);
  vec2 off = g * uAmp;
  vec2 s1 = (vUv - uB1) / uK + uA1, s2 = (vUv - uB2) / uK + uA2;
  float m1 = s1.y < uSplit ? texture(uMask, s1 - off).r : 0., m2 = s2.y >= uSplit ? texture(uMask, s2 - off).r : 0.;
  float m = max(m1, m2); vec2 s = m2 > m1 ? s2 : s1;
  if (m < .003) { o = vec4(0.); return; }
  // blacks inside the letters lift a touch, so a dark shot never loses the name against the black page
  vec3 c = texture(uEdit, (s - off * 2.4 - uBox.xy) / uBox.zw).rgb * .9 + .085;
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
    let box = { x: 0, y: 0, w: 1, h: 1 }, rows = [], one = null, J = 0, edges = [], prog = -1, seen = !document.hidden;

    /* ---------- the type as a mask ---------- */
    const mask = document.createElement("canvas"), mx = mask.getContext("2d");
    const FONT = (px) => `800 ${px}px Bricolage, "Helvetica Neue", Arial, sans-serif`;   // the same letters as every heading
    const setFont = (ctx, px) => { ctx.font = FONT(px); if ("letterSpacing" in ctx) ctx.letterSpacing = (px * -0.045).toFixed(2) + "px"; };
    function layout() {
      W = innerWidth; H = innerHeight; dpr = Math.min(1.5, devicePixelRatio || 1);
      const pad = parseFloat(getComputedStyle(root).getPropertyValue("--op-pad")) || W * 0.023;
      // the name stacks, one word a line, both at one size and in the letters' own proportions, centred: as wide as
      // the screen allows, or as tall as fits between the nav and the disciplines underneath
      const lines = NAME.split(" "), GAP = 0.09;      // GAP: between the lines, as a share of the type size
      const ink = (s) => { const m = mx.measureText(s); return { l: m.actualBoundingBoxLeft, w: m.actualBoundingBoxLeft + m.actualBoundingBoxRight, asc: m.actualBoundingBoxAscent, desc: Math.max(0, m.actualBoundingBoxDescent) }; };
      setFont(mx, 100);
      const at100 = lines.map(ink), wide = Math.max(...at100.map((m) => m.w)), tall = at100.reduce((n, m) => n + m.asc + m.desc, 0) + 100 * GAP * (lines.length - 1);
      const head = nav ? nav.offsetHeight : 68, edge = Math.max(12, H * 0.025), foot = line ? parseFloat(getComputedStyle(line).getPropertyValue("--op-gap")) * H / 100 + line.offsetHeight : 60;
      const F = 85 * Math.min(((document.documentElement.clientWidth || W) - 2 * pad) / wide, Math.max(160, H - head - foot - 2.6 * edge) / tall), gap = F * GAP;
      setFont(mx, F);
      const L = lines.map((s) => { const m = ink(s); return { s, l: m.l, x: 0, asc: m.asc, desc: m.desc, w: m.w }; });
      const h = L.reduce((n, l) => n + l.asc + l.desc, 0) + gap * (L.length - 1), top = Math.round(head + Math.max(edge * .6, (H - head - h - foot) * .4));      // a little above the middle
      const bw = Math.max(...L.map((l) => l.w));
      const vw = document.documentElement.clientWidth || W;      // centred on the page itself, not counting the scrollbar
      box = { x: (vw - bw) / 2, y: top, w: bw, h };
      L.forEach((l) => { l.x = (vw - l.w) / 2 + l.l; });
      // draw the mask at full resolution, and note where each letter starts so the edit can cut letter by letter
      mask.width = Math.round(W * dpr); mask.height = Math.round(H * dpr);
      mx.setTransform(dpr, 0, 0, dpr, 0, 0); mx.clearRect(0, 0, W, H);
      setFont(mx, F); mx.fillStyle = "#fff"; mx.textBaseline = "alphabetic";   // (resizing the canvas cleared the font)
      const at = new Set();
      let y = top;
      L.forEach((l) => {
        for (let i = 1; i < l.s.length; i++) if (l.s[i] !== " ") at.add(Math.round(mx.measureText(l.s.slice(0, i)).width + l.x - box.x));
        mx.fillText(l.s, l.x, y + l.asc);
        y += l.asc + l.desc + gap;
      });
      // each line's own box, and the two side by side on one line: the shape the name takes on its way to the logo
      let yy = top; rows = L.map((l) => { const o = { x: l.x - l.l, y: yy, w: l.w, h: l.asc + l.desc }; yy += o.h + gap; return o; });
      if (rows.length === 2) {
        const sp = F * .28, T = rows[0].w + sp + rows[1].w, k = Math.min(1, box.w / T), cx = box.x + box.w / 2, cy = box.y + box.h / 2, lh = rows[0].h;
        one = { k, split: (rows[0].y + rows[0].h + rows[1].y) / 2, x: cx - T * k / 2, y: cy - lh * k / 2, w: T * k, h: lh * k, x2: cx - T * k / 2 + (rows[0].w + sp) * k };
      } else one = null;
      edges = [...at].sort((a, b) => a - b); edges.push(box.w + 4);
      cv.width = mask.width; cv.height = mask.height;
      root.style.setProperty("--op-top", (box.y + box.h).toFixed(1) + "px");
      root.style.setProperty("--op-left", box.x.toFixed(1) + "px");
      root.style.setProperty("--op-right", (vw - box.x - box.w).toFixed(1) + "px");
      sizeEdit(); upMask = true; fieldFor(); drawn = false;
    }

    /* ---------- the pictures, drawn just behind the type ---------- */
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
    function paintShot(ctx, i, t, dx) {
      const im = pics[i]; if (!im) return false;
      // cover the letters whatever their shape (a wide band on a desktop, a tall block on a phone), with room to drift
      const w = edit.width, h = edit.height, s = Math.max((w * 1.16) / im.naturalWidth, (h * 1.06) / im.naturalHeight), iw = im.naturalWidth * s, ih = im.naturalHeight * s;
      const fy = FOCUS[SHOTS[i]] ?? 0.5, z = 1 + 0.035 * t;
      const x = -(iw - w) * (1 - t) + dx, y = -Math.max(0, Math.min(ih - h, ih * fy - h / 2));
      ctx.save();
      ctx.translate(x + iw / 2, y + ih / 2); ctx.scale(z, z); ctx.drawImage(im, -iw / 2, -ih / 2, iw, ih);
      ctx.restore();
      return true;
    }
    /* one picture fades into the next, over and over. Each has its own clock from the moment it starts to
       appear to the moment it has gone, so its slow drift never stops or jumps. */
    const FADE = 1125, HOLD = 975, LIFE = FADE + HOLD + FADE;
    const ed = { cur: 0, at: 0 };                // the picture on show, and when it began to appear
    const nextReady = () => { let n = (ed.cur + 1) % SHOTS.length, g = 0; while (!pics[n] && g++ < SHOTS.length) n = (n + 1) % SHOTS.length; return n; };
    function paintEdit(now) {
      if (reduce) { ex.fillStyle = "#000"; ex.fillRect(0, 0, edit.width, edit.height); paintShot(ex, ed.cur, 0, 0); return; }
      let age = now - ed.at, nx = nextReady();
      if (nx === ed.cur && age > FADE + HOLD) { ed.at = now - FADE - HOLD; age = FADE + HOLD; }        // the next one is still loading: wait
      else if (age > LIFE) { ed.cur = nx; ed.at = Math.max(ed.at + FADE + HOLD, now - FADE); age = now - ed.at; nx = nextReady(); }      // (after a pause, pick up cleanly)
      ex.fillStyle = "#000"; ex.fillRect(0, 0, edit.width, edit.height);
      paintShot(ex, ed.cur, clamp01(age / LIFE), 0);
      const into = age - FADE - HOLD;
      if (into > 0 && nx !== ed.cur) { const f = clamp01(into / FADE); ex.globalAlpha = f * f * (3 - 2 * f); paintShot(ex, nx, into / LIFE, 0); ex.globalAlpha = 1; }
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
      ["uMask", "uEdit", "uField", "uCell", "uAmp", "uBox", "uA1", "uB1", "uA2", "uB2", "uK", "uSplit"].forEach((n) => (U[n] = gl.getUniformLocation(prog_, n)));
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
        // the two lines slide together into one as the name heads for the logo
        if (one) {
          const k = 1 + (one.k - 1) * J, b1x = rows[0].x + (one.x - rows[0].x) * J, b1y = rows[0].y + (one.y - rows[0].y) * J, b2x = rows[1].x + (one.x2 - rows[1].x) * J, b2y = rows[1].y + (one.y - rows[1].y) * J;
          gl.uniform1f(U.uK, k); gl.uniform1f(U.uSplit, one.split / H);
          gl.uniform2f(U.uA1, rows[0].x / W, rows[0].y / H); gl.uniform2f(U.uB1, b1x / W, b1y / H); gl.uniform2f(U.uA2, rows[1].x / W, rows[1].y / H); gl.uniform2f(U.uB2, b2x / W, b2y / H);
        } else { gl.uniform1f(U.uK, 1); gl.uniform1f(U.uSplit, 2); [U.uA1, U.uB1, U.uA2, U.uB2].forEach((u) => gl.uniform2f(u, 0, 0)); }
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
      J = gl && one ? ease(clamp01(p / 0.5)) : 0;
      // the name as it stands: two lines, or (once joined) one
      const B = J && one ? { x: box.x + (one.x - box.x) * J, y: box.y + (one.y - box.y) * J, w: box.w + (one.w - box.w) * J, h: box.h + (one.h - box.h) * J } : box;
      if (logo && p > 0) {
        // it lands exactly on the logo's top line ("ALEX DENLI"), at the same width
        const r = logo.getBoundingClientRect(), th = r.height * 0.52, s = r.width / B.w, m = ease(p);
        sx = 1 + (s - 1) * m; sy = 1 + (Math.min(s, th / B.h) - 1) * m;
        tx = (r.left - B.x) * m; ty = (r.top - B.y) * m;
      }
      cv.style.transformOrigin = `${B.x}px ${B.y}px`;
      cv.style.transform = p > 0 ? `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${sx.toFixed(5)}, ${sy.toFixed(5)})` : "";
      // the line underneath holds its place and wipes away, left to right, as the name lifts off
      if (line) { const w = clamp01(p / 0.32);
        line.style.transform = p > 0 ? `translate3d(0, ${(p * innerHeight * 0.92).toFixed(1)}px, 0)` : "";
        line.style.clipPath = w > 0 ? `inset(-.2em 0 -.2em ${(w * 100).toFixed(2)}%)` : ""; }
      const hand = clamp01((p - 0.8) / 0.2);          // the last stretch hands over to the logo, which is in the same place
      cv.style.opacity = (1 - hand).toFixed(3);
      cv.style.visibility = p >= 1 ? "hidden" : "";
      if (nav) { nav.style.setProperty("--logo-in", hand.toFixed(3)); nav.style.setProperty("--links", Math.max(1 - clamp01(p / 0.06), hand).toFixed(3)); }   // app.js decides what the bar sits on
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
    // on a touch screen the finger drags the water, as the cursor does (the page still scrolls)
    const touch = (e) => { const t = e.touches && e.touches[0]; if (t) move({ clientX: t.clientX, clientY: t.clientY }); };
    const onScroll = () => scrub();
    const onResize = () => { layout(); prog = -1; scrub(); if (reduce) still(); kick(); };
    const onVis = () => { seen = !document.hidden; kick(); };
    const stroke = () => { if (water && !reduce) { auto = { t0: performance.now(), dur: 1500 }; kick(); } };

    /* reduced motion: one still frame, the name with one hero inside it */
    const STILL = Math.max(0, SHOTS.indexOf("images/shield/hero.jpg"));   // a light frame, so the name reads clearly
    function still() { if (!pics[STILL]) return; ed.cur = STILL; ed.at = performance.now(); render(performance.now()); }

    const ready = document.fonts && document.fonts.load ? document.fonts.load(FONT(100), NAME).catch(() => {}) : Promise.resolve();
    ready.then(() => {
      if (!alive) return;
      layout(); scrub();
      load(reduce ? STILL : 0).then(() => {
        if (!alive) return;
        root.classList.add("op-ready");
        ed.at = performance.now() - FADE;
        if (reduce) { still(); return; }
        kick();
        setTimeout(stroke, 250);
        // the rest of the shots load in order behind the first
        SHOTS.reduce((pr, _, i) => i ? pr.then(() => alive && load(i)) : pr, Promise.resolve());
      });
    });

    addEventListener("pointermove", move, { passive: true });
    addEventListener("touchstart", touch, { passive: true }); addEventListener("touchmove", touch, { passive: true }); addEventListener("touchend", leave);
    document.addEventListener("pointerleave", leave);
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      alive = false; cancelAnimationFrame(raf);
      removeEventListener("pointermove", move); removeEventListener("touchstart", touch); removeEventListener("touchmove", touch); removeEventListener("touchend", leave);
      document.removeEventListener("pointerleave", leave);
      removeEventListener("scroll", onScroll); removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      if (nav) { nav.style.removeProperty("--logo-in"); nav.style.removeProperty("--links"); }
      if (gl) { const x = gl.getExtension("WEBGL_lose_context"); x && x.loseContext(); }
    };
  }

  window.OPENING = { html, start };
})();