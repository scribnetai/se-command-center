// SE Command Center v2 — all rendering logic lives here.
// Pattern: data (news.json / arrays below) -> template strings -> innerHTML.
// The morning briefing job rewrites news.json every weekday; this code
// only renders it. All values from news.json are HTML-escaped below —
// the JSON carries untrusted web content, so nothing renders raw.

// ---------- 0. Escaper (security: news.json is untrusted input) ----------
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));

// Only http(s) links are allowed; anything else renders as plain text.
const safeUrl = (u) => /^https?:\/\//i.test(String(u || "")) ? u : "#";

// ---------- 1. Header date ----------
document.getElementById("today").textContent =
  new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

// ---------- 2. Vendor briefing — live news feed ----------
const HOT_TAGS = new Set(["cve", "eol", "security"]); // visually weighted
let newsItems = [];
let activeVendor = "All";

function fmtUpdated(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
      " at " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  } catch { return ""; }
}

function renderFilters(vendors) {
  const box = document.getElementById("vendor-filters");
  const all = ["All", ...vendors];
  box.innerHTML = all.map((v) =>
    `<button class="chip${v === activeVendor ? " active" : ""}" data-vendor="${esc(v)}">${esc(v)}</button>`
  ).join("");
  box.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      activeVendor = chip.dataset.vendor;
      renderFilters(vendors);
      renderCards();
    });
  });
}

function cardHtml(item) {
  const hot = HOT_TAGS.has(String(item.tag || "").toLowerCase()) ? " hot" : "";
  const why = item.why_it_matters
    ? `<p class="why">${esc(item.why_it_matters)}</p>` : "";
  const pub = item.published ? `<div class="meta">${esc(item.published)}</div>` : "";
  return `
    <div class="card">
      <div class="vendor">${esc(item.vendor)}</div>
      <h3><a href="${esc(safeUrl(item.url))}" target="_blank" rel="noopener">${esc(item.title)}</a></h3>
      <p>${esc(item.summary)}</p>
      ${why}
      <span class="tag${hot}">${esc(item.tag || "news")}</span>
      ${pub}
    </div>`;
}

function renderCards() {
  const box = document.getElementById("briefing-cards");
  const items = activeVendor === "All"
    ? newsItems
    : newsItems.filter((i) => i.vendor === activeVendor);
  box.innerHTML = items.length
    ? items.map(cardHtml).join("")
    : "<p class='section-note'>No items for this filter.</p>";
}

fetch("news.json", { cache: "no-store" })
  .then((res) => {
    if (!res.ok) throw new Error("bad status");
    return res.json();
  })
  .then((data) => {
    newsItems = Array.isArray(data.items) ? data.items : [];
    const upd = document.getElementById("news-updated");
    if (data.updated_at) upd.textContent = "Updated " + fmtUpdated(data.updated_at) + ".";
    const vendors = [...new Set(newsItems.map((i) => i.vendor).filter(Boolean))].sort();
    renderFilters(vendors);
    if (!newsItems.length) {
      document.getElementById("briefing-cards").innerHTML =
        "<p class='section-note'>Quiet morning — no new vendor updates.</p>";
      return;
    }
    renderCards();
  })
  .catch(() => {
    document.getElementById("briefing-cards").innerHTML =
      "<p class='section-note'>Briefing feed unavailable — the morning update may have failed. Check back later.</p>";
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
    <div class="vendor">${esc(t.vendor)}</div>
    <h3>${esc(t.title)}</h3>
    <p>${esc(t.summary)}</p>
    <span class="tag">${esc(t.tag)}</span>
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
  <a class="tile" href="${esc(a.link)}">
    <div class="icon">${esc(a.icon)}</div>
    <h3>${esc(a.name)}</h3>
    <p>${esc(a.desc)}</p>
    <div class="status ${a.status}">${a.status === "live" ? "● LIVE" : "○ SOON"}</div>
  </a>
`).join("");
