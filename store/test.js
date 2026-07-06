// test.js — smoke test with an in-memory DB stub (no real Postgres needed).
// Verifies routes render and the quote flow saves + lists correctly.
const path = require("path");
const http = require("http");

// Inject an in-memory stand-in for ./db BEFORE server.js requires it.
const dbPath = require.resolve("./db");
let seq = 0;
const store = [];
require.cache[dbPath] = {
  id: dbPath, filename: dbPath, loaded: true, exports: {
    init: async () => {},
    saveRequest: async (r) => { const row = { id: ++seq, created_at: new Date(), ...r }; store.push(row); return row; },
    listRequests: async () => store.slice().reverse(),
    pool: {},
  },
};

process.env.PORT = "8099";
require("./server");

const base = "http://127.0.0.1:8099";
const get = (p) => new Promise((res) => http.get(base + p, (r) => { let d = ""; r.on("data", c => d += c); r.on("end", () => res({ code: r.statusCode, body: d })); }));
const post = (p, form) => new Promise((res) => {
  const data = new URLSearchParams(form).toString();
  const req = http.request(base + p, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", "Content-Length": Buffer.byteLength(data) } }, (r) => { let d = ""; r.on("data", c => d += c); r.on("end", () => res({ code: r.statusCode, body: d })); });
  req.end(data);
});

(async () => {
  await new Promise(r => setTimeout(r, 600));
  let pass = 0, fail = 0;
  const check = (name, cond) => { if (cond) { pass++; console.log("  ✓", name); } else { fail++; console.log("  ✗ FAIL:", name); } };

  for (const [p, must] of [
    ["/", "Rack &amp; Reason"],
    ["/products", "GeForce RTX 5090"],
    ["/products", "showcase3d"],
    ["/models", "Qwen3-235B"],
    ["/advisor", "small startup"],
    ["/quote?model=qwen3-235b&type=For%20a%20small%20startup", "Request a quote"],
    ["/compare", "compare-root"],
    ["/match", "match-root"],
    ["/health", '"ok":true'],
  ]) {
    // (models page also carries the interactive math lab — checked below)
    const r = await get(p);
    check(`GET ${p} -> 200 & contains expected`, r.code === 200 && r.body.includes(must));
  }

  // Interactive pages must embed their data for the client-side JS
  const cmp = await get("/compare");
  check("compare page embeds product data", cmp.body.includes("STORE_DATA") && cmp.body.includes("rtx-5090"));
  const mtc = await get("/match");
  check("match page embeds all three models", mtc.body.includes("Qwen3-235B") && mtc.body.includes("DeepSeek-V3") && mtc.body.includes("Kimi K2"));

  // New teaching features
  const models0 = await get("/models");
  check("models page has the interactive math lab", models0.body.includes("mathlab-root"));
  check("builds show electricity cost per month", models0.body.includes("Electricity bill"));
  check("builds show EV-battery conversion", models0.body.includes("In EV batteries"));
  const nf = await get("/definitely-not-a-page");
  check("unknown URL returns friendly 404", nf.code === 404 && nf.body.includes("aisle"));

  // Theme support: pre-paint script + toggle button in the header
  const home = await get("/");
  check("theme set before paint (head script)", home.body.includes("prefers-color-scheme: light"));
  check("theme toggle button present", home.body.includes("theme-toggle"));

  // Model math must appear in the page (282 GB for Qwen3-235B)
  const models = await get("/models");
  check("models page shows 282 GB required for 235B", models.body.includes("282 GB"));
  check("models page shows 112 homes concept somewhere on site", (await get("/")).body.includes("112 homes"));
  check("cluster honest note present", models.body.includes("pile of desktop cards"));

  // Quote flow: submit -> confirmation with request number -> appears in /requests
  const conf = await post("/quote", { customer_name: "Test Buyer", contact: "test@co.com", model_name: "Qwen3-235B", customer_type: "For a small startup", build_summary: "4 x RTX PRO 6000", total_price: 34000, total_watts: 2400 });
  check("POST /quote -> 200", conf.code === 200);
  check("confirmation shows request number #1", conf.body.includes("#1"));
  check("confirmation is a receipt", conf.body.includes("OFFICIAL QUOTE REQUEST"));
  check("builds show live burn counter", (await get("/models")).body.includes("burn-wh"));
  // Abuse protection: honeypot field rejects bot submissions
  const bot = await post("/quote", { customer_name: "Bot", contact: "b@b.b", website: "spam.example" });
  check("honeypot blocks bot submissions (400)", bot.code === 400 && bot.body.includes("automated"));

  const reqs = await get("/requests");
  check("/requests lists the saved request", reqs.body.includes("Test Buyer") && reqs.body.includes("#1"));

  console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
