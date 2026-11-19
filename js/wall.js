/* Hero wall (prototype): the work behind the water, as a live wall of posters instead of a flat collage.
   - Drift: three rows slide slowly in alternating directions, each poster pans gently inside its frame,
     and the whole wall leans a little against the pointer.
   - Split-flap: every couple of seconds a poster flips like a departures board to another project,
     and the poster under the pointer flips when you pass over it.
   - Light: a soft diagonal sheen sweeps across the wall every few seconds. */
(() => {
  const ROWS = 3;
  const SPEEDS = [9, -12, 7];          // px a second at 1920 wide, per row
  const FLIP = 0.78;                   // seconds for one flip
  const SWEEP = 8.5;                   // seconds between light sweeps
  const rnd = (a, b) => a + Math.random() * (b - a);

  function make(srcs) {
    const cv = document.createElement("canvas"), cx = cv.getContext("2d");
    const bmps = [];
    let W = 0, H = 0, k = 1, rows = [], ready = false, onReady = null;
    let nextAuto = 1.6, lx = 0, ly = 0, tx = 0, ty = 0, lastHover = null;

    /* load and shrink each hero once, so every frame draws small bitmaps */
    let left = srcs.length;
    srcs.forEach((src, i) => {
      const im = new Image(); im.decoding = "async";
      im.onload = im.onerror = () => {
        if (im.naturalWidth) { const s = Math.min(1, 960 / im.naturalWidth), b = document.createElement("canvas");
          b.width = Math.round(im.naturalWidth * s); b.height = Math.round(im.naturalHeight * s);
          const g = b.getContext("2d"); g.imageSmoothingQuality = "high"; g.drawImage(im, 0, 0, b.width, b.height); bmps[i] = b; }
        if (--left === 0) { for (let j = bmps.length - 1; j >= 0; j--) if (!bmps[j]) bmps.splice(j, 1);
          ready = bmps.length > 0; if (ready) { layout(); onReady && onReady(); } }
      };
      im.src = src;
    });

    const pick = (avoid) => { let i, n = 0; do i = (Math.random() * bmps.length) | 0; while (avoid.includes(i) && ++n < 20); return i; };

    /* rows of posters with mixed widths, long enough to wrap seamlessly */
    function layout() {
      if (!ready || !W) return;
      k = W / 1920;
      const gap = Math.max(4, Math.round(9 * k)), over = 26 * k;          // overscan so the lean never shows an edge
      const rh = (H + over * 2 - gap * (ROWS - 1)) / ROWS;
      rows = [];
      for (let r = 0; r < ROWS; r++) {
        const tiles = []; let len = 0, prev = -1;
        while (len < W * 1.9) {
          const w = Math.round(rh * [1.3, 1.5, 1.78][(Math.random() * 3) | 0]);
          const img = pick([prev]);
          tiles.push({ x: len, w, img, next: img, f: -1, ph: rnd(0, 6.28), amp: rnd(0.4, 1), cool: 0 });
          len += w + gap; prev = img;
        }
        const a = tiles[0], z = tiles[tiles.length - 1];        // no twins across the seam where the row wraps
        if (z.img === a.img) z.img = z.next = pick([a.img, tiles.length > 1 ? tiles[tiles.length - 2].img : -1]);
        rows.push({ i: r, y: -over + r * (rh + gap), h: rh, len, off: rnd(0, len), v: SPEEDS[r] * k, tiles });
      }
    }

    function size(w, h) { W = cv.width = w; H = cv.height = h; layout(); }

    /* each poster fills its frame, a little oversized so it can pan */
    function drawPoster(i, x, y, w, h, t, tl) {
      const b = bmps[i]; if (!b) return;
      const s = Math.max(w / b.width, h / b.height) * 1.09, dw = b.width * s, dh = b.height * s;
      const px = Math.sin(t * 0.11 + tl.ph) * (dw - w) * 0.45 * tl.amp, py = Math.cos(t * 0.09 + tl.ph * 1.3) * (dh - h) * 0.45 * tl.amp;
      cx.drawImage(b, x + (w - dw) / 2 + px, y + (h - dh) / 2 + py, dw, dh);
    }

    /* the split-flap: the old top half folds down over the hinge, then the new bottom half lands */
    function drawFlip(tl, x, y, w, h, t) {
      const p = Math.min(1, tl.f / FLIP), e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2, hh = h / 2, mid = y + hh;
      const half = (img, top, sc, shade) => {
        cx.save();
        cx.beginPath(); cx.rect(x, top ? y : mid, w, hh); cx.clip();
        cx.translate(0, mid); cx.scale(1, Math.max(0.0001, sc)); cx.translate(0, -mid);
        cx.beginPath(); cx.rect(x, top ? y : mid, w, hh); cx.clip();
        drawPoster(img, x, y, w, h, t, tl);
        if (shade > 0) { cx.fillStyle = `rgba(0,0,0,${shade.toFixed(3)})`; cx.fillRect(x, y, w, h); }
        if (shade < 0) { cx.fillStyle = `rgba(255,255,255,${(-shade).toFixed(3)})`; cx.fillRect(x, y, w, h); }
        cx.restore();
      };
      // what sits still underneath: the new top, the old bottom (until the flap covers it)
      half(tl.next, true, 1, (1 - e) * 0.55);
      half(tl.img, false, 1, e * 0.35);
      if (e < 0.5) half(tl.img, true, Math.cos(e * Math.PI), e * 1.1);          // old top folding down
      else half(tl.next, false, -Math.cos(e * Math.PI), -(1 - e) * 0.5);          // new bottom unfolding, catching the light
      cx.fillStyle = "rgba(0,0,0,.55)"; cx.fillRect(x, mid - Math.max(1, k), w, Math.max(2, 2 * k));   // the hinge
    }

    function startFlip(tl, row, j) {
      if (tl.f >= 0) return;
      const n = row.tiles.length, nb = [tl.img, row.tiles[(j + 1) % n].img, row.tiles[(j - 1 + n) % n].img];
      for (const o of rows) if (Math.abs(o.i - row.i) === 1)
        for (const u of o.tiles) if (u.vis && u.sx < tl.sx + tl.w && u.sx + u.w > tl.sx) nb.push(u.img, u.next);
      tl.next = pick(nb); tl.f = 0;
    }

    /* px, py: pointer in canvas pixels, or -1 when it is away */
    function tick(t, dt, px, py) {
      if (!ready || !rows.length) return false;
      // lean against the pointer
      tx = px >= 0 ? (0.5 - px / W) * 22 * k : 0; ty = py >= 0 ? (0.5 - py / H) * 18 * k : 0;
      lx += (tx - lx) * Math.min(1, dt * 2.2); ly += (ty - ly) * Math.min(1, dt * 2.2);

      cx.fillStyle = "#050505"; cx.fillRect(0, 0, W, H);
      let hover = null, vis = [];
      for (const row of rows) for (const tl of row.tiles) tl.vis = false;
      for (const row of rows) {
        row.off = (row.off + row.v * dt) % row.len; if (row.off < 0) row.off += row.len;
        const y = row.y + ly;
        for (let j = 0; j < row.tiles.length; j++) { const tl = row.tiles[j];
          if (tl.f >= 0) { tl.f += dt; if (tl.f >= FLIP) { tl.img = tl.next; tl.f = -1; tl.cool = t + 2.5; } }
          let x = (tl.x - row.off) % row.len; if (x < 0) x += row.len; if (x > W + 40 * k) x -= row.len; x += lx;
          if (x > W || x + tl.w < 0) continue;
          tl.sx = x; tl.vis = true; vis.push([tl, row, j]);
          if (px >= x && px < x + tl.w && py >= y && py < y + row.h) hover = [tl, row, j];
          if (tl.f >= 0) drawFlip(tl, x, y, tl.w, row.h, t);
          else { cx.save(); cx.beginPath(); cx.rect(x, y, tl.w, row.h); cx.clip(); drawPoster(tl.img, x, y, tl.w, row.h, t, tl); cx.restore(); }
        }
      }
      // the poster under the pointer flips when you arrive on it
      if (hover && hover[0] !== lastHover && t > hover[0].cool) startFlip(...hover);
      lastHover = hover ? hover[0] : null;
      // and now and then one flips by itself
      if (t > nextAuto && vis.length) { const v = vis[(Math.random() * vis.length) | 0]; if (t > v[0].cool) startFlip(...v); nextAuto = t + rnd(1.4, 2.6); }

      // the light: a soft diagonal sheen crossing the wall
      const p = (t % SWEEP) / SWEEP, span = W + H, c = -H * 0.6 + p * (span + H * 1.2), bw = 0.22 * W;
      const g = cx.createLinearGradient(c - bw, 0, c + bw - H * 0.5, H);
      g.addColorStop(0, "rgba(255,248,235,0)"); g.addColorStop(0.5, "rgba(255,248,235,.2)"); g.addColorStop(1, "rgba(255,248,235,0)");
      cx.globalCompositeOperation = "lighter"; cx.fillStyle = g; cx.fillRect(0, 0, W, H); cx.globalCompositeOperation = "source-over";
      return true;
    }

    return { canvas: cv, size, tick, get ready() { return ready; }, set onReady(f) { onReady = f; if (ready) f(); } };
  }

  window.LEADWALL = { make };
})();
