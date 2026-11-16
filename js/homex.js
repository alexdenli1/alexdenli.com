/* Home, below the brands: a half-screen dial of projects, then a shattered-glass wall of all the work. */
(() => {
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const STEP = 34;           // degrees between projects on the dial
  const PER = 62;            // vh of scroll per project

  /* Nine pieces of broken glass. Four long cracks across the pane, tilted so nothing lines up.
     poly: the cut, in container %.  b: the piece's bounding box, so each image fills its own shard. */
  const P = [
    { poly: "0% 0%, 31% 0%, 28.9% 30.5%, 0% 34%", b: [0, 0, 31, 34], c: [15, 16] },
    { poly: "31% 0%, 62% 0%, 64.4% 26.3%, 28.9% 30.5%", b: [28.9, 0, 35.5, 30.5], c: [46.6, 14.2] },
    { poly: "62% 0%, 100% 0%, 100% 22%, 64.4% 26.3%", b: [62, 0, 38, 26.3], c: [81.6, 12.1] },
    { poly: "0% 34%, 28.9% 30.5%, 26.4% 65.4%, 0% 68%", b: [0, 30.5, 28.9, 37.5], c: [13.8, 49.5] },
    { poly: "28.9% 30.5%, 64.4% 26.3%, 67.5% 61.3%, 26.4% 65.4%", b: [26.4, 26.3, 41.1, 39.1], c: [46.8, 45.9] },
    { poly: "64.4% 26.3%, 100% 22%, 100% 58%, 67.5% 61.3%", b: [64.4, 22, 35.6, 39.3], c: [83, 41.9] },
    { poly: "0% 68%, 26.4% 65.4%, 24% 100%, 0% 100%", b: [0, 65.4, 26.4, 34.6], c: [12.6, 83.4] },
    { poly: "26.4% 65.4%, 67.5% 61.3%, 71% 100%, 24% 100%", b: [24, 61.3, 47, 38.7], c: [47.2, 81.7] },
    { poly: "67.5% 61.3%, 100% 58%, 100% 100%, 71% 100%", b: [67.5, 58, 32.5, 42], c: [84.6, 79.8] }
  ];
  const CRACKS = "M31 0 L28.9 30.5 L26.4 65.4 L24 100 M62 0 L64.4 26.3 L67.5 61.3 L71 100 M0 34 L28.9 30.5 L64.4 26.3 L100 22 M0 68 L26.4 65.4 L67.5 61.3 L100 58 M28.9 30.5 L46 12 M67.5 61.3 L88 76 M26.4 65.4 L11 92 M64.4 26.3 L84 9";

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

  function glass(list, cat) {
    const shards = list.slice(0, 9).map((p, i) => { const s = P[i], [bx, by, bw, bh] = s.b;
      const dx = (s.c[0] - 50) / 34, dy = (s.c[1] - 50) / 34;
      return `<a class="hx-sh" href="#/project/${esc(p.slug)}" style="--clip:polygon(${s.poly});--dx:${dx.toFixed(2)}%;--dy:${dy.toFixed(2)}%"
        aria-label="${esc(p.title)}, ${esc(cat(p))}">
        <span class="hx-shi" style="left:${bx}%;top:${by}%;width:${bw}%;height:${bh}%"><img src="${esc(p.hero)}" alt="" loading="lazy" draggable="false"></span>
        <span class="hx-shl" style="left:${s.c[0]}%;top:${s.c[1]}%"><b>${esc(p.title)}</b><small>${esc(cat(p))}</small></span></a>`; }).join("");
    return `<section class="hx-glass-s" aria-label="All work"><header class="hx-gh"><h2>Nine pieces of work</h2>
      <p>Every project, broken out. Take whichever catches your eye.</p></header>
      <div class="hx-glass">${shards}
        <svg class="hx-cr" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="${CRACKS}"/></svg>
      </div></section>`;
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
    if (skip) skip.addEventListener("click", () => { const g = document.querySelector(".hx-glass-s");
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

  window.HOMEX = { dial, glass, wire };
})();
