# The brief — paste this into Claude Code (run `/model sonnet` first)

> Ready to paste as-is. Server IP and SSH line are filled in below.

---

You are my build partner. We are opening a real, live AI hardware store on my EC2 server,
and I will direct you the whole way. Build on the server over SSH; I'm directing from my
laptop.

**SSH to the server:** `ssh -i ~/.ssh/hardware-store.pem ec2-user@54.158.240.124`
(The server is **Amazon Linux** — log in as `ec2-user`, and install Node.js and Postgres
with `dnf`, not `apt`. Start Postgres and enable it on boot before creating the database.)

## Who I am and what we're building
The store is called **"Aiturgan's Rack & Reason"** — my name must appear in the store's
name on every page, because that's what makes the work mine. It sells real NVIDIA hardware
and, more importantly, it **teaches**: a customer who doesn't know what GPU memory is
should walk out understanding exactly what to buy and why. Every single number in the
store (price, GPU memory, CPU, RAM, watts, parameters) appears next to a plain-words
explanation of what it means and when it matters.

The tone is a sleek, dark, modern tech store — think a datacenter product page, NVIDIA-green
accents on a near-black background. Professional and clean.

## Where it runs (respect these exactly)
- Put the store on **port 8080**. My investment app already owns port 80 — **do not touch
  it or its database.** When you're done it must still work; I will open it to check.
- Give the store its **own new Postgres database** (call it `rack_and_reason`). Never reuse
  or modify the investment app's database.
- The store must **keep running after I log out and after a reboot** — set it up with pm2
  (`pm2 startup && pm2 save`) or a systemd service so it survives both.

## The seven things the store MUST do (this is the grading rubric)
1. **Live on the internet with my name over the door.** Reachable at
   `http://54.158.240.124:8080`, and "Aiturgan" is in the store name on the front page.
2. **Sells real hardware with real numbers.** Stock a product line from a desktop card up
   to a full datacenter rack. Use these real, verified products (prices/power are real —
   keep them, don't invent new ones):
   - **RTX 5090** — 32 GB, 575 W, ~$1,999 (entry desktop card)
   - **RTX PRO 6000 Blackwell** — 96 GB, 600 W, ~$8,500 (workstation card)
   - **H100 (80 GB SXM)** — 80 GB, 700 W, ~$28,000 (datacenter GPU)
   - **H200 (141 GB)** — 141 GB, 700 W, ~$35,000 (datacenter GPU)
   - **DGX H200 (8× H200 node)** — 1,128 GB pooled, ~10.2 kW, ~$400,000 (server node)
   - **GB300 NVL72 rack** — 72 GPUs, ~20.7 TB, 135 kW, ~$3.5M (full rack)
   Each product shows its specs, price, and power — and next to every number, a plain-words
   explanation.
3. **Advises on real models.** Advise on these three big open-source models from the
   arena.ai agent leaderboard (Open Source filter). For each, show **the minimum setup a
   customer must buy to run it**, with the memory math visible on the page:
   - **Qwen3-235B** — 235B params, Apache 2.0 → 235 × 1 GB + 20% = **282 GB** needed
   - **DeepSeek-V3** — 671B params, MIT → **805 GB** needed
   - **Kimi K2** — 1000B params, modified MIT → **1,200 GB** needed
   The rule, shown openly: **parameters (in billions) × 1 GB, plus 20% working room.**
   Look these up to confirm the parameter counts, then I will double-check them myself.
4. **Guides both customers.** A "help me choose" path with two doors:
   - **Small startup** — run ONE big open model as cheaply as it can *honestly* be run.
     (Qwen3-235B on 3× RTX PRO 6000 = 288 GB pool, covers the 282 GB need.)
   - **Mid-size company** — more users, more traffic, room to grow.
     (DeepSeek-V3 on 6× H200 = 846 GB pooled over NVLink, covers the 805 GB need.)
   Each path ends in a recommended build with a total price.
5. **Explains clusters.** When a build combines machines, show the combined memory, power,
   and price, a one-line definition of a cluster, AND the honest difference between real
   datacenter clustering (NVLink/InfiniBand, GPUs truly act as one) and a pile of desktop
   cards (memory adds up on paper, but they talk too slowly to run one big model well).
6. **Makes power real.** Every build shows watts AND what that equals in everyday life.
   Conversions: an average home draws ~**1,200 watts** around the clock; a typical EV
   battery holds ~**90 kWh**. (Sanity check: the 135 kW rack = ~112 homes.)
7. **Takes quote requests.** A customer submits "I want this build" with their name and
   contact — no payment, no accounts. Save it in **Postgres**, confirm on-screen with a
   **request number**, and list received requests at **`/requests`**.

## How to work with me
Build it step by step and show me each page as it comes up. When a page appears, I'll
check the numbers by hand before we move on. If any explanation doesn't actually teach me
the concept, we rewrite it until it does — that's the whole point of the store.

> Optional shortcut: I have a complete, tested reference implementation of exactly this
> store (Node/Express + Postgres, same products, same models, same math). If it's on the
> server I can point you at it to adapt; otherwise build fresh from this brief.
