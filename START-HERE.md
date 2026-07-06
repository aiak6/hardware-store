# Start here — Aiturgan's Rack & Reason

This folder has three things:

- **`BRIEF.md`** — the instruction you paste into Claude Code (on your EC2) to build the store.
- **`store/`** — a complete, already-built and tested version of that store (Node/Express + Postgres).
- **`GRAND-OPENING.md`** — the assignment file to fill in and push.

You have two honest ways to open your store. Pick one.

---

## Path A — deploy the ready-made store (fastest)

The `store/` folder already IS the store. Copy it to your EC2 and run it.

**On your EC2 (Amazon Linux — you log in as `ec2-user`), one time:**
```bash
# Node.js + Postgres (Amazon Linux 2023 uses dnf)
sudo dnf install -y nodejs postgresql15 postgresql15-server

# Initialise and start Postgres, and make it come back after a reboot
sudo postgresql-setup --initdb
sudo systemctl enable --now postgresql

# A NEW database, separate from your investment app
sudo -u postgres psql -c "CREATE USER storeuser WITH PASSWORD 'pickapassword';"
sudo -u postgres psql -c "CREATE DATABASE rack_and_reason OWNER storeuser;"
```

**Copy the store up and start it:**
```bash
# from your laptop, in this folder:
scp -i ~/.ssh/hardware-store.pem -r store ec2-user@54.158.240.124:~/rack-and-reason

# then on the EC2:
cd ~/rack-and-reason
npm install
export PORT=8080
export DATABASE_URL="postgresql://storeuser:pickapassword@localhost:5432/rack_and_reason"

# keep it running after logout AND reboot:
sudo npm install -g pm2
pm2 start server.js --name rack-and-reason
pm2 startup && pm2 save
```

**Then:** open **port 8080** in your EC2 security group (Inbound rule: Custom TCP, port 8080,
source 0.0.0.0/0) and visit `http://54.158.240.124:8080`.

## Path B — let Claude Code build it on the server

Open `BRIEF.md`, fill in your **server IP** and **SSH line** at the top, run `/model sonnet`
in Claude Code, and paste the brief. Direct the build page by page. (You can point Claude
Code at the `store/` folder as a reference to adapt.)

---

## Check it on your own laptop BEFORE you deploy

You don't need the EC2 to preview it. On your Mac:
```bash
cd store
npm install
# quick preview WITHOUT a database (every page works except saving a quote):
PORT=8080 node server.js
#   -> open http://localhost:8080

# full test, WITH the database (so /requests works too):
#   install Postgres (e.g. Postgres.app or `brew install postgresql`), then:
createdb rack_and_reason
DATABASE_URL="postgresql://localhost:5432/rack_and_reason" PORT=8080 node server.js
```

Run the built-in smoke test any time (no database needed — it uses an in-memory stub):
```bash
cd store && npm install && node test.js      # expect: 16 passed, 0 failed
```

---

## Is it compatible with your EC2?

Yes — nothing here is machine-specific:

- **Just Node.js + Postgres.** Standard on any Amazon Linux or Ubuntu EC2. The only npm
  packages are `express` and `pg`, both pure JavaScript (no compiling, no native builds),
  so they install cleanly on the server.
- **Reads its settings from the environment** (`PORT`, `DATABASE_URL`) — no hard-coded paths
  or IPs, so it runs the same on your laptop and on the EC2.
- **Listens on `0.0.0.0:8080`**, so it's reachable from the internet once you open port 8080
  in the security group. It never uses port 80, so your investment app is untouched.
- **Its own database** (`rack_and_reason`) — it will not read or write the investment app's DB.

The one thing only you can do: **open port 8080** in the EC2 security group, and make sure
Postgres is installed and the database exists (the two `CREATE` lines above). After deploying,
open your investment app to confirm it still works.
