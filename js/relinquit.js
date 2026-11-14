/* Relinquit: custom project page.
   A calm, light "paper" world inside the black site. Scroll does the storytelling: charts draw, sketches are
   cut down to one, the case slides open step by step, and nine app screens play through one big phone.
   Content comes from the Relinquit design board (portfolio set). Pictures are drawn live in SVG/HTML. */
(function () {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const seg = (p, a, b) => cl((p - a) / (b - a));

  /* ---- icons (24px, stroke) ---- */
  const IC = {
    back: "M19 12H5M11 6l-6 6 6 6", bt: "m7 7 10 10-5 4V3l5 4L7 17", clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2",
    chart: "M4 20V10M10 20V4M16 20v-7M22 20H2", leaf: "M5 19c0-8 6-14 15-14 0 9-6 15-14 15M5 19 13 11",
    cse: "M7 2.5h10a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-13a3 3 0 0 1 3-3zM10 6h4M12 15.5v.01",
    plus: "M12 5v14M5 12h14", wave: "M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3M3 12h8", home: "M4 11 12 4l8 7v9h-5v-6H9v6H4z",
    check: "M5 12.5 10 17l9-10", arrow: "M5 12h14M13 6l6 6-6 6", close: "M6 6l12 12M18 6 6 18", call: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z",
    mug: "M4 8h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6zM17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 2v3M12 2v3", sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5",
    car: "M5 17h14v-5l-2-5H7l-2 5zM8 17h.01M16 17h.01", friends: "M6 7h10v13H6zM16 10h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2",
    face: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 15c1.5-1.5 6.5-1.5 8 0M8.5 9.5l2 1M15.5 9.5l-2 1", lock: "M5 11h14v10H5zM8 11V8a4 4 0 0 1 8 0v3",
    pin: "M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11zM12 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z", bell: "M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0",
    heart: "M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z", batt: "M2 7h16a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H2zM22 11v2M5 10h9v4H5z",
    coin: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM15 9.5c-.6-1-1.7-1.5-3-1.5-1.7 0-3 .9-3 2.2 0 3 6 1.6 6 4.6 0 1.3-1.3 2.2-3 2.2-1.4 0-2.6-.6-3.2-1.6M12 6v2M12 16v2",
    person: "M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21a8 8 0 0 1 16 0"
  };
  const ico = (n, w = 22, c = "currentColor", sw = 1.8) => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${IC[n]}"/></svg>`;
  const mark = (c = "currentColor", w = 26) => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5.5" y="2.5" width="13" height="19" rx="3.5"/><path d="M5.5 8.5 12 11l6.5-2.5"/></svg>`;

  /* ---- ideation sketches (A..H), the original drawings ---- */
  const SKN = ["Flip-top", "Top gate", "Carousel", "Drawer", "Pebble", "Case + lighter", "Home dock", "Clip-on tag"];
  const sketch = (n, k) => `<figure class="rq-sk${k === 1 ? " pick" : ""}" data-k="${k}"><img src="images/relinquit/sk-${"abcdefgh"[k]}.webp" alt="Sketch ${"ABCDEFGH"[k]}: ${n}"><figcaption>${"ABCDEFGH"[k]} · ${n}</figcaption><i class="x" aria-hidden="true"></i></figure>`;

  const SCREENS = [
    ["welcome", "Welcome", "Step down or quit now", 0, "paper"], ["pair", "Pair", "Hold the dot for 3 seconds", 0, "paper"], ["plan", "Plan", "Every plan ends on a quit date", 0, "paper"],
    ["today", "Today", "What is left today, and the next slot", 1, "paper"], ["resting", "Resting", "A countdown, not a “locked” message", 1, "warm"], ["sos", "Craving SOS", "A two-minute reset for the moments in between", 1, "dark"],
    ["insights", "Insights", "Patterns and triggers, week by week", 2, "paper"], ["progress", "Progress", "Money kept and milestones after the quit date", 2, "paper"], ["case", "Case", "Battery, lock and privacy", 2, "paper"]
  ];
  const GROUPS = ["Set up", "Every day", "Over time"];
  const phone = (k, s, cls = "") => `<div class="rq-dev ${cls}" style="--s:${s}"><div class="rq-sw"><div class="rq-body"><div class="rq-scr"><img src="images/relinquit/s${k + 1}.webp" alt="${SCREENS[k][1]} screen" loading="lazy"><i class="rq-notch"></i></div></div></div></div>`;

  /* ---- exploded view: the render, with numbered badges ---- */
  const PARTS = [["Cap + slider"], ["Body shell"], ["PCB"], ["Battery"], ["E-ink"], ["Lens + dot"], ["Cassette ×10"], ["Spring"]];
  const BAD = [[8.4, 6.5], [9.0, 40.7], [33.5, 41.6], [49.9, 45.1], [71.7, 45.0], [89.6, 46.8], [10.8, 75.0], [10.8, 95.8]];
  const exploded = () => `<div class="rq-exw"><img src="images/relinquit/exploded.webp" alt="Exploded view of the case: cap and slider, body shell, circuit board, battery, e-ink screen, lens, cassette of ten cigarettes and spring">${BAD.map((b, i) => `<span class="pt" data-i="${i}" style="left:${b[0]}%;top:${b[1]}%;--d:${i * 90}ms">${i + 1}</span>`).join("")}</div>`;

  const COLOURS = [["Graphite", "#2A2C2F", "#44484B", "#5FE0D6", "#0b0c0d"], ["Chalk / Lagoon", "#E9E6DF", "#2F7F86", "#2F7F86", "#142826"], ["Sage", "#A8B5A0", "#E7E4DC", "#7E8C77", "#142826"], ["Clay", "#D7A086", "#F1E8DC", "#B97B5C", "#142826"]];
  const EINK = [["Available", "#5FE0D6", ["TODAY", "3", "of 7 left"]], ["Resting", "#F2A04B", ["RESTING", "18:42", "until next"]], ["Quit mode", "#BFC7C6", ["QUIT MODE", "6", "smoke-free days"]], ["Overnight", "#BFC7C6", ["GOOD NIGHT", "07:00", "case opens"]]];
  const eink = (e) => `<div class="rq-es"><i style="background:${e[1]}"></i><div><span>${esc(e[2][0])}</span><b class="${e[2][1].length > 2 ? "sm" : ""}">${esc(e[2][1])}</b><small>${esc(e[2][2])}</small></div></div>`;

  /* ---- the page ---- */
  function render(p, tail) {
    const CH = { x: [30, 201, 430, 601, 716, 830], y: [59, 106, 146, 168, 191, 224], yr: [2011, 2014, 2018, 2021, 2023, 2025] };
    const line = CH.x.map((x, i) => `${i ? "L" : "M"}${x},${CH.y[i]}`).join(" ");
    const day = [[70, 111, "07:30", "Coffee", 0], [202, 173, "10:15", "Break", 0], [334, 111, "12:30", "Lunch", 0], [466, 359, "13:05", "Stressful call", 1], [598, 297, "17:30", "Commute", 1], [730, 173, "21:00", "TV", 0]];
    const dayPath = day.map((d, i) => `${i ? "L" : "M"}${d[0]},${d[1]}`).join(" ");
    const gap = [["Reduction apps", 160, 120], ["NHS Quit Smoking app", 230, 190], ["NicoTrax case", 140, 360], ["Lowiee case", 270, 300], ["Quitbit lighter", 560, 330]];
    return `<article class="page rq">

    <div class="rq-fix" aria-hidden="true"><b>Relinquit</b><span></span></div>
    <section class="rq-hero" data-sec="Overview"><div class="rq-hl"><p class="p-meta rq-meta"><b>Relinquit</b><span>${esc(p.year)}</span><a href="#/work/product-design">Product design</a></p>
        <h1><span>One at a time.</span><span class="t">Then none.</span></h1>
        <p class="rq-lead">${esc(p.summary)}</p><p class="rq-sc">Scroll for the story</p></div>
      <div class="rq-hr"><i class="rq-disc"></i><img class="rq-hc" src="images/relinquit/hero-case.webp" alt="Two Relinquit cases, graphite and chalk with a lagoon cap, showing the daily count on the e-ink screen"></div></section>

    <section data-sec="Research" class="rq-pin rq-prob" data-pin="prob"><div class="rq-stage"><div class="rq-in">
      <header class="rq-sh"><small>01 · Research</small><h2>Fewer people smoke. The ones left find it hardest to stop.</h2></header>
      <div class="rq-pgrid"><div class="rq-chart"><small class="rq-k">UK adults who smoke</small>
        <svg viewBox="0 0 880 430" role="img" aria-label="UK adult smoking prevalence: 20.2% in 2011 falling to 9.8% in 2025"><path class="ar" d="${line} L830,380 L30,380 Z" fill="#DCEDEE"/><path class="ln" d="${line}" pathLength="1" fill="none" stroke="#2F7F86" stroke-width="4" stroke-linejoin="round"/>
          ${CH.x.map((x, i) => `<g class="dt" data-f="${(x - 30) / 800}"><circle cx="${x}" cy="${CH.y[i]}" r="${i % 5 ? 6 : 9}" fill="#2F7F86" stroke="#F4F2ED" stroke-width="3"/><text x="${x}" y="412" text-anchor="middle" font-size="15" fill="#4F5D5A">${CH.yr[i]}</text></g>`).join("")}
          <text x="30" y="37" text-anchor="middle" font-size="30" font-weight="700" fill="#142826">20.2%</text><text class="end" x="824" y="200" text-anchor="middle" font-size="30" font-weight="700" fill="#1F5F65">9.8%</text></svg>
        <div class="rq-stats"><div><b>4.9m</b><span>people in the UK still smoke</span></div><div><b>7m+</b><span>deaths a year from tobacco worldwide</span></div><div><b class="am">83p</b><span>per cigarette — £3,000+ a year at 10 a day</span></div></div></div>
      <div class="rq-pr"><div class="rq-don"><svg viewBox="0 0 290 290" role="img" aria-label="51.7% intend to quit; 19.9% within three months"><circle cx="145" cy="145" r="120" fill="none" stroke="#E4E0D7" stroke-width="22"/><circle class="d1" cx="145" cy="145" r="120" fill="none" stroke="#2F7F86" stroke-width="22" stroke-linecap="round" transform="rotate(-90 145 145)"/><circle cx="145" cy="145" r="88" fill="none" stroke="#E4E0D7" stroke-width="22"/><circle class="d2" cx="145" cy="145" r="88" fill="none" stroke="#F2A04B" stroke-width="22" stroke-linecap="round" transform="rotate(-90 145 145)"/></svg>
          <div><b class="tl">51.7%</b><span>say they want to quit</span><b class="am">19.9%</b><span>plan to try in the next 3 months</span></div></div>
        <div class="rq-cut"><h3>Does cutting down work?</h3><small>Not smoking 6 months later — 697 smokers, randomised</small>
          <div class="br"><i class="b1"></i><b>22.0%</b><span>stopped outright</span></div><div class="br"><i class="b2"></i><b>15.5%</b><span>cut down first</span></div>
          <p class="so">${ico("arrow", 22, "#2F7F86")}So every plan ends on a quit date.</p></div></div></div>
      <p class="rq-src">Sources: ONS Adult smoking habits in the UK 2025 (2023 point: ONS 2023 bulletin); WHO tobacco fact sheet 2025; ONS average pack price Jan 2025; Lindson-Hawley et al., Annals of Internal Medicine 2016; NHS Better Health.</p>
    </div></div></section>

    <section data-sec="Who it’s for" class="rq-people"><header class="rq-sh"><small>02 · Research</small><h2>Who it’s for, and the gap it fills</h2></header>
      <div class="rq-pers">${[["Ray, 74", "#1F5F65", "“I’ll try, but I’m not fiddling with an app.”", "Big readable screen · works without a phone"], ["Dee, 58", "#A65412", "“Help me smoke less without feeling judged.”", "Her own plan · a soft lock, never shame"], ["Jade, 29", "#4C5E47", "“Only with friends… and coffee… and bad days.”", "Shows triggers · looks like a good object"]].map((r, i) => `<div class="rq-pc rv" style="--i:${i}"><div class="who"><i style="background:${r[1]}">${ico("person", 28, "#fff")}</i><b>${r[0]}</b></div><p>${r[2]}</p><span class="need">${r[3]}</span></div>`).join("")}</div>
      <p class="rq-note">Personas: Ray and Dee are loosely inspired by family members; Jade is fictional. Market positions are my judgement from public product descriptions.</p>
      <div class="rq-map rv"><svg viewBox="0 0 760 420" role="img" aria-label="Positioning map: Relinquit alone in the quadrant that enforces limits and ends in a quit date"><rect width="760" height="420" rx="24" fill="#fff"/><path d="M40 210h680M380 40v340" stroke="#DEDAD1"/><rect x="410" y="62" width="300" height="150" rx="20" fill="#DCEDEE"/>
        <g font-size="13" fill="#4F5D5A"><text x="44" y="228">Tracks only</text><text x="716" y="228" text-anchor="end">Enforces limits</text><text x="388" y="58">Ends in a quit date</text><text x="388" y="386">Open-ended</text></g>
        ${gap.map((g) => `<g class="gd"><circle cx="${g[1]}" cy="${g[2]}" r="6.5" fill="#142826"/><text x="${g[1] + 14}" y="${g[2] + 5}" font-size="14" font-weight="500" fill="#142826">${g[0]}</text></g>`).join("")}
        <g class="me"><circle cx="520" cy="130" r="11" fill="#2F7F86"/><text x="538" y="136" font-size="18" font-weight="700" fill="#2F7F86">Relinquit</text></g></svg><p><b>The gap:</b> a physical product that enforces gently <i>and</i> ends in a quit date.</p></div></section>

    <section data-sec="The insight" class="rq-pin rq-day" data-pin="day"><div class="rq-stage"><div class="rq-in">
      <header class="rq-sh"><small>The insight</small><h2>Cravings hit at stress and routine, so help is needed between cigarettes.</h2></header>
      <svg class="rq-dsv" viewBox="0 0 800 470" role="img" aria-label="A day of cravings: calm at coffee and lunch, lowest at a stressful call and the commute"><rect width="800" height="470" rx="24" fill="#fff"/><line x1="40" y1="235" x2="760" y2="235" stroke="#DEDAD1" stroke-dasharray="5 7"/><text x="40" y="44" font-size="14" fill="#4F5D5A">calm</text><text x="40" y="395" font-size="14" fill="#4F5D5A">craving</text>
        <g class="rest"><rect x="410" y="300" width="112" height="70" rx="14" fill="#FBEBDA"/><text x="466" y="330" text-anchor="middle" font-size="14" font-weight="700" fill="#A65412">Case rests</text><text x="466" y="352" text-anchor="middle" font-size="13" fill="#A65412">2-min reset</text></g>
        <path class="dl" d="${dayPath}" pathLength="1" fill="none" stroke="#142826" stroke-width="3" stroke-linejoin="round"/>
        ${day.map((d) => `<g class="dp" data-f="${(d[0] - 70) / 660}"><circle cx="${d[0]}" cy="${d[1]}" r="11" fill="${d[4] ? "#F2A04B" : "#2F7F86"}" stroke="#fff" stroke-width="3"/><text x="${d[0]}" y="430" text-anchor="middle" font-size="16" font-weight="700" fill="#142826">${d[2]}</text><text x="${d[0]}" y="452" text-anchor="middle" font-size="14" fill="#4F5D5A">${d[3]}</text></g>`).join("")}</svg>
    </div></div></section>

    <section data-sec="Ideation" class="rq-pin rq-ideas" data-pin="ideas"><div class="rq-stage"><div class="rq-in">
      <header class="rq-sh"><small>03 · Ideation & development</small><h2>Eight ideas → one thumb, one cigarette</h2></header>
      <div class="rq-sks">${SKN.map(sketch).join("")}</div>
      <div class="rq-dev2"><div class="rq-score"><h3>Concept scoring</h3>${[["A Flip-top", 20, 0], ["B Top gate", 36, 1], ["C Carousel", 24, 0]].map((r) => `<div class="sr${r[2] ? " w" : ""}"><span>${r[0]}</span><i data-v="${r[1]}"></i><b>${r[1]}</b></div>`).join("")}<p>Weighted against one-handed use, pocket size, reliability, cost and looks. B is the only one that works with either thumb.</p></div>
        <div class="rq-dim"><h3>46 × 94 × 20 mm</h3><img src="images/relinquit/dims.webp" alt="Front 46 by 94 mm, side 20 mm, top view showing 13 mm slider travel">
          <p>Narrower than a pack (56 mm), sized for a 5th-percentile female hand.</p></div></div>
    </div></div></section>

    <section data-sec="How it works" class="rq-pin rq-works" data-pin="works"><div class="rq-stage"><div class="rq-in">
      <header class="rq-sh"><small>How it works</small><h2>Glance. Slide. Take one. Rest.</h2></header>
      <div class="rq-wgrid"><div class="rq-wc"><div class="stp" data-s="0"><div class="rq-prod"><img class="a" src="images/relinquit/rest.webp" alt="The case closed, showing the countdown to the next cigarette"><img class="b" src="images/relinquit/open.webp" alt="The same case with the slider moved and one cigarette ready"><i class="ring"></i></div></div></div>
        <ol class="rq-wl">${[["Glance", "The always-on screen shows what is left today."], ["Slide", "One thumb moves the gate; either hand works."], ["Take one", "A single cigarette rises and is counted."], ["Rest", "The gate holds shut until the next slot, with a countdown."]].map((r, i) => `<li data-i="${i}"><b>${i + 1}</b><div><h3>${r[0]}</h3><p>${r[1]}</p></div></li>`).join("")}</ol></div>
      <p class="rq-mech">Spring magazine pushes the stack up · IR beam counts each cigarette · micro-latch holds the slider until the next slot.</p>
    </div></div></section>

    <section data-sec="Initial model" class="rq-model"><header class="rq-sh"><small>04 · Initial model</small><h2>Inside, outside, and the slider that moves</h2></header>
      <div class="rq-mg"><div class="rq-mx rv" id="rqExp"><h3>Inside</h3><div class="ex">${exploded()}<ol class="lg">${PARTS.map((r, i) => `<li data-i="${i}"><b>${i + 1}</b>${r[0]}</li>`).join("")}</ol></div></div>
        <div class="rq-mr"><div class="rq-mc rv"><div class="cs" id="rqCol"><div class="cv">${COLOURS.map((c, i) => `<img class="${i === 1 ? "on" : ""}" data-i="${i}" src="images/relinquit/col-${i}.webp" alt="${c[0]} case">`).join("")}</div>
          <div class="ch" role="group" aria-label="Colourways">${COLOURS.map((c, i) => `<button type="button" class="${i === 1 ? "on" : ""}" data-i="${i}"><i style="background:${c[1]};border-color:${c[2]}"></i>${c[0]}</button>`).join("")}</div></div></div>
          <div class="rq-mb"><div class="rq-ms rv"><img src="images/relinquit/states.webp" alt="Left: closed and resting. Right: slid back with one cigarette ready"><p><span>Closed · resting</span><span>Slid back · one ready</span></p></div>
            <div class="rq-me rv"><h3>Always-on e-ink</h3><div class="es">${EINK.map((e, i) => `<div class="${i === 0 ? "on" : ""}" data-i="${i}">${eink(e)}<span>${e[0]}</span></div>`).join("")}</div><p>Shows today’s count even with a flat phone. The ring: teal = ready, amber = resting.</p></div></div></div></div></section>

    <section data-sec="The app" class="rq-app"><div class="rq-in">
      <header class="rq-sh"><small>05 · App</small><h2>Nine screens, one calm companion</h2></header>
      <div class="rq-ag"><nav class="rq-al" aria-label="App screens">${GROUPS.map((g, gi) => `<div class="g"><small>${g}</small>${SCREENS.map((s, k) => s[3] === gi ? `<button type="button" data-k="${k}">${esc(s[1])}</button>` : "").join("")}</div>`).join("")}</nav>
        <div class="rq-ap">${SCREENS.map((s, k) => `<div class="ps" data-k="${k}">${phone(k, 0.9)}</div>`).join("")}</div>
        <div class="rq-ac"><small class="ag">Set up</small><h3 class="at">Welcome</h3><p class="ad">Step down or quit now</p><div class="dots">${SCREENS.map((s, k) => `<button type="button" data-k="${k}" aria-label="${esc(s[1])}"></button>`).join("")}</div><button type="button" class="rq-walk">Walk me through it</button></div></div>
    </div></section>

    <section data-sec="" class="rq-end"><div class="ei"><p class="rq-tag w">${mark("#fff", 30)}<span>relinquit</span></p>
      <h2>Cut down with a plan. <span>Quit for good.</span></h2>
      <ol>${["One thumb slides the gate — a single cigarette rises and is counted.", "Every plan steps down to a quit date you choose.", "When the case rests, the app helps you ride out the craving."].map((t, i) => `<li><b>0${i + 1}</b><span>${t}</span></li>`).join("")}</ol>
      <p class="rq-by">Product, app and identity · Alex Denli</p></div>
      <div class="er"><img class="rq-endimg" src="images/relinquit/end.webp" alt="The Relinquit app on a phone beside the case" loading="lazy"></div></section>
    ${tail}</article>`;
  }

  /* ---- wiring ---- */
  let off = [];
  function wire() {
    off.forEach((f) => f()); off = [];
    const root = document.querySelector(".rq");
    if (!root) return;
    const $ = (s, r = root) => r.querySelector(s), $$ = (s, r = root) => Array.from(r.querySelectorAll(s));
    const vh = () => window.innerHeight;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // scale the big phone to the stage
    const fitPhones = () => {
      const h = vh();
      const big = Math.max(0.42, Math.min(1.1, (h - 400) / 868));
      $$(".rq-ap .rq-dev").forEach((d) => d.style.setProperty("--s", big.toFixed(3)));
      const e = $(".ph2"); if (e) e.style.setProperty("--s", Math.max(0.4, Math.min(0.7, (h * 0.62) / 868)).toFixed(3));
    };

    // reveal blocks as they arrive
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.2 });
      $$(".rv").forEach((n) => io.observe(n)); off.push(() => io.disconnect());
    } else $$(".rv").forEach((n) => n.classList.add("in"));

    // colour switcher, e-ink states, exploded view labels
    $$("#rqCol .ch button").forEach((b) => b.addEventListener("click", () => {
      $$("#rqCol .ch button").forEach((x) => x.classList.toggle("on", x === b));
      $$("#rqCol .cv img").forEach((x) => x.classList.toggle("on", x.dataset.i === b.dataset.i));
    }));
    $$("#rqCol .cv img").forEach((im) => im.addEventListener("click", () => $(`#rqCol .ch button[data-i="${im.dataset.i}"]`).click()));
    $$(".rq-me .es > div").forEach((d) => d.addEventListener("mouseenter", () => $$(".rq-me .es > div").forEach((x) => x.classList.toggle("on", x === d))));
    $$(".rq-mx .lg li").forEach((li) => {
      li.addEventListener("mouseenter", () => { $("#rqExp").classList.add("hl"); $(`.rq-exw .pt[data-i="${li.dataset.i}"]`).classList.add("hi"); });
      li.addEventListener("mouseleave", () => { $("#rqExp").classList.remove("hl"); $$(".rq-exw .pt.hi").forEach((n) => n.classList.remove("hi")); });
    });

    // ---- pinned scenes, driven by scroll ----
    const pins = $$(".rq-pin");
    const P = {
      prob(el, p) {
        const a = seg(p, 0.03, 0.5), ln = $(".ln", el);
        ln.style.strokeDasharray = 1; ln.style.strokeDashoffset = (1 - a).toFixed(4);
        $(".ar", el).style.opacity = seg(p, 0.2, 0.55).toFixed(3);
        $$(".dt", el).forEach((d) => { d.style.opacity = a >= +d.dataset.f - 0.005 ? 1 : 0; });
        $(".end", el).style.opacity = seg(p, 0.45, 0.52);
        $$(".rq-stats > div", el).forEach((s, i) => { const t = seg(p, 0.5 + i * 0.06, 0.6 + i * 0.06); s.style.opacity = t; s.style.transform = `translateY(${((1 - t) * 18).toFixed(1)}px)`; });
        const d = seg(p, 0.5, 0.78), c1 = 2 * Math.PI * 120, c2 = 2 * Math.PI * 88;
        $(".d1", el).setAttribute("stroke-dasharray", `${(0.517 * c1 * d).toFixed(1)} ${c1.toFixed(1)}`);
        $(".d2", el).setAttribute("stroke-dasharray", `${(0.199 * c2 * d).toFixed(1)} ${c2.toFixed(1)}`);
        $(".rq-don > div", el).style.opacity = d;
        const b = seg(p, 0.7, 0.9);
        $(".b1", el).style.width = `${(22 * 11 * b).toFixed(1)}px`; $(".b2", el).style.width = `${(15.5 * 11 * b).toFixed(1)}px`;
        $(".rq-cut", el).style.opacity = seg(p, 0.66, 0.76);
        $(".so", el).style.opacity = seg(p, 0.88, 0.95);
      },
      day(el, p) {
        const a = seg(p, 0.05, 0.9), l = $(".dl", el);
        l.style.strokeDasharray = 1; l.style.strokeDashoffset = (1 - a).toFixed(4);
        $$(".dp", el).forEach((d) => { d.style.opacity = a >= +d.dataset.f - 0.01 ? 1 : 0; });
        $(".rest", el).style.opacity = seg(a, 0.52, 0.62);
      },
      ideas(el, p) {
        // cut the sketches one by one (every one except B), then bring in the scoring and the dimensions
        $$(".rq-sk", el).forEach((s) => {
          const k = +s.dataset.k, n = k === 1 ? -1 : 0, t = n < 0 ? 0 : ease(seg(p, 0.08, 0.3));
          s.style.setProperty("--cut", t.toFixed(3));
          s.style.opacity = n < 0 ? 1 : (1 - 0.72 * t).toFixed(3);
        });
        const d = seg(p, 0.38, 0.62), dv = $(".rq-dev2", el);
        dv.style.opacity = d; dv.style.transform = `translateY(${((1 - d) * 36).toFixed(1)}px)`;
        $$(".rq-score i", el).forEach((i) => { i.style.width = `${(+i.dataset.v * 8 * seg(p, 0.5, 0.8)).toFixed(0)}px`; });
      },
      works(el, p) {
        const i = Math.min(3, Math.floor(p * 3.999));
        if (el._k === i) return; el._k = i;
        $$(".rq-wl li", el).forEach((li, k) => li.classList.toggle("on", k === i));
        $(".stp", el).dataset.s = i;
      }
    };
    // app screens: click to choose; "Walk me through it" plays them by itself, then moves on to the next section
    const appEl = $(".rq-app"), walk = $(".rq-walk");
    let cur = -1, timer = 0;
    const show = (k) => {
      if (k === cur) return; cur = k;
      $$(".ps", appEl).forEach((s, i) => { s.classList.toggle("on", i === k); s.classList.toggle("past", i < k); });
      $$(".rq-al button", appEl).forEach((b) => b.classList.toggle("on", +b.dataset.k === k));
      $$(".dots button", appEl).forEach((d) => d.classList.toggle("on", +d.dataset.k === k));
      $(".ag", appEl).textContent = GROUPS[SCREENS[k][3]]; $(".at", appEl).textContent = SCREENS[k][1]; $(".ad", appEl).textContent = SCREENS[k][2];
    };
    const stopWalk = () => { if (timer) { clearInterval(timer); timer = 0; } walk.classList.remove("go"); walk.textContent = "Walk me through it"; };
    $$(".rq-al button, .dots button", appEl).forEach((b) => b.addEventListener("click", () => { stopWalk(); show(+b.dataset.k); }));
    walk.addEventListener("click", () => {
      if (timer) return stopWalk();
      walk.classList.add("go"); walk.textContent = "Pause";
      let k = cur >= SCREENS.length - 1 ? 0 : cur + (cur < 0 ? 1 : 0); show(Math.max(0, k));
      timer = setInterval(() => {
        if (cur >= SCREENS.length - 1) { stopWalk(); const nx = $(".rq-end"); if (nx) nx.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
        show(cur + 1);
      }, 2400);
    });
    ["wheel", "touchstart", "keydown"].forEach((ev) => { addEventListener(ev, stopWalk, { passive: true }); off.push(() => removeEventListener(ev, stopWalk)); });
    off.push(stopWalk);
    show(0);
    // floating project title + current section
    const fix = $(".rq-fix"), secs = $$("section[data-sec]");
    const label = () => {
      const h = vh(); let cur = null;
      secs.forEach((s) => { const r = s.getBoundingClientRect(); if (r.top < h * 0.45 && r.bottom > h * 0.45) cur = s; });
      const show = cur && cur.dataset.sec !== "" && cur.dataset.sec !== "Overview";
      fix.classList.toggle("on", !!show); if (show) fix.lastElementChild.textContent = cur.dataset.sec;
    };
    let raf = 0;
    const tick = () => {
      raf = 0;
      if (!root.isConnected) { off.forEach((f) => f()); off = []; return; }
      const h = vh();
      label();
      pins.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -h || r.top > h * 2) return;
        const sp = el.dataset.pin === "app" ? 1 : 1.2;
        P[el.dataset.pin](el, reduce ? 1 : cl(sp * -r.top / Math.max(1, r.height - h)));
      });
    };
    const q = () => { if (!raf) raf = requestAnimationFrame(tick); };
    addEventListener("scroll", q, { passive: true }); addEventListener("resize", q); addEventListener("resize", fitPhones);
    off.push(() => { removeEventListener("scroll", q); removeEventListener("resize", q); removeEventListener("resize", fitPhones); cancelAnimationFrame(raf); });
    fitPhones(); tick(); setTimeout(tick, 150);
  }

  window.RELINQUIT = { render, wire };
})();
