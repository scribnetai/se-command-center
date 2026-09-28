# Changelog

## 2026-09-28
- Added Umami website analytics (cookieless, no consent banner): pageview tracking plus custom events for ad-slot impression/click reporting.

## 2026-09-28
- Added a floating Feedback button (bottom-right) that opens a dialog to send feedback via email — topic chips, optional name, and message, addressed to the site owner with the app name in the subject.

## 2026-09-28
- TLS certificate provisioned for the `se-command-center.scribnet.io` custom domain (GitHub's stuck DNS check was reset 2026-09-28); HTTPS is now enforced on the site. App-switcher menu links switched from legacy `scribnetai.github.io` URLs to direct `https://<app>.scribnet.io` URLs for all 10 apps (footer/launcher links updated likewise). This entry also covers the net-zero CNAME delete/re-add commits from the DNS-check reset, which carried no changelog entries. Touched: app-switcher.js, app.js, index.html.


## 2026-09-28
- Migrated legacy `scribnetai.github.io` links to `https://<app>.scribnet.io` for the HTTPS-enforced apps (se-command-center, server-sizer, network-sizer); links to the remaining apps left on the legacy URLs until their TLS certs are issued. Touched: app-switcher.js, app.js, index.html.

## 2026-09-28
- Morning briefing: 3 items (Citrix, Palo Alto Networks, NVIDIA). Archive updated.

## 2026-09-27
- Favicon: upsized the 'SE' monogram badge lettering so it stays legible at 16px bookmark/tab size.

## 2026-09-27
- Added a favicon (inline SVG monogram badge, matching the other apps) so browser bookmarks and tabs show the app logo instead of a generic globe.

## 2026-09-26
- Morning briefing: 3 items (NetApp, Cisco, NVIDIA). Archive created. Prompt of the day: NetApp + PEAK:AIO competitive sparring.


## 2026-09-26
- Added Prompt of the Day: a daily SE-ready AI prompt (customer outreach, call prep, competitive, productivity) with a copy button. The morning job writes a fresh one tied to the day's news; built-in evergreen prompts rotate as fallback.
- Turned up the glow: stronger ambient gradients, card hover bloom, hotter CVE tags.
- Mobile polish: responsive prompt card, full-width copy button, tighter spacing under 640px.
- Redesign: next-gen AI startup theme — glassmorphism cards, violet-to-cyan gradients, Inter type, glow hovers, pulsing live badge.
- News feed wired up: the morning briefing now publishes `news.json`, and the page renders it with vendor filter chips, "why it matters" callouts, hot CVE/EOL tags, and a last-updated timestamp.
- Seeded `news.json` with 4 real items (Cisco, Palo Alto Networks, Dell Technologies, Nutanix).
- Added this changelog; the morning job appends to it on every run.
- Page no longer reads `briefing.json` (kept in repo for reference).

## 2026-09-24
- v1: static dashboard — page structure, dark ops theme, AI toolkit section, app launcher tiles.
- `briefing.json` sample data across 5 vendors, later extended with Pure Storage.
- GitHub Pages enabled (`.nojekyll`); README with local-run instructions.
