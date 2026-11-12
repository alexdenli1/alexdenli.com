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
  let seenGate = false, mx = innerWidth / 2, my = innerHeight / 2, queued = false, live = {};

  /* ---------- Page builders ---------- */
  const foot = () => `<footer class="site-foot"><span>© ${new Date().getFullYear()} ${esc(S.owner.name)}, ${esc(S.owner.location)}</span>
    <a class="ul" href="mailto:${esc(S.owner.email)}">${esc(S.owner.email)}</a><a class="ul" href="#" data-top>Back to top</a></footer>`;

  // Scatter pattern for the home page. New projects drop into the next slot automatically.
  const SLOTS = [
    { x: 5, w: 40, s: .07 }, { x: 50, w: 28, s: -.06 }, { x: 20, w: 32, s: .11 }, { x: 52, w: 26, s: -.09 },
    { x: 4, w: 28, s: .05 }, { x: 30, w: 42, s: -.05 }, { x: 12, w: 26, s: .1 }, { x: 44, w: 32, s: -.07 }
  ];

  function home() {
    const n = S.projects.length, step = 52;
    const pieces = S.projects.map((p, i) => {
      const t = SLOTS[i % SLOTS.length];
      return `<a class="piece${p.hidden ? " lost" : ""}${found.has(p.slug) ? " got" : ""}" href="${link(p)}" data-slug="${esc(p.slug)}"
        data-title="${esc(p.title)}" data-speed="${t.s}" data-cursor style="left:${t.x}%;top:${28 + i * step}vh;width:${t.w}vw">
        <span class="piece-in"><img src="${esc(p.hero)}" alt="${esc(p.title)}" loading="${i < 2 ? "eager" : "lazy"}"></span>
        <span class="piece-cap">${esc(p.title)}<small>${esc(cat(p.category).label)}, ${esc(p.year)}</small></span></a>`;
    }).join("");
    const index = S.projects.map((p) => `<li><a href="${link(p)}" data-slug="${esc(p.slug)}" class="${p.hidden ? "lost" : ""}${found.has(p.slug) ? " got" : ""}">
      <b>${p.hidden && !found.has(p.slug) ? "·····" : esc(p.title)}</b><small>${esc(p.year)}</small></a></li>`).join("");
    return {
      title: "", label: "Back home", scroll: seenGate ? innerHeight : 0,
      html: `<section class="gate" aria-label="Introduction"><h1 class="gate-mark">Alex<br>Denli</h1>
        <div class="gate-foot"><span>${esc(S.owner.role)}</span><span class="gate-hint"><i></i>Scroll to enter</span></div></section>
      <section class="field" style="height:${28 + n * step + 50}vh" aria-label="All work">
        <div class="field-title giant" aria-hidden="true"><span>Work</span></div>
        <ol class="field-index"><p>${n} projects. Some are hidden, move around to find them.</p>${index}</ol>
        ${pieces}
      </section>
      <section class="home-end"><p>${esc(S.owner.intro)}</p>
        <a class="giant" href="#/now">Now</a><a class="giant" href="#/archive">Archive</a><a class="giant" href="#/contact">Contact</a></section>${foot()}`,
      after: () => { seenGate = true; }
    };
  }

  function work(id) {
    const c = S.categories.find((x) => x.id === id);
    if (!c) return null;
    const list = S.projects.filter((p) => p.category === id);
    const rows = list.map((p) => `<a class="row" href="${link(p)}" data-cursor><span class="row-img"><img src="${esc(p.hero)}" alt="" loading="lazy"></span>
      <span class="row-txt"><h2>${esc(p.title)}</h2><span class="small">${esc(p.summary)} ${esc(p.year)}.</span></span></a>`).join("");
    return { title: c.label, label: c.label, html: `<div class="page"><header class="page-head"><h1 class="giant">${esc(c.label)}</h1>
      <p class="small">${list.length} project${list.length === 1 ? "" : "s"}</p></header>
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
      <a class="p-next" href="${link(next)}" data-cursor><small>Next project</small><span class="giant">${esc(next.title)}</span><img src="${esc(next.hero)}" alt=""></a>
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
    return { title: "Now", label: "Now", html: `<div class="page"><header class="page-head"><h1 class="giant">Now</h1><p class="small">What I am working on, and a running log of progress.</p></header>
      <h2 class="sub">Current projects</h2><div class="current">${cur.map((p) => `<a href="${link(p)}" data-cursor><img src="${esc(p.hero)}" alt="" loading="lazy"><b>${esc(p.title)}</b><span class="small">${esc(cat(p.category).label)}</span></a>`).join("")}</div>
      <h2 class="sub">Log</h2><ol class="log">${log}</ol>${foot()}</div>` };
  }

  function archive() {
    const list = S.projects.filter((p) => p.status !== "current").sort((a, b) => b.year - a.year);
    return { title: "Archive", label: "Archive", html: `<div class="page"><header class="page-head"><h1 class="giant">Archive</h1><p class="small">${list.length} finished projects, newest first.</p></header>
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

  const PAGES = { home, work, project, now, archive, contact };
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
      $$("a[data-route], #nav-cats a").forEach((a) => {
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
    cursor.classList.remove("big"); peek.classList.remove("on");
    if (first || reduce) return swap();
    curtainLabel.textContent = page.label;
    curtain.className = "curtain cover";
    setTimeout(() => { swap(); curtain.className = "curtain leave"; setTimeout(() => (curtain.className = "curtain"), 460); }, 470);
  }

  /* ---------- Per-page wiring ---------- */
  function bind(key) {
    live = {
      home: key === "home", mark: $(".gate-mark"), field: $(".field"), title: $(".field-title"),
      pieces: $$(".piece"), scrubs: $$("[data-scrub]"), masks: $$(".mask img")
    };
    const setTitle = (t) => { if (!live.title) return; live.title.classList.toggle("on", !!t); live.title.firstElementChild.textContent = t || "Work"; };
    const spot = (slug, on) => {
      const el = live.pieces.find((p) => p.dataset.slug === slug);
      if (!el) return;
      if (on && el.classList.contains("lost")) reveal(el);
      el.classList.toggle("on", on); live.field.classList.toggle("dim", on);
      $$(".field-index a").forEach((a) => a.classList.toggle("on", on && a.dataset.slug === slug));
      setTitle(on ? el.dataset.title : "");
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
    $$("[data-top]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); scrollTo({ top: live.home ? innerHeight : 0, behavior: reduce ? "auto" : "smooth" }); }));
    $$("[data-cursor]").forEach((a) => {
      a.addEventListener("mouseenter", () => cursor.classList.add("big"));
      a.addEventListener("mouseleave", () => cursor.classList.remove("big"));
    });
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
    nav.classList.toggle("nav-away", live.home && y < vh * 0.85);
    flag.classList.toggle("flag-away", live.home && y < vh * 1.5);
    const big = wide();
    for (const el of live.pieces || []) {
      const r = el.getBoundingClientRect();
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
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener("scroll", queue, { passive: true });
  addEventListener("resize", queue);
  addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    cursor.style.transform = `translate3d(${mx}px, ${my}px, 0) scale(${cursor.classList.contains("big") ? 1 : .16})`;
    peek.style.transform = `translate3d(${Math.min(mx + 28, innerWidth - 330)}px, ${my - 110}px, 0)`;
    queue();
  }, { passive: true });

  /* ---------- Start ---------- */
  $("#nav-cats").innerHTML = S.categories.map((c) => `<a href="#/work/${esc(c.id)}" data-cat="${esc(c.id)}">${esc(c.label)}</a>`).join("");
  cursor.style.transform = "translate3d(-200px,-200px,0) scale(.16)";
  addEventListener("hashchange", () => show(false));
  show(true);
})();
