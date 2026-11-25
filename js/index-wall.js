/* Index of works: a wall of project names, at the foot of the home page. Type only, no pictures.
   The row under the cursor is always the largest, in its project's colour, and the one that moves; its neighbours
   follow a little and the rest of the wall hardly drifts. The row grows from the point the cursor is over.
   With no cursor (and on touch screens) the same swell wanders slowly up and down the wall by itself.
   Nothing opens on hover, and the page arriving under a resting cursor does nothing: only moving the mouse counts.

   The type is painted on one canvas; the rows themselves are ordinary links. */
(() => {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const SWELL = 4.2, REACH = .95;      // how much larger the main row is; how many rows either side feel it
  const FAST = 30, REST = 3;           // px a second: the main row, and the rows furthest from it
  const LAP = 34;                      // seconds for the swell to wander down the wall and back, left alone
  const TAU = Math.PI * 2, clamp = (v, a, b) => Math.min(b, Math.max(a, v)), mix = (a, b, t) => a + (b - a) * t;
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  let list = [], cameFrom = false;

  function render(projects, link) {
    list = projects.slice();
    return `<section class="iw" aria-label="Index of works"><h2>Index of works</h2>
      <div class="iw-wall"><canvas class="iw-cv" aria-hidden="true"></canvas>
      <ol>${list.map((p) => `<li><a class="iw-row" href="${link(p)}" data-slug="${esc(p.slug)}"><span>${esc(p.title)}, ${esc(parseInt(p.year, 10))}</span></a></li>`).join("")}</ol></div></section>`;
  }

  function wire() {
    const sec = document.querySelector(".iw"); if (!sec) return;
    const wall = sec.querySelector(".iw-wall"), cv = sec.querySelector(".iw-cv"), c = cv.getContext("2d");
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches, reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const N = list.length, FAM = '"Bricolage", "Helvetica Neue", Arial, sans-serif', ITAL = '"Fraunces", Georgia, serif';
    let W = 1, H = 1, CAP = .72, ICAP = .7, amp = 0, f = 0, org = 0, ph = 0, idle = 0, over = false, my = 0, mx = 0, key = -1, last = 0, raf = 0, seen = false, lit = -1;

    const R = [...sec.querySelectorAll(".iw-row")].map((el, i) => ({ el, i, name: list[i].title.toUpperCase(), year: String(parseInt(list[i].year, 10)), col: rgb(list[i].colour || "#000000"), dir: i % 2 ? 1 : -1, pos: 0, w1: 1, w2: 1, period: 1, h: 0, top: 0, near: 0 }));
    const big = (px) => { c.font = `800 ${px.toFixed(2)}px ${FAM}`; if ("letterSpacing" in c) c.letterSpacing = (-.04 * px).toFixed(2) + "px"; };
    const ital = (px) => { c.font = `italic 300 ${px.toFixed(2)}px ${ITAL}`; if ("letterSpacing" in c) c.letterSpacing = (-.02 * px).toFixed(2) + "px"; };

    /* widths are kept for a row 100 tall, whose caps and figures are 70 high */
    const GAP1 = 22, GAP2 = 58;
    function measure() {
      W = wall.clientWidth; H = wall.clientHeight; if (!W || !H) return;
      const d = Math.min(devicePixelRatio || 1, 2); cv.width = Math.round(W * d); cv.height = Math.round(H * d); c.setTransform(d, 0, 0, d, 0, 0);
      big(100); CAP = (c.measureText("H").actualBoundingBoxAscent || 72) / 100;
      ital(100); ICAP = (c.measureText("2").actualBoundingBoxAscent || 70) / 100;
      R.forEach((r) => {
        big(70 / CAP); r.w1 = c.measureText(r.name).width; ital(70 / ICAP); r.w2 = c.measureText(r.year).width;
        const was = r.period; r.period = r.w1 + GAP1 + r.w2 + GAP2; r.pos = r.init ? r.pos * r.period / was : r.period * ((r.i * .618 + .17) % 1); r.init = true;
      });
      if (!org) org = W / 2;
      if (!raf) draw();
    }

    /* ---------- the heights, for a swell centred on row number `at` (a fraction is between two rows) ---------- */
    const bell = (i, at) => Math.exp(-((i - at) ** 2) / (2 * REACH * REACH));
    const heights = (at) => { const w = R.map((r) => 1 + (W < H ? SWELL * .5 : SWELL) * amp * bell(r.i, at)), s = w.reduce((a, b) => a + b, 0); return w.map((v) => v / s); };
    /* the centre that puts its own row exactly under y: so the largest row is always the one under the cursor */
    const whereIs = (at) => { const h = heights(at), p = at + .5, n = clamp(Math.floor(p), 0, N - 1); let y = 0; for (let i = 0; i < n; i++) y += h[i]; return y + (p - n) * h[n]; };
    const centreFor = (y) => { let a = -.5, b = N - .5; for (let n = 0; n < 22; n++) { const m = (a + b) / 2; if (whereIs(m) < y) a = m; else b = m; } return (a + b) / 2; };

    function step(dt) {
      amp += (1 - amp) * Math.min(1, dt * 1.4);
      let to;
      if (over) { to = centreFor(my / H); idle = 0; }
      else if (key >= 0) { to = key; idle = 0; }
      else {      // wander, picking up gently from wherever the cursor left it
        if (!idle) ph = Math.acos(clamp(1 - 2 * f / (N - 1), -1, 1));
        idle = Math.min(1, idle + dt / 2.5); ph = (ph + dt * idle * TAU / LAP) % TAU; to = (N - 1) / 2 * (1 - Math.cos(ph));
      }
      f += (to - f) * (1 - Math.exp(-dt * 5));
      // growing from the point under the cursor: moving that point never moves the type
      const hs = heights(f), o = org + ((over ? mx : W / 2) - org) * (1 - Math.exp(-dt * 4));
      R.forEach((r, i) => {
        const s = Math.max(.05, hs[i] * H / 100); r.near = bell(i, f);
        r.pos += (o - org) / s - r.dir * mix(REST, FAST, r.near * r.near) * dt / s;
        r.pos = ((r.pos % r.period) + r.period) % r.period;
      });
      org = o;
    }

    function draw() {
      c.clearRect(0, 0, W, H); c.textBaseline = "alphabetic"; c.textAlign = "left";
      const hs = reduce ? R.map(() => 1 / N) : heights(f), at = reduce ? Math.max(16, W * .03) : org;
      let y = 0;
      R.forEach((r, i) => {
        const h = hs[i] * H; r.top = y; r.h = h; r.el.style.top = y.toFixed(1) + "px"; r.el.style.height = h.toFixed(1) + "px";
        const s = reduce ? Math.min(h / 100, W * .94 / r.period) : h / 100, base = y + h / 2 + 35 * s;
        const glow = reduce ? (i === lit ? 1 : 0) : clamp((r.near - .6) / .32, 0, 1) * clamp(amp * 1.4 - .4, 0, 1);
        c.fillStyle = `rgb(${r.col.map((v) => Math.round(v * glow))})`;
        let u = -r.pos; const left = -at / s, right = (W - at) / s;
        while (u > left) u -= r.period; while (u + r.period < left) u += r.period;
        if (reduce) u = 0;
        for (; u < right; u += r.period) {
          big(70 / CAP * s); c.fillText(r.name, at + u * s, base);
          ital(70 / ICAP * s); c.fillText(r.year, at + (u + r.w1 + GAP1) * s, base);
          if (reduce) break;
        }
        y += h;
        if (i < N - 1) { c.fillStyle = "rgba(0,0,0,.14)"; c.fillRect(0, Math.round(y) - 1, W, 1); }
      });
    }

    const tick = (now) => { raf = 0; if (!sec.isConnected || !seen) return; const dt = Math.min(.05, (now - last) / 1000); last = now; step(dt); draw(); raf = requestAnimationFrame(tick); };
    const start = () => { if (!raf && seen && !reduce && sec.isConnected) { last = performance.now(); raf = requestAnimationFrame(tick); } };

    /* ---------- cursor, keyboard, tap (a tap is just the link) ---------- */
    let sx = null, sy = null;
    const light = (i) => { if (reduce && i !== lit) { lit = i; draw(); } };
    const moved = (e) => {
      if (e.pointerType === "touch") return;
      const real = sx !== null && (e.screenX !== sx || e.screenY !== sy); sx = e.screenX; sy = e.screenY;      // a scroll under a still mouse also reports a "move": ignore it
      const b = wall.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top, inside = !!(e.target.closest && e.target.closest(".iw-wall"));
      if (!inside) over = false; else if (real) { over = true; mx = clamp(x, 0, W); my = clamp(y, 0, H); }
      light(inside ? R.findIndex((r) => y >= r.top && y < r.top + r.h) : -1);
    };
    if (fine) {
      const ons = [[document, "pointermove", moved], [document.documentElement, "pointerleave", () => { over = false; light(-1); }], [window, "scroll", () => { over = false; }]];      // scrolling lets the wall go until the mouse moves again
      ons.forEach(([on, name, fn]) => { const h = (e) => { if (sec.isConnected) fn(e); else on.removeEventListener(name, h); }; on.addEventListener(name, h, { passive: true }); });
    }
    R.forEach((r) => {
      r.el.addEventListener("focus", () => { if (r.el.matches(":focus-visible")) { key = r.i; light(r.i); } });
      r.el.addEventListener("blur", () => { key = -1; light(-1); });
      r.el.addEventListener("click", (e) => { if (!e.metaKey && !e.ctrlKey && !e.shiftKey) cameFrom = true; });
    });

    measure();
    if (document.fonts && document.fonts.load) Promise.all([document.fonts.load('800 100px "Bricolage"'), document.fonts.load('italic 300 100px "Fraunces"', "2026")]).then(measure, () => {});
    if (window.ResizeObserver) new ResizeObserver(() => { if (sec.isConnected) measure(); }).observe(wall); else addEventListener("resize", () => sec.isConnected && measure());
    if ("IntersectionObserver" in window) new IntersectionObserver((e) => { seen = e[e.length - 1].isIntersecting; if (seen) start(); else over = false; }).observe(wall);
    else { seen = true; start(); }
    sec.sim = { step: (s) => { for (let t = 0; t < s; t += 1 / 60) step(1 / 60); draw(); }, rows: R, at: (x, y) => { over = y != null; mx = x; my = y; }, over: () => over };
  }

  window.INDEXWALL = { render, wire, took: () => { const v = cameFrom; cameFrom = false; return v; } };
})();
