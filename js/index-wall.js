/* Index of works: a wall of project names, at the foot of the home page.
   Left alone, every row drifts sideways (alternate rows in opposite directions, with the product between the names)
   while one slow swell travels down the wall: each row in turn grows, takes its project's colour, and shrinks again.
   Point at a row and everything stops: that row opens to show the project's hero shot and product highlights, the
   others close up into quiet grey strips. Leave, and the wall carries on from where it stopped.
   On touch screens the first tap opens a row and the second opens the project; a tap outside closes it.

   Heights are shared so that whatever row is under the pointer stays under it while it opens: no row is ever
   thinner than THIN of the wall, moving or not.

   The names and products are painted on one canvas; the rows themselves are ordinary links (data-vt: see app.js). */
(() => {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  /* each open row: the hero, the product standing on the project's colour, and (on wide screens) detail shots */
  const DETAIL = { relinquit: ["images/relinquit/end.webp"], shield: ["images/shield/lift.webp"], aeropress: ["images/aeropress/head.webp"] };
  const RIDER = { relinquit: "images/relinquit/hero-case.webp" };      // the product itself (else the chapter picture or cut-out)
  const rider = (p) => RIDER[p.slug] || p.chapter || (p.cut && p.thumb) || "";

  const THIN = .055, SWELL = .8, LAP = 17;      // thinnest row; strength of the swell; seconds for it to travel the wall
  const TAU = Math.PI * 2, clamp = (v, a, b) => Math.min(b, Math.max(a, v)), mix = (a, b, t) => a + (b - a) * t;
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  let list = [], cameFrom = false;

  function render(projects, cat, link, ink) {
    list = projects.slice();
    return `<section class="iw" aria-label="Index of works"><h2>Index of works</h2>
      <div class="iw-wall"><canvas class="iw-cv" aria-hidden="true"></canvas>
      <ol>${list.map((p) => `<li><a class="iw-row" href="${link(p)}" data-vt data-slug="${esc(p.slug)}" style="--c:${esc(p.colour || "#000000")};--k:${esc(ink(p.colour || "#000000"))}"><span class="iw-card">
        <span class="iw-hero"><img alt="" data-src="${esc(p.hero)}" draggable="false"></span>
        ${(DETAIL[p.slug] || []).map((src) => `<span class="iw-hi"><img alt="" data-src="${esc(src)}" draggable="false"></span>`).join("")}
        <span class="iw-txt"><b>${esc(p.title).split(" ").map((w) => `<span><i>${w}</i></span>`).join(" ")}</b>${rider(p) ? `<img class="iw-cut" alt="" draggable="false">` : ""}
          <span class="iw-meta">${esc(cat(p))}, <span>${esc(p.year)}</span></span><span class="iw-go">View project <i aria-hidden="true">&rarr;</i></span></span></span></a></li>`).join("")}</ol></div></section>`;
  }

  function wire() {
    const sec = document.querySelector(".iw"); if (!sec) return;
    const wall = sec.querySelector(".iw-wall"), cv = sec.querySelector(".iw-cv"), c = cv.getContext("2d");
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches, reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const N = list.length, FAM = '"Bricolage", "Helvetica Neue", Arial, sans-serif';
    let W = 1, H = 1, CAP = .72, hs = new Array(N).fill(1 / N), phase = 0, amp = 0, speed = 1, cur = -1, last = 0, raf = 0, seen = false, loaded = false, dwell = 0, away = 0;

    const R = [...sec.querySelectorAll(".iw-row")].map((el, i) => ({ el, i, name: list[i].title.toUpperCase(), col: rgb(list[i].colour || "#000000"), v: 46 + (i * 5 % 7) * 7, dir: i % 2 ? 1 : -1, pos: 0, w1: 1, img: null, ratio: 0, open: 0, top: 0, h: 0 }));

    /* widths are kept for a row 100 tall: the caps fill .7 of it, the product .92 */
    const FS = () => 70 / CAP;
    function measure() {
      W = wall.clientWidth; H = wall.clientHeight; if (!W || !H) return;
      const d = Math.min(devicePixelRatio || 1, 2); cv.width = Math.round(W * d); cv.height = Math.round(H * d); c.setTransform(d, 0, 0, d, 0, 0);
      c.font = `800 100px ${FAM}`; if ("letterSpacing" in c) c.letterSpacing = "0px";
      CAP = (c.measureText("H").actualBoundingBoxAscent || 72) / 100;
      const thin = innerWidth <= 820 || W / H < 1;
      wall.style.setProperty("--big", Math.ceil(H * (1 - (N - 1) * THIN)) + "px");
      R.forEach((r) => { c.font = `800 100px ${FAM}`; if ("letterSpacing" in c) c.letterSpacing = "-4px"; r.w1 = c.measureText(r.name).width * FS() / 100; period(r); });
      // the opened name: as large as its column allows, one word to a line (on phones, one line)
      R.forEach((r) => {
        const box = r.el.querySelector(".iw-txt"), b = box.querySelector("b"), cs = getComputedStyle(box);
        b.style.fontSize = "100px"; const words = [...b.querySelectorAll("i")], wide = thin ? Math.max(b.scrollWidth, words.reduce((s, w) => s + w.offsetWidth, 0) + 26 * (words.length - 1)) : Math.max(...words.map((w) => w.offsetWidth));
        const room = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        b.style.fontSize = Math.floor(Math.min(100 * room / wide, thin ? H * .1 : H * Math.min(.22, .31 / words.length))) + "px";
        box.style.setProperty("--cut", Math.max(60, box.clientHeight * .94 - b.offsetHeight - parseFloat(cs.paddingTop)) + "px");      // the product takes what is left under the name
      });
      if (reduce) R.forEach((r) => { r.pos = 0; });
      draw();
    }
    const GAP = 34;
    const period = (r) => { r.pw = r.ratio ? r.ratio * 92 : 0; r.period = r.w1 + GAP + (r.pw ? r.pw + GAP : GAP * .6); if (!r.init) { r.pos = r.period * ((r.i * .618 + .17) % 1); r.init = true; } };

    /* the product pictures, trimmed to what can be seen */
    function trim(im) {
      const k = Math.min(1, 1300 / Math.max(im.naturalWidth, im.naturalHeight)), w = Math.round(im.naturalWidth * k), h = Math.round(im.naturalHeight * k);
      const t = document.createElement("canvas"); t.width = w; t.height = h; const g = t.getContext("2d", { willReadFrequently: true }); g.drawImage(im, 0, 0, w, h);
      const px = g.getImageData(0, 0, w, h).data; let x0 = w, x1 = 0, y0 = h, y1 = 0;
      for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) if (px[(y * w + x) * 4 + 3] > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 <= x0) return null;
      const o = document.createElement("canvas"); o.width = x1 - x0 + 2; o.height = y1 - y0 + 2; o.getContext("2d").drawImage(t, -x0, -y0); return o;
    }
    const small = (im, h) => { if (im.height <= h) return im; const o = document.createElement("canvas"); o.height = h; o.width = Math.round(im.width * h / im.height); const g = o.getContext("2d"); g.imageSmoothingQuality = "high"; g.drawImage(im, 0, 0, o.width, h); return o; };      // the copy that rides along the row
    function load() {
      if (loaded) return; loaded = true;
      R.forEach((r) => {
        const src = rider(list[r.i]); if (!src) return;
        const im = new Image(); im.onload = () => { r.img = trim(im); if (r.img) { r.ratio = Math.min(2.2, r.img.width / r.img.height); period(r); if (reduce) r.pos = 0; const cut = r.el.querySelector(".iw-cut"); r.img.toBlob((b) => { if (b) cut.src = URL.createObjectURL(b); }, "image/webp", .92); r.img = small(r.img, 460); } if (!raf) draw(); }; im.src = src;
      });
      sec.querySelectorAll("img[data-src]").forEach((im) => { im.src = im.dataset.src; im.removeAttribute("data-src"); im.decode && im.decode().catch(() => {}); });
    }

    /* ---------- where every row is heading ---------- */
    function targets() {
      if (cur >= 0) return R.map((r) => (r.i === cur ? 1 - (N - 1) * THIN : THIN));
      const w = R.map((r) => Math.exp(SWELL * amp * Math.cos(TAU * (r.i / N - phase)))), sum = w.reduce((a, b) => a + b, 0);
      return w.map((v) => v / sum);
    }
    function step(dt) {
      speed += ((cur >= 0 ? 0 : 1) - speed) * Math.min(1, dt * 7);
      if (!reduce) { phase = (phase + dt * speed / LAP) % 1; amp += (1 - amp) * Math.min(1, dt * 1.6); }
      const t = targets(), k = reduce ? 1 : 1 - Math.exp(-dt * 8);      // one rate for all rows, so the one under the pointer stays there
      R.forEach((r, i) => {
        hs[i] += (t[i] - hs[i]) * k; r.open += ((i === cur ? 1 : 0) - r.open) * k;
        if (!reduce) { r.pos += r.dir * -r.v * speed * dt / Math.max(.12, hs[i] * H / 100); r.pos = ((r.pos % r.period) + r.period) % r.period; }
      });
    }

    function draw() {
      c.clearRect(0, 0, W, H); c.imageSmoothingQuality = "medium"; c.textBaseline = "alphabetic"; c.textAlign = "left";
      const quiet = clamp(R.reduce((s, r) => s + r.open, 0), 0, 1);
      let y = 0;
      R.forEach((r, i) => {
        const h = hs[i] * H; r.top = y; r.h = h;
        r.el.style.top = y.toFixed(2) + "px"; r.el.style.height = h.toFixed(2) + "px";
        const a = 1 - clamp(r.open * 2.2, 0, 1), s = Math.min(Math.min(h, H * .3) / 100, reduce ? W * .94 / r.period : 9), mid = y + h / 2;
        if (a > .01) {
          const glow = clamp((hs[i] * N - 1.15) / .6, 0, 1) * (1 - quiet), grey = quiet * (1 - r.open);
          const col = r.col.map((v) => Math.round(mix(v * glow, 176, grey)));
          c.save(); c.beginPath(); c.rect(0, y, W, h); c.clip();
          c.globalAlpha = a; c.fillStyle = `rgb(${col})`; const fs = FS() * s; c.font = `800 ${fs.toFixed(2)}px ${FAM}`; if ("letterSpacing" in c) c.letterSpacing = (-.04 * fs).toFixed(2) + "px";
          // the row is scaled about the middle of the screen (about the left edge when nothing moves)
          const org = reduce ? Math.max(16, W * .03) : W / 2; let u = -r.pos; const left = -org / s, right = (W - org) / s;
          while (u > left) u -= r.period; while (u + r.period < left) u += r.period;
          if (reduce) u = 0;
          for (; u < right; u += r.period) {
            c.fillText(r.name, org + u * s, mid + 35 * s);
            if (r.img) { const ph = r.pw / (r.img.width / r.img.height), x = org + (u + r.w1 + GAP) * s; c.globalAlpha = a * (1 - .75 * grey); c.drawImage(r.img, x, mid - ph / 2 * s, r.pw * s, ph * s); c.globalAlpha = a; }
            if (reduce) break;
          }
          c.restore();
        }
        y += h;
        if (i < N - 1) { c.fillStyle = "rgba(0,0,0,.14)"; c.fillRect(0, Math.round(y) - 1, W, 1); }
      });
    }

    const tick = (now) => {
      raf = 0; if (!sec.isConnected || !seen) return;
      const dt = Math.min(.05, (now - last) / 1000); last = now; step(dt); draw(); raf = requestAnimationFrame(tick);
    };
    const start = () => { if (!raf && seen && !reduce && sec.isConnected) { last = performance.now(); raf = requestAnimationFrame(tick); } };
    const set = (i) => {
      if (i === cur) return; cur = i;
      R.forEach((r) => r.el.classList.toggle("on", r.i === i)); sec.classList.toggle("held", i >= 0);
      if (i >= 0) load();
      if (reduce) { step(0); draw(); } else start();
    };

    /* ---------- pointing, tabbing, tapping ---------- */
    let touch = false;
    sec.addEventListener("pointerdown", (e) => { touch = e.pointerType !== "mouse"; }, true);
    if (fine) {
      const rowAt = (e) => { const el = e.target.closest && e.target.closest(".iw-row"); return el ? R.findIndex((r) => r.el === el) : -1; };
      wall.addEventListener("pointerover", (e) => {
        if (e.pointerType === "touch") return; const i = rowAt(e); if (i < 0) return; clearTimeout(away); clearTimeout(dwell);
        if (cur >= 0) dwell = setTimeout(() => set(i), 60); else dwell = setTimeout(() => set(i), 110);      // a moment, so passing over the wall doesn't set it off
      });
      wall.addEventListener("pointerleave", () => { clearTimeout(dwell); clearTimeout(away); away = setTimeout(() => set(-1), 180); });
    }
    R.forEach((r) => {
      r.el.addEventListener("focus", () => { if (r.el.matches(":focus-visible")) { clearTimeout(away); set(r.i); } });
      r.el.addEventListener("blur", () => { if (cur === r.i && !(fine && wall.matches(":hover"))) set(-1); });
      r.el.addEventListener("click", (e) => {
        if (touch && cur !== r.i) { e.preventDefault(); e.stopPropagation(); set(r.i); return; }
        if (!e.metaKey && !e.ctrlKey && !e.shiftKey) cameFrom = true;
      });
    });
    const outside = (e) => { if (!sec.isConnected) { document.removeEventListener("pointerdown", outside); return; } if (cur >= 0 && e.pointerType !== "mouse" && !e.target.closest(".iw-wall")) set(-1); };
    document.addEventListener("pointerdown", outside);

    measure();
    if (document.fonts && document.fonts.load) document.fonts.load(`800 100px "Bricolage"`).then(measure, () => {});
    if (window.ResizeObserver) new ResizeObserver(() => { if (sec.isConnected) measure(); }).observe(wall); else addEventListener("resize", () => sec.isConnected && measure());
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((e) => { seen = e[e.length - 1].isIntersecting; if (seen) start(); else if (cur >= 0) set(-1); }).observe(wall);
      new IntersectionObserver((e, o) => { if (e.some((x) => x.isIntersecting)) { load(); o.disconnect(); } }, { rootMargin: "900px" }).observe(wall);
    } else { seen = true; load(); start(); }
    sec.sim = { step: (s) => { for (let t = 0; t < s; t += 1 / 60) step(1 / 60); draw(); }, set, rows: R };
  }

  window.INDEXWALL = { render, wire, took: () => { const v = cameFrom; cameFrom = false; return v; } };
})();
