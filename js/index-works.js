/* Index of works — the bottom of the home page.
   Every project is one long line of type, and every line is always drifting left on its own, each starting
   from a different point and moving at its own pace, looping without a seam.
   Rest on a line for 1 second and everything stops and dims; that line shoots back to its start, reads out
   to the left, and the list slides to the right half with the project's image opening on the left.
   Leave the index and every line carries on from where it stopped. */
(function () {
  "use strict";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const DWELL = 1000;  // ms resting on one line before everything stops and the image opens
  const BACK = 0.55;   // s the chosen line takes to shoot back to its start
  const READ = 230;    // px a second while the chosen line reads out to the left

  function render(list, cat, link) {
    const rows = list.map((p, i) => {
      const text = esc(String(p.line || p.summary || "").replace(/\.$/, ""));
      return `<li><a class="iw-row" href="${link(p)}" data-i="${i}" data-img="${esc(p.hero)}">
        <span class="iw-run"><span class="iw-t"><b class="iw-name">${esc(p.title)}</b> <i>(${esc(parseInt(p.year, 10))})</i> — ${text}</span></span></a></li>`;
    }).join("");
    return `<section class="iw" aria-label="Index of works">
      <header class="iw-head"><h2>Index<br><i>of works</i></h2></header>
      <div class="iw-body">
        <figure class="iw-pic" aria-hidden="true"><img alt="" draggable="false"><img alt="" draggable="false"></figure>
        <ol class="iw-list">${rows}</ol>
      </div></section>`;
  }

  function wire() {
    const sec = document.querySelector(".iw"); if (!sec) return;
    const body = sec.querySelector(".iw-body"), pic = sec.querySelector(".iw-pic"), imgs = pic.querySelectorAll("img");
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // one record per line: pos is how far the text has travelled left, in px
    const R = Array.from(sec.querySelectorAll(".iw-row")).map((el) => ({ el, run: el.firstElementChild, pos: 0, w: NaN, mode: "auto", period: 1, textW: 1, pad: 0, v: 40, max: 0, p0: 0, t0: 0, dur: 1, init: false }));
    let held = false, k = 1, cur = null, raf = 0, last = 0, visible = true, dwell = 0, leaveT = 0, front = 0, shown = "";

    /* a line is one copy of its text plus a gap; copies are added until the loop can never run dry */
    const measure = () => {
      const scale = Math.max(0.6, innerWidth / 1920);
      R.forEach((r, i) => {
        r.run.querySelectorAll(".iw-t:not(:first-child)").forEach((n) => n.remove());
        const t = r.run.firstElementChild, gap = parseFloat(getComputedStyle(t).paddingRight) || 0;
        r.period = t.offsetWidth || 1; r.textW = r.period - gap; r.pad = parseFloat(getComputedStyle(r.el).paddingLeft) || 0;
        const n = Math.max(2, Math.ceil(innerWidth / r.period) + 1);
        for (let c = 1; c < n; c++) { const cl = t.cloneNode(true); cl.setAttribute("aria-hidden", "true"); r.run.appendChild(cl); }
        r.v = (40 + ((i * 5) % 7) * 7) * scale;                           // each line its own pace
        if (!r.init) { r.pos = r.period * ((i * 0.618034 + 0.17) % 1); r.init = true; }   // each line its own start
        else r.pos %= r.period;
        r.w = NaN;
      });
    };
    const maxFor = (r) => Math.max(0, r.textW + 2 * r.pad - body.clientWidth / 2);   // how far to read once the list is on the right half
    const ease = (u) => 1 - Math.pow(1 - u, 4);

    const tick = (now) => {
      raf = 0;
      if (!sec.isConnected || !visible) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      k += ((held ? 0 : 1) - k) * Math.min(1, dt * 5);                    // slows to a stop, picks up again
      for (const r of R) {
        if (r.mode === "back") {
          const u = Math.min(1, (now - r.t0) / (r.dur * 1000)); r.pos = r.p0 * (1 - ease(u));
          if (u >= 1) { r.pos = 0; r.mode = r === cur && held ? "read" : "hold"; }
        } else if (r.mode === "read") r.pos = Math.min(r.max, r.pos + READ * dt);
        else if (r.mode === "auto") { r.pos += r.v * k * dt; if (r.pos >= r.period) r.pos -= r.period; }
        if (r.pos !== r.w) { r.w = r.pos; r.run.style.transform = `translate3d(${-r.pos.toFixed(2)}px,0,0)`; }
      }
      raf = requestAnimationFrame(tick);
    };
    const start = () => { if (!raf && visible && !reduce && sec.isConnected) { last = performance.now(); raf = requestAnimationFrame(tick); } };

    measure(); start();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measure(); });
    let rs = 0; addEventListener("resize", () => { clearTimeout(rs); rs = setTimeout(() => { if (sec.isConnected) measure(); }, 150); });
    if ("IntersectionObserver" in window) new IntersectionObserver((e) => { visible = e[0].isIntersecting; if (visible) start(); }).observe(sec);
    if (!fine) return;                                    // touch: the lines keep drifting and are plain links

    const rewind = (r, dur) => {
      if (reduce) { r.pos = 0; return; }
      r.p0 = r.pos % r.period; r.pos = r.p0; r.t0 = performance.now(); r.dur = dur; r.mode = "back"; start();
    };
    const showImg = (src) => {
      if (src === shown) return; shown = src;
      const next = imgs[front ^ 1];
      next.onload = () => { imgs[front].classList.remove("on"); next.classList.add("on"); front ^= 1; };
      next.src = src; if (next.complete && next.naturalWidth) next.onload();
    };
    const focus = (r) => { r.max = maxFor(r); showImg(r.el.dataset.img); rewind(r, BACK); };
    const hold = () => {                                  // everything stops, dims, and the chosen line takes over
      held = true; sec.classList.add("split");
      R.forEach((r) => { if (r !== cur && r.mode === "auto") r.mode = "hold"; });
      focus(cur);
    };
    const release = () => {                               // every line carries on from where it is
      held = false; sec.classList.remove("split"); shown = ""; imgs.forEach((im) => im.classList.remove("on"));
      R.forEach((r) => { r.mode = "auto"; r.pos %= r.period; }); start();
    };

    const enter = (r) => {
      clearTimeout(leaveT);
      if (cur && cur !== r) { cur.el.classList.remove("on"); if (held) rewind(cur, 1); }   // the one you left eases back to its start
      cur = r; r.el.classList.add("on");
      if (held) focus(r);
      else { clearTimeout(dwell); dwell = setTimeout(() => { if (cur === r) hold(); }, DWELL); }
    };
    R.forEach((r) => {
      r.el.addEventListener("pointerenter", () => enter(r));
      r.el.addEventListener("pointerleave", () => { if (!held && cur === r) { clearTimeout(dwell); r.el.classList.remove("on"); cur = null; } });
      r.el.addEventListener("focus", () => enter(r));
      r.el.addEventListener("blur", () => { if (!held && cur === r) { clearTimeout(dwell); r.el.classList.remove("on"); cur = null; } });
    });
    // leaving the whole index closes the image, and the lines drift on again
    body.addEventListener("pointerleave", () => {
      clearTimeout(dwell);
      leaveT = setTimeout(() => { if (cur) { cur.el.classList.remove("on"); cur = null; } if (held) release(); }, 350);
    });
    body.addEventListener("pointerenter", () => clearTimeout(leaveT));
    pic.addEventListener("click", () => { if (cur) cur.el.click(); });
  }

  window.INDEXWORKS = { render, wire };
})();
