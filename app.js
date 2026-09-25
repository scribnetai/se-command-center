// SE Command Center v1 — all rendering logic lives here.
// Pattern: data (briefing.json / arrays below) -> template strings -> innerHTML.
// In v2, an agent will rewrite briefing.json every morning and this code
// won't need to change at all. That's the point of separating data from UI.

// ---------- 1. Header date ----------
document.getElementById("today").textContent =
  new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

// ---------- 2. Vendor briefing ----------
// fetch() loads briefing.json over HTTP. (Won't work via file:// —
// serve the folder or use GitHub Pages. More on that in the README.)
fetch("briefing.json")
  .then((res) => res.json())
  .then((data) => {
    const html = data.items.map((item) => `
      <div class="card">
        <div class="vendor">${item.vendor}</div>
        <h3><a href="${item.url}" target="_blank" rel="noopener">${item.title}</a></h3>
        <p>${item.summary}</p>
        <span class="tag">${item.tag}</span>
      </div>
    `).join("");
    document.getElementById("briefing-cards").innerHTML = html;
  })
  .catch(() => {
    document.getElementById("briefing-cards").innerHTML =
      "<p class='section-note'>Briefing feed unavailable — check briefing.json.</p>";
  });

// ---------- 3. AI toolkit ----------
// Curated workflows, not just links. Edit this array as you find new ones.
const aiTools = [
  {
    vendor: "Workflow",
    title: "Competitive battlecard builder",
    summary: "Feed me two vendor datasheets, I output a customer-facing comparison table.",
    tag: "prompt",
  },
  {
    vendor: "Workflow",
    title: "RFP first-draft",
    summary: "Drop in RFP requirements, I draft the technical response section.",
    tag: "prompt",
  },
  {
    vendor: "Workflow",
    title: "CVE triage",
    summary: "Paste a CVE ID, I summarize blast radius and whether your customers care.",
    tag: "prompt",
  },
];

document.getElementById("ai-cards").innerHTML = aiTools.map((t) => `
  <div class="card">
    <div class="vendor">${t.vendor}</div>
    <h3>${t.title}</h3>
    <p>${t.summary}</p>
    <span class="tag">${t.tag}</span>
  </div>
`).join("");

// ---------- 4. App launcher ----------
// status: "live" = clickable, "soon" = placeholder tile on the roadmap.
const apps = [
  { icon: "📰", name: "Daily Briefing", desc: "Vendor intel, every morning", status: "live", link: "#briefing" },
  { icon: "🤖", name: "AI Toolkit", desc: "Presales prompts & workflows", status: "live", link: "#ai-toolkit" },
  { icon: "🔭", name: "Deal Research", desc: "Account & tech recon", status: "soon", link: "#" },
  { icon: "📊", name: "TCO Calculator", desc: "Quick cost modeling", status: "soon", link: "#" },
];

document.getElementById("app-tiles").innerHTML = apps.map((a) => `
  <a class="tile" href="${a.link}">
    <div class="icon">${a.icon}</div>
    <h3>${a.name}</h3>
    <p>${a.desc}</p>
    <div class="status ${a.status}">${a.status === "live" ? "● LIVE" : "○ SOON"}</div>
  </a>
`).join("");
