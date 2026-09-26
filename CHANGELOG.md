# Changelog

## 2026-09-26
- Redesign: next-gen AI startup theme — glassmorphism cards, violet-to-cyan gradients, Inter type, glow hovers, pulsing live badge.
- News feed wired up: the morning briefing now publishes `news.json`, and the page renders it with vendor filter chips, "why it matters" callouts, hot CVE/EOL tags, and a last-updated timestamp.
- Seeded `news.json` with 4 real items (Cisco, Palo Alto Networks, Dell Technologies, Nutanix).
- Added this changelog; the morning job appends to it on every run.
- Page no longer reads `briefing.json` (kept in repo for reference).

## 2026-09-24
- v1: static dashboard — page structure, dark ops theme, AI toolkit section, app launcher tiles.
- `briefing.json` sample data across 5 vendors, later extended with Pure Storage.
- GitHub Pages enabled (`.nojekyll`); README with local-run instructions.
