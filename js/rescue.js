/* Rescue: a custom project page. A playable phone gates the story, and the rest scrolls on once it is won.
   Called from app.js (project page for slug "rescue"): RESCUE.render(project, tailHtml) then RESCUE.wire(). */
(function () {
  const I = {
    star: '<svg width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.3l-5.6 2.9 1.1-6.3L2.9 9.5l6.3-.9z"/></svg>',
    go: '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    tick: '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
    audio: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
    tv: '<path d="M8 21h8M12 17v4"/><rect x="3" y="5" width="18" height="12" rx="2"/>',
    kettle: '<path d="M6.5 10h10l1.5 10H5z"/><path d="M8.5 10V8a3 3 0 0 1 6 0v2M17 12l3-2v5l-2.5 1.5"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    world: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3.2 3.5 3.2 14.5 0 18M12 3c-3.2 3.5-3.2 14.5 0 18"/>',
    flag: '<path d="M5 21V4M5 4h12l-2.5 4 2.5 4H5"/>',
    scan: '<path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4"/><circle cx="12" cy="12" r="3"/>',
    me: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    shield: '<path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
    leaf: '<path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15"/><path d="M5 19c3-5 6-8 10-10"/>',
    drop: '<path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M9 8h6"/>',
    tap: '<circle cx="12" cy="12" r="9" stroke-dasharray="3.2 3.2"/><circle cx="12" cy="12" r="3.2"/>',
    starF: '<path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.3l-5.6 2.9 1.1-6.3L2.9 9.5l6.3-.9z"/>',
    starO: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'
  };
  const ico = (k, w = 24, c = "#10282D", sw = 2.2) => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[k]}</svg>`;
  const pip = (w = 64) => `<svg width="${w}" height="${w}" viewBox="0 0 100 100" role="img" aria-label="Pip the red panda"><circle cx="22" cy="28" r="15" fill="#FFF6E8"/><circle cx="78" cy="28" r="15" fill="#FFF6E8"/><circle cx="22" cy="28" r="10" fill="#C85A12"/><circle cx="78" cy="28" r="10" fill="#C85A12"/><ellipse cx="50" cy="56" rx="38" ry="34" fill="#F47B20"/><ellipse cx="34" cy="49" rx="11" ry="9" fill="#FFF6E8"/><ellipse cx="66" cy="49" rx="11" ry="9" fill="#FFF6E8"/><path d="M33 58c-2 7 0 13 5 17M67 58c2 7 0 13-5 17" stroke="#C85A12" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="50" cy="70" rx="16" ry="12" fill="#FFF6E8"/><circle cx="36" cy="54" r="5.5" fill="#10282D"/><circle cx="64" cy="54" r="5.5" fill="#10282D"/><circle cx="37.8" cy="52.2" r="1.8" fill="#fff"/><circle cx="65.8" cy="52.2" r="1.8" fill="#fff"/><ellipse cx="50" cy="65" rx="5.5" ry="3.8" fill="#10282D"/><path d="M44.5 72q5.5 4.5 11 0" stroke="#10282D" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>`;
  const bear = (w = 160) => `<svg width="${w}" height="${w}" viewBox="0 0 100 100" role="img" aria-label="Polar bear"><circle cx="50" cy="50" r="48" fill="#BFE6EA"/><path d="M6 66c14-6 26-2 44 0s30 2 44-2v6a48 48 0 0 1-88 0z" fill="#fff" opacity=".7"/><circle cx="29" cy="32" r="10" fill="#fff"/><circle cx="71" cy="32" r="10" fill="#fff"/><circle cx="29" cy="32" r="5" fill="#D4E4E6"/><circle cx="71" cy="32" r="5" fill="#D4E4E6"/><ellipse cx="50" cy="55" rx="30" ry="27" fill="#fff"/><ellipse cx="50" cy="65" rx="13" ry="10" fill="#EEF5F6"/><circle cx="39" cy="51" r="4" fill="#10282D"/><circle cx="61" cy="51" r="4" fill="#10282D"/><ellipse cx="50" cy="60" rx="5.5" ry="3.8" fill="#10282D"/><path d="M45 67q5 4 10 0" stroke="#10282D" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
  const stars = (() => { let s = "", r = 7; const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280); for (let i = 0; i < 26; i++) s += `<circle cx="${(rnd() * 360) | 0}" cy="${(rnd() * 300) | 0}" r="${(0.8 + rnd()).toFixed(1)}" fill="#FFF6E8" opacity="${(0.3 + rnd() * 0.5).toFixed(2)}"/>`; return `<svg class="rs-sky" width="360" height="300" aria-hidden="true">${s}</svg>`; })();
  const chip = (n) => `<span class="rs-chip">${I.star}<b>${n}</b></span>`;
  const top = (n, left) => `<div class="rs-top">${left || `<span class="rs-chip"><i class="rs-j">J</i>Josh</span>`}${chip(n)}<span class="rs-aud">${I.audio}</span></div>`;
  const tabs = (on) => `<nav class="rs-tabs">${[["world", "World"], ["flag", "Missions"], ["scan", "Scan"], ["me", "Me"]].map(([k, t]) => `<span class="rs-tab${t === on ? " on" : ""}">${ico(k === "world" ? "world" : k, 22, "currentColor")}${t}</span>`).join("")}</nav>`;
  const btn = (t, act, extra = "") => `<button class="rs-btn" ${act ? `data-act="${act}"` : "disabled"} ${extra}>${t}${I.go}</button>`;
  const card = (ic, t, pts, st, act) => `<div class="rs-card${st === "done" ? " done" : ""}${st === "next" ? " next" : ""}" ${act ? `data-act="${act}" role="button" tabindex="0"` : ""}>
    <span class="rs-ic">${ico(ic)}</span><div class="rs-ct"><b>${t}</b><small>${ico("starO", 13, "#E0A21C", 2.4)}+${pts} Rescue points</small></div>
    ${st === "done" ? `<span class="rs-go ok">${ico("tick", 20, "#10282D", 3)}</span>` : `<span class="rs-go">${ico("tick", 0)}${I.go}</span>`}</div>`;

  /* ---- screens ---- */
  const SC = {
    start: () => `${stars}${top(746)}<div class="rs-start"><div class="rs-pipbig">${pip(150)}</div><div class="rs-bub">Hi Josh! The Arctic needs us. Can you help?</div>
      <button class="rs-btn big" data-act="go">Have a go${I.go}</button></div>${tabs("Missions")}`,
    missions: (n) => `${stars}${top(n)}<div class="rs-list"><div class="rs-row"><span class="rs-h">Today's missions</span><small>1 of 3 done</small></div>
      ${card("tv", "TV off at the wall", 20, "done")}${card("kettle", "Boil just what you need", 25, "next", "pick")}${card("bulb", "Lights off in empty rooms", 20, "")}
      <div class="rs-weekly"><span class="rs-ic dim">${ico("lock", 18, "#FFF6E8")}</span><div><b>Weekly rescue</b><small>Finish today's 3 to unlock</small></div></div></div>
      <div class="rs-tip">${pip(34)}<span>Tap the glowing one</span></div>${tabs("Missions")}`,
    quiz: (n, ans) => `${stars}${top(n, `<span class="rs-aud x">${ico("flag", 0)}✕</span>`)}
      <div class="rs-pipline">${pip(64)}<div class="rs-bub l">Only boil the water you need. Less water, less energy, faster tea!</div></div>
      <div class="rs-q">How much water for one cup of tea?</div>
      <div class="rs-opts">${[["One cup", 34, 1], ["Half full", 24, 0], ["All the way", 12, 0]].map(([t, y, ok], i) => `<button class="rs-opt${ans === i ? (ok ? " ok" : " no") : ""}" data-act="ans" data-i="${i}" data-ok="${ok}"><svg width="44" height="50" viewBox="0 0 44 50" aria-hidden="true"><path d="M6 8h32l-4 38H10z" fill="#E6F3F4" stroke="#10282D" stroke-width="2.4" stroke-linejoin="round"/><path d="M${6 + (y - 8) * 0.1} ${y}H${38 - (y - 8) * 0.1}L34 46H10z" fill="#7FD0D9"/></svg><b>${t}</b>${ans === i && ok ? `<i class="rs-tickb">${ico("tick", 15, "#10282D", 3.2)}</i>` : ""}</button>`).join("")}</div>
      <div class="rs-fb ${ans === 0 ? "ok" : ans > 0 ? "no" : ""}">${ans === 0 ? I.star + " Spot on! +15 points" : ans > 0 ? "Nearly! Have another go" : ""}</div>
      ${ans === 0 ? `<button class="rs-btn wide" data-act="rescue">Rescue time!${I.go}</button>` : ""}`,
    reward: (n) => `<svg class="rs-rays" width="360" height="480" aria-hidden="true">${Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * 6.283; return `<path d="M180 190L${(180 + Math.cos(a) * 300) | 0} ${(190 + Math.sin(a) * 300) | 0}" stroke="#FFF6E8" stroke-opacity=".07" stroke-width="36"/>`; }).join("")}</svg>${stars}
      <div class="rs-won"><small>Rescue complete</small><b>You rescued<br>a polar bear!</b></div><div class="rs-bear">${bear(160)}</div><div class="rs-pipcorner">${pip(62)}</div>
      <div class="rs-pts">${I.star}+35 Rescue points</div><div class="rs-fact">${ico("bulb", 24)}<span>You saved enough energy today to light a lamp all evening.</span></div>
      <button class="rs-btn wide pos" data-act="done">Add to my world${ico("world", 18, "currentColor", 2.4)}</button>`,
    /* static ones for the core-loop strip */
    scan: () => `<div class="rs-cam"><svg width="360" height="480" viewBox="0 0 360 480" aria-hidden="true"><rect width="360" height="480" fill="#2C3D43"/><rect y="300" width="360" height="180" fill="#3A5058"/><g transform="translate(112 160)"><path d="M10 120 L22 20 H110 L122 120 Z" fill="#C9D3D6"/><path d="M110 40h22c14 0 18 18 8 28l-8 6" fill="none" stroke="#9FB0B5" stroke-width="10" stroke-linecap="round"/><rect x="34" y="4" width="64" height="18" rx="6" fill="#8EA1A7"/><rect x="0" y="116" width="132" height="14" rx="7" fill="#9FB0B5"/></g></svg></div>
      <svg class="rs-brk" width="176" height="200" viewBox="0 0 176 200" aria-hidden="true"><path d="M4 34V4h30M142 4h30v30M172 166v30h-30M34 196H4v-30" stroke="#F47B20" stroke-width="6" fill="none" stroke-linecap="round"/></svg>
      <span class="rs-chip found">${ico("tick", 16, "#10282D", 3)}Kettle found!</span>
      <div class="rs-safe">${ico("shield", 18, "#5DB65A")}<span>Grown-up nearby · Two hands on the tablet · No touching plugs</span></div>
      <div class="rs-panel">${pip(64)}<div><b>Kettles use lots of energy. Want to find out why?</b><span class="rs-btn sm">Learn with Pip${I.go}</span></div></div>`,
    world: () => `${stars}${top(746)}<div class="rs-globe"><svg width="200" height="200" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="#1F7684"/><path d="M20 30c8-8 18-6 22 2s-6 12-12 10-14 2-10-12zM56 24c10-4 20 4 18 14s-14 6-18 0-4-10 0-14zM46 62c10-4 22 2 18 12s-18 8-22 2-2-10 4-14z" fill="#5DB65A"/><path d="M30 14c6-4 14-4 20-2" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/><circle cx="50" cy="50" r="46" fill="none" stroke="#FFF6E8" stroke-opacity=".25" stroke-width="1.5"/></svg><b>62% healthy</b></div>
      <div class="rs-pipline w">${pip(58)}<div class="rs-bub l">2 missions left today. The Arctic needs us!</div></div><button class="rs-btn wide pos2">Let's go${I.go}</button>${tabs("World")}`,
    signin: () => `${stars}<div class="rs-sign"><b class="rs-logo">RESCUE</b><span class="rs-hi">Hi Josh!</span><span class="rs-sub">Tap your 3 secret pictures</span>
      <div class="rs-code"><i>${ico("sun", 26, "#10282D")}</i><i>${ico("leaf", 26, "#10282D")}</i><i class="e"></i></div>
      <div class="rs-pics">${["sun", "moon", "leaf", "drop", "heart", "starO"].map((k) => `<span>${ico(k, 30, "#10282D")}</span>`).join("")}</div></div>`,
    grown: () => `<div class="rs-gu"><small>Grown-ups</small><b>This week with Josh</b>
      ${[["9", "missions done"], ["1.4 kWh", "energy saved"], ["15 min", "daily limit"]].map(([v, l]) => `<div class="rs-stat"><b>${v}</b><span>${l}</span></div>`).join("")}
      <div class="rs-li">${ico("bulb", 18, "#FFF6E8")}<span>Things learned: standby power, boiling water</span></div><div class="rs-li">${ico("me", 18, "#FFF6E8")}<span>Class link: Ms Clarke, Year 3</span></div><div class="rs-li">${ico("tick", 18, "#5DB65A", 3)}<span>Smart meter connected</span></div></div>`
  };
  const phone = (inner, s, id, cls = "") => `<div class="rs-dev ${cls}" style="--s:${s}"${id ? ` id="${id}"` : ""}><div class="rs-sw"><div class="rs-scr"${id ? ' data-screen' : ""}>${inner}</div></div></div>`;
  const strip = (k, t, d, extra) => `<figure class="rs-step">${phone(SC[k](761, k === "quiz" ? 0 : undefined), 0.92)}<figcaption><b>${t}</b><span>${d}</span></figcaption></figure>`;

  const CHIPS = ["Habitats to heal", "Animal files", "Meet Pip", "3 daily missions", "Weekly rescue", "Friday report", "Safety check", "AR scan", "Fact + question", "Badges", "Avatar", "Class team goal"];
  const COLS = [["World", "world"], ["Missions", "flag"], ["Scan", "scan"], ["Me", "me"]];
  const START = [[8, 14, -9], [30, 8, 6], [58, 12, -5], [82, 10, 8], [14, 44, 7], [42, 38, -8], [72, 42, 5], [88, 50, -7], [10, 78, -6], [36, 84, 9], [62, 80, -4], [86, 84, 6]];

  function render(p, tail) {
    const principles = [["tap", "Big targets", "64pt and up, because small hands miss.", "var(--org)"], ["audio", "Little reading", "Pip reads everything aloud.", "var(--aqua)"], ["shield", "Safe by default", "Grown-ups are one gate away, never in the way.", "var(--leaf)"], ["starF", "Always rewarded", "There is no way to lose, only to try again.", "var(--sun)"]];
    const rules = [["Tabs, not back arrows", "Every tab is one tap away. Nothing is more than two taps deep."], ["No passwords for kids", "An avatar and three secret pictures."], ["Proof from the real world", "A smart meter, an AR scan, or a grown-up's tick."], ["A team, not a leaderboard", "The class works toward one goal."], ["A healthy stopping point", "About ten minutes a day, then Pip sleeps."]];
    return `<article class="page rs locked"><header class="p-head">
      <p class="p-meta small"><a class="ul" href="#/work/ux-ui">UX / UI</a><span>${p.year}</span><span>Completed</span></p>
      <h1 class="giant">Rescue</h1><p class="p-sum">${p.summary}</p></header>
      <div class="rs-hero"><img src="${p.hero}" alt="Rescue: the app, Pip the red panda and the world to save"></div>

      <section class="rs-brief">
        <p class="rs-q-big">How might we make saving energy at home something a seven-year-old chooses to do, every day, without a parent pushing?</p>
        <div class="rs-blk"><div class="rs-bh"><h3>Who it's for</h3><p>Three people, one habit.</p></div>
          <div class="rs-ppl">${[["J", "Josh, 7", "The player", "Wants something to do, something to win, and a reason to come back tomorrow.", "var(--org)"], ["me", "Josh's parent", "The gatekeeper", "Needs to trust what is on the screen and see that it is real.", "var(--sun)"], ["book", "Ms Clarke, Year 3", "The connector", "Turns one child's habit into something the whole class does together.", "var(--leaf)"]].map(([k, n, r, d, c]) => `<div class="rs-pc"><span class="rs-pi" style="background:${c}">${k === "J" ? "<b>J</b>" : ico(k, 44, "#10282D", 2)}</span><small>${r}</small><h4>${n}</h4><p>${d}</p></div>`).join("")}</div></div>
        <div class="rs-blk"><div class="rs-bh"><h3>Four design rules</h3><p>For children aged 6 to 11.</p></div>
          <div class="rs-rl">${principles.map(([k, t, d, c]) => `<div class="rs-ri"><span class="rs-pi s" style="background:${c}">${ico(k, 34, "#10282D", 2.2)}</span><h4>${t}</h4><p>${d}</p></div>`).join("")}</div></div>
      </section>

      <section class="rs-gate" id="rsGate" aria-label="Play Rescue">
        ${stars.replace('class="rs-sky"', 'class="rs-sky2"')}
        <div class="rs-gl"><p class="rs-eyebrow">Try it before you read about it</p><h2>Have a go.</h2><p>Play one mission. Finish it and the rest of the story opens up.</p>
          <ol class="rs-prog"><li data-s="1">Pick a mission</li><li data-s="2">Answer Pip</li><li data-s="3">Rescue the animal</li></ol></div>
        <div class="rs-gc">${phone(SC.start(), 1.7, "rsPhone", "main")}<span class="rs-pulse" aria-hidden="true"></span></div>
        <div class="rs-gr"><p>This is the real core loop: pick, do, learn, rescue. Everything on this page about Rescue came from making that loop easy enough for a seven-year-old.</p>
          <button class="rs-skip" id="rsSkip">Skip the game</button></div>
        <div class="rs-open" aria-live="polite"><b>Rescued.</b><span>Scroll on</span><i>↓</i></div>
      </section>

      <div class="rs-after">
        <section class="rs-sec rs-proc"><div class="rs-sticky"><p class="rs-eyebrow">2022 · first version</p><h2>Acting it out before building it</h2>
          <p>The first Rescue was a university project. Before any screens, I played it with people.</p>
          <div class="rs-finds"><div><b>The story was about Mum, not Josh.</b><span>So the child became the lead.</span></div><div><b>Motivation dropped without a quick reward.</b><span>So every try now earns something.</span></div><div><b>Some screens were four taps from home.</b><span>So nothing is now more than two.</span></div></div></div>
          <ol class="rs-steps">${[["Storyboard", "Josh's day, drawn out to find where energy saving could fit."], ["Bodystorming I", "Acting the app out with people and props, before any design."], ["Site map and wireframe I", "A hub with spokes: everything reached from one home screen."], ["Marvel prototype", "Clickable, so real people could try the route."], ["Bodystorming II", "Again, with the prototype's problems on the table."], ["Resulting wireframe", "The reworked flow that went into the final 2022 design."]].map(([t, d], i) => `<li><span>${i + 1}</span><div><b>${t}</b><p>${d}</p></div></li>`).join("")}</ol></section>

        <section class="rs-merge" id="rsMerge"><div class="rs-mstage">
          <div class="rs-mh"><h2 class="a">Twelve things, scattered.</h2><h2 class="b">Four places. Nothing more than two taps deep.</h2></div>
          ${COLS.map(([t, k], i) => `<div class="rs-col" data-c="${i}">${ico(k, 26, "currentColor", 2.2)}<b>${t}</b></div>`).join("")}
          ${CHIPS.map((t, i) => `<span class="rs-mc" data-i="${i}">${t}</span>`).join("")}
        </div></section>

        <section class="rs-sec rs-rules"><p class="rs-eyebrow">The 2026 rethink</p><h2>Five rules for the structure</h2>
          <ol>${rules.map(([t, d]) => `<li><b>${t}</b><span>${d}</span></li>`).join("")}</ol></section>

        <section class="rs-sec rs-loop"><p class="rs-eyebrow">The core loop</p><h2>Four steps, once a day</h2>
          <p class="rs-lead">In 2022 the AR mode, challenges and world were separate features. Now they are one loop, and every screen has one job and one big button.</p>
          <div class="rs-strip">${strip("missions", "Pick a mission", "Three a day, each with a picture, a line Pip reads aloud and a clear reward.")}${strip("scan", "Do it for real", "The action happens in the room. A safety strip stays on screen during AR.")}${strip("quiz", "Learn one thing", "One fact, one picture question. A wrong answer gets “nearly!” and a second go.")}${strip("reward", "Rescue", "Effort becomes something they can see: an animal saved and the real energy saved.")}</div>
          <dl class="rs-nums"><div><dt>~10 min</dt><dd>a day by design, then Pip says goodnight</dd></div><div><dt>1 button</dt><dd>main action per screen, always orange</dd></div><div><dt>1 tap</dt><dd>to any tab, from anywhere in the loop</dd></div><div><dt>0 ways</dt><dd>to lose. Every try earns something</dd></div></dl></section>

        <section class="rs-sec rs-sys"><p class="rs-eyebrow">Design system</p><h2>Built for small hands</h2>
          <div class="rs-sysg"><div><div class="rs-sw6">${[["#0D3B44", "Night", "Main background"], ["#1F7684", "Lagoon", "Panels, links"], ["#F47B20", "Rescue orange", "Every main action"], ["#FFC845", "Sun", "Points, rewards"], ["#5DB65A", "Leaf", "Done, correct, healthy"], ["#FFF6E8", "Cream", "Cards and text"]].map(([c, n, u]) => `<div><i style="background:${c}"></i><b>${n}</b><span>${c} · ${u}</span></div>`).join("")}</div>
            <div class="rs-contrast"><span class="o22">Let's Go</span><small>2022: white on orange, about 2.6:1</small><span class="o26">Let's go</span><small>2026: ink on orange, 5.6:1, passes AA</small></div>
            <div class="rs-type"><div><span style="font-family:'Baloo 2';font-weight:800;font-size:4.2rem;line-height:1">Rescue Aa</span><small>Baloo 2. Titles, buttons, numbers. Rounded and friendly.</small></div><div><span style="font-family:Nunito;font-weight:700;font-size:1.9rem;line-height:1.2">Only boil the water you need.</span><small>Nunito. Short lines, always read aloud by Pip.</small></div></div></div>
            <div class="rs-pipcard">${pip(190)}<b>Pip, the buddy</b><span>An original red panda who guides, narrates and celebrates. Replaces the 2022 lion so the buddy is ownable, and links to an endangered animal.</span></div></div></section>

        <section class="rs-sec rs-then"><p class="rs-eyebrow">Then and now</p><h2>Same spirit, stronger system</h2>
          <div class="rs-thg">${phone(SC.world(), 1.3, "", "")}<ol>${[["World health leads", "Josh opens the app to see his world, not a menu."], ["A next step, not a menu", "Pip names what to do now, with one button."], ["Contrast that passes", "Ink on orange and cream on night, checked."], ["Everything can be heard", "A read-aloud button in the same corner of every screen."]].map(([t, d], i) => `<li><span>${i + 1}</span><div><b>${t}</b><p>${d}</p></div></li>`).join("")}</ol></div>
          <p class="rs-note">Not yet tested with children. That is the honest next step.</p></section>

        <section class="rs-sec rs-next"><p class="rs-eyebrow">What I'd test next</p><h2>Before any of this is called finished</h2>
          <div class="rs-nxg"><div class="rs-qs">${[["Can a seven-year-old sign in alone?", "Watch children use the three-picture code with no help."], ["Do they come back the next day?", "Track whether the reward is enough, without nagging."], ["Does ten minutes feel fair?", "Check the stopping point lands with children and parents."], ["Do parents trust the grown-ups area?", "Test whether the gate and the numbers feel safe and clear."]].map(([t, d], i) => `<div><span>${i + 1}</span><b>${t}</b><p>${d}</p></div>`).join("")}</div>
          <div class="rs-two">${phone(SC.signin(), 1.05)}${phone(SC.grown(), 1.05)}</div></div></section>
        ${tail}
      </div></article>`;
  }

  /* ---- behaviour ---- */
  let off = [];
  function wire() {
    off.forEach((f) => f()); off = [];
    const root = document.querySelector(".rs"); if (!root) return;
    const ph = document.getElementById("rsPhone"), scr = ph.querySelector(".rs-scr"), prog = [...root.querySelectorAll(".rs-prog li")];
    const fit = () => { const s = Math.max(1, Math.min(2.1, (innerHeight * 0.8 - 24) / 480)); ph.style.setProperty("--s", s.toFixed(3)); };
    fit(); addEventListener("resize", fit); off.push(() => removeEventListener("resize", fit));
    let n = 746, st = "start", done = false;
    const set = (k, ans) => { st = k; scr.innerHTML = SC[k](n, ans); scr.classList.toggle("rv", k === "reward"); prog.forEach((li) => li.classList.toggle("on", +li.dataset.s <= { start: 0, missions: 1, quiz: 2, reward: 3 }[k] && true)); };
    const unlock = () => {
      if (done) return; done = true; root.classList.remove("locked"); root.classList.add("won");
      prog.forEach((li) => li.classList.add("on"));
      dispatchEvent(new Event("resize"));
      setTimeout(() => { const g = document.getElementById("rsGate"), y = g.getBoundingClientRect().bottom + scrollY - 4; scrollTo({ top: y, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }, 900);
    };
    const act = (el) => {
      const a = el.dataset.act;
      if (a === "go") set("missions");
      else if (a === "pick") set("quiz");
      else if (a === "ans") { if (el.dataset.ok === "1") { n += 15; set("quiz", 0); } else { set("quiz", +el.dataset.i); } }
      else if (a === "rescue") { n += 20; set("reward"); }
      else if (a === "done") { unlock(); }
    };
    const click = (e) => { const el = e.target.closest("[data-act]"); if (el && ph.contains(el) && !done) act(el); };
    const key = (e) => { if ((e.key === "Enter" || e.key === " ") && e.target.closest("[data-act]")) { e.preventDefault(); click(e); } };
    ph.addEventListener("click", click); ph.addEventListener("keydown", key);
    document.getElementById("rsSkip").addEventListener("click", unlock);
    set("start");

    const strip = root.querySelector(".rs-strip"), sfit = () => { if (!strip.clientWidth) return; const s = Math.max(.4, Math.min(1, ((strip.clientWidth - 3 * 32) / 4 - 24) / 360)); strip.querySelectorAll(".rs-dev").forEach((d) => d.style.setProperty("--s", s.toFixed(3))); };
    sfit(); addEventListener("resize", sfit); off.push(() => removeEventListener("resize", sfit));

    /* pulling it together: chips scatter, then gather into the four tabs as you scroll */
    const m = document.getElementById("rsMerge"), stage = m.querySelector(".rs-mstage"), chips = [...m.querySelectorAll(".rs-mc")], cols = [...m.querySelectorAll(".rs-col")];
    let W = 0, H = 0, raf = 0;
    const size = () => { const r = stage.getBoundingClientRect(); W = r.width; H = r.height; };
    const ease = (t) => t * t * (3 - 2 * t), cl = (t) => Math.max(0, Math.min(1, t));
    const tick = () => {
      raf = 0; if (!document.body.contains(m)) return;
      if (!W) size();
      const r = m.getBoundingClientRect(), p = cl(-r.top / (r.height - innerHeight)), e = ease(cl((p - 0.04) / 0.4));
      chips.forEach((c, i) => {
        const [sx, sy, rot] = START[i], col = i % 4, row = (i / 4) | 0;
        const ex = (0.14 + col * 0.24) * W, ey = (0.54 + row * 0.115) * H, x = sx / 100 * W * (1 - e) + ex * e, y = (30 + sy * 0.62) / 100 * H * (1 - e) + ey * e;
        c.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%) rotate(${(rot * (1 - e)).toFixed(1)}deg)`;
      });
      cols.forEach((c, i) => { c.style.opacity = cl((e - 0.5) * 2.2); c.style.transform = `translate(${(0.14 + i * 0.24) * W}px,${0.4 * H}px) translate(-50%,-50%)`; });
      stage.style.setProperty("--e", e.toFixed(3));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", () => { size(); onScroll(); });
    off.push(() => removeEventListener("scroll", onScroll)); size(); tick();
  }
  window.RESCUE = { render, wire };
})();
