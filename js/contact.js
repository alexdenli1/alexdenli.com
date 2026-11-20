/* Home: contact, at the foot of the page.
   Giant "Let's talk" type whose letters lean towards the cursor and follow it a little, then spring
   back upright when it leaves. Below it: email, phone and LinkedIn. The accent is Alex's green. */
(() => {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function html(o) {
    const words = ["Let’s", "talk"].map((w) => `<span class="ct-w">${[...w].map((ch) => `<span class="ct-l">${esc(ch)}</span>`).join("")}</span>`).join(" ");
    const li = (o.links || []).find((l) => /linkedin/i.test(l.label));
    const linked = li && li.url && li.url !== "#"
      ? `<a class="ct-v" href="${esc(li.url)}" target="_blank" rel="noopener">LinkedIn</a>`
      : `<span class="ct-v ph">LinkedIn link to come</span>`;
    return `<section class="ct" aria-labelledby="ct-h">
      <h2 class="ct-big" id="ct-h" aria-label="Let’s talk">${words}</h2>
      <dl class="ct-list">
        <div><dt>Email</dt><dd><a class="ct-v hot" href="mailto:${esc(o.email)}">${esc(o.email)}</a></dd></div>
        <div><dt>Phone</dt><dd><a class="ct-v" href="tel:${esc(String(o.phone || "").replace(/\s/g, ""))}">${esc(o.phone)}</a></dd></div>
        <div><dt>Elsewhere</dt><dd>${linked}</dd></div>
      </dl>
    </section>`;
  }

  function wire() {
    const sec = document.querySelector(".ct"); if (!sec) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(hover: hover)").matches) return;
    const L = [...sec.querySelectorAll(".ct-l")];
    let centres = [], raf = 0, px = 0, py = 0;
    const measure = () => { centres = L.map((l) => { const r = l.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }); };
    // each letter leans towards the cursor and steps a little after it; the nearer the cursor, the more
    const lean = () => {
      raf = 0;
      if (!sec.isConnected) return;
      if (centres.length !== L.length) measure();   // positions are re-read after any scroll
      L.forEach((l, i) => {
        const dx = px - centres[i][0], dy = py - centres[i][1], d = Math.hypot(dx, dy), k = Math.exp(-d / 520);
        const tilt = Math.max(-1, Math.min(1, dx / 420)) * 11 * k;
        l.style.transform = `translate3d(${(dx * 0.05 * k).toFixed(1)}px, ${(dy * 0.035 * k).toFixed(1)}px, 0) rotate(${tilt.toFixed(2)}deg)`;
      });
    };
    sec.addEventListener("pointerenter", () => { measure(); sec.classList.add("live"); });
    sec.addEventListener("pointermove", (e) => { px = e.clientX; py = e.clientY; if (!centres.length) measure(); if (!raf) raf = requestAnimationFrame(lean); }, { passive: true });
    sec.addEventListener("pointerleave", () => { cancelAnimationFrame(raf); raf = 0; sec.classList.remove("live"); L.forEach((l) => (l.style.transform = "")); });
    addEventListener("scroll", () => { centres = []; }, { passive: true });
  }

  window.CONTACT = { html, wire };
})();
