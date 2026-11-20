/* Aeropress Coffee Machine: scrolling runs the brew cycle.
   Built on the shared engine (js/mech.js). Hero, the key result, the brew cycle stage, the process
   (research, ideation, model, final), the outcome, then the next project.
   Every figure here comes from the project itself: the sensor bands, the timings and the code. */
(() => {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const IMG = (f, alt, lazy = true) => `<img src="images/aeropress/${f}" alt="${esc(alt)}"${lazy ? ' loading="lazy"' : ""} decoding="async">`;
  const FRAME = (i) => `images/aeropress/step-${i}.webp`;

  /* ---------- the brew cycle: ten storyboard frames ----------
     w      how much scroll the step gets
     at     where the leader line points on the 600 x 724 frame, and what it names
     lcd    what the machine's own display reads (16 x 2), as programmed
     time   the step's real duration for a Strong brew */
  const STEPS = [
    { t: "Coffee in", d: "Ground coffee goes into the funnel. It is the only thing you do by hand.", w: 1, at: [[238, 186, "Funnel"]] },
    { t: "Wave", d: "Hold a hand over the tower. How high you hold it chooses the brew.", w: 2.4, at: [[487, 258, "Infrared sensor"]], wave: true },
    { t: "Turn", d: "A motor turns the head until the stirrer sits over the chamber.", w: 1, at: [[256, 120, "Rotating head"]] },
    { t: "Lower", d: "One linear actuator lowers the stirrer into the chamber.", w: 1, at: [[256, 255, "Stirrer"]] },
    { t: "Fill and stir", d: "The pump runs for eight seconds, up through the hollow stirrer. Then the stirrer spins to wet every ground.", w: 1.7,
      at: [[68, 560, "Water tank"], [256, 300, "Chamber"]], lcd: ["   LOADING|STRONG BREW", "....|     MIXING"], time: [["Fill", "8 s"], ["Stir", "27 s"]] },
    { t: "Steep", d: "The head lifts and the coffee is left alone to steep.", w: 1.2, at: [[256, 330, "Coffee steeping"]], lcd: ["......|     BREWING"], time: [["Steep", "39 s"]] },
    { t: "Plunger", d: "The head turns again and brings the plunger over the chamber.", w: 1, at: [[256, 205, "Plunger"]] },
    { t: "Press", d: "The actuator pushes down slowly. Any faster and the filter blows out.", w: 1.3, at: [[254, 585, "Mug"]], lcd: ["........|    PRESSING"] },
    { t: "Take your mug", d: "Take the mug, then wave once more and the used puck is ejected.", w: 1.2, at: [[212, 392, "Puck"]], lcd: ["...........| TAKE COFFEE"] },
    { t: "Home", d: "The head goes back to its home position, ready for the next cup.", w: 0.8, at: [[300, 70, "Home position"]] }
  ];
  /* hand height bands on the infrared tower, from the control code */
  const BANDS = [
    { n: "Strong", y: 304, adc: "90–100", how: "Hand high, furthest from the sensor", stir: "27 s", steep: "39 s", min: "3.4" },
    { n: "Mild", y: 406, adc: "101–119", how: "Hand level with the middle mark", stir: "22 s", steep: "30 s", min: "3.2" },
    { n: "Cold", y: 508, adc: "120–200", how: "Hand low, closest to the sensor", stir: "43 s", steep: "51 s", min: "3.9" }
  ];
  const MANUAL = ["Fill the kettle", "Scoop the coffee", "Pour the water", "Stir", "Time the steep", "Press the plunger", "Eject the puck"];
  const OURS = ["Add coffee", "Wave to choose", "Take your mug"];
  const OPTIONS = ["Buttons", "A touchscreen", "Voice", "A phone app", "A hand gesture"];
  const CODE = [
    "{k:while} ({n:1}) {",
    "  ADC_Convert();                 {c:// read the IR sensor}",
    "",
    "  {k:if} (ADRESH >= {n:120} && ADRESH <= {n:200})",
    "    COLD_BREW();",
    "  {k:if} (ADRESH <= {n:119} && ADRESH >= {n:101})",
    "    MILD_BREW();",
    "  {k:if} (ADRESH <= {n:100} && ADRESH >= {n:90})",
    "    STRONG_BREW();",
    "",
    "  PLUNGE_AND_DISPENSE();",
    "}"
  ];
  const STATS = [[790, "lines of C"], [13, "functions"], [6, "custom display characters"], [4, "motor driver channels"]];

  const lcd = (s) => { const [a, b] = (s || "|").split("|"); return `<i>${esc(a.padEnd(16).slice(0, 16))}</i><i>${esc(b.padEnd(16).slice(0, 16))}</i>`; };
  const code = (ls) => ls.map((l) => `<span>${l.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]))
    .replace(/\{([knc]):([^}]*)\}/g, (m, k, v) => `<i class="${k}">${v}</i>`) || " "}</span>`).join("\n");
  const pad2 = (n) => String(n).padStart(2, "0");

  /* the leader lines and labels drawn over the frame, one group per step */
  function notes() {
    const g = STEPS.map((s, i) => `<g class="ax-n" data-i="${i}">${s.at.map(([x, y, label], k) =>
      `<circle cx="${x}" cy="${y}" r="5"/><path class="mech-line" pathLength="1" d="M${x} ${y} L${x + 18} ${y} L640 ${y}"/>
       <text x="652" y="${y + 6}">${esc(label)}</text>`).join("")}</g>`).join("");
    const bands = BANDS.map((b, i) => `<g class="ax-band" data-i="${i}"><path class="mech-line" pathLength="1" d="M380 ${b.y} L640 ${b.y}"/>
      <text x="652" y="${b.y + 6}">${esc(b.n)}</text></g>`).join("");
    return `<svg class="ax-notes" viewBox="0 0 600 724" aria-hidden="true">${g}${bands}</svg>`;
  }

  function render(p, tail) {
    const total = STEPS.reduce((a, s) => a + s.w, 0);
    return `<article class="page apx">

    <section class="ax-hero">
      <img class="ax-hero-img" src="images/aeropress/final.webp" alt="The hands-free AeroPress machine, with a hand held over its infrared tower" decoding="async">
      <div class="ax-hero-tx">
        <h1>Aeropress<br>Coffee Machine</h1>
        <p class="ax-hero-sub"><em>${esc(p.year)}</em><span>${esc(p.summary)}</span></p>
      </div>
    </section>

    <section class="ax-key" aria-label="The result">
      <p class="ax-key-big">Wave once and it brews a real AeroPress for you, start to finish.</p>
      <dl class="ax-key-n">
        <div><dt class="hot">0</dt><dd>buttons to press</dd></div>
        <div><dt>3</dt><dd>brews, chosen by the height of your hand</dd></div>
        <div><dt>3.2–3.9</dt><dd>minutes a cup</dd></div>
      </dl>
      <p class="ax-key-me">My part: all of the control code, 790 lines of C on a PIC18F45K20 microcontroller. A university team project with Tom Hufton, Dan Ward-Thomas and Ishaan Desai.</p>
    </section>

    <section class="mech ax-cycle" style="--len:${Math.round(100 + total * 55)}vh" aria-label="The brew cycle">
      <div class="mech-stage">
        <div class="ax-panel">
          <div class="ax-frame"><canvas class="ax-seq" role="img" aria-label="The machine at each step of a brew"></canvas>${notes()}</div>
        </div>
        <div class="ax-side">
          <h2 class="ax-side-h">One Strong brew, start to finish</h2>
          <p class="ax-count"><b>01</b> / ${pad2(STEPS.length)}</p>
          <h3 class="ax-step" aria-live="polite">${esc(STEPS[0].t)}</h3>
          <p class="ax-desc">${esc(STEPS[0].d)}</p>
          <ul class="ax-bands" hidden>${BANDS.map((b) => `<li><b>${esc(b.n)}</b><span>${esc(b.how)}</span><span class="m">ADC ${esc(b.adc)}</span></li>`).join("")}</ul>
          <dl class="ax-time"></dl>
          <figure class="ax-lcd"><div class="ax-lcd-s">${lcd("")}</div><figcaption>The machine's own display</figcaption></figure>
        </div>
        <ol class="ax-rail" aria-hidden="true"><i class="ax-rail-f"></i>${STEPS.map((s, i) => `<li style="--x:${(STEPS.slice(0, i).reduce((a, q) => a + q.w, 0) / total * 100).toFixed(3)}%">${esc(s.t)}</li>`).join("")}</ol>
      </div>
      <div class="mech-stills">
        <h2 class="ax-side-h">One Strong brew, start to finish</h2>
        <ol class="ax-stills">${STEPS.map((s, i) => `<li><img src="${FRAME(i + 1)}" alt="Step ${i + 1}: ${esc(s.t)}" loading="lazy"><b>${pad2(i + 1)} ${esc(s.t)}</b><span>${esc(s.d)}</span></li>`).join("")}</ol>
      </div>
    </section>

    <section class="ax-proc" aria-label="How it was made">
      <div class="ax-row ax-research">
        <h2 class="ax-ph"><small>Research</small>Seven things to touch, for one cup of coffee.</h2>
        <div class="ax-before"><ol class="ax-manual">${MANUAL.map((t) => `<li>${esc(t)}</li>`).join("")}</ol>
          <ol class="ax-ours">${OURS.map((t) => `<li>${esc(t)}</li>`).join("")}</ol></div>
        <p class="ax-body">An AeroPress makes great coffee and asks for a lot of attention. We set out to keep the brew and take away everything in between: the stirring, the timing, the press and the puck.</p>
      </div>
      <div class="ax-row ax-idea">
        <figure class="ax-img">${IMG("gesture.webp", "Choosing a brew by holding a hand at a height over the infrared tower")}</figure>
        <div class="ax-tx">
          <h2 class="ax-ph"><small>Ideation</small>How do you ask a machine for coffee without touching it?</h2>
          <ul class="ax-opts">${OPTIONS.map((t, i) => `<li${i === OPTIONS.length - 1 ? ' class="hot"' : ""}>${esc(t)}</li>`).join("")}</ul>
          <p class="ax-body">We looked at buttons, a touchscreen, voice and a phone app first. Only a hand gesture is touch-free, works in a noisy kitchen, needs no phone, and costs one analogue sensor.</p>
        </div>
      </div>
      <div class="ax-row ax-model">
        <div class="ax-tx">
          <h2 class="ax-ph"><small>Model</small>Three tools, one actuator.</h2>
          <p class="ax-body">Stirring and pressing are both straight pushes down. So instead of a mechanism for each, the funnel, stirrer and plunger ride on one head that a motor turns over the chamber, and a single linear actuator does every vertical job. It is slow, strong, and holds its place with no power at all.</p>
        </div>
        <figure class="ax-img wide">${IMG("head.webp", "The rotating head carrying the funnel, the stirrer bearing and the plunger")}</figure>
        <figure class="ax-img">${IMG("chamber.webp", "The AeroPress chamber in its locating ring")}</figure>
      </div>
      <div class="ax-row ax-code">
        <div class="ax-tx">
          <h2 class="ax-ph"><small>Model</small>I wrote every line that moves it.</h2>
          <p class="ax-body">The whole control system is mine, in C, on a PIC18F45K20 running at 1 MHz. One loop watches the sensor and hands off to a brew. Every move is a counted delay, tuned on the real machine, and the positions that have to be exact are confirmed by a micro-switch instead.</p>
          <dl class="ax-stats">${STATS.map(([n, l]) => `<div><dt data-to="${n}">${n}</dt><dd>${esc(l)}</dd></div>`).join("")}</dl>
        </div>
        <pre class="ax-src"><code>${code(CODE)}</code></pre>
      </div>
      <div class="ax-row ax-final">
        <figure class="ax-img wide">${IMG("ga.webp", "General arrangement drawing of the machine in its home position")}<figcaption>General arrangement, home position</figcaption></figure>
        <div class="ax-tx">
          <h2 class="ax-ph"><small>Final</small>Laser-cut, printed, and brewing.</h2>
          <p class="ax-body">A threaded-rod frame with a real AeroPress at its heart, laser-cut and 3D-printed parts around it, and the electronics in the base under the display.</p>
        </div>
      </div>
    </section>

    <section class="ax-out" aria-label="The outcome">
      <figure class="ax-out-img">${IMG("front.webp", "The finished machine with a hand held over the infrared tower")}</figure>
      <div class="ax-out-tx">
        <h2>Wave.<br>Wait.<br><span class="hot">Drink.</span></h2>
        <p class="ax-body">It runs all three programmes start to finish. Next time: a state machine on timer interrupts, and a heater and flow sensor, so the water is controlled as well as the time.</p>
      </div>
    </section>
    ${tail}</article>`;
  }

  /* ---------- behaviour ---------- */
  function wire() {
    const root = document.querySelector(".apx");
    if (!root || !window.MECH) return;
    const M = window.MECH, $ = (s, r = root) => r.querySelector(s), $$ = (s, r = root) => [...r.querySelectorAll(s)];

    /* the brew cycle */
    const cyc = $(".ax-cycle");
    const seq = M.sequence($(".ax-seq", cyc), STEPS.map((_, i) => FRAME(i + 1)));
    const total = STEPS.reduce((a, s) => a + s.w, 0);
    const starts = []; STEPS.reduce((a, s, i) => (starts[i] = a / total, a + s.w), 0);
    const notesG = $$(".ax-n", cyc), bandG = $$(".ax-band", cyc), bandLi = $$(".ax-bands li", cyc);
    const panel = $(".ax-panel", cyc), fill = $(".ax-rail-f", cyc), railLi = $$(".ax-rail li", cyc);
    const el = { n: $(".ax-count b", cyc), t: $(".ax-step", cyc), d: $(".ax-desc", cyc), time: $(".ax-time", cyc), lcd: $(".ax-lcd-s", cyc), bands: $(".ax-bands", cyc) };
    let cur = -1, curLcd = null;

    M.stage(cyc, {
      near: () => seq.load(),
      draw(p) {
        // the panel arrives from the left as the stage takes the screen
        panel.style.clipPath = `inset(0 ${(100 - M.seg(p, 0, 0.035) * 100).toFixed(2)}% 0 0)`;
        let k = 0; while (k < STEPS.length - 1 && p >= starts[k + 1]) k++;
        const s = STEPS[k], local = M.seg(p, starts[k], k < STEPS.length - 1 ? starts[k + 1] : 1);
        if (k !== cur) {
          cur = k; seq.show(k);
          el.n.textContent = pad2(k + 1);
          el.t.textContent = s.t; el.d.textContent = s.d;
          el.t.classList.remove("wipe"); void el.t.offsetWidth; el.t.classList.add("wipe");
          el.time.innerHTML = (s.time || []).map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join("");
          el.bands.hidden = !s.wave;
          notesG.forEach((g, i) => g.classList.toggle("on", i === k));
          railLi.forEach((li, i) => { li.classList.toggle("on", i === k); li.classList.toggle("was", i < k); });
          if (k !== 1) bandG.forEach((g) => g.classList.remove("on"));
        }
        // leader lines draw in over the first part of each step
        $$(".mech-line", notesG[k]).forEach((ln, i) => M.line(ln, M.seg(local, 0.04 + i * 0.25, 0.42 + i * 0.25)));
        // the wave: the hand passes through the three heights in turn
        if (s.wave) {
          const b = Math.min(2, Math.floor(M.seg(local, 0.18, 0.96) * 3));
          bandG.forEach((g, i) => { g.classList.toggle("on", i === b); M.line($(".mech-line", g), i < b ? 1 : i === b ? M.seg(local, 0.18 + b * 0.26, 0.3 + b * 0.26) : 0); });
          bandLi.forEach((li, i) => li.classList.toggle("on", i === b));
        }
        // the display: a step with two readings shows the second for its second half
        const lcds = s.lcd || null, shown = lcds ? lcds[Math.min(lcds.length - 1, Math.floor(local * lcds.length))] : "";
        if (shown !== curLcd) { curLcd = shown; el.lcd.innerHTML = lcd(shown); el.lcd.classList.toggle("on", !!shown); }
        fill.style.transform = `scaleX(${p.toFixed(4)})`;
      }
    });

    /* the code figures count up to their real values as the section comes into view */
    const stats = $$(".ax-stats dt");
    M.stage($(".ax-code"), { draw(p) { stats.forEach((d, i) => M.count(d, +d.dataset.to, M.seg(p, 0.1 + i * 0.1, 0.6 + i * 0.1))); } }, { pin: false });
  }

  window.AEROPRESS = { render, wire };
})();
