# Discord Bots Monorepo

A short guide to run and deploy the bots in this repository on Railway (single-service or per-bot services).

## TL;DR ✅
- Run a single bot locally: `npm run start:cpf-bot` (from repo root).
- Run all bots concurrently (single Railway service): `npm run start:all` (requires `npm install` in repo root).
- Best practice: create one Railway service per bot for isolation and easier debugging.

---

## Quick setup
1. From the repository root run:
   ```bash
   npm install
   ```
2. Start a single bot (example):
   ```bash
   npm run start:cpf-bot
   ```
3. Start all bots concurrently:
   ```bash
   npm run start:all
   ```

Notes:
- `start.sh` accepts an optional folder argument: `bash ./start.sh cpf-bot`.
- Root package scripts set `PORT` env vars for each bot to avoid port collisions when running `start:all`.

---

## Railway — Single-service (run all bots)
Use this if you want one Railway service that runs every bot at once.

- Set the Start Command to:
  ```bash
  npm run start:all
  ```
- Ensure Build Command runs `npm install` (Railway typically does this automatically).
- Service type must be **Web** so Railway exposes a port and performs health checks.
- Ports assigned (used by the `start:*` scripts):
  - `clanwar-bot` → 8080
  - `cpf-bot` → 8081
  - `discord-ai-bot` → 8082
  - `discord-meme-bot` → 8083
  - `new generate` → 8084
  - `playerprofile` → 8085

Caveats:
- All bots share container resources and logs — if one crashes or exhausts memory it can affect the others.
- If you use this approach, ensure environment variables required by each bot are set in the Railway project (see below).

---

## Railway — Per-bot services (recommended) 🔧
Create a separate Railway service for each bot for better isolation and scalability.

- Option A (preferred): set the **Start Command** to:
  ```bash
  BOT_DIR=cpf-bot bash ./start.sh
  ```
- Option B: set an env var `BOT_DIR=cpf-bot` in Railway and use `bash ./start.sh` as the Start Command.
- Set each service's `PORT` env var if the bot exposes a health endpoint (for example, 8080, 8081...).

Advantages:
- Dedicated logs and resource limits, easier restarts and scaling.

---

## Required environment variables (example list)
- `DISCORD_TOKEN` (required for every bot)
- `OPENAI_API_KEY` (required by `discord-ai-bot`)
- `CLIENT_ID`, `GUILD_ID` (optional/used by command registration)
- `REGISTER_SECRET` (optional for registration endpoint in some bots)

Set these in Railway → Project → Variables for each service (or globally if using single service).

---

## Troubleshooting & tips
- If itinerary shows `Stopping Container`, check Railway logs for OOM, exit codes, or `beforeExit` logs.
- Health checks: ensure GET /health returns 200 quickly; increase initial health check timeout to 60–120s if needed.
- `new generate` folder contains a space (`new generate`) — it works quoted, but renaming to `new-generate` is safer.

---

## Useful commands
- Install dependencies (root): `npm install`
- Start single bot: `npm run start:cpf-bot` (or replace with the desired `start:*` script)
- Start all bots: `npm run start:all`
- Start a bot directly: `bash ./start.sh cpf-bot`

---

If you'd like, I can also:
- Rename `new generate` → `new-generate` to remove the space and update scripts,
- Create one Railway service per bot and show example Railway settings for each.

Happy to make those extra changes — tell me which you'd like done next. ✨
