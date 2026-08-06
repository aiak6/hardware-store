// data.js — the shop's stock and the models it advises on.
// Every number here is real and was verified against public sources in July 2026.
// Every number also carries a plain-words explanation, because this store TEACHES.

// ---------------------------------------------------------------------------
// Everyday-life conversions (from the assignment brief) so power feels real.
// ---------------------------------------------------------------------------
const CONVERSIONS = {
  HOME_WATTS: 1200,      // an average home draws ~1,200 watts around the clock
  EV_BATTERY_KWH: 90,    // a typical electric-car battery holds ~90 kWh
  GB_PER_BILLION: 1,     // memory rule of thumb: 1 billion parameters ≈ 1 GB
  WORKING_ROOM: 0.20,    // add 20% headroom for the "working room" a model needs
  ELECTRICITY_USD_PER_KWH: 0.17, // ~average US electricity price, mid-2026
};

// ---------------------------------------------------------------------------
// Plain-words glossary. Shown next to every number across the store.
// If these can't teach the owner, they can't teach a customer.
// ---------------------------------------------------------------------------
const GLOSSARY = {
  gpuMemory: {
    term: "GPU memory (VRAM)",
    plain:
      "The one number that decides everything. The whole model must fit inside the graphics cards' own memory, all at once. If it doesn't fit, it doesn't run. Not slowly — not at all.",
    picture:
      "A model is a set of encyclopedias and GPU memory is the shelf. If the shelf is too short for the whole set, you can't look anything up.",
    whenItMatters:
      "Always. Check it first, every time. Bigger model = bigger shelf, no exceptions.",
  },
  gpuCount: {
    term: "Number of GPUs",
    plain:
      "Big models don't fit on one card, so you link a few cards and their memory adds up. Four 96 GB cards act like one 384 GB pool. More cards can also serve more people at once.",
    picture:
      "Pushing desks together to make one big table.",
    whenItMatters:
      "When one card is too small for the model, or too slow for all your users.",
  },
  cpu: {
    term: "CPU",
    plain:
      "The computer's general manager. It runs the operating system and hands work to the GPUs — but the heavy AI thinking happens on the GPUs, not here.",
    picture:
      "The CPU is the waiter, the GPUs are the kitchen. A better waiter doesn't cook the meal faster.",
    whenItMatters:
      "It never decides whether a model fits. Don't overpay here.",
  },
  systemRam: {
    term: "System RAM",
    plain:
      "The computer's own short-term memory, separate from GPU memory. It helps move the model around and keeps the rest of the machine running — but the model does not run in it.",
    picture:
      "The loading dock, not the shelf. Goods pass through; they don't live there.",
    whenItMatters:
      "Nice to have plenty. But it can never stand in for GPU memory — not one gigabyte of it.",
  },
  watts: {
    term: "Power draw (watts)",
    plain:
      "How much electricity the machine drinks every second it's switched on. You pay for it on every power bill, and all of it turns into heat you then have to cool away.",
    picture:
      "One 600 W card burns like ten old 60 W light bulbs — all day, every day.",
    whenItMatters:
      "Every day you own the machine. Cheap to buy can still be expensive to run.",
  },
  electricityCost: {
    term: "Electricity cost per month",
    plain:
      "The watts, turned into money. We assume the machine runs day and night at about $0.17 per kilowatt-hour (an average US price). Your local rate will differ a little.",
    picture:
      "Watts are the appetite; this is the grocery bill.",
    whenItMatters:
      "When comparing builds. Over a few years, the power bill can rival the sticker price.",
  },
  price: {
    term: "Price",
    plain:
      "What you pay once, up front, to own the hardware. Electricity, cooling, and a room to put it in are extra — and they never stop.",
    picture:
      "The price is the puppy. The power bill is the dog food.",
    whenItMatters:
      "At purchase — but always read it next to the power draw.",
  },
  parameters: {
    term: "Parameters (the 'B' in the name)",
    plain:
      "How big the model is: billions of little numbers it learned during training. 'Qwen3-235B' means 235 billion of them. Bigger usually means smarter — and always means more GPU memory.",
    picture:
      "Parameters are the pages; the 'B' on the spine tells you how big a shelf you'll need.",
    whenItMatters:
      "Start here. The B-number tells you the memory, and the memory tells you the machine.",
  },
  cluster: {
    term: "Cluster",
    plain:
      "Several machines wired together with very fast links, so they act like one much bigger machine — pooling their memory and their effort.",
    picture:
      "A rowing crew, not a crowd. Eight rowers only count as one boat if they stroke in perfect time.",
    whenItMatters:
      "When one machine can't hold the model. See the honest note about real clusters vs. a pile of desktop cards.",
  },
  homes: {
    term: "Homes-worth of power",
    plain:
      "A way to feel a wattage instead of just reading it. An average home draws about 1,200 watts around the clock — so a 135,000-watt rack burns power like about 112 homes, all day, every day.",
    whenItMatters:
      "When you're deciding whether your building (and budget) can even feed the machine.",
  },
  evBattery: {
    term: "EV-batteries per day",
    plain:
      "Another way to feel it: a typical electric-car battery holds about 90 kWh. A big machine can drain several of them every single day.",
    whenItMatters:
      "When you want a gut sense of energy over time, not just an instant number.",
  },
};

