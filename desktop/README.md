# AI Dome website — hosting pack for Rendr

Static website: plain HTML, CSS and JavaScript. No build step, no framework, no server code.
Upload the whole folder to the web root (e.g. `public_html/`) of aidome.com.au.

## Pages
| File | Page |
|---|---|
| `index.html` | Home |
| `start.html` | **Start here** — what AI Dome is, who it’s for (sole traders → government, not-for-profits & Indigenous communities), maturity levels and milestones |
| `about.html` | About us — Code Black Group diagram, team, principles |
| `resources.html` | Free AI readiness checklist (PDF), guides, newsletter sign-up form |
| `ai-discovery.html` | "Start AI discovery" questionnaire with **two versions in one page**: desktop (one section per screen) and mobile (one question per screen, big tap targets, buttons fixed at the bottom). It switches automatically at 640 px wide; force a version with `?view=desktop` or `?view=mobile`. |
| `training.html` | Training & change management (diagrams: 10-20-70, ADKAR journey, pathways, Champions network, 12-week plan) |
| `investors.html` | Investors / seed round |
| `privacy.html` | Privacy policy **placeholder — replace the text before launch** |
| `404.html` | Not-found page (set as the custom 404 in hosting) |

## Folders
- `assets/css/styles.css` — all site styles (brand colours are CSS variables at the top)
- `assets/js/main.js` — form handling and video play-on-scroll
- `assets/img/` — logo, hero image, social share image (`og-image.jpg`), app icon
- `assets/video/` — 4 example videos (MP4, H.264, ~300 KB each, no sound) + poster images
- `favicon.ico`, `apple-touch-icon.png`, `robots.txt`, `sitemap.xml`

## Before going live (checklist)
1. **Forms** — connect the forms (including the Resources newsletter form `data-form="newsletter"`) to a handler (Formspree, HubSpot, Zapier webhook, serverless function, etc.):
   - Home "Free AI readiness check": `index.html` → `<form data-form="readiness-check" data-endpoint="">`
   - Investors "Register interest": `investors.html` → `<form data-form="investor-interest" data-endpoint="">`
   - AI Discovery questionnaire: `ai-discovery.html` → `var DISCOVERY_ENDPOINT = '';`
   Put the handler URL in `data-endpoint` / `DISCOVERY_ENDPOINT`. Submissions are POSTed as JSON.
   With no URL set, forms show the thank-you message and only log to the browser console (nothing is stored).
2. **Team photos** — `about.html` shows initials; replace with photos and confirm everyone is happy to be named.
3. **Privacy policy** — replace the placeholder text in `privacy.html`.
4. **Domain** — canonical/OG URLs assume `https://aidome.com.au/`. Change if the domain differs.
5. **HTTPS + caching** — serve over HTTPS; cache `assets/` for long periods (files are safe to cache).
6. **Analytics** — add your analytics snippet before `</head>` on each page if wanted.

## Notes
- Fonts load from Google Fonts (IBM Plex Sans, Space Grotesk).
- Videos autoplay muted only while on screen, pause when scrolled away, and never autoplay for visitors who prefer reduced motion. They are illustrative examples with sample data.
- Layout is responsive and has been checked at 1440, 820, 390 and 360 px wide: no horizontal scrolling or overlapping text. On phones the menu becomes a swipeable row, tables become cards and diagrams stack vertically.
- Colour palette: see `brand-palette.png` (CSS variables at the top of `assets/css/styles.css`).
- Accessibility: skip link, labelled form fields, keyboard focus styles, alt text and video labels.

## Mobile
This site is fully responsive: phones automatically get the mobile layout (and the one-question-per-screen AI Discovery). A separate **mobile hosting pack** is also provided for a dedicated `m.aidome.com.au` site — see its README. If you use it, `assets/js/mobile-redirect.js` (not linked by default) sends phone visitors there.
