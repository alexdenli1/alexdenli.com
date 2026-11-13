/* =====================================================================
   ALEX DENLI — SITE CONTENT
   This is the only file you edit to update the site. The design lives
   in css/style.css and js/app.js and never needs touching.

   ADD A PROJECT    copy one { ... } block inside "projects" and change it.
   ADD TO GALLERY   add one { src: "..." } to "gallery" (the strip at the bottom of the home page, first 10 shown).
   IMAGES           put files in /images/<project-name>/ and point "hero"
                    and block "src" at them, e.g. "images/rescue/hero.jpg".

   Project fields
     slug      short-name-with-dashes (used in the web address, must be unique)
     title     shown everywhere
     category  one of the ids in "categories" below
     year      e.g. 2026, or a range like "2022 – now" (the archive sorts by the first number in it)
     status    "current" (shows on Projects) or "archive" (shows on Archive)
     hidden    true = on the home page visitors have to find it with the cursor
     hero      main image
     summary   one or two short sentences
     scope     optional: replaces the category in the small line under the name on the home page
     line      optional: the single line shown under the name on the home page (falls back to summary)
     blocks    the project page, top to bottom. Block types:
       { type: "statement", text }                 big text for the key point
       { type: "text", heading, text }             small text (heading optional)
       { type: "image", src, caption, size }       size: "full" | "wide" | "left" | "right"
       { type: "pair", images: [src, src] }        two images side by side
       { type: "stats", items: [{ value, label }] }   results (e-commerce)
       { type: "steps", items: [{ title, text, src }] } process (product design)
   ===================================================================== */

const PH = (n) => "images/placeholder/ph-" + String(n).padStart(2, "0") + ".svg";

