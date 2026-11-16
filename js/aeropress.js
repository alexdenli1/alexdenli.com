/* Hands-free AeroPress: a custom project page laid out as a set of engineering drawing sheets. */
(() => {
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const IMG = (f, alt, cls = "", lazy = true) => `<img src="images/aeropress/${f}" alt="${esc(alt)}"${cls ? ` class="${cls}"` : ""}${lazy ? ' loading="lazy"' : ""} decoding="async">`;
  const MONO = "'IBM Plex Mono', ui-monospace, monospace", COND = "'IBM Plex Sans Condensed', 'Inter', sans-serif";

  /* ---------- content ---------- */
  const CALLS = [["Water line", 322, 118, "l", 70], ["Funnel", 238, 278, "l", 190], ["Rotating head", 440, 313, "r", 110], ["Plunger", 408, 400, "r", 190], ["AeroPress chamber", 300, 455, "l", 420], ["Reservoir", 130, 640, "l", 560], ["IR gesture tower", 556, 395, "r", 270], ["E-stop", 640, 640, "r", 600], ["16×2 LCD", 600, 703, "r", 690]];
  const SPEC = [["Controller", "PIC18F45K20 · 1 MHz"], ["Input", "IR distance sensor · 3 bands"], ["Actuation", "Linear actuator + 2 DC motors"], ["Fluid", "Pump through hollow stirrer"], ["Cycle", "3.2–3.9 min"], ["Firmware", "C · 790 lines · A. Denli"]];
  const MANUAL = ["Fill kettle", "Scoop coffee", "Pour water", "Stir", "Time the steep", "Press plunger", "Eject puck"];
  const OURS = ["Add coffee", "Wave to choose", "Take mug", "Remove cap"];
  const INPUTS = [["Physical buttons", "No", "Yes", "Low", "Yes"], ["Touchscreen", "No", "Yes", "Medium", "Yes"], ["Voice control", "Yes", "No: noisy kitchens", "High", "Often needs internet"], ["Phone app", "Yes", "Needs a phone", "High", "Needs pairing"], ["IR hand gesture", "Yes", "Yes", "Low: one analogue sensor", "Yes"]];
  const METHOD = [["Load", "Coffee into chamber", "Funnel on head", "User", "u"], ["Add water", "Fill the chamber", "Pump through stirrer", "Pump", "m"], ["Stir", "Wet all grounds", "Spinning stirrer", "DC motor", "m"], ["Steep", "Wait", "Timed in code", "Software", "u"], ["Press", "Push through filter", "Plunger on head", "Actuator", "m"], ["Eject", "Push out the puck", "Final plunge", "Actuator", "m"]];
  const DECIDE = [["Linear actuator", "One straight-line motion for everything", "Stirring depth and pressing are both vertical moves. An electric actuator gives a slow, strong, controlled push, which pressing needs: too fast and the filter channels or blows out. It holds its position when unpowered."], ["Rotating head", "Three tools, one actuator", "A separate mechanism per tool would mean three actuators. Mounting the funnel, stirrer and plunger on one head that a DC motor turns on a bearing turntable cut the cost, the wiring and the number of driver channels."], ["Strength from time", "Same water, different contact time", "The pump runs 8 s in every mode, so the water volume is fixed. Strength comes from how long the coffee is stirred and steeped. Cold gets the longest, because cold water extracts slowest."], ["Buttons to gesture", "The design evolved", "Our first program flowchart used three physical buttons: Strong, Cold and Quick Brew. In the final machine the IR gesture replaced them, Quick became Mild, and a “place hand” step was added to start the final plunge."]];
  const EIN = [["IR distance sensor", "RA0 · analogue (AN0)"], ["Micro-switch 1", "RA1 · plunger position"], ["Micro-switch 2", "RA2 · home position"], ["Micro-switch 3", "RA3 · end of final plunge"]];
  const EOUT = [["Driver 1 → Rotation motor", "RB2–RB3 · turns the head"], ["Driver 2 → Linear actuator", "RB4–RB5 · head up / down"], ["Driver 3 → Water pump", "RB0–RB1 · water in"], ["Driver 4 → Stirrer motor", "RB0–RB1 · spins the stirrer"], ["16×2 LCD", "Port D · 4-bit, RS RD6, E RD7"]];
  const FLOW = [["main()", "set up ports, LCD, custom chars", "ink"], ["Home the machine", "rotate to switch 2, lower to 3", ""], ["“TO START / ADD COFFEE”", "then “SELECT BREW”", ""], ["while(1): read IR (ADC)", "compare against three bands", "hot"], ["", "", "branch"], ["PLUNGE_AND_DISPENSE()", "wait for hand, eject, reset", ""]];
  const CODE1 = ["{k:while} ({n:1}) {", "  ADC_Init();", "  ADC_Convert();          {c:// read the IR sensor}", "", "  {k:if} (ADRESH >= {n:120} && ADRESH <= {n:200}) {", "    COLD_BREW();   PLUNGE_AND_DISPENSE(); }", "  {k:if} (ADRESH <= {n:119} && ADRESH >= {n:101}) {", "    MILD_BREW();   PLUNGE_AND_DISPENSE(); }", "  {k:if} (ADRESH <= {n:100} && ADRESH >= {n:90}) {", "    STRONG_BREW(); PLUNGE_AND_DISPENSE(); }", "}"];
  const CODE2 = ["LATB = {n:0b00010011};      {c:// actuator up}", "Delay10KTCYx({n:255});", "Delay10KTCYx({n:255});", "Delay10KTCYx({n:40});        {c:// 550 \u00d7 0.04 s = 22 s}", "LATB = {n:0b00000011};      {c:// actuator off}", "", "{k:do} { LATB = {n:0b00000111}; }  {c:// turn head}", "{k:while} (PORTAbits.RA1 == {n:1}); {c:// until switch 1}", "LATB = {n:0b00000011};      {c:// stop: plunger in place}"];
  const BREWS = [["Strong", [["lift", 64.1], ["mix", 27], ["turn", 21.5], ["steep", 39], ["press", 23.3], ["fin", 28.4]], "3.4 min"], ["Mild", [["lift", 64.1], ["mix", 22], ["turn", 21.5], ["steep", 30], ["press", 23.3], ["fin", 28.4]], "3.2 min"], ["Cold", [["lift", 64.1], ["mix", 43], ["turn", 21.5], ["steep", 51], ["press", 23.3], ["fin", 28.4]], "3.9 min"]];
  const LEG = [["lift", "Lift, turn, lower stirrer"], ["mix", "Mix"], ["turn", "Lift, turn to plunger"], ["steep", "Steep"], ["press", "Press"], ["fin", "Finish prompts"]];
  const LCDS = [["TO START", " ADD COFFEE"], ["  SELECT", "      BREW"], ["   LOADING", "STRONG BREW"], ["....", "     MIXING"], ["......", "     BREWING"], ["........", "    PRESSING"], ["..........", "    FINISHED"], ["...........", " TAKE COFFEE"], [" REMOVE CAP", "HOLDING GROUNDS"], [" PLACE HAND", "OVER SENSOR"], [" DISPENSING", ""]];
  const CHARS = [["Mug L", "11111 10000 10000 10000 10000 01000 01000 00111"], ["Mug R", "11100 00111 00101 00101 00111 01000 01000 10000"], ["Steam L1", "01000 10001 10000 01000 00100 01000 00100 00000"], ["Steam R1", "10000 00000 10000 01000 01000 10000 01000 00000"], ["Steam L2", "10000 01000 00010 00100 00100 01000 01000 00000"], ["Steam R2", "00010 00100 01000 01000 00100 00100 01000 00000"]];
  const STEPS = [["Add coffee", "On power-up", 0], ["Wave to choose", "High · mid · low", 1], ["Head lifts & turns", "27.0 s + 2.3 s", 2], ["Stirrer lowers", "20.4 s", 3], ["Mixing", "20 / 25 / 41 s", 3], ["Lift, turn, steep", "22 s, then 31 / 39 / 51 s", 4], ["Pressing", "23.8 s", 5], ["Take your coffee", "5 s cool, then prompt", 7], ["Wave to eject", "Down to switch 3", 10], ["Reset to home", "30.6 s up, 20.4 s down", 10]];
  const LISTS = [["What worked", ["One actuator and a rotating head did every vertical job", "The marked IR tower was quick to learn", "Every stage named on screen, with a steaming-mug animation"], ""], ["What I learned", ["Timed moves drift with load: important positions need switches", "Blocking delays stop the code reacting mid-stage", "True cold brew takes hours; ours is a fast cold steep"], "sand"], ["Next iteration", ["A state machine on timer interrupts, with one shared brew function", "A heater and flow sensor to control water temperature and volume", "A coffee hopper and automatic cap release"], "ink"]];

  /* ---------- small builders ---------- */
  const sheet = (n, title) => `<div class="ap-hdr"><span class="sec">${n} — ${esc(title)}</span><span>Hands-Free AeroPress · Group L · 2021</span><span>Sheet ${n} / 11</span></div>`;
  const block = (n, sec) => `<div class="ap-tb"><span>Drawn<b>Alex Denli</b></span><span>Project<b>Hands-Free AeroPress</b></span><span>Section<b>${esc(sec)}</b></span><span>Sheet<b>${n}/11</b></span><span>Scale<b>NTS</b></span></div>`;
  const lab = (t) => `<span class="ap-lab">${esc(t)}</span>`;
  const lcd = (a, b, cls = "") => `<div class="ap-lcd ${cls}"><div class="s">${esc(a.padEnd(16))}\n${esc(b.padEnd(16))}</div></div>`;
  const pills = (arr, cls) => arr.map((t, i) => `<li class="${cls}" style="--i:${i}">${esc(t)}</li>`).join("<i></i>");
  const code = (lines) => `<pre class="ap-code">${lines.map((l, i) => `<span class="ln" style="--i:${i}">${l ? esc(l).replace(/\{(k|n|c):([^}]*)\}/g, (m, t, v) => `<b class="${t}">${v}</b>`) : "\u00a0"}</span>`).join("")}</pre>`;
  const chars = () => CHARS.map(([n, g]) => `<figure class="ap-ch"><svg viewBox="0 0 55 88">${g.split(" ").map((row, y) => [...row].map((b, x) => `<rect x="${x * 11}" y="${y * 11}" width="10" height="10" rx="1.5" class="${b === "1" ? "on" : ""}"/>`).join("")).join("")}</svg><figcaption>${esc(n)}</figcaption></figure>`).join("");

  function callouts() {
    return `<svg class="ap-calls" viewBox="0 0 858 882" aria-hidden="true">${CALLS.map(([t, x, y, side, ly], i) => {
      const w = t.length * 7.6 + 34, lx = side === "l" ? 24 : 834 - w, ex = side === "l" ? lx + w : lx;
      return `<g style="--i:${i}"><line x1="${ex}" y1="${ly + 10}" x2="${x}" y2="${y}" pathLength="1"/><circle cx="${x}" cy="${y}" r="4.5"/><rect x="${lx}" y="${ly}" width="${w}" height="20"/><rect class="n" x="${lx}" y="${ly}" width="22" height="20"/><text x="${lx + 11}" y="${ly + 14}" class="num">${String(i + 1).padStart(2, "0")}</text><text x="${lx + 30}" y="${ly + 14}" class="t">${esc(t.toUpperCase())}</text></g>`;
    }).join("")}<text x="20" y="866" class="fig">FIG. 01 · AS BUILT · FRONT ELEVATION</text></svg>`;
  }

  function diagram() {
    const inp = EIN.map(([a, b], i) => `<g class="bx in" style="--i:${i}"><rect x="0" y="${30 + i * 70}" width="250" height="54"/><text x="14" y="${54 + i * 70}" class="h">${esc(a)}</text><text x="14" y="${72 + i * 70}" class="m">${esc(b)}</text><line x1="250" y1="${57 + i * 70}" x2="396" y2="${120 + i * 30}" pathLength="1"/></g>`).join("");
    const out = EOUT.map(([a, b], i) => `<g class="bx out${i === 4 ? " lcdb" : ""}" style="--i:${i + 4}"><line x1="630" y1="${110 + i * 28}" x2="756" y2="${55 + i * 62}" pathLength="1"/><rect x="760" y="${30 + i * 62}" width="300" height="50"/><text x="774" y="${54 + i * 62}" class="h">${esc(a)}</text><text x="774" y="${72 + i * 62}" class="m">${esc(b)}</text></g>`).join("");
    return `<svg class="ap-dia" viewBox="0 0 1240 340" role="img" aria-label="Electronics block diagram: one IR sensor and three micro-switches into a PIC18F45K20, out to four motor drivers and an LCD, with an emergency stop on the driver power">
      <text x="0" y="14" class="cap">INPUTS</text><text x="760" y="14" class="cap">OUTPUTS</text>${inp}
      <g class="pic" style="--i:4"><rect x="400" y="80" width="230" height="200"/><text x="515" y="160" class="big">PIC18F45K20</text><text x="515" y="184" class="sub">MICROCONTROLLER</text><text x="515" y="206" class="m2">1 MHz internal clock</text></g>${out}
      <g class="es" style="--i:10"><rect x="1100" y="30" width="130" height="54"/><text x="1114" y="54" class="h">E-stop</text><text x="1114" y="72" class="m">cuts driver power</text><path d="M1165 84V250H1060M1165 117H1060M1165 179H1060M1165 241H1060" pathLength="1"/></g></svg>`;
  }

  function flow() {
    const node = (x, y, w, t, s, cls, i) => `<g class="fn ${cls}" style="--i:${i}"><rect x="${x}" y="${y}" width="${w}" height="46"/><text x="${x + 12}" y="${y + 20}" class="h">${esc(t)}</text><text x="${x + 12}" y="${y + 37}" class="m">${esc(s)}</text></g>`;
    const arrow = (y, i) => `<g class="fa" style="--i:${i}"><line x1="240" y1="${y}" x2="240" y2="${y + 14}" pathLength="1"/><path class="ah" d="M236 ${y + 12}l4 8 4-8z"/></g>`;
    return `<svg class="ap-flow" viewBox="0 0 500 394" role="img" aria-label="Program structure: main sets up, homes the machine, prompts, then loops reading the IR sensor and branching to cold, mild or strong brew before plunging and dispensing">
      ${node(110, 0, 260, "main()", "set up ports, LCD, custom chars", "ink", 0)}${arrow(46, 1)}
      ${node(110, 66, 260, "Home the machine", "rotate to switch 2, lower to 3", "", 1)}${arrow(112, 2)}
      ${node(110, 132, 260, "“TO START / ADD COFFEE”", "then “SELECT BREW”", "", 2)}${arrow(178, 3)}
      ${node(110, 198, 260, "while(1): read IR (ADC)", "compare against three bands", "hot", 3)}
      <g class="fa" style="--i:4"><path d="M240 244v12H75v10M240 244v22M240 244v12h165v10" pathLength="1"/></g>
      ${node(0, 268, 150, "COLD_BREW()", "ADC 120–200", "", 4)}${node(165, 268, 150, "MILD_BREW()", "ADC 101–119", "", 4)}${node(330, 268, 150, "STRONG_BREW()", "ADC 90–100", "", 4)}
      <g class="fa" style="--i:5"><path d="M75 314v12h330v-12M240 314v26" pathLength="1"/><path class="ah" d="M236 338l4 8 4-8z"/></g>
      ${node(110, 346, 260, "PLUNGE_AND_DISPENSE()", "wait for hand, eject, reset", "", 5)}
      <g class="fl" style="--i:6"><path d="M370 369h100V221h-94" pathLength="1"/><path class="ah" d="M382 216l-8 5 8 5z"/><text x="480" y="300" class="m hot">loop</text></g></svg>`;
  }

  function adc() {
    const X = (v) => (v / 255) * 560;
    return `<svg class="ap-adc" viewBox="-14 0 588 100" role="img" aria-label="ADC reading bands: under 90 ignored, 90 to 100 strong, 101 to 119 mild, 120 to 200 cold">
      <text x="0" y="16" class="m">hand far (high) ←</text><text x="560" y="16" class="m" text-anchor="end">→ hand close (low)</text>
      <rect x="0" y="30" width="${X(90)}" height="40" class="ig"/><text x="${X(45)}" y="55" class="bl ig">ignored</text>
      <rect x="${X(90)}" y="30" width="${X(11)}" height="40" class="st"/><text x="${X(95.5)}" y="55" class="bl w" font-size="7.5">STRONG</text>
      <rect x="${X(101)}" y="30" width="${X(19)}" height="40" class="mi"/><text x="${X(110.5)}" y="55" class="bl w">MILD</text>
      <rect x="${X(120)}" y="30" width="${X(81)}" height="40" class="co"/><text x="${X(160)}" y="55" class="bl w">COLD</text>
      <rect x="${X(201)}" y="30" width="${X(54)}" height="40" class="ig"/>
      ${[0, 90, 101, 120, 200, 255].map((v) => `<line x1="${X(v)}" y1="70" x2="${X(v)}" y2="78"/><text x="${X(v)}" y="92" class="tk">${v}</text>`).join("")}</svg>`;
  }

  function timelines() {
    const T = 240, W = 1000, X = (s) => 90 + (s / T) * W;
    return `<svg class="ap-tl" viewBox="0 0 1180 250" role="img" aria-label="The three brew programmes stage by stage: strong 3.4 minutes, mild 3.2, cold 3.9">
      ${BREWS.map(([n, segs, tot], r) => { let t = 0; const y = 26 + r * 58; return `<text x="0" y="${y + 26}" class="nm">${esc(n)}</text>${segs.map(([k, d]) => { const x0 = X(t); t += d; return `<rect class="sg ${k}" x="${x0}" y="${y}" width="${X(t) - x0}" height="40"/>${["mix", "steep"].includes(k) ? `<text class="sv" x="${(x0 + X(t)) / 2}" y="${y + 25}">${d} s</text>` : ""}`; }).join("")}<text x="${X(t) + 14}" y="${y + 25}" class="tot">${esc(tot)}</text>`; }).join("")}
      ${[0, 30, 60, 90, 120, 150, 180, 210, 240].map((s) => `<line x1="${X(s)}" y1="196" x2="${X(s)}" y2="202"/><text x="${X(s)}" y="216" class="tk">${s}s</text>`).join("")}
      ${LEG.map(([k, t], i) => `<rect class="sg ${k}" x="${90 + i * 190}" y="226" width="12" height="12"/><text x="${108 + i * 190}" y="237" class="lg">${esc(t)}</text>`).join("")}</svg>`;
  }

  /* ---------- the page ---------- */
  function render(p, tail) {
    return `<article class="page apd">
    <section class="ap-sheet ap-hero" data-sec="General view">${sheet("01", "General view")}
      <div class="ap-hbody">
        <div class="ap-title">
          <div class="ap-lab">Project file · Electronics + Manufacturing</div>
          <h1><span>Hands-free</span><span class="or">AeroPress</span></h1>
          <div class="ap-rule"></div>
          <p class="ap-lede">A gesture-controlled machine that stirs, steeps and presses an AeroPress coffee without a single touch.</p>
          ${lab("Specification")}
          <table class="ap-t"><tbody>${SPEC.map(([a, b]) => `<tr><td class="b">${esc(a)}</td><td>${esc(b)}</td></tr>`).join("")}</tbody></table>
          ${lab("Brew modes · hand height")}
          <div class="ap-modes"><div class="or"><b>STRONG</b><span>ADC 90–100</span></div><div><b>MILD</b><span>ADC 101–119</span></div><div class="ink"><b>COLD</b><span>ADC 120–200</span></div></div>
        </div>
        <figure class="ap-hfig">${IMG("front.webp", "The hands-free AeroPress machine, front elevation, with a hand held over the gesture tower", "", false)}${callouts()}</figure>
      </div>${block("01", "General view")}</section>

    <section class="ap-sheet" data-sec="Overview">${sheet("02", "Overview")}
      <header class="ap-h rv"><h2>Coffee, without a touch</h2><p>The brief was to brew coffee with an AeroPress using linear motion. Designing in 2021, we made the whole routine hands-free: one wave of the hand, and the machine does the rest.</p></header>
      <div class="ap-body ap-g3">
        <div class="ap-col rv" style="--i:0"><div class="ap-card">${lab("The brief")}<h3>Make coffee with an AeroPress and linear motion</h3><p>An electronics and manufacturing module: design, build and program a working machine that brings mechanical design, fabrication, electronics and embedded code together in one product.</p></div>
          <div class="ap-card">${lab("Our response")}<h3>A touch-free brewing machine</h3><p>Shared coffee machines have buttons that many people touch every day. Ours has none. The user holds a hand at one of three heights over an infrared sensor to choose Strong, Mild or Cold. A linear actuator and a rotating head carrying a funnel, a stirrer and a plunger then run the full AeroPress routine.</p></div>
          <div class="ap-card sand">${lab("Team")}<p>Group L: Alex Denli, Tom Hufton, Dan Ward-Thomas, Ishaan Desai. Four-person university team, final build November 2021.</p></div></div>
        <div class="ap-col rv" style="--i:1"><div class="ap-card ink grow">${lab("My role")}<h3 class="lg">Sole programmer of the control system</h3><p>I wrote all of the machine’s embedded code, in C, for the PIC18F45K20 microcontroller:</p>
          <ul><li>The full brewing sequence for all three brews</li><li>IR gesture detection using the ADC</li><li>Motor, actuator and pump control through four drivers</li><li>Homing and positioning with micro-switches</li><li>The LCD interface, including custom mug and steam graphics</li><li>Timing tuned on the real machine</li></ul>
          <p>I also worked on the mechanical design, the electronics and testing as part of the team.</p></div></div>
        <div class="ap-col rv" style="--i:2"><figure class="ap-ph grow">${IMG("quarter.webp", "The finished machine, three-quarter view")}</figure>
          <div class="ap-card tight"><table class="ap-t"><thead><tr><th>Spec</th><th>Detail</th></tr></thead><tbody><tr><td class="b">Controller</td><td>PIC18F45K20, 1 MHz internal clock</td></tr><tr><td class="b">Inputs</td><td>IR distance sensor, 3 micro-switches, e-stop</td></tr><tr><td class="b">Outputs</td><td>Linear actuator, 2 DC motors, pump, 16×2 LCD</td></tr><tr><td class="b">Cycle</td><td>3.2 min (Mild) to 3.9 min (Cold)</td></tr></tbody></table></div></div>
      </div>${block("02", "Overview")}</section>

    <section class="ap-sheet" data-sec="Research">${sheet("03", "Research · 01")}
      <header class="ap-h rv"><h2>Designing for a touch-free world</h2><p>In 2021 people were wiping down shared surfaces and avoiding them where they could. A shared coffee machine is one of the most-touched objects in an office or studio, so we set out to remove every touchpoint we could.</p></header>
      <div class="ap-body ap-colm">
        <div class="ap-card rv ap-touch">${lab("Touchpoints in a single cup")}
          <div class="cap">Manual AeroPress · 7 hands-on steps</div><ol class="ap-pills">${pills(MANUAL, "g")}</ol>
          <div class="cap">Our machine · 4 steps, only one involves the machine itself</div><div class="ap-prow"><ol class="ap-pills">${pills(OURS, "o")}</ol><p>The wave is contactless. Stirring, timing, pressing and ejecting the puck are all automated.</p></div></div>
        <div class="ap-g2w grow">
          <div class="ap-card rv" style="--i:1">${lab("How should the user choose a brew?")}<table class="ap-t"><thead><tr><th>Input method</th><th>Touch-free</th><th>Works anywhere</th><th>Cost &amp; complexity</th><th>Stand-alone</th></tr></thead><tbody>${INPUTS.map((r, i) => `<tr${i === 4 ? ' class="pick"' : ""}>${r.map((c, j) => `<td${j === 0 ? ' class="b"' : ""}>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
          <div class="ap-card ink rv" style="--i:2">${lab("Decision")}<h3 class="lg">A hand gesture over an infrared sensor</h3><p>It is the only option that is touch-free, works in a noisy kitchen, needs no phone or internet, and costs one analogue sensor read by the microcontroller’s ADC.</p><p>Holding a hand at three heights gives three “virtual buttons” in the air. A printed tower marks Strong, Mild and Cold so users know where to put their hand.</p></div>
        </div>
      </div>${block("03", "Research")}</section>

    <section class="ap-sheet" data-sec="Research">${sheet("04", "Research · 02")}
      <header class="ap-h rv"><h2>From a manual ritual to a machine</h2><p>An AeroPress is a hand-operated immersion brewer. We broke its method into six steps and gave each one a mechanism, so a single linear motion could do every vertical job.</p></header>
      <div class="ap-body ap-colm">
        <div class="ap-card rv">${lab("The AeroPress method, mapped to the machine")}<ol class="ap-map">${METHOD.map(([a, b, c, d, k], i) => `<li style="--i:${i}"><i>0${i + 1}</i><b>${esc(a)}</b><span>${esc(b)}</span><em class="arr"></em><div class="mech">${esc(c)}</div><div class="chip ${k}">${esc(d.toUpperCase())}</div></li>`).join("")}</ol></div>
        <div class="ap-g4 grow">${DECIDE.map(([l, h, t], i) => `<div class="ap-card rv${i === 3 ? " ink" : ""}" style="--i:${i + 1}">${lab(l)}<h3>${esc(h)}</h3><p>${esc(t)}</p></div>`).join("")}</div>
      </div>${block("04", "Research")}</section>

    <section class="ap-sheet ap-ga" data-sec="General arrangement">${sheet("05", "General arrangement")}
      <figure class="rv ap-gaf">${IMG("ga.webp", "Labelled general-arrangement sketch of the machine in its home position: funnel, rotating head, plunger, AeroPress chamber, threaded-rod frame, water reservoir, drip guide, mug on coaster, stirrer, linear actuator, IR gesture tower, IR distance sensor, emergency stop, 16 by 2 LCD, control box, turntable on bearings")}</figure>
      ${block("05", "General arrangement")}</section>

    <section class="ap-sheet ap-pin ap-el" data-pin="elec" data-sec="Electronics" style="height:260vh"><div class="ap-stage">${sheet("06", "Electronics")}
      <header class="ap-h"><h2>One microcontroller, four drivers, zero buttons</h2><p>A PIC18F45K20 reads one analogue sensor and three switches, and drives two motors, a linear actuator, a pump and an LCD through four motor-driver channels.</p></header>
      <div class="ap-body ap-colm">
        <div class="ap-card">${lab("Inputs and outputs")}${diagram()}</div>
        <div class="ap-g3b grow">
          <div class="ap-card rv">${lab("Reading a gesture")}${adc()}<p>The IR sensor’s voltage rises as a hand gets closer. The ADC’s top 8 bits (0–255) are split into three bands. Readings under 90, from an empty sensor or someone walking past, are ignored.</p></div>
          <div class="ap-card rv" style="--i:1">${lab("Positioning")}<h3>Timed moves, switch-confirmed stops</h3><p>The actuator’s travel is timed. The positions that must be exact use micro-switches: the plunger over the chamber, the home position, and the bottom of the final plunge. On power-up the machine drives to two of these to find a known start point.</p></div>
          <div class="ap-card ink rv" style="--i:2">${lab("Safety")}<h3>Hardware emergency stop</h3><p>A mushroom-head e-stop on the control box cuts power to all four motor drivers, whatever the code is doing. Nothing moves while a hand is needed near the machine, because the final plunge only starts after the “place hand” gesture.</p></div>
        </div>
      </div>${block("06", "Electronics")}</div></section>

    <section class="ap-sheet ap-pin ap-cd" data-pin="code" data-sec="Code" style="height:300vh"><div class="ap-stage">${sheet("07", "Code · 01")}
      <header class="ap-h"><h2>I wrote the code that runs the machine</h2><p>I programmed the whole control system single-handed, in C for the PIC18F45K20: every movement, the gesture detection, the brew sequences and the screen. It is a timed state sequence, checked against micro-switches wherever a position has to be exact.</p></header>
      <div class="ap-body ap-g2c">
        <div class="ap-col"><div class="ap-card grow">${lab("Program structure")}${flow()}</div>
          <div class="ap-card sand ap-stats">${[["790", "lines of C"], ["13", "functions"], ["6", "custom LCD characters"], ["4", "motor-driver channels"]].map(([n, t]) => `<div><b data-to="${n}">0</b><span>${esc(t)}</span></div>`).join("")}</div></div>
        <div class="ap-col"><div>${lab("Choosing a brew from hand height")}${code(CODE1)}</div>
          <div>${lab("Moving the head: timed lift, switch-confirmed turn")}${code(CODE2)}</div>
          <div class="ap-card tight ap-pins"><h3>How the pins drive the hardware</h3><p>Each <code>LATB</code> value sets every motor at once. Bits 0–1 run the pump and stirrer (active low), bits 2–3 turn the head clockwise or anticlockwise, and bits 4–5 drive the actuator up or down.</p></div></div>
      </div>${block("07", "Code")}</div></section>

    <section class="ap-sheet ap-pin ap-tm" data-pin="time" data-sec="Code" style="height:280vh"><div class="ap-stage">${sheet("08", "Code · 02")}
      <header class="ap-h"><h2>Timing the brew, designing the screen</h2><p>Every stage is a counted delay. At 1 MHz the PIC executes 250,000 instructions a second, so one <code>Delay10KTCYx(1)</code> lasts 0.04 s. I tuned each value on the real machine until every move landed in the right place.</p></header>
      <div class="ap-body ap-colm">
        <div class="ap-card">${lab("The three brew programmes, stage by stage (from the code)")}${timelines()}</div>
        <div class="ap-g2s grow">
          <div class="ap-card">${lab("Screen sequence: what the user sees")}<div class="ap-lcds">${LCDS.map(([a, b], i) => `<div style="--i:${i}">${lcd(a, b)}</div>`).join("")}</div><p>Every stage is named on screen, so the user always knows what the machine is doing and when to step in.</p></div>
          <div class="ap-card ink">${lab("Custom characters")}<div class="ap-chars">${chars()}</div><p>I drew six 5×8 pixel characters and wrote them into the LCD’s character memory: two halves of a mug and two frames of steam per side. A routine swaps the steam frames seven times, so the cup “steams” while the machine works.</p></div>
        </div>
      </div>${block("08", "Code")}</div></section>

    <section class="ap-sheet ap-pin ap-st" data-pin="steps" data-sec="How it works" style="height:620vh"><div class="ap-stage">${sheet("09", "How it works")}
      <header class="ap-h"><h2>Ten steps, one wave</h2><p>One Strong brew from start to finish. The actuator lifts and lowers the head, the head turns each tool over the chamber, and the screen names every stage.</p></header>
      <div class="ap-body ap-sg">
        <div class="ap-sv">${STEPS.map((s, i) => IMG(`step-${i + 1}.webp`, `Step ${i + 1} sketch: ${s[0]}`, "sk")).join("")}</div>
        <div class="ap-sinfo">
          <ol class="ap-rail">${STEPS.map((s, i) => `<li><i>${i + 1}</i><span>${esc(s[0])}</span></li>`).join("")}</ol>
          <div class="ap-snow"><div class="n">01</div><h3>${esc(STEPS[0][0])}</h3><div class="t">${esc(STEPS[0][1])}</div><div class="scr">${LCDS.map(([a, b], i) => lcd(a, b, i === 0 ? "on" : "")).join("")}</div></div>
        </div>
      </div>${block("09", "How it works")}</div></section>

    <section class="ap-sheet" data-sec="The build">${sheet("10", "The build")}
      <header class="ap-h rv"><h2>Built, programmed and working</h2><p>Laser-cut and 3D-printed parts on a threaded-rod frame, with a real AeroPress at its heart. The machine brews all three programmes start to finish.</p></header>
      <div class="ap-body ap-colm">
        <div class="ap-pg">
          <figure class="rv tall">${IMG("gesture.webp", "Selecting a brew with a hand held over the gesture tower")}<figcaption>Choosing a brew by hand height</figcaption></figure>
          <figure class="rv" style="--i:1">${IMG("head.webp", "The rotating head with funnel, stirrer bearing and plunger")}<figcaption>Rotating head</figcaption></figure>
          <figure class="rv" style="--i:2">${IMG("chamber.webp", "The AeroPress chamber in its locating ring above the mug")}<figcaption>Chamber and drip guide</figcaption></figure>
          <figure class="rv wide" style="--i:3">${IMG("frontb.webp", "Front view of the finished machine")}<figcaption>Front elevation</figcaption></figure>
        </div>
        <div class="ap-g3b grow">${LISTS.map(([h, items, k], i) => `<div class="ap-card rv ${k}" style="--i:${i + 1}">${lab(h)}<ul>${items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>`).join("")}</div>
      </div>${block("10", "The build")}</section>

    <section class="ap-sheet ap-end" data-sec="Overview">
      <div class="ap-glow"></div>
      <figure class="ap-ef rv">${IMG("final.webp", "The hands-free AeroPress machine with a hand choosing a brew over the gesture tower")}
        <div class="ap-marks"><span style="top:47.7%">STRONG</span><span style="top:58.6%">MILD</span><span style="top:65.1%">COLD</span></div></figure>
      <div class="ap-etext rv" style="--i:1">
        <div class="ap-lab">Sheet 11 · Operation</div>
        <h2><span>Wave.</span><span>Wait.</span><span class="or">Drink.</span></h2>
        <div class="ap-rule"></div>
        <p>A hands-free AeroPress machine: one gesture sets off the stirring, steeping and pressing, with every line of control code written by me.</p>
        <div class="ap-ir"><div class="h">// IR gesture input</div><div><span>ADC 090–100</span><span class="or">STRONG · 3.4 MIN</span></div><div><span>ADC 101–119</span><span>MILD · 3.2 MIN</span></div><div><span>ADC 120–200</span><span class="bl">COLD · 3.9 MIN</span></div></div>
        <div class="ap-estat"><div><b>0</b><span>Buttons</span></div><div><b>3</b><span>Brew modes</span></div><div><b class="or">~3.5</b><span>Min / cup</span></div></div>
      </div>
      <p class="ap-cred">University electronics and manufacturing project · Group L, 2021 · Alex Denli</p>
    </section>
    ${tail}</article>`;
  }

  /* ---------- behaviour ---------- */
  let off = [];
  function wire() {
    off.forEach((f) => f()); off = [];
    const root = document.querySelector(".apd");
    if (!root) return;
    const $ = (s, r = root) => r.querySelector(s), $$ = (s, r = root) => Array.from(r.querySelectorAll(s));
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) root.classList.add("calm");
    requestAnimationFrame(() => $(".ap-hero").classList.add("in"));

    if ("IntersectionObserver" in window && !reduce) {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.2 });
      $$(".rv").forEach((n) => io.observe(n)); off.push(() => io.disconnect());
    } else $$(".rv").forEach((n) => n.classList.add("in"));

    const P = {
      elec(el, p) { el.style.setProperty("--d", cl(p * 1.15).toFixed(4)); $(".ap-g3b", el).classList.toggle("vis", p > .55); },
      code(el, p) {
        el.style.setProperty("--f", cl(p / .5).toFixed(4));
        $$(".ap-stats b", el).forEach((b, i) => { const t = cl((p - .5 - i * .06) / .3), v = +b.dataset.to * (1 - Math.pow(1 - t, 3)); b.textContent = Math.round(v); });
        const lines = $$(".ap-code .ln", el), n = Math.floor(cl((p - .12) / .7) * lines.length);
        lines.forEach((l, i) => l.classList.toggle("on", i < n));
      },
      time(el, p) {
        el.style.setProperty("--w", cl(p / .55).toFixed(4));
        const k = Math.floor(cl((p - .35) / .55) * 12); $$(".ap-lcds > div", el).forEach((d, i) => d.classList.toggle("on", i < k));
        el.classList.toggle("steam", p > .8);
      },
      steps(el, p) {
        const a = Math.min(9, Math.floor(cl(p * 1.06) * 10));
        if (el.dataset.a == a) return; el.dataset.a = a;
        $$(".ap-sv .sk", el).forEach((im, i) => im.classList.toggle("on", i === a));
        $$(".ap-rail li", el).forEach((li, i) => { li.classList.toggle("on", i === a); li.classList.toggle("done", i < a); });
        const now = $(".ap-snow", el), s = STEPS[a];
        $(".n", now).textContent = String(a + 1).padStart(2, "0"); $("h3", now).textContent = s[0]; $(".t", now).textContent = s[1];
        $$(".scr .ap-lcd", now).forEach((d, i) => d.classList.toggle("on", i === s[2]));
      }
    };
    const pins = $$("[data-pin]");
    let raf = 0;
    const fit = () => {
      $$(".ap-stage", root).forEach((st) => {
        const kids = [...st.children]; kids.forEach((k) => (k.style.zoom = ""));
        const avail = st.clientHeight - parseFloat(getComputedStyle(st).paddingBottom);
        const need = () => Math.max(...[...st.querySelectorAll("*")].filter((e) => !e.closest(".ap-tb, .ap-hdr") && (!e.closest("svg") || e.tagName === "svg")).map((k) => k.getBoundingClientRect().bottom)) - st.getBoundingClientRect().top;
        let z = Math.max(.5, Math.min(1, avail / need()));
        if (z < .995) { kids.forEach((k) => (k.style.zoom = z.toFixed(3))); const n2 = need(); if (n2 > avail + 1) { z = Math.max(.5, z * avail / n2); kids.forEach((k) => (k.style.zoom = z.toFixed(3))); } }
      });
    };
    fit(); addEventListener("resize", fit); off.push(() => removeEventListener("resize", fit));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
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
    };
    const q = () => { if (!raf) raf = requestAnimationFrame(tick); };
    addEventListener("scroll", q, { passive: true }); addEventListener("resize", q);
    off.push(() => { removeEventListener("scroll", q); removeEventListener("resize", q); cancelAnimationFrame(raf); });
    tick(); setTimeout(tick, 150);
  }

  window.AEROPRESS = { render, wire };
})();
