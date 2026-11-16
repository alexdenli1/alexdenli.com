/* Home, below the brands: a half-screen dial of projects, then a mosaic of all the work. */
(() => {
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const STEP = 34;           // degrees between projects on the dial
  const PER = 62;            // vh of scroll per project

  /* The mosaic below the dial: twelve columns, varied spans, offsets and crops so no two tiles match. */
  const M = [[5, 0, "4 / 3"], [4, 7, "1 / 1"], [3, 2, "3 / 4"], [3, 0, "3 / 4"], [5, 6, "4 / 3"], [4, 1, "1 / 1"], [4, 0, "1 / 1"], [3, 5, "3 / 4"], [5, 2, "4 / 3"]];

  function dial(list, cat) {
    const spokes = list.map((p, i) => `<button class="hx-sp${i ? "" : " on"}" style="--a:${(i * STEP).toFixed(2)}deg" data-i="${i}"
      aria-label="Show ${esc(p.title)}"><span class="hx-th"><img src="${esc(p.hero)}" alt="" loading="lazy" draggable="false"></span></button>`).join("");
    const panels = list.map((p, i) => `<article class="hx-pn${i ? "" : " on"}" data-i="${i}" ${i ? 'aria-hidden="true"' : ""}>
      <figure class="hx-bn"><img src="${esc(p.hero)}" alt="${esc(p.title)}" loading="${i ? "lazy" : "eager"}" draggable="false"></figure>
      <div class="hx-tx"><p class="hx-meta"><span>${esc(cat(p))}</span><span>${esc(p.year)}</span>${p.study ? "<span>Case study</span>" : ""}</p>
        <h3>${esc(p.title)}</h3><p class="hx-sum">${esc(p.summary || "")}</p>
        <a class="hx-go" href="#/project/${esc(p.slug)}" tabindex="${i ? -1 : 0}">Let's go <i aria-hidden="true">&rarr;</i></a></div>
    </article>`).join("");
    return `<section class="hx-wheel" aria-label="Projects" style="height:calc(${list.length * PER}vh + 100vh)"><div class="hx-stage">
      <div class="hx-dial"><div class="hx-ring">${spokes}</div></div>
      <div class="hx-pns">${panels}</div>
      <p class="hx-count"><b>01</b><i></i><span>${String(list.length).padStart(2, "0")}</span></p>
      <button class="hx-skip" type="button">Skip the reel <i aria-hidden="true">&darr;</i></button>
    </div></section>`;
  }

  function mosaic(list, cat) {
    const tiles = list.map((p, i) => { const m = M[i % M.length];
      return `<li style="--sp:${m[0]};--mt:${m[1]}vh"><a href="#/project/${esc(p.slug)}">
        <span class="hx-im" style="aspect-ratio:${m[2]}"><img src="${esc(p.hero)}" alt="" loading="lazy" draggable="false"></span>
        <span class="hx-cap"><b>${esc(p.title)}</b><small>${esc(p.year)} &middot; ${esc(cat(p))}${p.study ? " &middot; Case study" : ""}</small></span></a></li>`; }).join("");
    return `<section class="hx-mos" aria-label="All work"><header class="hx-mh"><h2>All of it</h2>
      <p>Every project, newest first. Take whichever catches your eye.</p></header>
      <ol class="hx-grid">${tiles}</ol></section>`;
  }

  let off = [];
  function wire() {
    off.forEach((f) => f()); off = [];
    const sec = document.querySelector(".hx-wheel");
    if (!sec) return;
    const $ = (s, r = sec) => r.querySelector(s), $$ = (s, r = sec) => Array.from(r.querySelectorAll(s));
    const ring = $(".hx-ring"), sps = $$(".hx-sp"), pns = $$(".hx-pn"), N = pns.length;
    const num = $(".hx-count b"), skip = $(".hx-skip");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const flat = () => reduce || innerWidth < 1000;

    let k = -1;
    const setK = (i) => {
      if (i === k) return; k = i;
      sps.forEach((s, j) => s.classList.toggle("on", j === i));
      pns.forEach((p, j) => { const on = j === i; p.classList.toggle("on", on); p.toggleAttribute("aria-hidden", !on);
        const a = p.querySelector(".hx-go"); if (a) a.tabIndex = on ? 0 : -1; });
      if (num) num.textContent = String(i + 1).padStart(2, "0");
    };

    const at = (i) => { const r = sec.getBoundingClientRect(), span = sec.offsetHeight - innerHeight;
      scrollTo({ top: r.top + scrollY + (N > 1 ? (i / (N - 1)) * span : 0) + 2, behavior: reduce ? "auto" : "smooth" }); };
    sps.forEach((s) => s.addEventListener("click", () => flat() ? pns[+s.dataset.i].scrollIntoView({ behavior: "smooth" }) : at(+s.dataset.i)));
    if (skip) skip.addEventListener("click", () => { const g = document.querySelector(".hx-mos");
      g && scrollTo({ top: g.getBoundingClientRect().top + scrollY - 10, behavior: reduce ? "auto" : "smooth" }); });

    let raf = 0;
    const tick = () => {
      raf = 0;
      if (!sec.isConnected) { off.forEach((f) => f()); off = []; return; }
      if (flat()) { sec.classList.add("flat"); setK(0); if (ring) ring.style.removeProperty("--r"); return; }
      sec.classList.remove("flat");
      const r = sec.getBoundingClientRect(), span = Math.max(1, sec.offsetHeight - innerHeight);
      const t = Math.min(1, Math.max(0, -r.top / span)), prog = t * (N - 1);
      ring.style.setProperty("--r", (-prog * STEP).toFixed(3) + "deg");
      sec.style.setProperty("--t", t.toFixed(4));
      setK(Math.round(prog));
    };
    const q = () => { if (!raf) raf = requestAnimationFrame(tick); };
    addEventListener("scroll", q, { passive: true }); addEventListener("resize", q);
    off.push(() => { removeEventListener("scroll", q); removeEventListener("resize", q); cancelAnimationFrame(raf); });
    tick(); setTimeout(tick, 200);
  }

  window.HOMEX = { dial, mosaic, wire };
})();
