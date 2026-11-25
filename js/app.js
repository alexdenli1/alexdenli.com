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
  let instant = false, lastY = 0, mx = innerWidth / 2, my = innerHeight / 2, queued = false, live = {};

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

  const ALL = () => S.projects.slice().sort((a, b) => parseInt(b.year, 10) - parseInt(a.year, 10));

  function ledger() {
    return window.INDEXWORKS ? window.INDEXWORKS.render(ALL(), (p) => { const c = S.categories.find((x) => x.id === p.category); return c ? c.label : ""; }, link) : "";
  }

  const catOf = (p) => { const c = S.categories.find((x) => x.id === p.category); return c ? c.label : ""; };
  /* how many logos per row: the widest wrap that doesn't strand one on its own at the end */
  const cols = (n) => { for (const c of [4, 3, 5]) { const r = n % c; if (n <= c || r === 0 || r > 1) return c; } return 4; };
  /* brand logos sit in three even rows, the longest row in the middle, offset like brickwork.
     Every row uses the same spacing between logos, and the outer logos keep clear of the screen edges.
     Positions are percentages of the logo box. */
  const scatter = (n) => {
    const R = Math.min(3, n), base = Math.floor(n / R), extra = n % R;
    const counts = Array.from({ length: R }, (_, r) => base + (extra === 1 ? (r === 1 ? 1 : 0) : extra === 2 ? (r !== 1 ? 1 : 0) : 0));
    const most = Math.max(...counts), EDGE = 9, pitch = most > 1 ? (100 - 2 * EDGE) / (most - 1) : 0;
    const out = [];
    counts.forEach((c, r) => { const x0 = 50 - pitch * (c - 1) / 2;
      for (let i = 0; i < c; i++) out.push({ x: +(x0 + i * pitch).toFixed(2), y: +((r + 0.5) / R * 100).toFixed(2) }); });
    return out;
  };

  function home() {
    const HP = ALL();
    const n = HP.length;
    // Every piece: the image, then below it the name (large), the category and year, and one line about the project.
    const piece = (p, i) => {
      const t = SLOTS[i % SLOTS.length];
      return `<a class="piece${p.hidden ? " lost" : ""}${found.has(p.slug) ? " got" : ""}" href="${link(p)}" data-slug="${esc(p.slug)}"
        data-title="${esc(p.title)}" style="left:${t.x}%">
        <span class="piece-in"><span class="piece-img"><img src="${esc(p.hero)}" alt="${esc(p.title)}" loading="${i < 2 ? "eager" : "lazy"}" onload="this.parentNode.classList.toggle('wide', this.naturalWidth / this.naturalHeight > 1.6)">${ZAP}</span>
          <span class="piece-cap"><span class="piece-name">${esc(p.title)}</span><span class="piece-sub"><span class="piece-go">Let's go <i aria-hidden="true">&rarr;</i></span><span class="piece-meta">${esc(p.scope || cat(p.category).label)}, ${esc(p.year)}</span>
          <span class="piece-line">${esc(p.line || p.summary || "")}</span></span></span></span></a>`;
    };
    const slides = HP.map(piece).join("");
    const rows = HP.map((p, i) => piece(p, i).replace('loading="eager"', 'loading="lazy"')).join("");
    const index = HP.map((p) => `<li><a href="${link(p)}" data-slug="${esc(p.slug)}" class="${p.hidden ? "lost" : ""}${found.has(p.slug) ? " got" : ""}">
      <b>${p.hidden && !found.has(p.slug) ? "·····" : esc(p.title)}</b></a></li>`).join("");
    return {
      title: "", label: "Home", scroll: 0,
      html: `${window.OPENING ? window.OPENING.html(S) : `<h1 class="op-name">${esc(S.owner.name)}</h1>`}
      <div class="lite">${window.BRANDS ? window.BRANDS.html(S.brands, "Brands I’ve worked with", "Designing for, and working alongside, some of golf’s most trusted names.") : ""}
      ${window.CHAPTERS ? window.CHAPTERS.html(S.projects) : ""}
      ${ledger()}
      ${window.CONTACT ? window.CONTACT.html(S.owner) : `<section class="home-end"><a class="giant" href="#/contact">Contact</a></section>`}${foot()}</div>`,
      after: () => { if (window.CHAPTERS) window.CHAPTERS.wire(); if (window.INDEXWORKS) window.INDEXWORKS.wire(); if (window.CONTACT) window.CONTACT.wire(); },
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
    if (p.slug === "relinquit" && window.RELINQUIT) {
      const tail = `<a class="p-next" href="${link(next)}" style="--nc:${esc(next.colour || "#EEE9E3")};--nk:${window.CHAPTERS ? window.CHAPTERS.inkOn(next.colour) : "#000"}"><small>Next project</small><span class="giant">${esc(next.title)}</span><img src="${esc(next.hero)}" alt=""></a>
      <nav class="p-exits" aria-label="Where next"><a class="ul" href="#/work/${esc(c.id)}">More ${esc(c.label.toLowerCase())}</a><a class="ul" href="#/">All work</a></nav>${foot()}`;
      return { title: p.title, label: p.title, html: window.RELINQUIT.render(p, tail), after: () => window.RELINQUIT.wire() };
    }
    if (p.slug === "shield" && window.SHIELD) {
      const tail = `<a class="p-next" href="${link(next)}" style="--nc:${esc(next.colour || "#EEE9E3")};--nk:${window.CHAPTERS ? window.CHAPTERS.inkOn(next.colour) : "#000"}"><small>Next project</small><span class="giant">${esc(next.title)}</span><img src="${esc(next.hero)}" alt=""></a>
      <nav class="p-exits" aria-label="Where next"><a class="ul" href="#/work/${esc(c.id)}">More ${esc(c.label.toLowerCase())}</a><a class="ul" href="#/">All work</a></nav>${foot()}`;
      return { title: p.title, label: p.title, html: window.SHIELD.render(p, tail), after: () => window.SHIELD.wire() };
    }
    if (p.slug === "aeropress" && window.AEROPRESS) {
      const tail = `<a class="p-next" href="${link(next)}" style="--nc:${esc(next.colour || "#EEE9E3")};--nk:${window.CHAPTERS ? window.CHAPTERS.inkOn(next.colour) : "#000"}"><small>Next project</small><span class="giant">${esc(next.title)}</span><img src="${esc(next.hero)}" alt=""></a>
      <nav class="p-exits" aria-label="Where next"><a class="ul" href="#/work/${esc(c.id)}">More ${esc(c.label.toLowerCase())}</a><a class="ul" href="#/">All work</a></nav>${foot()}`;
      return { title: p.title, label: p.title, html: window.AEROPRESS.render(p, tail), after: () => window.AEROPRESS.wire() };
    }
    if (p.slug === "rescue" && window.RESCUE) {
      const tail = `<a class="p-next" href="${link(next)}" style="--nc:${esc(next.colour || "#EEE9E3")};--nk:${window.CHAPTERS ? window.CHAPTERS.inkOn(next.colour) : "#000"}"><small>Next project</small><span class="giant">${esc(next.title)}</span><img src="${esc(next.hero)}" alt=""></a>
      <nav class="p-exits" aria-label="Where next"><a class="ul" href="#/work/${esc(c.id)}">More ${esc(c.label.toLowerCase())}</a><a class="ul" href="#/">All work</a></nav>${foot()}`;
      return { title: p.title, label: p.title, html: window.RESCUE.render(p, tail), after: () => window.RESCUE.wire() };
    }
    return { title: p.title, label: p.title, html: `<article class="page"><header class="p-head">
        <p class="p-meta"><b>${esc(p.title)}</b><span>${esc(p.year)}</span><a class="ul" href="#/work/${esc(c.id)}">${esc(c.label)}</a></p>
        <h1 class="giant">${esc(p.title)}</h1><p class="p-sum">${esc(p.summary)}</p></header>
      <div class="p-hero mask"><img src="${esc(p.hero)}" alt="${esc(p.title)}"></div>
      <div class="blocks">${(p.blocks || []).map((b) => (BLOCK[b.type] ? BLOCK[b.type](b) : "")).join("")}</div>
      <a class="p-next" href="${link(next)}" style="--nc:${esc(next.colour || "#EEE9E3")};--nk:${window.CHAPTERS ? window.CHAPTERS.inkOn(next.colour) : "#000"}"><small>Next project</small><span class="giant">${esc(next.title)}</span><img src="${esc(next.hero)}" alt=""></a>
      <nav class="p-exits" aria-label="Where next"><a class="ul" href="#/">Back home</a><a class="ul" href="#/work/${esc(c.id)}">More ${esc(c.label.toLowerCase())}</a><a class="ul" href="#/">All work</a></nav>${foot()}</article>` };
  }

  function contact() {
    const o = S.owner;
    return { title: "Contact & About", label: "Contact & About", html: `<div class="page"><header class="page-head"><h1 class="small" style="font-size:1.0625rem;font-weight:400">Contact &amp; About</h1></header>
      <h2 class="mail">${esc(o.name)}</h2>
      <p class="reach"><a class="ul" href="mailto:${esc(o.email)}">${esc(o.email)}</a><a class="ul" href="tel:${esc(o.phone.replace(/\s/g, ""))}">${esc(o.phone)}</a></p>
      <div class="about"><div class="about-txt"><p>${esc(o.intro)}</p>${o.about.map((t) => `<p class="small" style="font-size:1.0625rem">${esc(t)}</p>`).join("")}</div>
      <div class="about-side"><div class="about-links">${o.links.map((l) => `<a class="ul" href="${esc(l.url)}">${esc(l.label)}</a>`).join("")}<span class="small" style="margin-top:1rem">Based in ${esc(o.location)}</span></div></div></div>
      <a class="closer" href="mailto:${esc(o.email)}">Let's connect and make something that sells.</a>${foot()}</div>` };
  }

  const lost = () => ({ title: "Out of bounds", label: "Out of bounds", bare: true, html: `<div class="lost-page"><h1 class="giant">Out of bounds</h1>
    <p>This page is not on the course. Take a drop and carry on from the clubhouse.</p><a class="ul" href="#/">Back home</a></div>` });

  const PAGES = { home, work, project, contact };
  const ALIAS = { projects: "home", archive: "home" };
  function resolve() {
    const [a = "", b] = location.hash.replace(/^#\/?/, "").split("/");
    let key = a || "home";
    if (ALIAS[key]) { key = ALIAS[key]; try { history.replaceState(null, "", "#/"); } catch (e) {} }
    return { key, sub: b, page: (PAGES[key] && PAGES[key](b)) || lost() };
  }

  /* ---------- Home <-> project: the picture grows into the page's hero ----------
     A chapter picture (or an Index of works line) opens its project with that picture growing into
     the project page's hero while the page wipes in behind it, left to right. Back reverses it,
     returning to the same chapter. View Transitions where the browser has them; otherwise the
     picture is cloned and flown to the hero's place. With reduced motion it is an instant swap. */
  const HERO = "[data-hero], .ax-hero-img, .rq-hc, .sh-hprod, .rs-hero img, .p-hero img";
  let morphFrom = null, lastProject = null;
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a[data-vt]");
    if (!a || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) { morphFrom = null; return; }
    morphFrom = a.querySelector("img") || (a.closest(".iw") && $(".iw.split .iw-pic img.on")) || $(`.ch[data-slug="${a.dataset.slug}"] .ch-pic img`);
  }, true);
  function morph(from, swap, findTo) {
    const ease = "cubic-bezier(.7, 0, .2, 1)", dur = 820;
    if (document.startViewTransition) {
      from.style.viewTransitionName = "hero";
      const t = document.startViewTransition(() => { from.style.viewTransitionName = ""; swap(); const to = findTo(); if (to) to.style.viewTransitionName = "hero"; });
      // a browser may skip the animation (a hidden tab, a slow frame): the page has still changed, so that is not an error
      t.ready.catch(() => {}); t.updateCallbackDone.catch(() => {});
      t.finished.catch(() => {}).finally(() => { const to = findTo(); if (to) to.style.viewTransitionName = ""; });
      return;
    }
    // fallback: a copy of the picture flies from where it was to where the hero now sits
    const r = from.getBoundingClientRect(), c = from.cloneNode(false);
    c.removeAttribute("loading"); c.className = "vt-clone"; c.alt = "";
    document.body.appendChild(c);
    swap();
    const to = findTo(), t = to ? to.getBoundingClientRect() : { left: 0, top: 0, width: innerWidth, height: innerHeight };
    if (to) to.style.visibility = "hidden";
    // one fixed element, so its box is animated directly (keeps the picture's proportions true all the way)
    const box = (q) => ({ transform: `translate(${q.left}px, ${q.top}px)`, width: q.width + "px", height: q.height + "px" });
    const fly = c.animate([box(r), box(t)], { duration: dur, easing: ease, fill: "forwards" });
    view.animate([{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }], { duration: dur, easing: ease });
    fly.onfinish = () => { if (to) to.style.visibility = ""; c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180 }).onfinish = () => c.remove(); };
  }

  /* ---------- Routing with a curtain between pages ---------- */
  function show(first) {
    const { key, sub, page } = resolve();
    // coming back home from a project: return to that project's chapter
    const back = !first && key === "home" && lastProject ? lastProject : null;
    lastProject = key === "project" ? sub : null;
    const swap = () => {
      view.innerHTML = page.html;
      // a project page takes its own colour for its accents (--project)
      const pc = key === "project" && (S.projects.find((p) => p.slug === sub) || {}).colour;
      pc ? view.style.setProperty("--project", pc) : view.style.removeProperty("--project");
      document.title = (page.title ? page.title + " — " : "") + S.owner.name;
      $$("a[data-route]").forEach((a) => {
        const on = a.dataset.route === key || (key === "work" && a.dataset.cat === sub) ||
          (key === "project" && a.dataset.cat === (S.projects.find((p) => p.slug === sub) || {}).category);
        on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
      });
      nav.hidden = flag.hidden = !!page.bare;
      window.scrollTo(0, page.scroll || 0);
      page.after && page.after();
      if (back) { const c = $(`.ch[data-slug="${back}"]`); if (c) window.scrollTo(0, c.getBoundingClientRect().top + scrollY); }
      bind(key);
      update();
      if (!first) view.focus({ preventScroll: true });
    };
    peek.classList.remove("on");
    const from = morphFrom || (back ? $(HERO, view) : null); morphFrom = null;
    if (first || reduce || instant) { instant = false; return swap(); }
    if (from && from.isConnected && (key === "project" || back)) {
      return morph(from, swap, () => (key === "project" ? $(HERO, view) : $(`.ch[data-slug="${back}"] .ch-pic img`, view)));
    }
    if (key === "home") return swap(); // going home is instant, no transition
    const fx = "fx-sweep", dur = 520; // every other page shares the slanted sweep (see style.css)
    curtainLabel.textContent = page.label;
    curtain.className = `curtain cover ${fx}`;
    setTimeout(() => { swap(); curtain.className = `curtain leave ${fx}`; setTimeout(() => (curtain.className = "curtain"), dur); }, dur);
  }

  /* ---------- Per-page wiring ---------- */
  function bind(key) {
    if (key !== "archive") unwireArchive();
    live.stopOpening && live.stopOpening(); live.ro && live.ro.disconnect();
    live = {
      home: key === "home", lite: $(".lite"), field: $(".work"), pintro: $(".pintro"), pword: $(".pintro-word"), pdark: $(".pintro-dark"), pcover: $(".pintro-cover"),
      pfirst: $(".pintro .piece"), pindex: $(".field-index"),
      pieces: $$(".pintro .piece"), rows: $$(".field .piece"), scrubs: $$("[data-scrub]"), masks: $$(".mask img"),
      names: $$(".field-index a"), wheel: $(".field-index ol"), active: -1,
      gallery: $(".gallery"), track: $(".gallery-track"), run: 0,
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
    if (key === "home" && window.OPENING) { const op = $(".op"); if (op) live.stopOpening = window.OPENING.start(op, S); }
    if (key === "archive") wireArchive();
    $$("[data-top]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); toTop(); }));
    $$("[data-peek]").forEach((a) => {
      a.addEventListener("mouseenter", () => { peek.src = a.dataset.peek; peek.classList.add("on"); });
      a.addEventListener("mouseleave", () => peek.classList.remove("on"));
    });
  }

  /* Archive: hovering a project lifts it to the middle of the screen over a dimmed page and plays through
     the project's pictures (the hero, then every image used on its project page; or "preview: [...]" in data.js). */
  const shotsOf = (p) => {
    if (p.preview && p.preview.length) return p.preview;
    const out = [p.hero];
    (p.blocks || []).forEach((b) => {
      if (b.type === "image" && b.src) out.push(b.src);
      if (b.type === "pair") (b.images || []).forEach((s) => out.push(s));
      if (b.type === "steps") (b.items || []).forEach((it) => it.src && out.push(it.src));
    });
    return out.filter((s, i) => s && out.indexOf(s) === i);
  };
  let arch = null;
  function unwireArchive() {
    if (!arch) return;
    clearTimeout(arch.t); clearInterval(arch.iv); removeEventListener("scroll", arch.sc); arch.dim.remove(); arch.card.remove(); arch = null;
  }
  function wireArchive() {
    unwireArchive();
    if (!fine || !wide() || reduce) return;
    const dim = document.createElement("div"), card = document.createElement("a");
    dim.className = "show-dim"; card.className = "show";
    card.innerHTML = '<div class="show-frame"><div class="show-track"></div></div><div class="show-cap"><b></b><small></small><span class="show-go">Let\'s go <i aria-hidden="true">&rarr;</i></span></div><div class="show-bar"></div>';
    document.body.append(dim, card);
    arch = { dim, card, t: 0, iv: 0, ct: 0, tile: null, open: false };
    const track = $(".show-track", card), bar = $(".show-bar", card);
    const place = (r) => { card.style.left = r.left + "px"; card.style.top = r.top + "px"; card.style.width = r.width + "px"; };
    const close = () => {
      if (!arch) return;
      clearTimeout(arch.t); clearTimeout(arch.ct); clearInterval(arch.iv);
      if (!arch.open) return;
      arch.open = false; dim.classList.remove("on"); card.classList.remove("on");
      const t = arch.tile, r = t.querySelector(".tile-img").getBoundingClientRect();
      place(r); card.classList.add("home");
      setTimeout(() => { if (!arch.open) { card.style.visibility = "hidden"; t.classList.remove("lifted"); } }, 450);
    };
    const later = () => { clearTimeout(arch.ct); arch.ct = setTimeout(close, 220); };
    const open = (tile) => {
      const p = S.projects.find((x) => link(x) === tile.getAttribute("href"));
      if (!p) return;
      const imgs = shotsOf(p), r0 = tile.querySelector(".tile-img").getBoundingClientRect();
      arch.tile = tile; arch.open = true; card.setAttribute("href", tile.getAttribute("href"));
      const list = imgs.length > 1 ? imgs.concat(imgs[0]) : imgs;
      track.style.transition = "none"; track.style.transform = "translateX(0)";
      track.innerHTML = list.map((s) => `<img src="${esc(s)}" alt="">`).join("");
      $("b", card).textContent = p.title; $("small", card).textContent = p.year;
      bar.innerHTML = imgs.length > 1 ? imgs.map(() => "<i></i>").join("") : "";
      card.style.visibility = "visible"; card.classList.remove("on", "home"); place(r0);
      tile.classList.add("lifted"); dim.classList.add("on");
      const w = Math.min(innerWidth * 0.56, innerHeight * 0.66 * 1.5), h = w / 1.5;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!arch.open) return;
        card.classList.add("on");
        place({ left: (innerWidth - w) / 2, top: (innerHeight - h) / 2 - 36, width: w });
      }));
      // the pictures drift from right to left, one after another, and loop round
      const segs = $$("i", bar), n = imgs.length; let k = 0;
      const mark = (j) => segs.forEach((s, m) => s.classList.toggle("done", m <= j % n));
      mark(0);
      if (n > 1) arch.iv = setInterval(() => {
        k++; track.style.transition = "transform 1s cubic-bezier(.65, 0, .25, 1)"; track.style.transform = `translateX(${-k * 100}%)`; mark(k);
        if (k === n) setTimeout(() => { if (arch && arch.open) { track.style.transition = "none"; track.style.transform = "translateX(0)"; k = 0; } }, 1050);
      }, 1700);
    };
    $$(".tile").forEach((tile) => {
      tile.addEventListener("mouseenter", () => { clearTimeout(arch.ct); clearTimeout(arch.t); arch.t = setTimeout(() => open(tile), 220); });
      tile.addEventListener("mouseleave", () => { clearTimeout(arch.t); later(); });
      tile.addEventListener("focus", () => open(tile));
      tile.addEventListener("blur", later);
      tile.addEventListener("click", () => { clearTimeout(arch.t); clearInterval(arch.iv); arch.open = false; dim.classList.remove("on"); card.style.visibility = "hidden"; });
    });
    card.addEventListener("mouseenter", () => clearTimeout(arch.ct));
    card.addEventListener("mouseleave", later);
    card.addEventListener("click", () => { clearInterval(arch.iv); arch.open = false; dim.classList.remove("on"); card.style.visibility = "hidden"; arch.tile && arch.tile.classList.remove("lifted"); });
    arch.sc = close; addEventListener("scroll", close, { passive: true });
  }

  function reveal(el) {
    if (el.classList.contains("got")) return;
    el.classList.add("got"); found.add(el.dataset.slug);
    const a = $(`.field-index a[data-slug="${el.dataset.slug}"]`);
    if (a) { a.classList.add("got"); a.firstElementChild.textContent = el.dataset.title; }
  }

  /* ---------- Scroll and pointer motion ---------- */
  // The home button on the home page scrolls to the top too (the link alone does nothing there).
  flag.addEventListener("click", (e) => { if (live.home && /^#?\/?$/.test(location.hash)) { e.preventDefault(); toTop(); } });
  // Back to top: one eased scroll to the top of the home page. The list/showcase switch and the strip glide
  // stand down meanwhile, because they change the page height mid-way and used to pull the scroll off course.
  function toTop() {
    const target = 0;
    if (reduce) { scrollTo(0, target); return; }
    live.toTop = true; live.up = true;
    const from = scrollY, t0 = performance.now(), dur = Math.min(1800, 500 + Math.abs(from - target) * 0.12);
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      scrollTo(0, from + (target - from) * e);
      if (p < 1) requestAnimationFrame(step); else { scrollTo(0, target); live.toTop = false; queue(); }
    };
    requestAnimationFrame(step);
  }
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
  // home: the bar is clear over the black opening, then white once the white part of the page reaches it.
  // The home button only appears on the other pages.
  function bar() {
    const white = !!(live.lite && live.lite.getBoundingClientRect().top <= nav.offsetHeight * 0.5);
    document.documentElement.classList.toggle("on-white", white);
    nav.classList.toggle("nav-open", !!live.home && !white);
    flag.classList.toggle("flag-away", !!live.home);
  }
  function update() {
    queued = false;
    bar();
    if (live.toTop) { lastY = scrollY; return; }
    const y = scrollY, vh = innerHeight, big = wide();
    // Read every position first, then write. Interleaving the two forces the browser to lay the
    // page out again after each write, which is what made moving the mouse on the home page slow.
    const r0 = live.pfirst ? live.pfirst.getBoundingClientRect() : null;
    const brandsR = live.logos && live.logos.length ? live.brandsEl.getBoundingClientRect() : null;
    const introR = live.pintro ? live.pintro.getBoundingClientRect() : null;
    const navH = brandsR ? nav.offsetHeight : 0;
    const galTop = live.run && live.gallery ? live.gallery.getBoundingClientRect().top : null;
    const secR = live.secs && live.secs.length ? live.secs.map((s) => s.getBoundingClientRect()) : null;
    const scrR = (live.scrubs || []).map((el) => el.getBoundingClientRect());
    const maskR = reduce ? [] : (live.masks || []).map((im) => im.parentElement.getBoundingClientRect());
    if (big && live.wheel && live.names && !live.nameOff) live.nameOff = live.names.map((a) => a.parentElement.offsetTop + 19);

    // ---- writes ----
    // Animations play going down only. Scrolling up shows everything settled, with no reverse motion.
    if (y < lastY - 1) live.up = true; else if (y > lastY + 1) live.up = false;
    const up = !!live.up;
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
      if (!live.toTop && !live.list && up && inWork && introR.top <= 0 && introR.bottom >= vh - 1) {
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
    // the picture, the name and the button leave together in one direction while the next project arrives together.
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
        // the picture, name and button all travel together: one direction out, the next project arrives from the opposite side
        const D = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        live.fly = Array.from({ length: N }, () => { const d = D[Math.floor(Math.random() * 4)], o = [-d[0], -d[1]]; return { out: [d, d, d], in: [o, o, o] }; });
        live.parts = live.pieces.map((el) => [$(".piece-img", el), $(".piece-name", el), $(".piece-sub", el)]);
      }
      const DL = [0, 0, 0], put = (k, dirs, f0, delay) => live.parts[k].forEach((part, i) => {
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
      if (y < lastY - 1 && galTop < -2 && galTop > -live.run / 3 - 2 && !live.glide && !live.toTop) glide(y + galTop);
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

  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener("scroll", queue, { passive: true });
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