window.SITE = {
  owner: {
    name: "Alex Denli",
    role: "Product, graphic and e-commerce design",
    location: "London",
    email: "alexdenli200@gmail.com", // the address shown on the contact page and in the footer
    intro: "I design golf products, the adverts that sell them and the online stores they sell through.",
    headline: "Creative Designer",                               // the big line at the top of the home page
    disciplines: ["Graphic", "Product", "UX/UI", "E-commerce"],  // the small line spread evenly beneath it
    collage: "images/collage/collage.jpg",  // 1920x1080 (or larger) collage of your work, frosted behind the headline
    about: [
      "Placeholder: a short paragraph about who you are and the kind of work you do. Two or three sentences is plenty.",
      "Placeholder: a second paragraph about how you work — from first sketch and supplier sample through to the advert, the listing and the sales figures."
    ],
    links: [
      { label: "LinkedIn", url: "#" },
      { label: "Instagram", url: "#" },
      { label: "Download portfolio (PDF)", url: "#" }
    ]
  },

  categories: [
    { id: "product-design", label: "Product design" },
    { id: "graphic-design", label: "Graphic design" },
    { id: "e-commerce", label: "E-commerce" },
    { id: "ux-ui", label: "UX/UI" }
  ],

  projects: [
    {
      slug: "xfly", title: "XFLY", category: "product-design",
      year: 2026, status: "current", hero: "images/xfly/hero.jpg",
      line: "A golf launch monitor at a competitive price, with a Bluetooth app, for amateur to professional golfers.",
      summary: "A golf launch monitor at a competitive price, with a Bluetooth app, for amateur to professional golfers.",
      blocks: [
        { type: "statement", text: "Placeholder: the problem XFLY solves, said in one sentence a golfer would nod at." },
        { type: "text", heading: "The brief", text: "Placeholder: what it had to do, and the constraints — price, materials, timing." },
        { type: "steps", items: [
          { title: "Research", text: "Placeholder: what you looked at and what you learned.", src: PH(2) },
          { title: "Design", text: "Placeholder: the directions you explored and the one you chose.", src: PH(3) },
          { title: "Prototype", text: "Placeholder: samples, testing and what changed.", src: PH(4) },
          { title: "Final product", text: "Placeholder: what shipped.", src: PH(5) }
        ] },
        { type: "image", src: PH(6), size: "full", caption: "Placeholder caption" },
        { type: "statement", text: "Placeholder: the result." }
      ]
    },
    {
      slug: "adverts", title: "Adverts", category: "graphic-design",
      year: "2025 – now", status: "current", hero: "images/adverts/hero.jpg",
      summary: "Magazine adverts for print and online, produced monthly.",
      blocks: [
        { type: "statement", text: "Placeholder: what makes a golf advert work on a crowded magazine page." },
        { type: "image", src: PH(6), size: "wide", caption: "Placeholder: advert one, where it ran" },
        { type: "pair", images: [PH(7), PH(8)] },
        { type: "text", text: "Placeholder: a few lines on how the adverts are made, from brief to print-ready file." },
        { type: "image", src: PH(12), size: "right", caption: "Placeholder: advert four" }
      ]
    },
    {
      slug: "signature-logo", title: "Signature Logo Collection", category: "graphic-design",
      year: "2025 – now", status: "current", hero: "images/signature-logo/hero.jpg",
      summary: "A fully custom logo range of promotional products for golf clubs.",
      blocks: [
        { type: "statement", text: "Placeholder: what the collection is and who it is for." },
        { type: "image", src: PH(9), size: "full" },
        { type: "text", heading: "The brochure", text: "Placeholder: how the range and price list were presented." },
        { type: "pair", images: [PH(10), PH(11)] }
      ]
    },
    {
      slug: "rescue", title: "Rescue", category: "ux-ui",
      year: "2026 redevelopment", status: "archive", hero: "images/rescue/hero.jpg",
      summary: "A children's app for learning about energy saving, designed at university and redone in 2026.",
      blocks: [
        { type: "statement", text: "Placeholder: what Rescue is and who it is for." },
        { type: "image", src: PH(10), size: "full" },
        { type: "text", heading: "The approach", text: "Placeholder: research, user flows and how the interface was tested." },
        { type: "pair", images: [PH(11), PH(12)] }
      ]
    },
    {
      slug: "ball-cabinet", title: "Ball Cabinet", category: "product-design",
      year: 2025, status: "archive", hero: PH(4),
      summary: "Placeholder: one line on the ball cabinet.",
      blocks: [
        { type: "statement", text: "Placeholder: the problem the cabinet solves." },
        { type: "steps", items: [
          { title: "Research", text: "Placeholder.", src: PH(14) },
          { title: "Sketches", text: "Placeholder.", src: PH(15) },
          { title: "Final product", text: "Placeholder.", src: PH(16) }
        ] }
      ]
    },
    {
      slug: "brand-identity", title: "Brand Identity", category: "graphic-design",
      year: 2025, status: "archive", hero: PH(13),
      summary: "Placeholder: logos, colour and type systems.",
      blocks: [
        { type: "statement", text: "Placeholder: the idea behind the identity." },
        { type: "image", src: PH(14), size: "full" },
        { type: "pair", images: [PH(15), PH(16)] },
        { type: "text", text: "Placeholder: where the identity is used." }
      ]
    }
  ],

  /* Gallery strip at the bottom of the home page: it slides to the left as the visitor scrolls.
     The first 10 are shown. List them from current and archived work, in the order they should appear.
     "project" is optional: give a project slug and the image links to that project's page. */
  /* Brands and organisations you have worked with or for: the wheel on the home page (first 10 shown).
     Logos look best as transparent PNG or SVG, in colour or white — they sit on black. */
  brands: [
    { name: "Oakley", logo: "images/brands/oakley.png", size: 0.88 },
    { name: "SuperStroke", logo: "images/brands/superstroke.png" },
    { name: "Bettinardi", logo: "images/brands/bettinardi.png" },
    { name: "Clicgear", logo: "images/brands/clicgear.png" },
    { name: "Longridge", logo: "images/brands/longridge.png" },
    { name: "BagBoy", logo: "images/brands/bagboy.png" },
    { name: "EzeGlide", logo: "images/brands/ezeglide-white.png" }   // white version: the colour one vanishes on black (colour file: ezeglide.png)
  ],

  gallery: [
    { src: "images/xfly/hero.jpg", project: "xfly" }, { src: "images/adverts/hero.jpg", project: "adverts" }, { src: "images/signature-logo/hero.jpg", project: "signature-logo" },
    { src: PH(4), project: "ball-cabinet" }, { src: "images/rescue/hero.jpg", project: "rescue" }, { src: PH(13), project: "brand-identity" },
    { src: PH(6), project: "signature-logo" }, { src: PH(2), project: "adverts" }, { src: PH(3), project: "xfly" },
    { src: PH(14), project: "brand-identity" }
  ],

};
