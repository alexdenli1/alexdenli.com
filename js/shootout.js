/* Index of works: a fifteen-second Western shooting gallery, at the foot of the home page.
   Plank signs with the project names pop up behind three barricades (and are thrown up over the street);
   the project hit most in fifteen seconds opens. Products fly past with a gold rim and are worth three.

   The chances are equal by design: the round follows a programme in which every project appears five times,
   in the same five ways and for the same time, and once in gold; every sign is the same size; nobody is shown
   to be winning until time is up; and a draw goes to whichever project has waited longest to win.

   The picture is images/western/western.webp, rendered for this page. It loads, and the game runs, only when the
   section is near the screen. The plain list of projects underneath always works, and with reduced motion the
   section is just the picture and the list.

   The winner's picture opens its project through the link in .sg-prize (data-vt: see app.js). */
(() => {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const PIC = "images/western/western.webp";
  const cutout = (p) => !!(p.chapter || (p.cut && p.thumb)), picOf = (p) => p.chapter || (p.cut && p.thumb) || p.hero;
  let list = [], cameFrom = false;

  function render(projects, link) {
    list = projects.slice();
    return `<section class="sg" aria-label="Index of works">
      <div class="sg-stage">
        <canvas class="sg-cv" tabindex="-1" role="img" aria-label="Shooting gallery. Arrow keys aim, Space shoots, Escape stops."></canvas>
        <div class="sg-over sg-intro"><div>
          <h2>15 seconds.<br>Take aim.</h2>
          <p>Hit the project you want to see. <span>The one you hit most opens.</span></p><p class="sg-gold">Gold is worth three.</p>
          <button class="sg-start" type="button">Start</button></div></div>
        <div class="sg-over sg-end" hidden><div>
          <a class="sg-prize" data-vt href="#/"><span class="sg-pic"><img alt=""></span><strong></strong></a><p class="sg-pts"></p>
          <button class="sg-again" type="button">Play again</button></div></div>
        <p class="sg-say" role="status"></p>
      </div>
      <nav class="sg-list" aria-label="All projects">${list.map((p) => `<a href="${link(p)}" data-slug="${esc(p.slug)}"><span>${esc(p.title)}</span><b></b></a>`).join("")}</nav>
    </section>`;
  }

  function wire() {
    const sec = document.querySelector(".sg"); if (!sec) return;
    const P = list, N = P.length, names = P.map((p) => p.title), src = P.map(picOf), isCut = P.map(cutout);
    const stage = sec.querySelector(".sg-stage"), cv = sec.querySelector(".sg-cv"), c = cv.getContext && cv.getContext("2d");
    const intro = sec.querySelector(".sg-intro"), end = sec.querySelector(".sg-end"), win = sec.querySelector(".sg-prize"), say = sec.querySelector(".sg-say"), links = [...sec.querySelectorAll(".sg-list a")];
    if (!c || matchMedia("(prefers-reduced-motion: reduce)").matches) {        // the calm version: the picture, and the list
      sec.classList.add("still"); intro.remove(); end.remove(); cv.remove(); const im = new Image(); im.className = "sg-still"; im.alt = ""; im.loading = "lazy"; im.src = PIC; stage.prepend(im); return;
    }
    /* what is showing: the welcome, the round, or the winner */
    const mode = (m) => { sec.dataset.mode = m; intro.hidden = m !== "intro"; end.hidden = m !== "end"; };

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), mix = (a, b, k) => a + (b - a) * k, out3 = (k) => 1 - Math.pow(1 - k, 3), back = (k) => 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2);
  const weed = (() => { const t = document.createElement("canvas"); t.width = t.height = 220; const g = t.getContext("2d"); g.translate(110, 110); g.lineCap = "round"; for (let n = 0; n < 210; n++) { const a = Math.random() * 6.28, R = 40 + Math.random() * 62, b = a + (Math.random() - .5) * 2.6, v = Math.random(); g.strokeStyle = `rgba(${mix(88, 196, v) | 0},${mix(58, 146, v) | 0},${mix(26, 84, v) | 0},.85)`; g.lineWidth = .8 + Math.random() * 1.8; g.beginPath(); g.moveTo(Math.cos(a) * R, Math.sin(a) * R); g.quadraticCurveTo(Math.cos((a + b) / 2) * R * .5, Math.sin((a + b) / 2) * R * .5, Math.cos(b) * R * .9, Math.sin(b) * R * .9); g.stroke(); } return t; })();
  let glow_ = 0;
  const rand = (a, b) => a + Math.random() * (b - a), LIMIT = 15;

  /* ---- the picture is 1800 x 900; three barricades the signs can stand behind ---- */
  const DW = 1800, DH = 900;
  const LEDGE = [{ y: 490, k: .80, sh: [15, 9, 10] }, { y: 630, k: .90, sh: [14, 9, 9] }, { y: 761, k: 1.0, sh: [13, 9, 8] }];
  const SKY = { k: .78, sh: [30, 26, 14] }, BW = 300, BH = 112;      // every target is this one board, whoever is on it
  const bg = new Image(), pics = P.map(() => new Image());
  let W = 0, H = 0, S = 1, OX = 0, OY = 0, dpr = 1, small = false;
  const X = (x) => OX + x * S, Y = (y) => OY + y * S, visL = () => Math.max(0, -OX / S), visR = () => Math.min(DW, (W - OX) / S);
  const fnt = (g, px, w = 800) => { g.font = `${w} ${px}px Bricolage, Arial, sans-serif`; if ("letterSpacing" in g) g.letterSpacing = "0px"; };

  /* ---- every target is the same plank sign; only the lettering differs ---- */
  const cuts = {};
  const scale = () => small ? clamp((visR() - visL()) * .455 / BW, .5, .8) : 1;
  function cut(i, kk) {
    const key = i + "/" + kk.toFixed(2); if (cuts[key]) return cuts[key];
    const k = kk * scale() * S * dpr, w = BW * k, h = BH * k, pad = Math.ceil(34 * k), dep = Math.max(3, Math.round(7 * k));
    const t = document.createElement("canvas"); t.width = Math.ceil(w + pad * 2); t.height = Math.ceil(h + pad * 2); const g = t.getContext("2d");
    let sd = 7; const rn = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };      // the same plank every time
    const edge = []; for (let n = 0; n <= 40; n++) edge.push([n / 40, (rn() - .5) * 3 * k]); for (let n = 0; n <= 14; n++) edge.push([1, n / 14, (rn() - .5) * 7 * k]);
    const ticket = () => { const x0 = pad, y0 = pad, x1 = pad + w, y1 = pad + h; g.beginPath(); for (let n = 0; n <= 40; n++) g.lineTo(x0 + w * n / 40, y0 + edge[n][1]); for (let n = 0; n <= 14; n++) g.lineTo(x1 + edge[41 + n][2], y0 + h * n / 14); for (let n = 40; n >= 0; n--) g.lineTo(x0 + w * n / 40, y1 - edge[40 - n][1]); for (let n = 14; n >= 0; n--) g.lineTo(x0 - edge[55 - n][2] * .9, y0 + h * n / 14); g.closePath(); };
    for (let d = dep; d > 0; d--) { const v = mix(1, .55, d / dep); g.save(); g.translate(d * .8, d * .55); ticket(); g.fillStyle = `rgb(${84 * v | 0},${54 * v | 0},${31 * v | 0})`; g.fill(); g.restore(); }
    const gr = g.createLinearGradient(0, pad, w * .3, pad + h); gr.addColorStop(0, "#F0D9AE"); gr.addColorStop(.55, "#DDBD8A"); gr.addColorStop(1, "#BC9560"); ticket(); g.fillStyle = gr; g.fill();
    g.save(); ticket(); g.clip(); g.lineCap = "round";
    for (let n = 0; n < 60; n++) { const y = pad + rn() * h, x = pad + rn() * w, L = (40 + rn() * 220) * k; g.strokeStyle = rn() < .6 ? "rgba(96,58,24,.20)" : "rgba(255,240,208,.28)"; g.lineWidth = (.5 + rn() * 1.5) * k; g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + L * .3, y + (rn() - .5) * 5 * k, x + L * .6, y + (rn() - .5) * 5 * k, x + L, y + (rn() - .5) * 3 * k); g.stroke(); }
    g.strokeStyle = "rgba(60,32,12,.55)"; g.lineWidth = 1.6 * k; g.beginPath(); g.moveTo(pad, pad + h * .5); for (let n = 1; n <= 12; n++) g.lineTo(pad + w * n / 12, pad + h * .5 + (rn() - .5) * 2 * k); g.globalAlpha = .28; g.stroke(); g.globalAlpha = 1;      // two planks, side by side
    const vg = g.createRadialGradient(pad + w / 2, pad + h / 2, h * .4, pad + w / 2, pad + h / 2, w * .62); vg.addColorStop(0, "rgba(70,36,10,0)"); vg.addColorStop(1, "rgba(70,36,10,.42)"); g.fillStyle = vg; g.fillRect(0, 0, t.width, t.height); g.restore();
    ticket(); g.lineWidth = 1.4 * k; g.strokeStyle = "rgba(255,236,196,.55)"; g.stroke();
    for (const [nx, ny] of [[.045, .16], [.955, .16], [.045, .84], [.955, .84]]) { const x = pad + w * nx, y = pad + h * ny; g.fillStyle = "rgba(40,20,6,.5)"; g.beginPath(); g.arc(x + k, y + k, 4.4 * k, 0, 7); g.fill(); g.fillStyle = "#4b4640"; g.beginPath(); g.arc(x, y, 3.8 * k, 0, 7); g.fill(); g.fillStyle = "#a8a196"; g.beginPath(); g.arc(x - k, y - k, 1.4 * k, 0, 7); g.fill(); }
    const words = names[i].split(" "), lines = words.length < 3 ? words : [words.slice(0, words.length - 1).join(" "), words[words.length - 1]];
    const fitW = w - 52 * k, fitH = h - 34 * k; fnt(g, 100); if ("letterSpacing" in g) g.letterSpacing = "-4px"; const fs = Math.min(...lines.map((l) => 100 * fitW / g.measureText(l).width), fitH / (lines.length * .84), 68 * k); fnt(g, fs); if ("letterSpacing" in g) g.letterSpacing = (-fs * .04).toFixed(2) + "px"; g.textAlign = "center"; g.textBaseline = "alphabetic"; g.fillStyle = "rgba(255,238,205,.5)"; lines.forEach((l, n) => g.fillText(l, pad + w / 2 - fs * .02 + 1.2 * k, pad + h / 2 + fs * .34 + (n - (lines.length - 1) / 2) * fs * .9 + 1.4 * k)); g.fillStyle = "#1c0f06";
    lines.forEach((l, n) => g.fillText(l, pad + w / 2 - fs * .02, pad + h / 2 + fs * .34 + (n - (lines.length - 1) / 2) * fs * .9));
    const s = document.createElement("canvas"); s.width = t.width; s.height = t.height; const q = s.getContext("2d"); q.shadowColor = "#000"; q.shadowBlur = 14 * k; q.shadowOffsetX = t.width * 2; q.drawImage(t, -t.width * 2, 0);
    const u = S * dpr; return cuts[key] = { img: t, shadow: s, w: w / u, asc: h / u, desc: 0, pad: pad / u };
  }

  function size() { dpr = Math.min(2, devicePixelRatio || 1); const r = stage.getBoundingClientRect(); W = r.width; H = r.height; small = W < 700; cv.width = W * dpr; cv.height = H * dpr; S = Math.max(W / DW, H / DH); OX = (W - DW * S) / 2; OY = (H - DH * S) * .5; for (const k in cuts) delete cuts[k]; }

  /* ---- the round ---- */
  let st = "intro", t = 0, clock = LIMIT, T = [], bits = [], pops = [], dents = [], score = [], aim = { x: -99, y: -99, on: false, kick: 0 }, winner = -1, shots = 0, hits = 0;
  function reset() { st = "intro"; t = 0; clock = LIMIT; T = []; bits = []; pops = []; dents = []; score = Array(N).fill(0); winner = -1; shots = hits = 0; aim.on = false; makePlan(); tally(); mode("intro"); }
  function start() { if (st !== "intro") return; if (!ready) { keen = true; return; }      // pressed before the scene has loaded: begin as soon as it has
    st = "ready"; t = 0; say.textContent = "Ready"; mode("play"); cv.focus({ preventScroll: true }); line_(); }
  let won_ = {}; try { won_ = JSON.parse(localStorage.getItem("index-game") || "{}"); } catch (e) {}
  const lead = () => { const top = Math.max(...score); if (!top) return -1; const tied = P.map((p, i) => i).filter((i) => score[i] === top), r = P.map(() => Math.random()); tied.sort((a, b) => (won_[P[a].slug] || 0) - (won_[P[b].slug] || 0) || r[a] - r[b]); return tied[0]; };   // a draw goes to whoever has waited longest to win
  function tally() { const show = st === "end" || st === "done"; links.forEach((a, i) => { a.querySelector("b").textContent = show ? score[i] : ""; a.classList.toggle("lead", show && i === winner); }); }      // scores stay hidden until time is up

  /* The programme for a round. Every project comes up five times, in the same five ways and for the same time;
     each block of seven has every project in it exactly once, so nobody is bunched at the start or the end. */
  let plan = [], goldPlan = [];
  const mixUp = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function makePlan() {
    plan = []; const kinds = ["0", "1", "2", "toss", "slide"], off = mixUp([...Array(N).keys()]); let lastOne = -1;
    for (let b = 0; b < 5; b++) { let o; do { o = mixUp([...Array(N).keys()]); } while (o[0] === lastOne); lastOne = o[N - 1]; o.forEach((i) => plan.push({ i, kind: kinds[(b + off[i]) % 5], life: 1.95 - b * .09 })); }
    const span = LIMIT - 1.75; plan.forEach((q, n) => { q.at = .15 + span * Math.pow(n / (plan.length - 1), .93); });
    goldPlan = mixUp([...Array(N).keys()]).map((i, n) => ({ i, at: 1.2 + n * (LIMIT - 4.0) / (N - 1), dir: n % 2 ? 1 : -1 }));
  }
  function spawnWord(e) {
    const i = e.i, l0 = visL() + 18, r0 = visR() - 18;
    if (e.kind === "toss") { const k = cut(i, SKY.k), l = l0 + k.w / 2, r = r0 - k.w / 2, x0 = rand(l, r), x1 = clamp(x0 + (Math.random() < .5 ? -1 : 1) * rand(60, small ? 90 : 300), l, r); T.push({ type: "toss", i, k, x0, x1, t: 0, life: e.life, h: rand(0, 1), a: rand(-.10, .10) }); return; }
    const slide = e.kind === "slide" && !small, home = e.kind === "slide" ? 1 : +e.kind; let best = null, L, k;
    /* its own ledge first; only if a sign is in the way does it take another */
    for (const L_ of [home, (home + 1) % 3, (home + 2) % 3]) { if (best && best.gap > -4) break; const k_ = cut(i, LEDGE[L_].k); L = L_; k = k_;
    for (let n = 0; n < 40; n++) { const vx = slide ? (Math.random() < .5 ? -1 : 1) * (small ? 26 : 70) : 0, x = rand(l0, Math.max(l0, r0 - k.w)); if (x + vx * e.life < l0 || x + k.w + vx * e.life > r0) continue;
      let gap = 1e3; for (const q of T) if (!q.dead && q.type === "pop" && q.L === L) { const ox = q.x + q.vx * q.t; gap = Math.min(gap, Math.max(x - (ox + q.k.w), ox - (x + k.w))); } if (!best || gap > best.gap) best = { x, vx, gap, L, k }; if (gap > 40) break; } }
    if (best) { L = best.L; k = best.k; }
    best = best || { x: (l0 + r0 - k.w) / 2, vx: 0 }; T.push({ type: "pop", i, k, L, x: best.x, vx: best.vx, t: 0, life: e.life });
  }
  function spawnGold(e) { T.push({ type: "gold", i: e.i, dir: e.dir, r: small ? 50 : 62, t: 0, life: small ? 2.3 : 2.9, y: 190, amp: 40, f: 1.4, spark: 0 }); }
  /* where a target is now */
  function pose(q) {
    if (q.type === "gold") { const k = q.t / q.life, a = visL() - 90, b = visR() + 90; return { x: q.dir > 0 ? mix(a, b, k) : mix(b, a, k), y: q.y + Math.sin(k * Math.PI * 2 * q.f) * q.amp, r: q.r * (1 + .03 * Math.sin(q.t * 9)) }; }
    if (q.type === "toss") { const k = q.t / q.life, base = LEDGE[0].y + 110, top = mix(230, 320, q.h), y = base - (base - top) * 4 * k * (1 - k); return { x: mix(q.x0, q.x1, k) - q.k.w / 2, y, a: q.a * (1 - 2 * k), clip: LEDGE[0].y }; }
    const up = .2, dn = .2, f = q.t < up ? back(q.t / up) : q.t > q.life - dn ? 1 - Math.pow((q.t - (q.life - dn)) / dn, 2) : 1; const hgt = q.k.asc + 16, base = LEDGE[q.L].y;
    return { x: q.x + q.vx * q.t, y: base - 8 + hgt * (1 - f), f, clip: base };
  }
  const boxOf = (q) => { const o = pose(q); if (q.type === "gold") return { x: o.x - o.r, y: o.y - o.r, w: o.r * 2, h: o.r * 2 }; return { x: o.x, y: o.y - q.k.asc, w: q.k.w, h: Math.min(q.k.asc, o.clip - (o.y - q.k.asc)) }; };

  function shoot(sx, sy) {
    if (st !== "play") return; shots++; aim.kick = 1; for (let n = 0; n < 5; n++) bits.push({ smoke: 1, x: (sx - OX) / S + rand(-8, 8), y: (sy - OY) / S + rand(-6, 6), vx: rand(-14, 14), vy: rand(-46, -14), r: rand(9, 18), t: 0, l: rand(.5, .95), g: -20 }); const x = (sx - OX) / S, y = (sy - OY) / S, m = (small ? 14 : 8);
    let best = null; for (let n = T.length - 1; n >= 0; n--) { const q = T[n]; if (q.dead) continue; const b = boxOf(q); if (b.h > 4 && x > b.x - m && x < b.x + b.w + m && y > b.y - m && y < b.y + b.h + m) { const z = q.type === "gold" ? 9 : q.type === "toss" ? 0 : 1 + q.L; if (!best || z > best.z) best = { q, z }; } }
    if (!best) { dents.push({ x, y, t: 0, a: rand(0, 6) }); if (dents.length > 14) dents.shift(); for (let n = 0; n < 7; n++) bits.push({ x, y, vx: rand(-90, 90), vy: rand(-150, 20), r: rand(1.2, 3.2), t: 0, l: rand(.3, .6), g: 620, col: "#FFE3B0" }); return; }
    const q = best.q; q.dead = true; hits++; const pts = q.type === "gold" ? 3 : 1; score[q.i] += pts; tally();
    pops.push({ x, y: y - 26, t: 0, txt: "+" + pts, gold: q.type === "gold" });
    const o = pose(q);
    if (q.type === "gold") { for (let n = 0; n < 46; n++) { const a = rand(0, 6.28), v = rand(60, 420); bits.push({ x: o.x, y: o.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, r: rand(1.5, 5), t: 0, l: rand(.5, 1.1), g: 420, col: ["#FFE9A8", "#F4C44E", "#D9982B", "#fff"][n % 4], glow: 1 }); } bits.push({ ring: 1, x: o.x, y: o.y, t: 0, l: .5 }); return; }
    const u2 = S * dpr; bits.push({ board: q.k.img, pad: q.k.pad, w: q.k.img.width / u2, h: q.k.img.height / u2, x: o.x, y: o.y - q.k.asc, vx: (o.x + q.k.w / 2 - x) * .5, vy: q.type === "toss" ? -60 : -190, a: o.a || 0, va: clamp((o.x + q.k.w / 2 - x) * -.012, -1.6, 1.6) + rand(-.5, .5), t: 0, l: 1.1, g: 1500, clip: o.clip, L: q.type === "toss" ? -1 : q.L });
    for (let n = 0; n < 26; n++) bits.push({ conf: 1, x, y, vx: rand(-330, 330), vy: rand(-460, -40), r: rand(4, 8), a: rand(0, 6), va: rand(-12, 12), t: 0, l: rand(.8, 1.5), g: 620, col: ["#E8CB97", "#B98D55", "#7A4F28", "#F3DFB6", "#5a3a1e"][n % 5], thin: 1 });
    for (let n = 0; n < 8; n++) bits.push({ x, y, vx: rand(-200, 200), vy: rand(-260, 40), r: rand(1.5, 4), t: 0, l: rand(.3, .7), g: 900, col: n % 2 ? "#FFF3DC" : "#B8842A" });
  }
  function step(dt) {
    t += dt; glow_ += dt; aim.kick = Math.max(0, aim.kick - dt * 7);
    if (kb.x || kb.y) { aim.on = true; aim.x = clamp(aim.x + kb.x * 620 * dt, 0, W); aim.y = clamp(aim.y + kb.y * 620 * dt, 0, H); }
    if (st === "ready" && t > 1.1) { st = "play"; t = 0; say.textContent = "Draw"; }
    if (st === "play") {
      clock = Math.max(0, clock - dt); const now = LIMIT - clock;
      while (plan.length && plan[0].at <= now) spawnWord(plan.shift());
      while (goldPlan.length && goldPlan[0].at <= now) spawnGold(goldPlan.shift());
      if (clock === 0) { st = "end"; t = 0; winner = lead(); if (winner >= 0) { won_[P[winner].slug] = Date.now(); try { localStorage.setItem("index-game", JSON.stringify(won_)); } catch (e) {} } tally(); say.textContent = winner < 0 ? "Time. No hits." : "Time. " + P[winner].title + " wins."; T.forEach((q) => { if (q.type === "pop" && !q.dead && q.t < q.life - .2) q.t = q.life - .2; }); }
    }
    T.forEach((q) => { q.t += dt; if (q.type === "gold" && !q.dead) { q.spark -= dt; if (q.spark <= 0) { q.spark = .03; const o = pose(q); bits.push({ x: o.x - q.dir * o.r * .8, y: o.y + rand(-o.r * .7, o.r * .7), vx: -q.dir * rand(10, 60), vy: rand(-20, 30), r: rand(1, 3), t: 0, l: rand(.35, .8), g: 60, col: Math.random() < .5 ? "#FFE39A" : "#E3A53A", glow: 1 }); } } }); T = T.filter((q) => !q.dead && q.t < q.life);
    bits.forEach((b) => { b.t += dt; if (b.ring) return; b.vy += b.g * dt; b.x += b.vx * dt; b.y += b.vy * dt; if (b.board) b.a += b.va * dt; }); bits = bits.filter((b) => b.t < b.l);
    pops.forEach((p) => { p.t += dt; }); pops = pops.filter((p) => p.t < .8); dents.forEach((d) => { d.t += dt; }); dents = dents.filter((d) => d.t < 5);
    if (st === "end") { if (winner < 0) { if (t > 2) reset(); } else { if (t > .35) prize(); if (t > 2.9) { st = "done"; go(); } } }
  }

  /* ---- drawing ---- */
  const clipAbove = (y, f) => { c.save(); c.beginPath(); c.rect(0, 0, W, Y(y)); c.clip(); f(); c.restore(); };
  function drawWord(q) {
    const o = pose(q), k = q.k, sh = q.type === "toss" ? SKY.sh : LEDGE[q.L].sh;
    clipAbove(o.clip, () => {
      const dx = X(o.x - k.pad), dy = Y(o.y - k.asc - k.pad), iw = k.img.width / dpr, ih = k.img.height / dpr;
      c.save(); c.globalAlpha = q.type === "toss" ? .42 : .55; c.drawImage(k.shadow, dx + sh[0] * S, dy + sh[1] * S, iw, ih); c.restore();
      if (q.type === "pop") { c.fillStyle = "#4a311c"; const bw = 13 * S; for (const z of [.28, .72]) c.fillRect(X(o.x + k.w * z) - bw / 2, Y(o.y) - 2, bw, 60 * S); }
      c.save(); if (o.a) { const cx = X(o.x + k.w / 2), cy = Y(o.y - k.asc / 2); c.translate(cx, cy); c.rotate(o.a); c.translate(-cx, -cy); } c.drawImage(k.img, dx, dy, iw, ih); c.restore(); });
  }
  function drawGold(q) {
    const o = pose(q), x = X(o.x), y = Y(o.y), r = o.r * S, lw = Math.max(4, r * .13);
    
    c.save(); c.shadowColor = "rgba(255,200,80,.95)"; c.shadowBlur = r * (.45 + .15 * Math.sin(q.t * 7)); c.fillStyle = "#fff"; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore();
    c.save(); c.beginPath(); c.arc(x, y, r - lw * .4, 0, 7); c.clip(); c.fillStyle = "#fff"; c.fillRect(x - r, y - r, 2 * r, 2 * r); const im = shots_[q.i]; if (im) { const full = !isCut[q.i], z = full ? Math.max(2 * r / im.width, 2 * r / im.height) : 2 * r * .84 / Math.hypot(im.width, im.height), w = im.width * z, h = im.height * z; c.imageSmoothingQuality = "high"; c.drawImage(im, x - w / 2, y - h / 2, w, h); } c.restore();
    const g = c.createConicGradient ? c.createConicGradient(q.t * 3.4, x, y) : null; if (g) [["0", "#B8791A"], ["0.12", "#FFF3C4"], ["0.25", "#E8B23A"], ["0.45", "#A8690F"], ["0.6", "#FFE9A0"], ["0.75", "#D99A26"], ["0.9", "#8F560A"], ["1", "#B8791A"]].forEach(([a, b]) => g.addColorStop(+a, b));
    c.lineWidth = lw; c.strokeStyle = g || "#E0A733"; c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke(); c.lineWidth = 1; c.strokeStyle = "rgba(255,255,255,.65)"; c.beginPath(); c.arc(x, y, r + lw * .42, 3.6, 5.2); c.stroke();
    const a = q.t * 5, gx = x + Math.cos(a) * r, gy = y + Math.sin(a) * r, gs = lw * 1.5; c.save(); c.fillStyle = "#fff"; c.shadowColor = "#FFE9A8"; c.shadowBlur = 12; c.beginPath(); for (let n = 0; n < 8; n++) { const rr = n % 2 ? gs * .22 : gs, an = n * Math.PI / 4; c.lineTo(gx + Math.cos(an) * rr, gy + Math.sin(an) * rr); } c.fill(); c.restore();
  }
  const drawBits = (f) => bits.forEach((b) => { if (!f(b)) return; const k = b.t / b.l;
    if (b.ring) { c.globalAlpha = 1 - k; c.lineWidth = 6 * (1 - k) + 1; c.strokeStyle = "#F4C44E"; c.beginPath(); c.arc(X(b.x), Y(b.y), (40 + 150 * out3(k)) * S, 0, 7); c.stroke(); c.globalAlpha = 1; return; }
    if (b.smoke) { c.globalAlpha = .20 * (1 - k); c.fillStyle = "#f4ece0"; c.beginPath(); c.arc(X(b.x), Y(b.y), b.r * S * (1 + 1.4 * k), 0, 7); c.fill(); c.globalAlpha = 1; return; }
    if (b.conf) { const s = b.r * Math.max(S, .7); c.save(); c.globalAlpha = 1 - k * k; c.translate(X(b.x), Y(b.y)); c.rotate(b.t * b.va + b.a); c.scale(1, Math.cos(b.t * 14 + b.a)); c.fillStyle = b.col; c.fillRect(-s, -s * .16, s * 2, s * .32); c.restore(); return; }
    if (b.board) { clipAbove(b.clip, () => { const w = b.w * S, h = b.h * S; c.translate(X(b.x - b.pad) + w / 2, Y(b.y - b.pad) + h / 2); c.rotate(b.a); c.scale(1, Math.max(.06, Math.abs(Math.cos(b.t * 9)))); c.drawImage(b.board, -w / 2, -h / 2, w, h); }); return; }
    c.globalAlpha = 1 - k; c.fillStyle = b.col; if (b.glow) { c.shadowColor = b.col; c.shadowBlur = 8; } c.beginPath(); c.arc(X(b.x), Y(b.y), b.r * Math.max(S, .75), 0, 7); c.fill(); c.shadowBlur = 0; c.globalAlpha = 1; });
  const txt = (s, x, y, px, al = "left", col = "#000", w = 800) => { fnt(c, px, w); if ("letterSpacing" in c) c.letterSpacing = (-px * (w > 700 ? .04 : .005)).toFixed(2) + "px"; c.textAlign = al; c.textBaseline = "alphabetic"; c.fillStyle = col; c.fillText(s, x, y); };
  const plate = (x, y, w, h, r) => { c.beginPath(); c.roundRect ? c.roundRect(x, y, w, h, r) : c.rect(x, y, w, h); };
  function draw() {
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H); if (!bg.naturalWidth) return; c.imageSmoothingQuality = "high"; c.drawImage(bg, OX, OY, DW * S, DH * S);
    { const P_ = 8.5, k = (glow_ % P_) / P_, x = mix(visL() - 160, visR() + 160, k), r = 34, y = 452 - Math.abs(Math.sin(glow_ * 3.1)) * 26, a = glow_ * 3.4; clipAbove(LEDGE[0].y, () => { c.globalAlpha = .4; c.fillStyle = "#2a1808"; c.beginPath(); c.ellipse(X(x + 22), Y(482), r * S * 1.1, 7 * S, 0, 0, 7); c.fill(); c.globalAlpha = 1; c.translate(X(x), Y(y)); c.rotate(a); c.drawImage(weed, -r * S, -r * S, 2 * r * S, 2 * r * S); }); }
    dents.forEach((d) => { c.globalAlpha = .55 * (1 - d.t / 5); const x = X(d.x), y = Y(d.y), r = 5 * Math.max(S, .8); c.fillStyle = "#120a06"; c.beginPath(); c.arc(x, y, r * .7, 0, 7); c.fill(); c.strokeStyle = "rgba(255,225,170,.5)"; c.lineWidth = 1; c.stroke(); c.globalAlpha = 1; });
    T.filter((q) => q.type === "toss").forEach(drawWord); drawBits((b) => b.L === -1);
    for (let L = 0; L < 3; L++) { T.filter((q) => q.type === "pop" && q.L === L).forEach(drawWord); drawBits((b) => b.L === L); }
    T.filter((q) => q.type === "gold").forEach(drawGold); drawBits((b) => b.L === undefined);
    pops.forEach((p) => { const k = p.t / .8, px = (p.gold ? 74 : 46) * Math.max(S, .72) * (k < .15 ? k / .15 : 1); c.globalAlpha = 1 - Math.max(0, (k - .5) * 2); c.save(); c.shadowColor = "rgba(0,0,0,.8)"; c.shadowBlur = 10; if (p.gold) { c.shadowColor = "rgba(255,200,80,.9)"; c.shadowBlur = 18; } txt(p.txt, X(p.x), Y(p.y) - 46 * out3(k), Math.max(1, px), "center", p.gold ? "#FFD35C" : "#FFF6E2"); c.restore(); c.globalAlpha = 1; });
    if (st === "play") { const n = Math.ceil(clock), big = small ? 46 : clamp(H * .085, 54, 84), last = clock < 3.02, pw = big * 1.75, ph = big * 1.22, px0 = W / 2 - pw / 2, py0 = small ? 12 : 16;
      c.save(); c.shadowColor = "rgba(0,0,0,.5)"; c.shadowBlur = 16; c.shadowOffsetY = 5; c.fillStyle = "#F0DDB4"; plate(px0, py0, pw, ph, 6); c.fill(); c.restore(); c.strokeStyle = last ? "#A3231B" : "#6A3F1C"; c.lineWidth = 2.5; plate(px0 + 5, py0 + 5, pw - 10, ph - 10, 3); c.stroke();
      txt(String(n), W / 2 - big * .02, py0 + ph / 2 + big * .33, big, "center", last ? "#C8202B" : "#15110d"); }
    if (st === "ready") { const k = t / 1.1, px = clamp(W * .13, 64, 190); c.globalAlpha = k < .85 ? 1 : (1 - k) / .15; c.save(); c.shadowColor = "rgba(0,0,0,.6)"; c.shadowBlur = 30; txt(k < .62 ? "Ready" : "Draw", W / 2, H * .46 + px * .3, px, "center", "#FFF6E2"); c.restore(); c.globalAlpha = 1; }
    if (st === "intro") {
      c.fillStyle = "rgba(24,12,5,.60)"; c.fillRect(0, 0, W, H); }
    if (st === "end" || st === "done") { const k = clamp(t / .45, 0, 1); c.fillStyle = `rgba(24,12,5,${.74 * k})`; c.fillRect(0, 0, W, H);
      if (winner < 0) { const px = clamp(W * .09, 44, 130); txt("No hits", W / 2, H * .48, px, "center", "#FFF6E2"); txt("Have another go.", W / 2, H * .48 + 44, 20, "center", "#F3E6CF", 500); }
    }
    /* the sight */
    if (aim.on && st !== "done" && st !== "end") { const r = (small ? 20 : 24) * (1 + .35 * aim.kick), x = aim.x, y = aim.y; c.lineCap = "butt"; for (const [col, w] of [["rgba(0,0,0,.6)", 5.5], ["#FFF6E2", 2.4]]) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke(); for (let n = 0; n < 4; n++) { const a = n * Math.PI / 2, ca = Math.cos(a), sa = Math.sin(a); c.beginPath(); c.moveTo(x + ca * (r - 7), y + sa * (r - 7)); c.lineTo(x + ca * (r + 8), y + sa * (r + 8)); c.stroke(); } } c.fillStyle = "#FF4A3D"; c.beginPath(); c.arc(x, y, 3, 0, 7); c.fill(); }
  }

  /* each product cut to what can be seen of it, so they all fill their medal alike */
  const shots_ = P.map(() => null);
  function crop(im, i) {
    if (!im.naturalWidth) return; const z = Math.min(1, 900 / Math.max(im.naturalWidth, im.naturalHeight)), w = Math.round(im.naturalWidth * z), h = Math.round(im.naturalHeight * z), a = document.createElement("canvas"); a.width = w; a.height = h; const x = a.getContext("2d"); x.imageSmoothingQuality = "high"; x.drawImage(im, 0, 0, w, h); shots_[i] = a; if (!isCut[i]) return;
    let d; try { d = x.getImageData(0, 0, w, h).data; } catch (e) { return; }
    let x0 = w, y0 = h, x1 = 0, y1 = 0; for (let q = 0; q < h; q += 2) for (let p = 0; p < w; p += 2) if (d[(q * w + p) * 4 + 3] > 40) { if (p < x0) x0 = p; if (p > x1) x1 = p; if (q < y0) y0 = q; if (q > y1) y1 = q; }
    if (x1 <= x0 || y1 <= y0) return; const b = document.createElement("canvas"); b.width = x1 - x0 + 2; b.height = y1 - y0 + 2; b.getContext("2d").drawImage(a, -x0, -y0); shots_[i] = b;
  }

  /* ---- the winner ---- */
  function prize() {
    if (!end.hidden) return; const p = P[winner], pts = score[winner];
    win.href = "#/project/" + p.slug; win.dataset.slug = p.slug; { const s = shots_[winner], im = win.querySelector("img"); let u = src[winner]; if (s && isCut[winner]) { try { u = s.toDataURL("image/webp", .9); } catch (e) {} const g = Math.hypot(s.width, s.height); im.style.width = (84 * s.width / g).toFixed(1) + "%"; im.style.height = (84 * s.height / g).toFixed(1) + "%"; } else im.style.width = im.style.height = isCut[winner] ? "64%" : "100%"; im.src = u; } win.querySelector(".sg-pic").classList.toggle("full", !isCut[winner]);
    win.querySelector("strong").textContent = p.title; sec.querySelector(".sg-pts").textContent = pts + (pts === 1 ? " point" : " points"); mode("end");
  }
  /* it opens by itself, unless the visitor has already scrolled on */
  function go() { if (sec.isConnected && seen > .45 && !document.hidden) win.click(); }
  win.addEventListener("click", () => { cameFrom = true; st = "done"; });
  sec.querySelector(".sg-again").addEventListener("click", () => { reset(); start(); });
  sec.querySelector(".sg-start").addEventListener("click", start);

  /* ---- hands ---- (the page scrolls as usual except while a round is on) */
  /* bring the whole scene on screen, just under the nav */
  function line_() { const nav = document.getElementById("nav"), d = stage.getBoundingClientRect().top - (nav ? nav.offsetHeight : 0); if (Math.abs(d) > 4) scrollBy({ top: d, behavior: "smooth" }); }
  const busy = () => st === "ready" || st === "play";
  const at = (e) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  cv.addEventListener("pointermove", (e) => { const q = at(e); aim.x = q.x; aim.y = q.y; aim.on = busy() && (e.pointerType !== "touch" || e.buttons > 0); });
  cv.addEventListener("pointerdown", (e) => { if (!busy()) return; const q = at(e); aim.x = q.x; aim.y = q.y; aim.on = true; shoot(q.x, q.y); });
  cv.addEventListener("pointerup", (e) => { if (e.pointerType === "touch") setTimeout(() => { aim.on = false; }, 160); });
  cv.addEventListener("pointerleave", () => { aim.on = false; });
  cv.addEventListener("contextmenu", (e) => { if (busy()) e.preventDefault(); });
  const kb = { x: 0, y: 0 }, dir = { ArrowLeft: ["x", -1], ArrowRight: ["x", 1], ArrowUp: ["y", -1], ArrowDown: ["y", 1] };
  cv.addEventListener("keydown", (e) => { if (!busy()) return;
    if (dir[e.code]) { e.preventDefault(); if (!aim.on) { aim.x = W / 2; aim.y = H / 2; aim.on = true; } kb[dir[e.code][0]] = dir[e.code][1]; }
    else if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); if (!e.repeat && aim.on) shoot(aim.x, aim.y); }
    else if (e.code === "Escape") { reset(); sec.querySelector(".sg-start").focus({ preventScroll: true }); } });
  cv.addEventListener("keyup", (e) => { if (dir[e.code] && kb[dir[e.code][0]] === dir[e.code][1]) kb[dir[e.code][0]] = 0; });
  cv.addEventListener("blur", () => { kb.x = kb.y = 0; });

  /* ---- running: only near the screen, and only while this page is up ---- */
  let seen = 0, ready = false, keen = false, raf = 0, last = 0, rt = 0;
  const load = (im, s) => new Promise((r) => { im.onload = im.onerror = r; im.src = s; });
  const fit = () => { if (!sec.isConnected) return removeEventListener("resize", onSize); size(); T.forEach((q) => { if (q.k) q.k = cut(q.i, q.type === "toss" ? SKY.k : LEDGE[q.L].k); }); if (ready) draw(); };
  const onSize = () => { clearTimeout(rt); rt = setTimeout(fit, 120); };
  const tick = (n) => { raf = 0; if (!sec.isConnected || seen <= 0) return; const dt = Math.min(.034, (n - last) / 1000 || 0); last = n; step(dt); if (!sec.isConnected) return; draw(); raf = requestAnimationFrame(tick); };
  const run = () => { if (!raf && ready && seen > 0) { last = performance.now(); raf = requestAnimationFrame(tick); } };
  reset();
  addEventListener("resize", onSize);
  let asked = false;
  new IntersectionObserver((es, ob) => { if (!sec.isConnected) return ob.disconnect(); if (asked || !es.some((e) => e.isIntersecting)) return; asked = true; ob.disconnect();
    Promise.all([800, 700].map((w) => document.fonts.load(w + " 40px Bricolage")).concat(load(bg, PIC), pics.map((im, i) => load(im, src[i])))).then(() => { if (!sec.isConnected) return; pics.forEach(crop); ready = true; fit(); run(); if (keen) start(); }); }, { rootMargin: "900px 0px" }).observe(sec);
  new IntersectionObserver((es, ob) => { if (!sec.isConnected) return ob.disconnect(); seen = es[es.length - 1].intersectionRatio; if (seen < .3 && busy()) reset(); run(); }, { threshold: [0, .15, .3, .45, .6, .8, 1] }).observe(stage);
  sec.__game = { step, shoot, start, reset, boxOf, draw, XY: (x, y) => [X(x), Y(y)], get st() { return st; }, get T() { return T; }, get score() { return score; }, get winner() { return winner; } };
  }

  window.SHOOTOUT = { render, wire, took: () => { const v = cameFrom; cameFrom = false; return v; } };
})();
