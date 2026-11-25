/* Home: Brands I've worked with. Plain logos on the page, nothing to hover or open.
   Three even rows, the longest in the middle, offset like brickwork, with the colour logos in the
   four corners. On a phone: two columns, with the colour logos still in the corners.
   Order and logos come from SITE.brands in data.js (colour marks a colour logo). */
(() => {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* three rows, the longest in the middle: 10 brands make 3, 4, 3 */
  const rowsOf = (list) => {
    const n = list.length, R = Math.min(3, n), base = Math.floor(n / R), extra = n % R;
    let k = 0;
    return Array.from({ length: R }, (_, r) => base + (extra === 1 ? +(r === 1) : extra === 2 ? +(r !== 1) : 0))
      .map((c) => list.slice(k, (k += c)));
  };

  function html(brands, title, sub) {
    const list = (brands || []).slice(0, 12), n = list.length;
    if (!n) return "";
    // the order on a phone: colour logos first, second, second to last and last; the rest between them
    const corners = list.filter((b) => b.colour).slice(0, 4), rest = list.filter((b) => !corners.includes(b));
    const place = (b) => { const c = corners.indexOf(b); return c < 0 ? 2 + rest.indexOf(b) : [0, 1, n - 2, n - 1][c]; };
    const item = (b) => `<li style="--o:${place(b)}${b.size ? `;--lw:${b.size}` : ""}"><img src="${esc(b.logo)}" alt="${esc(b.name)}" draggable="false" decoding="async"></li>`;
    return `<section class="bw" aria-label="${esc(title)}">
      <header class="bw-head"><h2>${esc(title)}</h2><p>${esc(sub)}</p></header>
      <div class="bw-wall">${rowsOf(list).map((row) => `<ul>${row.map(item).join("")}</ul>`).join("")}</div>
    </section>`;
  }

  window.BRANDS = { html };
})();
