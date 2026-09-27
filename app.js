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
    renderPromptOfTheDay(data);
    renderJokeOfTheDay(data);
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
    renderPromptOfTheDay(null); // fall back to the rotating evergreen prompt
    renderJokeOfTheDay(null); // fall back to the rotating evergreen jokes
  });

// ---------- 2b. Prompt of the day ----------
// Uses news.json's prompt_of_the_day when the morning job wrote one;
// otherwise rotates through evergreen SE prompts by day so the slot
// is never empty (e.g. if the feed fetch failed).
const FALLBACK_PROMPTS = [
  { category: "Customer outreach", prompt: "Write a 4-sentence check-in email to a customer running infrastructure we sold them. Reference one recent vendor update from this week's briefing, ask one open-ended question about their roadmap, and close with a soft offer for a 15-minute whiteboard session. Helpful advisor tone — no pitch." },
  { category: "Call prep", prompt: "I'm walking into a discovery call with a net-new infrastructure lead in 30 minutes. Give me 5 sharp questions that uncover pain around their current backup and DR posture, plus 2 trap-setting questions I can use if a competitor comes up." },
  { category: "Competitive", prompt: "A customer just told me 'we're happy with our incumbent.' Give me a 3-part reframe: one question that creates doubt about the status quo, one proof point I can cite, and one low-risk next step that keeps the door open." },
  { category: "Productivity", prompt: "End-of-day shutdown: based on my open threads below, draft tomorrow's top 3 priorities as a presales SE, each with the single next action that unblocks it. [paste open threads]" },
  { category: "Learning", prompt: "Explain the top story in today's vendor briefing like I'm briefing a customer CTO in 90 seconds: what it is, why they should care, and what 'good' looks like. No jargon, no FUD." },
  { category: "Follow-up", prompt: "Turn these rough call notes into a crisp follow-up email: 3 bullets recapping what we heard, 2 bullets on what we promised, and a proposed next step with a date. [paste notes]" },
  { category: "Productivity", prompt: "It's Monday morning and I have 5 customer meetings this week. Turn the chaos into a prioritized prep list: for each meeting, one discovery question and one relevant vendor update from the latest briefing I can mention." },
];

function renderPromptOfTheDay(data) {
  const catEl = document.getElementById("prompt-category");
  const textEl = document.getElementById("prompt-text");
  let category, text;
  const pod = data && data.prompt_of_the_day;
  if (pod && pod.prompt) {
    category = pod.category || "SE prompt";
    text = pod.prompt;
  } else {
    const fb = FALLBACK_PROMPTS[Math.floor(Date.now() / 86400000) % FALLBACK_PROMPTS.length];
    category = fb.category;
    text = fb.prompt;
  }
  catEl.textContent = category;
  textEl.textContent = "\u201C" + text + "\u201D";
  const btn = document.getElementById("prompt-copy");
  btn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    btn.textContent = "Copied \u2713";
    setTimeout(() => { btn.textContent = "Copy prompt"; }, 1600);
  };
}


// ---------- 2c. Dad joke of the day ----------
// Uses news.json's joke_of_the_day when the morning job wrote one;
// otherwise rotates through evergreen tech dad jokes by day so the slot
// is never empty (e.g. if the feed fetch failed).
const DAD_JOKES = [
  { category: "Programming", joke: "Why do programmers prefer dark mode? Because light attracts bugs." },
  { category: "Programming", joke: "There are only 10 kinds of people in the world: those who understand binary and those who don't." },
  { category: "Networking", joke: "I would tell you a UDP joke, but you might not get it." },
  { category: "Networking", joke: "I'd tell you a TCP joke, but I'd just have to keep repeating it until you got it." },
  { category: "Programming", joke: "Why do Java developers wear glasses? Because they don't C#." },
  { category: "Databases", joke: "A SQL query walks into a bar, sees two tables and asks\u2026 \u2018Mind if I join you?\u2019" },
  { category: "Programming", joke: "Why did the programmer quit his job? He didn't get arrays." },
  { category: "Programming", joke: "There are two hard problems in computer science: cache invalidation, naming things, and off-by-one errors." },
  { category: "Dad classic", joke: "A programmer's spouse says: \u2018Go to the store and get a loaf of bread. If they have eggs, get a dozen.\u2019 The programmer comes home with twelve loaves of bread." },
  { category: "Hardware", joke: "Why did the computer catch a cold? It left its Windows open." },
  { category: "Dad classic", joke: "What does a baby computer call its father? Data." },
  { category: "Security", joke: "I changed my password to \u2018incorrect\u2019 \u2014 that way, when I forget it, the computer reminds me: \u2018your password is incorrect.\u2019" },
  { category: "Programming", joke: "Why did the developer go broke? He spent it all on cache." },
  { category: "Networking", joke: "Why did the Wi-Fi break up with the router? They just couldn't connect." },
  { category: "Storage", joke: "My RAID array and I are very close. You could say we're redundant like that." },
  { category: "Cloud", joke: "Why did the cloud engineer bring a ladder to work? To reach the cloud." },
  { category: "Programming", joke: "Why don't programmers like nature? Too many bugs." },
  { category: "Storage", joke: "My backup plan has a backup plan. That's not paranoia, that's professionalism." },
  { category: "Hardware", joke: "Why did the laptop go to therapy? Too many unresolved tickets." },
  { category: "Programming", joke: "Debugging is like being the detective in a crime movie where you are also the murderer." },
  { category: "Security", joke: "I asked the firewall to keep a secret. Now nothing gets out." },
  { category: "Cloud", joke: "Why did the Kubernetes cluster apply for a job? It wanted to orchestrate its career." },
  { category: "Networking", joke: "My smart speaker told me a UDP joke yesterday. Or was it today? It never confirmed delivery." },
  { category: "Programming", joke: "There are 10 types of people in this world: those who can extrapolate from incomplete data\u2026" },
  { category: "Hardware", joke: "I told my computer I needed space. Now it keeps asking about partitioning." },
  { category: "Dad classic", joke: "My server's uptime is so long, we're basically in a committed relationship." },
  { category: "Databases", joke: "Why did the database admin leave the party early? He couldn't find his primary key." },
  { category: "Programming", joke: "Why was the JavaScript developer so sad? He didn't Node how to Express himself." },
];

