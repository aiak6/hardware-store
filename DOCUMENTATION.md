# Aiturgan's Rack & Reason — The Full Story, in Simple Words

This document explains everything: why this store exists, what a GPU is and why
it matters, what we built, how we built it, why we made each decision, and what
you get out of it. Written so that future-you (or anyone) can read it cold and
understand it all.

---

## Part 1 — Why does this store exist?

Right now there is a gold rush in AI. Powerful AI models (like the ones behind
chatbots) are being given away for free as "open source" — anyone can download
one and run it. But there's a catch: **running** a big model needs very
expensive, very confusing computer hardware. Companies want to do it, but the
spec sheets read like alien language.

Old wisdom about gold rushes: the people who reliably got rich weren't the gold
diggers — they were the ones **selling shovels**. This store sells the shovels
of the AI gold rush: NVIDIA hardware, from a $1,999 desktop card up to a
$3,500,000 datacenter rack.

But anyone can list prices. What makes this store different is one idea:

> **A store that can't teach you shouldn't sell to you.**

Every number in the store — price, memory, watts — sits next to a plain-words
explanation of what it means and when it matters. A customer walks in confused
and walks out understanding what to buy and why.

---

## Part 2 — What is a GPU, and why is it the whole story?

**CPU vs GPU, in one picture:** a CPU (the "main brain" of every computer) is
like one brilliant professor — it can do anything, one thing at a time, very
fast. A **GPU** (Graphics Processing Unit) is like a stadium full of ten
thousand students who can each do simple math at the same time.

