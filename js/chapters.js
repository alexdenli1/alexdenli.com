/* Home: one full-screen chapter per project, in data.js order.
   As a chapter scrolls in, its product slides in from the left, tied to the scroll position.
   A small badge pinned in the corner turns with the scroll and shows which chapter you are on.
   Clicking a chapter's picture (or its title) opens the project with the picture growing into
   the page's hero (app.js does the transition; the links carry data-vt for it).

   The wash behind each chapter (.ch-wash) is where the project's colour will wipe in, left to
   right, once the colours are signed off. Until then it has no colour. */
(() => {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad2 = (n) => String(n).padStart(2, "0");
  const picOf = (p) => p.chapter || (p.cut && p.thumb) || p.hero;
  const isCut = (p) => !!(p.chapter || (p.cut && p.thumb));

  function html(list) {
    const n = list.length;
    const ch = list.map((p, i) => {
      const href = "#/project/" + p.slug;
      return `<section class="ch${i % 2 ? " ch-r" : ""}${isCut(p) ? " ch-cut" : " ch-rect"}" data-slug="${esc(p.slug)}" aria-labelledby="ch-${esc(p.slug)}">
        <i class="ch-wash" aria-hidden="true"></i>
        <a class="ch-pic" href="${href}" data-vt data-slug="${esc(p.slug)}" tabindex="-1" aria-hidden="true">
          <img src="${esc(picOf(p))}" alt="" loading="${i < 2 ? "eager" : "lazy"}" decoding="async" draggable="false"></a>
        <div class="ch-tx">
          <p class="ch-year">${esc(p.year)}</p>
          <h2 class="ch-title" id="ch-${esc(p.slug)}"><a href="${href}" data-vt data-slug="${esc(p.slug)}">${esc(p.title)}</a></h2>
          <p class="ch-hook">${esc(p.summary || "")}</p>
        </div>
      </section>`;
    }).join("");
    const ring = "Selected work ".repeat(4);
    return `<div class="chs" aria-label="Selected work">${ch}</div>
      <div class="ch-badge" aria-hidden="true"><svg viewBox="0 0 120 120"><defs><path id="ch-ring" d="M60 60 m-47 0 a47 47 0 1 1 94 0 a47 47 0 1 1 -94 0"/></defs>
        <text><textPath href="#ch-ring" textLength="292">${ring}</textPath></text></svg>
        <span><b>01</b><small>/${pad2(n)}</small></span></div>`;
  }

  function wire() {
    const wrap = document.querySelector(".chs"), badge = document.querySelector(".ch-badge");
    if (!wrap || !window.MECH) return () => {};
    const M = window.MECH, secs = [...wrap.querySelectorAll(".ch")], n = secs.length;
    const num = badge.querySelector("b"), ring = badge.querySelector("svg");

    // each product slides in from beyond the left edge to its place as its chapter scrolls in
    secs.forEach((sec) => {
      const pic = sec.querySelector(".ch-pic"), wash = sec.querySelector(".ch-wash");
      M.stage(sec, { draw(p) {
        const travel = pic.offsetLeft + pic.offsetWidth + 40;
        pic.style.transform = p < 1 ? `translate3d(${(-(1 - p) * travel).toFixed(1)}px, 0, 0)` : "";
        wash.style.clipPath = `inset(0 ${((1 - p) * 100).toFixed(2)}% 0 0)`;
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
    return () => io.disconnect();
  }

  window.CHAPTERS = { html, wire };
})();
