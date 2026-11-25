/* Home: one chapter per project, in data.js order.
   The project's title is set huge across the width as a backdrop, and the product sits in front of
   it, covering part of it. One small line of information sits in the space left over. Chapters are
   not boxed screens: each product runs over the edge into the next chapter, and the title drifts up
   a little slower than the product, so the work flows on from one project to the next.

   As a chapter scrolls in, its product slides in from the left, tied to the scroll position.
   Clicking a product (or a title) opens the project with the picture growing into the page's hero
   (app.js does the transition; the links carry data-vt for it).

   Chapters are black on white. The project colours are used only in the Index of works and the
   next-project link. */
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

  /* a long title breaks into two lines at the word nearest its middle, so each line can be set big */
  const linesOf = (t) => {
    const w = String(t).split(" ");
    if (w.length < 2 || t.length < 11) return [t];
    let best = 1, diff = 1e9;
    for (let i = 1; i < w.length; i++) { const d = Math.abs(w.slice(0, i).join(" ").length - w.slice(i).join(" ").length); if (d < diff) { diff = d; best = i; } }
    return [w.slice(0, best).join(" "), w.slice(best).join(" ")];
  };

  function html(list) {
    const ch = list.map((p, i) => {
      const href = "#/project/" + p.slug;
      const lines = linesOf(p.title).map((l) => `<span>${esc(l)}</span>`).join(""), info = `<em>${esc(p.year)}</em> ${esc(p.summary || "")}`;
      return `<section class="ch${isCut(p) ? " ch-cut" : " ch-rect"}" data-slug="${esc(p.slug)}" aria-labelledby="ch-${esc(p.slug)}">
        <h2 class="ch-title" id="ch-${esc(p.slug)}"><a href="${href}" data-vt data-slug="${esc(p.slug)}">${lines}</a></h2>
        <a class="ch-pic" href="${href}" data-vt data-slug="${esc(p.slug)}" tabindex="-1" aria-hidden="true">
          <img src="${esc(picOf(p))}" alt="" decoding="async" draggable="false"></a>
        <p class="ch-info">${info}</p>
      </section>`;
    }).join("");
    return `<div class="chs" aria-label="Selected work">${ch}</div>`;
  }

  /* Each chapter has its own arrangement, so the run of projects reads as a spread of work rather than
     one template repeated. Fractions of the chapter's width and height:
       t   title: which side it hangs from, how far down, and how wide its longest line is
       c   the centre of the product's visible shape (it may sit low enough to run into the next chapter)
     The info line takes the bottom corner on the side away from the product. Cycles past seven. */
  const LAYOUT = [
    { t: ["left", 0.10, 0.62], c: [0.33, 0.64] },
    { t: ["right", 0.26, 0.66], c: [0.24, 0.72] },
    { t: ["left", 0.06, 0.70], c: [0.68, 0.60] },
    { t: ["right", 0.12, 0.56], c: [0.30, 0.50] },
    { t: ["centre", 0.34, 0.56], c: [0.83, 0.56] },
    { t: ["left", 0.40, 0.54], c: [0.62, 0.46] },
    { t: ["right", 0.08, 0.72], c: [0.30, 0.62] }
  ];
  /* every product is shown at roughly the same size: the same area of visible product, whatever the
     picture's proportions or the transparent margin around a cut-out */
  const AREA = 0.32;            // visible product area, as a share of the screen height squared
  const MAX_H = 0.76, MAX_W = 0.46;   // and never taller than this share of the screen height, or wider than this of its width
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
    const W = innerWidth, H = innerHeight;
    const pad = parseFloat(getComputedStyle(secs[0]).paddingLeft) || 0;
    if (W <= 820) {
      // phone: chapters stack; each title only has to fit the width of the screen
      secs.forEach((sec) => {
        const h = sec.querySelector(".ch-title"), spans = [...h.querySelectorAll("span")];
        h.style.setProperty("--fs", "100px"); h.style.top = "";
        const wide = Math.max(...spans.map((s) => s.getBoundingClientRect().width)) || 1;
        h.style.setProperty("--fs", Math.min(100 * (W - 2 * pad) / wide, W * 0.3).toFixed(1) + "px");
        const im = sec.querySelector(".ch-pic img"), pic = sec.querySelector(".ch-pic"), info = sec.querySelector(".ch-info");
        im.style.width = im.style.height = im.style.transform = pic.style.left = pic.style.top = info.style.maxWidth = info.style.whiteSpace = "";
        // a cut-out with a lot of empty space round it is grown and centred on what can be seen of it
        if (im.complete && im.naturalWidth && sec.classList.contains("ch-cut")) {
          const [x0, y0, x1, y1] = bounds(im), ar = im.naturalWidth / im.naturalHeight, bw = im.offsetWidth, bh = im.offsetHeight;
          const cw = Math.min(bw, bh * ar), ch = cw / ar, k = Math.min((W - 2 * pad) / (cw * (x1 - x0)), H * 0.46 / (ch * (y1 - y0)));
          if (k > 1.08) im.style.transform = `scale(${k.toFixed(3)}) translate(${(-((x0 + x1) / 2 - 0.5) * cw).toFixed(1)}px, ${(-((y0 + y1) / 2 - 0.5) * ch).toFixed(1)}px)`;
        }
      });
      return;
    }
    secs.forEach((sec, i) => {
      const L = LAYOUT[i % LAYOUT.length];
      const h = sec.querySelector(".ch-title"), spans = [...h.querySelectorAll("span")];
      const pic = sec.querySelector(".ch-pic"), im = pic.querySelector("img"), info = sec.querySelector(".ch-info");
      const chH = sec.offsetHeight; im.style.transform = "";

      // the title: its longest line takes the chosen share of the width, within a height limit
      h.style.setProperty("--fs", "100px");
      const wide = Math.max(...spans.map((s) => s.getBoundingClientRect().width)) || 1;
      const fs = Math.min(100 * (W * L.t[2]) / wide, (H * 0.5) / (spans.length * 0.82));
      h.style.setProperty("--fs", fs.toFixed(1) + "px");
      h.dataset.align = L.t[0];
      const navH = (document.getElementById("nav") || {}).offsetHeight || 0;   // titles start below the nav bar
      h.style.top = (navH + (chH - navH) * L.t[1]).toFixed(0) + "px";

      // the product: sized by its visible area, centred on the chosen point
      if (im.complete && im.naturalWidth) {
        const [x0, y0, x1, y1] = bounds(im), nw = im.naturalWidth, nh = im.naturalHeight;
        const ca = ((x1 - x0) * nw) / ((y1 - y0) * nh), A = AREA * H * H;
        const vis = Math.min(Math.sqrt(A / ca), H * MAX_H, (W * MAX_W) / ca), ih = vis / (y1 - y0), iw = ih * nw / nh;
        im.style.width = iw.toFixed(0) + "px"; im.style.height = ih.toFixed(0) + "px";
        const left = W * L.c[0] - iw * (x0 + x1) / 2, top = chH * L.c[1] - ih * (y0 + y1) / 2;
        pic.style.left = left.toFixed(0) + "px"; pic.style.top = top.toFixed(0) + "px";
        // the info line: the bottom corner away from the product, one line where it fits beside it
        const onRight = L.c[0] < 0.5, gap = 40, vis0 = left + iw * x0, vis1 = left + iw * x1;
        info.dataset.side = onRight ? "right" : "left";
        const free = onRight ? W - pad - vis1 - gap : vis0 - pad - gap;
        info.style.maxWidth = Math.max(280, free).toFixed(0) + "px";
        info.style.whiteSpace = "nowrap";
        if (info.scrollWidth > info.clientWidth + 1) info.style.whiteSpace = "normal";
      }
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

    // as each chapter scrolls in: the product slides in from the left, the title rises a little slower
    secs.forEach((sec) => {
      const pic = sec.querySelector(".ch-pic"), title = sec.querySelector(".ch-title");
      M.stage(sec, { draw(p) {
        const q = 1 - p;
        pic.style.transform = q > 0 ? `translate3d(${(-q * 0.42 * innerWidth).toFixed(1)}px, 0, 0)` : "";
        title.style.transform = q > 0 ? `translate3d(0, ${(q * 0.16 * innerHeight).toFixed(1)}px, 0)` : "";
      } }, { pin: false, span: 1 });
    });

    return () => { removeEventListener("resize", onResize); };
  }

  window.CHAPTERS = { html, wire, inkOn };
})();