GPUs were invented to draw video-game graphics (that's the G), because drawing
millions of pixels means doing millions of small calculations at once. Then
someone noticed: **AI is also just millions of small calculations at once.**
That's why AI runs on GPUs, why NVIDIA became one of the most valuable
companies on Earth, and why this store exists.

### The one number that decides everything: GPU memory

An AI model is basically a giant list of learned numbers called **parameters**
(the "weights" — the model's brain). A model named `Qwen3-235B` has **235
billion** parameters — that's what the "B" means.

Here's the rule that runs the entire store:

> **The model's whole brain must fit inside the GPU's own memory at once —
> or the model does not run. Not slowly. Not at all.**

Regular computer memory (RAM) can't substitute. A fast CPU can't substitute.
Only GPU memory (also called VRAM) counts.

The math is beautifully simple:

```
parameters (in billions) × 1 GB  +  20% working room  =  GPU memory you must buy
```

Example — Qwen3-235B:
- 235 billion parameters × 1 GB = 235 GB
- plus 20% working room (+47 GB)
- = **282 GB of GPU memory required**

No single card has 282 GB. The biggest desktop card (RTX 5090) has 32 GB.
So you link several GPUs together — a **cluster** — and their memory pools up.
Three RTX PRO 6000 cards (96 GB each) = 288 GB → the model fits. That's the
store's actual startup recommendation, and now you know exactly where the
number comes from.

### The other numbers, quickly

- **Watts (power draw)** — electricity the machine burns every second it's on.
  You pay this forever, not once. To make it feel real: an average home draws
  about **1,200 watts** around the clock, so a 135,000-watt GB300 rack burns
  power like **~112 homes**. That's why every build in the store shows
  "≈ N homes."
- **Price** — what you pay once. Always read it next to watts: cheap-to-buy
  can be expensive-to-run.
- **Real cluster vs. a pile of cards** — the honest trap. Sixteen desktop
  cards have lots of memory *on paper*, but they talk to each other too slowly
  to run one big model together. Real datacenter gear (NVLink, InfiniBand)
  connects GPUs so fast they act like one giant GPU. The memory adds up;
  the teamwork is what you're really paying for.

---

## Part 3 — What was the goal of the assignment?

Three layers, from surface to deep:

1. **Surface:** build a real store, live on the internet, on your own server,
   with your name over the door — and pass an AI inspector that checks seven
   specific things (live + named, real products, real models with visible
   math, two customer journeys, cluster explanation, power in everyday terms,
   quote requests saved in a real database).

2. **Middle:** learn the hardware ideas above — well enough that your own
   store's explanations make sense **to you**. The store educates its owner;
   that's the test of whether it's done.

3. **Deep:** last time in class, someone handed you a working prompt and you
   watched it work. This time **you write the brief, you direct the build,
   you check every number**. The real skill being graded is directing an AI
   and never trusting it blindly — "never trust, always check."

---

## Part 4 — What we built

A complete store at **https://store.aiturgan.space** called
**Aiturgan's Rack & Reason** ("Rack" = the hardware, "Reason" = the teaching).

| Page | What it does |
|---|---|
| **Home** | The promise: pick a model, we tell you what to buy, what it costs, what it burns — all explained. |
| **Hardware** (`/products`) | Six real NVIDIA products, desktop card → datacenter rack. Every number has a "What does this mean?" explanation. |
| **Compare** (`/compare`) | Interactive: tap products on/off, animated bars compare memory, price, power, and memory-per-$1,000. |
| **Run a model** (`/models`) | Three big open models (Qwen3-235B, DeepSeek-V3 671B, Kimi K2 1000B) with the memory math shown in the open and the minimum honest build for each. |
| **Find my match** (`/match`) | A 3-question wizard (what are you building / budget / growth) ending in an honest recommendation — including an "honesty note" when your budget can't afford your ambitions. |
| **Help me choose** (`/advisor`) | The two doors the assignment requires: small startup ($25,500 build) and mid-size company ($210,000 build), each with full teaching. |
| **Quote request** (`/quote`) | Customer submits name + contact — no payment, no accounts. Saved to the database; they get a request number. |
| **Requests** (`/requests`) | Every saved request, newest first, with contact details masked for privacy (`b•••@gmail.com`). |

Design: a "datacenter blueprint" look — deep blue night background with a faint
engineering grid, animated AI chips in the margins (labeled GB300, H200, 235B…)
with circuit traces and little light pulses traveling along them like data,
numbers in a monospace font like a real spec sheet, and animations everywhere
that respect users who prefer reduced motion. It works on phones too.

---

## Part 5 — How it works (the machinery, simply)

When someone visits the store, this happens:

```
Visitor's browser
   │  asks for https://store.aiturgan.space
   ▼
DNS (Route 53)  — the internet's phone book: turns the name into 54.158.240.124
   ▼
Your EC2 server (a rented computer in Amazon's datacenter, always on)
   │
   ├─ nginx        — the front door: holds the HTTPS certificate (the padlock),
   │                 and forwards visitors to the store app
   ├─ the store    — a Node.js program (Express) that builds every page;
   │                 runs on port 8080; kept alive by pm2
   └─ PostgreSQL   — the database; one table (quote_requests) stores
                     every customer request permanently
```

**The pieces, in one line each:**
- **EC2** — Amazon rents you a computer that never sleeps, so the store stays
  up after you close your laptop.
- **Port** — a numbered door on a server. The store listens on door 8080 (the
  assignment reserves door 80 for your investment app; on this fresh server,
  nginx uses 80/443 to serve the same store under the nice domain name).
- **DNS / subdomain** — `store.aiturgan.space` is just an easy-to-remember
  alias for the server's IP address.
- **HTTPS / Let's Encrypt** — a free certificate that encrypts traffic and
  gives the browser padlock; it renews itself automatically.
- **Node.js + Express** — the program that receives "show me /products" and
  answers with the HTML page.
- **PostgreSQL** — a serious database. When a customer submits a quote, the
  row goes here — which is why the request survives restarts and reboots.
- **pm2** — a babysitter for the store program: restarts it if it crashes,
  starts it automatically when the server reboots.

**The important numbers live in one file** (`store/data.js`) — products,
prices, watts, models, and every plain-words explanation. Change a price
there, restart, done. The advisor math (`store/advisor.js`) computes memory
needs, minimum builds, cluster totals, and homes-worth-of-power from that data,
so a number is never typed twice.

---

## Part 6 — What we actually did, step by step, and why

1. **Researched real numbers first.** Prices, memory, and power for six real
   NVIDIA products, and parameter counts for three leaderboard models —
   because a store with invented numbers is not a store. Sanity-checked
   against the assignment's own hint: 135,000 W ÷ 1,200 W = 112.5 ≈ "112
   homes." It matched.

2. **Built the store as small, honest pieces** — data (with explanations),
   advisor math, database layer, page renderer, server — plus an automated
   test (16 checks) that exercises every page and the whole quote flow.

3. **Prepared the server.** Opened door 8080 in the AWS firewall (it was
   closed — the inspector would have found a dead store), installed Node and
   PostgreSQL, created a brand-new database (`rack_and_reason`) so nothing
   else is ever touched.

4. **Deployed and made it immortal.** Copied the code up, started it under
   pm2, wired pm2 + Postgres + nginx to start at boot — then **actually
   rebooted the server to prove it**: the store came back by itself in ~10
   seconds with its data intact.

5. **Verified all seven requirements from the outside**, like the inspector
   will: name on the door, products, math on the page, both journeys, cluster
   note, homes conversion, and a real quote submitted → request #1 → visible
   at /requests → confirmed inside the database itself.

6. **Caught and fixed real mistakes** (this is the "never trust, always
   check" part in action):
   - The journey descriptions said "four cards / 384 GB" while the actual
     computed build was **three cards / 288 GB** — the prose was stale.
     Fixed everywhere, including the write-up, so words match math.
   - The comparison bars silently rendered empty (an invisible-element CSS
     bug) — found by *looking at the page on a phone*, not by tests. Fixed.
   - Your browser was showing an old cached design — fixed permanently by
     versioning the style files (`?v=8`), so every visitor always gets the
     newest look.

7. **Added the nice-to-haves**: the subdomain, free HTTPS with auto-renewal,
   the Compare page, the Find-my-match wizard, the animated chip background,
   phone-friendly layout, and masked emails on the public requests page
   (customers' contact info is nobody else's business).

---

## Part 7 — What this store gives you

- **The grade**, obviously: every one of the seven inspected behaviors is
  live and was verified end-to-end.
- **The knowledge**: you now own the mental model that most people don't —
  parameters → GPU memory → hardware → power → cost. You can read an NVIDIA
  spec sheet and know which numbers matter.
- **A real portfolio piece**: not a document, a **live product** — your name,
  your domain, HTTPS, a database, a responsive animated UI. You can show it
  to anyone: `https://store.aiturgan.space`.
- **A template for next time**: brief → build → check → deploy → verify.
  That loop is the actual skill, and it transfers to any project.

---

## Part 8 — Keeping it alive (owner's manual)

- **Leave the EC2 instance running** until the verdict arrives — the
  inspector visits like a real customer.
- **Reboot is safe** — everything restarts itself (proven).
- **Stop/Start is NOT the same as reboot** — the server gets a new IP address.
  If that happens: update the Route 53 record for `store.aiturgan.space` to
  the new IP, update the URL in GRAND-OPENING.md, and push again.
- **See the requests**: https://store.aiturgan.space/requests
- **Quick health check**: https://store.aiturgan.space/health should say
  `"ok": true`.
- **Change a price / add a product**: edit `store/data.js`, run
  `node test.js` (expect 16 passed), copy to the server, `pm2 restart
  rack-and-reason`.

---

## Mini-glossary (the simplest versions)

| Word | Simplest meaning |
|---|---|
| GPU | A chip that does millions of small calculations at once — what AI runs on. |
| GPU memory (VRAM) | The GPU's own workspace. The model's whole brain must fit in it, or nothing runs. |
| Parameters ("235B") | The learned numbers that make up a model's brain — 235 billion of them. Size of brain → size of memory needed. |
| CPU | The computer's general manager. Directs traffic; doesn't decide if a model fits. |
| RAM | The computer's short-term memory. Useful, but can't substitute for GPU memory. |
| Watts | Electricity burned per second. An average home ≈ 1,200 W around the clock. |
| Cluster | Several machines linked so fast they act like one big machine, pooling memory. |
| Server | A computer that's always on, serving a website. |
| Port | A numbered door on a server (store = 8080; web default = 80; secure web = 443). |
| DNS | The internet's phone book: name → IP address. |
| HTTPS | The padlock: encrypted traffic, proven identity. |
| Database (PostgreSQL) | Organized permanent storage — where quote requests live. |
| pm2 | The babysitter that keeps the store running and revives it after reboots. |
