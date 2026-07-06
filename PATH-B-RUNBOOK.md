# Path B — build it on the server with Claude Code

You direct the build; Claude Code does the typing on the EC2. `store/` stays open as your
safety net. Here's the whole run, start to finish.

## 0. Before you start (5 min)
- Open **port 8080** in your EC2 security group (Inbound → Custom TCP → 8080 → 0.0.0.0/0).
- Have your **SSH line** ready: `ssh -i ~/.ssh/hardware-store.pem ec2-user@54.158.240.124`
- Confirm you can SSH in manually once, then log out. (If the connection works, Claude Code will too.)

## 1. Start Claude Code in this repo
On your laptop:
```bash
cd ~/code/hardware-store        # this folder
claude                          # start Claude Code here
/model sonnet                   # Sonnet is enough for this
```

## 2. Paste the brief
Open `BRIEF.md`, make sure the **SSH line** and **server IP** at the top are filled in,
then paste the whole brief into Claude Code. It will SSH to the server and start building.

## 3. Direct the build (watch, don't just accept)
As each page appears, actually look at it:
- Is **"Aiturgan"** in the store name on the front page?
- Do the six products show price, GPU memory, watts — each with a plain-words explanation?
- Do the three models show the memory math (235B → 282 GB, etc.)?
- Does "Help me choose" give two builds with total prices?
- Does a build page show watts AND "≈ N homes"?

If a number looks off or an explanation doesn't teach you, tell Claude Code to fix it.
Compare against `store/` (the tested reference) whenever you're unsure what "right" looks like.

## 4. Make it survive logout + reboot
Tell Claude Code to keep the store running with pm2:
```
pm2 start server.js --name rack-and-reason && pm2 startup && pm2 save
```
Then confirm: `http://54.158.240.124:8080` loads in your browser.

## 5. Do the four checks (these go in GRAND-OPENING.md — do them for real)
1. **Model math by hand.** Pick Qwen3-235B: 235 × 1 GB = 235, + 20% = **282 GB**. Does the
   store's startup build actually have ≥ 282 GB of GPU memory? (3× RTX PRO 6000 = 288 GB ✓)
2. **One product vs the real world.** Search "NVIDIA H200 price / memory". Does the store's
   141 GB / ~$35,000 match reality? (It should.)
3. **Test quote.** Go through "Help me choose", submit with your name + contact. Did you get a
   **request number**? Does it appear at `/requests`?
4. **An explanation that taught you.** Read the store's GPU-memory explanation. Did it make
   the idea click? If not, have Claude Code rewrite it until it does.
5. **Open your investment app** on port 80 — still working? Good.

## 6. Turn it in
- Confirm your name is in the store name on the front page.
- In `GRAND-OPENING.md`: put your real live URL (`http://54.158.240.124:8080`), the store name,
  your brief, and your three checks. (The draft is already filled — just update the URL and
  tweak the checks to match what you actually saw.)
- `git add -A && git commit -m "Grand opening" && git push`
- **Keep the server running.** If you ever stop/restart the instance, the public IP usually
  changes — update the URL in `GRAND-OPENING.md` and push again.

## If Claude Code gets stuck on the server
Fall back to Path A in `START-HERE.md`: copy the tested `store/` folder up and run it. Same
result, less drama. You can always switch mid-way.
