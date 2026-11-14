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

  /* ---- the case, drawn once and driven by numbers ----
     o.slide 0..1 (gate travel), o.rise 0..1 (cigarette lifted), o.ring colour, o.eink [kicker, big, small], o.body, o.cap, o.edge */
  function caseSvg(o = {}) {
    const body = o.body || "#FFFFFF", cap = o.cap || "#2F7F86", edge = o.edge || "#142826", slide = o.slide || 0, rise = o.rise || 0, ring = o.ring || "#2F7F86";
    const e = o.eink || ["TODAY", "3", "of 7 left"];
    const gx = lerp(104, 56, slide);
    const screen = e[1] === "" ? "" : `<rect x="66" y="160" width="68" height="68" rx="10" fill="#142826"/><rect x="71" y="165" width="58" height="58" rx="6" fill="#E4E3DD"/>
      <text x="100" y="181" text-anchor="middle" font-size="7" font-weight="700" letter-spacing=".9" fill="#1b1c1d" font-family="Inter,sans-serif">${esc(e[0])}</text>
      <text x="100" y="208" text-anchor="middle" font-size="${e[1].length > 2 ? 21 : 32}" font-weight="700" fill="#1b1c1d" font-family="Space Grotesk,sans-serif">${esc(e[1])}</text>
      <text x="100" y="219" text-anchor="middle" font-size="6.5" fill="#1b1c1d" font-family="Inter,sans-serif">${esc(e[2])}</text>`;
    return `<svg class="rq-case" viewBox="0 0 200 340" role="img" aria-label="The Relinquit case: a pebble-shaped body with a sliding gate on top and a small e-ink screen">
      <g style="transform:translateY(${(-56 * rise).toFixed(1)}px)"><rect x="89" y="62" width="14" height="64" rx="2" fill="#E9B07A" stroke="${edge}" stroke-width="2"/><rect x="89" y="62" width="14" height="14" rx="2" fill="#F4E4CF" stroke="${edge}" stroke-width="2"/></g>
      <rect x="40" y="86" width="120" height="236" rx="42" fill="${body}" stroke="${edge}" stroke-width="3"/>
      <path d="M40 128 100 142 160 128V128A42 42 0 0 0 118 86H82a42 42 0 0 0-42 42z" fill="${cap}" stroke="${edge}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="64" y="76" width="72" height="10" rx="5" fill="${cap}" stroke="${edge}" stroke-width="3"/>
      <rect x="${gx.toFixed(1)}" y="72" width="40" height="14" rx="7" fill="#142826"/>
      ${screen}
      <circle cx="100" cy="270" r="14" fill="none" stroke="${ring}" stroke-width="4"/><circle cx="100" cy="270" r="6" fill="${ring}"/></svg>`;
  }

  /* ---- ideation sketches (A..H) ---- */
  const SK = [
    ["A", "Flip-top", '<path d="M60 70h70v110h-70zM60 70l18-13.5h70L130 70M130 70l18-13.5v110L130 180"/><path d="M60 70q-24-50 30-66" stroke="#999"/>'],
    ["B", "Top gate", '<path d="M60 70h64v120h-64zM60 70l16.8-12.6h64L124 70M124 70l16.8-12.6v120L124 190"/><path d="M60 98l32 8 32-8"/><rect x="80" y="120" width="24" height="26" rx="3"/><circle cx="92" cy="166" r="5"/><path d="M76 54h30" stroke="#2F7F86" stroke-width="5"/><path d="M96 54v-30h8v30"/>'],
    ["C", "Carousel", '<circle cx="100" cy="120" r="64"/><circle cx="100" cy="120" r="22"/>' + [[144, 120], [136, 146], [114, 162], [86, 162], [64, 146], [56, 120], [64, 94], [86, 78], [114, 78], [136, 94]].map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="7"/>`).join("")],
    ["D", "Drawer", '<path d="M40 100h120v56H40zM40 100l24-18h120l-24 18M160 100l24-18v56l-24 18"/><path d="M160 128h36" stroke-dasharray="6 5"/>'],
    ["E", "Pebble", '<path d="M50 180q-8-100 50-110 58 10 50 110-50 26-100 0z"/><path d="M146 110l22-8"/>'],
    ["F", "Case + lighter", '<path d="M50 70h56v110H50zM50 70l14.4-10.8h56L106 70M106 70l14.4-10.8v110L106 180"/><path d="M124 110h32v70h-32zM124 110l12-9h32l-12 9M156 110l12-9v70l-12 9"/>'],
    ["G", "Home dock", '<path d="M30 190h160l-24-24H54z"/><path d="M70 70h64v90H70zM70 70l14.4-10.8h64L134 70M134 70l14.4-10.8v90L134 160"/>'],
    ["H", "Clip-on tag", '<rect x="72" y="70" width="56" height="96" rx="28"/><circle cx="100" cy="100" r="12"/><path d="M100 70v-26a9 9 0 0 1 18 0"/>']
  ];
  const sketch = (s, k) => `<figure class="rq-sk${k === 1 ? " pick" : ""}" data-k="${k}"><svg viewBox="0 0 200 210" aria-hidden="true"><g filter="url(#rqRough)" stroke="#2a2a2a" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round">${s[2]}</g></svg><figcaption>${s[0]} · ${s[1]}</figcaption><i class="x" aria-hidden="true"></i></figure>`;

  /* ---- the nine app screens: 390 x 844, built as small HTML ---- */
  const NAV = (on) => `<nav class="sn">${[["home", "Today"], ["chart", "Insights"], ["leaf", "Progress"], ["cse", "Case"]].map((n, i) => `<span class="${i === on ? "on" : ""}">${ico(n[0])}<em>${n[1]}</em></span>`).join("")}</nav>`;
  const SCR = {
    welcome: () => `<div class="sx" style="padding:92px 28px 0"><div class="sbrand"><b>${mark("#fff", 20)}</b><span>relinquit</span></div><h3 class="sbig">Cut down with a plan.<br>Quit for good.</h3><p class="sp">Relinquit spaces out your cigarettes and steps you down to a quit date you choose — with support for the moments in between.</p></div>
      <div class="sbot" style="bottom:150px"><div class="sopt on"><i>${ico("chart", 22, "#1F5F65")}</i><div><b>Step down to a quit date</b><small>2–8 weeks, fewer each week</small></div>${ico("check", 22, "#2F7F86", 2.4)}</div>
      <div class="sopt"><i class="g">${ico("leaf", 22, "#4C5E47")}</i><div><b>Quit now</b><small>Case stays locked, support stays on</small></div></div></div><div class="sbot"><button class="sbtn">${ico("arrow", 20, "#fff")}Continue</button></div>`,
    pair: () => `<header class="sh"><span class="sback">${ico("back")}</span><h3>Pair your case</h3></header><div class="sx" style="padding:20px 24px;align-items:center;text-align:center;gap:20px"><div class="spair">${caseSvg({ ring: "#5FE0D6", eink: ["", "", ""] })}</div><h4>Hold the dot for 3 seconds</h4><p class="sp" style="max-width:300px;margin:0">The light on top will pulse teal. Keep your phone close.</p><div class="sfound">${ico("bt", 22, "#1F5F65")}<div><b>Relinquit · 4F2A</b><small>Found nearby</small></div><u>Connect</u></div></div>`,
    plan: () => { const v = [12, 10, 8, 6, 4, 2, 0], l = ["Now", "W1", "W2", "W3", "W4", "W5", "W6"]; return `<header class="sh"><h3>Your plan</h3><p>Built from a week of tracking with your case</p></header><div class="sx" style="padding:8px 24px;gap:14px"><div class="scard"><div class="srow"><small class="k">Cigarettes a day</small><small style="color:#1F5F65;font-weight:600">−2 each week</small></div><div class="sbars">${v.map((n, i) => `<div><b>${n}</b><i style="height:${Math.max(2, n * 8.7)}px;${i ? "" : "background:#B9C9C8"}"></i><em>${l[i]}</em></div>`).join("")}</div></div>
      <div class="slist">${[["Quit date", "Sun 3 Jan", 1], ["Minimum gap between", "90 min"], ["Case locked overnight", "23:00 – 07:00"], ["Pack price", "£16.60"]].map((r) => `<div><span>${r[0]}</span><b${r[2] ? ' style="color:#1F5F65"' : ""}>${r[1]}</b></div>`).join("")}</div>
      <p class="sp small">Cutting down works best with a fixed quit date and support. We'll suggest your local NHS Stop Smoking Service too.</p></div><div class="sbot" style="bottom:48px"><button class="sbtn">Start plan</button></div>`; },
    today: () => { const R = 102, C = 2 * Math.PI * R, sg = (C - 7 * 6) / 7; return `<header class="sh row"><div><p>Saturday · Week 3 of 6</p><h3>Today</h3></div><span class="spill"><s></s>Case · 82%</span></header>
      <div class="sring"><svg width="220" height="220" viewBox="0 0 220 220" aria-hidden="true">${Array.from({ length: 7 }, (_, i) => `<circle cx="110" cy="110" r="${R}" fill="none" stroke="${i < 4 ? "#DCEDEE" : "#2F7F86"}" stroke-width="16" stroke-dasharray="${sg.toFixed(1)} ${C.toFixed(1)}" stroke-dashoffset="${(-i * (sg + 6)).toFixed(1)}" transform="rotate(-90 110 110)"/>`).join("")}</svg><div><b>3</b><span>of 7 left today</span></div></div>
      <div class="scard" style="margin:18px 24px 0"><div class="srow" style="justify-content:flex-start;gap:10px">${ico("clock", 20, "#1F5F65")}<span>Next one from <b>14:20</b></span><small style="margin-left:auto">in 18 min</small></div><div class="sdots">${["07:40", "10:15", "12:30", "13:05", "14:20", "&nbsp;", "&nbsp;"].map((t, i) => `<div><i class="${i < 4 ? "f" : "o"}"></i><em ${i >= 4 ? 'style="color:#1F5F65;font-weight:600"' : ""}>${t}</em></div>`).join("")}</div></div>
      <div class="sgrid"><span class="dk">${ico("wave", 20, "#fff")}<b>Craving SOS</b></span><span class="lt">${ico("coin", 20, "#4C5E47")}<b>£29.90 <small>saved this week</small></b></span></div><p class="sadd">${ico("plus", 18, "#55625F")}Log one smoked without the case</p>${NAV(0)}`; },
    resting: () => `<div class="sx warm"><header class="sh"><p style="color:#A65412;font-weight:600">Case resting</p><h3>Next one from 14:20</h3></header>
      <div class="sring w"><svg width="230" height="230" viewBox="0 0 230 230" aria-hidden="true"><circle cx="115" cy="115" r="104" fill="none" stroke="#F1DCC6" stroke-width="14"/><circle cx="115" cy="115" r="104" fill="none" stroke="#F2A04B" stroke-width="14" stroke-linecap="round" stroke-dasharray="520 654" transform="rotate(-90 115 115)"/></svg><div><b style="font-size:58px">18:42</b><span>minutes to wait</span></div></div>
      <div class="swarm"><p><b>This feeling peaks, then fades.</b></p><p>Most cravings pass within a few minutes. You've ridden out 11 this week.</p></div>
      <div class="sstack"><button class="sbtn dk">${ico("wave", 20, "#fff")}Craving SOS — 2 min reset</button><button class="sbtn lt">${ico("call", 20, "#1F5F65")}Text my quit buddy</button></div><p class="slink">Unlock early (takes 60 s, gets logged)</p></div>${NAV(0)}`,
    sos: () => `<div class="sx dark"><div class="srow" style="padding:54px 24px 0"><small style="color:#B9D9D7;font-weight:600;font-size:14px">Craving SOS</small>${ico("close", 22, "#fff")}</div>
      <div class="sbreath"><div><div><b>Breathe in</b></div></div><p class="t">1:24</p><p class="m">In for 4 · hold for 4 · out for 6</p></div>
      <div class="sbot" style="bottom:52px"><p style="color:#fff;font-size:14px;font-weight:600;margin:0 0 6px">Or try one of these</p><div class="s3">${[["mug", "Glass of water"], ["sun", "Walk 5 min"], ["call", "Call Sam"]].map((r) => `<span>${ico(r[0], 22, "#5FE0D6")}${r[1]}</span>`).join("")}</div></div></div>`,
    insights: () => { const d = [84, 96, 72, 84, 108, 84, 48], L = "MTWTFSS"; const heat = [.35, .95, .35, .08, .6, .35, .08, .6, .95, .6, .35, .08, .08, .35, .6, .95, .95, .6]; return `<header class="sh"><h3>Insights</h3><p>This week · 48 smoked · plan 56</p></header><div class="sx" style="padding:4px 24px;gap:12px"><div class="scard" style="padding:16px 16px 10px"><svg width="330" height="160" viewBox="0 0 330 160" aria-hidden="true">${d.map((h, i) => `<rect x="${10 + i * 46}" y="${136 - h}" width="30" height="${h}" rx="6" fill="${i === 4 ? "#F2A04B" : i === 6 ? "#9DC4C6" : "#2F7F86"}"/><text x="${25 + i * 46}" y="154" text-anchor="middle" font-size="11" fill="#55625F">${L[i]}</text>`).join("")}<line x1="0" y1="40" x2="330" y2="40" stroke="#142826" stroke-width="1.5" stroke-dasharray="4 4"/><text x="330" y="34" text-anchor="end" font-size="11" font-weight="600" fill="#142826">Plan 8</text></svg></div>
      <div class="scard"><small class="k">When you reach for one</small><div class="sheat">${heat.map((h) => `<i style="background:rgba(47,127,134,${h})"></i>`).join("")}</div><div class="srow" style="font-size:11px;color:#55625F;margin-top:6px"><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span></div></div>
      <div class="scard" style="padding:12px 16px 4px"><small class="k" style="display:block;padding-bottom:8px">Your top triggers</small>${[["mug", "After coffee", "31%"], ["car", "Commute", "22%"], ["friends", "With friends", "18%"], ["face", "Stressful call", "12%"]].map((r) => `<div class="strig">${ico(r[0], 20, "#1F5F65")}<span>${r[1]}</span><b>${r[2]}</b></div>`).join("")}</div></div>${NAV(1)}`; },
    progress: () => `<header class="sh"><h3>Progress</h3><p>Since you started · 19 days</p></header><div class="sx" style="padding:4px 24px;gap:12px"><div class="sgrid" style="margin:0"><div class="sk teal"><small>Money kept</small><b>£71</b><em>at 83p a cigarette</em></div><div class="sk"><small>Not smoked</small><b>86</b><em>vs your old 12 a day</em></div></div>
      <div class="scard" style="padding:14px 18px"><small class="k">After your quit date</small><p class="sp small" style="margin:6px 0 4px">Practice run: your longest gap so far is 9 h 40 m</p>${[["20 min", "Pulse rate returning to normal", 1], ["8 hours", "Oxygen levels recovering", 1], ["48 hours", "Taste and smell improving", 0], ["72 hours", "Breathing easier, more energy", 0]].map((r) => `<div class="smile"><i class="${r[2] ? "d" : ""}">${r[2] ? ico("check", 14, "#fff", 2.6) : ""}</i><div><b>${r[0]}</b><small>${r[1]}</small></div></div>`).join("")}</div>
      <div class="snhs">${ico("heart", 22, "#4C5E47")}<span>Free NHS Stop Smoking support near you</span>${ico("arrow", 20, "#4C5E47")}</div></div>${NAV(2)}`,
    case: () => `<header class="sh"><h3>Your case</h3><p>Relinquit · 4F2A · Chalk / Lagoon</p></header><div class="sx" style="padding:4px 24px;gap:12px"><div class="scard" style="display:flex;gap:18px;align-items:center;padding:18px"><div class="smini">${caseSvg({ ring: "#2F7F86", eink: ["", "", ""] })}</div><div class="scas"><div>${ico("batt", 20, "#1F5F65")}<b>82%</b><span>· about 3 weeks</span></div><div>${ico("bt", 20, "#1F5F65")}Connected</div><small>6 of 10 loaded</small><div class="sld">${Array.from({ length: 10 }, (_, i) => `<i class="${i < 6 ? "f" : ""}"></i>`).join("")}</div></div></div>
      <div class="slist ic">${[["lock", "Overnight lock", "23:00 – 07:00"], ["clock", "Minimum gap", "90 min"], ["pin", "Where I smoke (on this phone only)", "Off"], ["bell", "Nudge when a slot opens", "On"]].map((r) => `<div>${ico(r[0], 20, "#1F5F65")}<span>${r[1]}</span><b>${r[2]}</b></div>`).join("")}</div>
      <button class="sbtn ghost">${ico("pin", 20, "#1F5F65")}Find my case</button></div>${NAV(3)}`
  };
  const SCREENS = [
    ["welcome", "Welcome", "Step down or quit now", 0, "paper"], ["pair", "Pair", "Hold the dot for 3 seconds", 0, "paper"], ["plan", "Plan", "Every plan ends on a quit date", 0, "paper"],
    ["today", "Today", "What is left today, and the next slot", 1, "paper"], ["resting", "Resting", "A countdown, not a “locked” message", 1, "warm"], ["sos", "Craving SOS", "A two-minute reset for the moments in between", 1, "dark"],
    ["insights", "Insights", "Patterns and triggers, week by week", 2, "paper"], ["progress", "Progress", "Money kept and milestones after the quit date", 2, "paper"], ["case", "Case", "Battery, lock and privacy", 2, "paper"]
  ];
  const GROUPS = ["Set up", "Every day", "Over time"];
  const phone = (k, s, cls = "") => `<div class="rq-dev ${cls}" style="--s:${s}"><div class="rq-sw"><div class="rq-body"><div class="rq-scr ${SCREENS[k][4]}">${SCR[SCREENS[k][0]]()}<i class="rq-notch"></i></div></div></div></div>`;

  /* ---- exploded view (drawn) ---- */
  const PARTS = [["Cap + slider"], ["Body shell"], ["PCB"], ["Battery"], ["E-ink"], ["Lens + dot"], ["Cassette ×10"], ["Spring"]];
  const exploded = () => {
    const shapes = [
      (y) => `<path d="M30 ${y + 30}q0-30 34-30h72q34 0 34 30v10H30z" fill="#2F7F86" stroke="#142826" stroke-width="2.5"/><rect x="92" y="${y + 6}" width="48" height="12" rx="6" fill="#142826"/>`,
      (y) => `<rect x="30" y="${y}" width="170" height="52" rx="22" fill="#fff" stroke="#142826" stroke-width="2.5"/><path d="M52 ${y + 14}h126" stroke="#142826" stroke-width="1.5" opacity=".4"/>`,
      (y) => `<rect x="52" y="${y + 6}" width="126" height="34" rx="6" fill="#4C5E47" stroke="#142826" stroke-width="2"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${64 + i * 22}" y="${y + 14}" width="14" height="14" rx="2" fill="#A8B5A0"/>`).join("")}`,
      (y) => `<rect x="62" y="${y + 6}" width="106" height="32" rx="8" fill="#C98443" stroke="#142826" stroke-width="2"/><rect x="168" y="${y + 16}" width="8" height="12" rx="2" fill="#142826"/>`,
      (y) => `<rect x="76" y="${y + 2}" width="78" height="40" rx="5" fill="#142826"/><rect x="81" y="${y + 7}" width="68" height="30" rx="3" fill="#E4E3DD"/>`,
      (y) => `<ellipse cx="115" cy="${y + 22}" rx="44" ry="14" fill="none" stroke="#142826" stroke-width="2.5"/><circle cx="115" cy="${y + 22}" r="6" fill="#5FE0D6" stroke="#142826" stroke-width="2"/>`,
      (y) => `<rect x="44" y="${y}" width="142" height="48" rx="12" fill="#F4E4CF" stroke="#142826" stroke-width="2.5"/>${Array.from({ length: 10 }, (_, i) => `<circle cx="${60 + i * 12.4}" cy="${y + 24}" r="4.4" fill="#E9B07A" stroke="#142826" stroke-width="1.4"/>`).join("")}`,
      (y) => `<path d="M80 ${y + 4}h70l-70 14h70l-70 14h70" fill="none" stroke="#142826" stroke-width="3" stroke-linejoin="round"/>`
    ];
    return `<svg class="rq-exp" viewBox="0 0 230 760" role="img" aria-label="Exploded view of the case: cap and slider, body shell, circuit board, battery, e-ink screen, lens, cassette of ten cigarettes and spring">${shapes.map((f, i) => `<g class="pt" data-i="${i}" style="--d:${i * 70}ms;--y:${i * 92}px"><g>${f(10)}</g><g transform="translate(14 34)"><circle r="13" fill="#142826"/><text y="4.5" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" font-family="Inter,sans-serif">${i + 1}</text></g></g>`).join("")}</svg>`;
  };

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
    return `<article class="page rq"><svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="rqRough"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="3.5"/></filter></svg>

    <div class="rq-fix" aria-hidden="true"><b>Relinquit</b><span></span></div>
    <section class="rq-hero" data-sec="Overview"><div class="rq-hl"><p class="p-meta rq-meta"><b>Relinquit</b><span>${esc(p.year)}</span><a href="#/work/product-design">Product design</a></p>
        <h1><span>One at a time.</span><span class="t">Then none.</span></h1>
        <p class="rq-lead">${esc(p.summary)}</p><p class="rq-sc">Scroll for the story</p></div>
      <div class="rq-hr"><i class="rq-disc"></i><div class="rq-pair b">${caseSvg({ body: "#2A2C2F", cap: "#44484B", edge: "#17181A", ring: "#5FE0D6", eink: ["", "", ""] })}</div><div class="rq-pair a">${caseSvg({ body: "#E9E6DF", cap: "#2F7F86", ring: "#2F7F86", slide: .5, rise: .5 })}</div></div></section>

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
          <p class="so">${ico("arrow", 22, "#2F7F86")}So every plan ends on a quit date.</p></div>
        <p class="rq-cr"><i>${ico("clock", 26, "#5FE0D6")}</i><span><b>Cravings last a few minutes.</b>Design for the minutes in between.</span></p></div></div>
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
      <div class="rq-sks">${SK.map(sketch).join("")}</div>
      <div class="rq-dev2"><div class="rq-score"><h3>Concept scoring</h3>${[["A Flip-top", 20, 0], ["B Top gate", 36, 1], ["C Carousel", 24, 0]].map((r) => `<div class="sr${r[2] ? " w" : ""}"><span>${r[0]}</span><i data-v="${r[1]}"></i><b>${r[1]}</b></div>`).join("")}<p>Weighted against one-handed use, pocket size, reliability, cost and looks. B is the only one that works with either thumb.</p></div>
        <div class="rq-dim"><h3>46 × 94 × 20 mm</h3><svg viewBox="0 0 430 300" role="img" aria-label="Front 46 by 94 mm, side 20 mm, top view showing the slider track"><rect x="60" y="20" width="115" height="235" rx="17.5" fill="#fff" stroke="#142826" stroke-width="2"/><path d="M60 62.5 117.5 77.5 175 62.5" fill="none" stroke="#142826" stroke-width="1.5"/><rect x="78.75" y="96.25" width="77.5" height="87.5" rx="11.25" fill="none" stroke="#142826" stroke-width="1.5"/><circle cx="117.5" cy="208.75" r="11.5" fill="none" stroke="#142826" stroke-width="1.5"/>
          <g stroke="#A65412"><path d="M60 277h115M60 272v10M175 272v10M44 20v235M39 20h10M39 255h10"/></g><g font-size="14" font-weight="700" fill="#A65412"><text x="117.5" y="296" text-anchor="middle">46</text><text x="35" y="142" text-anchor="end">94</text></g>
          <rect x="225" y="20" width="50" height="235" rx="6" fill="#fff" stroke="#142826" stroke-width="2"/><path d="M225 277h50M225 272v10M275 272v10" stroke="#A65412"/><text x="250" y="296" text-anchor="middle" font-size="14" font-weight="700" fill="#A65412">20</text>
          <rect x="315" y="20" width="115" height="50" rx="6" fill="#fff" stroke="#142826" stroke-width="2"/><rect x="331" y="28" width="82" height="34" rx="17" fill="#3a3c3e" stroke="#2F7F86" stroke-width="2.5"/><rect x="370" y="31" width="42" height="27" rx="13.5" fill="#4d7276"/><path d="M362 88h-25M343 82l-6 6 6 6" stroke="#2F7F86" stroke-width="2.5" fill="none"/><text x="315" y="120" font-size="13" fill="#4F5D5A">top: slider travels 13 mm</text></svg>
          <p>Narrower than a pack (56 mm), sized for a 5th-percentile female hand.</p></div></div>
    </div></div></section>

    <section data-sec="How it works" class="rq-pin rq-works" data-pin="works"><div class="rq-stage"><div class="rq-in">
      <header class="rq-sh"><small>How it works</small><h2>Glance. Slide. Take one. Rest.</h2></header>
      <div class="rq-wgrid"><div class="rq-wc"><i class="rq-glow"></i><div class="wcase">${caseSvg({})}</div></div>
        <ol class="rq-wl">${[["Glance", "The always-on screen shows what is left today."], ["Slide", "One thumb moves the gate; either hand works."], ["Take one", "A single cigarette rises and is counted."], ["Rest", "The gate holds shut until the next slot, with a countdown."]].map((r, i) => `<li data-i="${i}"><b>${i + 1}</b><div><h3>${r[0]}</h3><p>${r[1]}</p></div></li>`).join("")}</ol></div>
      <p class="rq-mech">Spring magazine pushes the stack up · IR beam counts each cigarette · micro-latch holds the slider until the next slot.</p>
    </div></div></section>

    <section data-sec="Initial model" class="rq-model"><header class="rq-sh"><small>04 · Initial model</small><h2>Inside, outside, and the slider that moves</h2></header>
      <div class="rq-mg"><div class="rq-mx rv" id="rqExp"><h3>Inside</h3><div class="ex">${exploded()}<ol class="lg">${PARTS.map((r, i) => `<li data-i="${i}" style="--d:${i * 70}ms"><b>${i + 1}</b>${r[0]}</li>`).join("")}</ol></div></div>
        <div class="rq-mc rv"><h3>Outside</h3><div class="cs" id="rqCol"><div class="cv">${caseSvg({ body: COLOURS[1][1], cap: COLOURS[1][2], edge: COLOURS[1][4], ring: COLOURS[1][3] })}</div>
          <div class="ch" role="group" aria-label="Colourways">${COLOURS.map((c, i) => `<button type="button" class="${i === 1 ? "on" : ""}" data-i="${i}"><i style="background:${c[1]};border-color:${c[2]}"></i>${c[0]}</button>`).join("")}</div></div></div>
        <div class="rq-me rv"><h3>Always-on e-ink</h3><div class="es">${EINK.map((e, i) => `<div class="${i === 0 ? "on" : ""}" data-i="${i}">${eink(e)}<span>${e[0]}</span></div>`).join("")}</div><p>Shows today’s count even with a flat phone. The ring: teal = ready, amber = resting.</p></div></div></section>

    <section data-sec="The app" class="rq-pin rq-app" data-pin="app"><div class="rq-stage"><div class="rq-in">
      <header class="rq-sh"><small>05 · App</small><h2>Nine screens, one calm companion</h2></header>
      <div class="rq-ag"><ol class="rq-al">${GROUPS.map((g, gi) => `<li class="g"><small>${g}</small><ul>${SCREENS.map((s, k) => s[3] === gi ? `<li data-k="${k}"><b>${esc(s[1])}</b></li>` : "").join("")}</ul></li>`).join("")}</ol>
        <div class="rq-ap">${SCREENS.map((s, k) => `<div class="ps" data-k="${k}">${phone(k, 0.9)}</div>`).join("")}</div>
        <div class="rq-ac"><small class="ag">Set up</small><h3 class="at">Welcome</h3><p class="ad">Step down or quit now</p><button type="button" class="rq-walk">Walk me through it</button><div class="dots">${SCREENS.map((s, k) => `<i data-k="${k}"></i>`).join("")}</div></div></div>
    </div></div></section>

    <section data-sec="" class="rq-end"><div class="ei"><p class="rq-tag w">${mark("#fff", 30)}<span>relinquit</span></p>
      <h2>Cut down with a plan. <span>Quit for good.</span></h2>
      <ol>${["One thumb slides the gate — a single cigarette rises and is counted.", "Every plan steps down to a quit date you choose.", "When the case rests, the app helps you ride out the craving."].map((t, i) => `<li><b>0${i + 1}</b><span>${t}</span></li>`).join("")}</ol>
      <p class="rq-by">Product, app and identity · Alex Denli</p></div>
      <div class="er"><div class="rq-pair a2">${caseSvg({ body: "#E9E6DF", cap: "#2F7F86", ring: "#2F7F86" })}</div>${phone(3, 0.62, "ph2")}</div></section>
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
      const big = Math.max(0.45, Math.min(1.1, (h - 170 - 170) / 868));
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
      const c = COLOURS[+b.dataset.i];
      $$("#rqCol .ch button").forEach((x) => x.classList.toggle("on", x === b));
      $("#rqCol .cv").innerHTML = caseSvg({ body: c[1], cap: c[2], edge: c[4], ring: c[3] });
    }));
    $$(".rq-me .es > div").forEach((d) => d.addEventListener("mouseenter", () => $$(".rq-me .es > div").forEach((x) => x.classList.toggle("on", x === d))));
    $$(".rq-mx .lg li").forEach((li) => {
      li.addEventListener("mouseenter", () => { $("#rqExp").classList.add("hl"); $(`.rq-exp .pt[data-i="${li.dataset.i}"]`).classList.add("hi"); });
      li.addEventListener("mouseleave", () => { $("#rqExp").classList.remove("hl"); $$(".rq-exp .pt.hi").forEach((n) => n.classList.remove("hi")); });
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
        $(".rq-cr", el).style.opacity = seg(p, 0.92, 1);
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
        const s = p * 3.999, i = Math.min(3, Math.floor(s)), f = s - i;
        $$(".rq-wl li", el).forEach((li, k) => li.classList.toggle("on", k === i));
        let slide = 0, rise = 0, ring = "#2F7F86", e = ["TODAY", "3", "of 7 left"];
        if (i === 1) slide = ease(seg(f, 0, 0.7));
        if (i === 2) { slide = 1; rise = ease(seg(f, 0.1, 0.7)); e = ["TODAY", f < 0.4 ? "3" : "2", "of 7 left"]; }
        if (i === 3) { slide = 1 - ease(seg(f, 0, 0.35)); rise = 1 - ease(seg(f, 0, 0.35)); ring = "#F2A04B"; e = ["RESTING", "18:42", "until next"]; }
        const key = [slide.toFixed(2), rise.toFixed(2), ring, e.join()].join("|");
        if (el._k !== key) { el._k = key; $(".wcase", el).innerHTML = caseSvg({ slide, rise, ring, eink: e }); }
        $(".rq-glow", el).style.background = ring === "#F2A04B" ? "#FBEBDA" : "#DCEDEE";
      },
      app(el, p) {
        const n = SCREENS.length, k = Math.min(n - 1, Math.floor(p * n * 0.999));
        if (el._k === k) return; el._k = k;
        $$(".ps", el).forEach((s, i) => { s.classList.toggle("on", i === k); s.classList.toggle("past", i < k); });
        $$(".rq-al li[data-k]", el).forEach((l) => l.classList.toggle("on", +l.dataset.k === k));
        $$(".dots i", el).forEach((d) => d.classList.toggle("on", +d.dataset.k === k));
        $(".ag", el).textContent = GROUPS[SCREENS[k][3]]; $(".at", el).textContent = SCREENS[k][1]; $(".ad", el).textContent = SCREENS[k][2];
      }
    };
    // "Walk me through it": scroll the pinned app scene by itself, one screen at a time
    const walk = $(".rq-walk"), appEl = $(".rq-app");
    let walking = 0;
    const stopWalk = () => { if (walking) { cancelAnimationFrame(walking); walking = 0; walk.classList.remove("go"); walk.textContent = "Walk me through it"; } };
    if (walk) {
      walk.addEventListener("click", () => {
        if (walking) return stopWalk();
        const top = appEl.getBoundingClientRect().top + scrollY, span = appEl.offsetHeight - vh();
        let from = scrollY; if (from > top + span - 4 || from < top - vh()) from = top;
        const t0 = performance.now(), dur = SCREENS.length * 2300 * (1 - (from - top) / span);
        walk.classList.add("go"); walk.textContent = "Pause";
        const step = (now) => { const f = cl((now - t0) / dur); window.scrollTo(0, lerp(from, top + span, f)); if (f < 1) walking = requestAnimationFrame(step); else stopWalk(); };
        walking = requestAnimationFrame(step);
      });
      ["wheel", "touchstart", "keydown"].forEach((ev) => { addEventListener(ev, stopWalk, { passive: true }); off.push(() => removeEventListener(ev, stopWalk)); });
      off.push(stopWalk);
    }
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

  window.RELINQUIT = { render, wire, caseSvg };
})();
