/* Hands-free AeroPress — a scroll-told story. Eight full-screen acts, no drawing-sheet chrome. */
(() => {
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const IMG = (f, alt, cls = "", lazy = true) => `<img src="images/aeropress/${f}" alt="${esc(alt)}"${cls ? ` class="${cls}"` : ""}${lazy ? ' loading="lazy"' : ""} decoding="async">`;

  /* ---------- content ---------- */
  const MANUAL = ["Fill the kettle", "Scoop the coffee", "Pour the water", "Stir", "Time the steep", "Press the plunger", "Eject the puck"];
  const OURS = ["Add coffee", "Wave to choose", "Take your mug"];
  const BREWS = [
    ["Strong", "90–100", "3.4", "Hand high, furthest from the sensor", "27 s stir · 39 s steep"],
    ["Mild", "101–119", "3.2", "Hand level with the middle mark", "22 s stir · 30 s steep"],
    ["Cold", "120–200", "3.9", "Hand low, closest to the sensor", "43 s stir · 51 s steep"]
  ];
  const TOOLS = [
    ["Funnel", "Ground coffee goes in here", "u"],
    ["Stirrer", "Hollow shaft: water arrives through its centre, then it spins", "m"],
    ["Plunger", "Pressed down slowly, then all the way to eject the puck", "m"]
  ];
  const STAGES = [
    ["Fill", "The pump runs for eight seconds in every mode, up through the hollow stirrer.", "step-3.webp", "   LOADING|STRONG BREW"],
    ["Stir", "The stirrer spins to wet every ground. This is where strength is set.", "step-5.webp", "....|     MIXING"],
    ["Steep", "The head lifts, turns to the plunger, and the coffee is left alone.", "step-6.webp", "......|     BREWING"],
    ["Press", "The actuator pushes down slowly. Too fast and the filter blows out.", "step-7.webp", "........|    PRESSING"],
    ["Serve", "Take the mug, then wave once more and the puck is ejected.", "step-8.webp", "...........| TAKE COFFEE"]
  ];
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
  const STATS = [[790, "lines of C"], [13, "functions"], [6, "custom LCD characters"], [4, "driver channels"]];
  const BUILD = [
    ["gesture.webp", "Choosing a brew by hand height", "w"],
    ["head.webp", "The rotating head: funnel, stirrer bearing and plunger", ""],
    ["chamber.webp", "The AeroPress chamber in its locating ring", ""]
  ];
  const SECS = ["Hands-free AeroPress", "Why", "The gesture", "The head", "The brew", "The code", "The build", "Wave. Wait. Drink."];

  /* ---------- small builders ---------- */
  const lab = (t) => `<p class="ax-lab">${esc(t)}</p>`;
  const lcd = (s, on) => { const [a, b] = s.split("|"); return `<span class="ax-lcd${on ? " on" : ""}"><i>${esc(a.padEnd(16).slice(0, 16))}</i><i>${esc(b.padEnd(16).slice(0, 16))}</i></span>`; };
  const code = (ls) => ls.map((l) => `<span class="ln">${l.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])).replace(/\{([knc]):([^}]*)\}/g, (m, k, v) => `<i class="${k}">${v}</i>`) || " "}</span>`).join("");

  /* the IR tower, drawn flat */
  function tower() {
    const band = (y, k, n) => `<g class="bd b${k}"><rect x="150" y="${y}" width="96" height="112" rx="4"/><line class="tk" x1="246" y1="${y + 56}" x2="292" y2="${y + 56}"/><text x="302" y="${y + 62}">${n}</text></g>`;
    return `<svg viewBox="0 0 470 640" class="ax-tw" role="img" aria-label="The infrared tower: three hand heights set the brew">
      <rect class="post" x="168" y="70" width="60" height="492" rx="8"/><rect class="base" x="118" y="552" width="160" height="34" rx="8"/>
      ${band(96, 0, "STRONG")}${band(228, 1, "MILD")}${band(360, 2, "COLD")}
      <g class="hand"><rect x="18" y="-11" width="168" height="22" rx="11"/><path d="M186 -11h46l26 11-26 11h-46z"/></g>
      <text class="sc" x="302" y="60">HAND HEIGHT</text>
    </svg>`;
  }

  /* the head in side elevation: the carriage slides, one actuator pushes down */
  function head() {
    const funnel = `<g class="tl t0"><path d="M-30 0h60l-20 30v34h-20V30z"/></g>`;
    const stir = `<g class="tl t1"><rect x="-5" y="0" width="10" height="46"/><path class="hx" d="M0 46c-13 6 13 14 0 20s13 14 0 20"/></g>`;
    const plung = `<g class="tl t2"><rect x="-6" y="0" width="12" height="40"/><rect x="-27" y="40" width="54" height="13" rx="3"/></g>`;
    return `<svg viewBox="0 0 520 420" class="ax-hd" role="img" aria-label="Side view: three tools on one carriage, lowered by a single actuator">
      <g class="rig">
        <line class="rail" x1="0" y1="90" x2="520" y2="90"/>
        <g class="act"><rect x="246" y="26" width="28" height="92" rx="5"/><path class="ar" d="M260 128v34M250 152l10 14 10-14"/></g>
        <g class="carr"><rect class="bar" x="56" y="96" width="408" height="18" rx="4"/>
          <g transform="translate(140,114)">${funnel}</g><g transform="translate(260,114)">${stir}</g><g transform="translate(380,114)">${plung}</g></g>
        <g class="cham"><rect x="214" y="246" width="92" height="118" rx="6"/><ellipse cx="260" cy="246" rx="46" ry="11"/></g>
        <rect class="deck" x="92" y="364" width="336" height="16" rx="4"/>
      </g>
    </svg>`;
  }

  /* ---------- the page ---------- */
  function render(p, tail) {
    const word = (w, c) => `<span class="w${c ? " or" : ""}">${w.split("").map((ch, i) => `<i style="--i:${i}">${ch}</i>`).join("")}</span>`;
    return `<article class="page apx">

    <section class="ax-hero" data-sec="0">
      <div class="ax-glow"></div>
      <div class="ax-hwrap">
        <div class="ax-htx">
          ${lab("Product design · 2021 · University team project")}
          <h1>Hands-free<br><em>AeroPress</em></h1>
          <p class="ax-lede">A coffee machine with nothing to press. Hold a hand over the sensor and it pours, stirs, steeps and presses a real AeroPress for you.</p>
          <dl class="ax-kv"><div><dt>0</dt><dd>buttons</dd></div><div><dt>3</dt><dd>brews</dd></div><div><dt>~3.5</dt><dd>min a cup</dd></div></dl>
        </div>
        <figure class="ax-hfig">${IMG("machine.webp", "The hands-free AeroPress machine, with a hand held over the infrared tower", "", false)}</figure>
      </div>
      <span class="ax-cue" aria-hidden="true">Scroll</span>
    </section>

    <section class="ax-pin ax-why" data-pin="why" data-sec="1" style="height:250vh"><div class="ax-stage"><div class="ax-wrap">
      ${lab("2021")}
      <h2 class="ax-h">Seven things to touch,<br>for one cup of coffee.</h2>
      <div class="ax-chips">${MANUAL.map((t, i) => `<span class="cp" style="--i:${i}">${esc(t)}</span>`).join("")}</div>
      <div class="ax-swap">
        <div class="ax-ours">${OURS.map((t, i) => `<span class="cp${i === 1 ? " hot" : ""}" style="--i:${i}">${esc(t)}</span>`).join("")}</div>
        <p class="ax-note">Everything in between — the stirring, the timing, the press, the puck — the machine does on its own. We looked at buttons, a touchscreen, voice and a phone app first. Only a hand gesture is touch-free, works in a noisy kitchen, needs no phone, and costs one analogue sensor.</p>
      </div>
    </div></div></section>

    <section class="ax-pin ax-ges" data-pin="ges" data-sec="2" style="height:360vh"><div class="ax-stage"><div class="ax-wrap">
      <div class="ax-gl">
        ${lab("The gesture")}
        <div class="ax-brew">${BREWS.map(([n, adc, min, how, t], i) => `<div class="bw" data-i="${i}"><h3>${esc(n)}</h3><p class="how">${esc(how)}</p><p class="num"><b>ADC ${esc(adc)}</b><span>${esc(t)}</span><span>${esc(min)} min a cup</span></p></div>`).join("")}</div>
        <p class="ax-note">The sensor's voltage rises as a hand gets closer, so I split its reading into three bands and ignored anything under 90 — an empty sensor, or someone walking past.</p>
      </div>
      <div class="ax-gr">${tower()}</div>
    </div></div></section>

    <section class="ax-pin ax-head" data-pin="head" data-sec="3" style="height:320vh"><div class="ax-stage"><div class="ax-wrap">
      <div class="ax-hl">
        ${lab("One motion")}
        <h2 class="ax-h">Three tools,<br>one actuator.</h2>
        <p class="ax-note">Stirring and pressing are both straight pushes down. So instead of a mechanism for each, the funnel, stirrer and plunger ride on one head that a motor turns over the chamber — and a single linear actuator does every vertical job. It is slow, strong, and holds its place with no power at all.</p>
        <ol class="ax-tools">${TOOLS.map(([n, d], i) => `<li data-i="${i}"><b>${esc(n)}</b><span>${esc(d)}</span></li>`).join("")}</ol>
      </div>
      <div class="ax-hr">${head()}<figure class="ax-hph">${IMG("head.webp", "The rotating head carrying the funnel, the stirrer bearing and the plunger")}</figure></div>
    </div></div></section>

    <section class="ax-pin ax-brew" data-pin="brew" data-sec="4" style="height:420vh"><div class="ax-stage"><div class="ax-wrap">
      <div class="ax-bl">
        ${lab("One Strong brew, start to finish")}
        <h2 class="ax-stage-n"><em>Stage 01 of 05</em><span>Fill</span></h2>
        <p class="ax-stage-d">${esc(STAGES[0][1])}</p>
        <div class="ax-screen">${STAGES.map(([, , , s], i) => lcd(s, !i)).join("")}</div>
      </div>
      <div class="ax-br">${STAGES.map(([n, , f], i) => `<figure class="fr${i ? "" : " on"}">${IMG(f, `The machine during the ${n.toLowerCase()} stage`)}</figure>`).join("")}</div>
      <div class="ax-track"><i class="fill"></i>${STAGES.map(([n], i) => `<span style="--i:${i}">${esc(n)}</span>`).join("")}</div>
    </div></div></section>

    <section class="ax-pin ax-code" data-pin="code" data-sec="5" style="height:300vh"><div class="ax-stage"><div class="ax-wrap">
      <div class="ax-cl">
        ${lab("My part")}
        <h2 class="ax-h">I wrote every line<br>that moves it.</h2>
        <p class="ax-note">The whole control system is mine: in C, on a PIC18F45K20 running at 1 MHz. One loop watches the sensor and hands off to a brew. Every move is a counted delay, tuned on the real machine — and the positions that have to be exact are confirmed by a micro-switch instead.</p>
        <dl class="ax-stats">${STATS.map(([n, l]) => `<div><dt data-to="${n}">0</dt><dd>${esc(l)}</dd></div>`).join("")}</dl>
      </div>
      <pre class="ax-code-b"><code>${code(CODE)}</code></pre>
    </div></div></section>

    <section class="ax-build" data-sec="6"><div class="ax-wrap">
      <header class="ax-bh">${lab("The build")}<h2 class="ax-h">Laser-cut, printed,<br>and brewing.</h2>
        <p class="ax-note">A threaded-rod frame with a real AeroPress at its heart. It runs all three programmes start to finish. Next time: a state machine on timer interrupts, and a heater and flow sensor so the water is controlled as well as the time.</p></header>
      <div class="ax-grid">${BUILD.map(([f, c, k], i) => `<figure class="rv ${k}" style="--i:${i}">${IMG(f, c)}<figcaption>${esc(c)}</figcaption></figure>`).join("")}
        <figure class="rv ga" style="--i:3">${IMG("ga.webp", "General arrangement drawing of the machine in its home position")}<figcaption>General arrangement, home position</figcaption></figure></div>
    </div></section>

    <section class="ax-end" data-sec="7">
      <figure class="ax-ef">${IMG("front.webp", "The finished machine with a hand held over the infrared tower")}</figure>
      <div class="ax-etx">
        <h2>${word("Wave.")}${word("Wait.")}${word("Drink.", 1)}</h2>
        <p>Group L · Alex Denli, Tom Hufton, Dan Ward-Thomas, Ishaan Desai · built November 2021</p>
      </div>
    </section>
    ${tail}</article>`;
  }

  /* ---------- behaviour ---------- */
  let off = [];
  function wire() {
    off.forEach((f) => f()); off = [];
    const root = document.querySelector(".apx");
    if (!root) return;
    const $ = (s, r = root) => r.querySelector(s), $$ = (s, r = root) => Array.from(r.querySelectorAll(s));
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) root.classList.add("calm");
    requestAnimationFrame(() => root.querySelector(".ax-hero").classList.add("in"));

    const rail = document.createElement("div");
    rail.className = "ax-rail";
    rail.innerHTML = SECS.map((s, i) => `<a href="#" data-i="${i}" aria-label="${esc(s)}"><i></i><b>${esc(s)}</b></a>`).join("");
    root.appendChild(rail);
    const secs = $$("[data-sec]"), dots = Array.from(rail.children);
    rail.addEventListener("click", (e) => {
      const a = e.target.closest("a"); if (!a) return; e.preventDefault();
      scrollTo({ top: secs[+a.dataset.i].getBoundingClientRect().top + scrollY, behavior: reduce ? "auto" : "smooth" });
    });

    if ("IntersectionObserver" in window && !reduce) {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.18 });
      $$(".rv").forEach((n) => io.observe(n)); off.push(() => io.disconnect());
    } else $$(".rv").forEach((n) => n.classList.add("in"));

    const P = {
      why(el, p) {
        const n = Math.floor(cl((p - .08) / .5) * (MANUAL.length + 1));
        $$(".ax-chips .cp", el).forEach((c, i) => c.classList.toggle("off", i < n));
        el.classList.toggle("done", p > .56);
      },
      ges(el, p) {
        const k = Math.min(2, Math.floor(cl((p - .06) / .82) * 3));
        if (el.dataset.k != k) {
          el.dataset.k = k;
          $$(".ax-brew .bw", el).forEach((b, i) => b.classList.toggle("on", i === k));
          $$(".ax-tw .bd", el).forEach((b, i) => b.classList.toggle("on", i === k));
        }
        $(".ax-tw .hand", el).style.transform = `translateY(${(172 + k * 120).toFixed(1)}px)`;
      },
      head(el, p) {
        const k = Math.min(2, Math.floor(cl((p - .08) / .8) * 3));
        const t = cl((p - .08) / .8) * 3;
        $(".ax-hd .carr", el).style.transform = `translateX(${(120 - k * 120).toFixed(1)}px) translateY(${(Math.max(0, Math.sin((t % 1) * Math.PI)) * 46).toFixed(1)}px)`;
        if (el.dataset.k == k) return; el.dataset.k = k;
        $$(".ax-tools li", el).forEach((li, i) => li.classList.toggle("on", i === k));
        $$(".ax-hd .tl", el).forEach((t, i) => t.classList.toggle("on", i === k));
      },
      brew(el, p) {
        const t = cl((p - .05) / .88), k = Math.min(4, Math.floor(t * 5));
        el.style.setProperty("--t", t.toFixed(4));
        if (el.dataset.k == k) return; el.dataset.k = k;
        $$(".ax-br .fr", el).forEach((f, i) => f.classList.toggle("on", i === k));
        $$(".ax-screen .ax-lcd", el).forEach((d, i) => d.classList.toggle("on", i === k));
        $$(".ax-track span", el).forEach((s, i) => { s.classList.toggle("on", i === k); s.classList.toggle("was", i < k); });
        const h = $(".ax-stage-n", el);
        h.querySelector("em").textContent = "Stage 0" + (k + 1) + " of 05";
        h.querySelector("span").textContent = STAGES[k][0];
        $(".ax-stage-d", el).textContent = STAGES[k][1];
      },
      code(el, p) {
        const lines = $$(".ax-code-b .ln", el), n = Math.ceil(cl((p - .1) / .55) * lines.length);
        lines.forEach((l, i) => l.classList.toggle("on", i < n));
        $$(".ax-stats dt", el).forEach((b, i) => {
          const t = cl((p - .3 - i * .07) / .34), v = +b.dataset.to * (1 - Math.pow(1 - t, 3));
          b.textContent = Math.round(v);
        });
      }
    };

    const pins = $$("[data-pin]");
    let raf = 0;
    const tick = () => {
      raf = 0;
      if (!root.isConnected) { off.forEach((f) => f()); off = []; return; }
      const h = innerHeight;
      pins.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -h || r.top > h * 2) return;
        const p = reduce ? 1 : cl(-r.top / Math.max(1, r.height - h));
        el.style.setProperty("--p", p.toFixed(4));
        const f = P[el.dataset.pin]; if (f) f(el, p);
      });
      let a = 0;
      secs.forEach((s, i) => { if (s.getBoundingClientRect().top <= h * .45) a = i; });
      dots.forEach((d, i) => d.classList.toggle("on", i === a));
    };
    const q = () => { if (!raf) raf = requestAnimationFrame(tick); };
    addEventListener("scroll", q, { passive: true }); addEventListener("resize", q);
    off.push(() => { removeEventListener("scroll", q); removeEventListener("resize", q); cancelAnimationFrame(raf); rail.remove(); });
    tick(); setTimeout(tick, 160);
  }

  window.AEROPRESS = { render, wire };
})();
