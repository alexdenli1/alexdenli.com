# alexdenli.com revamp: build brief

Paste this whole file into a new session, or say: "Read REVAMP-BRIEF.md in the repo and start Phase 1."

---

## 0. Who you are and what this is

You are the senior graphic, motion and interaction designer and the front-end developer for **www.alexdenli.com**, the personal design portfolio of Alex Denli. Alex is a product and graphic designer working in golf products (JS Golf Brands: XFLY, Longridge, SuperStroke, Bettinardi, Oakley, BagBoy, Clicgear, EzeGlide and others).

The live site works but feels **stagnant**: every section animates on its own, nothing connects, and scrolling only means reading. The goal is to turn it into an **engaging, animated experience** that wows from the first second, stays easy for a hiring manager to scan, and behaves like the physical products Alex designs.

**The core idea: scroll is the product's own mechanism.** On each project page, scrolling runs the way that product actually works: the coffee machine brews, the cigarette case dispenses, the filter catches fibres. The home page is one vertical scroll story built around the same idea.

Design target is **desktop at 1920×1080 first**. Mobile is designed separately afterwards (Phase 6), not shrunk from desktop.

---

## 1. Ground rules: read before touching anything

1. **Never change the live site.** The site deploys from `main` on GitHub Pages (`alexdenli1/alexdenli.com`, custom domain via `CNAME`). Work only on the **`revamp`** branch. Do not merge, push to `main` or open a PR to `main` until Alex explicitly says "approved, go live".
2. **Review copy for every phase.** After each phase: run a local preview, take 1920×1080 screenshots, check the console for errors, then publish a **private preview** for Alex to open in his own browser. Use an artifact preview if available; otherwise give him run-it-locally steps. List exactly what he should judge. Wait for his approval before starting the next phase.
3. **Stack stays static.** Vanilla HTML, CSS and JS with hash routing, no build step, hosted on GitHub Pages. You may add **self-hosted** small libraries if they earn their place (e.g. GSAP + ScrollTrigger for scrubbing, OGL for one WebGL effect). No CDNs, frameworks, bundlers or smooth-scroll hijack libraries.
4. **Cache-busting.** Every changed CSS or JS file gets its `?v=N` bumped in `index.html`.
5. **Never invent content.** Where real copy, stats or images are missing, use a clearly marked placeholder and list it for Alex. Never make up metrics or results.
6. **Parked projects.** Ball Cabinet and Brand Identity have no hero shots yet. They are commented out in `js/data.js` under `PARKED`. Keep them off every page and out of every count. Alex will add them later.
7. Before go-live, **delete this file** from the branch. `.nojekyll` means it would otherwise be publicly readable.

---

## 2. What exists (reuse, don't rebuild blindly)

| File | What it is | Keep? |
|---|---|---|
| `index.html` | Shell, the intro film overlay (`images/intro/intro.webm/.mp4`, fallback `last.jpg`), script and CSS includes | Keep the intro film; restyle around it |
| `js/data.js` (`window.SITE`) | All projects, brands, contact, copy. Projects: **XFLY, Adverts, Signature Logo Collection, Rescue, Relinquit, Shield, Aeropress Coffee Machine** | Source of truth; extend with `colour`, `mechanism`, etc. |
| `js/app.js` | Router (`PAGES`, `ALIAS`), page templates, brands layout | Refactor freely |
| `js/water.js` | Canvas water/wetness simulation (diffusion, ripple rings, mask) | **Reuse** its ripple engine for the cursor ripple through the type |
| `js/index-works.js`, `css/index-works.css` | Drifting "Index of works": lines loop on their own; 1s hover stops and dims, the line rewinds and reads, the image opens left, the list moves right; titles in lilac | **Keep**, extend (see 4.4) |
| `js/homex.js`, `css/homex.css` | Old dial/wheel and mosaic | Retire if superseded |
| `js/relinquit.js`, `shield.js`, `aeropress.js`, `rescue.js` + CSS | Bespoke project pages (`window.RELINQUIT` etc. expose `render()`/`wire()`) | Rebuild Aeropress, Relinquit and Shield on the new engine; **keep Rescue's playable page** and give it the new frame |
| `images/aeropress/` | `step-1…10`, `gesture`, `chamber`, `head`, `machine`, `front`, `frontb`, `quarter`, `ga`, `final`, `hero` | Mechanism material |
| `images/relinquit/` | `states`, `exploded`, `open`, `rest`, `end`, `dims`, `col-0…3`, `s1…9` (app screens), `sk-a…h` (sketches), `step-1…4`, `hero-case`, `thumb` | Mechanism material |
| `images/shield/` | `exploded`, `drawer`, `lift`, `lightbar`, `home`, `form-1…5`, `t1…4`, `hero-render`, `thumb` | Mechanism material |
| `images/brands/` | 10 logos (white or colour PNGs on black) | Used by the brand drawers |
| Branch `hero-motion` | Earlier prototype: a drifting split-flap poster wall behind the water (`js/wall.js`) | Superseded; mine for ideas only |

