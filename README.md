# AI Dome website

Static site, no build step.

- `desktop/` – main site (Render static site, publish path `desktop`)
- `mobile/` – phone-optimised version (Render static site, publish path `mobile`)

Any push to `main` redeploys automatically on Render.
Forms: set `data-endpoint` on each `<form data-form>` and `DISCOVERY_ENDPOINT` in `ai-discovery.html`.
