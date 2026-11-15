/* Shield: custom project page.
   Final year product design project (2022): a retrofit electrocoagulation unit for washing-machine wastewater.
   An ocean world: deep water for the problem and the proof, pale paper for the design. Scroll drives the story:
   the fibre's journey, the cell that clumps and settles them, five forms crossfading into one, an exploded view
   that lights each part, and six steps of the cycle. Content comes from the Shield design folio (10 pages). */
(function () {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const IMG = (n, alt, cls = "", lazy = true) => `<img${cls ? ` class="${cls}"` : ""} src="images/shield/${n}" alt="${esc(alt)}"${lazy ? ' loading="lazy"' : ""} decoding="async">`;
  /* CSS ramp: 0 until p = a, 1 from p = b (p is the section's scroll progress, set on the section) */
  const H = (a, b) => `clamp(0, calc((var(--p) - ${a}) / ${+(b - a).toFixed(3)}), 1)`;
  const fade = (a, b, rise = 36) => `opacity:${H(a, b)};transform:translateY(calc((1 - ${H(a, b)}) * ${rise}px))`;

  const MARK = (w = 56) => `<svg class="sh-mark" width="${w}" viewBox="0 0 40 46" aria-hidden="true"><path d="M20 1.5 37 8v15.5c0 9.5-7.2 16.4-17 20.5C10.200 39.900 3 33 3 23.500V8z" fill="#6FD3D6"/><path d="M3 20c4.500-3 9-3 13.500 0s9 3 13.500 0 5-1.500 7-1.500" fill="none" stroke="#0B1B2B" stroke-width="2.600" stroke-linecap="round" transform="translate(0 0)"/><path d="M4 27c4.500-3 9-3 13.500 0s9 3 13.500 0 4.500-1.500 6.500-1.500M8 34c3.800-2.600 7.600-2.600 11.400 0s7.600 2.600 11.400 0" fill="none" stroke="#0B1B2B" stroke-width="2.600" stroke-linecap="round"/></svg>`;

  /* ---------- small drawings ---------- */
  const FIB = (x, y, r = 0, s = 1, c = "#E4694B") => `<path d="M0 0c3-6 6 6 9 0s6-6 9 0" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" transform="translate(${x} ${y}) rotate(${r}) scale(${s})"/>`;

  const ICON = {
    machine: `<rect x="30" y="26" width="60" height="68" rx="8"/><circle cx="60" cy="64" r="17"/><path d="M42 36h8M72 36h6" stroke-linecap="round"/>`,
    drain: `<path d="M38 26v50c0 8 6 14 14 14h30" stroke-linecap="round"/><path d="M60 58c3-6 6 6 9 0s6-6 9 0" stroke="#E4694B" stroke-linecap="round"/>`,
    works: `<path d="M34 34h52" stroke-dasharray="4 5" stroke-linecap="round"/><rect x="34" y="44" width="14" height="38" rx="2"/><rect x="53" y="44" width="14" height="38" rx="2"/><rect x="72" y="44" width="14" height="38" rx="2"/>`,
    sea: `<path d="M26 46c7-6 14-6 21 0s14 6 21 0 14-6 21 0M26 62c7-6 14-6 21 0s14 6 21 0 14-6 21 0M26 78c7-6 14-6 21 0s14 6 21 0 14-6 21 0" stroke-linecap="round"/><path d="M46 70c3-6 6 6 9 0s6-6 9 0" stroke="#E4694B" stroke-linecap="round"/>`
  };

  /* concept sketches (viewBox 200 x 110) */
  const MACH = `<rect x="14" y="26" width="52" height="58" rx="5"/><circle cx="40" cy="57" r="13"/>`;
  const CONCEPTS = [
    ["A", "Inline pod", `${MACH}<path d="M66 70c14 0 18 6 30 6" /><rect x="98" y="46" width="30" height="44" rx="9"/><path d="M104 66l18 12M104 74l12 10M110 56l12 8" stroke-width="1"/><path d="M128 50c10-12 24-18 40-22" stroke="#14777D" stroke-width="2"/><path d="M160 26l8 2-3 8" stroke="#14777D" stroke-width="2"/>`],
    ["B", "Cross-step cone", `<path d="M28 34l140 14v22L28 84z"/><path d="M60 40l14 38M92 44l10 30M124 48l8 22" stroke-width="1"/><path d="M8 59h16M172 59h16" stroke="#14777D" stroke-width="2"/>`],
    ["C", "SLD cartridge", `<rect x="22" y="26" width="156" height="58" rx="8"/><path d="M40 40h14M70 40h14M100 40h14M130 40h14M52 56h14M82 56h14M112 56h14M142 56h14M40 72h14M70 72h14M100 72h14M130 72h14" stroke-width="3.500" stroke-linecap="round"/><path d="M26 44l140 30" stroke="#E4694B" stroke-dasharray="4 4"/>`],
    ["D", "Rear EC panel", `${MACH}<rect x="130" y="14" width="12" height="72" rx="3" fill="#BFE6E6" stroke="#14777D"/>`],
    ["E", "Twin-cell rear", `<rect x="54" y="14" width="92" height="62" rx="5"/><rect x="60" y="20" width="38" height="52" fill="#BFE6E6" stroke="none"/><rect x="102" y="20" width="38" height="52" fill="#BFE6E6" stroke="none"/><rect x="54" y="78" width="92" height="9" rx="2" fill="#EAE4D6"/>`],
    ["F", "Side tower", `${MACH}<rect x="76" y="14" width="13" height="74" rx="3" fill="#BFE6E6" stroke="#14777D"/><path d="M78 80h9" stroke="#14777D"/><path d="M83 90v10" stroke="#14777D" stroke-width="2"/><path d="M79 97l4 4 4-4" stroke="#14777D" stroke-width="2"/>`]
  ];

  const FORMS = [
    ["Single tank", "One tank split in two; exposed valves and pump."],
    ["Twin cells", "A float and valve per cell; full-length base and collection chamber."],
    ["Enclosed", "Tubing and electronics hidden in side posts; status lights at the front."],
    ["Turned to the side", "Moved beside the machine so the user never pulls it out."],
    ["Final form", "Slim tower, hopper cells, front drawer, lift-out electrodes."]
  ];

  const PARTS = ["Top cap", "Light bar", "Electrode cassettes", "Twin EC cells", "Divider", "Electronics bay", "Manifold + overflow", "Hopper base", "Ø19 mm ports", "Pump + sludge valves", "Mesh basket", "Drawer"];
  const PP = [[46.7, 10.2], [31.3, 11.1], [40.8, 24.3], [40.8, 55.9], [47.1, 54.5], [25.8, 59.2], [65.2, 50.7], [52.8, 68.5], [66.1, 35.8], [47.1, 80.2], [31.3, 77.4], [26.1, 83.2]];

  const STEPS = [
    ["Fill", "Each drain fills the next free cell.", "Inlet manifold, one valve per cell · level float · safety float"],
    ["Treat", "30 minutes of electrocoagulation.", "Al / Fe plate electrodes · light bar shows progress"],
    ["Settle", "Floc sinks into the hopper.", "Hopper base concentrates the floc"],
    ["Decant", "Clear water is pumped to the drain.", "Decant port at 20 % height · pump to standpipe · passive overflow"],
    ["Collect", "Sludge drops into the mesh basket.", "Sludge valve · drawer with a 100 µm mesh basket"],
    ["Empty", "Slide out the drawer when asked.", "The light bar flashes red when the drawer is full"]
  ];

  const MATRIX = [
    ["Mesh / bag filter", 4, 1, 4, "Clogs; becomes a consumable"],
    ["Membrane cartridge", 5, 1, 3, "Needs replacing; pressure builds"],
    ["Cross-step cone", 3, 3, 2, "Still needs an outer mesh"],
    ["DLD / SLD channels", 3, 4, 1, "Hard to scale to 50 L"],
    ["Electrocoagulation", 5, 5, 3, "No filter; needs still water", 1]
  ];
  const dots = (n) => `<span class="sd">${[0, 1, 2, 3, 4].map((i) => `<i${i < n ? ' class="f"' : ""}></i>`).join("")}</span>`;

  const MAP = [["PlanetCare", "membrane cartridge", .16, .2], ["Filtrol", "mesh bag, discarded", .07, .36], ["Eddy", "concept · pumped", .52, .27], ["Matter", "retrofit, no cartridge", .62, .42], ["XFiltra", "built into new machines", .52, .67], ["Guppyfriend", "wash bag", .16, .82]];

  /* ---------- scale ruler ---------- */
  const lx = (um) => 100 + Math.log10(um) * 375;
  function ruler() {
    let t = `<line x1="100" y1="170" x2="1600" y2="170" class="ax"/>`;
    for (let d = 0; d < 4; d++) for (let m = 1; m < 10; m++) { const x = lx(m * Math.pow(10, d)); t += `<line x1="${x}" y1="${m === 1 ? 156 : 163}" x2="${x}" y2="${m === 1 ? 184 : 177}" class="${m === 1 ? "mj" : "mn"}"/>`; }
    t += `<line x1="1600" y1="156" x2="1600" y2="184" class="mj"/>`;
    [["1 µm", 1], ["10 µm", 10], ["100 µm", 100], ["1 mm", 1000], ["10 mm", 10000]].forEach(([l, v]) => { t += `<text x="${lx(v)}" y="212" text-anchor="middle" class="tl">${l}</text>`; });
    const mk = (x, a, up, lab, col, band, tall) => {
      const ty = up ? (tall ? 34 : 76) : 276, top = tall ? 44 : 98;
      return `<g class="mk ${col}" style="opacity:${H(a, a + .08)};transform:translateY(calc((1 - ${H(a, a + .08)}) * ${up ? -22 : 22}px))">${band ? `<rect x="${band[0]}" y="162" width="${band[1] - band[0]}" height="16" rx="8" class="bd"/>` : ""}<line x1="${x}" y1="${up ? top : 178}" x2="${x}" y2="${up ? 170 : 244}" class="st"/><circle cx="${x}" cy="170" r="8" class="dt"/><text x="${x}" y="${ty}" text-anchor="${x < 300 ? "start" : "middle"}" class="ml" ${x < 300 ? `dx="-60"` : ""}>${lab}</text></g>`;
    };
    t += mk(lx(1.6), .08, 1, "Smallest particle reported in the sea", "srs");
    t += mk(lx(14.5), .2, 1, "Fibre diameter 11.9–17.7 µm", "srs", [lx(11.9), lx(17.7)]);
    t += mk(lx(70), .34, 0, "Human hair ≈ 70 µm", "sl");
    t += mk(lx(100), .46, 1, "Typical fine mesh filter ≈ 100 µm", "wh", null, 1);
    t += mk(lx(6400), .62, 0, "Fibre length 5.0–7.8 mm", "srs", [lx(5000), lx(7800)]);
    return `<svg viewBox="0 0 1700 320" role="img" aria-label="Logarithmic scale from 1 micrometre to 10 millimetres. Fibres are 12 to 18 micrometres thick and 5 to 8 millimetres long; a typical fine mesh is 100 micrometres.">${t}</svg>`;
  }

  /* ---------- the washing machine (side view) ---------- */
  const machine = () => `<svg viewBox="0 0 760 640" class="sh-mach" role="img" aria-label="Side view of a washing machine: drum, drain pump and a hose up to a standpipe in the wall">
    <defs><pattern id="shH" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="9" stroke="#B7C4C8" stroke-width="2"/></pattern></defs>
    <rect x="652" y="70" width="64" height="500" fill="url(#shH)"/><line x1="652" y1="70" x2="652" y2="570" class="ax"/>
    <line x1="40" y1="570" x2="716" y2="570" class="ax"/>
    <rect x="130" y="150" width="332" height="420" rx="14" class="mb"/><rect x="146" y="166" width="300" height="46" rx="7" fill="#E4F0F0"/>
    <text x="164" y="194" class="tt">DETERGENT TRAY · INLET VALVES</text>
    <circle cx="296" cy="372" r="118" fill="#fff" stroke="#0F2233" stroke-width="1.6"/><circle cx="296" cy="372" r="104" fill="none" stroke="#0F2233" stroke-width=".8"/>
    <path d="M200 440c28 30 164 30 192 0-20 14-172 14-192 0z" fill="#8FD2D4" opacity=".9"/>${FIB(236, 446, -8)}${FIB(278, 454, 6)}${FIB(318, 450, -14)}${FIB(352, 442, 10)}
    <text x="296" y="360" text-anchor="middle" class="bl">Drum</text><text x="296" y="382" text-anchor="middle" class="sm">up to 13 kg load</text>
    <path d="M296 478v42H398" class="pipe lo"/><path d="M420 520H590V280" class="pipe hi"/><path class="pipe flow" d="M296 478v42H398M420 520H590V280"/>
    <circle cx="408" cy="520" r="22" fill="#fff" stroke="#0F2233" stroke-width="1.6"/><path d="M408 508l10 12-10 12-10-12z" fill="none" stroke="#0F2233" stroke-width="1.5"/>
    <text x="408" y="562" text-anchor="middle" class="bl" style="font-size:15px">Drain pump</text>
    <rect x="576" y="270" width="28" height="300" fill="#E4F0F0" stroke="#0F2233" stroke-width="1.4"/>
    <text x="590" y="236" text-anchor="middle" class="bl" style="font-size:15px">Standpipe</text><text x="590" y="256" text-anchor="middle" class="sm" style="font-size:12px">600–900 mm high</text>
    <path d="M100 150v420" class="dim"/><path d="M94 160l6-10 6 10M94 560l6 10 6-10" class="dim"/><text transform="translate(80 360) rotate(-90)" text-anchor="middle" class="tt">HEIGHT ≈ 850 MM</text>
    <path d="M130 602h332" class="dim"/><path d="M140 596l-10 6 10 6M452 596l10 6-10 6" class="dim"/><text x="296" y="628" text-anchor="middle" class="tt">DEPTH 550–700 MM</text>
    <path d="M470 602h110" class="dim tl2"/><path d="M480 596l-10 6 10 6M570 596l10 6-10 6" class="dim tl2"/><text x="526" y="628" text-anchor="middle" class="tt tl2">GAP ≈ 70 MM</text>
  </svg>`;

  const drains = () => {
    const X = (m) => 70 + m * 5.5, Y = (l) => 290 - l * 8;
    let g = "";
    [0, 10, 20, 30].forEach((l) => { g += `<line x1="70" y1="${Y(l)}" x2="730" y2="${Y(l)}" class="gl"/><text x="58" y="${Y(l) + 4}" text-anchor="end" class="tt">${l}</text>`; });
    for (let m = 0; m <= 120; m += 20) g += `<text x="${X(m)}" y="314" text-anchor="middle" class="tt">${m}</text>`;
    [["Wash drain", 22, 52, 0], ["Rinse drain", 18, 88, 1], ["Spin", 8, 108, 2]].forEach(([n, l, m, i]) => {
      g += `<rect class="sbr" style="--i:${i}" x="${X(m) - 17}" y="${Y(l)}" width="34" height="${l * 8}" rx="2"/><text x="${X(m)}" y="${Y(l) - 30}" text-anchor="middle" class="sm" style="font-size:14px">${n}</text><text x="${X(m)}" y="${Y(l) - 10}" text-anchor="middle" class="bl" style="font-size:16px">${l} L</text>`;
    });
    g += `<path class="arc" d="M${X(52) + 24} ${Y(22) - 16}Q${X(70)} 42 ${X(88) - 24} ${Y(18) - 54}" pathLength="1"/><path class="arc ah" d="M${X(88) - 36} ${Y(18) - 60}l12 6-8 10"/><text x="${X(70)}" y="52" text-anchor="middle" class="rs2">20–45 min apart</text>`;
    g += `<text transform="translate(18 170) rotate(-90)" text-anchor="middle" class="tt">LITRES DRAINED</text><text x="400" y="338" text-anchor="middle" class="tt">ILLUSTRATIVE PROFILE, NOT MEASURED · MINUTES INTO A CYCLE · TOTAL ≈ 50 L</text>`;
    return `<svg viewBox="0 0 760 346" role="img" aria-label="Litres drained over a wash cycle: a 22 litre wash drain, an 18 litre rinse drain 20 to 45 minutes later, and an 8 litre spin">${g}</svg>`;
  };

  const plan = (k) => {
    const U = `<rect x="8" y="26" width="204" height="86" fill="#E8E2D4"/><rect x="8" y="20" width="204" height="7" fill="#fff" stroke="#0F2233" stroke-width="1"/>`;
    const M = (x) => `<rect x="${x}" y="38" width="62" height="74" rx="5" fill="#fff" stroke="#0F2233" stroke-width="1.5"/><circle cx="${x + 31}" cy="76" r="17" fill="none" stroke="#0F2233" stroke-width="1.5"/>`;
    const T = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="#1FA2A8"/>`;
    return `<svg viewBox="0 0 220 124">${U}${k === 0 ? `${M(76)}${T(78, 22, 58, 7)}<path d="M107 118v-3" stroke="#E4694B"/>` : k === 1 ? `${M(40)}${T(106, 34, 14, 80)}` : `${M(30)}${T(120, 44, 14, 62)}`}</svg>`;
  };

  /* ---------- EC cell ---------- */
  function ecCell() {
    const fibres = [[120, 190], [150, 300], [200, 250], [250, 200], [290, 330], [330, 260], [360, 190], [400, 340], [420, 230], [450, 300], [220, 380], [340, 380]];
    const clus = [[250, 250], [240, 290], [265, 270], [250, 310], [255, 230], [235, 255], [320, 250], [335, 285], [315, 270], [330, 240], [300, 300], [345, 300]];
    const fin = [[130, 420], [160, 430], [190, 424], [225, 432], [255, 426], [285, 434], [315, 428], [345, 436], [375, 430], [405, 434], [435, 428], [180, 440]];
    let f = "";
    fibres.forEach((p, i) => {
      f += `<g class="fb" style="--x0:${p[0]};--y0:${p[1]};--x1:${clus[i][0]};--y1:${clus[i][1]};--x2:${fin[i][0]};--y2:${fin[i][1]};--r:${(i * 37) % 60 - 30}deg"><path d="M0 0c3-6 6 6 9 0s6-6 9 0" fill="none" stroke="#F0704F" stroke-width="2.4" stroke-linecap="round"/></g>`;
    });
    let flocs = "";
    [[250, 270, 40], [326, 268, 34], [300, 310, 24]].forEach((c, i) => { flocs += `<circle class="fc" style="--x:${c[0]};--y:${c[1]};--fx:${150 + i * 110};--fy:${440 - i * 4};--s:${c[2] / 40}" r="40"/>`; });
    let ions = "";
    for (let i = 0; i < 9; i++) ions += `<text class="io" style="--x:${130 + (i % 3) * 8};--y:${150 + i * 28};--d:${i * .09}">Al³⁺</text>`;
    let bub = "";
    for (let i = 0; i < 9; i++) bub += `<circle class="bu" style="--x:${530 + (i % 3 - 1) * 10};--o:${i * .07};--y:${470 - i * 2}" r="${3 + (i % 3)}"/>`;
    return `<svg viewBox="0 0 620 540" class="sh-ec" role="img" aria-label="An electrolysis cell: an aluminium plate releases metal ions, fibres clump into flocs and settle to the bottom, leaving clear water">
      <defs><clipPath id="shT"><rect x="90" y="110" width="470" height="360" rx="10"/></clipPath><linearGradient id="shW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FD6D8" stop-opacity=".30"/><stop offset="1" stop-color="#7FD6D8" stop-opacity=".16"/></linearGradient></defs>
      <rect x="90" y="110" width="470" height="360" rx="10" fill="url(#shW)"/>
      <g clip-path="url(#shT)"><rect class="clr" x="90" y="110" width="470" height="360" fill="#8FE4E4"/>${ions}${f}${flocs}${bub}<rect class="slg" x="90" y="418" width="470" height="52" fill="#E4694B" opacity=".75"/></g>
      <rect x="90" y="110" width="470" height="360" rx="10" fill="none" stroke="#DDF4F4" stroke-width="2"/>
      <rect x="165" y="80" width="22" height="330" rx="3" fill="#C7D1D8"/><rect x="505" y="80" width="22" height="330" rx="3" fill="#6B7A87"/>
      <text x="176" y="62" text-anchor="middle" class="ew">Al +</text><text x="516" y="62" text-anchor="middle" class="ew">Fe −</text>
      <text class="cl2" x="330" y="190" text-anchor="middle">clear</text>
    </svg>`;
  }

  /* ---------- the tower: six steps ---------- */
  function tower() {
    const cell = (x, k) => {
      let pl = "";
      for (let i = 0; i < 5; i++) pl += `<line x1="${x + 12 + i * 21.5}" y1="108" x2="${x + 12 + i * 21.5}" y2="338" class="pl ${i % 2 ? "fe" : "al"}"/>`;
      const d = `M${x} 118h112v212l-40 54h-32l-40-54z`;
      return `<g class="cell c${k}"><clipPath id="shc${k}"><path d="${d}"/></clipPath>
        <g clip-path="url(#shc${k})"><rect class="wt w${k}" x="${x}" y="152" width="112" height="232"/>
          <g class="fibs f${k}">${FIB(x + 18, 190, -10, .8)}${FIB(x + 60, 230, 12, .8)}${FIB(x + 28, 270, 4, .8)}${FIB(x + 72, 300, -12, .8)}${FIB(x + 46, 340, 8, .8)}</g>
          <g class="flcs">${[[x + 34, 232, 11], [x + 70, 262, 9], [x + 52, 298, 12]].map((c) => `<circle cx="${c[0]}" cy="${c[1]}" r="${c[2]}"/>`).join("")}</g>
          <path class="fl fl${k}" d="M${x + 16} 384h80v-34c-20-8-60-8-80 0z"/><g class="bubs">${[0, 1, 2, 3].map((i) => `<circle class="bb" style="--i:${i}" cx="${x + 22 + i * 22}" cy="330" r="3.2"/>`).join("")}</g></g>
        ${pl}<path d="${d}" fill="none" stroke="#0F2233" stroke-width="2.4" stroke-linejoin="round"/></g>`;
    };
    return `<svg viewBox="0 0 520 620" class="sh-tw-svg" role="img" aria-label="Cross-section of the Shield tower: two still cells, a hopper base, a pump and a drawer with a mesh basket">
      <rect x="70" y="40" width="300" height="520" rx="16" fill="#fff" stroke="#0F2233" stroke-width="2"/>
      <rect x="100" y="56" width="240" height="26" rx="8" fill="#0F2233"/>${[0, 1, 2, 3, 4].map((i) => `<rect class="lt l${i}" x="114" y="64" width="34" height="10" rx="5" style="transform:translateX(${i * 42}px)"/>`).join("")}
      <rect x="92" y="96" width="120" height="12" rx="3" fill="#0F2233"/><rect x="228" y="96" width="120" height="12" rx="3" fill="#0F2233"/>
      ${cell(98, 1)}${cell(222, 2)}
      <rect x="110" y="394" width="214" height="14" rx="3" fill="#E4F0F0" stroke="#0F2233" stroke-width="1.6"/><rect class="vl" x="146" y="386" width="12" height="10" fill="#0F2233"/><rect class="vl" x="270" y="386" width="12" height="10" fill="#0F2233"/>
      <g class="dr"><rect x="104" y="456" width="150" height="62" rx="7" fill="#F3F7F7" stroke="#0F2233" stroke-width="2"/><rect x="118" y="468" width="122" height="34" rx="3" fill="url(#shH2)" stroke="#0F2233" stroke-width="1.2"/><rect class="sg" x="118" y="488" width="122" height="14" fill="#E4694B"/><rect x="108" y="510" width="40" height="4" rx="2" fill="#0F2233"/></g>
      <defs><pattern id="shH2" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke="#B7C4C8" stroke-width="1.4"/></pattern></defs>
      <circle cx="302" cy="486" r="20" fill="#fff" stroke="#0F2233" stroke-width="2"/><path d="M302 474l9 12-9 12-9-12z" fill="none" stroke="#0F2233" stroke-width="1.6"/>
      <path class="duct" d="M210 346H216V434H302V466" fill="none" stroke="#14777D" stroke-width="3" stroke-linecap="round" stroke-dasharray="8 8"/>
      <path class="out" d="M322 486h96" stroke="#14777D" stroke-width="4" stroke-linecap="round"/><path class="out" d="M408 476l12 10-12 10" fill="none" stroke="#14777D" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="inn" d="M12 140h78" stroke="#14777D" stroke-width="4" stroke-linecap="round"/><path class="inn" d="M78 130l12 10-12 10" fill="none" stroke="#14777D" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="inn2" d="M12 100h200" stroke="#14777D" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 9"/>
      <path class="pull" d="M104 540h-84M32 530l-14 10 14 10" fill="none" stroke="#0F2233" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }

  /* ---------- the page ---------- */
  function render(p, tail) {
    const first = "Shield".split("").map((c, i) => `<span class="sch" style="--i:${i}"><i>${c}</i></span>`).join("");
    const stats = [[35, 0, "", "%", "of primary microplastics entering the oceans come from washing synthetic textiles (IUCN)"], [0.5, 1, "", " Mt", "of plastic microfibres reach the ocean from laundry every year (UNEP)"], [729, 0, "", "k", "fibres released by one 6 kg acrylic load (Napper & Thompson, 2016)"], [40, 0, "≤", "%", "of fibres reaching treatment works can pass through to rivers and seas (UNEP)"]];
    const journey = [["machine", "Washing machine", "Synthetic garments shed fibres through abrasion in every cycle"], ["drain", "Household drain", "Drain pump empties ~50 L per cycle straight to the standpipe"], ["works", "Treatment works", "Fibres are too small to be reliably screened out"], ["sea", "Rivers & sea", "Fibres escape in effluent or return to land via sludge"]];
    const costs = [["Materials & processing", 9.14, "#7FCCCF", "5"], ["Standard components", 56.58, "#12747A", "28"], ["Assembly", 16.54, "#E0892D", "8"], ["Packaging", 22.42, "#7E8B96", "11"], ["Margin at £200 RRP", 95.32, "#D2E6E5", "48"]];
    const test = { al: [10, 20, 35, 40, 60, 70, 80, 90], fe: [15, 20, 25, 30, 40, 50, 65, 75], aa: [5, 10, 25, 30, 35, 45, 50, 60] };
    const tx = (i) => 90 + i * (760 / 7), ty = (v) => 380 - v * 3.2;
    const pth = (a) => a.map((v, i) => `${i ? "L" : "M"}${tx(i).toFixed(1)},${ty(v)}`).join(" ");
    const volts = ["1.5 V", "3 V", "4.5 V", "6 V", "7.5 V", "9 V", "10.5 V", "12 V"];
    const cart = [0, 85, 123.25, 161.5, 199.75, 238], cx = (i) => 90 + i * 122, cy = (v) => 290 - v;
    const cartP = cart.map((v, i) => `${i ? "L" : "M"}${cx(i)},${cy(v)}`).join(" ");

    return `<article class="page shd">
    <div class="sh-fix" aria-hidden="true"><b>Shield</b><span></span></div>

    <section class="sh-hero" data-sec="Overview"><div class="sh-hbg"><div class="sh-hpic">${IMG("hero-render.webp", "The Shield unit: a slim white tower with two clear cells of water and aluminium plates, and a row of status lights on top", "sh-hprod", false)}</div></div>
      <div class="sh-hl"><p class="sh-meta"><b>Shield</b><span>${esc(p.year)}</span><a href="#/work/product-design">Product design</a><span>Final year project</span></p>
        <h1 class="sh-title" aria-label="Shield">${MARK(78)}<span class="sh-word" aria-hidden="true">${first}</span></h1>
        <p class="sh-lead">${esc("A retrofit electrocoagulation unit that captures microfibres from washing-machine wastewater, before they reach the sea.")}</p>
        <ul class="sh-chips"><li>No filters to replace</li><li>Fits any UK machine</li><li>~90% separation in test</li></ul></div>
      <p class="sh-sc">Scroll</p></section>

    <section class="sh-pin sh-dark sh-prob " data-pin="prob" data-sec="Research" style="height:330vh"><div class="sh-stage">
      <header class="sh-h"><small>Research</small><h2>The problem with every wash</h2><p>Synthetic clothes shed plastic fibres in every wash. They are too small for the machine to catch and too small for the treatment works to stop reliably.</p></header>
      <div class="sh-stats" style="opacity:calc(1 - ${H(.46, .56)});transform:translateY(calc(${H(.46, .56)} * -40px))">${stats.map((s, i) => `<div class="sh-st" style="--i:${i}"><i style="transform:scaleX(${H(.02 + i * .05, .14 + i * .05)})"></i><b data-to="${s[0]}" data-dec="${s[1]}" data-pre="${s[2]}" data-suf="${esc(s[3])}">0${esc(s[3])}</b><span>${esc(s[4])}</span></div>`).join("")}</div>
      <div class="sh-jr" data-n="0" style="opacity:${H(.5, .6)}"><p class="sh-k">How a fibre reaches the sea</p>
        <div class="sh-jline"><i style="transform:scaleX(var(--j))"></i><em class="sh-fib" style="left:calc(12.5% + 75% * var(--j))"><svg viewBox="0 0 30 18" width="46"><path d="M3 9c3-7 6 7 9 0s6-7 9 0 4 2 6 0" fill="none" stroke="#F0704F" stroke-width="3" stroke-linecap="round"/></svg></em>
          <span class="sh-here" style="opacity:${H(.9, .96)};transform:translate(-50%,calc((1 - ${H(.9, .96)}) * 14px)) scale(calc(.8 + ${H(.9, .96)} * .2))">Shield fits here</span></div>
        <ol>${journey.map((j, i) => `<li class="nd"><span class="ring"><svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="2">${ICON[j[0]]}</svg></span><b>${esc(j[1])}</b><span>${esc(j[2])}</span></li>`).join("")}</ol></div>
    </div></section>

    <section class="sh-pap sh-in " data-sec="Research"><div class="sh-wrap">
      
      <div class="sh-ig"><div class="sh-col"><header class="sh-h sm"><small>Research</small><h2>Inside the washing machine</h2><p>How and when water leaves the machine, and where a device can live in a real kitchen, set Shield’s size, connection and timing.</p></header><div class="sh-card rv sh-mc">${machine()}<ul class="sh-figs"><li><b>≈ 50 L</b>drained per cycle</li><li><b>2</b>inlet solenoid valves</li><li><b>Ø 19 mm</b>drain hose, outside dia.</li></ul></div></div>
        <div class="sh-col"><div class="sh-card rv sh-dc">${drains()}</div>
          <div class="sh-card rv sh-pc"><p class="sh-k">Where can a retrofit device live?</p><div class="sh-plans">${[["A · Behind the machine", "Semester 2 starting point", "Machine must be pulled out"], ["B · Beside the machine", "Chosen: slim 150 mm tower", "Front access, no moving"], ["C · In an adjacent unit", "Same tower, fitted in a 300 mm unit", "Inside sink unit"]].map((x, i) => `<figure class="${i === 1 ? "pick" : ""}">${plan(i)}<figcaption><b>${x[0]}</b><span>${x[1]}</span></figcaption></figure>`).join("")}</div></div>
          <div class="sh-ins rv"><p class="sh-k">Key insights</p><ul><li>Connect on the drain hose, after the pump: no changes to the machine or plumbing.</li><li>Handle ~50 L per cycle, arriving in separate drains 20–45 minutes apart, and never block the pump.</li><li>Sit beside the machine, 150 mm wide, so the user can reach it without moving anything.</li></ul></div></div></div></div></section>

    <section class="sh-pin sh-dark sh-ecs " data-pin="ec" data-sec="Research" style="height:340vh"><div class="sh-stage" data-k="0">
      <header class="sh-h"><small>Research</small><h2>Separating fibres without a filter</h2><p>Electrocoagulation generates a coagulant from metal plates, clumping fibres and dirt into flocs that settle out of still water.</p></header>
      <div class="sh-ecg"><div class="sh-ecv">${ecCell()}</div>
        <div class="sh-ecr"><ol class="sh-ecs-l">${[["Dose", "Sacrificial anode releases metal ions"], ["Destabilise & flocculate", "Hydroxides neutralise charge; fibres clump"], ["Separate", "Flocs settle (or float on H₂ bubbles)"]].map((s, i) => `<li><i>${i + 1}</i><div><b>${s[0]}</b><span>${s[1]}</span></div></li>`).join("")}</ol>
          <div class="sh-rx"><p class="sh-k">Electrode reactions</p><p>Anode <code>Al → Al³⁺ + 3e⁻</code></p><p>Cathode <code>2H₂O + 2e⁻ → H₂ + 2OH⁻</code></p><p>Bulk <code>Al³⁺ + 3OH⁻ → Al(OH)₃</code></p><p class="sh-note">No chemicals added: the coagulant is generated in place from the plates.</p><p class="sh-warn">Needs still water and time.</p></div></div></div>
    </div></section>

    <section class="sh-pap sh-in " data-sec="Research"><div class="sh-wrap">
      <header class="sh-h sm"><small>Research</small><h2>Why electrocoagulation</h2></header>
      <div class="sh-cg"><div class="sh-card rv sh-map"><p class="sh-k">Market map</p><div class="sh-mapbox"><i class="vx"></i><i class="hx"></i><span class="ax t">On the drain line</span><span class="ax b">In the drum</span><span class="ax l">← Consumable filter / bag</span><span class="ax r">No consumables →</span>
          ${MAP.map((m, i) => `<span class="spt" style="left:${m[2] * 100}%;top:${m[3] * 100}%;--i:${i}"><i></i><b>${m[0]}</b><em>${m[1]}</em></span>`).join("")}<span class="spt me" style="left:92%;top:7%"><i></i><b>Shield</b><em>electrocoagulation</em></span></div></div>
        <div class="sh-card rv sh-mx"><p class="sh-k">Separation methods compared</p><table><thead><tr><th>Method</th><th>Removal</th><th>No filter</th><th>Scales</th><th>Verdict</th></tr></thead><tbody>${MATRIX.map((r) => `<tr${r[5] ? ' class="me"' : ""}><td>${r[0]}</td><td>${dots(r[1])}</td><td>${dots(r[2])}</td><td>${dots(r[3])}</td><td>${r[4]}</td></tr>`).join("")}</tbody></table></div>
        <div class="sh-col"><div class="sh-ev rv"><p class="sh-k">Evidence</p><b>94%</b><span>microplastic removal from laundry water with an Fe–Al pair at 2.16 A, pH 9 (Akarsu &amp; Deniz, 2021)</span></div>
          <div class="sh-op rv"><h3>Opportunity</h3><p>Most products rely on a filter the user must buy, change and bin. Electrocoagulation needs no filter, but only works in still water, so the device must hold each drain in a batch.</p></div></div></div></div></section>

    <section class="sh-pin sh-pap sh-cc" data-pin="concept" data-sec="Development" style="height:240vh"><div class="sh-stage">
      <header class="sh-h"><small>Development</small><h2>From concept to form</h2><p>Six directions judged against one goal: separate fibres with no filter to replace, in a device the user can live with.</p></header>
      <ul class="sh-cons">${CONCEPTS.map((c, i) => `<li class="${i === 5 ? "win" : ""}" style="${i < 5 ? `opacity:calc(1 - ${H(.12 + i * .1, .2 + i * .1)} * .62);transform:scale(calc(1 - ${H(.12 + i * .1, .2 + i * .1)} * .04))` : `--w:${H(.66, .82)}`}"><svg viewBox="0 0 200 110" fill="none" stroke="#0F2233" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">${c[2]}</svg><p><b>${c[0]}</b> · ${c[1]}</p></li>`).join("")}</ul>
      <div class="sh-why"><div style="${fade(.6, .76, 28)}"><h3>Why F</h3><p>A–C rely on a physical barrier, so they become consumables. D cannot treat two drains minutes apart. E works but sits out of reach behind the machine. F keeps two still cells and puts everything the user touches at the front.</p></div>
        <div style="${fade(.74, .9, 28)}"><h3>Sized by the drain</h3><p>Two cells of about 13 L each hold one drain apiece. Splitting the volume halves treatment time and puts the electrodes closer together for a stronger reaction.</p></div></div>
    </div></section>

    <section class="sh-pin sh-pap sh-fm" data-pin="forms" data-sec="Development" style="height:420vh"><div class="sh-stage">
      <header class="sh-h sm"><small>Development</small><h2>Form development</h2></header>
      <div class="sh-fg"><ol class="sh-fl">${FORMS.map((f, i) => `<li><i>0${i + 1}</i><div><b>${f[0]}</b><span>${f[1]}</span></div></li>`).join("")}</ol>
        <div class="sh-fv"><i class="sh-drop"></i>${FORMS.map((f, i) => IMG(`form-${i + 1}.webp`, `Form ${i + 1}: ${f[0]}. ${f[1]}`, "ff", false)).join("")}<span class="sh-fcap"></span></div></div>
    </div></section>

    <section class="sh-dark sh-te " data-sec="Testing"><div class="sh-wrap">
      <header class="sh-h sm"><small>Testing &amp; electronics</small><h2>Proving the process</h2><p>Bench tests chose the electrode pair; a single microcontroller runs both cells and every safety function.</p></header>
      <div class="sh-tg"><div class="sh-tl"><div class="sh-chart rv"><p class="sh-k">Electrode testing · separation vs voltage</p>
          <svg viewBox="0 0 990 440" role="img" aria-label="Estimated separation after 20 minutes against voltage. Aluminium and iron reaches 90 percent at 12 volts, iron and iron 75, aluminium and aluminium 60. The target is at least 70 percent.">
            <rect x="90" y="${ty(100)}" width="760" height="${ty(70) - ty(100)}" fill="#6FD3D6" opacity=".14"/><text x="104" y="${ty(70) - 10}" class="tt tq">PDS TARGET ≥ 70 %</text>
            ${[0, 20, 40, 60, 80, 100].map((v) => `<line x1="90" y1="${ty(v)}" x2="850" y2="${ty(v)}" class="gl"/><text x="76" y="${ty(v) + 4}" text-anchor="end" class="tt">${v}%</text>`).join("")}
            ${volts.map((v, i) => `<text x="${tx(i)}" y="408" text-anchor="middle" class="tt">${v}</text>`).join("")}
            <path class="ln aa" d="${pth(test.aa)}" pathLength="1"/><path class="ln fe" d="${pth(test.fe)}" pathLength="1"/><path class="ln al" d="${pth(test.al)}" pathLength="1"/>
            ${test.al.map((v, i) => `<circle class="pp al" style="--i:${i}" cx="${tx(i)}" cy="${ty(v)}" r="5"/>`).join("")}
            <text x="${tx(7) + 14}" y="${ty(90) + 5}" class="lb al">Al–Fe 90%</text><text x="${tx(7) + 14}" y="${ty(75) + 5}" class="lb fe">Fe–Fe 75%</text><text x="${tx(7) + 14}" y="${ty(60) + 5}" class="lb aa">Al–Al 60%</text>
            <text x="495" y="436" text-anchor="middle" class="tt">ESTIMATED SEPARATION AFTER 20 MIN · 1.5 L WATER + 3 G COLOURED FLOUR · ELECTRODES 75 MM APART</text></svg></div>
        <ul class="sh-ph">${[["t1", "Bench rig, 75 mm gap"], ["t2", "Al–Fe, low voltage"], ["t3", "Al–Fe, 10.5 V"], ["t4", "Al–Fe, 12 V: clear"]].map((t, i) => `<li class="rv" style="--i:${i}">${IMG(t[0] + ".webp", t[1])}<span>${t[1]}</span></li>`).join("")}</ul>
        <p class="sh-fn">1.5 L of water with 3 g of coloured flour; 20 minutes per test; separation estimated from turbidity and collected solids. Bench scale: full-size tests with real laundry water are the next step.</p></div>
        <div class="sh-tr"><div class="sh-res rv"><b>90%</b><span>estimated separation with the aluminium–iron pair at 12 V in 20 minutes, inside the 30-minute cycle.</span></div>
          <div class="sh-ctl rv"><p class="sh-k">Control system</p>
            <div class="sh-cs"><ul class="in">${[["Float switches ×4", "upper + safety, per cell"], ["Inlet flow sensor", "detects machine drain"], ["Drawer sensor + full float", ""], ["Override button", "child-safe cover"]].map((x) => `<li><b>${x[0]}</b>${x[1] ? `<span>${x[1]}</span>` : ""}</li>`).join("")}</ul>
              <div class="mcu"><b>Microcontroller</b><span>PIC18F45K20 · 3.3 V</span><em>24 V SELV adapter<small>external · regulators 12 V / 5 V</small></em></div>
              <ul class="out">${[["Solenoid valves ×6", "inlet · decant · sludge"], ["Drain pump", "12 V, lifts to standpipe"], ["Electrode driver", "constant current, reversing"], ["Light bar + lock", "5 LEDs · drawer solenoid"]].map((x) => `<li><b>${x[0]}</b><span>${x[1]}</span></li>`).join("")}</ul></div></div>
          <div class="sh-two"><div class="rv"><h3>Fail-safe</h3><p>A second float drains a cell if a valve sticks; a passive overflow means the machine pump is never blocked.</p></div><div class="rv"><h3>Child-safe</h3><p>Drain-now button under a slide cover; the drawer locks while sludge is released.</p></div></div></div></div></div></section>

    <section class="sh-pin sh-pap sh-ex " data-pin="parts" data-sec="Design" style="height:420vh"><div class="sh-stage">
      <header class="sh-h sm"><small>Design</small><h2>Details</h2><p>850 × 600 × 150 mm. Everything the user touches is on the front or top; the hoses connect once at the back.</p></header>
      <div class="sh-eg"><div class="sh-ev2"><div class="sh-exw">${IMG("exploded.webp", "Exploded view of Shield: top cap, light bar, electrode cassettes, twin cells, divider, electronics bay, manifold, hopper base, ports, pump and valves, mesh basket and drawer", "", false)}${PP.map((q, i) => `<span class="spt" data-i="${i}" style="left:${q[0]}%;top:${q[1]}%">${i + 1}</span>`).join("")}</div></div>
        <div class="sh-pr"><p class="sh-now"><i>01</i><b>${PARTS[0]}</b></p><ol class="sh-pl">${PARTS.map((n, i) => `<li><i>${i + 1}</i>${n}</li>`).join("")}</ol></div></div>
    </div></section>

    <section class="sh-pin sh-mist sh-tw " data-pin="steps" data-sec="Design" style="height:440vh"><div class="sh-stage"><div class="sh-twg" data-s="0">
      <div class="sh-twl"><header class="sh-h sm"><small>Design</small><h2>How Shield works</h2><p>Each drain is held in its own still cell. Five alternating aluminium and iron plates generate the coagulant; after 30 minutes the floc settles into a hopper base. Clear water is decanted from 20% height and pumped to the standpipe, then the floating and settled floc drop together into a drawer.</p></header>
        <ol class="sh-sl">${STEPS.map((s, i) => `<li><i>0${i + 1}</i><div><b>${s[0]}</b><span>${s[1]}</span><em>${s[2]}</em></div></li>`).join("")}</ol></div>
      <div class="sh-twv">${tower()}</div></div></div></section>

    <section class="sh-pin sh-dark sh-dt " data-pin="details" data-sec="Design" style="height:440vh"><div class="sh-stage">
      <header class="sh-h sm"><small>Design</small><h2>Made to live in a kitchen</h2></header>
      <div class="sh-trk">${[["lightbar", "Light bar", "Five segments show progress; the bar flashes red when the drawer is full."], ["drawer", "Front drawer", "A reusable 100 µm mesh basket holds the floc as a damp cake for a prepaid return pouch."], ["lift", "Lift-out electrodes", "Plate cassettes pull straight up for replacement every 2–5 years."], ["home", "In the home", "Matches the machine’s height and depth; only the front edge shows."]].map((d, i) => `<figure><div class="im">${IMG(d[0] + ".webp", d[1] + ": " + d[2], "", i > 0)}</div><figcaption><i>0${i + 1}</i><b>${d[1]}</b><span>${d[2]}</span></figcaption></figure>`).join("")}</div>
      <div class="sh-bar"><i style="transform:scaleX(var(--p))"></i></div>
    </div></section>

    <section class="sh-pap sh-bz " data-sec="Business"><div class="sh-wrap">
      <header class="sh-h sm"><small>Business</small><h2>Cost analysis</h2><p>Shield costs more up front than a cartridge filter, but never needs another purchase.</p></header>
      <div class="sh-card rv sh-cost"><p class="sh-k">Where £200 goes · cost per unit at 20,000 units a year</p>
        <div class="bar">${costs.map((c, i) => `<i style="--w:${c[1] / 2}%;--c:${c[2]};--i:${i}"></i>`).join("")}</div>
        <ul class="leg">${costs.map((c) => `<li><s style="background:${c[2]}"></s><b>${c[0]}</b><span>£${c[1].toFixed(2)} · ${c[3]}% of RRP</span></li>`).join("")}</ul></div>
      <div class="sh-bg2"><div class="sh-l2"><div class="sh-two2"><div class="sh-card rv"><b>£104.68</b>total unit cost, including assembly and packaging</div><div class="sh-card rv"><b>£95.32</b>margin per unit at £200; ≈ £1.9 m a year at 20,000 units</div></div>
          <div class="sh-card rv sh-mk"><p class="sh-k">Sizing the market</p>${[["1 billion", "washing-machine owners worldwide", 100], ["10 million", "1% who might consider a device", 75], ["200,000", "conservative market size", 55], ["20,000 / yr", "planned batch production", 42]].map((m, i) => `<div class="mr" style="--i:${i}"><span style="--w:${m[2]}%"><b>${m[0]}</b></span><em>${m[1]}</em></div>`).join("")}</div></div>
        <div class="sh-r2"><div class="sh-card rv sh-co"><p class="sh-k">Five-year cost of ownership</p>
            <svg viewBox="0 0 800 340" role="img" aria-label="Five-year cost: a cartridge filter reaches about £238 after five years, passing Shield at £120 in year two and £200 in year four">
              <rect x="90" y="${cy(200)}" width="610" height="${cy(120) - cy(200)}" fill="#6FD3D6" opacity=".2"/>
              ${[0, 50, 100, 150, 200, 250].map((v) => `<line x1="90" y1="${cy(v)}" x2="700" y2="${cy(v)}" class="gl"/><text x="76" y="${cy(v) + 4}" text-anchor="end" class="tt">£${v}</text>`).join("")}
              ${cart.map((v, i) => `<text x="${cx(i)}" y="316" text-anchor="middle" class="tt">YR ${i}</text>`).join("")}
              <line class="ln s2" x1="90" y1="${cy(200)}" x2="700" y2="${cy(200)}" pathLength="1"/><line class="ln s1" x1="90" y1="${cy(120)}" x2="700" y2="${cy(120)}" pathLength="1" stroke-dasharray="7 6"/>
              <path class="ln cr" d="${cartP}" pathLength="1"/>${cart.map((v, i) => `<circle class="pp cr" style="--i:${i}" cx="${cx(i)}" cy="${cy(v)}" r="5"/>`).join("")}
              <text x="712" y="${cy(238) - 6}" class="lb cr">Cartridge filter</text><text x="712" y="${cy(238) + 10}" class="sm2 cr">≈ £238 after 5 yrs</text><text x="712" y="${cy(200) + 5}" class="lb sh">Shield £200</text><text x="712" y="${cy(120) + 5}" class="lb sh">Shield £120</text></svg></div>
          <div class="sh-two"><div class="rv"><h3>Lower the cost</h3><p>Components are 54% of cost, mostly solenoid valves: bulk pricing and 2-channel relays bring it down, and a die-cut card insert can replace foam packaging.</p></div><div class="rv"><h3>Close the loop</h3><p>Prepaid return pouches send fibre cake for recovery and spent plates for metal recycling, building a long-term service relationship.</p></div></div></div></div>
      <p class="sh-fn">Cartridge filter based on published pricing (≈ €100 in year one, €45 a year after), converted at about €1 = £0.85. Processing costed with the Swift &amp; Booker method.</p></div></section>

    <section class="sh-end sh-dark " data-sec="Overview"><div class="sh-ei"><figure class="rv sh-poster">${IMG("hero.jpg", "The Shield poster: Protecting the ocean, one wash at a time. No filters to buy or replace, about 90 percent fibre separation in test, 150 mm wide and fitting beside any machine.")}</figure>
      <p class="sh-cred">Final year design project · Product design · Alex Denli</p></div></section>
    ${tail}</article>`;
  }

  let off = [];
  function wire() {
    off.forEach((f) => f()); off = [];
    const root = document.querySelector(".shd");
    if (!root) return;
    const $ = (s, r = root) => r.querySelector(s), $$ = (s, r = root) => Array.from(r.querySelectorAll(s));
    const vh = () => window.innerHeight;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) root.classList.add("calm");

    if ("IntersectionObserver" in window && !reduce) {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.25 });
      $$(".rv, .sh-hero").forEach((n) => io.observe(n)); off.push(() => io.disconnect());
    } else $$(".rv, .sh-hero").forEach((n) => n.classList.add("in"));

    const P = {
      prob(el, p) {
        $$(".sh-st b", el).forEach((b, i) => {
          const t = cl((p - (.02 + i * .05)) / .16), v = +b.dataset.to * (1 - Math.pow(1 - t, 3)), d = +b.dataset.dec;
          b.textContent = (t > 0 ? b.dataset.pre : "") + (d ? v.toFixed(d) : Math.round(v)) + b.dataset.suf;
        });
        const j = cl((p - .58) / .34); el.style.setProperty("--j", j.toFixed(4));
        const jr = $(".sh-jr", el), n = j > .98 ? 4 : j > .64 ? 3 : j > .31 ? 2 : j > 0 ? 1 : 0;
        if (jr.dataset.n != n) jr.dataset.n = n;
      },
      ec(el, p) { const k = p < .3 ? 0 : p < .62 ? 1 : 2; const st = $(".sh-stage", el); if (st.dataset.k != k) st.dataset.k = k; },
      forms(el, p) {
        const k = cl(p / .86) * 4, ims = $$(".ff", el), lis = $$(".sh-fl li", el);
        ims.forEach((im, i) => { const d = Math.abs(k - i), o = cl(1.35 - d * 1.9); im.style.opacity = o.toFixed(3); im.style.transform = `translateY(${((k - i) * -26).toFixed(1)}px) scale(${(1 - Math.min(d, 1) * .05).toFixed(3)})`; });
        const a = Math.min(4, Math.max(0, Math.round(k - .1))); lis.forEach((l, i) => l.classList.toggle("on", i === a));
        $(".sh-fv", el).classList.toggle("fin", a === 4);
      },
      parts(el, p) {
        const a = Math.min(11, Math.floor(cl(p * 1.12 - .04) * 12));
        $$(".spt", el).forEach((n, i) => n.classList.toggle("on", i === a));
        $$(".sh-pl li", el).forEach((n, i) => n.classList.toggle("on", i === a));
        const now = $(".sh-now", el); now.firstChild.textContent = String(a + 1).padStart(2, "0"); now.lastChild.textContent = PARTS[a];
      },
      steps(el, p) {
        const s = Math.min(5, Math.floor(cl(p * 1.1) * 6)), g = $(".sh-twg", el);
        if (g.dataset.s != s) g.dataset.s = s;
        $$(".sh-sl li", el).forEach((n, i) => n.classList.toggle("on", i === s));
      }
    };
    const pins = $$("[data-pin]");
    $$(".sh-pl li", root).forEach((li, i) => li.addEventListener("click", () => { const el = li.closest("[data-pin]"), r = el.getBoundingClientRect(); window.scrollTo({ top: scrollY + r.top + (i / 12 + .02 + .04) / 1.12 * (r.height - vh()), behavior: "smooth" }); }));

    const fix = $(".sh-fix"), secs = $$("section[data-sec]");
    const label = () => {
      const h = vh(); let cur = null;
      secs.forEach((s) => { const r = s.getBoundingClientRect(); if (r.top < h * .45 && r.bottom > h * .45) cur = s; });
      const show = cur && cur.dataset.sec !== "Overview";
      fix.classList.toggle("on", !!show); if (show) fix.lastElementChild.textContent = cur.dataset.sec;
    };
    let raf = 0;
    const fit = () => {
      $$(".sh-pin:not(.sh-dt) .sh-stage", root).forEach((st) => {
        const kids = [...st.children]; kids.forEach((k) => (k.style.zoom = ""));
        const cs = getComputedStyle(st), avail = st.clientHeight - parseFloat(cs.paddingBottom);
        const need = Math.max(...[...st.querySelectorAll("*")].filter((e) => !e.closest("svg") || e.tagName === "svg").map((k) => k.getBoundingClientRect().bottom)) - st.getBoundingClientRect().top;
        let z = Math.max(.5, Math.min(1, avail / need));
        if (z < .995) { kids.forEach((k) => (k.style.zoom = z.toFixed(3)));
          const n2 = Math.max(...[...st.querySelectorAll("*")].filter((e) => !e.closest("svg") || e.tagName === "svg").map((k) => k.getBoundingClientRect().bottom)) - st.getBoundingClientRect().top;
          if (n2 > avail + 1) { z = Math.max(.5, z * avail / n2); kids.forEach((k) => (k.style.zoom = z.toFixed(3))); } }
      });
    };
    fit(); addEventListener("resize", fit); off.push(() => removeEventListener("resize", fit));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    const tick = () => {
      raf = 0;
      if (!root.isConnected) { off.forEach((f) => f()); off = []; return; }
      const h = vh();
      label();
      root.style.setProperty("--sy", scrollY.toFixed(0));
      pins.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -h || r.top > h * 2) return;
        const p = reduce ? 1 : cl(-r.top / Math.max(1, r.height - h));
        el.style.setProperty("--p", p.toFixed(4));
        const f = P[el.dataset.pin]; if (f) f(el, p);
      });
    };
    const q = () => { if (!raf) raf = requestAnimationFrame(tick); };
    addEventListener("scroll", q, { passive: true }); addEventListener("resize", q);
    off.push(() => { removeEventListener("scroll", q); removeEventListener("resize", q); cancelAnimationFrame(raf); });
    tick(); setTimeout(tick, 150);
  }

  window.SHIELD = { render, wire };
})();
