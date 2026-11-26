/* Home: one project after another, in data.js order, on one quiet grid.
   The page is split down the middle: the product on one half, its year, title and one line of
   information on the other, changing sides from project to project. Nothing overlaps, every product
   is shown at about the same size, and the space between projects is always the same.

   One line runs down through all the projects, drawn as the page scrolls: it loops around each product
   (and weaves between the posters where a picture is a row of them) before travelling on to the next.
   It sits behind the products and the words. Each project has a turning "View project" badge.
   Clicking a product, a title or a badge opens the project with the picture growing into the page's
   hero (app.js does the transition; the links carry data-vt for it). */
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
  let badges = 0;
  /* the badge: "View project" turning round an arrow */
  const badge = (href, slug, title) => {
    const id = "chg" + ++badges;
    return `<a class="ch-go" href="${href}" data-vt data-slug="${slug}" aria-label="View project: ${esc(title)}">
      <svg viewBox="0 0 100 100" aria-hidden="true"><defs><path id="${id}" d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0"/></defs>
        <g class="ch-go-ring"><text><textPath href="#${id}" textLength="236">VIEW PROJECT · VIEW PROJECT ·</textPath></text></g>
        <circle class="ch-go-dot" cx="50" cy="50" r="22"/><path class="ch-go-arrow" d="M41 50h17m-7-7 7 7-7 7"/></svg></a>`;
  };

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
          ${badge(href, slug, p.title)}
        </div>
      </section>`;
    }).join("");
    return `<div class="chs" aria-label="Selected work"><svg class="ch-line" aria-hidden="true"><path class="ch-line-path"/><circle class="ch-line-head" r="5"/></svg>${ch}</div>`;
  }

  /* every product is shown at roughly the same size: the same area of visible product, whatever the
     picture's proportions or the transparent margin around a cut-out, and never outside its half.
     The gaps in a row of posters are noted too, for the line to weave through. */
  const SIZE = { adverts: 1.3 };   // a set of posters is partly gaps and wires, so it needs a little more
  const bounds = (im) => {
    if (im.__bb) return im.__bb;
    const s = 160 / Math.max(im.naturalWidth, im.naturalHeight), w = Math.max(1, Math.round(im.naturalWidth * s)), h = Math.max(1, Math.round(im.naturalHeight * s));
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(im, 0, 0, w, h);
    let d; try { d = x.getImageData(0, 0, w, h).data; } catch (e) { im.__gaps = []; return (im.__bb = [0, 0, 1, 1]); }
    let x0 = w, y0 = h, x1 = 0, y1 = 0;
    for (let y = 0; y < h; y++) for (let k = 0; k < w; k++) if (d[(y * w + k) * 4 + 3] > 24) { if (k < x0) x0 = k; if (k > x1) x1 = k; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    // clear columns through the middle of the picture, between its outer edges
    const gaps = []; let run = -1;
    for (let k = x0; k <= x1; k++) {
      let full = false; for (let y = Math.round(y0 + (y1 - y0) * .35); y < y0 + (y1 - y0) * .85; y++) if (d[(y * w + k) * 4 + 3] > 24) { full = true; break; }
      if (!full && run < 0) run = k; if (full && run >= 0) { if (k - run >= 2) gaps.push((run + k) / 2 / w); run = -1; }
    }
    im.__gaps = gaps;
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

  /* ---------- the line ---------- */
  const f1 = (v) => v.toFixed(1);
  /* a quarter turn of a loop that may be widening as it goes: from angle a (radii r0) to a + 90deg (radii r1), clockwise on screen */
  function quarter(cx, cy, a, r0, r1) {
    const K = .5523, c0 = Math.cos(a), s0 = Math.sin(a), b = a + Math.PI / 2, c1 = Math.cos(b), s1 = Math.sin(b);
    const p0 = [cx + r0[0] * c0, cy + r0[1] * s0], p3 = [cx + r1[0] * c1, cy + r1[1] * s1];
    const p1 = [p0[0] - K * r0[0] * s0, p0[1] + K * r0[1] * c0], p2 = [p3[0] + K * r1[0] * s1, p3[1] - K * r1[1] * c1];
    return { d: ` C${f1(p1[0])} ${f1(p1[1])} ${f1(p2[0])} ${f1(p2[1])} ${f1(p3[0])} ${f1(p3[1])}`, end: p3 };
  }

  function draw(wrap, svg, path, head) {
    const W = wrap.clientWidth, H = wrap.clientHeight, R = wrap.getBoundingClientRect(), phone = innerWidth <= 820, vh = innerHeight;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.style.height = H + "px";
    const top = R.top + scrollY;
    // where each product can be seen, on the page
    const items = [...wrap.querySelectorAll(".ch")].map((sec, i) => {
      const im = sec.querySelector(".ch-pic img"); if (!im.complete || !im.naturalWidth) return null;
      const [x0, y0, x1, y1] = bounds(im), r = im.getBoundingClientRect();
      const v = { x0: r.left - R.left + r.width * x0, y0: r.top - R.top + r.height * y0, x1: r.left - R.left + r.width * x1, y1: r.top - R.top + r.height * y1 };
      return { ...v, cx: (v.x0 + v.x1) / 2, cy: (v.y0 + v.y1) / 2, left: phone || !sec.classList.contains("ch-alt"), gaps: (im.__gaps || []).map((g) => r.left - R.left + r.width * g) };
    }).filter(Boolean);
    if (!items.length) return null;

    let d = "", at = [W / 2, 0], parts = [];
    const piece = (s, end) => { d += s; at = end; };
    const mark = (kind) => parts.push({ kind, d, at: at.slice() });
    d = `M${f1(W / 2)} 0`; mark("start");
    items.forEach((it, n) => {
      const pad = Math.max(18, Math.min(it.x1 - it.x0, it.y1 - it.y0) * .1), w2 = (it.x1 - it.x0) / 2 + pad, h2 = (it.y1 - it.y0) / 2 + pad;
      const rx = Math.min(w2, it.cx - 6, W - 6 - it.cx), ry = h2, weave = it.gaps.length >= 2 && !phone;
      // arrive heading right, just above the product (or above the first gap between posters)
      const ex = weave ? it.gaps[0] - pad * 1.2 : it.cx, ey = it.y0 - pad;
      const d1 = Math.max(60, (ey - at[1]) * .55), dir = parts.length && parts[parts.length - 1].exit;
      const c1 = dir === "down" ? [at[0], at[1] + d1] : dir === "left" ? [at[0] - d1 * .9, at[1] + d1 * .3] : [at[0], at[1] + d1];
      // on a phone the words take the full width, so the line keeps to the right-hand margin between products
      if (phone && n) { const m = W - Math.max(8, parseFloat(getComputedStyle(wrap).paddingRight) * .45), ya = at[1] + 50, yb = ey - 70;
        piece(` C${f1(at[0])} ${f1(at[1] + 30)} ${f1(m)} ${f1(at[1] + 10)} ${f1(m)} ${f1(ya)} L${f1(m)} ${f1(yb)} C${f1(m)} ${f1(ey)} ${f1(ex + 40)} ${f1(ey)} ${f1(ex)} ${f1(ey)}`, [ex, ey]);
      } else piece(` C${f1(c1[0])} ${f1(c1[1])} ${f1(ex - Math.max(80, d1 * .8))} ${f1(ey)} ${f1(ex)} ${f1(ey)}`, [ex, ey]);
      mark("enter");
      let exit;
      if (weave) {
        // down between the first two posters, under the middle one, up between the next two, over the last and round its far side
        const g1 = it.gaps[0], g2 = it.gaps[1], b = it.y1 + pad, t = it.y0 - pad, U = pad * 1.6, xr = it.x1 + pad;
        piece(` C${f1(g1)} ${f1(t)} ${f1(g1)} ${f1(t)} ${f1(g1)} ${f1(t + U)} L${f1(g1)} ${f1(b - U)} C${f1(g1)} ${f1(b + U)} ${f1(g2)} ${f1(b + U)} ${f1(g2)} ${f1(b - U)}`
          + ` L${f1(g2)} ${f1(t + U)} C${f1(g2)} ${f1(t - U)} ${f1(xr)} ${f1(t - U)} ${f1(xr)} ${f1(t + U)} L${f1(xr)} ${f1(b - U)} C${f1(xr)} ${f1(b + U * .6)} ${f1(it.cx + pad)} ${f1(b + U * .6)} ${f1(it.cx)} ${f1(b + U * .6)}`, [it.cx, b + U * .6]);
        exit = "left";
      } else {
        // a loop round the product, widening a little as it goes, ending at its far side heading on
        const turns = it.left ? 5 : 6;
        if (Math.abs(ex - it.cx) > 1) piece(` L${f1(it.cx)} ${f1(it.cy - ry)}`, [it.cx, it.cy - ry]);
        for (let q = 0; q < turns; q++) { const g0 = 1 + .018 * q, g1 = 1 + .018 * (q + 1), Q = quarter(it.cx, it.cy, -Math.PI / 2 + q * Math.PI / 2, [rx * g0, ry * g0], [rx * g1, ry * g1]); piece(Q.d, Q.end); }
        exit = it.left ? "down" : "left";
      }
      mark("loop"); parts[parts.length - 1].exit = exit; parts[parts.length - 1].it = it;
    });
    // and away down the page
    piece(` C${f1(at[0])} ${f1(at[1] + 120)} ${f1(at[0])} ${f1(H - 160)} ${f1(at[0])} ${f1(H)}`, [at[0], H]); mark("end");

    path.setAttribute("d", d);
    // how far along the line each mark is, and the scroll at which the line should have reached it
    const probe = document.createElementNS("http://www.w3.org/2000/svg", "path"); svg.appendChild(probe);
    const len = (s) => { probe.setAttribute("d", s); return probe.getTotalLength(); };
    const total = path.getTotalLength(), keys = [];
    parts.forEach((p) => {
      const L = p.kind === "end" ? total : len(p.d);
      const y = p.kind === "start" ? 0 : p.kind === "end" ? H : p.kind === "loop" ? p.it.y1 : p.at[1];
      const s = top + y - vh * (p.kind === "start" ? .9 : p.kind === "loop" ? .6 : .78);
      keys.push([keys.length ? Math.max(keys[keys.length - 1][0] + 1, s) : s, L]);
    });
    probe.remove();
    path.style.strokeDasharray = `${total} ${total}`;
    return { total, keys, path, head };
  }
  function scrubLine(L, reduce) {
    if (!L) return;
    let v = L.total;
    if (!reduce) {
      const y = scrollY, k = L.keys;
      if (y <= k[0][0]) v = 0; else if (y >= k[k.length - 1][0]) v = L.total;
      else for (let i = 1; i < k.length; i++) if (y < k[i][0]) { const t = (y - k[i - 1][0]) / (k[i][0] - k[i - 1][0]); v = k[i - 1][1] + (k[i][1] - k[i - 1][1]) * t; break; }
    }
    L.path.style.strokeDashoffset = (L.total - v).toFixed(1);
    const p = L.path.getPointAtLength(v);
    L.head.setAttribute("cx", p.x.toFixed(1)); L.head.setAttribute("cy", p.y.toFixed(1));
    L.head.style.opacity = v > 2 && v < L.total - 2 ? 1 : 0;
  }

  function wire() {
    const wrap = document.querySelector(".chs");
    if (!wrap) return () => {};
    const secs = [...wrap.querySelectorAll(".ch")], svg = wrap.querySelector(".ch-line"), path = svg.querySelector(".ch-line-path"), head = svg.querySelector(".ch-line-head");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let L = null, queued = 0;
    const redo = () => { if (!wrap.isConnected) return; fit(secs); L = draw(wrap, svg, path, head); scrubLine(L, reduce); };
    const later = () => { cancelAnimationFrame(queued); queued = requestAnimationFrame(redo); };

    redo();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(later);
    // a product's size is only known once its picture has loaded
    secs.forEach((s) => { const im = s.querySelector(".ch-pic img"); if (!im.complete) im.addEventListener("load", later, { once: true }); });
    const onResize = () => { if (!wrap.isConnected) { removeEventListener("resize", onResize); return; } later(); };
    addEventListener("resize", onResize);
    if (window.ResizeObserver) new ResizeObserver(later).observe(wrap);
    let tick = 0;
    const onScroll = () => { if (!wrap.isConnected) { removeEventListener("scroll", onScroll); return; } if (!tick) tick = requestAnimationFrame(() => { tick = 0; scrubLine(L, reduce); }); };
    addEventListener("scroll", onScroll, { passive: true });
    return () => { removeEventListener("resize", onResize); removeEventListener("scroll", onScroll); };
  }

  window.CHAPTERS = { html, wire, inkOn };
})();
