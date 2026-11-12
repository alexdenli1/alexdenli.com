# alexdenli.com

Portfolio site for Alex Denli. Plain HTML, CSS and JavaScript — no build step. Hosted on GitHub Pages.

## Updating the site

Everything you see on the site comes from **`js/data.js`**. Nothing else needs editing.

- **Add a project:** copy a `{ ... }` block in `projects`, change the text, point `hero` and block images at your files.
- **Add a log entry:** add one line at the top of `log`.
- **Images:** put them in `images/<project-name>/`. JPG or WebP, about 2000px on the long edge, under ~400 KB each.
- **Hide a project on the home page:** add `hidden: true` — visitors have to find it with the cursor.

The field descriptions are at the top of `js/data.js`.

## Files

| File | What it is |
|---|---|
| `index.html` | Page shell |
| `css/style.css` | All design |
| `js/app.js` | Pages, navigation and motion |
| `js/data.js` | **All content** |
| `images/` | Project images (`placeholder/` can be deleted once real images are in) |
| `CNAME` | Tells GitHub Pages the site lives at www.alexdenli.com |

## Preview on your own computer

Open a terminal in this folder, run `python3 -m http.server`, then visit http://localhost:8000.
