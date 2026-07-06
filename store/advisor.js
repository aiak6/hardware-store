// advisor.js — the brain of the store.
// Turns "which model do you want?" into "here is exactly what to buy, what it
// costs, and how much power it burns" — with every number shown and explained.

const { PRODUCTS, CONVERSIONS } = require("./data");

// The memory rule, shown openly to customers.
// parameters (in billions) × 1 GB, plus 20% working room.
function memoryNeededGB(paramsBillions) {
  const base = paramsBillions * CONVERSIONS.GB_PER_BILLION; // 1 GB per billion
  const withRoom = base * (1 + CONVERSIONS.WORKING_ROOM);   // + 20%
  return {
    base,
    withRoom,
    // a human-readable breakdown of the math
    explanation:
      `${paramsBillions}B parameters × 1 GB = ${base} GB, ` +
      `plus 20% working room (${Math.round(base * 0.2)} GB) = ` +
      `${Math.round(withRoom)} GB of GPU memory required.`,
  };
}

// Given a product and how many units, total the memory / power / price.
function totalsFor(product, qty) {
  return {
    gpuMemoryGB: product.gpuMemoryGB * qty,
    watts: product.watts * qty,
    priceUSD: product.priceUSD * qty,
    totalGPUs: product.gpusInUnit * qty,
  };
}

// Find the SMALLEST honest build from a given product that meets the memory need.
// Returns null if even a sensible number of units can't do it (we cap at 32).
function minBuildFromProduct(product, needGB) {
  for (let qty = 1; qty <= 32; qty++) {
    const t = totalsFor(product, qty);
    if (t.gpuMemoryGB >= needGB) {
      return { product, qty, ...t };
    }
  }
  return null;
}

// Turn watts into feelable everyday units.
function powerInEverydayTerms(watts) {
  const homes = watts / CONVERSIONS.HOME_WATTS;
  const evPerHour = watts / 1000 / CONVERSIONS.EV_BATTERY_KWH; // kW ÷ 90 kWh
  const evPerDay = evPerHour * 24;
  // The power bill in money: kW × 24 h × 30 days × price per kWh, running 24/7.
  const monthlyCostUSD = Math.round((watts / 1000) * 24 * 30 * CONVERSIONS.ELECTRICITY_USD_PER_KWH);
  return {
    watts,
    kilowatts: watts / 1000,
    homes,
    homesRounded: Math.round(homes * 10) / 10,
    evBatteriesPerHour: Math.round(evPerHour * 100) / 100,
    evBatteriesPerDay: Math.round(evPerDay * 10) / 10,
    monthlyCostUSD,
    sentence:
      `${watts.toLocaleString()} watts — about ${Math.round(homes)} ` +
      `average homes' worth of power, running around the clock` +
      (evPerHour >= 0.1
        ? `, or roughly ${(Math.round(evPerHour * 100) / 100)} electric-car batteries of energy every hour.`
        : `.`),
  };
}

// Is this build a cluster? (more than one GPU working together)
function clusterInfo(build) {
  const isCluster = build.totalGPUs > 1;
  return {
    isCluster,
    totalGPUs: build.totalGPUs,
    note: isCluster
      ? `This build links ${build.totalGPUs} GPUs so their memory (${build.gpuMemoryGB.toLocaleString()} GB) and power pool together and act as one machine.`
      : `A single GPU — no clustering needed.`,
  };
}

const byId = (id) => PRODUCTS.find((p) => p.id === id);

// Build a full recommendation for a model, using a chosen product as the
// building block. Returns everything the page needs to render + teach.
function recommend(model, productId, { label, why }) {
  const need = memoryNeededGB(model.params);
  const build = minBuildFromProduct(byId(productId), need.withRoom);
  const power = powerInEverydayTerms(build.watts);
  const cluster = clusterInfo(build);
  return {
    label,
    why,
    model,
    memory: need,
    build,
    power,
    cluster,
    // honesty check surfaced to the customer: does the build truly cover the need?
    coversNeed: build.gpuMemoryGB >= need.withRoom,
    headroomGB: build.gpuMemoryGB - Math.round(need.withRoom),
  };
}

// ---------------------------------------------------------------------------
// The recommended minimum build for each model (used on the Models page).
// Chosen to be the smallest HONEST build — memory actually covers the need.
// ---------------------------------------------------------------------------
function minimumBuildForModel(model) {
  const need = memoryNeededGB(model.params);
  // Pick a sensible building block by model size.
  let productId;
  if (need.withRoom <= 384) productId = "rtx-pro-6000";     // ≤ 4 workstation cards
  else if (need.withRoom <= 1128) productId = "h200-141";   // one DGX H200 node's worth
  else productId = "h200-141";                              // multiple H200s (cluster)
  const build = minBuildFromProduct(byId(productId), need.withRoom);
  return {
    model,
    memory: need,
    build,
    power: powerInEverydayTerms(build.watts),
    cluster: clusterInfo(build),
    coversNeed: build.gpuMemoryGB >= need.withRoom,
    headroomGB: build.gpuMemoryGB - Math.round(need.withRoom),
  };
}

// ---------------------------------------------------------------------------
// The two guided journeys (requirement #4).
// ---------------------------------------------------------------------------
// SMALL STARTUP: run ONE big open model as cheaply as it can HONESTLY be run.
// → smallest, most affordable model on the cheapest memory-per-dollar building block.
function startupRecommendation() {
  const { MODELS } = require("./data");
  const model = MODELS.reduce((a, b) => (a.params <= b.params ? a : b)); // smallest model
  return recommend(model, "rtx-pro-6000", {
    label: "For a small startup",
    why:
      "You want to run one capable open model for your product, as cheaply as it can be run without lying about the memory. We pick the friendliest big model and the cheapest cards that honestly hold it — three RTX PRO 6000s giving a 288 GB pool for a 235B model that needs 282 GB.",
  });
}

// MID-SIZE COMPANY: more users, more traffic, room to grow.
// → a larger model on real datacenter nodes with genuine interconnect + headroom.
function midsizeRecommendation() {
  const { MODELS } = require("./data");
  const model = MODELS.find((m) => m.id === "deepseek-v3-671b");
  return recommend(model, "h200-141", {
    label: "For a mid-size company",
    why:
      "More users and more traffic mean you need real datacenter GPUs with fast interconnect, plus headroom to grow. We run a 671B model on six H200s (846 GB pooled over NVLink in a DGX-class node) — serious capacity that truly clusters, not a pile of desktop cards.",
  });
}

module.exports = {
  memoryNeededGB,
  totalsFor,
  minBuildFromProduct,
  powerInEverydayTerms,
  clusterInfo,
  recommend,
  minimumBuildForModel,
  startupRecommendation,
  midsizeRecommendation,
};
