/* =====================================================================
   ALEX DENLI — SITE CONTENT
   This is the only file you edit to update the site. The design lives
   in css/style.css and js/app.js and never needs touching.

   ADD A PROJECT    copy one { ... } block inside "projects" and change it.
   ADD A LOG ENTRY  add one line at the TOP of "log".
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
    { id: "marketing", label: "Marketing" },
    { id: "ux-ui", label: "UX/UI" }
  ],

  projects: [
    {
      slug: "product-project-01", title: "Product project 01", category: "product-design",
      year: 2026, status: "current", hero: PH(1),
      summary: "Placeholder: one line on what the product is and who it is for.",
      blocks: [
        { type: "statement", text: "Placeholder: the problem this product solves, said in one sentence a golfer would nod at." },
        { type: "text", heading: "The brief", text: "Placeholder: who asked for it, what it had to do, and the constraints — price, materials, timing." },
        { type: "steps", items: [
          { title: "Research", text: "Placeholder: what you looked at and what you learned.", src: PH(2) },
          { title: "Sketches", text: "Placeholder: the directions you explored and the one you chose.", src: PH(3) },
          { title: "Prototype", text: "Placeholder: samples, testing and what changed.", src: PH(4) },
          { title: "Final product", text: "Placeholder: what shipped.", src: PH(5) }
        ] },
        { type: "image", src: PH(6), size: "full", caption: "Placeholder caption" },
        { type: "statement", text: "Placeholder: the result — what it did once it reached the shelf." }
      ]
    },
    {
      slug: "advert-poster-01", title: "Advert poster 01", category: "graphic-design",
      year: 2026, status: "current", hero: PH(2),
      summary: "Placeholder: magazine advert for a product launch.",
      blocks: [
        { type: "image", src: PH(2), size: "wide" },
        { type: "statement", text: "Placeholder: the single idea behind the advert." },
        { type: "pair", images: [PH(7), PH(8)] },
        { type: "text", text: "Placeholder: where it ran, the format and anything worth knowing about how it was made." }
      ]
    },
    {
      slug: "brand-store-redesign", title: "Brand store redesign", category: "e-commerce",
      year: 2026, status: "current", hero: PH(5),
      summary: "Placeholder: rebuilt an online brand store around a new flagship product.",
      blocks: [
        { type: "statement", text: "Placeholder: what was wrong with the old store and what the new one had to do." },
        { type: "stats", items: [
          { value: "+00%", label: "Placeholder: sales" },
          { value: "+00%", label: "Placeholder: conversion rate" },
          { value: "00k", label: "Placeholder: store visits" }
        ] },
        { type: "image", src: PH(9), size: "full", caption: "Placeholder: before and after" },
        { type: "text", heading: "What changed", text: "Placeholder: the main decisions — layout, photography, copy — and why." },
        { type: "image", src: PH(10), size: "left" },
        { type: "statement", text: "Placeholder: where the numbers are projected to go next." }
      ]
    },
    {
      slug: "advert-poster-02", title: "Advert poster 02", category: "graphic-design",
      year: 2026, status: "archive", hidden: true, hero: PH(6),
      summary: "Placeholder: magazine advert.",
      blocks: [
        { type: "image", src: PH(6), size: "wide" },
        { type: "statement", text: "Placeholder: the single idea behind the advert." },
        { type: "text", text: "Placeholder: where it ran and how it was made." }
      ]
    },
    {
      slug: "campaign-01", title: "Campaign 01", category: "marketing",
      year: 2025, status: "archive", hero: PH(3),
      summary: "Placeholder: launch campaign across print, email and social.",
      blocks: [
        { type: "statement", text: "Placeholder: what the campaign set out to do." },
        { type: "pair", images: [PH(11), PH(12)] },
        { type: "text", heading: "The plan", text: "Placeholder: channels, timing and the assets you made." },
        { type: "image", src: PH(13), size: "right" }
      ]
    },
    {
      slug: "product-project-02", title: "Product project 02", category: "product-design",
      year: 2025, status: "archive", hero: PH(4),
      summary: "Placeholder: one line on the product.",
      blocks: [
        { type: "statement", text: "Placeholder: the problem this product solves." },
        { type: "steps", items: [
          { title: "Research", text: "Placeholder.", src: PH(14) },
          { title: "Sketches", text: "Placeholder.", src: PH(15) },
          { title: "Final product", text: "Placeholder.", src: PH(16) }
        ] }
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
      slug: "advert-poster-03", title: "Advert poster 03", category: "graphic-design",
      year: 2025, status: "archive", hero: PH(8),
      summary: "Placeholder: magazine advert.",
      blocks: [
        { type: "image", src: PH(8), size: "wide" },
        { type: "statement", text: "Placeholder: the single idea behind the advert." }
      ]
    },
    {
      slug: "listing-optimisation", title: "Listing optimisation", category: "e-commerce",
      year: 2025, status: "archive", hidden: true, hero: PH(13),
      summary: "Placeholder: rewrote and redesigned product listings at scale.",
      blocks: [
        { type: "statement", text: "Placeholder: the scale of the job and the goal." },
        { type: "stats", items: [
          { value: "000", label: "Placeholder: listings updated" },
          { value: "+00%", label: "Placeholder: click-through rate" }
        ] },
        { type: "image", src: PH(14), size: "full" }
      ]
    },
    {
      slug: "advert-poster-04", title: "Advert poster 04", category: "graphic-design",
      year: 2025, status: "archive", hero: PH(12),
      summary: "Placeholder: magazine advert.",
      blocks: [
        { type: "image", src: PH(12), size: "wide" },
        { type: "statement", text: "Placeholder: the single idea behind the advert." }
      ]
    },
    {
      slug: "product-project-03", title: "Product project 03", category: "product-design",
      year: 2024, status: "archive", hidden: true, hero: PH(15),
      summary: "Placeholder: one line on the product.",
      blocks: [
        { type: "statement", text: "Placeholder: the problem this product solves." },
        { type: "image", src: PH(16), size: "full" },
        { type: "text", text: "Placeholder: how it was developed." }
      ]
    }
  ],

  /* Running log of new work. Newest first.
     "project" is optional: use a project slug to link the entry to its page. */
  log: [
    { date: "2026-11-12", title: "Site draft built", note: "Placeholder: first version of this website, with placeholder content throughout." },
    { date: "2026-11-05", title: "Poster final draft", project: "advert-poster-01", note: "Placeholder: what you did this week on the poster.", image: PH(7) },
    { date: "2026-10-28", title: "Store wireframes signed off", project: "brand-store-redesign", note: "Placeholder: a short update." },
    { date: "2026-10-14", title: "First samples arrived", project: "product-project-01", note: "Placeholder: what the samples showed and what changes next.", image: PH(4) }
  ]
};
