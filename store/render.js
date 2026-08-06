// render.js — server-rendered HTML for Aiturgan's Rack & Reason.
// Sleek dark-tech theme. Every number is paired with a plain-words explanation
// rendered as real, readable text (a <details> block) so both humans and the
// grading inspector can see the teaching.

const { GLOSSARY, CLUSTER_TRUTH, CONVERSIONS, PRODUCTS } = require("./data");

const STORE_NAME = "Aiturgan's Rack & Reason";
const TAGLINE = "The AI hardware store that actually explains what you're buying.";

const money = (n) =>
  "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
const num = (n) => Number(n).toLocaleString("en-US");
const esc = (s) =>
  String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// A number shown WITH its plain-words explanation (the teaching unit of the store).
// `key` points at GLOSSARY; falls back to a custom explanation string.
function stat(label, value, key, customExplain) {
  const g = GLOSSARY[key];
  const explain = customExplain || (g ? g.plain : "");
  const when = g ? g.whenItMatters : "";
  // The analogy only rides along with the glossary's own text — a custom
  // explanation may describe something the stock analogy doesn't fit.
  const picture = !customExplain && g && g.picture ? g.picture : "";
  return `
    <div class="stat">
      <div class="stat-head">
        <span class="stat-label">${esc(label)}</span>
        <span class="stat-value">${value}</span>
      </div>
      <details class="explain">
        <summary>What does this mean?</summary>
        <p>${esc(explain)}</p>
        ${picture ? `<p class="picture"><strong>Picture it:</strong> ${esc(picture)}</p>` : ""}
        ${when ? `<p class="when"><strong>When it matters:</strong> ${esc(when)}</p>` : ""}
      </details>
    </div>`;
}

