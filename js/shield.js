/* Shield: scrolling runs one wash through the unit.
   Black, with one accent: clean water cyan (var(--project), set from data.js).
   Built on the shared engine (js/mech.js):
     apart     the unit comes apart into its exploded view, each part numbered in turn
     the wash  the signature: microfibres drift in from the washing machine's drain, clump, settle,
               and drop into the drawer, through the six steps of one cycle. Drawn on a canvas, and
               every position is worked out from the scroll position, so it runs backwards too.
     forms     the five forms, scrubbed one into the next
   then the research, the testing and the details, and the outcome.
   Every figure comes from the project's own folio; sources are given where they are external. */
(() => {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const IMG = (f, alt, cls = "", lazy = true) => `<img${cls ? ` class="${cls}"` : ""} src="images/shield/${f}" alt="${esc(alt)}"${lazy ? ' loading="lazy"' : ""} decoding="async">`;
  const pad2 = (n) => String(n).padStart(2, "0");

  /* ---------- content ---------- */
  const STEPS = [
    ["Fill", "Each drain from the machine fills the next free cell.", "Inlet manifold with a valve per cell, a level float and a safety float"],
    ["Treat", "Thirty minutes of electrocoagulation: the plates make a coagulant, and the fibres clump into floc.", "Alternating aluminium and iron plates; the light bar shows progress"],
    ["Settle", "The floc sinks into the hopper at the bottom of the cell.", "The hopper base gathers it in one place"],
    ["Decant", "Clear water is pumped from 20% height to the standpipe.", "Decant port, pump, and a passive overflow so the machine is never blocked"],
    ["Collect", "The floc drops through the sludge valve into a mesh basket.", "A reusable 100 µm mesh basket in the drawer"],
    ["Empty", "When the light bar asks, slide the drawer out and empty it.", "No filter to buy or replace"]
  ];
  // where each step starts, as a share of the stage
  const AT = [0, 0.17, 0.4, 0.56, 0.68, 0.86, 1];
  const PARTS = ["Top cap", "Light bar", "Electrode cassettes", "Twin cells", "Divider", "Electronics bay", "Manifold and overflow", "Hopper base", "19 mm ports", "Pump and sludge valves", "Mesh basket", "Drawer"];
  const PP = [[46.7, 10.2], [31.3, 11.1], [40.8, 24.3], [40.8, 55.9], [47.1, 54.5], [25.8, 59.2], [65.2, 50.7], [52.8, 68.5], [66.1, 35.8], [47.1, 80.2], [31.3, 77.4], [26.1, 83.2]];
  const FORMS = [
    ["Single tank", "One tank split in two, valves exposed."],
    ["Twin cells", "A float and a valve for each cell."],
    ["Enclosed", "Tubing and electronics in the side posts."],
    ["Turned to the side", "Beside the machine, never pulled out."],
    ["Final form", "A slim tower, a front drawer and lift-out electrodes."]
  ];
  const DETAILS = [
    ["lightbar", "Light bar", "Five segments show the cycle's progress, and tell you when the drawer is full."],
    ["drawer", "Front drawer", "A reusable 100 µm mesh basket holds the floc as a damp cake."],
    ["lift", "Lift-out electrodes", "Plate cassettes pull straight up for replacement every two to five years."],
    ["home", "In the home", "Matches the machine's height and depth; only the front edge shows."]
  ];

  /* ---------- the page ---------- */
  function render(p, tail) {
    return `<article class="page sh2">

    <section class="sh2-hero">
      ${IMG("hero-render.webp", "The Shield unit: a slim white tower with two clear cells of water and aluminium plates, and a row of status lights on top", "sh-hprod", false)}
      <div class="sh2-htx"><h1>Shield</h1>
        <p class="sh2-sub"><em>${esc(p.year)}</em><span>${esc(p.summary)}</span></p></div>
    </section>

    <section class="sh2-key" aria-label="The result">
      <p class="sh2-big">Every wash sheds plastic fibres. Shield catches them on their way down the drain, with no filter to buy or replace.</p>
      <dl class="sh2-n">
        <div><dt class="hot">~90%</dt><dd>separation, estimated in bench tests with an aluminium and iron pair at 12 V in 20 minutes</dd></div>
        <div><dt>0</dt><dd>filters to buy, change or throw away</dd></div>
        <div><dt>150<small>mm</small></dt><dd>wide: it stands beside any UK machine and connects on the drain hose</dd></div>
      </dl>
      <p class="sh2-me">A final-year product design project: research, testing, electronics and the design of the unit.</p>
    </section>

    <section class="mech sh2-apart" style="--len:300vh" aria-label="The unit, apart">
      <div class="mech-stage">
        <div class="sh2-pair">${IMG("lift.webp", "Shield assembled, with an electrode cassette lifted out", "a", false)}${IMG("exploded.webp", "Exploded view of Shield: top cap, light bar, electrode cassettes, twin cells, divider, electronics bay, manifold, hopper base, ports, pump and valves, mesh basket and drawer", "b", false)}
          ${PP.map((q, i) => `<span class="sh2-pt" style="left:${q[0]}%;top:${q[1]}%">${i + 1}</span>`).join("")}</div>
        <div class="sh2-ptx"><h2>Apart</h2><p>850 × 600 × 150 mm. Everything you touch is on the front or the top; the hoses connect once, at the back.</p>
          <ol class="sh2-parts">${PARTS.map((n, i) => `<li><b>${i + 1}</b>${esc(n)}</li>`).join("")}</ol></div>
      </div>
      <div class="mech-stills"><div class="sh2-apst">${IMG("exploded.webp", "Exploded view of Shield")}<ol class="sh2-parts">${PARTS.map((n, i) => `<li class="on"><b>${i + 1}</b>${esc(n)}</li>`).join("")}</ol></div></div>
    </section>

    <section class="mech sh2-wash" style="--len:${100 + STEPS.length * 75}vh" aria-label="One wash through Shield">
      <div class="mech-stage">
        <canvas class="sh2-cv" role="img" aria-label="Cross-section of Shield: fibres flow in from the washing machine, clump into floc, settle, and drop into the drawer while clear water leaves for the drain"></canvas>
        <div class="sh2-side">
          <p class="sh2-n2"><b>01</b> / ${pad2(STEPS.length)}</p>
          <h2 class="sh2-step">${esc(STEPS[0][0])}</h2>
          <p class="sh2-desc">${esc(STEPS[0][1])}</p>
          <p class="sh2-det">${esc(STEPS[0][2])}</p>
          <p class="sh2-clock" hidden><b>00:00</b><span>of 30 minutes</span></p>
        </div>
      </div>
      <div class="mech-stills"><ol class="sh2-steps">${STEPS.map((s, i) => `<li><b>${pad2(i + 1)} ${esc(s[0])}</b><span>${esc(s[1])}</span><em>${esc(s[2])}</em></li>`).join("")}</ol></div>
    </section>

    <section class="mech sh2-forms" style="--len:360vh" aria-label="Form development">
      <div class="mech-stage">
        <div class="sh2-ftx"><h2>Five forms, one tower</h2><ol>${FORMS.map((f, i) => `<li><i>${pad2(i + 1)}</i><div><b>${esc(f[0])}</b><span>${esc(f[1])}</span></div></li>`).join("")}</ol></div>
        <div class="sh2-fv">${FORMS.map((f, i) => IMG(`form-${i + 1}.webp`, `Form ${i + 1}: ${f[0]}`, "", false)).join("")}</div>
      </div>
      <div class="mech-stills"><ol class="sh2-fst">${FORMS.map((f, i) => `<li>${IMG(`form-${i + 1}.webp`, `Form ${i + 1}: ${f[0]}`)}<b>${esc(f[0])}</b><span>${esc(f[1])}</span></li>`).join("")}</ol></div>
    </section>

    <section class="sh2-proc" aria-label="How it was made">
      <div class="sh2-row sh2-res">
        <h2 class="sh2-ph"><small>Research</small>Fibres too small for the machine to catch, and too small for the treatment works.</h2>
        <dl class="sh2-facts">
          <div><dt>35%</dt><dd>of primary microplastics entering the oceans come from washing synthetic textiles (IUCN)</dd></div>
          <div><dt>729k</dt><dd>fibres released by one 6 kg acrylic load (Napper and Thompson, 2016)</dd></div>
          <div><dt>12–18 µm</dt><dd>thick, 5–8 mm long: a typical fine mesh filter is around 100 µm</dd></div>
          <div><dt>≈ 50 L</dt><dd>drained per cycle, in separate drains 20–45 minutes apart</dd></div>
        </dl>
      </div>
      <div class="sh2-row sh2-why">
        <h2 class="sh2-ph"><small>Ideation</small>Separating fibres without a filter.</h2>
        <p class="sh2-body">Electrocoagulation makes a coagulant from metal plates, so fibres and dirt clump into floc that settles out of still water. No chemicals are added, and nothing needs replacing but the plates, every few years. It needs still water and time, so Shield holds each drain in its own cell.</p>
        <div class="sh2-ev"><b>94%</b><span>microplastic removal from laundry water with an iron and aluminium pair at 2.16 A, pH 9 (Akarsu and Deniz, 2021)</span></div>
      </div>
      <div class="sh2-row sh2-test">
        <h2 class="sh2-ph"><small>Model</small>Proving the process on the bench.</h2>
        <ul class="sh2-tph">${[["t1", "Bench rig, 75 mm gap"], ["t2", "Aluminium and iron, low voltage"], ["t3", "Aluminium and iron, 10.5 V"], ["t4", "Aluminium and iron, 12 V: clear"]].map((t) => `<li>${IMG(t[0] + ".webp", t[1])}<span>${esc(t[1])}</span></li>`).join("")}</ul>
        <p class="sh2-body">1.5 L of water with 3 g of coloured flour, 20 minutes a test, separation estimated from turbidity and collected solids. The aluminium and iron pair reached about 90% at 12 V, against a target of at least 70%. One microcontroller runs both cells, every valve and every safety float.</p>
      </div>
      <div class="sh2-row sh2-det2">
        <h2 class="sh2-ph"><small>Final</small>Made to live in a kitchen.</h2>
        <ul class="sh2-dets">${DETAILS.map((d) => `<li>${IMG(d[0] + ".webp", `${d[1]}: ${d[2]}`)}<b>${esc(d[1])}</b><span>${esc(d[2])}</span></li>`).join("")}</ul>
      </div>
    </section>

    <section class="sh2-out" aria-label="The outcome">
      <figure>${IMG("hero.jpg", "The Shield poster: Protecting the ocean, one wash at a time. No filters to buy or replace, about 90 percent fibre separation in test, 150 mm wide and fitting beside any machine.")}</figure>
    </section>
    ${tail}</article>`;
  }

  /* ---------- the wash, drawn on a canvas in a 1000 x 1000 space ---------- */
  const rnd = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
  const CELLS = [[200, 480], [520, 800]];             // x ranges of the two cells
  const TOP = 180, WALL = 560, HOP = 640;              // cell top, where the hopper starts, hopper bottom
  const N = 240;

  function fibrePos(i, p, seg) {
    const c = i % 2, [x0, x1] = CELLS[c], mid = (x0 + x1) / 2, w = x1 - x0;
    const S = [-60 - rnd(i, 1) * 360, 200 + rnd(i, 2) * 60];
    const M = [x0 + 40 + rnd(i, 8) * 40, TOP + 10];
    const P = [x0 + 30 + rnd(i, 3) * (w - 60), TOP + 60 + rnd(i, 4) * 320];
    const k = i % 3, CC = [[x0 + 70, 300], [mid, 400], [x1 - 60, 330]][k];
    const C = [CC[0] + (rnd(i, 5) - 0.5) * 34, CC[1] + (rnd(i, 6) - 0.5) * 34];
    const D = [mid + (rnd(i, 3) - 0.5) * 110, HOP - 26 + (rnd(i, 4) - 0.5) * 22];
    const V = [mid, 690];
    const B = [300 + rnd(i, 7) * 400, 868 + rnd(i, 2) * 26];
    const fill = seg(p, AT[0], AT[1]), treat = seg(p, AT[1], AT[2]), settle = seg(p, AT[2], AT[3]);
    const coll = seg(p, AT[4], AT[5]), empty = seg(p, AT[5], AT[6]);
    let x, y;
    if (treat <= 0) {
      const t = seg(fill, rnd(i, 9) * 0.55, rnd(i, 9) * 0.55 + 0.45);
      if (t < 0.5) { const u = t / 0.5; x = lerp(S[0], M[0], u); y = lerp(S[1], M[1], u) + Math.sin(u * 9 + i) * 8; }
      else { const u = ease((t - 0.5) / 0.5); x = lerp(M[0], P[0], u); y = lerp(M[1], P[1], u); }
      if (t <= 0) return null;
    } else if (settle <= 0) {
      const u = ease(treat), j = (1 - u) * 7;
      x = lerp(P[0], C[0], u) + Math.sin(p * 90 + i) * j; y = lerp(P[1], C[1], u) + Math.cos(p * 80 + i * 1.7) * j;
    } else if (coll <= 0) {
      const u = ease(settle); x = lerp(C[0], D[0], u); y = lerp(C[1], D[1], u);
    } else {
      const t = seg(coll, rnd(i, 10) * 0.4, rnd(i, 10) * 0.4 + 0.6);
      if (t < 0.4) { const u = t / 0.4; x = lerp(D[0], V[0], u); y = lerp(D[1], V[1], u); }
      else { const u = ease((t - 0.4) / 0.6); x = lerp(V[0], B[0], u); y = lerp(V[1], B[1], u); }
      x -= empty * 300;
    }
    return [x, y, rnd(i, 11) * 6.28];
  }

  function drawWash(o, p, M, cyan) {
    const { ctx, w, h } = o, s = Math.min(w / 1000, h / 1000), ox = (w - 1000 * s) / 2, oy = (h - 1000 * s) / 2;
    const seg = M.seg, cream = "rgba(238,233,227,", line = "rgba(238,233,227,.55)";
    ctx.setTransform(o.d, 0, 0, o.d, 0, 0); ctx.clearRect(0, 0, w, h);
    ctx.setTransform(o.d * s, 0, 0, o.d * s, o.d * ox, o.d * oy);
    ctx.lineJoin = "round"; ctx.lineCap = "round";

    const fill = seg(p, AT[0], AT[1]), treat = seg(p, AT[1], AT[2]), settle = seg(p, AT[2], AT[3]);
    const dec = seg(p, AT[3], AT[4]), coll = seg(p, AT[4], AT[5]), empty = seg(p, AT[5], AT[6]);

    // water: rises as the drain fills a cell, then goes down to 20% as clear water is decanted
    const level = lerp(HOP, TOP + 20, ease(fill)) + (lerp(0, WALL - 120 - TOP, ease(dec))) + coll * 80;
    const murk = (1 - settle) * 0.16 + 0.06;
    CELLS.forEach(([x0, x1]) => {
      const path = () => { ctx.beginPath(); ctx.moveTo(x0, TOP); ctx.lineTo(x1, TOP); ctx.lineTo(x1, WALL); ctx.lineTo((x0 + x1) / 2 + 40, HOP); ctx.lineTo((x0 + x1) / 2 - 40, HOP); ctx.lineTo(x0, WALL); ctx.closePath(); };
      ctx.save(); path(); ctx.clip();
      ctx.fillStyle = cyan(0.12 + murk); ctx.fillRect(x0, Math.min(HOP, level), x1 - x0, HOP - Math.min(HOP, level) + 4);
      ctx.restore();
      // plates
      for (let k = 0; k < 5; k++) { const x = x0 + 34 + k * ((x1 - x0 - 68) / 4); ctx.strokeStyle = k % 2 ? "rgba(238,233,227,.32)" : "rgba(238,233,227,.5)"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, TOP + 14); ctx.lineTo(x, WALL - 30); ctx.stroke(); }
      ctx.strokeStyle = line; ctx.lineWidth = 2.5; path(); ctx.stroke();
      // sludge valve under the hopper
      const vm = (x0 + x1) / 2, open = coll > 0 && coll < 1;
      ctx.fillStyle = open ? cyan(1) : "rgba(238,233,227,.55)"; ctx.fillRect(vm - 22, HOP + 4, 44, 16);
    });
    // floc: soft clumps that grow while the plates work, then sink
    if (treat > 0 && coll < 1) {
      CELLS.forEach(([x0, x1], c) => {
        const mid = (x0 + x1) / 2;
        [[x0 + 70, 300], [mid, 400], [x1 - 60, 330]].forEach((q, k) => {
          const u = ease(settle), y = lerp(q[1], HOP - 26, u), x = lerp(q[0], mid + (k - 1) * 30, u), r = 10 + 30 * ease(treat) * (1 - coll);
          ctx.fillStyle = cream + (0.08 * ease(treat)).toFixed(3) + ")"; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
        });
      });
    }
    // the unit's outline, the inlet from the machine and the outlet to the standpipe
    ctx.strokeStyle = line; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(160, 80, 680, 880, 26) : ctx.rect(160, 80, 680, 880); ctx.stroke();
    ctx.lineWidth = 10; ctx.strokeStyle = "rgba(238,233,227,.22)"; ctx.beginPath(); ctx.moveTo(0, 230); ctx.lineTo(150, 230); ctx.lineTo(150, TOP - 10); ctx.lineTo(800, TOP - 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(800, WALL - 110); ctx.lineTo(1000, WALL - 110); ctx.stroke();
    if (dec > 0 && dec < 1) { // clear water leaving
      ctx.strokeStyle = cyan(0.9); ctx.lineWidth = 4; ctx.setLineDash([16, 14]); ctx.lineDashOffset = -p * 4000;
      ctx.beginPath(); ctx.moveTo(800, WALL - 110); ctx.lineTo(990, WALL - 110); ctx.stroke(); ctx.setLineDash([]);
    }
    // light bar: five segments fill while the plates work
    for (let k = 0; k < 5; k++) { const on = treat * 5 > k + 0.5 || p > AT[2]; ctx.fillStyle = on ? cyan(1) : "rgba(238,233,227,.16)"; ctx.fillRect(390 + k * 46, 110, 38, 14); }
    // drawer with its mesh basket; it slides out at the end
    const dx = -empty * 300;
    ctx.save(); ctx.translate(dx, 0);
    ctx.fillStyle = "#000"; ctx.fillRect(260, 760, 480, 150);
    ctx.strokeStyle = line; ctx.lineWidth = 3; ctx.strokeRect(260, 760, 480, 150);
    ctx.strokeStyle = "rgba(238,233,227,.18)"; ctx.lineWidth = 1.5;
    for (let x = 300; x <= 700; x += 16) { ctx.beginPath(); ctx.moveTo(x, 790); ctx.lineTo(x, 890); ctx.stroke(); }
    ctx.strokeStyle = line; ctx.lineWidth = 2; ctx.strokeRect(290, 790, 420, 100);
    ctx.fillStyle = line; ctx.fillRect(280, 924, 70, 8);
    ctx.restore();
    // the fibres
    ctx.strokeStyle = cream + ".9)"; ctx.lineWidth = 2.6;
    for (let i = 0; i < N; i++) {
      const f = fibrePos(i, p, seg); if (!f) continue;
      const [x, y, a] = f, c = Math.cos(a), sn = Math.sin(a);
      ctx.beginPath(); ctx.moveTo(x - c * 9, y - sn * 9); ctx.quadraticCurveTo(x + sn * 5, y - c * 5, x + c * 9, y + sn * 9); ctx.stroke();
    }
    // labels
    ctx.fillStyle = "rgba(238,233,227,.62)"; ctx.font = "500 22px Bricolage, sans-serif";
    ctx.fillText("From the", 0, 268); ctx.fillText("machine", 0, 294);
    ctx.fillText("To the", 856, WALL - 72); ctx.fillText("standpipe", 856, WALL - 46);
  }

  /* ---------- behaviour ---------- */
  function wire() {
    const root = document.querySelector(".sh2");
    if (!root || !window.MECH) return;
    const M = window.MECH, $ = (s, r = root) => r.querySelector(s), $$ = (s, r = root) => [...r.querySelectorAll(s)];
    const pc = getComputedStyle(root).getPropertyValue("--pc").trim() || "#5FCFD1";
    const rgb = /^#([0-9a-f]{6})$/i.test(pc) ? [0, 2, 4].map((k) => parseInt(pc.slice(1 + k, 3 + k), 16)) : [95, 207, 209];
    const cyan = (a) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;

    /* apart: assembled gives way to exploded, then the parts are numbered */
    const ap = $(".sh2-apart"), b = $(".sh2-pair .b", ap), pts = $$(".sh2-pt", ap), lis = $$(".sh2-parts li", ap);
    M.stage(ap, { draw(p) {
      const w = M.seg(p, 0.04, 0.32);
      b.style.clipPath = `inset(0 ${((1 - w) * 100).toFixed(2)}% 0 0)`;
      const n = Math.floor(M.seg(p, 0.36, 0.92) * (PARTS.length + 0.999));
      pts.forEach((el, i) => el.classList.toggle("on", i < n));
      lis.forEach((el, i) => { el.classList.toggle("on", i < n); el.classList.toggle("now", i === n - 1); });
    } });

    /* the wash */
    const wash = $(".sh2-wash"), cv = $(".sh2-cv", wash), layer = M.layer(cv);
    const nEl = $(".sh2-n2 b", wash), tEl = $(".sh2-step", wash), dEl = $(".sh2-desc", wash), xEl = $(".sh2-det", wash), clock = $(".sh2-clock", wash), cb = $("b", clock);
    let cur = -1, last = 0;
    const draw = (p) => {
      last = p;
      drawWash(layer, p, M, cyan);
      let k = 0; while (k < STEPS.length - 1 && p >= AT[k + 1]) k++;
      if (k !== cur) {
        cur = k; nEl.textContent = pad2(k + 1); tEl.textContent = STEPS[k][0]; dEl.textContent = STEPS[k][1]; xEl.textContent = STEPS[k][2];
        tEl.classList.remove("wipe"); void tEl.offsetWidth; tEl.classList.add("wipe");
        clock.hidden = k !== 1;
      }
      if (k === 1) { const m = M.seg(p, AT[1], AT[2]) * 30; cb.textContent = `${pad2(Math.floor(m))}:${pad2(Math.floor((m % 1) * 60))}`; }
    };
    M.stage(wash, { draw });
    addEventListener("resize", () => { if (wash.isConnected) { layer.fit(); draw(last); } });

    /* forms: one into the next */
    const fm = $(".sh2-forms"), fimgs = $$(".sh2-fv img", fm), flis = $$(".sh2-ftx li", fm);
    M.stage(fm, { draw(p) {
      const f = M.seg(p, 0.05, 0.92) * (FORMS.length - 1);
      fimgs.forEach((im, i) => { const d = Math.abs(f - i); im.style.opacity = Math.max(0, 1 - d).toFixed(3); im.style.transform = `translateX(${((i - f) * 6).toFixed(2)}vw)`; });
      const k = Math.round(f); flis.forEach((li, i) => li.classList.toggle("on", i === k));
    } });
  }

  window.SHIELD = { render, wire };
})();
