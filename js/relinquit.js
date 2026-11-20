/* Relinquit: scrolling dispenses the cigarettes.
   A calm cream page with the case's own lagoon colour as its one accent (var(--project)).
   Built on the shared engine (js/mech.js):
     the case    drawn live: each scroll step glances at the screen, slides the gate, lifts one
                 cigarette out and rests, while the e-ink screen counts down. Three times, then none.
     inside      the exploded view, its parts numbered in turn, and the four colourways
     the app     nine screens scrolling through one phone
   then the research and the ideas behind it, and the outcome.
   Every figure comes from the project's own research board (sources are listed on the page). */
(() => {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const IMG = (f, alt, cls = "", lazy = true) => `<img${cls ? ` class="${cls}"` : ""} src="images/relinquit/${f}" alt="${esc(alt)}"${lazy ? ' loading="lazy"' : ""} decoding="async">`;
  const pad2 = (n) => String(n).padStart(2, "0");

  /* ---------- content ---------- */
  const ACTS = [
    ["Glance", "The always-on screen shows what is left today."],
    ["Slide", "One thumb moves the gate. Either hand works."],
    ["Take one", "A single cigarette rises and is counted."],
    ["Rest", "The gate holds shut until the next slot, with a countdown."]
  ];
  const PARTS = ["Cap and slider", "Body shell", "Circuit board", "Battery", "E-ink screen", "Lens and dot", "Cassette of ten", "Spring"];
  const BAD = [[8.4, 6.5], [9.0, 40.7], [33.5, 41.6], [49.9, 45.1], [71.7, 45.0], [89.6, 46.8], [10.8, 75.0], [10.8, 95.8]];
  const COLOURS = ["Graphite", "Chalk and lagoon", "Sage", "Clay"];
  const SCREENS = [
    ["Welcome", "Step down or quit now", 0], ["Pair", "Hold the dot for three seconds", 0], ["Plan", "Every plan ends on a quit date", 0],
    ["Today", "What is left today, and the next slot", 1], ["Resting", "A countdown, not a “locked” message", 1], ["Craving SOS", "A two-minute reset for the moments in between", 1],
    ["Insights", "Patterns and triggers, week by week", 2], ["Progress", "Money kept and milestones after the quit date", 2], ["Case", "Battery, lock and privacy", 2]
  ];
  const GROUPS = ["Set up", "Every day", "Over time"];
  const SKETCHES = ["Flip-top", "Top gate", "Carousel", "Drawer", "Pebble", "Case and lighter", "Home dock", "Clip-on tag"];
  const SCORES = [["A  Flip-top", 20], ["B  Top gate", 36], ["C  Carousel", 24]];

  /* ---------- the case, drawn to its own proportions (46 x 94 mm, x10) ---------- */
  const caseSvg = () => `<svg class="rq-case" viewBox="-40 -330 540 1300" role="img" aria-label="The Relinquit case: a teal cap with a sliding gate on top, an e-ink screen showing how many cigarettes are left today, and a dot below">
    <defs><clipPath id="rqSlot"><rect x="-40" y="-330" width="540" height="306"/></clipPath>
      <linearGradient id="rqBody" x1="0" x2="1"><stop offset="0" stop-color="#FBFAF7"/><stop offset=".8" stop-color="#F1EFEA"/><stop offset="1" stop-color="#E2DFD8"/></linearGradient></defs>
    <!-- the cigarette, rising out of the slot (only the part above the top shows) -->
    <g clip-path="url(#rqSlot)"><g class="rq-cig"><rect x="296" y="0" width="58" height="300" rx="10" fill="#FBF7EF" stroke="#D9D2C4" stroke-width="2"/>
      <rect x="296" y="0" width="58" height="96" rx="10" fill="#D79A5B"/><rect x="296" y="86" width="58" height="10" fill="#C98848"/></g></g>
    <!-- top face with the slot and the slider -->
    <path d="M26 -2 L434 -2 L404 -52 L56 -52 Z" fill="#7FC0C6"/>
    <rect x="286" y="-44" width="80" height="34" rx="17" fill="#1E2C2E"/>
    <g class="rq-slider"><rect x="90" y="-46" width="150" height="38" rx="19" fill="#2E3A3C"/><path d="M140 -38v22M158 -38v22M176 -38v22M194 -38v22" stroke="#4E5C5E" stroke-width="5" stroke-linecap="round"/></g>
    <!-- body and cap -->
    <rect x="0" y="0" width="460" height="940" rx="64" fill="url(#rqBody)" stroke="#D8D4CC" stroke-width="2"/>
    <path d="M0 250 V64 Q0 0 64 0 H396 Q460 0 460 64 V250 L230 312 Z" fill="var(--project, #4FA3B1)"/>
    <path d="M0 250 L230 312 L460 250" fill="none" stroke="rgba(0,0,0,.08)" stroke-width="3"/>
    <!-- e-ink screen -->
    <rect x="86" y="380" width="288" height="290" rx="34" fill="#2A2C2F"/>
    <rect x="106" y="400" width="248" height="250" rx="16" fill="#E8E9E4"/>
    <g class="rq-eink" font-family="Bricolage, sans-serif" text-anchor="middle" fill="#1E2224">
      <text class="rq-e1" x="230" y="448" font-size="22" letter-spacing="2">TODAY</text>
      <text class="rq-e2" x="230" y="560" font-size="118" font-weight="700">3</text>
      <text class="rq-e3" x="230" y="598" font-size="22">of 7 left</text>
      <g class="rq-dots" stroke="#1E2224" stroke-width="2.5">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<circle cx="${158 + i * 24}" cy="626" r="7"/>`).join("")}</g>
    </g>
    <!-- the dot: teal when ready, amber when resting -->
    <circle class="rq-dot" cx="230" cy="800" r="46" fill="var(--project, #4FA3B1)" stroke="rgba(0,0,0,.12)" stroke-width="3"/>
  </svg>`;

  /* ---------- the page ---------- */
  function render(p, tail) {
    const cycles = 3;
    return `<article class="page rq2">

    <section class="rq2-hero">
      <div class="rq2-htx">
        <h1>Relinquit</h1>
        <p class="rq2-line">One at a time. <span>Then none.</span></p>
        <p class="rq2-sub"><em>${esc(p.year)}</em><span>${esc(p.summary)}</span></p>
      </div>
      <img class="rq-hc" src="images/relinquit/hero-case.webp" alt="Two Relinquit cases, graphite and chalk with a lagoon cap, showing the daily count on the e-ink screen" decoding="async">
    </section>

    <section class="rq2-key" aria-label="The result">
      <p class="rq2-big">One thumb, one cigarette. The case counts every one, holds the next until its slot, and steps you down to a quit date you choose.</p>
      <dl class="rq2-n">
        <div><dt>46 × 94 × 20<small>mm</small></dt><dd>narrower than a pack, sized for a 5th-percentile hand</dd></div>
        <div><dt class="hot">1</dt><dd>cigarette at a time, from a cassette of ten</dd></div>
        <div><dt>9</dt><dd>app screens, ending on a quit date</dd></div>
      </dl>
      <p class="rq2-me">My part: the product, the app and the identity.</p>
    </section>

    <section class="mech rq2-disp" style="--len:${100 + (cycles + 1) * 110}vh" aria-label="How it dispenses">
      <div class="mech-stage">
        <div class="rq2-cw">${caseSvg()}</div>
        <div class="rq2-side">
          <p class="rq2-count"><b>3</b><span>left today</span></p>
          <h2 class="rq2-act">Glance</h2>
          <p class="rq2-desc">${esc(ACTS[0][1])}</p>
          <ol class="rq2-acts">${ACTS.map((a, i) => `<li data-i="${i}">${esc(a[0])}</li>`).join("")}</ol>
        </div>
      </div>
      <div class="mech-stills"><ol class="rq2-stills">${[1, 2, 3, 4].map((n, i) => `<li>${IMG(`step-${n}.webp`, `${ACTS[i][0]}: ${ACTS[i][1]}`)}<b>${esc(ACTS[i][0])}</b><span>${esc(ACTS[i][1])}</span></li>`).join("")}</ol></div>
    </section>

    <section class="mech rq2-inside" style="--len:300vh" aria-label="Inside the case">
      <div class="mech-stage">
        <header class="rq2-h"><h2>Inside</h2><p>A spring pushes the stack up, an infrared beam counts each cigarette, and a micro-latch holds the slider until the next slot.</p></header>
        <div class="rq2-exw">${IMG("exploded.webp", "Exploded view of the case: cap and slider, body shell, circuit board, battery, e-ink screen, lens, cassette of ten cigarettes and spring", "", false)}
          ${BAD.map((b, i) => `<span class="rq2-pt" style="left:${b[0]}%;top:${b[1]}%">${i + 1}</span>`).join("")}</div>
        <ol class="rq2-parts">${PARTS.map((n, i) => `<li><b>${i + 1}</b>${esc(n)}</li>`).join("")}</ol>
      </div>
      <div class="mech-stills"><div class="rq2-exs">${IMG("exploded.webp", "Exploded view of the case")}<ol class="rq2-parts">${PARTS.map((n, i) => `<li class="on"><b>${i + 1}</b>${esc(n)}</li>`).join("")}</ol></div></div>
    </section>

    <section class="rq2-cols" aria-label="Colourways">
      <ul>${COLOURS.map((c, i) => `<li>${IMG(`col-${i}.webp`, `${c} case`)}<span>${esc(c)}</span></li>`).join("")}</ul>
      <div class="rq2-dim">${IMG("dims.webp", "Front 46 by 94 mm, side 20 mm, top view showing 13 mm of slider travel")}<p>46 × 94 × 20 mm, with 13 mm of slider travel. Narrower than a pack (56 mm).</p></div>
    </section>

    <section class="mech rq2-app" style="--len:${100 + SCREENS.length * 48}vh" aria-label="The app">
      <div class="mech-stage">
        <div class="rq2-al"><h2>Nine screens, one calm companion</h2>
          ${GROUPS.map((g, gi) => `<div class="rq2-g"><small>${g}</small><ol>${SCREENS.map((s, k) => s[2] === gi ? `<li data-k="${k}"><b>${esc(s[0])}</b><span>${esc(s[1])}</span></li>` : "").join("")}</ol></div>`).join("")}</div>
        <div class="rq2-phone"><div class="rq2-strip">${SCREENS.map((s, k) => `<img src="images/relinquit/s${k + 1}.webp" alt="${esc(s[0])} screen: ${esc(s[1])}" decoding="async">`).join("")}</div></div>
      </div>
      <div class="mech-stills"><ol class="rq2-scr">${SCREENS.map((s, k) => `<li>${IMG(`s${k + 1}.webp`, `${s[0]} screen`)}<b>${esc(s[0])}</b><span>${esc(s[1])}</span></li>`).join("")}</ol></div>
    </section>

    <section class="rq2-proc" aria-label="How it was made">
      <div class="rq2-row rq2-res">
        <h2 class="rq2-ph"><small>Research</small>Fewer people smoke. The ones left find it hardest to stop.</h2>
        <dl class="rq2-facts">
          <div><dt>20.2% <i>to</i> 9.8%</dt><dd>UK adults who smoke, 2011 to 2025</dd></div>
          <div><dt>4.9m</dt><dd>people in the UK still smoke</dd></div>
          <div><dt>51.7%</dt><dd>say they want to quit; 19.9% plan to try in the next three months</dd></div>
          <div><dt>22.0% <i>vs</i> 15.5%</dt><dd>not smoking six months later: stopping outright against cutting down first (697 smokers, randomised). So every plan ends on a quit date.</dd></div>
        </dl>
        <p class="rq2-src">Sources: ONS Adult smoking habits in the UK 2025; WHO tobacco fact sheet 2025; Lindson-Hawley et al., Annals of Internal Medicine 2016; NHS Better Health.</p>
      </div>
      <div class="rq2-row rq2-idea">
        <h2 class="rq2-ph"><small>Ideation</small>Eight ideas, cut to one thumb and one cigarette.</h2>
        <ol class="rq2-sks">${SKETCHES.map((n, k) => `<li${k === 1 ? ' class="pick"' : ""}>${IMG(`sk-${"abcdefgh"[k]}.webp`, `Sketch ${"ABCDEFGH"[k]}: ${n}`)}<span>${"ABCDEFGH"[k]} ${esc(n)}</span></li>`).join("")}</ol>
        <div class="rq2-score">${SCORES.map(([n, v], i) => `<div class="${i === 1 ? "w" : ""}"><span>${esc(n)}</span><i style="--v:${v / 36}"></i><b>${v}</b></div>`).join("")}
          <p>Scored against one-handed use, pocket size, reliability, cost and looks. B is the only one that works with either thumb.</p></div>
      </div>
    </section>

    <section class="rq2-out" aria-label="The outcome">
      <div class="rq2-otx"><h2>Cut down with a plan. <span>Quit for good.</span></h2>
        <ol>${["One thumb slides the gate, and a single cigarette rises and is counted.", "Every plan steps down to a quit date you choose.", "When the case rests, the app helps you ride out the craving."].map((t) => `<li>${esc(t)}</li>`).join("")}</ol></div>
      <figure>${IMG("end.webp", "The Relinquit app on a phone beside the case")}</figure>
    </section>
    ${tail}</article>`;
  }

  /* ---------- behaviour ---------- */
  function wire() {
    const root = document.querySelector(".rq2");
    if (!root || !window.MECH) return;
    const M = window.MECH, $ = (s, r = root) => r.querySelector(s), $$ = (s, r = root) => [...r.querySelectorAll(s)];

    /* the case: three cigarettes, then none */
    const disp = $(".rq2-disp"), svg = $(".rq-case", disp);
    const cig = $(".rq-cig", svg), slider = $(".rq-slider", svg), dot = $(".rq-dot", svg);
    const e1 = $(".rq-e1", svg), e2 = $(".rq-e2", svg), e3 = $(".rq-e3", svg), dots = $$(".rq-dots circle", svg);
    const cnt = $(".rq2-count b", disp), cntS = $(".rq2-count span", disp), act = $(".rq2-act", disp), desc = $(".rq2-desc", disp), acts = $$(".rq2-acts li", disp);
    const CYCLES = 3, START = 3, AMBER = "#E8A04A";
    let shown = "";
    const say = (title, text, idx, n, nLabel) => {
      const key = title + n;
      if (key === shown) return; shown = key;
      act.textContent = title; desc.textContent = text; cnt.textContent = n; cntS.textContent = nLabel;
      act.classList.remove("wipe"); void act.offsetWidth; act.classList.add("wipe");
      acts.forEach((li, i) => li.classList.toggle("on", i === idx));
    };
    const screen = (l1, big, l3, filled, amber) => {
      if (e1.textContent !== l1) e1.textContent = l1;
      if (e2.textContent !== big) { e2.textContent = big; e2.setAttribute("font-size", big.length > 2 ? "86" : "118"); }
      if (e3.textContent !== l3) e3.textContent = l3;
      dots.forEach((d, i) => d.setAttribute("fill", i < filled ? "#1E2224" : "none"));
      dot.setAttribute("fill", amber ? AMBER : "var(--project, #4FA3B1)");
    };
    const mmss = (s) => `${pad2(Math.floor(s / 60))}:${pad2(Math.floor(s % 60))}`;

    M.stage(disp, { draw(p) {
      const u = p * (CYCLES + 1), c = Math.min(CYCLES, Math.floor(u)), t = u - c;
      if (c >= CYCLES) {
        // the last stretch: the plan reaches its quit date
        slider.style.transform = "translate(160px, 0)"; cig.style.transform = "translate(0, 0)"; cig.style.opacity = 1;
        screen("QUIT MODE", "6", "smoke-free days", 0, false);
        say("Then none.", "Every plan steps down to a quit date you choose. The screen counts the days since.", -1, 0, "left. Quit mode");
        return;
      }
      const left = START - c;
      // within one cigarette: glance .0-.2, slide .2-.4, take .4-.7, rest .7-1
      const slide = M.seg(t, 0.2, 0.38) - M.seg(t, 0.72, 0.84);
      // closed, the slider covers the slot; sliding it back uncovers it
      slider.style.transform = `translate(${((1 - slide) * 160).toFixed(1)}px, 0)`;
      const rise = M.seg(t, 0.4, 0.55), away = M.seg(t, 0.58, 0.7);
      // hidden at 0 (below the slot); risen, about a third of it stands clear of the top
      cig.style.transform = `translate(0, ${(-(rise * 250 + away * 170)).toFixed(1)}px)`;
      cig.style.opacity = (1 - away).toFixed(3);
      if (t < 0.58) {
        screen("TODAY", String(left), "of 7 left", left, false);
        say(t < 0.2 ? ACTS[0][0] : t < 0.4 ? ACTS[1][0] : ACTS[2][0], t < 0.2 ? ACTS[0][1] : t < 0.4 ? ACTS[1][1] : ACTS[2][1], t < 0.2 ? 0 : t < 0.4 ? 1 : 2, left, "left today");
      } else if (t < 0.72) {
        screen("TODAY", String(left - 1), "of 7 left", left - 1, false);
        say(ACTS[2][0], ACTS[2][1], 2, left - 1, "left today");
      } else {
        // resting: the next slot counts down
        screen("RESTING", mmss((1 - M.seg(t, 0.72, 1)) * (18 * 60 + 42)), "until next", left - 1, true);
        say(ACTS[3][0], ACTS[3][1], 3, left - 1, "left today");
      }
    } });

    /* inside: the parts are numbered one after another */
    const ins = $(".rq2-inside"), pts = $$(".rq2-pt", ins), lis = $$(".rq2-parts li", ins), exImg = $(".rq2-exw img", ins);
    M.stage(ins, { draw(p) {
      const n = Math.floor(M.seg(p, 0.08, 0.86) * (PARTS.length + 0.999));
      pts.forEach((el, i) => el.classList.toggle("on", i < n));
      lis.forEach((el, i) => { el.classList.toggle("on", i < n); el.classList.toggle("now", i === n - 1); });
      exImg.style.transform = `scale(${(0.94 + 0.06 * M.seg(p, 0, 0.5)).toFixed(4)})`;
    } });

    /* the app: the screens scroll through the phone, the list follows */
    const app = $(".rq2-app"), strip = $(".rq2-strip", app), items = $$(".rq2-al li", app);
    let cur = -1;
    M.stage(app, { draw(p) {
      const f = M.seg(p, 0.04, 0.96) * (SCREENS.length - 1);
      strip.style.transform = `translate3d(0, ${(-f * 100 / SCREENS.length).toFixed(3)}%, 0)`;
      const k = Math.round(f);
      if (k !== cur) { cur = k; items.forEach((li) => li.classList.toggle("on", +li.dataset.k === k)); }
    } });
  }

  window.RELINQUIT = { render, wire };
})();
