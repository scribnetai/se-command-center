# Live Demo

https://scribnetai.github.io/se-command-center/

# SE Command Center

Presales dashboard for systems engineers: a daily agent-written tech news feed, a Prompt of the Day, and an App Launcher with four live presales tools. A morning briefing job (Mon–Fri) researches overnight vendor news, then rewrites `news.json`, appends to the archive and changelog, and emails the briefing — the page updates itself with zero code changes.

## What's live

- **Daily news feed** — vendor filter chips, "why it matters" callouts, hot CVE/EOL tags, last-updated timestamp. Fed by `news.json`, rewritten every weekday morning.
- **Prompt of the Day** — a daily SE-ready AI prompt (outreach, call prep, competitive, productivity) with a copy button. Tied to the day's news; evergreen prompts rotate as fallback.
- **App Launcher** — four live tools, each opening in a new tab so the command center stays open:
  - [RVTools Analyzer](https://scribnetai.github.io/rvtools-analyzer/) — browser-based RVTools .xlsx analyzer: cluster breakdowns, per-core licensing math (16-core min/socket, phantom cores), refresh scenario modeler, downloadable briefing report. 100% client-side, zero data retention.
  - [Server Sizer](https://scribnetai.github.io/server-sizer/) — server/HCI sizing wizard: platform presets (Dell, Cisco UCS, HPE, Nutanix, Supermicro), growth and overcommit modeling, N+1/N+2, BOM table, vSphere licensing math.
  - [Storage Sizer](https://scribnetai.github.io/storage-sizer/) — storage capacity planner: data reduction, RAID/EC and replication modeling, snapshot copies, year-by-year growth projections, SE findings.
  - [Network Sizer](https://scribnetai.github.io/network-sizer/) — ToR + FC SAN switch planner: per-host port profiles, oversubscription targets, A/B dual-homing, per-fabric switch math.

## Updates — 2026-09-26

- Linked all four launcher apps (RVTools Analyzer, Server Sizer, Storage Sizer, Network Sizer); external tiles now open in a new tab.
- Added the Prompt of the Day section with copy button; stronger ambient glow; mobile polish (responsive prompt card, full-width copy button, tighter sub-640px spacing).
- Morning briefing: NetApp intent to acquire PEAK:AIO, Cisco CVE-2026-76461 (Secure Email Gateway SQLi, actively exploited), NVIDIA neocloud GPU rent hikes. Published to `news.json`, archived, changelog updated.

## Run it locally

`fetch()` in `app.js` needs HTTP, so opening `index.html` directly won't load the feed. From this folder, run:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000

## Publish with GitHub Pages

1. Push this repo to GitHub
2. Repo → Settings → Pages → Source: `Deploy from a branch` → Branch: `main`, folder `/ (root)` → Save

## Project layout

|File|What it does|
|-|-|
|`index.html`|Page structure, section shells|
|`styles.css`|Next-gen AI startup theme: glassmorphism cards, violet-to-cyan gradients, glow hovers|
|`app.js`|Renders news.json + prompt of the day + app tiles into the page|
|`news.json`|The live feed — rewritten every weekday morning by the briefing job|
|`news-archive.json`|Archive of past briefings|
|`CHANGELOG.md`|Page changelog — the morning job appends on every run|
|`briefing.json`|Legacy v1 sample data (kept for reference; the page no longer reads it)|

## Roadmap

- [x] **v1** — static dashboard
- [x] **v2** — agent job rewrites the feed every weekday morning
- [x] **v3** — app launcher with real presales tools (4 live)
- **Next** — pre-call briefs and deal notes as a private layer; the public page stays generic (no account or customer data)
