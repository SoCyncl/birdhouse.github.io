# Art portfolio

Plain HTML, CSS and a little JavaScript. Works on GitHub Pages, no build step.
All content is written directly in the HTML files.

## Files
- `index.html`: gallery, with tabs (Illustrations / Sketches / Proof of concept)
- `works.html`: manga, websites and other projects, with filter buttons
- `commissions.html`, `about.html`, `contact.html`
- `style.css`: all styling
- `scripts/switcher.js`: tabs and filter buttons
- `scripts/lightbox.js`: click-to-enlarge for any `<img class="art">`

## Add art
1. Put the image in `images/illustrations/`, `images/sketches/` or `images/proof-of-concept/`.
2. In `index.html`, copy a `<figure>` block into the matching section and change the file name and text.

Any image on any page with `class="art"` opens in the viewer, so you can place art anywhere.

## Header and footer
They're plain HTML at the top and bottom of every page. Edit one, then copy it to the others (in each page only the
`aria-current="page"` link differs). Your socials are in the footer.

## Preview locally
Open `index.html`, or run `python3 -m http.server` here and visit http://localhost:8000.

## Forms
Make two forms at formspree.io (commissions, contact) and paste the IDs into `commissions.html` and `contact.html`.
