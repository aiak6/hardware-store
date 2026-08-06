// server.js — Aiturgan's Rack & Reason. Express store on port 8080.
// Separate Postgres database; never touches the investment app on port 80.

const express = require("express");
const path = require("path");
const db = require("./db");
const data = require("./data");
const advisor = require("./advisor");
const view = require("./render");

const app = express();
const PORT = process.env.PORT || 8080;
app.set("trust proxy", "loopback"); // nginx sits in front on this host

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const send = (res, html) => res.type("html").send(html);

app.get("/", (_req, res) => send(res, view.home()));

app.get("/products", (_req, res) => send(res, view.products(data.PRODUCTS)));

app.get("/models", (_req, res) => {
  const recs = data.MODELS.map((m) => advisor.minimumBuildForModel(m));
  send(res, view.models(recs, data.PRODUCTS));
});

app.get("/advisor", (_req, res) => {
  send(res, view.advisor(advisor.startupRecommendation(), advisor.midsizeRecommendation()));
});

// Interactive side-by-side hardware comparison.
app.get("/compare", (_req, res) => send(res, view.compare(data.PRODUCTS)));

// The plain-words dictionary — the whole GLOSSARY on one teachable page.
app.get("/glossary", (_req, res) => send(res, view.glossary()));

// "Find my match" — 3-question wizard that ends in an honest model + build pick.
app.get("/match", (_req, res) => {
  const map = { qwen: "qwen3-235b", deepseek: "deepseek-v3-671b", kimi: "kimi-k2-1000b" };
  const matches = {};
  for (const [key, id] of Object.entries(map)) {
    const model = data.MODELS.find((m) => m.id === id);
    const rec = advisor.minimumBuildForModel(model);
    matches[key] = {
      modelName: model.name,
      params: model.params,
      summary: model.summary,
      needGB: Math.round(rec.memory.withRoom),
      qty: rec.build.qty,
      productName: rec.build.product.name,
      buildGB: rec.build.gpuMemoryGB,
      priceUSD: rec.build.priceUSD,
      watts: rec.build.watts,
      homes: rec.power.homesRounded,
      quoteUrl: `/quote?model=${encodeURIComponent(model.id)}&type=${encodeURIComponent("Find my match")}`,
    };
  }
  send(res, view.match(matches));
});

// Quote form — prefilled from a model + customer type when provided.
app.get("/quote", (req, res) => {
  const model = data.MODELS.find((m) => m.id === req.query.model);
  let rec = null;
  if (model) {
    // If this came from a journey, reuse that journey's build; else min build.
    if (req.query.type && /startup/i.test(req.query.type)) rec = advisor.startupRecommendation();
    else if (req.query.type && /mid/i.test(req.query.type)) rec = advisor.midsizeRecommendation();
    else rec = advisor.minimumBuildForModel(model);
  }
  // No build chosen (e.g. the nav button): offer the three honest builds
  // as pickable cards so the store's main CTA never lands on a blank form.
  const pickerRecs = model ? null : data.MODELS.map((m) => advisor.minimumBuildForModel(m));
  send(res, view.quoteForm(model, rec, req.query.type, pickerRecs));
});

// Basic abuse protection: max 5 quote submissions per IP per 10 minutes,
// plus an invisible honeypot field that only bots fill in.
const quoteHits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (quoteHits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  quoteHits.set(ip, recent);
  return recent.length > 5;
}

// Save a quote request to Postgres, confirm with a request number.
app.post("/quote", async (req, res) => {
  if (req.body.website) {
    // honeypot tripped — humans never see this field
    return res.status(400).type("html").send(
      view.layout("Blocked", `<section class="card"><h1>That looked automated 🤖</h1><p>If you're a real customer, go back and try again — leave the hidden field alone.</p><div class="cta-row"><a class="btn primary" href="javascript:history.back()">← Back to the form</a></div></section>`, "/advisor")
    );
  }
  if (rateLimited(req.ip)) {
    return res.status(429).type("html").send(
      view.layout("Slow down", `<section class="card"><h1>Easy there ⚡</h1><p>That's a lot of quote requests from one connection. Give it a few minutes and try again.</p><div class="cta-row"><a class="btn ghost" href="/">Back to the store</a></div></section>`, "/advisor")
    );
  }
  try {
    const row = await db.saveRequest({
      customer_name: (req.body.customer_name || "").trim().slice(0, 120),
      contact: (req.body.contact || "").trim().slice(0, 160),
      customer_type: (req.body.customer_type || "").slice(0, 80),
      model_name: (req.body.model_name || "").slice(0, 80),
      build_summary: (req.body.build_summary || "").slice(0, 240),
      total_price: req.body.total_price ? parseInt(req.body.total_price, 10) : null,
      total_watts: req.body.total_watts ? parseInt(req.body.total_watts, 10) : null,
    });
    send(res, view.confirmation(row));
  } catch (e) {
    console.error("Failed to save request:", e);
    res.status(500).type("html").send(
      view.layout("Error", `<section class="card"><h1>Something went wrong</h1><p>We couldn't save your request — nothing was charged and nothing was lost. Go back and try submitting again.</p><div class="cta-row"><a class="btn primary" href="javascript:history.back()">← Back to the form</a><a class="btn ghost" href="/">Home</a></div></section>`, "/advisor")
    );
  }
});

// Received requests list.
app.get("/requests", async (_req, res) => {
  try {
    const rows = await db.listRequests();
    send(res, view.requests(rows));
  } catch (e) {
    console.error("Failed to list requests:", e);
    res.status(500).type("html").send(
      view.layout("Error", `<section class="card"><h1>The request book is briefly unavailable</h1><p class="muted">We couldn't reach the database just now. The rest of the store works fine — try this page again in a minute.</p><div class="cta-row"><a class="btn primary" href="/requests">Try again</a><a class="btn ghost" href="/">Back to the store</a></div></section>`, "/requests")
    );
  }
});

// Simple health check for the inspector / uptime checks.
app.get("/health", (_req, res) => res.json({ ok: true, store: view.STORE_NAME }));

// 404 — a friendly dead end that routes people back into the store.
app.use((req, res) => {
  res.status(404).type("html").send(
    view.layout("Page not found", `
    <section class="card confirm">
      <h1>404 — that aisle doesn't exist</h1>
      <p class="muted">There's no page at <code>${req.path.replace(/[<>"&]/g, "")}</code>. But the hardware is real and this way:</p>
      <div class="cta-row">
        <a class="btn primary" href="/">Back to the store</a>
        <a class="btn" href="/products">Browse the hardware</a>
        <a class="btn ghost" href="/match">Find my match</a>
      </div>
    </section>`, "/")
  );
});

db.init()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`${view.STORE_NAME} is live on port ${PORT}`)
    );
  })
  .catch((e) => {
    console.error("DB init failed — is Postgres running and DATABASE_URL set?", e);
    // Still start the server so the shop is browsable; /requests will show an error.
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`${view.STORE_NAME} live on ${PORT} (WARNING: DB not initialised)`)
    );
  });
