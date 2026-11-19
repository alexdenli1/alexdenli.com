/* Index of works — the bottom of the home page.
   Each project is one long line of type that runs off the right edge of the screen.
   Hover a line and it slides left to reveal the rest; leave it and it eases back.
   Rest on one line for 2 seconds and the list slides over to the right half, with that project's image on the left. */
(function () {
  "use strict";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const SPEED = 230;   // px a second while a line reveals itself
  const DWELL = 2000;  // ms resting on one line before the image opens

  function render(list, cat, link) {
    const rows = list.map((p, i) => {
      let text = String(p.line || p.summary || "").replace(/\.$/, "");
            text = esc(text);
      return `<li><a class="iw-row" href="${link(p)}" data-i="${i}" data-img="${esc(p.hero)}">
        <span class="iw-run">${esc(p.title)} <i>(${esc(parseInt(p.year, 10))})</i> — ${text}${p.study ? ` <em>— full case study</em>` : ""}</span></a></li>`;
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
    const rows = Array.from(sec.querySelectorAll(".iw-row"));
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine) return;                                    // touch: the lines are plain links

    let dwell = 0, leaveT = 0, cur = null, front = 0, shown = "";

    const offset = (run) => { const m = getComputedStyle(run).transform; return m && m !== "none" ? new DOMMatrixReadOnly(m).m41 : 0; };
    const reveal = (row) => {
      const run = row.firstElementChild, max = Math.max(0, run.scrollWidth - row.clientWidth + 24);
      if (reduce || !max) return;
      const from = offset(run), dist = max + from;
      run.style.transition = "none"; run.style.transform = `translate3d(${from}px,0,0)`; void run.offsetWidth;
      run.style.transition = `transform ${(dist / SPEED).toFixed(2)}s linear`;
      run.style.transform = `translate3d(${-max}px,0,0)`;
    };
    const settle = (row) => {
      const run = row.firstElementChild, from = offset(run);
      if (!from) return;
      const t = Math.min(2.8, Math.max(1, -from / 420));  // slowly back to the start
      run.style.transition = "none"; run.style.transform = `translate3d(${from}px,0,0)`; void run.offsetWidth;
      run.style.transition = `transform ${t.toFixed(2)}s cubic-bezier(.22,.61,.36,1)`;
      run.style.transform = "translate3d(0,0,0)";
    };
    const showImg = (src) => {
      if (src === shown) return; shown = src;
      const next = imgs[front ^ 1];
      next.onload = () => { imgs[front].classList.remove("on"); next.classList.add("on"); front ^= 1; };
      next.src = src; if (next.complete && next.naturalWidth) next.onload();
    };
    const split = (on) => {
      if (sec.classList.contains("split") === on) return;
      sec.classList.toggle("split", on);
      // the active line now has half the room: once the list has moved over, carry on revealing from where it is
      if (on && cur) setTimeout(() => cur && reveal(cur), reduce ? 0 : 900);
      if (!on) { shown = ""; imgs.forEach((im) => im.classList.remove("on")); }
    };

    const enter = (row) => {
      clearTimeout(leaveT);
      if (cur && cur !== row) { settle(cur); cur.classList.remove("on"); }
      cur = row; row.classList.add("on");
      reveal(row);
      if (sec.classList.contains("split")) showImg(row.dataset.img);
      else { clearTimeout(dwell); dwell = setTimeout(() => { if (cur === row) { showImg(row.dataset.img); split(true); } }, DWELL); }
    };
    const leaveRow = (row) => { if (cur === row) { clearTimeout(dwell); } settle(row); };

    rows.forEach((row) => {
      row.addEventListener("pointerenter", () => enter(row));
      row.addEventListener("pointerleave", () => leaveRow(row));
      row.addEventListener("focus", () => enter(row));
      row.addEventListener("blur", () => { leaveRow(row); row.classList.remove("on"); });
    });
    // leaving the whole index closes the image and lets the list slide back across
    body.addEventListener("pointerleave", () => {
      clearTimeout(dwell);
      leaveT = setTimeout(() => { if (cur) { cur.classList.remove("on"); cur = null; } split(false); }, 350);
    });
    body.addEventListener("pointerenter", () => clearTimeout(leaveT));
    pic.addEventListener("click", () => { if (cur) cur.click(); });
  }

  window.INDEXWORKS = { render, wire };
})();
