# Bharat Poojari — Portfolio

A dependency-free static site: HTML, CSS and vanilla JavaScript. No build step.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Import it in Vercel. Framework preset: **Other**. Leave build command and output directory empty.
3. Deploy. `vercel.json` already sets clean URLs, security headers and caching.

Preview locally: `python3 -m http.server 4173` (or `npx serve`) and open http://localhost:4173.

## Structure

- `index.html` — all sections, metadata, structured data
- `css/styles.css` — design tokens (dark and light), layout, responsive rules, reduced-motion rules
- `js/data.js` — **all project and skill content lives here**; edit it to update the site
- `js/gl.js` — hero WebGL2 shader (falls back to a CSS gradient if WebGL2 is unavailable)
- `js/main.js` — intro, page transitions, cursor, scroll effects, skills field, case studies, terminal, contact form
- `assets/` — favicon and social preview image
- `robots.txt`, `sitemap.xml`, and `site.webmanifest` — crawler, sitemap, and app metadata

## SEO

The canonical URL, social preview metadata, structured data, robots policy, and sitemap are set for
`https://bharat-poojari.vercel.app/`. Update those references if the production domain changes.

## Notes

- The contact form opens your visitor's email app with the message prefilled (a `mailto:` link). There is no server, so nothing is stored.
- Fonts (Bricolage Grotesque, JetBrains Mono) load from Google Fonts; system fonts are the fallback.
