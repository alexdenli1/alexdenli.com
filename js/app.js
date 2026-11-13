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
  let instant = false, seenGate = false, lastY = 0, mx = innerWidth / 2, my = innerHeight / 2, queued = false, live = {};

  /* ---------- Page builders ---------- */
  const foot = () => `<footer class="site-foot"><span>© ${new Date().getFullYear()} ${esc(S.owner.name)}, ${esc(S.owner.location)}</span>
    <a class="ul" href="mailto:${esc(S.owner.email)}">${esc(S.owner.email)}</a><a class="ul" href="#" data-top>Back to top</a></footer>`;

  // Scatter pattern for the home page. New projects drop into the next slot automatically.
  // Home layout: every image is the same size and shape (set in style.css) and evenly spaced down the page.
  // Only the left edge varies: x = left edge (% of width), s = drift speed (the same for all, so gaps stay even),
  // v = where the title sits beside the image.
  // The title goes on whichever side of the image has more room.
  const SLOTS = [
    { x: 3, s: .03, v: "bot" }, { x: 31, s: .03, v: "top" }, { x: 7, s: .03, v: "mid" }, { x: 27, s: .03, v: "bot" },
    { x: 4, s: .03, v: "top" }, { x: 30, s: .03, v: "mid" }, { x: 8, s: .03, v: "bot" }, { x: 28, s: .03, v: "top" }
  ];
  const ZAP = `<svg class="zap" aria-hidden="true"><rect width="100%" height="100%" pathLength="1"/><rect width="100%" height="100%" pathLength="1"/></svg>`;

  function home() {
    const n = S.projects.length;
    // Every piece: the image, then below it the name (large), the category and year, and one line about the project.
    const piece = (p, i) => {
      const t = SLOTS[i % SLOTS.length];
      return `<a class="piece${p.hidden ? " lost" : ""}${found.has(p.slug) ? " got" : ""}" href="${link(p)}" data-slug="${esc(p.slug)}"
        data-title="${esc(p.title)}" style="left:${t.x}%">
        <span class="piece-in"><span class="piece-img"><img src="${esc(p.hero)}" alt="${esc(p.title)}" loading="${i < 2 ? "eager" : "lazy"}">${ZAP}</span>
          <span class="piece-cap"><span class="piece-name">${esc(p.title)}</span><span class="piece-sub"><span class="piece-go">Let's go <i aria-hidden="true">&rarr;</i></span><span class="piece-meta">${esc(p.scope || cat(p.category).label)}, ${esc(p.year)}</span>
          <span class="piece-line">${esc(p.line || p.summary || "")}</span></span></span></span></a>`;
    };
    const slides = S.projects.map(piece).join("");
    const rows = S.projects.map((p, i) => piece(p, i).replace('loading="eager"', 'loading="lazy"')).join("");
    const index = S.projects.map((p) => `<li><a href="${link(p)}" data-slug="${esc(p.slug)}" class="${p.hidden ? "lost" : ""}${found.has(p.slug) ? " got" : ""}">
      <b>${p.hidden && !found.has(p.slug) ? "·····" : esc(p.title)}</b></a></li>`).join("");
    return {
      title: "", label: "Home", scroll: 0,
      html: `${seenGate ? "" : `<section class="gate" aria-label="Introduction"><h1 class="gate-mark"><svg class="logo" viewBox="0 0 64.91 16.89" role="img" aria-label="Alex Denli Archive"><use href="#logo"/></svg></h1>
        <canvas class="disco-lights" aria-hidden="true"></canvas>
        <canvas class="gate-fx" aria-hidden="true"></canvas><div class="gate-fall"></div>
        <button class="disco-btn" type="button" aria-pressed="false" aria-label="Play the disco catch game" title="Disco mode">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5v3.2"/><circle cx="12" cy="13.2" r="8.3"/><ellipse cx="12" cy="13.2" rx="8.3" ry="3.1"/><ellipse cx="12" cy="13.2" rx="3.4" ry="8.3"/><path d="M4.6 9.4h14.8M4.6 17h14.8M20 2.2v3M18.5 3.7h3"/></svg></button>
        <button class="mute-btn" type="button" hidden aria-pressed="false" aria-label="Mute the music" title="Music">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z"/><path class="wave" d="M15.5 9.2a4 4 0 0 1 0 5.6M18 6.8a7.5 7.5 0 0 1 0 10.4"/><path class="cross" d="M16 9.5l5 5m0-5l-5 5"/></svg></button>
        <div class="disco-hud" hidden><span>Caught <b class="disco-score">0</b></span><span class="disco-time">20</span></div>
        <div class="disco-end" hidden><p>Time</p><p class="giant"><span class="disco-final">0</span> caught</p><p class="disco-of"></p>
          <div class="disco-acts"><button class="btn" type="button" data-again>Play again</button><button class="btn" type="button" data-enter>Enter the site</button></div></div></section>`}
      <section class="lead" aria-label="Introduction">
        ${S.owner.collage ? `<div class="lead-art" aria-hidden="true"><div class="lead-frost"><canvas></canvas></div>
          <div class="lead-lens"><img src="${esc(S.owner.collage)}" alt="" decoding="async" draggable="false"></div></div>` : ""}
        <div class="lead-in"><h1 class="lead-title">${esc(S.owner.headline || "Creative Designer")}</h1>
        <ul class="lead-disc">${(S.owner.disciplines || []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>
      </section>
      ${(S.brands || []).length ? `<section class="brands" style="--n:${Math.min(12, S.brands.length)}" aria-label="Brands I have worked with"><div class="brands-pin">
        <div class="brands-head"><h2>Brands I’ve worked with</h2>
          <div class="brands-rule" aria-hidden="true"></div>
          <p class="brands-sub">Designing for, and working alongside, some of golf’s most trusted names.</p></div>
        <ul class="wheel">${S.brands.slice(0, 12).map((b) => `<li${b.size ? ` style="--lw:${b.size}"` : ""}><img src="${esc(b.logo)}" alt="${esc(b.name)}" draggable="false"></li>`).join("")}</ul>
      </div></section>` : ""}
      <div class="work" style="--n:${Math.max(1, n)}">
        <nav class="field-index" aria-label="Projects"><ol>${index}</ol></nav>
        <section class="pintro" aria-label="Projects"><div class="pintro-stage">
          <h2 class="pintro-word">Projects</h2><canvas class="pintro-cover" aria-hidden="true"></canvas><div class="pintro-dark" aria-hidden="true"></div>
          ${slides}
        </div></section>
        <section class="field" aria-label="Projects list">${rows}</section>
      </div>
      <section class="gallery" aria-label="Gallery of all work"><div class="gallery-pin">
        <h2 class="gallery-head">Let’s explore and discover more</h2>
        <div class="gallery-band"><div class="gallery-track">${(S.gallery || []).slice(0, 10).map((g) => { const p = S.projects.find((x) => x.slug === g.project);
          const im = `<img src="${esc(g.src)}" alt="${esc(p ? p.title : "")}" loading="lazy" draggable="false">`;
          return p ? `<a href="${link(p)}" aria-label="${esc(p.title)}">${im}</a>` : `<span class="gallery-item">${im}</span>`; }).join("")}</div></div>
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

  function now() {
    // Projects: key-project images fade in and out behind the page as you scroll into each category.
    const secs = S.categories.map((c) => {
      const list = S.projects.filter((p) => p.category === c.id);
      const key = list.find((p) => p.status === "current") || list[0];
      return list.length ? { c, list, key } : null;
    }).filter(Boolean);
    return { title: "Projects", label: "Projects", html: `<div class="page proj-page">
      <div class="pbg" aria-hidden="true">${secs.map((s) => `<img src="${esc(s.key.hero)}" alt="">`).join("")}</div>
      <header class="page-head"><h1 class="giant">Projects</h1><p class="small">All of the work, by category.</p></header>
      ${secs.map((s) => `<section class="pcat">
        <h2><a class="giant" href="#/work/${esc(s.c.id)}">${esc(s.c.label)}</a></h2>
        <ol>${s.list.map((p) => `<li><a href="${link(p)}"><b>${esc(p.title)}</b><span class="small">${esc(p.year)}${p.status === "current" ? " — in progress" : ""}</span></a></li>`).join("")}</ol>
      </section>`).join("")}${foot()}</div>` };
  }

  function archive() {
    // Archived work as photo cards tossed on the table: each at its own angle, straightening when picked up.
    const ANG = [-6, 4, -3, 7, -8, 2, 5, -4], DY = [0, 7, 2, 9, 4, 0, 6, 3];
    const list = S.projects.filter((p) => p.status !== "current").sort((a, b) => parseInt(b.year, 10) - parseInt(a.year, 10));
    return { title: "Archive", label: "Archive", html: `<div class="page"><header class="page-head"><h1 class="giant">Archive</h1><p class="small">${list.length} finished projects, newest first.</p>${cats()}</header>
      <ol class="cards">${list.map((p, i) => `<li style="--r:${ANG[i % ANG.length]}deg;--dy:${DY[i % DY.length]}vh"><a class="card" href="${link(p)}">
        <img src="${esc(p.hero)}" alt="" loading="lazy"><span><b>${esc(p.title)}</b><small>${esc(cat(p.category).label)}, ${esc(p.year)}</small></span><span class="card-desc">${esc(p.summary)}</span></a></li>`).join("")}</ol>${foot()}</div>` };
  }

  function contact() {
    const o = S.owner;
    return { title: "Contact & About", label: "Contact & About", html: `<div class="page"><header class="page-head"><h1 class="small" style="font-size:1.0625rem;font-weight:400">Contact &amp; About</h1></header>
      <a class="mail" href="mailto:${esc(o.email)}">${esc(o.email)}</a>
      <div class="about"><div class="about-txt"><p>${esc(o.intro)}</p>${o.about.map((t) => `<p class="small" style="font-size:1.0625rem">${esc(t)}</p>`).join("")}</div>
      <div class="about-side"><img class="about-photo" src="${esc(o.photo)}" alt="${esc(o.name)}" loading="eager">
      <div class="about-links">${o.links.map((l) => `<a class="ul" href="${esc(l.url)}">${esc(l.label)}</a>`).join("")}<span class="small" style="margin-top:1rem">Based in ${esc(o.location)}</span></div></div></div>${foot()}</div>` };
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
    if (key === "home") return swap(); // going home is instant, no transition
    const fx = "fx-sweep", dur = 520; // every other page shares the slanted sweep (see style.css)
    curtainLabel.textContent = page.label;
    curtain.className = `curtain cover ${fx}`;
    setTimeout(() => { swap(); curtain.className = `curtain leave ${fx}`; setTimeout(() => (curtain.className = "curtain"), dur); }, dur);
  }

  /* ---------- Per-page wiring ---------- */
  function bind(key) {
    live.waves && live.waves.stop(); live.ro && live.ro.disconnect();
    live = {
      waves: key === "home" ? intro() : null,
      home: key === "home", mark: $(".gate-mark"), field: $(".work"), pintro: $(".pintro"), pword: $(".pintro-word"), pdark: $(".pintro-dark"), pcover: $(".pintro-cover"),
      pfirst: $(".pintro .piece"), pindex: $(".field-index"),
      pieces: $$(".pintro .piece"), rows: $$(".field .piece"), scrubs: $$("[data-scrub]"), masks: $$(".mask img"),
      names: $$(".field-index a"), wheel: $(".field-index ol"), active: -1,
      gallery: $(".gallery"), track: $(".gallery-track"), run: 0,
      lead: $(".lead"), leadArt: $(".lead-art"), lens: $(".lead-lens"), lensImg: $(".lead-lens img"),
      brandsEl: $(".brands"), logos: $$(".wheel li"),
      secs: $$(".pcat"), bgs: $$(".pbg img"), bgOn: -1
    };
    if (key === "home") $$(".pintro .piece img, .field .piece img").forEach((im) => { im.loading = "eager"; im.decoding = "async"; im.decode && im.decode().catch(() => {}); });
    const spot = (slug, on) => {
      const els = $$(".piece").filter((p) => p.dataset.slug === slug), el = els[0];
      if (!el) return;
      if (on && el.classList.contains("lost")) reveal(el);
      els.forEach((e) => e.classList.toggle("on", on)); live.field.classList.toggle("dim", on);
      $$(".field-index a").forEach((a) => a.classList.toggle("on", on && a.dataset.slug === slug));
    };
    live.pieces.concat(live.rows).forEach((el) => {
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
    // (the strip moves 3x as fast as the scroll, so it sweeps by quickly)
    if (live.gallery && !reduce) {
      const fit = () => {
        if (!live.track) return;
        live.run = Math.max(0, live.track.scrollWidth - innerWidth);
        live.gallery.style.height = `calc(100vh + ${live.run / 3}px)`;
        live.shots = $$(".gallery-track > *").map((el) => ({ el, c: el.offsetLeft + el.offsetWidth / 2 }));
        live.span = innerWidth * 0.34;
        queue();
      };
      live.fit = fit; fit();
      if (window.ResizeObserver) { live.ro = new ResizeObserver(fit); live.ro.observe(live.track); }
      else $$("img", live.track).forEach((im) => im.addEventListener("load", fit));
    }
    // Headline: a frosted, colour-washed copy of the work collage, painted once. A round lens follows the
    // pointer showing the sharp collage, lined up with the page and slightly magnified. Moving it is
    // two transforms, so it stays smooth.
    // "Projects" word: sized so its capitals fill the screen (stretched upwards to reach the top and bottom),
    // and a grid of black squares that are lifted off in random order to dissolve it in.
    if (live.pword && wide()) {
      const cv = live.pcover, ctx = cv.getContext("2d");
      const fit = () => {
        const w = live.pword, vw = innerWidth, vh = innerHeight, k = 200;
        w.style.setProperty("--wf", k + "px"); w.style.setProperty("--wsy", "1"); w.style.setProperty("--wty", "0px");
        const rg = document.createRange(); rg.selectNodeContents(w);
        const W0 = rg.getBoundingClientRect().width;
        const m = document.createElement("canvas").getContext("2d"); m.font = `700 ${k}px Bricolage`;
        const cap = m.measureText("H"), mt = m.measureText("Hg");
        if (!W0 || !cap.actualBoundingBoxAscent) return;
        const F = k * (1.0 * vw) / W0, s = F / k, capH = cap.actualBoundingBoxAscent * s;
        const sy = (0.6 * vh) / capH;
        const fa = (mt.fontBoundingBoxAscent || k * 0.9) * s, fd = (mt.fontBoundingBoxDescent || k * 0.25) * s;
        const base = (F - (fa + fd)) / 2 + fa, off = base - capH / 2 - F / 2;
        w.style.setProperty("--wf", F.toFixed(1) + "px"); w.style.setProperty("--wsy", sy.toFixed(4));
        w.style.setProperty("--wty", (-off * sy + 34).toFixed(1) + "px");
        // fine grain: a small noise map (one cell = 3 screen pixels) that is scaled up crisply. Each cell has its own
        // moment to appear, a little earlier towards the bottom, and fades in rather than snapping, so the word
        // dissolves in like film grain instead of blocks.
        const gw = cv.width = Math.ceil(vw / 3), gh = cv.height = Math.ceil(vh / 3);
        const thr = new Float32Array(gw * gh);
        for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) thr[y * gw + x] = 0.78 * Math.random() + 0.22 * (1 - y / gh);
        const img = ctx.createImageData(gw, gh), d32 = new Uint32Array(img.data.buffer);
        live.cover = { ctx, img, d32, thr, n: gw * gh, shown: -1 };
        live.drawCover = (p) => {
          const c2 = live.cover; if (!c2) return;
          const key = Math.round(Math.max(0, Math.min(1, p)) * 600);
          if (key === c2.shown) return;
          c2.shown = key;
          const q = (key / 600) * 1.14, th = c2.thr, out = c2.d32;
          for (let i = 0; i < c2.n; i++) {
            const f = (q - th[i]) * 7;                      // 0 = still hidden, 1 = fully shown
            out[i] = (f >= 1 ? 0 : f <= 0 ? 255 : ((1 - f) * 255) | 0) << 24;
          }
          c2.ctx.putImageData(c2.img, 0, 0);
        };
        live.drawCover(0);
        queue();
      };
      live.fitWord = fit;
      (document.fonts && document.fonts.load ? document.fonts.load("700 200px Bricolage") : Promise.resolve()).then(() => { if (live.pword === $(".pintro-word")) fit(); });
    }
    if (live.leadArt) {
      paintFrost($(".lead-frost canvas"), S.owner.collage);
      const sizeLens = () => { if (!live.lensImg) return; live.lensImg.style.width = live.lead.clientWidth + "px"; live.lensImg.style.height = live.lead.clientHeight + "px"; live.lensD = live.lens.offsetWidth; };
      live.sizeLens = sizeLens; sizeLens();
      if (fine) {
        // the window's mouse listener already schedules the lens update; here we only switch it on once
        live.lead.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") live.lead.classList.add("lensing"); });
        live.lead.addEventListener("mousemove", () => { if (!live.lead.classList.contains("lensing")) live.lead.classList.add("lensing"); }, { passive: true });
        live.lead.addEventListener("pointerleave", () => live.lead.classList.remove("lensing"));
      }
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
  // a quick eased scroll (used instead of a hard jump)
  function glide(to) {
    live.glide = true;
    const from = scrollY, dist = to - from, t0 = performance.now(), dur = Math.min(520, 220 + Math.abs(dist) * 0.12);
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      scrollTo(0, from + dist * e);
      if (p < 1) requestAnimationFrame(step); else live.glide = false;
    };
    requestAnimationFrame(step);
  }
  function update() {
    queued = false;
    const y = scrollY, vh = innerHeight, big = wide();
    // Read every position first, then write. Interleaving the two forces the browser to lay the
    // page out again after each write, which is what made moving the mouse on the home page slow.
    const r0 = live.pfirst ? live.pfirst.getBoundingClientRect() : null;
    const leadR = live.leadArt ? live.lead.getBoundingClientRect() : null;
    const brandsR = live.logos && live.logos.length ? live.brandsEl.getBoundingClientRect() : null;
    const introR = live.pintro ? live.pintro.getBoundingClientRect() : null;
    const navH = brandsR ? nav.offsetHeight : 0;
    const galTop = live.run && live.gallery ? live.gallery.getBoundingClientRect().top : null;
    const secR = live.secs && live.secs.length ? live.secs.map((s) => s.getBoundingClientRect()) : null;
    const scrR = (live.scrubs || []).map((el) => el.getBoundingClientRect());
    const maskR = reduce ? [] : (live.masks || []).map((im) => im.parentElement.getBoundingClientRect());
    if (big && live.wheel && live.names && !live.nameOff) live.nameOff = live.names.map((a) => a.parentElement.offsetTop + 19);

    // ---- writes ----
    if (live.mark) {
      const p = Math.min(1, y / vh);
      if (!reduce) live.mark.style.transform = `scale(${1 + p * 0.9})`;
      live.mark.style.opacity = String(1 - p * 1.15);
    }
    // Animations play going down only. Scrolling up shows everything settled, with no reverse motion.
    if (y < lastY - 1) live.up = true; else if (y > lastY + 1) live.up = false;
    const up = !!live.up;
    nav.classList.toggle("nav-away", !!live.mark && y < vh * 0.85);
    flag.classList.toggle("flag-away", live.home && y < vh * (live.mark ? 1.5 : 0.5));
    // "Projects" intro: the word sits big on screen, a dark disc grows from its middle and swallows it,
    // and the first project grows out of that dark from nothing into its place. The scroll input is damped
    // so a quick flick still plays smoothly.
    const clamp01 = (x) => Math.max(0, Math.min(1, x));
    let grow = 1;
    if (introR && big && !reduce && !live.list) {
      const tt = clamp01(-introR.top / (1.15 * vh));
      if (live.pT === undefined || up) live.pT = tt;
      live.pT += (tt - live.pT) * 0.2;
      if (Math.abs(tt - live.pT) > 0.0005) queue(); else live.pT = tt;
      const t = live.pT, out = (x) => 1 - Math.pow(1 - x, 3), soft = (x) => x * x * (3 - 2 * x);
      grow = up ? 1 : out(clamp01((t - 0.14) / 0.5));
      if (introR.bottom > 0 && introR.top < vh) {
        // the word dissolves in, square by square, as the section rises into view
        const dis = clamp01((1 - introR.top / vh) / 0.85);
        live.pcover.style.visibility = up ? "hidden" : "";
        if (up) { live.pword.style.opacity = "0"; live.pdark.style.transform = "scale(0)"; }
        else {
          if (live.cover) live.drawCover(dis);
          live.pword.style.opacity = (0.25 + 0.75 * dis).toFixed(3);
          live.pdark.style.transform = `scale(${(1.3 * soft(clamp01((t - 0.03) / 0.3))).toFixed(4)})`;
        }
      }
      live.pindex.style.opacity = up ? "1" : clamp01((grow - 0.35) / 0.4).toFixed(3);
    }
    // Scrolling up through the projects shows them as a plain list you can scroll freely, instead of
    // stepping back through each slide. Scrolling down plays the slide showcase. The two layouts have
    // different heights, so each switch re-aims the scroll at the same project.
    if (big && !reduce && live.rows && live.rows.length && introR) {
      const N = live.pieces.length, wr = live.field.getBoundingClientRect();
      const inWork = wr.top < vh && wr.bottom > 0;
      const pw = Math.min(0.52 * innerWidth, 1.11 * vh), rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16, slideTop = (vh - pw / 1.5 - 10 * rem) / 2 + 0.02 * vh;
      if (!live.list && up && inWork && introR.top <= 0 && introR.bottom >= vh - 1) {
        const scrolled = -introR.top, sp = Math.max(0, (scrolled - 1.15 * vh) / (0.8 * vh));
        const idx = introR.bottom < vh + 1 ? N - 1 : Math.min(N - 1, Math.max(0, Math.round(sp - 0.1)));
        live.list = true; live.field.classList.add("listmode");
        const r = live.rows[idx].getBoundingClientRect();
        const to = scrollY + r.top - slideTop;
        scrollTo(0, Math.max(0, to)); lastY = scrollY; live.fix = 2; queue(); return;
      }
      if (live.list && !up) {
        const fr = $(".field", live.field).getBoundingClientRect();
        let idx = 0, best = 1e9;
        live.rows.forEach((el, k) => { const r = el.getBoundingClientRect(), d = Math.abs(r.top - slideTop); if (d < best) { best = d; idx = k; } });
        const aboveList = fr.top > 0;
        if (!aboveList && best > vh * 0.15) { /* keep scrolling the list until a project reaches the showcase spot */ }
        else {
        live.list = false; live.field.classList.remove("listmode");
        live.pT = undefined; live.sS = undefined;
        if (!aboveList) {
          const pr = live.pintro.getBoundingClientRect();
          scrollTo(0, Math.max(0, scrollY + pr.top + (1.15 + 0.8 * idx + 0.1) * vh));
        }
        lastY = scrollY; live.fix = 2; queue(); return;
        }
      }
      if (live.list) {
        // names list follows the row nearest the middle of the screen
        let near = 0, best = 1e9;
        live.rows.forEach((el, k) => { const r = el.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - vh / 2); if (d < best) { best = d; near = k; } });
        if (live.wheel && live.nameOff && near !== live.active) {
          live.active = near;
          live.names.forEach((a, i) => { a.classList.toggle("cur", i === near); a.classList.toggle("next", Math.abs(i - near) === 1); a.classList.toggle("past", i <= near); });
          live.wheel.style.transform = `translateY(${-live.nameOff[near]}px)`;
        }
        live.pindex.style.opacity = "1";
      }
    }
    // Slides: every project sits in the same spot on the pinned stage. Scrolling hands over from one to the next:
    // the picture, the name and the line each fly off in their own direction while the next project's parts
    // fly in from the edges. Directions are drawn at random per page load.
    if (big && !live.list && live.pieces && live.pieces.length && introR) {
      const N = live.pieces.length, scrolled = Math.max(0, -introR.top);
      if (live.sS === undefined) live.sS = scrolled;
      live.sS = (reduce || up) ? scrolled : live.sS + (scrolled - live.sS) * 0.18;
      if (Math.abs(scrolled - live.sS) > 0.5) queue(); else live.sS = scrolled;
      const sp = Math.max(0, (live.sS - 1.15 * vh) / (0.8 * vh));
      const idx = Math.min(N - 1, Math.floor(sp)), u = idx >= N - 1 ? 0 : sp - idx;
      let v = clamp01((u - 0.25) / 0.75);
      if (up) v = 0; else if (reduce) v = v > 0.5 ? 1 : 0;
      const ease = (x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
      if (!live.fly) {
        const D = [[-1, 0], [1, 0], [0, -1], [0, 1]], pick = () => D.slice().sort(() => Math.random() - 0.5).slice(0, 3);
        live.fly = Array.from({ length: N }, () => ({ out: pick(), in: pick() }));
        live.parts = live.pieces.map((el) => [$(".piece-img", el), $(".piece-name", el), $(".piece-sub", el)]);
      }
      const DL = [0, 0.07, 0.14], put = (k, dirs, f0, delay) => live.parts[k].forEach((part, i) => {
        if (!part) return;
        const f = (reduce || up) ? 0 : delay(f0, i);
        const d = dirs[i], x = d[0] * 0.95 * innerWidth * f, yy = d[1] * 1.1 * vh * f;
        part.style.transform = f > 0.001 ? `translate3d(${x.toFixed(1)}px, ${yy.toFixed(1)}px, 0)` : "";
        part.style.opacity = f > 0.9 ? (1 - (f - 0.9) * 10).toFixed(2) : "";
      });
      const cur = v > 0.5 ? idx + 1 : idx;
      live.pieces.forEach((el, k) => {
        const show = k === idx || (k === idx + 1 && v > 0);
        if (show !== (el.style.visibility === "visible")) el.style.visibility = show ? "visible" : "hidden";
        if (k === cur !== el.classList.contains("act")) el.classList.toggle("act", k === cur);
        if (k === idx) put(k, live.fly[idx].out, v, (vv, i) => ease(clamp01((vv - DL[i]) / 0.55)));
        else if (k === idx + 1) put(k, live.fly[idx].in, v, (vv, i) => 1 - ease(clamp01((vv - 0.3 - DL[i]) / 0.55)));
        else live.parts[k].forEach((p) => { if (p) { p.style.transform = ""; p.style.opacity = ""; } });
      });
      const first = live.pfirst.firstElementChild;
      if (!reduce) {
        const g = grow, dx = (innerWidth / 2 - (r0.left + r0.width / 2)) * (1 - g), dy = (vh / 2 - (r0.top + r0.width / 3)) * (1 - g);
        first.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(${Math.max(0.001, g).toFixed(4)})`;
        first.style.opacity = Math.min(1, g * 4).toFixed(3);
      }
      if (live.wheel && live.nameOff && cur !== live.active) {
        live.active = cur;
        live.names.forEach((a, i) => { a.classList.toggle("cur", i === cur); a.classList.toggle("next", Math.abs(i - cur) === 1); a.classList.toggle("past", i <= cur); });
        live.wheel.style.transform = `translateY(${-live.nameOff[cur]}px)`;
      }
    }
    if (leadR && leadR.bottom > 0 && leadR.top < vh) {
      if (live.lens && live.lead.classList.contains("lensing")) {
        const d = live.lensD || 400, cx = mx - leadR.left, cy = my - leadR.top, s = 1.12;
        live.lens.style.transform = `translate3d(${(cx - d / 2).toFixed(1)}px, ${(cy - d / 2).toFixed(1)}px, 0)`;
        live.lensImg.style.transform = `translate3d(${(d / 2 - cx * s).toFixed(1)}px, ${(d / 2 - cy * s).toFixed(1)}px, 0) scale(${s})`;
      }
      // the frosted art settles into place as the section rises over the intro
      const p = Math.max(0, Math.min(1, (vh - leadR.top) / vh));
      if (!reduce) live.leadArt.style.transform = p < 1 ? `scale(${(1.1 - 0.1 * p).toFixed(4)})` : "";
    }
    if (brandsR && brandsR.top < vh && brandsR.bottom > 0) {
      // Each logo zooms in from small, overshoots a touch, and settles into its slot.
      // The scroll input is damped so a fast flick still plays the sequence smoothly.
      const span = brandsR.height - (vh - navH), N = live.logos.length;
      const t = span > 0 ? Math.max(0, Math.min(1, (navH - brandsR.top) / span / 0.74)) : 1;
      if (live.brandT === undefined || up) live.brandT = t;
      live.brandT += (t - live.brandT) * 0.14;
      if (Math.abs(t - live.brandT) > 0.001) queue(); else live.brandT = t;
      const dur = 2.6 / (N + 1.6), gap0 = N > 1 ? (1 - dur) / (N - 1) : 1;
      live.logos.forEach((el, k) => {
        if (reduce) { el.style.transform = ""; el.style.opacity = "1"; return; }
        const p = up ? 1 : Math.max(0, Math.min(1, (live.brandT - k * gap0) / dur));
        const b = 1 + 2.70158 * Math.pow(p - 1, 3) + 1.70158 * Math.pow(p - 1, 2); // ease-out-back
        el.style.transform = `translate3d(0, ${(36 * (1 - b)).toFixed(1)}px, 0) scale(${(0.3 + 0.7 * b).toFixed(3)})`;
        el.style.opacity = Math.min(1, p * 1.8).toFixed(3);
      });
    }
    if (galTop !== null) {
      // Scrolling up skips straight past the strip; scrolling down plays it through again.
      if (y < lastY - 1 && galTop < -2 && galTop > -live.run / 3 - 2 && !live.glide) glide(y + galTop);
      else if (galTop < vh && galTop > -live.run - vh) {
        const tg = Math.max(0, Math.min(live.run, -galTop * 3)), mid = innerWidth / 2;
        if (live.gT === undefined || up) live.gT = tg;
        live.gT += (tg - live.gT) * 0.22;
        if (Math.abs(tg - live.gT) > 0.5) queue(); else live.gT = tg;
        const t = live.gT;
        live.track.style.transform = `translate3d(${-t}px, 0, 0)`;
        // the image passing through the middle grows; the rest stay small and a touch faded
        for (const sh of live.shots || []) {
          const k = Math.max(0, 1 - Math.abs(sh.c - t - mid) / live.span);
          sh.el.style.transform = `scale(${(1 + 0.25 * k).toFixed(3)})`;
          sh.el.style.opacity = (0.72 + 0.28 * k).toFixed(3);
        }
      }
    }
    // Projects page: fade the background image of the category nearest the middle of the screen
    if (secR) {
      let bi = -1, bd = 1e9;
      secR.forEach((r, i) => { const d = Math.abs(r.top + r.height / 2 - vh / 2); if (d < bd) { bd = d; bi = i; } });
      if (bi !== live.bgOn) { live.bgOn = bi; live.bgs.forEach((b, i) => b.classList.toggle("on", i === bi)); }
    }
    (live.scrubs || []).forEach((el, k) => {
      const r = scrR[k];
      if (r.bottom < 0 || r.top > vh) return;
      const words = el.children, p = Math.max(0, Math.min(1, (vh * 0.9 - r.top) / (vh * 0.55 + r.height)));
      const lit = Math.round(p * words.length);
      for (let i = 0; i < words.length; i++) words[i].classList.toggle("lit", i < lit);
    });
    lastY = y;
    if (!reduce) (live.masks || []).forEach((im, k) => {
      const r = maskR[k];
      if (r.bottom < 0 || r.top > vh) return;
      const p = (r.top + r.height / 2 - vh / 2) / vh;
      im.style.transform = `scale(${1.14 - Math.min(.14, Math.abs(p) * .14)}) translate3d(0, ${p * -5}%, 0)`;
    });
  }
  /* Intro screen: project images fall down the page, tumbling as they go, with speed lines
     drawn behind them. Click one to open that project. Move the cursor to the bottom edge
     (or scroll) to enter the home page. The disco button (top right) starts a 20-second game:
     lights on, images fall faster, and the cursor becomes a basket that catches them. */
  /* Three original disco tracks for the catch game, synthesised in the browser — no audio files,
     nothing licensed. One is picked at random each game, never the same one twice in a row.
     They play only while disco mode is on, and start from the button press so browsers allow sound. */
  function music() {
    const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
    let ctx = null, out = null, noise = null, timer = 0, step = 0, next = 0, muted = false, tk = null, last = -1;
    try { muted = localStorage.getItem("ad-mute") === "1"; } catch (err) {}

    const env = (t, a, d, peak) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a);
      g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
      return g;
    };
    // one voice: an oscillator through an optional sweeping low-pass
    const tone = (t, type, f, a, d, peak, lp, lpTo) => {
      const o = ctx.createOscillator(), g = env(t, a, d, peak);
      o.type = type; o.frequency.setValueAtTime(f, t);
      let node = o;
      if (lp) {
        const fl = ctx.createBiquadFilter();
        fl.type = "lowpass"; fl.frequency.setValueAtTime(lp, t);
        if (lpTo) fl.frequency.exponentialRampToValueAtTime(lpTo, t + a + d);
        o.connect(fl); node = fl;
      }
      node.connect(g).connect(out); o.start(t); o.stop(t + a + d + 0.05);
      return o;
    };
    const burst = (t, hp, d, peak, type) => {
      const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = env(t, 0.002, d, peak);
      s.buffer = noise; f.type = type || "highpass"; f.frequency.value = hp; f.Q.value = type === "bandpass" ? 1.4 : 0.7;
      s.connect(f).connect(g).connect(out); s.start(t); s.stop(t + d + 0.05);
    };
    const kick = (t, from, to, d, peak) => {
      const o = tone(t, "sine", from, 0.002, d, peak);
      o.frequency.exponentialRampToValueAtTime(to, t + d * 0.32);
    };
    const chord = (t, root, ch, oct, a, d, peak, type, lp) => {
      for (const n of ch) tone(t, type || "sawtooth", hz(root + oct + n), a, d, peak, lp || 3000);
    };

    const TRACKS = [
      { // 1. Classic Philly disco — strings, octave bass, off-beat stabs
        bpm: 118, len: 64, root: [45, 38, 43, 36],
        ch: [[0, 3, 7, 10], [0, 3, 7, 10], [0, 4, 7, 10], [0, 4, 7, 11]],
        play(i, t, root, ch) {
          const s = i & 15;
          if (s % 4 === 0) kick(t, 160, 46, 0.3, 0.95);
          if (s === 4 || s === 12) burst(t, 1400, 0.16, 0.42, "bandpass");
          burst(t, 8500, s % 4 === 2 ? 0.17 : 0.035, s % 4 === 2 ? 0.2 : 0.12);
          if (s % 2 === 0) tone(t, "sawtooth", hz(root + (s % 4 === 0 ? 0 : 12)), 0.005, 0.2, 0.42, 900, 260);
          if (s % 4 === 2) chord(t, root, ch, 24, 0.004, 0.16, 0.085);
          if (s === 0) chord(t, root, ch, 36, 0.25, 1.6, 0.03, "triangle");
        }
      },
      { // 2. Hi-NRG — fast, driving sixteenth-note bass and a bright arp on top
        bpm: 142, len: 64, root: [41, 37, 44, 39],
        ch: [[0, 3, 7, 10], [0, 4, 7, 11], [0, 4, 7, 11], [0, 4, 7, 10]],
        play(i, t, root, ch) {
          const s = i & 15;
          if (s % 4 === 0) kick(t, 180, 44, 0.24, 1);
          if (s === 4 || s === 12) { burst(t, 1800, 0.13, 0.5, "bandpass"); burst(t, 320, 0.1, 0.25); }
          burst(t, 9500, s % 4 === 2 ? 0.14 : 0.025, s % 4 === 2 ? 0.26 : 0.1);
          tone(t, "sawtooth", hz(root + (s % 2 ? 12 : 0)), 0.003, 0.1, 0.4, 1100, 320);   // 16th-note bass
          if (s % 2 === 0) tone(t, "square", hz(root + 36 + ch[(i >> 1) % ch.length]), 0.003, 0.11, 0.075, 4000);
          if (s === 0 || s === 8) chord(t, root, ch, 24, 0.01, 0.5, 0.06, "sawtooth", 2200);
        }
      },
      { // 3. Slinky funk — slower, syncopated bass, guitar chucks and brass stabs over a two-chord vamp
        bpm: 104, len: 32, root: [40, 45],
        ch: [[0, 3, 7, 10, 14], [0, 4, 7, 10, 14]],
        play(i, t, root, ch) {
          const s = i & 15;
          if (s === 0 || s === 8 || s === 14) kick(t, 150, 42, 0.32, 0.9);
          if (s === 4 || s === 12) { burst(t, 1900, 0.19, 0.46, "bandpass"); burst(t, 260, 0.12, 0.2); }
          if (s % 2 === 0) burst(t, 9000, s === 6 || s === 14 ? 0.16 : 0.03, s % 4 === 2 ? 0.2 : 0.1);
          const BASS = [0, 3, 6, 8, 11, 14], STEPS = [0, 7, 12, 0, 10, 7];
          const k = BASS.indexOf(s);
          if (k >= 0) tone(t, "sawtooth", hz(root + STEPS[k]), 0.004, 0.19, 0.46, 750, 220);
          if (s % 2 === 1) chord(t, root, ch, 24, 0.002, 0.055, 0.045, "square", 2600);     // guitar chucks
          if (s === 2 || s === 10) chord(t, root, ch, 24, 0.012, 0.3, 0.07, "sawtooth", 2400); // brass
          if (s === 0) chord(t, root, ch, 36, 0.3, 1.9, 0.022, "triangle");
        }
      }
    ];

    function tick() {
      const t = ctx.currentTime, s16 = 60 / tk.bpm / 4;
      while (next < t + 0.15) {
        tk.play(step, next, tk.root[(step >> 4) % tk.root.length], tk.ch[(step >> 4) % tk.ch.length]);
        next += s16; step = (step + 1) % tk.len;
      }
    }

    return {
      get muted() { return muted; },
      start() {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        try {
          let n; do { n = Math.floor(Math.random() * TRACKS.length); } while (TRACKS.length > 1 && n === last);
          last = n; tk = TRACKS[n];
          ctx = new AC();
          noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
          const d = noise.getChannelData(0);
          for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
          const comp = ctx.createDynamicsCompressor();
          out = ctx.createGain(); out.gain.value = 0;
          out.connect(comp).connect(ctx.destination);
          out.gain.linearRampToValueAtTime(muted ? 0 : 0.26, ctx.currentTime + 0.5);
          step = 0; next = ctx.currentTime + 0.08;
          ctx.resume && ctx.resume();
          tick(); timer = setInterval(tick, 25);
        } catch (err) { ctx = null; }
      },
      mute(on) {
        muted = on;
        try { localStorage.setItem("ad-mute", on ? "1" : "0"); } catch (err) {}
        if (ctx && out) out.gain.linearRampToValueAtTime(on ? 0 : 0.26, ctx.currentTime + 0.12);
      },
      stop() {
        clearInterval(timer); timer = 0;
        if (!ctx) return;
        const c = ctx, g = out;
        try { g.gain.cancelScheduledValues(c.currentTime); g.gain.setValueAtTime(g.gain.value, c.currentTime); g.gain.linearRampToValueAtTime(0.0001, c.currentTime + 0.25); } catch (err) {}
        setTimeout(() => { try { c.close(); } catch (err) {} }, 400);
        ctx = null; out = null;
      }
    };
  }

  function paintFrost(cv, src) {
    if (!cv) return;
    const im = new Image(); im.decoding = "async";
    im.onload = () => {
      const W = 960, H = 540, g = cv.getContext("2d");
      cv.width = W; cv.height = H;
      // a heavy, smooth blur by shrinking right down and scaling back up in two steps
      const a = document.createElement("canvas"); a.width = 48; a.height = 27; a.getContext("2d").drawImage(im, 0, 0, 48, 27);
      const b = document.createElement("canvas"); b.width = 192; b.height = 108;
      const bg = b.getContext("2d"); bg.imageSmoothingQuality = "high"; bg.drawImage(a, 0, 0, 192, 108);
      g.imageSmoothingQuality = "high"; g.drawImage(b, -24, -14, W + 48, H + 28);
      // richer colour, then most of the way down to black
      g.globalCompositeOperation = "saturation"; g.globalAlpha = 0.4; g.fillStyle = "hsl(0 100% 50%)"; g.fillRect(0, 0, W, H);
      g.globalAlpha = 1; g.globalCompositeOperation = "multiply"; g.fillStyle = "#4f4f4f"; g.fillRect(0, 0, W, H);
      // soft colour glows
      g.globalCompositeOperation = "screen";
      for (const [x, y, rr, c, al] of [[0.16, 0.28, 0.42, "9,88,56", 0.6], [0.84, 0.74, 0.38, "70,90,255", 0.42], [0.62, 0.12, 0.3, "255,120,40", 0.26], [0.3, 0.86, 0.3, "180,60,200", 0.2]]) {
        const gr = g.createRadialGradient(x * W, y * H, 0, x * W, y * H, rr * W);
        gr.addColorStop(0, `rgba(${c},${al})`); gr.addColorStop(1, `rgba(${c},0)`);
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
      }
      g.globalCompositeOperation = "source-over";
      // grain
      const d = g.getImageData(0, 0, W, H), px = d.data;
      for (let i = 0; i < px.length; i += 4) { const n = (Math.random() - 0.5) * 28; px[i] += n; px[i + 1] += n; px[i + 2] += n; }
      g.putImageData(d, 0, 0);
      cv.classList.add("ready");
    };
    im.src = src;
  }

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
    let disco = false, score = 0, total = 0, endAt = 0, px = -9999, py = -9999, sparks = [], shown = -1, lift = 0;
    const mute = $(".mute-btn"), band = music();
    const showMute = () => { mute.classList.toggle("off", band.muted); mute.setAttribute("aria-pressed", String(band.muted)); mute.setAttribute("aria-label", band.muted ? "Turn the music on" : "Mute the music"); };
    showMute();
    mute.addEventListener("click", () => { band.mute(!band.muted); showMute(); });
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
        c.width = 560; c.height = Math.round(560 * r);
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
    // one slow, continuous turn across the whole fall, rather than a fast twist back and forth
    const tilt = (rx, ry, rz) => `perspective(1000px) rotateX(${rx.toFixed(1)}deg) rotateY(${ry.toFixed(1)}deg) rotateZ(${rz.toFixed(1)}deg)`;
    function spawn(now) {
      if (!order.length) order = S.projects.map((_, i) => i).sort(() => Math.random() - 0.5);
      const i = order.pop(), m = masters[i];
      if (!m) return;
      const w = small() ? rnd(120, 188) * (disco ? 0.576 : 1) : rnd(265, 452) * (disco ? 0.461 : 1), h = w * m.r, fast = disco ? rnd(1.7, 2.5) : 1;
      if (disco) total++;
      const el = pool[i].pop() || make(i), v = H * rnd(0.5, 0.85) * fast, drift = disco ? rnd(-190, 190) : rnd(-18, 18);
      const x = rnd(0.04, 0.96) * (W - w), y = -h * 1.5, T = (H + h * 2.6) / v, s = Math.random() < 0.5 ? 1 : -1;
      el.style.width = w + "px"; el.style.height = h + "px"; el.style.visibility = "visible";
      const it = { el, i, w, h, x, y, v, drift, T, t0: now, ph: rnd(0, 6.28), done: false };
      it.fall = el.animate([{ transform: `translate3d(${x}px, ${y}px, 0)` }, { transform: `translate3d(${x + drift * T}px, ${y + v * T}px, 0)` }], { duration: T * 1000, easing: "linear", fill: "both" });
      const rx = rnd(9, 17) * s, ry = rnd(13, 24) * s, rz = rnd(2, 6) * s;
      it.spin = el.firstChild.animate(
        [{ transform: tilt(rx, -ry, -rz) }, { transform: tilt(-rx * 0.65, ry, rz) }],
        { duration: T * 1000, easing: "linear", fill: "both" });
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
        const reach = fine ? 26 : 44;
        if (disco && px > x - reach && px < x + it.w + reach && py > y - reach && py < y + it.h + reach) {
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
      mute.hidden = !on;
      on ? band.start() : band.stop();
    };
    function start() {
      scrollTo(0, 0); score = 0; total = 0; shown = -1; sparks = []; scoreEl.textContent = "0"; end.hidden = true; park();
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
    const park = () => { px = -9999; py = -9999; clearTimeout(lift); lift = 0; };
    const track = (e) => {
      // pressing or hovering a control must not leave the basket sitting there catching images
      if (e.target && e.target.closest && e.target.closest(".disco-btn, .mute-btn, .disco-hud, .disco-end")) return park();
      const g = gate.getBoundingClientRect(); px = e.clientX - g.left; py = e.clientY - g.top;
    };
    gate.addEventListener("pointermove", track); gate.addEventListener("pointerdown", track);
    // a lifted finger keeps catching briefly, so a quick tap still connects with what is falling past
    gate.addEventListener("pointerup", (e) => { if (e.pointerType !== "mouse") { clearTimeout(lift); lift = setTimeout(park, 320); } });
    gate.addEventListener("pointercancel", park); gate.addEventListener("pointerleave", park);
    const away = () => { if (disco && scrollY > innerHeight * 0.5) mode(false); };
    const hide = () => { if (disco && document.hidden) mode(false); };   // stop the sound if the tab is left
    document.addEventListener("visibilitychange", hide);
    addEventListener("scroll", away, { passive: true });
    // cursor reaching the bottom edge enters the home page
    const edge = (e) => {
      if (disco || !end.hidden || scrollY > 10 || e.clientY < innerHeight - 26 || e.movementY <= 0 || performance.now() - entered < 1500) return;
      entered = performance.now(); scrollTo({ top: innerHeight, behavior: "smooth" });
    };
    gate.addEventListener("mousemove", edge);
    size(); raf = requestAnimationFrame(frame);
    return { stop: () => { cancelAnimationFrame(raf); gate.removeEventListener("mousemove", edge); removeEventListener("scroll", away); document.removeEventListener("visibilitychange", hide); band.stop(); clear(); cursor.style.visibility = ""; } };
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
  addEventListener("resize", () => { live.fit && live.fit(); live.fitWord && live.fitWord(); live.sizeLens && live.sizeLens(); live.nameOff = null; queue(); });
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
