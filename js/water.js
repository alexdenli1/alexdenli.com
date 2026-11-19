/* The headline: the frosted collage behaves like water. A small clear spot follows the pointer, rings
   spread from it, and the more you work an area the wider and clearer it opens up. */
(() => {
  const GW = 160, GH = 90;            // simulation grid
  const CORE = 5.45;                   // always-clear spot at the pointer, in cells
  const DRAG = 8.9;                   // wider, softer deposit along the pointer's path
  const DECAY = 0.9903;               // how slowly a worked area closes over again
  const SPREAD = 0.082;               // how much the clearing creeps outward
  const LO = 0.205, HI = 0.86;         // wet values that map to hidden / fully clear
  const RING_V = 9;                // ring speed, cells a second — heavy water travels slowly
  const MAX_RINGS = 9;

  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  function start(root, src, wallSrcs) {
    const flow = root.querySelector(".lead-flow"), rev = root.querySelector(".lead-reveal");
    if (!flow || !rev) return null;
    const fx = flow.getContext("2d"), rx = rev.getContext("2d", { alpha: true });

    /* the mask: a small grid, upscaled once so its edges stay liquid rather than stepped */
    const mk = document.createElement("canvas"); mk.width = GW; mk.height = GH;
    const mc = mk.getContext("2d"), mimg = mc.createImageData(GW, GH), m32 = new Uint32Array(mimg.data.buffer);
    const mid = document.createElement("canvas"); mid.width = GW * 3; mid.height = GH * 3;
    const mdc = mid.getContext("2d"); mdc.imageSmoothingQuality = "high";

    const wet = new Float32Array(GW * GH), tmp = new Float32Array(GW * GH);
    const rings = [];
    let img = null, W = 0, H = 0, dw = 0, dh = 0, dx = 0, dy = 0;
    const wall = wallSrcs && wallSrcs.length && window.LEADWALL ? window.LEADWALL.make(wallSrcs) : null;
    let px = -1, py = -1, has = false, raf = 0, last = 0, live = false, seen = true, drift = 0;

    const size = () => {
      const r = root.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      const cap = Math.min(1.6, devicePixelRatio || 1), cw = Math.min(1700, Math.round(W * cap));
      rev.width = cw; rev.height = Math.round(cw * H / W);
      flow.width = 150; flow.height = Math.max(1, Math.round(150 * H / W));
      if (wall) { wall.size(rev.width, rev.height); dw = rev.width; dh = rev.height; dx = dy = 0; }
      else if (img) { const s = Math.max(rev.width / img.width, rev.height / img.height);
        dw = img.width * s; dh = img.height * s; dx = (rev.width - dw) / 2; dy = (rev.height - dh) / 2; }
    };

    /* lay clarity down in a soft disc */
    const dab = (gx, gy, r, amt) => {
      const x0 = Math.max(0, (gx - r) | 0), x1 = Math.min(GW - 1, (gx + r + 1) | 0);
      const y0 = Math.max(0, (gy - r) | 0), y1 = Math.min(GH - 1, (gy + r + 1) | 0);
      const rr = r * r;
      for (let y = y0; y <= y1; y++) { const ddy = y - gy;
        for (let x = x0; x <= x1; x++) { const ddx = x - gx, d2 = ddx * ddx + ddy * ddy;
          if (d2 > rr) continue;
          const f = 1 - d2 / rr, i = y * GW + x;
          wet[i] = Math.min(1.9, wet[i] + amt * f * f);
        } }
    };

    const step = (dt) => {
      /* the clearing creeps outward and slowly closes again */
      for (let y = 0; y < GH; y++) { const o = y * GW, up = y > 0 ? o - GW : o, dn = y < GH - 1 ? o + GW : o;
        for (let x = 0; x < GW; x++) { const i = o + x, l = x > 0 ? i - 1 : i, r2 = x < GW - 1 ? i + 1 : i;
          tmp[i] = (wet[i] + SPREAD * (wet[l] + wet[r2] + wet[up + x] + wet[dn + x] - 4 * wet[i])) * DECAY;
        } }
      wet.set(tmp);

      /* rings: a travelling wave packet, drawn only across the band it currently occupies */
      for (let k = rings.length - 1; k >= 0; k--) { const g = rings[k]; g.t += dt;
        const rad = g.t * RING_V, amp = g.a * Math.exp(-g.t * 0.5);
        if (amp < 0.012 || rad > GW) { rings.splice(k, 1); continue; }
        const x0 = Math.max(0, (g.x - rad - 11) | 0), x1 = Math.min(GW - 1, (g.x + rad + 11) | 0);
        const y0 = Math.max(0, (g.y - rad - 11) | 0), y1 = Math.min(GH - 1, (g.y + rad + 11) | 0);
        for (let y = y0; y <= y1; y++) { const ddy = y - g.y;
          for (let x = x0; x <= x1; x++) { const ddx = x - g.x, d = Math.sqrt(ddx * ddx + ddy * ddy) - rad;
            if (d < -11 || d > 11) continue;
            wet[y * GW + x] += amp * Math.cos(d * 0.55) * Math.exp(-d * d / 44) * dt * 8;
          } }
      }

      /* paint the mask */
      for (let i = 0; i < m32.length; i++) m32[i] = (sm(LO, HI, wet[i]) * 255) << 24;
      mc.putImageData(mimg, 0, 0);
      mdc.clearRect(0, 0, mid.width, mid.height);
      mdc.drawImage(mk, 0, 0, mid.width, mid.height);
    };

    const paintFlow = (t) => {
      const w = flow.width, h = flow.height;
      fx.clearRect(0, 0, w, h);
      fx.globalCompositeOperation = "lighter";
      const blobs = [[0.26, 0.34, "8,92,60", 0.56, 0.7, 1.0], [0.74, 0.66, "14,62,108", 0.42, 0.9, 1.4],
                     [0.56, 0.22, "34,112,80", 0.3, 1.3, 0.8], [0.34, 0.8, "10,100,92", 0.36, 1.1, 1.7]];
      for (let i = 0; i < blobs.length; i++) { const [bx, by, c, a, sx, sy] = blobs[i];
        const cx = (bx + 0.08 * Math.sin(t * 0.095 * sx + i)) * w, cy = (by + 0.085 * Math.cos(t * 0.08 * sy + i * 1.7)) * h;
        const r = (0.32 + 0.05 * Math.sin(t * 0.14 + i * 2.1)) * w;
        const g = fx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, `rgba(${c},${a})`); g.addColorStop(1, `rgba(${c},0)`);
        fx.fillStyle = g; fx.fillRect(0, 0, w, h);
      }
      /* the same rings, travelling through the colour */
      fx.globalCompositeOperation = "source-over";
      for (const g of rings) { const rad = g.t * RING_V * (w / GW), a = g.a * Math.exp(-g.t * 0.75) * 0.42;
        if (a < 0.015) continue;
        fx.strokeStyle = `rgba(170,240,210,${a.toFixed(3)})`; fx.lineWidth = 3.6;
        fx.beginPath(); fx.arc(g.x * w / GW, g.y * h / GH, rad, 0, 6.2832); fx.stroke();
      }
    };

    const frame = (now) => {
      raf = 0;
      if (!root.isConnected) return;
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
      drift += dt;

      if (has) { const gx = px / W * GW, gy = py / H * GH; dab(gx, gy, CORE, 0.30 * dt * 60 / 60 * 1.9); }
      step(dt);
      paintFlow(drift);

      if (wall) wall.tick(drift, dt, has ? px * rev.width / W : -1, has ? py * rev.height / H : -1);
      rx.clearRect(0, 0, rev.width, rev.height);
      if (img) {
        rx.globalCompositeOperation = "source-over";
        rx.drawImage(img, dx, dy, dw, dh);
        rx.globalCompositeOperation = "destination-in";
        rx.drawImage(mid, 0, 0, rev.width, rev.height);
        rx.globalCompositeOperation = "source-over";
      }
      if (live && seen) raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf && live && seen) { last = performance.now(); raf = requestAnimationFrame(frame); } };

    /* pointer: a core dab every frame, a wider smear along the path, and a ring when it travels far enough */
    let lx = -1, ly = -1, since = 0;
    const move = (e) => {
      const r = root.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > r.width || y > r.height) return;
      const gx = x / r.width * GW, gy = y / r.height * GH;
      if (has && lx >= 0) {
        const d = Math.hypot(gx - lx, gy - ly), n = Math.min(14, Math.ceil(d));
        for (let i = 1; i <= n; i++) dab(lx + (gx - lx) * i / n, ly + (gy - ly) * i / n, DRAG, 0.16 * Math.min(1.2, d / n));
        since += d;
        if (since > 8 && rings.length < MAX_RINGS) { rings.push({ x: gx, y: gy, t: 0, a: Math.min(0.74, 0.34 + since * 0.03) }); since = 0; }
      }
      lx = gx; ly = gy; px = x; py = y; has = true;
      root.classList.add("wet"); kick();
    };

    const io = "IntersectionObserver" in window
      ? new IntersectionObserver((es) => { seen = es[0].isIntersecting; kick(); }, { threshold: 0 }) : null;
    io && io.observe(root);

    const onLeave = () => { has = false; lx = -1; };
    const onResize = () => { size(); kick(); };
    root.addEventListener("pointermove", move, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", () => { seen = !document.hidden; kick(); });

    if (wall) wall.onReady = () => { img = wall.canvas; size(); live = true; root.classList.add("ready"); kick(); };
    else { const im = new Image(); im.decoding = "async";
      im.onload = () => { img = im; size(); live = true; root.classList.add("ready"); kick(); };
      im.src = src; }
    size();

    return () => { live = false; cancelAnimationFrame(raf); io && io.disconnect();
      root.removeEventListener("pointermove", move); root.removeEventListener("pointerleave", onLeave);
      removeEventListener("resize", onResize); };
  }

  window.LEADWATER = { start };
})();
