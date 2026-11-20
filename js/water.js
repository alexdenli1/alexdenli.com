/* The water engine. A small grid of "wetness": the pointer lays it down, it creeps outward and slowly
   closes over again, and rings travel out from wherever the pointer has moved far enough. Heavy water:
   the rings move slowly and fade slowly.

   This file only simulates. Whoever uses it decides what the field means: the opening (opening.js) reads
   it as a height map and bends the type and footage through it.

   const r = RIPPLE.create({ gw: 160, gh: 90 });
   r.dab(x, y, radius, amount)   lay wetness down in a soft disc (grid units)
   r.ring(x, y, amplitude)       start a travelling ring
   r.trail(x, y)                 a pointer sample: core dab, a smear along the path, and rings as it travels
   r.lift()                      the pointer has left
   r.step(dt)                    advance the simulation by dt seconds
   r.wet                         the field, a Float32Array of gw * gh values (0 is still water)
*/
(() => {
  const DEFAULTS = {
    gw: 160, gh: 90,
    core: 5.45,      // always-wet spot at the pointer, in cells
    drag: 8.9,       // wider, softer deposit along the pointer's path
    decay: 0.9903,   // how slowly a worked area closes over again
    spread: 0.082,   // how much the wetness creeps outward
    ringV: 9,        // ring speed, cells a second: heavy water travels slowly
    maxRings: 9
  };

  function create(opts) {
    const o = Object.assign({}, DEFAULTS, opts || {});
    const GW = o.gw, GH = o.gh;
    const wet = new Float32Array(GW * GH), tmp = new Float32Array(GW * GH);
    const rings = [];
    let lx = -1, ly = -1, since = 0, here = false, hx = 0, hy = 0;

    const dab = (gx, gy, r, amt) => {
      const x0 = Math.max(0, (gx - r) | 0), x1 = Math.min(GW - 1, (gx + r + 1) | 0);
      const y0 = Math.max(0, (gy - r) | 0), y1 = Math.min(GH - 1, (gy + r + 1) | 0);
      const rr = r * r;
      for (let y = y0; y <= y1; y++) { const dy = y - gy;
        for (let x = x0; x <= x1; x++) { const dx = x - gx, d2 = dx * dx + dy * dy;
          if (d2 > rr) continue;
          const f = 1 - d2 / rr, i = y * GW + x;
          wet[i] = Math.min(1.9, wet[i] + amt * f * f);
        } }
    };

    const ring = (gx, gy, a) => { if (rings.length < o.maxRings) rings.push({ x: gx, y: gy, t: 0, a }); };

    /* one pointer sample: a wider smear along the path since the last one, and a ring every time it
       has travelled far enough */
    const trail = (gx, gy) => {
      if (here && lx >= 0) {
        const d = Math.hypot(gx - lx, gy - ly), n = Math.min(14, Math.ceil(d));
        for (let i = 1; i <= n; i++) dab(lx + (gx - lx) * i / n, ly + (gy - ly) * i / n, o.drag, 0.16 * Math.min(1.2, d / n));
        since += d;
        if (since > 8) { ring(gx, gy, Math.min(0.74, 0.34 + since * 0.03)); since = 0; }
      }
      lx = gx; ly = gy; hx = gx; hy = gy; here = true;
    };
    const lift = () => { here = false; lx = -1; };

    const step = (dt) => {
      if (here) dab(hx, hy, o.core, 0.57 * dt);
      /* the wetness creeps outward and slowly closes again */
      const S = o.spread, D = o.decay;
      for (let y = 0; y < GH; y++) { const r0 = y * GW, up = y > 0 ? r0 - GW : r0, dn = y < GH - 1 ? r0 + GW : r0;
        for (let x = 0; x < GW; x++) { const i = r0 + x, l = x > 0 ? i - 1 : i, r = x < GW - 1 ? i + 1 : i;
          tmp[i] = (wet[i] + S * (wet[l] + wet[r] + wet[up + x] + wet[dn + x] - 4 * wet[i])) * D;
        } }
      wet.set(tmp);
      /* rings: a travelling wave packet, written only across the band it currently occupies */
      for (let k = rings.length - 1; k >= 0; k--) { const g = rings[k]; g.t += dt;
        const rad = g.t * o.ringV, amp = g.a * Math.exp(-g.t * 0.5);
        if (amp < 0.012 || rad > GW) { rings.splice(k, 1); continue; }
        const x0 = Math.max(0, (g.x - rad - 11) | 0), x1 = Math.min(GW - 1, (g.x + rad + 11) | 0);
        const y0 = Math.max(0, (g.y - rad - 11) | 0), y1 = Math.min(GH - 1, (g.y + rad + 11) | 0);
        for (let y = y0; y <= y1; y++) { const dy = y - g.y;
          for (let x = x0; x <= x1; x++) { const dx = x - g.x, d = Math.sqrt(dx * dx + dy * dy) - rad;
            if (d < -11 || d > 11) continue;
            wet[y * GW + x] += amp * Math.cos(d * 0.55) * Math.exp(-d * d / 44) * dt * 8;
          } }
      }
    };

    /* true while anything is still moving, so the caller can stop drawing when the water is flat */
    const busy = () => {
      if (here || rings.length) return true;
      for (let i = 0; i < wet.length; i += 7) if (wet[i] > 0.004 || wet[i] < -0.004) return true;
      return false;
    };
    const clear = () => { wet.fill(0); rings.length = 0; lift(); };

    return { gw: GW, gh: GH, wet, rings, dab, ring, trail, lift, step, busy, clear };
  }

  window.RIPPLE = { create };
})();
