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
  const SLOTS = [
    { x: 4, w: 54, s: .06 }, { x: 30, w: 46, s: -.05 }, { x: 8, w: 50, s: .08 }, { x: 34, w: 44, s: -.07 },
    { x: 4, w: 46, s: .05 }, { x: 26, w: 54, s: -.05 }, { x: 12, w: 48, s: .07 }
  ];
  const ZAP = `<svg class="zap" aria-hidden="true"><rect width="100%" height="100%" pathLength="1"/><rect width="100%" height="100%" pathLength="1"/></svg>`;

  function home() {
    const n = S.projects.length, step = 84;
    const pieces = S.projects.map((p, i) => {
      const t = SLOTS[i % SLOTS.length];
      return `<a class="piece${p.hidden ? " lost" : ""}${found.has(p.slug) ? " got" : ""}" href="${link(p)}" data-slug="${esc(p.slug)}"
        data-title="${esc(p.title)}" data-speed="${t.s}" style="left:${t.x}%;top:${28 + i * step}vh;width:${t.w}vw">
        <span class="piece-in"><img src="${esc(p.hero)}" alt="${esc(p.title)}" loading="${i < 2 ? "eager" : "lazy"}">${ZAP}</span>
        <span class="piece-cap">${esc(p.title)}<small>${esc(cat(p.category).label)}, ${esc(p.year)}</small></span></a>`;
    }).join("");
    const index = S.projects.map((p) => `<li><a href="${link(p)}" data-slug="${esc(p.slug)}" class="${p.hidden ? "lost" : ""}${found.has(p.slug) ? " got" : ""}">
      <b>${p.hidden && !found.has(p.slug) ? "·····" : esc(p.title)}</b></a></li>`).join("");
    return {
      title: "", label: "Back home", scroll: seenGate ? innerHeight : 0,
      html: `<section class="gate" aria-label="Introduction"><h1 class="gate-mark"><svg class="logo" viewBox="0 0 64.91 16.89" role="img" aria-label="Alex Denli Archive"><use href="#logo"/></svg></h1>
        <canvas class="gate-fx" aria-hidden="true"></canvas><div class="gate-fall"></div></section>
      <section class="field" style="height:${28 + n * step + 50}vh" aria-label="All work">
        <div class="field-title giant" aria-hidden="true"><span>Work</span></div>
        <ol class="field-index">${index}</ol>
        ${pieces}
      </section>
      <section class="home-end"><p>${esc(S.owner.intro)}</p>
        <a class="giant" href="#/projects">Projects</a><a class="giant" href="#/archive">Archive</a><a class="giant" href="#/contact">Contact</a></section>${foot()}`,
      after: () => { seenGate = true; }
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
    live.waves && live.waves.stop();
    live = {
      waves: key === "home" ? intro() : null,
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
  /* Intro screen: project images fall down the page, tumbling as they go, with speed lines
     drawn behind them. Click one to open that project. Move the cursor to the bottom edge
     (or scroll) to enter the home page. */
  function intro() {
    const gate = $(".gate"), cv = $(".gate-fx"), layer = $(".gate-fall");
    if (!gate || reduce) return null;
    const ctx = cv.getContext("2d"), small = () => innerWidth <= 820;
    let items = [], raf = 0, prev = 0, next = 0, order = [], W = 0, H = 0, dpr = 1, entered = 0;
    const rnd = (a, b) => a + Math.random() * (b - a);
    const streaks = Array.from({ length: 46 }, () => ({ x: Math.random(), y: Math.random(), len: rnd(40, 220), v: rnd(900, 2100), a: rnd(0.05, 0.2), g: Math.random() < 0.15 }));
    const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); W = gate.clientWidth; H = gate.clientHeight; cv.width = W * dpr; cv.height = H * dpr; };

    function spawn() {
      if (!order.length) order = S.projects.map((_, i) => i).sort(() => Math.random() - 0.5);
      const p = S.projects[order.pop()], w = small() ? rnd(96, 150) : rnd(170, 290);
      const el = document.createElement("a");
      el.className = "faller"; el.href = link(p); el.setAttribute("aria-label", p.title); el.style.width = w + "px";
      el.innerHTML = `<img src="${esc(p.hero)}" alt="" draggable="false">`;
      el.addEventListener("pointerdown", (e) => { e.preventDefault(); instant = true; location.hash = link(p); });
      el.addEventListener("click", (e) => e.preventDefault());
      layer.appendChild(el);
      items.push({ el, w, x: rnd(0.04, 0.96) * (W - w), y: -w * 1.6, v: H * rnd(0.5, 0.85), drift: rnd(-40, 40),
        ax: rnd(25, 55), ay: rnd(35, 65), az: rnd(6, 22), wx: rnd(1.2, 2.6), wy: rnd(1.4, 3), wz: rnd(0.5, 1.2), ph: rnd(0, 6.28), t: 0 });
    }

    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - prev) / 1000 || 0); prev = now;
      if (scrollY > innerHeight * 0.9) return;
      if (cv.width !== Math.round(gate.clientWidth * dpr) || cv.height !== Math.round(gate.clientHeight * dpr)) size();
      if (now > next && items.length < 7) { spawn(); next = now + rnd(330, 620); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H); ctx.lineCap = "round";
      // background: fine lines streaming down
      for (const s of streaks) {
        s.y += (s.v * dt) / H; if (s.y * H - s.len > H) { s.y = -0.05; s.x = Math.random(); }
        const x = s.x * W, y = s.y * H, gr = ctx.createLinearGradient(0, y - s.len, 0, y);
        gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, s.g ? `rgba(9,88,56,${s.a * 2.2})` : `rgba(0,0,0,${s.a})`);
        ctx.strokeStyle = gr; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y - s.len); ctx.lineTo(x, y); ctx.stroke();
      }
      items = items.filter((it) => {
        it.t += dt; it.y += it.v * dt; it.x += it.drift * dt;
        if (it.y > H + it.w) { it.el.remove(); return false; }
        const rx = it.ax * Math.sin(it.t * it.wx + it.ph), ry = it.ay * Math.sin(it.t * it.wy + it.ph * 1.7), rz = it.az * Math.sin(it.t * it.wz + it.ph * 0.6);
        it.el.style.transform = `translate3d(${it.x}px, ${it.y}px, 0) perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;
        // speed lines and fading echoes trailing each image
        const hgt = it.el.offsetHeight || it.w, cx = it.x + it.w / 2, cy = it.y + hgt / 2, squash = Math.abs(Math.cos((ry * Math.PI) / 180)), tail = it.v * 0.42;
        for (let k = 0; k < 6; k++) {
          const lx = cx + (k / 5 - 0.5) * it.w * squash * 0.9, top = it.y - tail * (0.55 + 0.45 * Math.sin(k * 2.4 + it.ph));
          const gr = ctx.createLinearGradient(0, top, 0, it.y + hgt * 0.3);
          gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, k === 2 ? "rgba(9,88,56,.75)" : "rgba(0,0,0,.34)");
          ctx.strokeStyle = gr; ctx.lineWidth = k === 2 ? 1.6 : 1; ctx.beginPath(); ctx.moveTo(lx, top); ctx.lineTo(lx, it.y + hgt * 0.3); ctx.stroke();
        }
        for (let k = 1; k <= 3; k++) {
          ctx.save(); ctx.translate(cx, cy - k * it.v * 0.07); ctx.rotate((rz * Math.PI) / 180); ctx.scale(squash, Math.abs(Math.cos((rx * Math.PI) / 180)));
          ctx.strokeStyle = `rgba(0,0,0,${0.2 - k * 0.055})`; ctx.lineWidth = 1; ctx.strokeRect(-it.w / 2, -hgt / 2, it.w, hgt); ctx.restore();
        }
        return true;
      });
    }
    // cursor reaching the bottom edge enters the home page
    const edge = (e) => {
      if (scrollY > 10 || e.clientY < innerHeight - 26 || e.movementY <= 0 || performance.now() - entered < 1500) return;
      entered = performance.now(); scrollTo({ top: innerHeight, behavior: "smooth" });
    };
    gate.addEventListener("mousemove", edge);
    size(); raf = requestAnimationFrame(frame);
    return { stop: () => { cancelAnimationFrame(raf); gate.removeEventListener("mousemove", edge); } };
  }

  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener("scroll", queue, { passive: true });
  addEventListener("resize", queue);
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
