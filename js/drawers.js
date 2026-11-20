/* Home: Brands I've worked with, as a wall of labelled drawers.
   Each drawer front carries a brand's logo. Hover or focus one and it pulls out towards you, with a
   little overshoot, dropping in front of the drawer below and showing what is inside: a line or two
   on what Alex did for that brand and up to three small pictures. It closes when you leave.
   The drawer's inside uses the brand's own colour for one thin line only.

   Arrangement, as before: three even rows (the longest in the middle), offset like brickwork, the
   colour logos in the four corners, equal spacing and clear margins at the sides of the screen.
   The order and content come from SITE.brands in data.js:
     did      what Alex did for the brand (one or two lines)      until supplied: a marked placeholder
     pics     up to three small pictures                           until supplied: marked empty frames
     colour   the brand's own colour, for the thin line inside     until supplied: cream */
(() => {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* three rows, the longest in the middle: 10 brands make 3, 4, 3 */
  const rowsOf = (list) => {
    const n = list.length, R = Math.min(3, n), base = Math.floor(n / R), extra = n % R;
    const counts = Array.from({ length: R }, (_, r) => base + (extra === 1 ? (r === 1 ? 1 : 0) : extra === 2 ? (r !== 1 ? 1 : 0) : 0));
    let k = 0; return counts.map((c) => list.slice(k, (k += c)));
  };

  function html(brands, title, sub) {
    const list = (brands || []).slice(0, 12);
    if (!list.length) return "";
    let i = 0;
    const drawer = (b) => {
      const id = "dw-" + i++, pics = (b.pics || []).slice(0, 3);
      const did = b.did || `Placeholder: one or two lines on what I did for ${b.name}.`;
      const shots = pics.length ? pics.map((s) => `<img src="${esc(s)}" alt="" loading="lazy">`).join("")
        : `<i class="dw-ph">Picture to come</i><i class="dw-ph">Picture to come</i><i class="dw-ph">Picture to come</i>`;
      return `<li class="dw" style="--bc:${esc(b.colour || "var(--fg)")}">
        <div class="dw-in" id="${id}" role="region" aria-label="${esc(b.name)}">
          <p class="dw-did${b.did ? "" : " ph"}">${esc(did)}</p><div class="dw-pics">${shots}</div></div>
        <button class="dw-front" type="button" aria-expanded="false" aria-controls="${id}">
          <img src="${esc(b.logo)}" alt="${esc(b.name)}" draggable="false"${b.size ? ` style="--lw:${b.size}"` : ""}><i class="dw-pull" aria-hidden="true"></i></button>
      </li>`;
    };
    return `<section class="dws" aria-label="${esc(title)}">
      <header class="dws-head"><h2>${esc(title)}</h2><p>${esc(sub)}</p></header>
      <div class="dws-wall">${rowsOf(list).map((row) => `<ul class="dws-row">${row.map(drawer).join("")}</ul>`).join("")}</div>
    </section>`;
  }

  function wire() {
    const sec = document.querySelector(".dws"); if (!sec) return;
    const all = [...sec.querySelectorAll(".dw")];
    const set = (li, on) => {
      if (on) all.forEach((o) => o !== li && set(o, false));
      li.classList.toggle("open", on);
      li.querySelector(".dw-front").setAttribute("aria-expanded", String(on));
    };
    all.forEach((li) => {
      const btn = li.querySelector(".dw-front");
      li.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") set(li, true); });
      li.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") set(li, false); });
      btn.addEventListener("focus", () => set(li, true));
      btn.addEventListener("blur", () => { if (!li.matches(":hover")) set(li, false); });
      btn.addEventListener("click", (e) => { if (e.pointerType !== "mouse") set(li, !li.classList.contains("open")); });
      btn.addEventListener("keydown", (e) => { if (e.key === "Escape") { set(li, false); } });
    });
  }

  window.DRAWERS = { html, wire };
})();