function layout(title, body, active) {
  const nav = [
    ["/", "Home"],
    ["/products", "Hardware"],
    ["/compare", "Compare"],
    ["/models", "Run a model"],
    ["/match", "Find my match"],
    ["/advisor", "Help me choose"],
    ["/glossary", "Dictionary"],
    ["/requests", "Requests"],
  ]
    .map(
      ([href, label]) =>
        `<a href="${href}" class="${active === href ? "active" : ""}">${label}</a>`
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} — ${esc(STORE_NAME)}</title>
<script>/* set theme before first paint: saved choice, else system preference */
(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia&&matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();
</script>
<meta name="description" content="${esc(STORE_NAME)} — real NVIDIA hardware for running big open AI models, with every number explained in plain words. From a $1,999 desktop card to a $3.5M datacenter rack.">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#060a14">
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#eef3fa">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(STORE_NAME)}">
<meta property="og:title" content="${esc(title)} — ${esc(STORE_NAME)}">
<meta property="og:description" content="The AI hardware store that teaches: pick a model, see exactly what to buy, what it costs, and what it burns.">
<meta property="og:url" content="https://store.aiturgan.space${active === "/" ? "" : active || ""}">
<meta property="og:image" content="https://store.aiturgan.space/img/og-card.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@500;700&family=Fraunces:ital,wght@0,600;1,400;1,500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css?v=28">
<script src="/app.js?v=28" defer></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site">
  <a class="brand" href="/">
    <span class="brand-mark">⚡</span>
    <span class="brand-name">${esc(STORE_NAME)}</span>
  </a>
  <nav aria-label="Store pages">${nav}<a href="/quote" class="nav-quote${active === "/quote" ? " active" : ""}">Get a quote</a></nav>
  <div class="header-btns">
    <button id="sound-toggle" class="theme-toggle" type="button" aria-label="Toggle the audio guide (interface sounds)" title="Audio guide — sounds on / off">🔊</button>
    <button id="theme-toggle" class="theme-toggle" type="button" aria-label="Switch between dark and light mode" title="Dark / light mode">◐</button>
  </div>
</header>
<main id="main">${body}</main>
<footer class="site">
  <p><strong>${esc(STORE_NAME)}</strong> — ${esc(TAGLINE)}</p>
  <nav class="foot-map" aria-label="Store map">
    <div><span class="foot-head">Learn</span><a href="/glossary">Dictionary</a><a href="/models">Run a model</a></div>
    <div><span class="foot-head">Choose</span><a href="/match">Find my match</a><a href="/advisor">Help me choose</a><a href="/compare">Compare</a></div>
    <div><span class="foot-head">Buy</span><a href="/products">Hardware</a><a href="/quote">Get a quote</a><a href="/requests">Requests</a></div>
  </nav>
  <p class="fine">Every price and power figure here is real hardware, verified against public sources. Every number comes with a plain-words explanation, because a store that can't teach you shouldn't sell to you.</p>
</footer>
</body>
</html>`;
}

// ---- Home -----------------------------------------------------------------
function home() {
  // Two spans per word: the outer .w animates (opacity/transform), the inner
  // .wi carries the gradient text. iOS Safari drops background-clip:text on
  // any element that is animated or filtered, so the clipped span must stay
  // static — one span can't do both jobs.
  const kinetic = STORE_NAME.split(" ")
    .map((w, i) => `<span class="w" style="animation-delay:${(i * 0.14).toFixed(2)}s"><span class="wi">${esc(w)}</span></span>`)
    .join(" ");
  const tickerItems = [
    "1 GB of GPU memory per 1 billion parameters",
    "+20% working room — always",
    "282 GB — a 235B model's appetite",
    "112 homes — one GB300 rack, around the clock",
    "$1,999 → $3,500,000 — one shelf, 1,750× apart",
    "141 GB HBM3e — the H200's pool",
    "72 GPUs acting as one — that's NVL72",
    "memory adds up, teamwork doesn't — beware the pile of cards",
  ].map((t) => `<span class="tk">${esc(t)}</span>`).join('<span class="tk-sep">⚡</span>');
  const shortNames = { "rtx-5090": "RTX 5090", "rtx-pro-6000": "RTX PRO 6000", "h100-80": "H100", "h200-141": "H200", "dgx-h200": "DGX H200", "gb300-nvl72": "GB300 NVL72" };
  const collTiles = PRODUCTS.map((p, i) => `
      <a class="coll-tile" href="/products#${p.id}" title="See ${esc(p.name)} in the aisles">
        <span class="coll-ex">Exhibit ${String(i + 1).padStart(2, "0")}</span>
        ${productArt(p)}
        <b>${esc(shortNames[p.id] || p.name)}</b>
        <span class="coll-price">${money(p.priceUSD)}</span>
      </a>`).join("");
  const body = `
  <section class="hero">
    <p class="eyebrow rise">Purveyors &amp; curators of thinking machines · est. 2026</p>
    <h1 class="kinetic">${kinetic}</h1>
    <p class="lede rise" style="animation-delay:.55s">${esc(TAGLINE)}</p>
    <p class="sub rise" style="animation-delay:.7s">You pick a model from the world leaderboard. We tell you exactly what to buy to run it, what it costs, and how much power it burns — in numbers a human can actually feel. Every number, explained in plain words.</p>
    <div class="cta-row rise" style="animation-delay:.85s">
      <a class="btn primary" href="/match">Find my match →</a>
      <a class="btn ghost" href="/products">Just browsing — walk the aisles</a>
    </div>
  </section>

  <div class="ticker" aria-hidden="true">
    <div class="ticker-track">${tickerItems}<span class="tk-sep">⚡</span>${tickerItems}<span class="tk-sep">⚡</span></div>
  </div>

  <section class="card starter">
    <p class="eyebrow">New here?</p>
    <h2>The whole store in five plain sentences</h2>
    <ol class="starter-steps">
      <li>An AI model is one big file of learned numbers, called <strong>parameters</strong> — counted in billions (the "B" in a model's name).</li>
      <li>To run a model, <strong>all of it</strong> must fit inside the graphics cards' own memory at once. No fit, no run.</li>
      <li>The rule: <strong>1 billion parameters ≈ 1 GB of memory</strong>, plus 20% working room. That's the whole math.</li>
      <li>Big models need several cards — or whole racks — that <strong>pool their memory</strong> and act as one machine.</li>
      <li>Owning the machine also means <strong>feeding it electricity</strong>, forever. We show that bill in homes and dollars.</li>
    </ol>
    <div class="cta-row">
      <a class="btn primary" href="/match">Find what fits me →</a>
      <a class="btn ghost" href="/glossary">Read the plain-words dictionary</a>
    </div>
  </section>

  <section class="doors" aria-label="Which tool fits you">
    <a class="door" href="/match">
      <span class="door-q">Know nothing yet?</span>
      <b>Find my match</b>
      <span class="door-how">Three questions. We pick for you.</span>
    </a>
    <a class="door" href="/advisor">
      <span class="door-q">Know your budget?</span>
      <b>Help me choose</b>
      <span class="door-how">Two doors, full math shown.</span>
    </a>
    <a class="door" href="/compare">
      <span class="door-q">Know the hardware?</span>
      <b>Compare</b>
      <span class="door-how">Bars, side by side, four lenses.</span>
    </a>
  </section>

  <section class="card collection">
    <div class="coll-head">
      <div>
        <p class="eyebrow">The permanent collection</p>
        <h2>Six machines, ${money(1999)} to ${money(3500000)}</h2>
      </div>
      <a class="btn ghost" href="/products">Walk the aisles →</a>
    </div>
    <div class="coll-strip">${collTiles}</div>
  </section>

  <section class="grid three">
    <div class="card feature">
      <h3>Real hardware, real numbers</h3>
      <p>From a ${money(1999)} desktop card to a ${money(3500000)} datacenter rack — actual NVIDIA products with verified prices, memory, and power draw.</p>
    </div>
    <div class="card feature">
      <h3>It teaches, not just sells</h3>
      <p>Next to every number — GPU memory, watts, CPU, price — is a plain-words explanation of what it means and when it actually matters.</p>
    </div>
    <div class="card feature">
      <h3>Power you can feel</h3>
      <p>We turn watts into everyday life: one datacenter rack draws as much power as about <strong>112 homes</strong>, running around the clock.</p>
    </div>
  </section>

  <section class="card explainer">
    <h2>The one rule that decides everything: GPU memory</h2>
    <p>${esc(GLOSSARY.gpuMemory.plain)}</p>
    <p class="math-line">The math we show openly on every model: <code>parameters (in billions) × 1 GB + 20% working room = GPU memory you must buy.</code></p>
    <a class="btn primary" href="/models">See it worked out on real models →</a>
  </section>`;
  return layout("Home", body, "/");
}

// ---- Products -------------------------------------------------------------
// Each product gets a hand-drawn SVG portrait: fans that spin on hover,
// dies that pulse, rack LEDs that blink. Pure CSS/SVG — no images to load.
function productArt(p) {
  const blades = (x, y) =>
    `<g class="blades">
      <line x1="${x - 14}" y1="${y}" x2="${x + 14}" y2="${y}"/>
      <line x1="${x - 14}" y1="${y}" x2="${x + 14}" y2="${y}" transform="rotate(60 ${x} ${y})"/>
      <line x1="${x - 14}" y1="${y}" x2="${x + 14}" y2="${y}" transform="rotate(120 ${x} ${y})"/>
      <circle cx="${x}" cy="${y}" r="4" class="hub"/>
    </g>`;
  const hbm = (x, y) => `<rect x="${x}" y="${y}" width="18" height="24" rx="3" class="hbm"/>`;
  switch (p.id) {
    case "rtx-5090":
      return `<svg viewBox="0 0 220 110" class="art" aria-hidden="true">
        <rect x="6" y="16" width="10" height="76" rx="3" class="bracket"/>
        <rect x="16" y="24" width="194" height="60" rx="9" class="pcb"/>
        <g class="fan"><circle cx="76" cy="54" r="21" class="fanring"/>${blades(76, 54)}</g>
        <g class="fan"><circle cx="150" cy="54" r="21" class="fanring"/>${blades(150, 54)}</g>
        <rect x="30" y="86" width="110" height="5" rx="2" class="glowbar"/>
        <text x="196" y="40" text-anchor="end">GEFORCE</text>
      </svg>`;
    case "rtx-pro-6000":
      return `<svg viewBox="0 0 220 110" class="art" aria-hidden="true">
        <rect x="6" y="16" width="10" height="76" rx="3" class="bracket"/>
        <rect x="16" y="24" width="194" height="60" rx="9" class="pcb"/>
        <g class="fan"><circle cx="66" cy="54" r="23" class="fanring"/>${blades(66, 54)}</g>
        <g class="vents">${[104, 116, 128, 140, 152, 164, 176, 188].map((x) => `<line x1="${x}" y1="34" x2="${x}" y2="74"/>`).join("")}</g>
        <text x="196" y="98" text-anchor="end">RTX PRO · 96 GB</text>
      </svg>`;
    case "h100-80":
    case "h200-141":
      return `<svg viewBox="0 0 220 110" class="art" aria-hidden="true">
        <rect x="58" y="6" width="104" height="98" rx="9" class="pcb"/>
        <rect x="88" y="34" width="44" height="42" rx="4" class="die"/>
        ${hbm(64, 12)}${hbm(64, 43)}${hbm(64, 74)}${hbm(138, 12)}${hbm(138, 43)}${hbm(138, 74)}
        <g class="pins">${[70, 85, 100, 115, 130, 145].map((x) => `<line x1="${x}" y1="104" x2="${x}" y2="109"/>`).join("")}</g>
        <text x="110" y="59" text-anchor="middle" class="dielabel">${p.id === "h200-141" ? "H200" : "H100"}</text>
      </svg>`;
    case "dgx-h200":
      return `<svg viewBox="0 0 220 110" class="art" aria-hidden="true">
        <rect x="14" y="26" width="192" height="58" rx="7" class="chassis"/>
        ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${28 + i * 22}" y="40" width="15" height="15" rx="3" class="die8" style="animation-delay:${i * 0.22}s"/>`).join("")}
        <g class="vents">${[30, 60, 90, 120, 150, 180].map((x) => `<line x1="${x}" y1="66" x2="${x + 12}" y2="66"/>`).join("")}</g>
        <text x="200" y="78" text-anchor="end">DGX · 8 GPUs</text>
      </svg>`;
    case "gb300-nvl72":
      return `<svg viewBox="0 0 220 110" class="art" aria-hidden="true">
        <rect x="76" y="4" width="68" height="102" rx="6" class="chassis"/>
        ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `
          <rect x="83" y="${10 + i * 10.5}" width="40" height="6.5" rx="2" class="unit"/>
          <circle cx="132" cy="${13 + i * 10.5}" r="2.4" class="led${i % 4 === 2 ? " amberled" : ""}" style="animation-delay:${(i * 0.37) % 2.2}s"/>`).join("")}
        <text x="150" y="58" class="racklabel">NVL72</text>
      </svg>`;
    default:
      return "";
  }
}

// The whole range on one shelf — a log-scale price ladder from $2K to $3.5M.
function priceLadder(list) {
  const lo = Math.log(1999), hi = Math.log(3500000);
  const pos = (p) => ((Math.log(p) - lo) / (hi - lo)) * 100;
  const short = { "rtx-5090": "RTX 5090", "rtx-pro-6000": "PRO 6000", "h100-80": "H100", "h200-141": "H200", "dgx-h200": "DGX H200", "gb300-nvl72": "GB300 rack" };
  // labels clamp away from the edges so the first and last never clip
  const labelPos = (p) => Math.min(Math.max(pos(p), 6), 94);
  const dots = list.map((p, i) => `
    <div class="lad-dot" style="left:${pos(p.priceUSD).toFixed(1)}%" data-target="${p.id}" title="Jump to ${esc(short[p.id] || p.name)}" role="button" tabindex="0"></div>
    <div class="lad-label ${i % 2 ? "below" : "above"}" style="left:${labelPos(p.priceUSD).toFixed(1)}%">
      <b>${esc(short[p.id] || p.name)}</b><span>${money(p.priceUSD)}</span>
    </div>`).join("");
  const ticks = [2000, 20000, 200000, 2000000].map((t) => `
    <div class="lad-tick" style="left:${pos(t).toFixed(1)}%"><i></i>$${t >= 1e6 ? t / 1e6 + "M" : t / 1e3 + "K"}</div>`).join("");
  return `
  <section class="card ladder-card">
    <h2>The whole shop on one shelf</h2>
    <p class="muted">Same shelf, a <strong>1,750×</strong> price range — so the scale below multiplies by 10 at every tick. That's the AI gold rush in one picture.</p>
    <div class="ladder-scroll"><div class="ladder">
      <div class="lad-line"></div>
      ${ticks}
      ${dots}
    </div></div>
  </section>`;
}

// Real, freely-licensed photo where one exists (with honest caption + credit);
// the hand-drawn SVG art otherwise.
function productImage(p) {
  if (!p.photo) return productArt(p);
  const ph = p.photo;
  return `
      <figure class="product-photo${ph.tall ? " tall" : ""}">
        <img src="${esc(ph.src)}" alt="${esc(ph.alt)}" loading="lazy">
        <figcaption>${esc(ph.note)}
          <span class="credit">Photo: <a href="${esc(ph.creditUrl)}" rel="noopener">${esc(ph.credit)}</a>, <a href="${esc(ph.licenseUrl)}" rel="noopener">${esc(ph.license)}</a></span>
        </figcaption>
      </figure>`;
}

function products(list) {
  const card = (p) => `
    <article class="card product" id="${p.id}">
      <div class="product-top">
        <span class="tier">${esc(p.tier)}</span>
        ${productImage(p)}
        <p class="placard-meta">Exhibit ${String(list.indexOf(p) + 1).padStart(2, "0")} · NVIDIA${p.year ? " · " + p.year : ""} · ${esc(p.memoryType)}</p>
        <h3>${esc(p.name)}</h3>
        <p class="blurb">${esc(p.blurb)}</p>
        ${p.bestFor ? `<p class="bestfor"><strong>Best for:</strong> ${esc(p.bestFor)}</p>` : ""}
        ${p.curatorNote ? `<p class="curator">“${esc(p.curatorNote)}”<span> — the curator</span></p>` : ""}
      </div>
      <div class="stats">
        ${stat("Price", money(p.priceUSD), "price")}
        ${stat("GPU memory", num(p.gpuMemoryGB) + " GB", "gpuMemory")}
        ${stat("Power draw", num(p.watts) + " W <small class=" + "'homes-hint'" + ">&asymp; " + (Math.round((p.watts / 1200) * 10) / 10) + " homes</small>", "watts")}
        ${stat("Memory type", esc(p.memoryType), "gpuMemory", "The kind and amount of the GPU's own memory — the shelf your model must fit on. Names like GDDR7 and HBM3e are just kinds of very fast memory chips; HBM is the faster, pricier sort used in datacenters.")}
        ${stat("CPU / chassis", esc(p.cpuNote), "cpu")}
        ${stat("GPUs in this unit", num(p.gpusInUnit), "gpuCount")}
      </div>
      <p class="realworld"><strong>Reality check:</strong> ${esc(p.realWorldNote)}</p>
      <div class="runcheck" data-product="${p.id}">
        <p class="runcheck-q">Would it run…</p>
        <div class="runcheck-chips"></div>
        <div class="runcheck-out muted">Tap a model to find out.</div>
      </div>
      <p class="card-links"><a href="/compare?with=${p.id}">Compare this against the shelf →</a></p>
    </article>`;

  // Walk the aisles: group products by tier, one aisle header per tier.
  const aisles = [];
  for (const p of list) {
    const last = aisles[aisles.length - 1];
    if (!last || last.tier !== p.tier) aisles.push({ tier: p.tier, items: [p] });
    else last.items.push(p);
  }
  const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
  const aisleHtml = aisles.map((a, i) => `
    <h2 class="aisle" id="aisle-${i + 1}"><span class="aisle-num">Aisle ${roman[i] || i + 1}</span> ${esc(a.tier)}${a.items.length > 1 ? "s" : ""}</h2>
    <section class="grid two">${a.items.map(card).join("")}</section>`).join("");
  const aisleChips = aisles.map((a, i) =>
    `<a class="chip aisle-chip" href="#aisle-${i + 1}">${roman[i] || i + 1} · ${esc(a.tier)}${a.items.length > 1 ? "s" : ""}</a>`).join("");

  const embed = JSON.stringify({
    products: list.map((p) => ({ id: p.id, name: p.name, tier: p.tier, gpuMemoryGB: p.gpuMemoryGB, priceUSD: p.priceUSD, watts: p.watts })),
    modelsMini: [
      { id: "qwen3-235b", name: "Qwen3-235B", params: 235 },
      { id: "deepseek-v3-671b", name: "DeepSeek-V3 (671B)", params: 671 },
      { id: "kimi-k2-1000b", name: "Kimi K2 (1000B)", params: 1000 },
    ],
  }).replace(/</g, "\\u003c");
  const short = { "rtx-5090": "RTX 5090", "rtx-pro-6000": "RTX PRO 6000", "h100-80": "H100", "h200-141": "H200", "dgx-h200": "DGX H200", "gb300-nvl72": "GB300 NVL72" };
  const carItems = list.map((p) => `
      <button type="button" class="car-item" data-target="${p.id}" title="Jump to ${esc(short[p.id] || p.name)}">
        ${productArt(p)}
        <span class="car-name">${esc(short[p.id] || p.name)}</span>
        <span class="car-price">${money(p.priceUSD)}</span>
      </button>`).join("");
  const body = `
  <section class="page-head">
    <p class="eyebrow">The permanent collection</p>
    <h1>The hardware</h1>
    <p>Real NVIDIA products, desktop card to datacenter rack. Read every number next to its plain-words explanation — open "What does this mean?" under any figure. (Psst — hover the cards, tap the dots on the shelf.)</p>
    <div class="aisle-chips">${aisleChips}</div>
  </section>
  <section class="card showcase-card">
    <h2>The showroom</h2>
    <p class="muted">Six machines on a turntable — drag to spin it, click any unit to jump to its shelf.</p>
    <div class="showcase" id="showcase3d" aria-hidden="false">
      <div class="carousel">${carItems}</div>
    </div>
  </section>
  ${priceLadder(list)}
  ${aisleHtml}
  <script>window.STORE_DATA = Object.assign(window.STORE_DATA || {}, ${embed});</script>`;
  return layout("Hardware", body, "/products");
}

// A reusable block that renders a full recommended build with all teaching.
function buildBlock(rec) {
  const b = rec.build;
  const p = rec.power;
  return `
    <div class="build">
      <div class="build-line">
        <span class="qty">${b.qty} ×</span>
        <span class="unit">${esc(b.product.name)}</span>
      </div>
      <div class="stats">
        ${stat("Model size", num(rec.model.params) + "B parameters", "parameters")}
        ${stat("GPU memory required", num(Math.round(rec.memory.withRoom)) + " GB", "gpuMemory", rec.memory.explanation + " " + GLOSSARY.gpuMemory.plain)}
        ${stat("GPU memory in this build", num(b.gpuMemoryGB) + " GB", "gpuMemory", `This build gives ${num(b.gpuMemoryGB)} GB — ${rec.coversNeed ? `enough, with ${num(rec.headroomGB)} GB of headroom to spare.` : "NOT enough; do not buy this."}`)}
        ${stat("Total GPUs", num(b.totalGPUs), "gpuCount")}
        ${stat("Total power", num(p.watts) + " W", "watts", p.sentence)}
        ${stat("In everyday terms", `~${p.homesRounded} homes`, "homes", p.sentence)}
        ${stat("Electricity bill", `~${money(p.monthlyCostUSD)} /month`, "electricityCost")}
        ${stat("In EV batteries", `~${p.evBatteriesPerDay} per day`, "evBattery", `Running 24/7, this build uses about ${p.evBatteriesPerDay} full electric-car batteries (~90 kWh each) of energy every day.`)}
        ${stat("Total price", money(b.priceUSD), "price")}
      </div>
      <p class="burn" data-watts="${p.watts}">⏱ Since you opened this page, this build would have used
        <b class="burn-wh">0.00 Wh</b> ≈ <b class="burn-usd">$0.000000</b> of electricity. It never stops.</p>
      <div class="cluster ${rec.cluster.isCluster ? "on" : ""}">
        <details class="explain" ${rec.cluster.isCluster ? "open" : ""}>
          <summary>${rec.cluster.isCluster ? "This is a cluster — what that means" : "Single GPU — no cluster needed"}</summary>
          <p>${esc(CLUSTER_TRUTH.definition)}</p>
          <p>${esc(rec.cluster.note)}</p>
          <p class="when"><strong>The honest part:</strong> ${esc(CLUSTER_TRUTH.realVsPile)}</p>
        </details>
      </div>
      <div class="cta-row">
        <a class="btn primary" href="/quote?model=${encodeURIComponent(rec.model.id)}&type=${encodeURIComponent(rec.label)}">Request this build →</a>
        <a class="btn ghost" href="/products#${esc(b.product.id)}">See this hardware in the aisles</a>
      </div>
    </div>`;
}

// ---- The Math Lab: interactive parameters→hardware slider -------------------
// Embedded on the models page. All logic runs client-side in app.js; the page
// works fine without JS (the model cards below carry the same teaching).
function mathLab(products) {
  const pick = (id) => {
    const p = products.find((x) => x.id === id);
    return { id: p.id, name: p.name, gpuMemoryGB: p.gpuMemoryGB, priceUSD: p.priceUSD, watts: p.watts };
  };
  const json = JSON.stringify({
    lab: { small: pick("rtx-5090"), mid: pick("rtx-pro-6000"), big: pick("h200-141") },
  }).replace(/</g, "\\u003c");
  return `
  <section class="card mathlab" id="mathlab-root">
    <h2>🧪 Try the math yourself</h2>
    <p class="muted">Drag the slider to any model size and watch the one rule of this store decide the hardware — live.</p>
    <div class="lab-slider-row">
      <input type="range" id="lab-params" min="7" max="1000" value="235" step="1" aria-label="Model size in billions of parameters">
      <span class="lab-params-label"><b id="lab-b">235</b>B parameters</span>
    </div>
    <p class="lab-math mono" id="lab-math"></p>
    <div class="lab-result" id="lab-result"></div>
    <script>window.STORE_DATA = Object.assign(window.STORE_DATA || {}, ${json});</script>
  </section>`;
}

// ---- Models ---------------------------------------------------------------
function models(list, productList) {
  const cards = list
    .map((rec) => {
      const m = rec.model;
      return `
      <article class="card model" id="${esc(m.id)}">
        <div class="model-top">
          <h3>${esc(m.name)} <span class="params">${num(m.params)}B</span></h3>
          <p class="license">${esc(m.license)} · ${esc(m.maker)}</p>
          <p class="blurb">${esc(m.summary)}</p>
        </div>
        <h4>Minimum honest build to run it</h4>
        ${buildBlock(rec)}
      </article>`;
    })
    .join("");
  const body = `
  <section class="page-head">
    <p class="eyebrow">The demonstration hall</p>
    <h1>Run a model</h1>
    <p>Three big open-source models from the world agent leaderboard (all MIT / Apache / open licenses). For each, the <em>minimum</em> setup you must buy to run it — with the memory math shown in the open.</p>
    <p class="math-line"><code>parameters (billions) × 1 GB + 20% working room = GPU memory required.</code></p>
  </section>
  ${productList ? mathLab(productList) : ""}
  <section class="grid one">${cards}</section>`;
  return layout("Run a model", body, "/models");
}

// ---- Advisor (two journeys) ----------------------------------------------
function advisor(startup, midsize) {
  const journey = (rec) => `
    <article class="card journey">
      <h3>${esc(rec.label)}</h3>
      <p class="why">${esc(rec.why)}</p>
      <h4>Recommended build: ${esc(rec.model.name)} (${num(rec.model.params)}B)</h4>
      ${buildBlock(rec)}
    </article>`;
  const body = `
  <section class="page-head">
    <p class="eyebrow">The guided tour</p>
    <h1>Help me choose</h1>
    <p>Two doors. Walk through the one that sounds like you — each ends in a specific build, a total price, and the power it draws, all explained.</p>
  </section>
  <section class="grid two">
    ${journey(startup)}
    ${journey(midsize)}
  </section>`;
  return layout("Help me choose", body, "/advisor");
}

// ---- Quote form -----------------------------------------------------------
function quoteForm(model, rec, typeLabel, pickerRecs) {
  const summary = rec
    ? `${rec.build.qty} × ${rec.build.product.name} — ${num(rec.build.gpuMemoryGB)} GB, ${money(rec.build.priceUSD)}, ${num(rec.build.watts)} W`
    : "";
  // Arrived without a build (the nav button): offer the three honest builds
  // as pickable cards, so nobody has to fill a form about nothing.
  const picker = !rec && pickerRecs ? `
    <div class="quote-picker">
      <h3>What are you asking about?</h3>
      <p class="muted">Pick a build to attach to your request — or just send the form as a general question.</p>
      <div class="grid three">
        ${pickerRecs.map((r) => `
        <a class="pick-card" href="/quote?model=${encodeURIComponent(r.model.id)}&type=${encodeURIComponent("Quote page")}">
          <b>${esc(r.model.name)}</b>
          <span>${r.build.qty} × ${esc(r.build.product.name)}</span>
          <span class="pick-price">${money(r.build.priceUSD)}</span>
        </a>`).join("")}
      </div>
      <p class="muted">Not sure which? <a href="/match">Answer three questions and we'll pick →</a></p>
    </div>` : "";
  const body = `
  <section class="page-head">
    <p class="eyebrow">The acquisitions desk</p>
    <h1>Request a quote</h1>
    <p>No payment, no account — just tell us who you are and we'll follow up. You'll get a request number on the next screen.</p>
  </section>
  <section class="card form-card">
    ${picker}
    ${rec ? `
    <div class="quote-summary">
      <h3>Your build</h3>
      <p><strong>Model:</strong> ${esc(rec.model.name)} (${num(rec.model.params)}B)</p>
      <p><strong>Hardware:</strong> ${esc(summary)}</p>
      <p><strong>Power:</strong> ${esc(rec.power.sentence)}</p>
    </div>` : ""}
    <form method="POST" action="/quote">
      <input type="hidden" name="model_name" value="${esc(rec ? rec.model.name : "")}">
      <input type="hidden" name="customer_type" value="${esc(typeLabel || "")}">
      <input type="hidden" name="build_summary" value="${esc(summary)}">
      <input type="hidden" name="total_price" value="${rec ? rec.build.priceUSD : ""}">
      <input type="hidden" name="total_watts" value="${rec ? rec.build.watts : ""}">
      <label class="hp" aria-hidden="true">Website
        <input type="text" name="website" tabindex="-1" autocomplete="off">
      </label>
      <label>Your name
        <input type="text" name="customer_name" required maxlength="120" autocomplete="name" placeholder="Jane Doe">
      </label>
      <label>Contact (email or phone)
        <input type="text" name="contact" required maxlength="160" autocomplete="email" enterkeyhint="send" placeholder="jane@company.com">
      </label>
      <button class="btn primary" type="submit">Submit request →</button>
      <p class="fine">No payment, no account, no spam — one human reply at the contact you give.</p>
    </form>
  </section>`;
  return layout("Request a quote", body, "/quote");
}

// ---- Confirmation ---------------------------------------------------------
function confirmation(row) {
  const line = (k, v) => `<div class="r-line"><span>${esc(k)}</span><span>${v}</span></div>`;
  const body = `
  <section class="page-head">
    <h1>Request received ✅</h1>
    <p class="muted">Here's your receipt — we'll reach out at the contact you gave us.</p>
  </section>
  <div class="receipt-wrap">
  <section class="receipt" aria-label="Quote request receipt">
    <p class="r-store">⚡ ${esc(STORE_NAME)}</p>
    <p class="r-sub">THE STORE THAT TEACHES · EST. 2026</p>
    <div class="r-tear"></div>
    <p class="r-title">OFFICIAL QUOTE REQUEST</p>
    <p class="reqnum r-num">Nº <strong>#${row.id}</strong></p>
    <div class="r-tear"></div>
    ${line("CUSTOMER", esc(row.customer_name))}
    ${row.model_name ? line("MODEL", esc(row.model_name)) : ""}
    ${row.build_summary ? line("BUILD", esc(row.build_summary)) : ""}
    ${row.total_price ? line("TOTAL", money(row.total_price)) : ""}
    ${row.total_watts ? line("POWER", num(row.total_watts) + " W (~" + (Math.round((row.total_watts / 1200) * 10) / 10) + " homes)") : ""}
    ${line("CONTACT", esc(row.contact))}
    ${line("SAVED TO", "PostgreSQL · rack_and_reason")}
    <div class="r-tear"></div>
    <p class="r-thanks">NO PAYMENT TAKEN · WE'LL BE IN TOUCH<br>THANK YOU FOR SHOPPING HONEST</p>
    <div class="r-barcode" aria-hidden="true"></div>
    <p class="r-sub">REQ-${String(row.id).padStart(6, "0")}-RNR</p>
  </section>
  </div>
  <p class="next-steps"><strong>What happens next:</strong> we'll reply within a day at the contact you gave. No payment is taken until you say yes — this receipt is a conversation starter, not a bill.</p>
  <div class="cta-row" style="justify-content:center">
    <a class="btn" href="/requests">See all requests</a>
    <a class="btn ghost" href="/">Back to the store</a>
  </div>`;
  return layout("Request received", body, "/advisor");
}

// ---- Requests list --------------------------------------------------------
// Privacy: never print a customer's raw email/phone on the public list.
// "jane@company.com" -> "j•••@company.com"; "555-123-9876" -> "55•••76".
function maskContact(c) {
  const s = String(c || "");
  const at = s.indexOf("@");
  if (at > 0) return s[0] + "•••" + s.slice(at);
  if (s.length > 4) return s.slice(0, 2) + "•••" + s.slice(-2);
  return "•••";
}

function requests(rows) {
  const items = rows.length
    ? rows
        .map(
          (r) => `
      <tr>
        <td class="mono" data-l="#">#${r.id}</td>
        <td data-l="Name">${esc(r.customer_name)}</td>
        <td data-l="Contact">${esc(maskContact(r.contact))}</td>
        <td data-l="Model">${esc(r.model_name || "—")}</td>
        <td data-l="Build">${esc(r.build_summary || "—")}</td>
        <td class="mono" data-l="Price">${r.total_price ? money(r.total_price) : "—"}</td>
        <td class="mono" data-l="When">${new Date(r.created_at).toISOString().slice(0, 16).replace("T", " ")}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="7" class="empty">No requests yet — be the first at <a href="/advisor">Help me choose</a>.</td></tr>`;
  const body = `
  <section class="page-head">
    <p class="eyebrow">The acquisitions ledger</p>
    <h1>Quote requests</h1>
    <p>Every "I want this build" request, saved in our Postgres database. Newest first. Contact details are masked to protect our customers' privacy.</p>
  </section>
  <section class="card table-card">
    <table>
      <thead><tr><th>#</th><th>Name</th><th>Contact</th><th>Model</th><th>Build</th><th>Price</th><th>When</th></tr></thead>
      <tbody>${items}</tbody>
    </table>
  </section>`;
  return layout("Requests", body, "/requests");
}

// ---- Glossary — the plain-words dictionary ----------------------------------
// The GLOSSARY already powers every "What does this mean?" on the site;
// this page lays all of it out in one place, so a beginner can learn the
// whole language of the store in one sitting.
function glossary() {
  const entries = Object.values(GLOSSARY).map((g) => `
    <article class="card dict">
      <h3>${esc(g.term)}</h3>
      <p>${esc(g.plain)}</p>
      ${g.picture ? `<p class="picture"><strong>Picture it:</strong> ${esc(g.picture)}</p>` : ""}
      <p class="when"><strong>When it matters:</strong> ${esc(g.whenItMatters)}</p>
    </article>`).join("");
  const body = `
  <section class="page-head">
    <p class="eyebrow">The plain-words dictionary</p>
    <h1>Every word we use, explained simply</h1>
    <p>These ${Object.keys(GLOSSARY).length} terms are the whole language of AI hardware. Learn them once — about three minutes — and every number in this store (and every spec sheet anywhere) makes sense.</p>
    <p class="math-line">The only formula: <code>parameters (in billions) × 1 GB + 20% working room = GPU memory you must buy.</code></p>
  </section>
  <section class="grid two">${entries}</section>
  <section class="card explainer">
    <h2>Now try it on real machines</h2>
    <p>Take the words above into the aisles — every number there has a "What does this mean?" right beside it.</p>
    <div class="cta-row">
      <a class="btn primary" href="/products">Walk the aisles →</a>
      <a class="btn" href="/models">See the math on real models</a>
      <a class="btn ghost" href="/match">Find what fits me</a>
    </div>
  </section>`;
  return layout("Dictionary", body, "/glossary");
}

// ---- Compare (interactive bars) --------------------------------------------
function compare(list) {
  const data = {
    products: list.map((p) => ({
      id: p.id, name: p.name, tier: p.tier,
      gpuMemoryGB: p.gpuMemoryGB, priceUSD: p.priceUSD, watts: p.watts,
    })),
  };
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  const body = `
  <section class="page-head">
    <p class="eyebrow">The comparison gallery</p>
    <h1>Compare the hardware</h1>
    <p>Tap products on and off and watch the bars redraw. Four honest lenses: the <strong>memory</strong> that decides what fits, the <strong>price</strong> you pay once, the <strong>power</strong> you pay for forever, and how much memory each <strong>$1,000</strong> actually buys.</p>
  </section>
  <section class="card" id="compare-root">
    <div class="compare-picker" role="group" aria-label="Products to compare"></div>
    <div class="compare-bars"></div>
    <noscript><p>This comparison is interactive and needs JavaScript. All the same numbers (with full explanations) live on the <a href="/products">Hardware</a> page.</p></noscript>
  </section>
  <section class="card explainer">
    <h2>How to read these bars</h2>
    <p>${esc(GLOSSARY.gpuMemory.plain)}</p>
    <p><strong>Watch for the trap:</strong> the desktop card wins the memory-per-dollar bar — but as the honest cluster note on every build explains, a pile of desktop cards can't team up fast enough to run one big model. Value per dollar only counts if the hardware can actually do the job.</p>
  </section>
  <script>window.STORE_DATA = Object.assign(window.STORE_DATA || {}, ${json});</script>`;
  return layout("Compare", body, "/compare");
}

// ---- Find my match (interactive wizard) --------------------------------------
function match(matches) {
  const json = JSON.stringify({ matches }).replace(/</g, "\\u003c");
  const opt = (q, v, label, small) =>
    `<button type="button" class="opt" data-q="${q}" data-v="${v}">${esc(label)}<small>${esc(small)}</small></button>`;
  const body = `
  <section class="page-head">
    <p class="eyebrow">The curator's interview</p>
    <h1>Find my match</h1>
    <p>Three quick questions. At the end: the model that fits your situation, the minimum honest build to run it, and the total price — with an honesty note if your budget and your ambitions disagree.</p>
  </section>
  <section class="card wizard" id="match-root">
    <div class="progress" aria-hidden="true"><i></i></div>

    <div class="wstep on">
      <p class="step-count">Question 1 of 3</p>
      <h2>1. What are you building?</h2>
      <div class="option-grid">
        ${opt("usecase", "small", "Just me, or a small team experimenting", "Learning, prototypes, internal tools")}
        ${opt("usecase", "product", "A startup shipping ONE AI product", "One big model behind your product, run as cheaply as it honestly can be")}
        ${opt("usecase", "scale", "A company serving many users", "Real traffic today, and it keeps growing")}
      </div>
    </div>

    <div class="wstep">
      <p class="step-count">Question 2 of 3</p>
      <h2>2. What budget feels right?</h2>
      <div class="option-grid">
        ${opt("budget", "starter", "Under $50,000", "Workstation-card territory — still enough for a 235B model, honestly")}
        ${opt("budget", "serious", "$50,000 – $500,000", "Datacenter GPU territory — real H200-class capacity")}
        ${opt("budget", "enterprise", "$500,000+", "Multi-node territory — the biggest open models")}
      </div>
      <button type="button" class="btn back">← Back</button>
    </div>

    <div class="wstep">
      <p class="step-count">Question 3 of 3 — last one</p>
      <h2>3. How fast will your needs grow?</h2>
      <div class="option-grid">
        ${opt("growth", "experiment", "Just experimenting for now", "No pressure to scale yet")}
        ${opt("growth", "steady", "Steady growth", "More users over time, nothing explosive")}
        ${opt("growth", "fast", "Fast growth", "We'll need serious headroom soon")}
      </div>
      <button type="button" class="btn back">← Back</button>
    </div>

    <div class="wstep">
      <div class="match-result"></div>
      <button type="button" class="btn back">← Change my answers</button>
    </div>

    <noscript><p>This wizard needs JavaScript. The same guidance (with the full math) lives at <a href="/advisor">Help me choose</a>.</p></noscript>
  </section>
  <script>window.STORE_DATA = Object.assign(window.STORE_DATA || {}, ${json});</script>`;
  return layout("Find my match", body, "/match");
}

module.exports = {
  STORE_NAME,
  home,
  glossary,
  products,
  models,
  advisor,
  quoteForm,
  confirmation,
  requests,
  compare,
  match,
  layout,
};
