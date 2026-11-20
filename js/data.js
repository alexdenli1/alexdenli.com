/* =====================================================================
   ALEX DENLI — SITE CONTENT
   This is the only file you edit to update the site. The design lives
   in css/style.css and js/app.js and never needs touching.

   ADD A PROJECT    copy one { ... } block inside "projects" and change it.
   ADD TO GALLERY   add one { src: "..." } to "gallery" (the strip at the bottom of the home page, first 10 shown).
   IMAGES           put files in /images/<project-name>/ and point "hero"
                    and block "src" at them, e.g. "images/rescue/hero-1920.jpg".

   Project fields
     slug      short-name-with-dashes (used in the web address, must be unique)
     title     shown everywhere
     category  one of the ids in "categories" below
     year      e.g. 2026, or a range like "2022 – now" (the archive sorts by the first number in it)
     thumb     optional cut-out image for the home dial; cut: true drops the circle and adds a shadow
     study     true marks a finished university case study (shown as a tag in the full list)
     status / featured are no longer used for routing; every project appears everywhere, newest first
     hidden    true = on the home page visitors have to find it with the cursor
     hero      main image
     preview   optional: pictures for the Archive hover slideshow, e.g. preview: ["images/x/1.jpg", "images/x/2.jpg"].
               If left out, it plays the hero then every image used on the project page.
     summary   one or two short sentences
     process   the steps shown when the project is hovered on the Projects page: [{ title, text }, ...] (3 or 4 work best)
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
    phone: "+44 7 568 599 300",       // shown on the contact page
    intro: "Graphic and product designer with 3–4 years' experience, taking products from first concept to launch.",
    headline: "Creative Designer",                               // the big line at the top of the home page
    disciplines: ["Graphic", "Product", "UX/UI", "E-commerce"],  // the small line spread evenly beneath it
    collage: "images/collage/collage.jpg",  // 1920x1080 (or larger) collage of your work, frosted behind the headline
    about: [
      "I work across product development, packaging, branding, marketing and Amazon e-commerce, from sketch and supplier sourcing through manufacturing, launch and promotion.",
      "I balance creativity, user appeal and commercial results, using Adobe Creative Suite, product photography, video and email marketing to build products and brands people connect with."
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
      year: 2026, status: "current", thumb: "images/xfly/thumb.webp", cut: true, hero: "images/xfly/hero.jpg",
      line: "A golf launch monitor at a competitive price, with a Bluetooth app, for amateur to professional golfers.",
      process: [{ title: "Research", text: "Placeholder: what golfers and competing monitors showed." }, { title: "Design", text: "Placeholder: the directions explored and the one chosen." }, { title: "Prototype", text: "Placeholder: samples, testing and what changed." }, { title: "Final product", text: "Placeholder: what shipped, and the Bluetooth app." }],
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
      year: "2025 – now", status: "current", thumb: "images/adverts/thumb.webp", cut: true, hero: "images/adverts/hero.jpg",
      process: [{ title: "Brief", text: "Placeholder: the product, the audience and the page it runs on." }, { title: "Concept", text: "Placeholder: the idea that stops a reader on a crowded page." }, { title: "Layout", text: "Placeholder: image, headline and offer, built to the magazine spec." }, { title: "Print-ready", text: "Placeholder: proofs, sign-off and the final files." }],
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
      year: "2025 – now", status: "current", thumb: "images/signature-logo/thumb.webp", cut: true, hero: "images/signature-logo/hero.jpg",
      process: [{ title: "Range", text: "Placeholder: which products carry a club's logo." }, { title: "Artwork", text: "Placeholder: preparing each club's logo for every product." }, { title: "Brochure", text: "Placeholder: laying out the range and price list." }, { title: "Launch", text: "Placeholder: how it reached golf clubs." }],
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
      study: true, year: "2026 redevelopment", status: "archive", featured: true, hero: "images/rescue/hero.jpg",
      process: [{ title: "Storyboard", text: "Josh's day, drawn out to find where energy saving could fit." }, { title: "Bodystorming", text: "Acting the app out with people and props, before any design." }, { title: "Prototype", text: "A clickable Marvel prototype so real people could try the route." }, { title: "Redevelopment", text: "In 2026: Pip the red panda, a core daily loop and a playable gate." }],
      summary: "A children's app for learning about energy saving, designed at university and redone in 2026.",
      blocks: [
        
        { type: "image", src: PH(10), size: "full" },
        { type: "text", heading: "The approach", text: "Placeholder: research, user flows and how the interface was tested." },
        { type: "pair", images: [PH(11), PH(12)] }
      ]
    },
    /* PARKED until hero shots arrive — move back into the list to show them again.
    {
      slug: "ball-cabinet", title: "Ball Cabinet", category: "product-design",
      year: 2025, status: "archive", featured: true, hero: PH(4),
      process: [{ title: "Research", text: "Placeholder: shipping, storage and what the old cabinet cost." }, { title: "Sketches", text: "Placeholder: flat-pack options explored." }, { title: "Final product", text: "Placeholder: the cabinet that ships efficiently." }],
      summary: "Redesigning a flat-pack golf ball cabinet for efficient shipping, logistics and storage, for a top-selling product.",
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
      year: 2025, status: "archive", featured: true, hero: PH(13),
      process: [{ title: "Idea", text: "Placeholder: what the identity needed to say." }, { title: "Logo", text: "Placeholder: marks and how they were refined." }, { title: "System", text: "Placeholder: colour, type and where they are used." }],
      summary: "Placeholder: logos, colour and type systems.",
      blocks: [
        { type: "statement", text: "Placeholder: the idea behind the identity." },
        { type: "image", src: PH(14), size: "full" },
        { type: "pair", images: [PH(15), PH(16)] },
        { type: "text", text: "Placeholder: where the identity is used." }
      ]
    },
    */
    {
      slug: "relinquit", title: "Relinquit", category: "product-design",
      study: true, year: 2021, status: "archive", thumb: "images/relinquit/thumb.webp", cut: true, hero: "images/relinquit/hero.jpg",
      process: [{ title: "Research", text: "4.9m people in the UK still smoke, and half want to quit." }, { title: "Ideation", text: "Eight mechanisms sketched, scored and cut to one thumb, one cigarette." }, { title: "Model", text: "A pebble-sized case, an always-on e-ink screen and four colourways." }, { title: "App", text: "Nine calm screens that end on a quit date." }],
      summary: "A connected cigarette case that spaces out each cigarette and steps you down to a quit date you choose.",
      blocks: []
    },
    {
      slug: "shield", title: "Shield", category: "product-design",
      study: true, year: 2022, status: "archive", thumb: "images/shield/thumb.webp", cut: true, hero: "images/shield/hero.jpg",
      scope: "Final year project",
      summary: "A retrofit unit that captures microfibres from washing-machine wastewater, with no filter to replace.",
      blocks: []
    },
    {
      slug: "aeropress", title: "Aeropress Coffee Machine", category: "product-design",
      study: true, year: 2022, status: "archive", hero: "images/aeropress/hero.jpg",
      scope: "University team project",
      summary: "A hands-free AeroPress machine: wave to choose a brew and it stirs, steeps and presses the coffee for you.",
      blocks: []
    }
  ],

  /* Gallery strip at the bottom of the home page: it slides to the left as the visitor scrolls.
     The first 10 are shown. List them from current and archived work, in the order they should appear.
     "project" is optional: give a project slug and the image links to that project's page. */
  /* Brands and organisations you have worked with or for: the wheel on the home page (first 10 shown).
     Logos look best as transparent PNG or SVG, in colour or white — they sit on black. */
  brands: [
    { name: "SuperStroke", logo: "images/brands/superstroke.png" },                 // colour: top-left corner
    { name: "Oakley", logo: "images/brands/oakley.png", size: 0.88 },
    { name: "Longridge", logo: "images/brands/longridge.png" },                    // colour: top-right corner
    { name: "Skins Golf", logo: "images/brands/skins-golf-white.png" },
    { name: "Bettinardi", logo: "images/brands/bettinardi.png" },
    { name: "XFLY", logo: "images/brands/xfly-white.png" },                        // white version of the black wordmark
    { name: "The Schoolwear Specialists", logo: "images/brands/schoolwear-specialists.png" },
    { name: "BagBoy", logo: "images/brands/bagboy.png" },                          // colour: bottom-left corner
    { name: "EzeGlide", logo: "images/brands/ezeglide-white.png" },              // white version: the colour one vanishes on black (colour file: ezeglide.png)
    { name: "Clicgear", logo: "images/brands/clicgear.png" }                       // colour: bottom-right corner
  ],

  gallery: [
    { src: "images/aeropress/hero.jpg", project: "aeropress" }, { src: "images/shield/hero.jpg", project: "shield" }, { src: "images/relinquit/hero.jpg", project: "relinquit" },
    { src: "images/shield/hero-render.webp", project: "shield" }, { src: "images/aeropress/gesture.webp", project: "aeropress" }, { src: "images/relinquit/hero-case.webp", project: "relinquit" },
    { src: "images/shield/lift.webp", project: "shield" }, { src: "images/aeropress/head.webp", project: "aeropress" }, { src: "images/relinquit/open.webp", project: "relinquit" },
    { src: "images/shield/drawer.webp", project: "shield" }
  ],


};
