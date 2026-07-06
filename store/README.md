# Aiturgan's Rack & Reason

An AI hardware store that **teaches**. A customer picks a big open-source model; the
store tells them exactly what NVIDIA hardware to buy to run it, what it costs, and how
much power it burns — with every number explained in plain words.

Built with Node/Express + Postgres. Server-rendered, no build step, one dependency for
the DB. Runs on **port 8080** with its **own Postgres database** — it never touches the
investment app on port 80.

## What's inside
- `server.js` — Express routes (`/`, `/products`, `/models`, `/advisor`, `/quote`, `/requests`, `/health`)
- `data.js` — the real hardware + models, plus the plain-words glossary shown next to every number
- `advisor.js` — the memory math (`params×1GB +20%`), minimum builds, cluster + power calculations
- `db.js` / `schema.sql` — Postgres storage for quote requests
- `render.js` + `public/styles.css` — the dark-tech UI
- `test.js` — a 12-check smoke test (uses an in-memory DB stub)

## Run it locally
```bash
npm install
# start a Postgres and create a NEW database:
createdb rack_and_reason
export DATABASE_URL="postgresql://localhost:5432/rack_and_reason"
npm start           # -> http://localhost:8080
```

## Deploy on your EC2 (port 8080, alongside the investment app)
```bash
# 1) Postgres — a NEW database, separate from the investment app
sudo -u postgres createuser storeuser --pwprompt
sudo -u postgres createdb rack_and_reason -O storeuser

# 2) App
cd rack-and-reason
npm install
export PORT=8080
export DATABASE_URL="postgresql://storeuser:YOURPASS@localhost:5432/rack_and_reason"

# 3) Keep it running after you log out AND after a reboot (pick one):
#    pm2 (simplest):
npm install -g pm2
pm2 start server.js --name rack-and-reason
pm2 startup && pm2 save          # survives reboot
#    -- or a systemd unit, or:  nohup node server.js &

# 4) Open port 8080 in the EC2 security group, then visit:
#    http://YOUR-SERVER-IP:8080
```

**Hard rule:** do not touch the investment app or its database. This store uses its own
DB (`rack_and_reason`) and its own port (8080). After deploying, open your investment app
to confirm it still works.

## The numbers are real (verified July 2026)
| Product | Memory | Power | Price |
|---|---|---|---|
| RTX 5090 | 32 GB | 575 W | ~$1,999 |
| RTX PRO 6000 Blackwell | 96 GB | 600 W | ~$8,500 |
| H100 (80 GB SXM) | 80 GB | 700 W | ~$28,000 |
| H200 (141 GB) | 141 GB | 700 W | ~$35,000 |
| DGX H200 (8× H200) | 1,128 GB | ~10.2 kW | ~$400,000 |
| GB300 NVL72 rack | ~20.7 TB | 135 kW | ~$3.5M |

Power conversions used: an average home ≈ 1,200 W; an EV battery ≈ 90 kWh.
(135 kW ÷ 1,200 W = **112 homes** — the sanity check the assignment itself gives.)

## Models advised on (open-source, from the agent leaderboard)
| Model | Params | License | Memory needed (×1GB +20%) |
|---|---|---|---|
| Qwen3-235B | 235B | Apache 2.0 | 282 GB |
| DeepSeek-V3 | 671B | MIT | 805 GB |
| Kimi K2 | 1000B | Modified MIT | 1,200 GB |

> Leaderboards change — re-verify the models and their parameter counts on the live
> board (arena.ai, Open Source filter) before opening day, and update `data.js`.