// The honest cluster note the store must show (requirement #5).
const CLUSTER_TRUTH = {
  definition:
    "A cluster is several machines linked with fast networking so their GPU memory and compute pool together and act like one bigger machine.",
  realVsPile:
    "Here's the honest difference. Real datacenter clustering (like an NVL72 rack or DGX nodes joined by NVLink and InfiniBand) connects GPUs with links measured in hundreds of gigabytes to terabytes per second, so 72 GPUs genuinely act like one giant GPU. A 'pile of desktop cards' — say sixteen RTX 5090s in consumer machines wired over ordinary networking — has the memory on paper, but the cards talk to each other so slowly that for one big model they spend more time waiting than working. The memory adds up; the teamwork doesn't. For serving one large model, purpose-built datacenter interconnect is why the expensive racks exist. Desktop cards are wonderful for one card's worth of work — not for pretending to be a datacenter.",
};

// ---------------------------------------------------------------------------
// THE STOCK — real NVIDIA hardware, desktop card → datacenter rack.
// Prices/power verified against public sources, July 2026. See README for links.
// gpuMemoryGB is the usable GPU (VRAM) pool the unit contributes.
// ---------------------------------------------------------------------------
const PRODUCTS = [
  {
    id: "rtx-5090",
    bestFor: "One person learning, building, and running small models at home.",
    year: 2025,
    curatorNote:
      "The people's exhibit. Most visitors' first — and often only — acquisition.",
    name: "NVIDIA GeForce RTX 5090",
    tier: "Desktop card",
    blurb: "The entry point. A single desktop card for experimenting and small models.",
    priceUSD: 1999,
    gpuMemoryGB: 32,
    watts: 575,
    cpuNote: "Slots into a normal desktop PC — your own CPU/RAM.",
    memoryType: "32 GB GDDR7",
    isNode: false,      // a single card, not a complete server
    gpusInUnit: 1,
    realWorldNote:
      "Launch price $1,999 (Jan 2025), 32 GB, 575 W. Great for one person; far too small for a 100B+ model on its own.",
    photo: {
      src: "/img/rtx-5090.png",
      alt: "Palit GeForce RTX 5090 GameRock graphics card, three-fan cooler",
      note: "Palit's GameRock edition of the RTX 5090 pictured.",
      credit: "PantheraLeo1359531", license: "CC BY 4.0",
      creditUrl: "https://commons.wikimedia.org/wiki/File:Palit_GeForce_RTX_5090_Gamerock_20250530_HOF4166_RAW-Export.png",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    },
  },
  {
    id: "rtx-pro-6000",
    bestFor: "A startup's first serious AI machine — buy three, run a 235B model.",
    year: 2025,
    curatorNote:
      "The connoisseur's shortcut: three of these quietly equal one very large machine.",
    name: "NVIDIA RTX PRO 6000 Blackwell",
    tier: "Workstation card",
    blurb: "A professional card with lots of memory — the honest cheapest way to reach big-model memory by ganging a few together.",
    priceUSD: 8500,
    gpuMemoryGB: 96,
    watts: 600,
    cpuNote: "Goes in a workstation or server chassis.",
    memoryType: "96 GB GDDR7 ECC",
    isNode: false,
    gpusInUnit: 1,
    realWorldNote:
      "~$8,500 in shops, 96 GB, 600 W. Three of these pool 288 GB — honestly enough for a 235B model (which needs 282 GB).",
  },
  {
    id: "h100-80",
    bestFor: "Getting real datacenter power at last-generation prices.",
    year: 2022,
    curatorNote:
      "The workhorse of the first AI gold rush. Already a period piece; still pulling.",
    name: "NVIDIA H100 (80 GB SXM)",
    tier: "Datacenter GPU",
    blurb: "The workhorse datacenter GPU of the last generation. Sold as part of a server.",
    priceUSD: 28000,
    gpuMemoryGB: 80,
    watts: 700,
    cpuNote: "Installed in a datacenter server (e.g., an 8-GPU HGX node).",
    memoryType: "80 GB HBM3",
    isNode: false,
    gpusInUnit: 1,
    realWorldNote:
      "~$25,000–$30,000 per GPU, 80 GB, 700 W. Eight of them = 640 GB in one node.",
    photo: {
      src: "/img/h100-80.jpg",
      alt: "Four NVIDIA H100 PCIe cards standing in a row, gold shrouds",
      note: "Four H100s in the flesh — about $110,000 on this table.",
      credit: "Geekerwan", license: "CC BY 3.0",
      creditUrl: "https://commons.wikimedia.org/wiki/File:NVIDIA_H100_(%E6%9E%81%E5%AE%A2%E6%B9%BEGeekerwan)_011.png",
      licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
    },
  },
  {
    id: "h200-141",
    bestFor: "Running one big model properly, with room to breathe.",
    year: 2024,
    curatorNote:
      "The same frame as the H100, three-quarters more memory — refinement, not spectacle.",
    name: "NVIDIA H200 (141 GB)",
    tier: "Datacenter GPU",
    blurb: "More memory than the H100 at the same power — the sweet spot for very large models.",
    priceUSD: 35000,
    gpuMemoryGB: 141,
    watts: 700,
    cpuNote: "Installed in a datacenter server (e.g., an 8-GPU HGX/DGX node).",
    memoryType: "141 GB HBM3e",
    isNode: false,
    gpusInUnit: 1,
    realWorldNote:
      "~$30,000–$40,000 per GPU, 141 GB, 700 W — same power as the H100 but 76% more memory.",
  },
  {
    id: "dgx-h200",
    bestFor: "A company that wants one plug-in box that just works.",
    year: 2024,
    curatorNote:
      "Eight minds in one case — the first exhibit that is a machine room, not a machine.",
    name: "NVIDIA DGX H200 (8× H200 node)",
    tier: "Server node",
    blurb: "A complete, ready-to-run server: eight H200s wired together with NVLink. One box, 1,128 GB pooled.",
    priceUSD: 400000,
    gpuMemoryGB: 1128,       // 8 × 141
    watts: 10200,            // full system, not just GPUs
    cpuNote: "Includes two server CPUs and 2 TB of system RAM — plug in and go.",
    memoryType: "8 × 141 GB HBM3e (1,128 GB pooled via NVLink)",
    isNode: true,
    gpusInUnit: 8,
    realWorldNote:
      "~$400,000+ for a complete DGX/HGX H200 node. ~10.2 kW at the wall (GPUs + CPUs + cooling). The eight GPUs share memory over NVLink, so they truly act as one.",
    photo: {
      src: "/img/dgx-h200.jpg",
      alt: "An 8-GPU NVIDIA HGX baseboard with massive heatsinks on a workbench",
      note: "Honest note: this is the newer HGX B200 8-GPU board — the H200 node looks nearly identical, but nobody has freely photographed one yet.",
      credit: "Pokiiri", license: "CC BY-SA 4.0",
      creditUrl: "https://commons.wikimedia.org/wiki/File:Nvidia_DGX-B200-HGX.jpg",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    },
  },
  {
    id: "gb300-nvl72",
    bestFor: "Serving AI to thousands of users at once — the whole store's ceiling.",
    year: 2025,
    curatorNote:
      "The apex object of the collection. The curator advises most visitors to admire, not acquire.",
    name: "NVIDIA GB300 NVL72 (Blackwell Ultra rack)",
    tier: "Datacenter rack",
    blurb: "The top of the shop. A full rack: 72 Blackwell Ultra GPUs acting as one enormous machine.",
    priceUSD: 3500000,
    gpuMemoryGB: 20700,      // ~20.7 TB
    watts: 135000,           // 135 kW
    cpuNote: "36 Grace CPUs, NVIDIA networking, liquid-cooled — one whole rack working as a single machine.",
    memoryType: "72 × 288 GB HBM3e (~20.7 TB pooled)",
    isNode: true,
    gpusInUnit: 72,
    realWorldNote:
      "~$3.5M per rack, 72 GPUs, ~20.7 TB memory, 135 kW. That 135 kW is about 112 homes' worth of power, running non-stop.",
    photo: {
      src: "/img/gb300-nvl72.jpg", tall: true,
      alt: "A full NVIDIA NVL72 rack with rows of gold compute trays",
      note: "Honest note: pictured is the previous-generation GB200 NVL72 — the same 72-GPU rack design this GB300 upgrades.",
      credit: "Pokiiri", license: "CC BY-SA 4.0",
      creditUrl: "https://commons.wikimedia.org/wiki/File:Nvidia_DGX_GB200.jpg",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    },
  },
];

