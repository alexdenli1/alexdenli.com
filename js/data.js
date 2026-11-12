/* =====================================================================
   ALEX DENLI — SITE CONTENT
   This is the only file you edit to update the site. The design lives
   in css/style.css and js/app.js and never needs touching.

   ADD A PROJECT    copy one { ... } block inside "projects" and change it.
   ADD TO GALLERY   add one { src: "..." } to "gallery" (the strip at the bottom of the home page).
   IMAGES           put files in /images/<project-name>/ and point "hero"
                    and block "src" at them, e.g. "images/rescue/hero.jpg".

   Project fields
     slug      short-name-with-dashes (used in the web address, must be unique)
     title     shown everywhere
     category  one of the ids in "categories" below
     year      e.g. 2026
     status    "current" (shows on Projects) or "archive" (shows on Archive)
     hidden    true = on the home page visitors have to find it with the cursor
     hero      main image
     summary   one or two short sentences
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
    email: "hello@alexdenli.com", // placeholder — change to the address you want public
    intro: "I design golf products, the adverts that sell them and the online stores they sell through.",
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
      year: 2026, status: "current", hero: PH(1),
      summary: "Placeholder: one line on what XFLY is and your part in it.",
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
      year: 2026, status: "current", hero: PH(2),
      summary: "Placeholder: magazine adverts for print and online, about one a month.",
      blocks: [
        { type: "statement", text: "Placeholder: what makes a golf advert work on a crowded magazine page." },
        { type: "image", src: PH(6), size: "wide", caption: "Placeholder: advert one, where it ran" },
        { type: "pair", images: [PH(7), PH(8)] },
        { type: "text", text: "Placeholder: a few lines on how the adverts are made, from brief to print-ready file." },
        { type: "image", src: PH(12), size: "right", caption: "Placeholder: advert four" }
      ]
    },
    {
      slug: "signature-logo", title: "Signature Logo", category: "graphic-design",
      year: 2026, status: "current", hero: PH(3),
      summary: "Placeholder: one line on the Signature Logo collection and the brochure.",
      blocks: [
        { type: "statement", text: "Placeholder: what the collection is and who it is for." },
        { type: "image", src: PH(9), size: "full" },
        { type: "text", heading: "The brochure", text: "Placeholder: how the range and price list were presented." },
        { type: "pair", images: [PH(10), PH(11)] }
      ]
    },
    {
      slug: "rescue", title: "Rescue", category: "ux-ui",
      year: 2023, status: "archive", hero: PH(9),
      summary: "Placeholder: a children's app, designed as a university UX/UI project.",
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
    },
    {
      slug: "amazon", title: "Amazon", category: "e-commerce",
      year: 2026, status: "current", hero: PH(5),
      summary: "Placeholder: brand stores, listings and advertising on Amazon.",
      blocks: [
        { type: "statement", text: "Placeholder: what the Amazon work set out to change." },
        { type: "stats", items: [
          { value: "+00%", label: "Placeholder: sales" },
          { value: "+00%", label: "Placeholder: conversion rate" },
          { value: "000", label: "Placeholder: listings updated" }
        ] },
        { type: "image", src: PH(9), size: "full", caption: "Placeholder: before and after" },
        { type: "text", heading: "What changed", text: "Placeholder: the main decisions — layout, photography, copy — and why." },
        { type: "image", src: PH(10), size: "left" },
        { type: "statement", text: "Placeholder: where the numbers are projected to go next." }
      ]
    }
  ],

  /* Gallery strip at the bottom of the home page: it slides to the left as the visitor scrolls.
     Add as many images as you like, from current and archived work, in the order they should appear.
     "project" is optional: give a project slug and the image links to that project's page. */
  gallery: [
    { src: PH(1), project: "xfly" }, { src: PH(6), project: "adverts" }, { src: PH(9), project: "signature-logo" },
    { src: PH(4), project: "ball-cabinet" }, { src: PH(10), project: "rescue" }, { src: PH(13), project: "brand-identity" },
    { src: PH(5), project: "amazon" }, { src: PH(2), project: "adverts" }, { src: PH(3), project: "xfly" },
    { src: PH(14), project: "brand-identity" }, { src: PH(7), project: "adverts" }, { src: PH(15), project: "ball-cabinet" },
    { src: PH(11), project: "rescue" }, { src: PH(8), project: "adverts" }, { src: PH(16) }, { src: PH(12), project: "signature-logo" },
    { src: PH(1), project: "amazon" }, { src: PH(6) }, { src: PH(9), project: "xfly" }, { src: PH(4) }
  ],

};
