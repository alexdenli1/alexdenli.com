/* Home: one chapter per project, in data.js order.
   The project's title is set huge across the width as a backdrop, and the product sits in front of
   it, covering part of it. One small line of information sits in the space left over. Chapters are
   not boxed screens: each product runs over the edge into the next chapter, and the title drifts up
   a little slower than the product, so the work flows on from one project to the next.

   As a chapter scrolls in, its product slides in from the left, tied to the scroll position.
   A small badge pinned in the corner turns with the scroll and shows which chapter you are on.
   Clicking a product (or a title) opens the project with the picture growing into the page's hero
   (app.js does the transition; the links carry data-vt for it).

   The wash behind each chapter (.ch-wash) is where the project's colour will wipe in, left to
   right, once the colours are signed off. Until then it has no colour. */
(() => {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad2 = (n) => String(n).padStart(2, "0");
  const picOf = (p) => p.chapter || (p.cut && p.thumb) || p.hero;
  const isCut = (p) => !!(p.chapter || (p.cut && p.thumb));

  /* a long title breaks into two lines at the word nearest its middle, so each line can be set big */
  const linesOf = (t) => {
    const w = String(t).split(" ");
    if (w.length < 2 || t.length < 11) return [t];
    let best = 1, diff = 1e9;
    for (let i = 1; i < w.length; i++) { const d = Math.abs(w.slice(0, i).join(" ").length - w.slice(i).join(" ").length); if (d < diff) { diff = d; best = i; } }
    return [w.slice(0, best).join(" "), w.slice(best).join(" ")];
  };

  function html(list) {
    const n = list.length;
    const ch = list.map((p, i) => {
      const href = "#/project/" + p.slug;
      return `<section class="ch${i % 2 ? " ch-r" : " ch-l"}${isCut(p) ? " ch-cut" : " ch-rect"}" data-slug="${esc(p.slug)}" aria-labelledby="ch-${esc(p.slug)}">
        <i class="ch-wash" aria-hidden="true"></i>
        <h2 class="ch-title" id="ch-${esc(p.slug)}"><a href="${href}" data-vt data-slug="${esc(p.slug)}">${linesOf(p.title).map((l) => `<span>${esc(l)}</span>`).join("")}</a></h2>
        <a class="ch-pic" href="${href}" data-vt data-slug="${esc(p.slug)}" tabindex="-1" aria-hidden="true">
          <img src="${esc(picOf(p))}" alt="" decoding="async" draggable="false"></a>
        <p class="ch-info"><em>${esc(p.year)}</em> ${esc(p.summary || "")}</p>
      </section>`;
    }).join("");
    const ring = "Selected work ".repeat(4);
    return `<div class="chs" aria-label="Selected work">${ch}</div>
      <div class="ch-badge" aria-hidden="true"><svg viewBox="0 0 120 120"><defs><path id="ch-ring" d="M60 60 m-47 0 a47 47 0 1 1 94 0 a47 47 0 1 1 -94 0"/></defs>
        <text><textPath href="#ch-ring" textLength="292">${ring}</textPath></text></svg>
        <span><b>01</b><small>/${pad2(n)}</small></span></div>`;
  }

  /* every title fills the width: its widest line meets both margins, within a height limit.
     Then the product is set against it: over the lower part of a one-line title, and below the first
     line of a two-line one so the second line still reads. The info line takes the room beside it. */
  function fit(secs) {
    if (innerWidth <= 820) return;
    const W = innerWidth, H = innerHeight;
    const pad = parseFloat(getComputedStyle(secs[0]).paddingLeft) || 0;
    secs.forEach((sec) => {
      const h = sec.querySelector(".ch-title"), spans = [...h.querySelectorAll("span")];
      const pic = sec.querySelector(".ch-pic"), info = sec.querySelector(".ch-info"), rect = sec.classList.contains("ch-rect");
      h.style.setProperty("--fs", "100px");
      const wide = Math.max(...spans.map((s) => s.getBoundingClientRect().width)) || 1;
      const fs = Math.min(100 * (W - 2 * pad) / wide, (H * 0.66) / (spans.length * 0.82));
      h.style.setProperty("--fs", fs.toFixed(1) + "px");
      const tTop = h.offsetTop, tH = spans.length * 0.82 * fs, chH = sec.offsetHeight;
      const top = tTop + tH * (spans.length > 1 ? 0.6 : rect ? 0.62 : 0.3);
      pic.style.top = top.toFixed(0) + "px";
      if (!rect) pic.style.height = Math.max(H * 0.56, Math.min(H * 0.84, chH * 1.12 - top)).toFixed(0) + "px";
      // the info line: one line where it fits beside the product, two where it does not
      const right = sec.classList.contains("ch-r"), gap = 40;
      const free = right ? pic.offsetLeft - pad - gap : W - (pic.offsetLeft + pic.offsetWidth) - pad - gap;
      info.style.maxWidth = Math.max(260, free).toFixed(0) + "px";
      info.style.whiteSpace = "nowrap";
      if (info.scrollWidth > info.clientWidth + 1) info.style.whiteSpace = "normal";
    });
  }

  function wire() {
    const wrap = document.querySelector(".chs"), badge = document.querySelector(".ch-badge");
    if (!wrap || !window.MECH) return () => {};
    const M = window.MECH, secs = [...wrap.querySelectorAll(".ch")], n = secs.length;
    const num = badge.querySelector("b"), ring = badge.querySelector("svg");

    fit(secs);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => wrap.isConnected && fit(secs));
    // a product's size is only known once its picture has loaded
    secs.forEach((s) => { const im = s.querySelector(".ch-pic img"); if (!im.complete) im.addEventListener("load", () => wrap.isConnected && fit(secs), { once: true }); });
    const onResize = () => wrap.isConnected && fit(secs);
    addEventListener("resize", onResize);

    // as each chapter scrolls in: the product slides in from the left, the title rises a little slower
    secs.forEach((sec) => {
      const pic = sec.querySelector(".ch-pic"), title = sec.querySelector(".ch-title"), wash = sec.querySelector(".ch-wash");
      M.stage(sec, { draw(p) {
        const q = 1 - p;
        pic.style.transform = q > 0 ? `translate3d(${(-q * 0.42 * innerWidth).toFixed(1)}px, 0, 0)` : "";
        title.style.transform = q > 0 ? `translate3d(0, ${(q * 0.16 * innerHeight).toFixed(1)}px, 0)` : "";
        wash.style.clipPath = `inset(0 ${(q * 100).toFixed(2)}% 0 0)`;
      } }, { pin: false, span: 1 });
    });

    // the badge: which chapter holds the middle of the screen, and a turn tied to the scroll
    let cur = -1;
    M.stage(wrap, { draw(p) {
      const k = Math.min(n - 1, Math.max(0, Math.round(p * (n - 1))));
      if (k !== cur) { cur = k; num.textContent = pad2(k + 1); }
      ring.style.transform = `rotate(${(p * 300).toFixed(2)}deg)`;
    } });
    const io = new IntersectionObserver((es) => { const on = es[0].isIntersecting && wrap.isConnected;
      badge.classList.toggle("on", on); document.documentElement.classList.toggle("ch-on", on); }, { rootMargin: "-45% 0px -45% 0px" });
    io.observe(wrap);
    return () => { io.disconnect(); removeEventListener("resize", onResize); };
  }

  window.CHAPTERS = { html, wire };
})();
