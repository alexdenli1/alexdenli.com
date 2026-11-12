/* Alex Denli — site behaviour. Content lives in data.js; nothing here needs editing to add work. */
(() => {
  const S = window.SITE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const view = $("#view"), nav = $("#nav"), flag = $("#flag"), curtain = $("#curtain"),
        curtainLabel = $("#curtain-label"), cursor = $("#cursor"), peek = $("#peek");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const wide = () => innerWidth > 820;
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const cat = (id) => S.categories.find((c) => c.id === id) || { id, label: id };
  const link = (p) => "#/project/" + p.slug;
  const found = new Set();
  let instant = false, seenGate = false, mx = innerWidth / 2, my = innerHeight / 2, queued = false, live = {};

  /* ---------- Page builders ---------- */
  const foot = () => `<footer class="site-foot"><span>© ${new Date().getFullYear()} ${esc(S.owner.name)}, ${esc(S.owner.location)}</span>
    <a class="ul" href="mailto:${esc(S.owner.email)}">${esc(S.owner.email)}</a><a class="ul" href="#" data-top>Back to top</a></footer>`;

  // Scatter pattern for the home page. New projects drop into the next slot automatically.
  // Home layout: every image is the same size and shape (set in style.css) and evenly spaced down the page.
  // Only the left edge varies: x = left edge (% of width), s = drift speed (the same for all, so gaps stay even),
  // v = where the title sits beside the image.
  // The title goes on whichever side of the image has more room.
  const RIGHT_EDGE = 84, PIECE_W = 52;
  const SLOTS = [
    { x: 3, s: .03, v: "bot" }, { x: 31, s: .03, v: "top" }, { x: 7, s: .03, v: "mid" }, { x: 27, s: .03, v: "bot" },
    { x: 4, s: .03, v: "top" }, { x: 30, s: .03, v: "mid" }, { x: 8, s: .03, v: "bot" }, { x: 28, s: .03, v: "top" }
  ];
  const ZAP = `<svg class="zap" aria-hidden="true"><rect width="100%" height="100%" pathLength="1"/><rect width="100%" height="100%" pathLength="1"/></svg>`;

  function home() {
    const n = S.projects.length;
    const pieces = S.projects.map((p, i) => {
      const t = SLOTS[i % SLOTS.length], roomL = t.x, roomR = RIGHT_EDGE - (t.x + PIECE_W), side = roomR >= roomL ? "right" : "left";
      return `<a class="piece${p.hidden ? " lost" : ""}${found.has(p.slug) ? " got" : ""}" href="${link(p)}" data-slug="${esc(p.slug)}"
        data-title="${esc(p.title)}" data-speed="${t.s}" style="left:${t.x}%;--i:${i}">
        <span class="piece-in"><img src="${esc(p.hero)}" alt="${esc(p.title)}" loading="${i < 2 ? "eager" : "lazy"}">${ZAP}
          <span class="piece-title giant t-${side} v-${t.v}" style="width:${Math.max(roomL, roomR) - 4}vw">${esc(p.title)}</span></span>
        <span class="piece-cap">${esc(p.title)}<small>${esc(cat(p.category).label)}, ${esc(p.year)}</small></span></a>`;
    }).join("");
    const index = S.projects.map((p) => `<li><a href="${link(p)}" data-slug="${esc(p.slug)}" class="${p.hidden ? "lost" : ""}${found.has(p.slug) ? " got" : ""}">
      <b>${p.hidden && !found.has(p.slug) ? "·····" : esc(p.title)}</b></a></li>`).join("");
    return {
      title: "", label: "Back home", scroll: 0,
      html: `${seenGate ? "" : `<section class="gate" aria-label="Introduction"><h1 class="gate-mark"><svg class="logo" viewBox="0 0 64.91 16.89" role="img" aria-label="Alex Denli Archive"><use href="#logo"/></svg></h1>
        <canvas class="disco-lights" aria-hidden="true"></canvas>
        <canvas class="gate-fx" aria-hidden="true"></canvas><div class="gate-fall"></div>
        <button class="disco-btn" type="button" aria-pressed="false" aria-label="Play the disco catch game" title="Disco mode">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5v3.2"/><circle cx="12" cy="13.2" r="8.3"/><ellipse cx="12" cy="13.2" rx="8.3" ry="3.1"/><ellipse cx="12" cy="13.2" rx="3.4" ry="8.3"/><path d="M4.6 9.4h14.8M4.6 17h14.8M20 2.2v3M18.5 3.7h3"/></svg></button>
        <div class="disco-hud" hidden><span>Caught <b class="disco-score">0</b></span><span class="disco-time">20</span></div>
        <div class="disco-end" hidden><p>Time</p><p class="giant"><span class="disco-final">0</span> caught</p><p class="disco-of"></p>
          <div class="disco-acts"><button class="btn" type="button" data-again>Play again</button><button class="btn" type="button" data-enter>Enter the site</button></div></div></section>`}
      <section class="field" style="--n:${n}" aria-label="All work">
        <nav class="field-index" aria-label="Projects"><ol>${index}</ol></nav>
        ${pieces}
      </section>
      <section class="gallery" aria-label="Gallery of all work"><div class="gallery-pin">
        <h2 class="gallery-head">Let’s explore and discover more</h2>
        <div class="gallery-track">${(S.gallery || []).map((g) => { const p = S.projects.find((x) => x.slug === g.project);
          const im = `<img src="${esc(g.src)}" alt="${esc(g.caption || (p ? p.title : ""))}" loading="lazy" draggable="false">`;
          return p ? `<a href="${link(p)}">${im}<span>${esc(g.caption || p.title)}</span></a>` : `<span class="gallery-item">${im}${g.caption ? `<span>${esc(g.caption)}</span>` : ""}</span>`; }).join("")}</div>
      </div></section>
      <section class="home-end">
        <a class="giant" href="#/projects">Projects</a><a class="giant" href="#/archive">Archive</a><a class="giant" href="#/contact">Contact</a></section>${foot()}`,
    };
  }

  // Category links shown at the top of the Projects, Archive and category pages.
  const cats = (active) => `<nav class="cats" aria-label="Work by category">${S.categories.map((c) =>
    `<a href="#/work/${esc(c.id)}"${c.id === active ? ' aria-current="page"' : ""}>${esc(c.label)}</a>`).join("")}</nav>`;

  function work(id) {
    const c = S.categories.find((x) => x.id === id);
    if (!c) return null;
    const list = S.projects.filter((p) => p.category === id);
    const rows = list.map((p) => `<a class="row" href="${link(p)}" ><span class="row-img"><img src="${esc(p.hero)}" alt="" loading="lazy"></span>
      <span class="row-txt"><h2>${esc(p.title)}</h2><span class="small">${esc(p.summary)} ${esc(p.year)}.</span></span></a>`).join("");
    return { title: c.label, label: c.label, html: `<div class="page"><header class="page-head"><h1 class="giant">${esc(c.label)}</h1>
      <p class="small">${list.length} project${list.length === 1 ? "" : "s"}</p>${cats(id)}</header>
      ${list.length ? `<div class="rows">${rows}</div>` : `<p class="empty">Nothing here yet. Add a project with this category in data.js and it appears on this page.</p>`}${foot()}</div>` };
  }

  const fig = (src, cls = "", cap = "") => `<figure class="b-img ${cls}" style="margin-bottom:0;margin-inline-start:${cls === "right" ? "auto" : ""}"><div class="mask"><img src="${esc(src)}" alt="${esc(cap)}" loading="lazy"></div>${cap ? `<figcaption class="small">${esc(cap)}</figcaption>` : ""}</figure>`;
  const BLOCK = {
    statement: (b) => `<p class="statement" data-scrub>${esc(b.text).split(/\s+/).map((w) => `<span>${w}</span>`).join(" ")}</p>`,
    text: (b) => `<div class="b-text">${b.heading ? `<h2>${esc(b.heading)}</h2>` : ""}<p>${esc(b.text)}</p></div>`,
    image: (b) => fig(b.src, ["full", "wide", "left", "right"].includes(b.size) ? b.size : "wide", b.caption),
    pair: (b) => `<div class="b-pair">${(b.images || []).slice(0, 2).map((s) => `<div class="mask"><img src="${esc(s)}" alt="" loading="lazy"></div>`).join("")}</div>`,
    stats: (b) => `<dl class="b-stats" style="margin-bottom:0">${(b.items || []).map((s) => `<div><dt class="small" style="order:2"><span>${esc(s.label)}</span></dt><dd style="margin:0"><strong>${esc(s.value)}</strong></dd></div>`).join("")}</dl>`,
    steps: (b) => `<ol class="b-steps">${(b.items || []).map((s) => `<li><div class="step-txt"><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div>${s.src ? `<div class="mask"><img src="${esc(s.src)}" alt="" loading="lazy"></div>` : ""}</li>`).join("")}</ol>`
  };

  function project(slug) {
    const i = S.projects.findIndex((p) => p.slug === slug);
    if (i < 0) return null;
    const p = S.projects[i], c = cat(p.category), next = S.projects[(i + 1) % S.projects.length];
    found.add(p.slug);
    return { title: p.title, label: p.title, html: `<article class="page"><header class="p-head">
        <p class="p-meta small"><a class="ul" href="#/work/${esc(c.id)}">${esc(c.label)}</a><span>${esc(p.year)}</span><span>${p.status === "current" ? "In progress" : "Completed"}</span></p>
        <h1 class="giant">${esc(p.title)}</h1><p class="p-sum">${esc(p.summary)}</p></header>
      <div class="p-hero mask"><img src="${esc(p.hero)}" alt="${esc(p.title)}"></div>
      <div class="blocks">${(p.blocks || []).map((b) => (BLOCK[b.type] ? BLOCK[b.type](b) : "")).join("")}</div>
      <a class="p-next" href="${link(next)}" ><small>Next project</small><span class="giant">${esc(next.title)}</span><img src="${esc(next.hero)}" alt=""></a>
      <nav class="p-exits" aria-label="Where next"><a class="ul" href="#/">Back home</a><a class="ul" href="#/work/${esc(c.id)}">More ${esc(c.label.toLowerCase())}</a><a class="ul" href="#/archive">Archive</a></nav>${foot()}</article>` };
  }

  const fmt = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  function now() {
    const cur = S.projects.filter((p) => p.status === "current");
    const log = [...S.log].sort((a, b) => (a.date < b.date ? 1 : -1)).map((e) => {
      const p = S.projects.find((x) => x.slug === e.project);
      return `<li><time datetime="${esc(e.date)}">${fmt(e.date)}</time><div><h3>${esc(e.title)}</h3><p>${esc(e.note)}</p>
        ${p ? `<p class="small" style="margin-top:.5rem"><a class="ul" href="${link(p)}">See ${esc(p.title)}</a></p>` : ""}</div>${e.image ? `<img src="${esc(e.image)}" alt="" loading="lazy">` : "<span></span>"}</li>`;
    }).join("");
    return { title: "Projects", label: "Projects", html: `<div class="page"><header class="page-head"><h1 class="giant">Projects</h1><p class="small">What I am working on now, and a running log of progress.</p>${cats()}</header>
      <h2 class="sub">Current projects</h2><div class="current">${cur.map((p) => `<a href="${link(p)}" ><img src="${esc(p.hero)}" alt="" loading="lazy"><b>${esc(p.title)}</b><span class="small">${esc(cat(p.category).label)}</span></a>`).join("")}</div>
      <h2 class="sub">Log</h2><ol class="log">${log}</ol>${foot()}</div>` };
  }

  function archive() {
    const list = S.projects.filter((p) => p.status !== "current").sort((a, b) => b.year - a.year);
    return { title: "Archive", label: "Archive", html: `<div class="page"><header class="page-head"><h1 class="giant">Archive</h1><p class="small">${list.length} finished projects, newest first.</p>${cats()}</header>
      <ol class="arch">${list.map((p) => `<li><a href="${link(p)}" data-peek="${esc(p.hero)}"><small class="small">${esc(p.year)}</small><b>${esc(p.title)}</b><small class="small">${esc(cat(p.category).label)}</small></a></li>`).join("")}</ol>${foot()}</div>` };
  }

  function contact() {
    const o = S.owner;
    return { title: "Contact", label: "Contact", html: `<div class="page"><header class="page-head"><h1 class="small" style="font-size:1.0625rem;font-weight:400">Contact and about</h1></header>
      <a class="mail" href="mailto:${esc(o.email)}">${esc(o.email)}</a>
      <div class="about"><div class="about-txt"><p>${esc(o.intro)}</p>${o.about.map((t) => `<p class="small" style="font-size:1.0625rem">${esc(t)}</p>`).join("")}</div>
      <div class="about-links">${o.links.map((l) => `<a class="ul" href="${esc(l.url)}">${esc(l.label)}</a>`).join("")}<span class="small" style="margin-top:1rem">Based in ${esc(o.location)}</span></div></div>${foot()}</div>` };
  }

  const lost = () => ({ title: "Out of bounds", label: "Out of bounds", bare: true, html: `<div class="lost-page"><h1 class="giant">Out of bounds</h1>
    <p>This page is not on the course. Take a drop and carry on from the clubhouse.</p><a class="ul" href="#/">Back home</a></div>` });

  const PAGES = { home, work, project, projects: now, archive, contact };
  function resolve() {
    const [a = "", b] = location.hash.replace(/^#\/?/, "").split("/");
    const key = a || "home";
    return { key, sub: b, page: (PAGES[key] && PAGES[key](b)) || lost() };
  }

  /* ---------- Routing with a curtain between pages ---------- */
  function show(first) {
    const { key, sub, page } = resolve();
    const swap = () => {
      view.innerHTML = page.html;
      document.title = (page.title ? page.title + " — " : "") + S.owner.name;
      $$("a[data-route]").forEach((a) => {
        const on = a.dataset.route === key || (key === "work" && a.dataset.cat === sub) ||
          (key === "project" && a.dataset.cat === (S.projects.find((p) => p.slug === sub) || {}).category);
        on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
      });
      nav.hidden = flag.hidden = !!page.bare;
      window.scrollTo(0, page.scroll || 0);
      page.after && page.after();
      bind(key);
      update();
      if (!first) view.focus({ preventScroll: true });
    };
    peek.classList.remove("on");
    if (first || reduce || instant) { instant = false; return swap(); }
    curtainLabel.textContent = page.label;
    curtain.className = "curtain cover";
    setTimeout(() => { swap(); curtain.className = "curtain leave"; setTimeout(() => (curtain.className = "curtain"), 460); }, 470);
  }

  /* ---------- Per-page wiring ---------- */
  function bind(key) {
    live.waves && live.waves.stop(); live.ro && live.ro.disconnect();
    live = {
      waves: key === "home" ? intro() : null,
      home: key === "home", mark: $(".gate-mark"), field: $(".field"),
      pieces: $$(".piece"), scrubs: $$("[data-scrub]"), masks: $$(".mask img"),
      names: $$(".field-index a"), wheel: $(".field-index ol"), active: -1,
      gallery: $(".gallery"), track: $(".gallery-track"), run: 0
    };
    const spot = (slug, on) => {
      const el = live.pieces.find((p) => p.dataset.slug === slug);
      if (!el) return;
      if (on && el.classList.contains("lost")) reveal(el);
      el.classList.toggle("on", on); live.field.classList.toggle("dim", on);
      $$(".field-index a").forEach((a) => a.classList.toggle("on", on && a.dataset.slug === slug));
    };
    live.pieces.forEach((el) => {
      el.addEventListener("mouseenter", () => spot(el.dataset.slug, true));
      el.addEventListener("mouseleave", () => spot(el.dataset.slug, false));
      el.addEventListener("focus", () => reveal(el));
    });
    $$(".field-index a").forEach((a) => {
      a.addEventListener("mouseenter", () => spot(a.dataset.slug, true));
      a.addEventListener("mouseleave", () => spot(a.dataset.slug, false));
      a.addEventListener("focus", () => spot(a.dataset.slug, true));
      a.addEventListener("blur", () => spot(a.dataset.slug, false));
    });
    // gallery strip: the section is made tall enough that scrolling through it slides the strip fully to the left
    // (the strip moves 1.8x as fast as the scroll, so a long gallery doesn't take forever to get through)
    if (live.gallery && !reduce) {
      const fit = () => { if (!live.track) return; live.run = Math.max(0, live.track.scrollWidth - innerWidth); live.gallery.style.height = `calc(100vh + ${live.run / 1.8}px)`; queue(); };
      live.fit = fit; fit();
      if (window.ResizeObserver) { live.ro = new ResizeObserver(fit); live.ro.observe(live.track); }
      else $$("img", live.track).forEach((im) => im.addEventListener("load", fit));
    }
    $$("[data-top]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); scrollTo({ top: live.mark ? innerHeight : 0, behavior: reduce ? "auto" : "smooth" }); }));
    $$("[data-peek]").forEach((a) => {
      a.addEventListener("mouseenter", () => { peek.src = a.dataset.peek; peek.classList.add("on"); });
      a.addEventListener("mouseleave", () => peek.classList.remove("on"));
    });
  }

  function reveal(el) {
    if (el.classList.contains("got")) return;
    el.classList.add("got"); found.add(el.dataset.slug);
    const a = $(`.field-index a[data-slug="${el.dataset.slug}"]`);
    if (a) { a.classList.add("got"); a.firstElementChild.textContent = el.dataset.title; }
  }

  /* ---------- Scroll and pointer motion ---------- */
  function update() {
    queued = false;
    const y = scrollY, vh = innerHeight;
    if (live.mark) {
      const p = Math.min(1, y / vh);
      if (!reduce) live.mark.style.transform = `scale(${1 + p * 0.9})`;
      live.mark.style.opacity = String(1 - p * 1.15);
    }
    nav.classList.toggle("nav-away", !!live.mark && y < vh * 0.85);
    flag.classList.toggle("flag-away", live.home && y < vh * (live.mark ? 1.5 : 0.5));
    const big = wide();
    let near = -1, best = 1e9, n = 0;
    for (const el of live.pieces || []) {
      const r = el.getBoundingClientRect(), off0 = Math.abs(r.top + r.height / 2 - vh / 2), k = n++;
      if (off0 < best) { best = off0; near = k; }
      if (r.bottom < -vh || r.top > vh * 2) continue;
      if (big && !reduce) {
        const off = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.speed);
        const drift = parseFloat(el.dataset.speed) * 4;
        el.firstElementChild.style.transform = `translate3d(${((mx / innerWidth) - .5) * 60 * drift}px, ${off + ((my / vh) - .5) * 40 * drift}px, 0)`;
      }
      if (el.classList.contains("lost") && !el.classList.contains("got")) {
        if (fine && big) {
          const dx = Math.max(r.left - mx, 0, mx - r.right), dy = Math.max(r.top - my, 0, my - r.bottom);
          if (Math.hypot(dx, dy) < 70) reveal(el);
        } else if (r.top < vh * 0.55 && r.bottom > vh * 0.35) reveal(el);
      }
    }
    // the project list works like a wheel: names passed are solid, the one on screen is largest
    if (big && live.wheel && near !== live.active) {
      live.active = near;
      live.names.forEach((a, i) => { a.classList.toggle("cur", i === near); a.classList.toggle("next", Math.abs(i - near) === 1); a.classList.toggle("past", i <= near); });
      const li = live.names[near].parentElement;
      live.wheel.style.transform = `translateY(${-(li.offsetTop + li.offsetHeight / 2)}px)`;
    }
    if (live.run && live.gallery) {
      const top = live.gallery.getBoundingClientRect().top;
      if (top < vh && top > -live.run - vh) live.track.style.transform = `translate3d(${-Math.max(0, Math.min(live.run, -top * 1.8))}px, 0, 0)`;
    }
    for (const el of live.scrubs || []) {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;
      const words = el.children, p = Math.max(0, Math.min(1, (vh * 0.9 - r.top) / (vh * 0.55 + r.height)));
      const lit = Math.round(p * words.length);
      for (let i = 0; i < words.length; i++) words[i].classList.toggle("lit", i < lit);
    }
    if (!reduce) for (const im of live.masks || []) {
      const r = im.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;
      const p = (r.top + r.height / 2 - vh / 2) / vh;
      im.style.transform = `scale(${1.14 - Math.min(.14, Math.abs(p) * .14)}) translate3d(0, ${p * -5}%, 0)`;
    }
  }
  /* Intro screen: project images fall down the page, tumbling as they go, with speed lines
     drawn behind them. Click one to open that project. Move the cursor to the bottom edge
     (or scroll) to enter the home page. The disco button (top right) starts a 20-second game:
     lights on, images fall faster, and the cursor becomes a basket that catches them. */
  function intro() {
    const gate = $(".gate"), cv = $(".gate-fx"), layer = $(".gate-fall");
    if (!gate || reduce) return null;
    const ctx = cv.getContext("2d"), small = () => innerWidth <= 820;
    let items = [], raf = 0, prev = 0, next = 0, order = [], W = 0, H = 0, dpr = 1, entered = -1e9;
    // disco mode: a 20-second catch game
    const btn = $(".disco-btn"), hud = $(".disco-hud"), end = $(".disco-end"), scoreEl = $(".disco-score"), timeEl = $(".disco-time");
    const NEON = ["255,43,214", "0,229,255", "255,230,0", "140,140,255", "40,255,140"];
    const BASKET = "url(\"data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44"><path d="M9 20 Q22 -2 35 20" fill="none" stroke="#000" stroke-width="5"/><path d="M9 20 Q22 -2 35 20" fill="none" stroke="#EEE9E3" stroke-width="2.5"/><path d="M4 19h36l-4.5 20h-27z" fill="#EEE9E3" stroke="#000" stroke-width="2" stroke-linejoin="round"/><path d="M6 26h32M8 33h28M14 19l2 20M22 19v20M30 19l-2 20" stroke="#000" stroke-width="1.4" fill="none"/></svg>') + "\") 22 26, grab";
    // disco beams, drawn at quarter resolution, every other frame, (they are soft, so it doesn't show) to keep things fast
    const lc = $(".disco-lights"), lx2 = lc.getContext("2d");
    const BEAMS = [[0.12, 0, -58, -4, 1.7], [0.3, 1, 34, -40, 2.3], [0.5, 2, -46, 46, 1.9], [0.5, 3, 52, -52, 2.7], [0.7, 4, -30, 42, 2.1], [0.88, 0, 6, 60, 1.5]];
    let fills = null, t0 = 0, tick = false;
    function lights(now) {
      const w = Math.round(W / 4), hh = Math.round(H / 4);
      if (lc.width !== w || lc.height !== hh) { lc.width = w; lc.height = hh; fills = null; }
      const len = H * 1.5, bw = H * 0.46, t = (now - t0) / 1000;
      if (!fills) fills = NEON.map((c) => { const g = lx2.createLinearGradient(0, 0, 0, len); g.addColorStop(0, `rgba(${c},.55)`); g.addColorStop(0.82, `rgba(${c},0)`); return g; });
      lx2.setTransform(0.25, 0, 0, 0.25, 0, 0); lx2.globalCompositeOperation = "source-over"; lx2.clearRect(0, 0, W, H);
      lx2.globalCompositeOperation = "lighter"; lx2.globalAlpha = 0.8 + 0.2 * Math.sin(t * 6.283);
      for (const [x, c, a, b, d] of BEAMS) {
        const ang = ((a + (b - a) * (0.5 - 0.5 * Math.cos((Math.PI * t) / d))) * Math.PI) / 180;
        lx2.save(); lx2.translate(x * W, -H * 0.08); lx2.rotate(ang); lx2.fillStyle = fills[c];
        lx2.beginPath(); lx2.moveTo(-bw * 0.03, 0); lx2.lineTo(bw * 0.03, 0); lx2.lineTo(bw / 2, len); lx2.lineTo(-bw / 2, len); lx2.fill(); lx2.restore();
      }
    }
    let disco = false, score = 0, total = 0, endAt = 0, px = -999, py = -999, sparks = [], shown = -1;
    const rnd = (a, b) => a + Math.random() * (b - a);
    const streaks = Array.from({ length: 28 }, () => ({ x: Math.random(), y: Math.random(), len: rnd(40, 220), v: rnd(900, 2100), a: rnd(0.05, 0.2), g: Math.random() < 0.15 }));
    // pre-drawn fading line, stretched into place each frame (much cheaper than a new gradient per line)
    const strip = (rgb) => { const c = document.createElement("canvas"); c.width = 2; c.height = 128; const g = c.getContext("2d"), gr = g.createLinearGradient(0, 0, 0, 128);
      gr.addColorStop(0, `rgba(${rgb},0)`); gr.addColorStop(1, `rgba(${rgb},1)`); g.fillStyle = gr; g.fillRect(0, 0, 2, 128); return c; };
    const INK = strip("0,0,0"), GREEN = strip("9,88,56");
    let GLOW = null;
    const line = (img, x, top, bottom, wd, al) => { if (bottom - top < 2) return; ctx.globalAlpha = al; ctx.drawImage(img, x - wd / 2, top, wd, bottom - top); };
    const size = () => { dpr = 1; W = gate.clientWidth; H = gate.clientHeight; cv.width = W * dpr; cv.height = H * dpr; };

    // Each project image is drawn once to a small bitmap. Falling images are pooled elements whose
    // movement and tumbling run as browser-driven animations, so they stay smooth even when the page is busy.
    const masters = S.projects.map(() => null), pool = S.projects.map(() => []);
    S.projects.forEach((p, i) => {
      const im = new Image(); im.decoding = "async";
      im.onload = () => {
        const r = Math.min(1.5, im.naturalHeight / (im.naturalWidth || 1)), c = document.createElement("canvas");
        c.width = 440; c.height = Math.round(440 * r);
        const sh = im.naturalWidth * r;
        c.getContext("2d").drawImage(im, 0, Math.max(0, (im.naturalHeight - sh) / 2), im.naturalWidth, Math.min(sh, im.naturalHeight), 0, 0, c.width, c.height);
        masters[i] = { c, r };
        for (let k = 0; k < 2; k++) pool[i].push(make(i));
      };
      im.src = p.hero;
    });
    function make(i) {
      const p = S.projects[i], m = masters[i], el = document.createElement("a"), c = document.createElement("canvas");
      c.width = m.c.width; c.height = m.c.height; c.getContext("2d").drawImage(m.c, 0, 0);
      el.className = "faller"; el.href = link(p); el.setAttribute("aria-label", p.title);
      const inner = document.createElement("span"); inner.className = "faller-in"; inner.appendChild(c); el.appendChild(inner);
      el.addEventListener("pointerdown", (e) => { e.preventDefault(); if (disco) return; instant = true; location.hash = link(p); });
      el.addEventListener("click", (e) => e.preventDefault());
      layer.appendChild(el);
      return el;
    }
    function release(it) {
      if (it.done) return; it.done = true;
      it.fall.onfinish = null; it.fall.cancel(); it.spin.cancel(); it.el.style.visibility = "hidden"; pool[it.i].push(it.el);
    }
    const tilt = (s) => `perspective(700px) rotateX(${rnd(25, 55) * s}deg) rotateY(${rnd(35, 65) * -s}deg) rotateZ(${rnd(6, 22) * s}deg)`;
    function spawn(now) {
      if (!order.length) order = S.projects.map((_, i) => i).sort(() => Math.random() - 0.5);
      const i = order.pop(), m = masters[i];
      if (!m) return;
      const w = (small() ? rnd(96, 150) : rnd(170, 290)) * (disco ? 0.72 : 1), h = w * m.r, fast = disco ? rnd(1.7, 2.5) : 1;
      if (disco) total++;
      const el = pool[i].pop() || make(i), v = H * rnd(0.5, 0.85) * fast, drift = disco ? rnd(-190, 190) : rnd(-40, 40);
      const x = rnd(0.04, 0.96) * (W - w), y = -h * 1.5, T = (H + h * 2.6) / v, s = Math.random() < 0.5 ? 1 : -1;
      el.style.width = w + "px"; el.style.height = h + "px"; el.style.visibility = "visible";
      const it = { el, i, w, h, x, y, v, drift, T, t0: now, ph: rnd(0, 6.28), done: false };
      it.fall = el.animate([{ transform: `translate3d(${x}px, ${y}px, 0)` }, { transform: `translate3d(${x + drift * T}px, ${y + v * T}px, 0)` }], { duration: T * 1000, easing: "linear", fill: "both" });
      it.spin = el.firstChild.animate([tilt(s), tilt(-s), tilt(s), tilt(-s)].map((t) => ({ transform: t })), { duration: T * 1000, easing: "ease-in-out", fill: "both" });
      it.fall.onfinish = () => release(it);
      items.push(it);
    }

    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - prev) / 1000 || 0); prev = now;
      if (scrollY > innerHeight * 0.9 || document.hidden) return;
      if (cv.width !== Math.round(gate.clientWidth * dpr) || cv.height !== Math.round(gate.clientHeight * dpr)) size();
      if (now > next && items.length < (disco ? 14 : 7)) { spawn(now); next = now + (disco ? rnd(110, 260) : rnd(330, 620)); }
      if (disco) {
        if ((tick = !tick)) lights(now);
        const left = Math.max(0, Math.ceil((endAt - now) / 1000));
        if (left !== shown) { shown = left; timeEl.textContent = left; }
        if (now >= endAt) finish();
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      if (!GLOW) GLOW = NEON.map(strip);
      // background: fine lines streaming down
      for (const s of streaks) {
        s.y += (s.v * dt) / H; if (s.y * H - s.len > H) { s.y = -0.05; s.x = Math.random(); }
        const y = s.y * H;
        line(disco ? GLOW[Math.floor(s.len) % 5] : s.g ? GREEN : INK, s.x * W, y - s.len, y, 1, Math.min(1, disco ? s.a * 3 : s.g ? s.a * 2.2 : s.a));
      }
      items = items.filter((it) => {
        if (it.done) return false;
        const t = (now - it.t0) / 1000, x = it.x + it.drift * t, y = it.y + it.v * t;
        if (disco && px > x - 26 && px < x + it.w + 26 && py > y - 26 && py < y + it.h + 26) {
          score++; scoreEl.textContent = score; release(it);
          for (let k = 0; k < 14; k++) { const a = rnd(0, 6.28), sp = rnd(120, 520); sparks.push({ x: px, y: py, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120, life: 1, c: NEON[k % 5] }); }
          return false;
        }
        // speed lines trailing each image
        const tail = it.v * 0.42;
        for (let k = 0; k < 4; k++) {
          const lx = x + it.w * (0.12 + 0.25 * k), top = y - tail * (0.55 + 0.45 * Math.sin(k * 2.4 + it.ph));
          line(disco ? GLOW[k] : k === 2 ? GREEN : INK, lx, top, y + it.h * 0.3, k === 2 ? 1.6 : 1, disco ? 0.7 : k === 2 ? 0.75 : 0.34);
        }
        return true;
      });
      ctx.globalAlpha = 1;
      sparks = sparks.filter((s) => {
        s.life -= dt * 1.9; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 900 * dt;
        if (s.life <= 0) return false;
        ctx.fillStyle = `rgba(${s.c},${s.life})`; ctx.beginPath(); ctx.arc(s.x, s.y, 2 + s.life * 3, 0, 6.3); ctx.fill();
        return true;
      });
    }
    const clear = () => { items.forEach(release); items = []; };
    const mode = (on) => {
      disco = on; gate.classList.toggle("disco", on); hud.hidden = !on; btn.setAttribute("aria-pressed", String(on));
      gate.style.cursor = on ? BASKET : ""; cursor.style.visibility = on ? "hidden" : ""; clear();
    };
    function start() {
      scrollTo(0, 0); score = 0; total = 0; shown = -1; sparks = []; scoreEl.textContent = "0"; end.hidden = true;
      mode(true); t0 = performance.now(); endAt = t0 + 20000;
    }
    function finish() {
      mode(false);
      $(".disco-final").textContent = score; $(".disco-of").textContent = `out of ${total} that fell`;
      end.hidden = false; $("[data-again]").focus();
    }
    btn.addEventListener("click", () => (disco ? mode(false) : start()));
    $("[data-again]").addEventListener("click", start);
    $("[data-enter]").addEventListener("click", () => { end.hidden = true; scrollTo({ top: innerHeight, behavior: "smooth" }); });
    const track = (e) => { const g = gate.getBoundingClientRect(); px = e.clientX - g.left; py = e.clientY - g.top; };
    gate.addEventListener("pointermove", track); gate.addEventListener("pointerdown", track);
    const away = () => { if (disco && scrollY > innerHeight * 0.5) mode(false); };
    addEventListener("scroll", away, { passive: true });
    // cursor reaching the bottom edge enters the home page
    const edge = (e) => {
      if (disco || !end.hidden || scrollY > 10 || e.clientY < innerHeight - 26 || e.movementY <= 0 || performance.now() - entered < 1500) return;
      entered = performance.now(); scrollTo({ top: innerHeight, behavior: "smooth" });
    };
    gate.addEventListener("mousemove", edge);
    size(); raf = requestAnimationFrame(frame);
    return { stop: () => { cancelAnimationFrame(raf); gate.removeEventListener("mousemove", edge); removeEventListener("scroll", away); clear(); cursor.style.visibility = ""; } };
  }

  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  // Entering is one-way: once the intro has been scrolled past it is removed, so the home page becomes the top.
  function enter() {
    const gate = $(".gate");
    if (!gate || scrollY < gate.offsetHeight - 1) return;
    const h = gate.offsetHeight;
    live.waves && live.waves.stop(); live.waves = null; live.mark = null; seenGate = true;
    gate.remove(); scrollTo(0, Math.max(0, scrollY - h));
  }
  addEventListener("scroll", () => { if (live.mark) enter(); queue(); }, { passive: true });
  addEventListener("resize", () => { live.fit && live.fit(); queue(); });
  addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    cursor.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    peek.style.transform = `translate3d(${Math.min(mx + 28, innerWidth - 330)}px, ${my - 110}px, 0)`;
    queue();
  }, { passive: true });

  /* ---------- Start ---------- */
  cursor.style.transform = "translate3d(-200px,-200px,0)";
  addEventListener("hashchange", () => show(false));
  show(true);
})();