Fonts self-hosted in `/fonts`: **Bricolage** (variable sans, main), **Fraunces** + italic (serif accents), plus IBM Plex Condensed and Mono, Space Grotesk, Inter, Nunito, Baloo 2 and Caveat (used in project pages). The logo wordmark "Alex Denli / Archive" is set in **Butik** (`images/logo.svg`).

Brand colours: black `#000000`, cream `#EEE9E3`, grey `#C1C1CB`, green `#095838` (Alex's feature colour), lilac `#B4B4FF` (`--zap`, used for the index titles).

Image rule from Alex: home highlight images are **2400×1600**, never 1920×1080.

---

## 3. Design system

### 3.1 Colour: Uber-style restraint
- The base is **black and cream/white only**, with high contrast.
- **One accent per section, never two.** The accent marks the one thing that matters in that section.
- **Each project owns one colour.** It drives that project's home chapter, its page accents, its index hover and its transition. Sample each colour from the project's own hero/product, propose it, and get Alex's sign-off. Starting proposals:
  - **XFLY**: XFLY's own brand blue (ask Alex for the Pantone, convert to hex)
  - **Adverts**: print magenta (process-magenta feel), a nod to the page
  - **Signature Logo Collection**: medallion brass/gold
  - **Rescue**: taken from the app's own palette (Pip the red panda); avoid terracotta
  - **Relinquit**: from its colourways (`col-0…3`)
  - **Shield**: a clean water cyan
  - **Aeropress**: from the machine or the coffee, warm but not terracotta
- Green `#095838` stays the site's own signature (logo, focus rings, small marks). Lilac stays for the index titles.
- **Banned:** gradient blobs or mesh washes, cream with terracotta, near-black `#0B0B0B`/`#111` instead of real black, acid-green-on-black.

### 3.2 Type
- Type is the main graphic material, not a delivery vehicle.
- Huge display type (Bricolage at heavy weights and condensed widths) with Fraunces italic for small human asides such as years and notes.
- Sentence case. No tracked-out ALL-CAPS eyebrow labels above headings. No "A · B · C" meta strings. No "→" appended to links.
- Body lines under ~75 characters; give serif body slightly more line-height.

### 3.3 Motion principles
- **Direction:** progress moves **left to right**. Things enter from the left, and moving forward through the story moves rightward.
- **Scroll-scrubbed, not scroll-triggered.** Mechanisms are tied to scroll *position* (sticky stage plus a tall section, progress 0→1), so the user controls speed and can scrub backwards.
- **Never take over the scroll.** No scroll-jacking, no snap-locking, no smooth-scroll library, no wheel interception. Native scroll always.
- **One signature interaction per section.** Everything else in that section is quiet.
- **No fade-up-on-enter for sections.** No hover-lift on every card.
- Easing: one house curve for UI (`cubic-bezier(.7,0,.2,1)`, already `--ease`) and linear for scrubbed motion. Typical UI durations 300–700ms.
- **Reduced motion:** with `prefers-reduced-motion: reduce`, every scrubbed mechanism becomes a static, well-composed sequence of stills (the key states laid out). The cursor ripple and drifting text stop. Nothing should be missing, only still.
- Pause all rAF loops when their section is offscreen (`IntersectionObserver`) or the tab is hidden.

### 3.4 Layout
- Full-bleed, asymmetric, generous negative space; most sections fill one 1920×1080 screen.
- Pinned elements are allowed (e.g. a small rotating badge in a corner) but are always small and never block content.
- No identical rounded cards in grids. Images are full-bleed or sharply cropped, with zero or very small radii, used consistently.

---

## 4. Home page: one vertical scroll story

Order: **Opening → Brands (drawers) → Project chapters → Index of works → Contact.** Each section lists its single signature interaction and accent.

### 4.1 Opening: the first 10 seconds *(Phase 1)*
**Signature:** Alex's name as kinetic type with live work moving inside the letters, and the cursor rippling through it.
- Keep the existing intro film (logo animation, full screen, ends on black), then fade quickly into the opening.
- Fill the screen with **ALEX DENLI** (or "Alex Denli"; test both) at full width. Project footage and hero images (sliding, cross-cutting) play **inside the letterforms** (type as mask), cutting between projects like an edit.
- **The cursor drags a ripple through the type**, reusing the `water.js` ripple engine as a displacement on the masked type and footage. It should feel heavy, like the current water.
- Within 2 seconds of the opening appearing, something is already moving without input.
- A small line underneath, quietly: what Alex does (from `data.js` intro copy), and nothing else. No "scroll to explore" hint.
- On scroll, the name **compresses and slides left** into the nav position (progress left to right) as the brands section arrives.
- Reduced motion: a still frame of the name with one hero inside it.
- Accent: none. Pure black and cream. The footage is the colour.

### 4.2 Brands I've worked with: drawers *(Phase 4)*
**Signature:** a wall of labelled drawers. Hover (or focus) one and it **pulls out**, revealing what Alex did for that brand.
- Each drawer front carries the brand logo (`images/brands/`). Keep Alex's current arrangement: the four colour logos (SuperStroke, Longridge, BagBoy, Clicgear) at the corners, Skins Golf at the left of the middle row, three even rows, equal spacing and buffers at the screen sides.
- Inside the drawer: 1–2 lines on what Alex did (packaging, Amazon store, displays, adverts…) and up to 3 small images. **Alex must supply these lines.** Use marked placeholders until he does, and list them.
- The physical pull uses perspective and depth with a shadow and a little overshoot, and closes when you leave.
- Accent: the drawer's interior uses the brand's own colour for one thin element only.
- This turns the brands from a logo strip into content.

### 4.3 Project chapters *(Phase 4 for colours; layout in Phase 3)*
**Signature:** as each chapter scrolls in, **the page wipes to that project's colour from left to right**, scrubbed by scroll position (not a fade), and the product slides in from the left.
- One full-screen chapter per project, in `data.js` order: XFLY, Adverts, Signature Logo Collection, Rescue, Relinquit, Shield, Aeropress.
- Composition per chapter: huge project title, a one-line hook (the project's `summary`), year in Fraunces italic, and the product or hero image (2400×1600 source, or the cut-out `thumb.webp` where `cut: true`).
- A small **pinned rotating badge** (corner) shows chapter number / total. This is a real sequence, so numbering is justified.
- **Click the chapter image** to start the transition into the project page (4.6).

### 4.4 Index of works *(already built; extend in Phase 4)*
- Keep the drifting lines, the 1s hold, the rewind-and-read and the image on the left.
- **New:** when a line is held, the section's single accent becomes that project's colour (the line's title, a hairline and the image frame).
- Keep titles lilac at rest.

### 4.5 Contact
**Signature:** giant "Contact" / "Let's talk" type whose letters lean and follow the cursor slightly, then snap back.
- Email `alexdenli200@gmail.com`, phone, and LinkedIn (URL currently `#`; ask Alex).
- Accent: green `#095838`.

### 4.6 Home → project transition *(Phase 3)*
- Clicking a chapter or index image **expands that image into the project page's hero**, as a shared-element transition, instead of a page load. The URL hash updates (`#/project/<slug>`), and Back reverses it.
- Use the **View Transitions API** where supported, with a FLIP fallback (measure rect, clone, animate to full-bleed, swap route underneath). Around 700–900ms on `--ease`, with the project colour washing behind.
- Respects reduced motion (instant swap).

---

## 5. Project page engine: scroll as the product's mechanism *(Phase 2 onwards)*

Build **one reusable engine** (`js/mech.js` + `css/mech.css`) and give each project its own **mechanism definition** in data.

**Engine:**
- A *stage* is a tall section (e.g. 300–500vh) with a sticky inner frame. Scroll progress 0→1 within the stage drives a mechanism function: frames, layers, transforms, counters, canvas particles.
- Native scroll only. Progress comes from `getBoundingClientRect` in one rAF loop shared by all stages.
- Supports image-sequence scrubbing (with preloading and decode), layer transforms (explode or assemble), annotation lines that draw in (SVG stroke), number counters, and a canvas layer for particles.
- Every stage has a reduced-motion "stills" rendering.

**Page structure for every project:**
1. **Hero:** comes from the home transition; full-bleed product with title.
2. **Key result first.** Most visitors never reach the end, so the strongest outcome or line goes in the first screen after the hero.
3. **The mechanism stage(s):** the signature interaction of the page.
4. **Process:** research → ideation → model → final, told visually (sketch strips, iterations, before/after).
5. **Outcome:** what it is now.
6. **Next project:** a large link that wipes to the next project's colour.

**Mechanism specs:**
- **Aeropress Coffee Machine (build first, the proof of concept).** Scrolling runs the brew cycle through `step-1…10.webp`: the gesture is detected (`gesture`), coffee drops into the `chamber`, then it stirs, steeps and presses (`head`, `machine`). Annotation lines draw in at each stage. Finish on `final`/`ga`. Only show counters (time, ml) if Alex supplies real figures.
- **Relinquit.** **Each scroll step dispenses one cigarette:** case states (`states`, `open`, `rest`, `end`), with the e-ink screen counting down. Then the case explodes (`exploded`) with dimensions (`dims`), the colourways (`col-0…3`) and the app screens (`s1…9`) as a phone you scroll through. Sketch strip from `sk-a…h`. Show the 2026 redesign only, not the 2021 version.
- **Shield.** The unit **explodes apart** (`exploded`, `hero-render`), then microfibre particles (canvas) drift in from the wash and are **caught** in the drawer (`drawer`, `lift`, `lightbar`). Form development as a scrub through `form-1…5`. Present it as one finished design, with no semester or before/after framing.
- **Rescue.** Keep its existing playable page; only adopt the new frame, colour, transition and next-project link.
- **Later, once assets arrive (don't build yet; list what's needed):**
  - XFLY: a shot trace draws across the page with launch data counting up. Needs real data and product renders.
  - Adverts: spreads turn like magazine pages. Needs the 4 chosen adverts.
  - Signature Logo Collection: club logos stamp onto the products. Needs product shots and logos.

Each project page must feel **unique**, not one template repeated. The engine is shared; the mechanism, rhythm and composition are not.

---

## 6. Mobile *(Phase 6, designed separately)*
- Design at 390×844 and 430×932 as its own layout; don't scale down the desktop one.
- No hover: drawers become tap-to-open; the index hold becomes tap to preview, tap again to open; the cursor ripple becomes touch-drag ripple on the opening only.
- Mechanism stages use fewer steps and shorter stages; image sequences use smaller files.
- Chapters stack, and the colour wipe stays (it is scroll-driven, so it works on touch).
- Performance budget is stricter: test on a mid-range phone profile.

---

## 7. Performance and accessibility
- Target 60fps on a normal laptop. Animate only `transform`, `opacity`, `clip-path`, and canvas/WebGL.
- One shared rAF loop. Pause offscreen sections. Lazy-load below-the-fold images, and preload the next stage's sequence only.
- At most **one WebGL context** on the page at a time (the opening).
- Keyboard: every interactive element is reachable, with a visible green focus ring; drawers open on focus; the transition works with Enter.
- Every image has meaningful alt text (decorative ones get `alt=""`).
- No layout shift on load. The intro must not block content for returning visitors (consider once per session; ask Alex).

---

## 8. Phases and review gates

Each phase ends with: screenshots, console clean, a private preview link, a short "what to judge" list, and a list of any placeholders or content needed from Alex. **Stop and wait for approval.**

1. **Opening** (4.1), plus removing the old water hero and poster wall from the home page.
2. **Project engine + Aeropress page** (5).
3. **Home → project transition** (4.6) and the chapter layout (4.3, without colours).
4. **Project colours everywhere**, brand drawers (4.2), index accent (4.4) and contact (4.5).
5. **Relinquit and Shield** on the engine, plus Rescue's new frame.
6. **Mobile** (6).
7. **Go-live, only on Alex's explicit approval:** delete `REVAMP-BRIEF.md`, bump all `?v=`, merge `revamp` into `main`, push, and verify www.alexdenli.com.

---

## 9. Final self-check before showing Alex anything
- Does the first screen move within 2 seconds, without input?
- Is there exactly one accent colour and one signature interaction in this section?
- Can I scroll at my own speed, and backwards, everywhere?
- Does any section fade up on entry? Remove it.
- With reduced motion on, is every piece of content still there?
- Would a hiring manager find what Alex did, for whom and with what result in under 10 seconds per project?
- Does any of it look like a template (rounded card grids, gradient washes, cream and terracotta, eyebrow labels)? If yes, redo it.
- Are Ball Cabinet and Brand Identity absent everywhere?
