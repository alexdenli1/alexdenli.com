/* MECH: scroll as the product's own mechanism.

   A stage is a tall section with a sticky frame inside it. Its scroll progress, 0 to 1, drives a
   mechanism function. Native scroll only: progress is read from getBoundingClientRect in one rAF
   loop shared by every stage on the page, and only while something has moved.

   Markup a page uses:
     <section class="mech" style="--len: 600vh">        tall section, any height
       <div class="mech-stage"> ... </div>              sticky, one screen
       <div class="mech-stills"> ... </div>             the same story as still frames (reduced motion)
     </section>

   MECH.stage(el, { draw(p), near() }, { pin })
     draw(p)   called with progress 0..1 whenever it changes while the stage is on screen
     near()    called once when the stage comes within two screens: preload its pictures here
     pin       false for a section that is not pinned: progress runs from the section's top entering
               the bottom of the screen (0) to its top reaching the top third (1)
   MECH.sequence(canvas, srcs)   image-sequence scrubbing: .load(), .show(i)
   MECH.line(path, t)            draw an SVG stroke in (paths need pathLength="1")
   MECH.count(el, to, t, dp)     a number counting up to its real value
   MECH.layer(canvas)            a canvas sized to its box and the screen's pixel ratio, for particles
   MECH.loop(el, fn)             a continuous loop that runs only while el is on screen and the tab is visible
   MECH.seg(p, a, b)             progress through one part of a stage, 0..1
*/
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  const seg = (p, a, b) => clamp01((p - a) / (b - a));

  /* ---------- the shared loop ---------- */
  const stages = new Set();
  let raf = 0;
  function tick() {
    raf = 0;
    const vh = innerHeight;
    for (const st of stages) {
      if (!st.el.isConnected) { stages.delete(st); continue; }
      const r = st.el.getBoundingClientRect();
      if (!st.warm && r.top < vh * 2.5 && r.bottom > -vh) { st.warm = true; st.near && st.near(); }
      if (reduce || r.bottom < -vh * 0.2 || r.top > vh * 1.2) continue;
      const p = st.pin ? clamp01(-r.top / Math.max(1, r.height - vh)) : clamp01((vh - r.top) / (vh * 0.67));
      if (p !== st.p) { st.p = p; st.draw(p); }
    }
  }
  const queue = () => { if (!raf) raf = requestAnimationFrame(tick); };
  addEventListener("scroll", queue, { passive: true });
  addEventListener("resize", () => { for (const st of stages) st.p = -1; queue(); });

  function stage(el, fns, opts) {
    const st = { el, draw: fns.draw || (() => {}), near: fns.near, pin: !(opts && opts.pin === false), p: -1, warm: false };
    stages.add(st); queue();
    // a stage that starts on screen draws its first frame straight away
    if (!reduce) requestAnimationFrame(() => { st.p = -1; queue(); });
    return { remove: () => stages.delete(st), refresh: () => { st.p = -1; queue(); } };
  }

  /* ---------- image sequences ---------- */
  function sequence(canvas, srcs) {
    const ctx = canvas.getContext("2d"), pics = srcs.map(() => null);
    let shown = -1, loading = null;
    const fit = () => {
      const r = canvas.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1);
      const w = Math.round(r.width * d), h = Math.round(r.height * d);
      if (w && h && (canvas.width !== w || canvas.height !== h)) { canvas.width = w; canvas.height = h; shown = -1; }
    };
    const load = () => loading || (loading = Promise.all(srcs.map((s, i) => {
      const im = new Image(); im.decoding = "async"; im.src = s;
      return (im.decode ? im.decode() : new Promise((r) => (im.onload = r))).then(() => { pics[i] = im; if (shown === -1 || i === want) show(want, true); }, () => {});
    })));
    let want = 0;
    function show(i, force) {
      want = i; fit();
      if (i === shown && !force) return;
      // the nearest frame that has arrived, so scrubbing never shows an empty canvas
      let k = -1;
      for (let d = 0; d < pics.length; d++) { if (pics[i - d]) { k = i - d; break; } if (pics[i + d]) { k = i + d; break; } }
      if (k < 0) return;
      const im = pics[k];
      const s = Math.min(canvas.width / im.naturalWidth, canvas.height / im.naturalHeight);
      const w = im.naturalWidth * s, h = im.naturalHeight * s;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(im, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
      shown = k === i ? i : -1;
    }
    addEventListener("resize", () => { shown = -1; show(want, true); });
    return { load, show, get count() { return srcs.length; } };
  }

  /* ---------- annotation strokes and counters ---------- */
  const line = (path, t) => { const v = (1 - clamp01(t)).toFixed(4); if (path.style.strokeDashoffset !== v) path.style.strokeDashoffset = v; };
  const count = (el, to, t, dp = 0) => { const v = (to * clamp01(t)).toFixed(dp); if (el.textContent !== v) el.textContent = v; };

  /* ---------- canvas layers for particles ---------- */
  function layer(canvas) {
    const ctx = canvas.getContext("2d"), o = { ctx, w: 0, h: 0, d: 1 };
    o.fit = () => { const r = canvas.getBoundingClientRect(); o.d = Math.min(2, devicePixelRatio || 1);
      o.w = r.width; o.h = r.height; canvas.width = Math.round(r.width * o.d); canvas.height = Math.round(r.height * o.d);
      ctx.setTransform(o.d, 0, 0, o.d, 0, 0); };
    o.fit(); addEventListener("resize", o.fit);
    return o;
  }
  /* a continuous loop for things that move on their own (particles): paused off screen and in hidden tabs */
  function loop(el, fn) {
    if (reduce) return () => {};
    let on = false, id = 0, last = 0;
    const run = (t) => { id = 0; if (!on || document.hidden || !el.isConnected) return; fn(Math.min(0.05, (t - last) / 1000 || 0.016), t); last = t; id = requestAnimationFrame(run); };
    const go = () => { if (!id && on && !document.hidden) { last = performance.now(); id = requestAnimationFrame(run); } };
    const io = new IntersectionObserver((es) => { on = es[0].isIntersecting; go(); });
    io.observe(el); document.addEventListener("visibilitychange", go);
    return () => { on = false; cancelAnimationFrame(id); io.disconnect(); document.removeEventListener("visibilitychange", go); };
  }

  window.MECH = { reduce, clamp01, seg, stage, sequence, line, count, layer, loop };
})();
