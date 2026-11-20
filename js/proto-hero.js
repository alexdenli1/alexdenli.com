/* Prototype opening: ALEX DENLI filling the width, with the work moving inside the letters and faintly behind them.
   - Inside the letters: a strip of project images drifting left to right, with cream showing in the gaps.
   - Behind: two slow rows of the same work, very dim, brightening under the cursor like a torch.
   - Underneath: the four disciplines spread evenly across the name's width. Hovering one swaps the work
     inside and behind the name for that kind of work.
   - Scrolling shrinks the name up into the nav logo; the stage is sticky, so scrolling stays native. */
(() => {
  "use strict";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const DISC = [
    { label: "Graphics", cat: "graphic-design" },
    { label: "Products", cat: "product-design" },
    { label: "UX/UI", cat: "ux-ui" },
    { label: "E-commerce", cat: "e-commerce" }
  ];
  const I = (p) => "images/" + p;
  const SETS = {
    "product-design": ["xfly/hero.jpg", "relinquit/hero-case.webp", "shield/hero-render.webp", "aeropress/machine.webp", "relinquit/exploded.webp", "shield/exploded.webp", "aeropress/hero.jpg", "relinquit/hero.jpg", "shield/hero.jpg"].map(I),
    "graphic-design": ["adverts/hero.jpg", "signature-logo/thumb.webp", "signature-logo/hero.jpg", "adverts/thumb.webp"].map(I),
    "ux-ui": ["rescue/hero.jpg", "relinquit/s1.webp", "relinquit/s3.webp", "rescue/hero-1920.jpg", "relinquit/s5.webp", "relinquit/s7.webp", "relinquit/s9.webp"].map(I),
    // PLACEHOLDER until Alex sends Amazon store / listing images: the brands he sells for, as tiles
    "e-commerce": null,
    all: ["xfly/hero.jpg", "adverts/hero.jpg", "relinquit/hero-case.webp", "rescue/hero.jpg", "signature-logo/hero.jpg", "shield/hero-render.webp", "aeropress/machine.webp", "relinquit/s3.webp", "aeropress/hero.jpg"].map(I)
  };

  let poke = null;                       // redraw when a picture finishes loading

  function html() {
    return `<section class="ph" aria-label="Alex Denli">
      <div class="ph-stage"><div class="ph-move">
        <canvas class="ph-cv" aria-hidden="true"></canvas>
        <h1 class="ph-name">Alex Denli</h1>
        <ul class="ph-disc">${DISC.map((d) => `<li><a href="#/work/${d.cat}" data-cat="${d.cat}">${esc(d.label)}</a></li>`).join("")}</ul>
      </div></div></section>`;
  }

  function wire() {
    const sec = document.querySelector(".ph"); if (!sec) return;
    const cv = sec.querySelector(".ph-cv"), cx = cv.getContext("2d"), move = sec.querySelector(".ph-move"), row = sec.querySelector(".ph-disc");
    const root = document.documentElement;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const S = window.SITE || {};
    const NAME = String((S.owner && S.owner.name) || "Alex Denli").toUpperCase();
    root.classList.add("ph-on");
    if (reduce) root.style.setProperty("--ph-logo", "1");

    /* ---------- pictures: loaded once, shrunk to small bitmaps so each frame is cheap ---------- */
    const cache = new Map();
    const bitmap = (src) => {
      if (cache.has(src)) return cache.get(src);
      const rec = { ok: false, c: null };
      cache.set(src, rec);
      const im = new Image(); im.decoding = "async";
      im.onload = () => { const s = Math.min(1, 640 / im.naturalHeight), c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(im.naturalWidth * s)); c.height = Math.max(1, Math.round(im.naturalHeight * s));
        const g = c.getContext("2d"); g.imageSmoothingQuality = "high"; g.drawImage(im, 0, 0, c.width, c.height); rec.c = c; rec.ok = true; poke && poke(); };
      im.src = src;
      return rec;
    };
    /* the e-commerce placeholder: brand logos on black tiles */
    const tile = (src) => {
      const key = "tile:" + src; if (cache.has(key)) return cache.get(key);
      const rec = { ok: false, c: null }; cache.set(key, rec);
      const im = new Image();
      im.onload = () => { const c = document.createElement("canvas"); c.width = 960; c.height = 600; const g = c.getContext("2d");
        g.fillStyle = "#095838"; g.fillRect(0, 0, 960, 600);   // the site's green, so the letters still read
        const s = Math.min(560 / im.naturalWidth, 220 / im.naturalHeight); g.drawImage(im, (960 - im.naturalWidth * s) / 2, (600 - im.naturalHeight * s) / 2, im.naturalWidth * s, im.naturalHeight * s);
        rec.c = c; rec.ok = true; poke && poke(); };
      im.src = src; return rec;
    };
    const setFor = (key) => key === "e-commerce" ? (S.brands || []).map((b) => tile(b.logo)) : (SETS[key] || SETS.all).map(bitmap);
    Object.keys(SETS).forEach((k) => setFor(k));      // warm everything up front so hovering is instant

    /* ---------- layout ---------- */
    let W = 0, H = 0, dpr = 1, fs = 0, nameW = 0, top = 0, bot = 0, base = 0, mask = null, layer = null, lg = null, spot = null, sg = null;
    const fit = () => {
      dpr = Math.min(2, devicePixelRatio || 1);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      const pad = Math.max(24, W * 0.022);
      cx.setTransform(1, 0, 0, 1, 0, 0);
      cx.font = `800 100px Bricolage, "Helvetica Neue", Arial, sans-serif`;
      if ("letterSpacing" in cx) cx.letterSpacing = "-4px";
      const m0 = cx.measureText(NAME);
      fs = Math.min((W - 2 * pad) / m0.width * 100, H * 0.36);
      cx.font = `800 ${fs}px Bricolage, "Helvetica Neue", Arial, sans-serif`;
      if ("letterSpacing" in cx) cx.letterSpacing = `${-0.04 * fs}px`;
      const m = cx.measureText(NAME);
      nameW = m.width;
      const asc = m.actualBoundingBoxAscent, desc = m.actualBoundingBoxDescent;
      base = Math.round(H * 0.47 + (asc - desc) / 2);
      top = base - asc; bot = base + desc;
      // the letters as a mask, drawn once
      mask = document.createElement("canvas"); mask.width = cv.width; mask.height = cv.height;
      const mg = mask.getContext("2d"); mg.scale(dpr, dpr); mg.font = cx.font; if ("letterSpacing" in mg) mg.letterSpacing = cx.letterSpacing;
      mg.textAlign = "center"; mg.textBaseline = "alphabetic"; mg.fillStyle = "#fff"; mg.fillText(NAME, W / 2, base);
      layer = document.createElement("canvas"); layer.width = cv.width; layer.height = cv.height; lg = layer.getContext("2d");
      spot = document.createElement("canvas"); spot.width = cv.width; spot.height = cv.height; sg = spot.getContext("2d");
      sec.style.setProperty("--ph-w", nameW.toFixed(0) + "px");
      sec.style.setProperty("--ph-row", (bot + Math.max(18, H * 0.035)).toFixed(0) + "px");
      sec.style.setProperty("--ph-cy", ((top + bot) / 2).toFixed(0) + "px");
    };

    /* ---------- drawing ---------- */
    let cur = "all", next = null, mix = 0, t0 = performance.now(), last = t0;
    let mx = -1, my = -1, sx = -1, sy = -1, raf = 0, gone = false, prog = 0;
    // draw one set of pictures as a row of height h, drifting right at speed v, gap g
    const strip = (g, set, y, h, v, t, gap, alpha) => {
      const ok = set.filter((r) => r.ok); if (!ok.length) return;
      let len = 0; const ws = ok.map((r) => { const w = h * r.c.width / r.c.height; len += w + gap; return w; });
      let x = ((t * v) % len) - len;
      g.globalAlpha = alpha;
      while (x < W) { for (let i = 0; i < ok.length && x < W; i++) { if (x + ws[i] > 0) g.drawImage(ok[i].c, x, y, ws[i], h); x += ws[i] + gap; } }
      g.globalAlpha = 1;
    };
    const rows = (g, set, t, alpha) => { strip(g, set, 0, H / 2 - 3, 16, t, 6, alpha); strip(g, set.slice().reverse(), H / 2 + 3, H / 2 - 3, 27, t + 40, 6, alpha); };

    const frame = (now) => {
      raf = 0;
      if (!sec.isConnected) return stop();
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const t = reduce ? 4 : (now - t0) / 1000;
      if (next) { mix = Math.min(1, mix + dt / 0.6); if (mix >= 1) { cur = next; next = null; mix = 0; } }
      const A = setFor(cur), B = next ? setFor(next) : null;
      if (mx >= 0) { sx += (mx - sx) * Math.min(1, dt * 6); sy += (my - sy) * Math.min(1, dt * 6); }
      const ox = mx >= 0 ? (sx / W - 0.5) * -24 : 0;          // the picture inside the letters leans against the cursor

      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx.fillStyle = "#000"; cx.fillRect(0, 0, W, H);
      // behind: dim rows, brighter under the cursor
      const fade = Math.max(0, 1 - prog * 3.2), dim = 0.09 * fade;
      rows(cx, A, t, dim * (1 - mix)); if (B) rows(cx, B, t, dim * mix);
      if (mx >= 0 && fade > 0) {
        sg.setTransform(dpr, 0, 0, dpr, 0, 0); sg.clearRect(0, 0, W, H);
        rows(sg, A, t, 0.62 * (1 - mix)); if (B) rows(sg, B, t, 0.62 * mix);
        const r = Math.max(220, W * 0.15), gr = sg.createRadialGradient(sx, sy, 0, sx, sy, r);
        gr.addColorStop(0, "rgba(0,0,0,1)"); gr.addColorStop(0.55, "rgba(0,0,0,.5)"); gr.addColorStop(1, "rgba(0,0,0,0)");
        sg.globalCompositeOperation = "destination-in"; sg.fillStyle = gr; sg.fillRect(0, 0, W, H); sg.globalCompositeOperation = "source-over";
        cx.setTransform(1, 0, 0, 1, 0, 0); cx.globalAlpha = fade; cx.drawImage(spot, 0, 0); cx.globalAlpha = 1; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      // inside the letters: cream, with the work drifting through
      lg.setTransform(dpr, 0, 0, dpr, 0, 0); lg.globalCompositeOperation = "source-over";
      lg.fillStyle = "#EEE9E3"; lg.fillRect(0, 0, W, H);
      const bh = (bot - top) * 1.18, by = top - (bot - top) * 0.09;
      lg.save(); lg.translate(ox, 0);
      strip(lg, A, by, bh, 70, t, Math.max(8, bh * 0.035), 0.84 * (1 - mix)); if (B) strip(lg, B, by, bh, 70, t, Math.max(8, bh * 0.035), 0.84 * mix);
      lg.restore();
      lg.setTransform(1, 0, 0, 1, 0, 0); lg.globalCompositeOperation = "destination-in"; lg.drawImage(mask, 0, 0); lg.globalCompositeOperation = "source-over";
      cx.setTransform(1, 0, 0, 1, 0, 0); cx.drawImage(layer, 0, 0);
      if (!reduce && !gone) raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf && !gone && sec.isConnected) raf = requestAnimationFrame(frame); };

    /* ---------- scroll: the name shrinks into the nav logo ---------- */
    const navLogo = document.querySelector(".nav-home .logo");
    const scroll = () => {
      const r = sec.getBoundingClientRect(), span = Math.max(1, sec.offsetHeight - innerHeight);
      prog = reduce ? 0 : Math.max(0, Math.min(1, -r.top / span));
      gone = r.bottom < 0;
      const e = prog * prog * (3 - 2 * prog);
      const lr = navLogo ? navLogo.getBoundingClientRect() : { width: 154, top: 14, height: 40 };
      const cy = (top + bot) / 2, s = 1 + ((lr.width * 0.98) / Math.max(1, nameW) - 1) * e, dy = (lr.top + lr.height * 0.3 - cy) * e;
      move.style.transform = prog ? `translate3d(0,${dy.toFixed(1)}px,0) scale(${s.toFixed(4)})` : "";
      move.style.opacity = prog > 0.86 ? String(Math.max(0, 1 - (prog - 0.86) / 0.12)) : "1";
      row.style.opacity = String(Math.max(0, 1 - prog * 3));
      if (!reduce) root.style.setProperty("--ph-logo", prog > 0.84 ? String(Math.min(1, (prog - 0.84) / 0.14)) : "0");
      if (reduce) kick();
      if (!gone) kick();
    };

    /* ---------- hover on a discipline swaps the work ---------- */
    let back = 0;
    const show = (key) => { clearTimeout(back); if (key === (next || cur)) return; if (next) cur = next; next = key; mix = 0; kick(); };
    row.querySelectorAll("a").forEach((a) => {
      a.addEventListener("pointerenter", () => { row.querySelectorAll("a").forEach((b) => b.classList.toggle("on", b === a)); show(a.dataset.cat); });
      a.addEventListener("focus", () => show(a.dataset.cat));
    });
    row.addEventListener("pointerleave", () => { back = setTimeout(() => { row.querySelectorAll("a").forEach((b) => b.classList.remove("on")); show("all"); }, 300); });
    const pm = (e) => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; if (sx < 0) { sx = mx; sy = my; } kick(); };
    const pl = () => { mx = my = -1; };
    sec.addEventListener("pointermove", pm); sec.addEventListener("pointerleave", pl);

    let rs = 0;
    const resize = () => { clearTimeout(rs); rs = setTimeout(() => { if (!sec.isConnected) return; fit(); scroll(); kick(); }, 120); };
    addEventListener("scroll", scroll, { passive: true }); addEventListener("resize", resize);
    function stop() {
      cancelAnimationFrame(raf); raf = 0; removeEventListener("scroll", scroll); removeEventListener("resize", resize);
      root.classList.remove("ph-on"); root.style.removeProperty("--ph-logo");
    }
    poke = () => { if (!sec.isConnected) return; if (reduce) { raf = 0; } kick(); };
    const go = () => { if (!sec.isConnected) return; fit(); scroll(); kick(); if (reduce) setTimeout(kick, 600); };
    (document.fonts && document.fonts.load ? document.fonts.load(`800 200px Bricolage`).catch(() => {}) : Promise.resolve()).then(go);
    return stop;
  }

  window.PROTOHERO = { html, wire };
})();
