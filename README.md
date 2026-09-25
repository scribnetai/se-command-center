# Live Demo

https://scribnetai.github.io/se-command-center/

# SE Command Center

Presales dashboard: vendor briefing rail, AI toolkit, and a launcher for future apps. Built iteratively — v1 is static, v2 wires the briefing feed to an agent job.

## Run it locally

`fetch()` in `app.js` needs HTTP, so opening `index.html` directly won't load the briefing. From this folder, run:

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
|`styles.css`|Dark ops-dashboard theme|
|`app.js`|Renders briefing.json + toolkit + app tiles into the page|
|`briefing.json`|The data feed. v1 = sample data. v2 = rewritten daily by an agent|

## Roadmap

* **v1** — static dashboard (this)
* **v2** — agent job rewrites `briefing.json` every morning; page auto-updates, zero code changes
* **v3** — first real launcher app (deal research or TCO calculator)