// ---------------------------------------------------------------------------
// THE MODELS — 3 big open-source models from the arena.ai agent leaderboard
// (Open Source filter). Parameter counts are the size to run.
// NOTE TO OWNER: the leaderboard changes — re-verify these on the live board
// before opening day. Licenses shown are MIT / Apache / modified-MIT (all open).
// ---------------------------------------------------------------------------
const MODELS = [
  {
    id: "qwen3-235b",
    name: "Qwen3-235B",
    params: 235,             // billions
    license: "Apache 2.0 (open source)",
    maker: "Alibaba",
    summary:
      "A strong, efficient open model — the friendliest of the three to run. The right first big model for a startup.",
  },
  {
    id: "deepseek-v3-671b",
    name: "DeepSeek-V3",
    params: 671,
    license: "MIT (open source)",
    maker: "DeepSeek",
    summary:
      "A heavyweight open model that is very good at 'agent' work — using tools and acting on its own. Needs a full datacenter server.",
  },
  {
    id: "kimi-k2-1000b",
    name: "Kimi K2",
    params: 1000,
    license: "Modified MIT (open source, commercial-friendly)",
    maker: "Moonshot AI",
    summary:
      "A trillion-parameter open model. Serious capacity for a company that wants top-tier quality and room to grow.",
  },
];

module.exports = {
  CONVERSIONS,
  GLOSSARY,
  CLUSTER_TRUTH,
  PRODUCTS,
  MODELS,
};
