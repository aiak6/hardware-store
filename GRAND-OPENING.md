# Grand opening

Fill in the sections below, commit, and push. Then keep your server running — the
inspector visits your live store to grade it, and the verdict arrives as a review on the
"Feedback" pull request in this repo, usually within about 15 minutes.

## My store

**Store URL:** https://store.aiturgan.space (also reachable at http://54.158.240.124:8080)
<!-- The store app runs on port 8080; nginx on the same instance serves it on
     ports 80/443 under the subdomain, with a Let's Encrypt certificate and an
     automatic HTTP→HTTPS redirect. If you stop/restart the instance, the public
     IP usually changes — update the Route 53 A record for store.aiturgan.space
     AND the IP here, then push again before the inspector visits. -->

**Store name:** Aiturgan's Rack & Reason

## The brief I wrote

You are my build partner. We are opening a real, live AI hardware store on my EC2 server,
and I will direct you the whole way. Build on the server over SSH; I'm directing from my laptop.

The store is called **"Aiturgan's Rack & Reason"** — my name must appear in the store's name
on every page. It sells real NVIDIA hardware and, more importantly, it **teaches**: a customer
who doesn't know what GPU memory is should walk out understanding exactly what to buy and why.
Every number in the store (price, GPU memory, CPU, RAM, watts, parameters) appears next to a
plain-words explanation of what it means and when it matters. The look is a sleek, dark, modern
tech store with NVIDIA-green accents on a near-black background.

Where it runs: the store lives on **port 8080** — my investment app owns port 80, and you must
not touch it or its database; it must still work when you're done. Give the store its own new
Postgres database (`rack_and_reason`), never the investment app's. It must keep running after I
log out and after a reboot (pm2 with `pm2 startup && pm2 save`, or systemd).

The store must do seven things:
1. Be live at http://[SERVER-IP]:8080 with "Aiturgan" in the store name.
2. Sell real hardware with real numbers — a line from a desktop card to a datacenter rack:
   RTX 5090 (32 GB, 575 W, ~$1,999); RTX PRO 6000 Blackwell (96 GB, 600 W, ~$8,500);
   H100 80 GB (700 W, ~$28,000); H200 141 GB (700 W, ~$35,000); DGX H200 8×H200
   (1,128 GB, ~10.2 kW, ~$400,000); GB300 NVL72 rack (72 GPUs, ~20.7 TB, 135 kW, ~$3.5M) —
   each with specs, price, power, and a plain-words explanation next to every number.
3. Advise on three big open-source models from the arena.ai agent leaderboard (Open Source),
   showing the minimum setup to run each with the memory math visible
   (**parameters in billions × 1 GB + 20% working room**):
   Qwen3-235B (Apache 2.0) → 282 GB; DeepSeek-V3 671B (MIT) → 805 GB;
   Kimi K2 1000B (modified MIT) → 1,200 GB.
4. Guide two customers: a small startup (run one big model as cheaply as it can honestly be
   run — Qwen3-235B on 3× RTX PRO 6000 = 288 GB against its 282 GB need) and a mid-size
   company (more users, room to grow — DeepSeek-V3 on 6× H200 = 846 GB against its 805 GB
   need), each ending in a build with a total price.
5. Explain clusters: combined memory/power/price, a one-line definition, and the honest
   difference between real datacenter clustering (NVLink/InfiniBand — GPUs act as one) and a
   pile of desktop cards (memory adds up, but they talk too slowly to run one big model well).
6. Make power real: every build shows watts AND everyday terms — an average home ≈ 1,200 W,
   an EV battery ≈ 90 kWh (so the 135 kW rack ≈ 112 homes).
7. Take quote requests: name + contact, no payment or accounts, saved in Postgres, confirmed
   on-screen with a request number, and listed at `/requests`.

Build it step by step and show me each page; I'll check the numbers by hand, and if an
explanation doesn't actually teach me the concept, we rewrite it until it does.

## What I checked before opening

* **Model math by hand — Qwen3-235B.** 235 billion parameters × 1 GB = 235 GB, plus 20%
  working room (47 GB) = **282 GB** of GPU memory required. The store's startup build is
  3 × RTX PRO 6000 (96 GB each) = **288 GB** — it genuinely covers the 282 GB need, with
  6 GB to spare, and the store shows that math right on the page.
  (I also spot-checked the rack: 135,000 W ÷ 1,200 W per home = 112.5 homes,
  which matches the store's "≈112 homes" claim.)

* **Product against the real world — NVIDIA H200.** I searched it: 141 GB of HBM3e memory,
  700 W TDP, street price roughly $30,000–$40,000. The store lists 141 GB, 700 W, ~$35,000 —
  real memory, real power, real price. Not fantasy hardware.

* **Test quote + `/requests`.** I went through "Help me choose" as a customer, submitted a
  build with my name and contact, and got back **request #1** on the confirmation screen.
  I then opened `/requests` and saw my request listed at the top — saved in Postgres, exactly
  as promised. (I also opened my investment app afterward — it runs on its own server, which
  this store never touched, and it still works.)

* **An explanation that actually taught me — GPU memory.** Before this I thought a fast CPU
  or lots of system RAM could make up for a small GPU. The store's explanation made it click:
  the model's entire "brain" (its weights) has to fit inside the GPU's own memory all at once,
  or it doesn't run *at all* — RAM and CPU can't substitute. That's why a 400B model needs
  hundreds of gigabytes of GPU memory, not a 32 GB card.
