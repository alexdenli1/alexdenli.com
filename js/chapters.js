/* Home: one project after another, in data.js order, on one quiet grid.
   The page is split down the middle: the product on one half, its year, title and one line of
   information on the other, changing sides from project to project. Nothing overlaps, every product
   is shown at about the same size, and the space between projects is always the same.

   One line runs down through all the projects, drawn as the page scrolls, in the site's green with a faint
   electric crackle. At each product it makes its own shape (a loop, a thread through the posters, a wave,
   an orbit, a frame, a figure of eight, a coil) and finishes it while that product is on screen, before
   travelling on to the next. It is painted on a canvas behind the products and the words.

   Each project has a "View project" button whose line keeps reaching out to its arrow.
   Clicking a product, a title or a button opens the project with the picture growing into the page's
   hero (app.js does the transition; the links carry data-vt for it). */
(() => {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const picOf = (p) => p.chapter || (p.cut && p.thumb) || p.hero;
  const isCut = (p) => !!(p.chapter || (p.cut && p.thumb));
  /* the type on a project's colour: black or cream, whichever stands out more against it */
  const CREAM = "#EEE9E3";
  const lum = (hex) => {
    const v = parseInt(String(hex).slice(1), 16);
    const c = [v >> 16, (v >> 8) & 255, v & 255].map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const inkOn = (hex) => {
    if (!/^#[0-9a-f]{6}$/i.test(hex || "")) return CREAM;
    const L = lum(hex), withCream = (lum(CREAM) + 0.05) / (L + 0.05), withBlack = (L + 0.05) / 0.05;
    return withCream >= withBlack ? CREAM : "#000000";
  };

  /* project names are set one word to a line, so every name can be big */
  const linesOf = (t) => String(t).split(" ");

  /* ---------- the button: "View project", then a line that keeps reaching out to an arrow ---------- */
  const ARROW = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>`;
  const button = (href, slug, title) => `<a class="ch-go" href="${href}" data-vt data-slug="${slug}" aria-label="View project: ${esc(title)}"><span class="go-tx">View project</span><span class="go-line"></span>${ARROW}</a>`;

  function html(list) {
    const ch = list.map((p, i) => {
      const href = "#/project/" + p.slug, slug = esc(p.slug);
      return `<section class="ch${i % 2 ? " ch-alt" : ""}${isCut(p) ? " ch-cut" : ""}" data-slug="${slug}" aria-labelledby="ch-${slug}">
        <a class="ch-pic" href="${href}" data-vt data-slug="${slug}" tabindex="-1" aria-hidden="true">
          <img src="${esc(picOf(p))}" alt="" decoding="async" draggable="false"></a>
        <div class="ch-tx">
          <p class="ch-year">${esc(p.year)}</p>
          <h2 class="ch-title" id="ch-${slug}"><a href="${href}" data-vt data-slug="${slug}">${linesOf(p.title).map((l) => `<span>${esc(l)}</span>`).join(" ")}</a></h2>
          <p class="ch-info">${esc(p.summary || "")}</p>
          ${button(href, slug, p.title)}
        </div>
      </section>`;
    }).join("");
    return `<div class="chs" aria-label="Selected work"><div class="ch-line" aria-hidden="true"><canvas></canvas></div>${ch}</div>`;
  }

  /* every product is shown at roughly the same size: the same area of visible product, whatever the
     picture's proportions or the transparent margin around a cut-out, and never outside its half. */
  const SIZE = { adverts: 1.3 };   // a set of posters is partly gaps and wires, so it needs a little more
  const bounds = (im) => {
    if (im.__bb) return im.__bb;
    const s = 160 / Math.max(im.naturalWidth, im.naturalHeight), w = Math.max(1, Math.round(im.naturalWidth * s)), h = Math.max(1, Math.round(im.naturalHeight * s));
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(im, 0, 0, w, h);
    let d; try { d = x.getImageData(0, 0, w, h).data; } catch (e) { return (im.__bb = [0, 0, 1, 1]); }
    let x0 = w, y0 = h, x1 = 0, y1 = 0;
    for (let y = 0; y < h; y++) for (let k = 0; k < w; k++) if (d[(y * w + k) * 4 + 3] > 24) { if (k < x0) x0 = k; if (k > x1) x1 = k; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    return (im.__bb = x1 < x0 ? [0, 0, 1, 1] : [x0 / w, y0 / h, (x1 + 1) / w, (y1 + 1) / h]);
  };

  function fit(secs) {
    const phone = innerWidth <= 820;
    secs.forEach((sec) => {
      const pic = sec.querySelector(".ch-pic"), im = pic.querySelector("img"), info = sec.querySelector(".ch-info");
      const w = pic.clientWidth, h = pic.clientHeight;
      if (im.complete && im.naturalWidth) {
        const [x0, y0, x1, y1] = bounds(im), nw = im.naturalWidth, nh = im.naturalHeight, ca = ((x1 - x0) * nw) / ((y1 - y0) * nh);
        const area = (phone ? 0.62 * w * w : 0.3 * innerHeight * innerHeight) * Math.pow(SIZE[sec.dataset.slug] || 1, 2);
        const vis = Math.min(Math.sqrt(area / ca), h, w / ca), ih = vis / (y1 - y0), iw = ih * nw / nh;
        im.style.width = iw.toFixed(1) + "px"; im.style.height = ih.toFixed(1) + "px";
        // the part that can be seen sits in the middle of its half
        im.style.left = (w / 2 - iw * (x0 + x1) / 2).toFixed(1) + "px"; im.style.top = (h / 2 - ih * (y0 + y1) / 2).toFixed(1) + "px";
      }
      // one line of information wherever it fits
      info.style.whiteSpace = phone ? "" : "nowrap";
      if (!phone && info.scrollWidth > info.clientWidth + 1) info.style.whiteSpace = "";
    });
  }

  /* ---------- the line: built as a list of points on the page ---------- */
  const TAU = Math.PI * 2;
  /* the shape each product gets; a project not named here takes the next one in turn */
  const SHAPE = { xfly: "loop", adverts: "thread", "signature-logo": "wave", rescue: "orbit", shield: "frame", aeropress: "coil", relinquit: "eight" };
  const TURN = ["loop", "wave", "orbit", "frame", "eight", "coil"];

  function build(wrap) {
    const W = wrap.clientWidth, H = wrap.clientHeight, R = wrap.getBoundingClientRect(), phone = innerWidth <= 820;
    const items = [...wrap.querySelectorAll(".ch")].map((sec, n) => {
      const im = sec.querySelector(".ch-pic img"); if (!im.complete || !im.naturalWidth) return null;
      const [x0, y0, x1, y1] = bounds(im), r = im.getBoundingClientRect();
      const v = { x0: r.left - R.left + r.width * x0, y0: r.top - R.top + r.height * y0, x1: r.left - R.left + r.width * x1, y1: r.top - R.top + r.height * y1 };
      return { ...v, cx: (v.x0 + v.x1) / 2, cy: (v.y0 + v.y1) / 2, shape: SHAPE[sec.dataset.slug] || TURN[n % TURN.length] };
    }).filter(Boolean);
    if (!items.length) return null;

    const P = [];      // [x, y]
    const add = (x, y) => P.push([x, y]);
    const at = () => P[P.length - 1];
    const bez = (p1, p2, p3, n = 28) => { const p0 = at(); for (let i = 1; i <= n; i++) { const t = i / n, u = 1 - t; add(u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]); } };
    const curve = (fn, n) => { for (let i = 1; i <= n; i++) add(...fn(i / n)); };
    const marks = [];
    let exit = [0, 1];

    items.forEach((it, n) => {
      const pad = Math.max(18, Math.min(it.x1 - it.x0, it.y1 - it.y0) * .1);
      const rx = Math.min((it.x1 - it.x0) / 2 + pad, it.cx - 6, W - 6 - it.cx), ry = (it.y1 - it.y0) / 2 + pad;
      const shape = it.shape;
      // arrive heading right, just above the product (a figure of eight arrives at its left end heading down, a thread at its left heading right)
      const A8 = Math.max(rx, Math.min(rx * 1.75, it.cx - 8, W - 8 - it.cx)), eight = shape === "eight";
      const thread = shape === "thread", ex = thread ? Math.max(8, it.x0 - pad * 1.6) : eight ? it.cx - A8 : it.cx, ey = eight || thread ? it.cy : it.y0 - pad, inn = eight ? [0, 1] : [1, 0];
      // the line begins here, at the first product, with a short lead-in from the left
      if (!n) { add(ex - Math.min(170, ex - 4), ey + 70); marks.push({ kind: "start", i: 0, it }); }
      const a = at();
      if (phone && n) {      // on a phone the words take the full width: keep to the right-hand margin between products
        const m = W - Math.max(8, parseFloat(getComputedStyle(wrap).paddingRight) * .45);
        bez([a[0] + exit[0] * 30, a[1] + exit[1] * 30], [m, a[1] + 10], [m, a[1] + 60], 18); P.push([m, ey - 70]);
        bez([m, ey], [ex - inn[0] * 40, ey - inn[1] * 40], [ex, ey], 16);
      } else { const d = Math.max(70, (ey - a[1]) * .5); const d2 = Math.max(80, d * .8); bez([a[0] + exit[0] * d, a[1] + exit[1] * d], [ex - inn[0] * d2, ey - inn[1] * d2], [ex, ey], 40); }
      marks.push({ kind: "enter", i: P.length - 1, it });

      const { cx, cy } = it, T = it.y0 - pad, B = it.y1 + pad;
      if (shape === "loop") {             // once round and a quarter, widening a little
        curve((t) => { const th = -Math.PI / 2 + t * 2.5 * Math.PI, g = 1 + .06 * t; return [cx + rx * g * Math.cos(th), cy + ry * g * Math.sin(th)]; }, 150);
        exit = [0, 1];
      } else if (shape === "thread") {    // a gentle wave threaded through the row, passing behind each poster
        const xe = Math.min(W - 8, it.x1 + pad * 1.6), amp = Math.min(ry * .3, 90);
        curve((t) => [ex + (xe - ex) * t, cy - amp * Math.sin(t * 3 * Math.PI) * Math.sin(t * Math.PI)], 180);
      } else if (shape === "wave") {      // swinging from side to side as it falls past the product
        curve((t) => [cx + rx * 1.05 * Math.sin(t * 3 * Math.PI), T + (B - T) * t], 160);
        exit = [-1, 0];
      } else if (shape === "spiral") {    // winding in twice, to finish behind the product
        curve((t) => { const th = -Math.PI / 2 + t * 2 * TAU, g = 1.32 - .75 * t; return [cx + rx * g * Math.cos(th), cy + ry * g * Math.sin(th)]; }, 200);
        exit = [1, 0];
      } else if (shape === "orbit") {     // two tilted orbits, like a planet's, passing behind the product
        const ox = Math.min(rx * 1.25, cx - 8, W - 8 - cx), oy = ry * .62;
        curve((t) => { const th = -Math.PI / 2 + t * 2.25 * TAU, a = .38 * Math.cos(Math.PI * t), x = ox * Math.cos(th), y = oy * Math.sin(th);
          return [cx + x * Math.cos(a) - y * Math.sin(a), cy + x * Math.sin(a) + y * Math.cos(a)]; }, 260);
        exit = [0, 1];
      } else if (shape === "frame") {     // a squared-off frame, once round and a quarter
        const sq = (v) => Math.sign(v) * Math.pow(Math.abs(v), .35);
        curve((t) => { const th = -Math.PI / 2 + t * 2.5 * Math.PI, g = 1 + .05 * t; return [cx + rx * g * sq(Math.cos(th)), cy + ry * g * sq(Math.sin(th))]; }, 220);
        exit = [0, 1];
      } else if (shape === "eight") {     // a figure of eight on its side, a loop either side of the product, crossing behind it
        curve((t) => { const u = -Math.PI / 2 + t * 3 * Math.PI; return [cx + A8 * Math.sin(u), cy - ry * .8 * Math.sin(2 * u)]; }, 240);
        exit = [0, 1];
      } else {                            // coil: three turns of a spring, down the product
        const k = 3, r2 = (B - T) / (k * 2 + 1);
        curve((t) => { const th = -Math.PI / 2 + t * (k * TAU + Math.PI / 2); return [cx + rx * Math.cos(th), T + r2 + (B - T - 2 * r2) * t + r2 * Math.sin(th)]; }, 260);
        exit = [0, 1];
      }
      { const p = P[P.length - 1], q = P[P.length - 2], l = Math.hypot(p[0] - q[0], p[1] - q[1]) || 1; exit = [(p[0] - q[0]) / l, (p[1] - q[1]) / l]; }      // carry on the way the shape ends
      marks.push({ kind: "done", i: P.length - 1, it });
    });
    const a = at(); bez([a[0] + exit[0] * 120, a[1] + exit[1] * 120], [a[0], H - 160], [a[0], H], 30); marks.push({ kind: "end", i: P.length - 1 });

    // lengths along the line, and the direction across it at every point (for the crackle)
    const S = new Float32Array(P.length), N = new Float32Array(P.length * 2);
    for (let i = 1; i < P.length; i++) S[i] = S[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
    for (let i = 0; i < P.length; i++) { const p = P[Math.max(0, i - 1)], q = P[Math.min(P.length - 1, i + 1)], l = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1; N[i * 2] = -(q[1] - p[1]) / l; N[i * 2 + 1] = (q[0] - p[0]) / l; }
    return { P, S, N, marks, W, H };
  }

  /* the scroll at which the line reaches each mark: a shape starts as its product comes up the screen
     and is finished by the time the product sits in the middle */
  function keys(L, wrap) {
    const top = wrap.getBoundingClientRect().top + scrollY, vh = innerHeight, k = [];
    L.marks.forEach((m) => {
      const y = m.kind === "start" ? m.it.y0 : m.kind === "end" ? L.H : m.kind === "enter" ? m.it.y0 : m.it.cy;
      const s = top + y - vh * (m.kind === "start" ? 1 : m.kind === "enter" ? .86 : m.kind === "done" ? .5 : .7);
      k.push([k.length ? Math.max(k[k.length - 1][0] + 1, s) : s, L.S[m.i]]);
    });
    return k;
  }
  const reached = (k, y) => {
    if (y <= k[0][0]) return 0; if (y >= k[k.length - 1][0]) return k[k.length - 1][1];
    for (let i = 1; i < k.length; i++) if (y < k[i][0]) { const t = (y - k[i - 1][0]) / (k[i][0] - k[i - 1][0]); return k[i - 1][1] + (k[i][1] - k[i - 1][1]) * t; }
  };

  /* ---------- painting it, with the crackle ---------- */
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
  const GREEN = "9, 88, 56", GLOW = "46, 196, 118";
  function paint(c, L, R, vh, drawn, frame, still) {
    const dpr = c.canvas.width / c.canvas.clientWidth, ox = R.left, oy = R.top;      // the line's page box, on screen
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, c.canvas.clientWidth, vh);
    if (drawn <= 0) return;
    const { P, S, N } = L;
    // the stretch of the line that is drawn and on screen
    let i0 = 0, i1 = P.length - 1;
    while (i1 > 0 && S[i1] > drawn) i1--;
    const vis = (i) => { const y = P[i][1] + oy; return y > -80 && y < vh + 80; };
    const jit = (i, seed, amp) => {
      if (still) return 0;
      const s = S[i] / 16, f = Math.floor(s), t = s - f, e = t * t * (3 - 2 * t), near = Math.max(0, 1 - (drawn - S[i]) / 420);
      return amp * (1 + 2.2 * near) * ((hash(f, frame + seed) - .5) * (1 - e) + (hash(f + 1, frame + seed) - .5) * e) * 2;
    };
    const stroke = (seed, amp, w, style, blur) => {
      c.beginPath(); let on = false;
      for (let i = i0; i <= i1; i++) {
        if (!vis(i)) { on = false; continue; }
        const j = jit(i, seed, amp), x = P[i][0] + N[i * 2] * j + ox, y = P[i][1] + N[i * 2 + 1] * j + oy;
        if (on) c.lineTo(x, y); else { c.moveTo(x, y); on = true; }
      }
      if (i1 < P.length - 1 && i1 >= 0) { const k = (drawn - S[i1]) / Math.max(1e-3, S[i1 + 1] - S[i1]); c.lineTo(P[i1][0] + (P[i1 + 1][0] - P[i1][0]) * k + ox, P[i1][1] + (P[i1 + 1][1] - P[i1][1]) * k + oy); }
      c.lineWidth = w; c.strokeStyle = style; c.shadowBlur = blur; c.shadowColor = `rgba(${GLOW}, .55)`; c.stroke();
    };
    c.lineCap = "round"; c.lineJoin = "round";
    stroke(7, 2.6, 4, `rgba(${GLOW}, .16)`, 0);          // a soft halo
    stroke(3, 1.9, .9, `rgba(${GLOW}, .55)`, 0);         // a thin second strand, crackling on its own
    stroke(0, 1.1, 1.8, `rgb(${GREEN})`, still ? 0 : 6);  // the line itself
    c.shadowBlur = 0;
    // the tip, with a few sparks
    const k = Math.min(P.length - 2, i1), h = P[Math.max(0, k)], hx = h[0] + ox, hy = h[1] + oy;
    if (drawn < S[S.length - 1] - 2 && hy > -20 && hy < vh + 20) {
      c.fillStyle = `rgb(${GREEN})`; c.beginPath(); c.arc(hx, hy, 3.4, 0, TAU); c.fill();
      c.fillStyle = `rgba(${GLOW}, .25)`; c.beginPath(); c.arc(hx, hy, 9, 0, TAU); c.fill();
      if (!still) { c.strokeStyle = `rgba(${GLOW}, .8)`; c.lineWidth = 1; c.beginPath();
        for (let s = 0; s < 3; s++) { const a = hash(frame, s) * TAU, l = 5 + hash(s, frame) * 9; c.moveTo(hx, hy); c.lineTo(hx + Math.cos(a) * l * .6 + (hash(frame + 3, s) - .5) * 4, hy + Math.sin(a) * l * .6); c.lineTo(hx + Math.cos(a) * l, hy + Math.sin(a) * l); }
        c.stroke(); }
    }
  }

  function wire() {
    const wrap = document.querySelector(".chs");
    if (!wrap) return () => {};
    const secs = [...wrap.querySelectorAll(".ch")], cv = wrap.querySelector(".ch-line canvas"), c = cv.getContext("2d");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let L = null, K = null, queued = 0, raf = 0, seen = false, frame = 0, last = 0;
    const size = () => { const d = Math.min(2, devicePixelRatio || 1); cv.width = Math.round(cv.clientWidth * d); cv.height = Math.round(innerHeight * d); };
    const show = (now) => {
      if (!L || !wrap.isConnected) return;
      if (!reduce && now - last > 55) { frame++; last = now; }      // the crackle changes about eighteen times a second
      paint(c, L, wrap.getBoundingClientRect(), innerHeight, reduce ? L.S[L.S.length - 1] : reached(K, scrollY), frame, reduce);
    };
    const loop = (now) => { raf = 0; if (!seen || !wrap.isConnected) return; show(now); raf = requestAnimationFrame(loop); };
    const redo = () => { if (!wrap.isConnected) return; fit(secs); size(); L = build(wrap); if (L) K = keys(L, wrap); show(performance.now()); };
    const later = () => { cancelAnimationFrame(queued); queued = requestAnimationFrame(redo); };

    redo();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(later);
    // a product's size is only known once its picture has loaded
    secs.forEach((s) => { const im = s.querySelector(".ch-pic img"); if (!im.complete) im.addEventListener("load", later, { once: true }); });
    const onResize = () => { if (!wrap.isConnected) { removeEventListener("resize", onResize); return; } later(); };
    addEventListener("resize", onResize);
    if (window.ResizeObserver) new ResizeObserver(later).observe(wrap);
    const onScroll = () => { if (!wrap.isConnected) { removeEventListener("scroll", onScroll); return; } if (reduce || !raf) requestAnimationFrame(show); };
    addEventListener("scroll", onScroll, { passive: true });
    if ("IntersectionObserver" in window) new IntersectionObserver((e) => { seen = e[e.length - 1].isIntersecting; if (seen && !reduce && !raf) raf = requestAnimationFrame(loop); }).observe(wrap);
    wrap.sim = { show: () => show(performance.now() + 100), info: () => L && { len: L.S[L.S.length - 1], keys: K } };
    return () => { removeEventListener("resize", onResize); removeEventListener("scroll", onScroll); };
  }

  window.CHAPTERS = { html, wire, inkOn };
})();
