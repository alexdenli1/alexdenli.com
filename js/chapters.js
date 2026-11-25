/* Home: one project after another, in data.js order, on one quiet grid.
   The page is split down the middle: the product on one half, its year, title and one line of
   information on the other, changing sides from project to project. Nothing overlaps, every product
   is shown at about the same size, and the space between projects is always the same.

   As a project scrolls in, its product drifts the last few steps in from the left, tied to the scroll.
   Clicking a product (or a title) opens the project with the picture growing into the page's hero
   (app.js does the transition; the links carry data-vt for it). */
(() => {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const picOf = (p) => p.chapter || (p.cut && p.thumb) || p.hero;
  const isCut = (p) => !!(p.chapter || (p.cut && p.thumb));
  /* the type on a project's colour: black or cream, whichever stands out more against it */
  const CREAM = "#EEE9E3";
  const lum = (hex) => {
    const v = parseInt(String(hex).slice(1), 16);
    const c = [v >> 16, (v >> 8) & 255, v & 255].map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const inkOn = (hex) => {
    if (!/^#[0-9a-f]{6}$/i.test(hex || "")) return CREAM;
    const L = lum(hex), withCream = (lum(CREAM) + 0.05) / (L + 0.05), withBlack = (L + 0.05) / 0.05;
    return withCream >= withBlack ? CREAM : "#000000";
  };

  /* project names are set one word to a line, so every name can be big */
  const linesOf = (t) => String(t).split(" ");

  function html(list) {
    const ch = list.map((p, i) => {
      const href = "#/project/" + p.slug, slug = esc(p.slug);
      return `<section class="ch${i % 2 ? " ch-alt" : ""}${isCut(p) ? " ch-cut" : ""}" data-slug="${slug}" aria-labelledby="ch-${slug}">
        <a class="ch-pic" href="${href}" data-vt data-slug="${slug}" tabindex="-1" aria-hidden="true">
          <img src="${esc(picOf(p))}" alt="" decoding="async" draggable="false"></a>
        <div class="ch-tx">
          <p class="ch-year">${esc(p.year)}</p>
          <h2 class="ch-title" id="ch-${slug}"><a href="${href}" data-vt data-slug="${slug}">${linesOf(p.title).map((l) => `<span>${esc(l)}</span>`).join(" ")}</a></h2>
          <p class="ch-info">${esc(p.summary || "")}</p>
        </div>
      </section>`;
    }).join("");
    return `<div class="chs" aria-label="Selected work">${ch}</div>`;
  }

  /* every product is shown at roughly the same size: the same area of visible product, whatever the
     picture's proportions or the transparent margin around a cut-out, and never outside its half */
  const SIZE = { adverts: 1.3 };   // a set of posters is partly gaps and wires, so it needs a little more
  const bounds = (im) => {
    if (im.__bb) return im.__bb;
    const s = 160 / Math.max(im.naturalWidth, im.naturalHeight), w = Math.max(1, Math.round(im.naturalWidth * s)), h = Math.max(1, Math.round(im.naturalHeight * s));
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(im, 0, 0, w, h);
    let d; try { d = x.getImageData(0, 0, w, h).data; } catch (e) { return (im.__bb = [0, 0, 1, 1]); }
    let x0 = w, y0 = h, x1 = 0, y1 = 0;
    for (let y = 0; y < h; y++) for (let k = 0; k < w; k++) if (d[(y * w + k) * 4 + 3] > 24) { if (k < x0) x0 = k; if (k > x1) x1 = k; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    return (im.__bb = x1 < x0 ? [0, 0, 1, 1] : [x0 / w, y0 / h, (x1 + 1) / w, (y1 + 1) / h]);
  };

  function fit(secs) {
    const phone = innerWidth <= 820;
    secs.forEach((sec) => {
      const pic = sec.querySelector(".ch-pic"), im = pic.querySelector("img"), info = sec.querySelector(".ch-info");
      const w = pic.clientWidth, h = pic.clientHeight;
      if (im.complete && im.naturalWidth) {
        const [x0, y0, x1, y1] = bounds(im), nw = im.naturalWidth, nh = im.naturalHeight, ca = ((x1 - x0) * nw) / ((y1 - y0) * nh);
        const area = (phone ? 0.62 * w * w : 0.3 * innerHeight * innerHeight) * Math.pow(SIZE[sec.dataset.slug] || 1, 2);
        const vis = Math.min(Math.sqrt(area / ca), h, w / ca), ih = vis / (y1 - y0), iw = ih * nw / nh;
        im.style.width = iw.toFixed(1) + "px"; im.style.height = ih.toFixed(1) + "px";
        // the part that can be seen sits in the middle of its half
        im.style.left = (w / 2 - iw * (x0 + x1) / 2).toFixed(1) + "px"; im.style.top = (h / 2 - ih * (y0 + y1) / 2).toFixed(1) + "px";
      }
      // one line of information wherever it fits
      info.style.whiteSpace = phone ? "" : "nowrap";
      if (!phone && info.scrollWidth > info.clientWidth + 1) info.style.whiteSpace = "";
    });
  }

  function wire() {
    const wrap = document.querySelector(".chs");
    if (!wrap || !window.MECH) return () => {};
    const M = window.MECH, secs = [...wrap.querySelectorAll(".ch")];

    fit(secs);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => wrap.isConnected && fit(secs));
    // a product's size is only known once its picture has loaded
    secs.forEach((s) => { const im = s.querySelector(".ch-pic img"); if (!im.complete) im.addEventListener("load", () => wrap.isConnected && fit(secs), { once: true }); });
    const onResize = () => wrap.isConnected && fit(secs);
    addEventListener("resize", onResize);

    // the product drifts the last few steps in from the left as its project scrolls in
    secs.forEach((sec) => {
      const pic = sec.querySelector(".ch-pic");
      M.stage(sec, { draw(p) { const q = 1 - p; pic.style.transform = q > 0 ? `translate3d(${(-q * 0.045 * innerWidth).toFixed(1)}px, 0, 0)` : ""; } }, { pin: false, span: 0.75 });
    });

    return () => { removeEventListener("resize", onResize); };
  }

  window.CHAPTERS = { html, wire, inkOn };
})();
