# AI Dome website — MOBILE hosting pack

This pack is the **mobile version** of the AI Dome website. Every page always shows the phone layout:
- one-column layouts, swipeable menu, stacked diagrams and tables as cards
- the AI Discovery questionnaire in its one-question-per-screen version with fixed Back/Next buttons
- on a desktop browser the site shows as a centred 480 px phone-width column

Same pages, assets, videos, forms and checklist as the main (desktop) pack. The only differences:
- `assets/css/mobile.css` — phone layout rules applied at every screen width (generated from `styles.css`)
- each page links `mobile.css` after `styles.css`
- `ai-discovery.html` defaults to `?view=mobile`

## Two ways to deploy

**Option A — recommended: one responsive site.**
Deploy only the main pack to `aidome.com.au`. It already switches to this mobile layout on phones automatically (one URL, best for Google). Keep this pack as the mobile reference.

**Option B — separate mobile site.**
1. Deploy this pack to `m.aidome.com.au` (its own web root, HTTPS on).
2. Deploy the main pack to `aidome.com.au`.
3. In the main pack, add `<script src="assets/js/mobile-redirect.js"></script>` before `</head>` on each page to send phones to the mobile site (the script is included in the main pack, not linked by default).
4. Canonical tags in this pack already point to `https://aidome.com.au/...` so Google treats both as one site.

## Before going live
Same checklist as the main pack: connect the form endpoints (`data-endpoint` on each form, `DISCOVERY_ENDPOINT` in `ai-discovery.html`), add team photos, replace the privacy policy placeholder. Make the same edits in both packs if you deploy both.