function renderJokeOfTheDay(data) {
  const catEl = document.getElementById("joke-category");
  const textEl = document.getElementById("joke-text");
  if (!catEl || !textEl) return;
  const jod = data && data.joke_of_the_day;
  let category, text;
  if (jod && jod.joke) {
    category = jod.category || "Tech dad joke";
    text = jod.joke;
  } else {
    const j = DAD_JOKES[Math.floor(Date.now() / 86400000) % DAD_JOKES.length];
    category = j.category;
    text = j.joke;
  }
  catEl.textContent = category;
  textEl.textContent = "\u201C" + text + "\u201D";
}


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
  { icon: "🎙️", name: "Daily Tech News Podcast", desc: "Morning tech podcast with Alex & Jordan", status: "live", link: "https://scribnet.io/podcast.html" },
  { icon: "🔍", name: "RVTools Analyzer", desc: "VMware briefing from RVTools exports", status: "live", link: "https://scribnetai.github.io/rvtools-analyzer/" },
  { icon: "🖥️", name: "Server Sizer", desc: "Size VMware refresh builds", status: "live", link: "https://scribnetai.github.io/server-sizer/" },
  { icon: "💾", name: "Storage Sizer", desc: "Year-by-year storage capacity plans", status: "live", link: "https://scribnetai.github.io/storage-sizer/" },
  { icon: "🌐", name: "Network Sizer", desc: "TOR & FC SAN switch plans", status: "live", link: "https://scribnetai.github.io/network-sizer/" },
  { icon: "🤝", name: "Deal Pack", desc: "Proposal builder from sizing exports", status: "live", link: "https://scribnetai.github.io/deal-pack/" },
  { icon: "⚔️", name: "Battlecards", desc: "Head-to-head vendor comparisons", status: "live", link: "https://scribnetai.github.io/battlecards/" },
  { icon: "🧮", name: "TCO Calculator", desc: "Year-by-year total cost of ownership", status: "live", link: "https://scribnetai.github.io/tco-calculator/" },
];

document.getElementById("app-tiles").innerHTML = apps.map((a) => `
  <a class="tile" href="${esc(a.link)}"${a.link.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>
    <div class="icon">${esc(a.icon)}</div>
    <h3>${esc(a.name)}</h3>
    <p>${esc(a.desc)}</p>
    <div class="status ${a.status}">${a.status === "live" ? "● LIVE" : "○ SOON"}</div>
  </a>
`).join("");

// ---------- 5. Changelog ----------
// CHANGELOG.md uses a strict format: "# Changelog" title,
// "## YYYY-MM-DD" day headings (newest first), "- " bullets.
// The morning job appends to it; this just renders it.
fetch("CHANGELOG.md", { cache: "no-store" })
  .then((res) => {
    if (!res.ok) throw new Error("bad status");
    return res.text();
  })
  .then((md) => {
    let html = "";
    let inList = false;
    const closeList = () => { if (inList) { html += "</ul>"; inList = false; } };
    for (const line of md.split("\n")) {
      if (line.startsWith("## ")) {
        closeList();
        html += `<h4>${esc(line.slice(3).trim())}</h4>`;
      } else if (line.startsWith("- ")) {
        if (!inList) { html += "<ul>"; inList = true; }
        html += `<li>${esc(line.slice(2).trim())}</li>`;
      } else if (line.trim() === "" || line.startsWith("# ")) {
        closeList(); // title and blank lines render nothing
      } else {
        closeList();
        html += `<p>${esc(line.trim())}</p>`;
      }
    }
    closeList();
    document.getElementById("changelog-body").innerHTML = html;
  })
  .catch(() => {
    document.getElementById("changelog-body").innerHTML =
      "<p class='section-note'>Changelog unavailable.</p>";
  });
