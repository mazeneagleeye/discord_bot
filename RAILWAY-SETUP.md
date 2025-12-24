# Deploying to Railway

This repo is a monorepo with multiple bots in subfolders. I added a root `start.sh` and a root `package.json` so Railway can detect Node and start a chosen subfolder.

How it works
- `BOT_DIR` environment variable chooses the subfolder to run (e.g., `clanwar-bot`, `discord-ai-bot`, `new generate`).
- The root `package.json` includes per-bot `start:*` scripts which set a unique `PORT` per bot so you can run all bots concurrently in a single Railway service using `npm run start:all`.

Port assignments (used by `npm run start:*`):
- `clanwar-bot` → **8080**
- `cpf-bot` → **8081**
- `discord-ai-bot` → **8082**
- `discord-meme-bot` → **8083**
- `new generate` → **8084**
- `playerprofile` → **8085**

Running all bots in one Railway service (single-service approach)
- Set the service Start Command to: `npm run start:all`
- Make sure the service type is **Web** so Railway exposes the container and runs health checks.
- Ensure the repo root dependencies are installed during the build (so `concurrently` is present); set the Build command to `npm install` or let Railway run the default install step.
- Note: in single-service mode, all bots run in the same container and share logs and resources. If you prefer isolation or easier scaling, create one Railway service per bot instead.

- Each bot still reads `DISCORD_TOKEN`, `OPENAI_API_KEY`, etc., from Railway environment variables as listed below.

- Each bot looks for its token in either a local `config.json` (not committed) or the environment variable `DISCORD_TOKEN`. In Railway you should set `DISCORD_TOKEN` in the project environment variables (preferred). I added `clanwar-bot/config.example.json` as a template you can use locally.

Environment variables checklist (common):
- `DISCORD_TOKEN` (required for every bot in Railway)
- `CLIENT_ID` (for command registration; used by `new generate` and optional elsewhere)
- `GUILD_ID` (optional - quicker command registration to a test guild)
- `OPENAI_API_KEY` (required by `discord-ai-bot`)
- `REGISTER_SECRET` (optional - used by `new generate` to trigger registration endpoint)
- `PORT` (optional - most bots expose a health endpoint on `PORT` or 3000)

Ensure you set these in Railway → Project → Variables, then redeploy. Make sure the service exposes a health endpoint (GET /health returns 200); I added lightweight servers to all bots so Railway can verify the app is healthy and keep the container running.

Troubleshooting `Stopping Container` events
- If the logs show `Stopping Container` after a successful start, check these:
  1. Service type must be **Web** (not Task/Function) so Railway keeps it running and exposes a port.
  2. Health check path should be `/health` and initial timeout set to 60–120s. If the first health check times out, the service may be stopped.
  3. Inspect deploy logs right after `Stopping Container` for an exit code, OOM, SIGTERM, or 'Exited with code' that points to why it stopped.
  4. Ensure the service's `PORT` is respected (do not hardcode port 8080) — the software uses `process.env.PORT || 3000`.
  5. Resource limits (memory) may cause OOM kills — check Railway's resource limits and logs for 'OOM' entries.
  6. Check that the service type in Railway is not configured as a one-off `Task` or `Job` that exits after completion.

Logging checks to run after deployment:
- Confirm you see an **initial heartbeat** log within 30s of startup. If you do not, the process likely crashed before or during server startup.
- If you see frequent heartbeat logs, but the container still stops, look for `beforeExit` or `Process exiting` logs to see the exit code.

If you paste the exact lines from the Railway logs around the `Stopping Container` event (10–20 lines before and after), I will diagnose the exact cause and propose a fix.
- Default `BOT_DIR` is `clanwar-bot` (you can change this in Railway service settings).
- Root `package.json` runs `bash ./start.sh` which:
  - cd into the `BOT_DIR`
  - runs `npm install --production`
  - runs `npm start` (or `node index.js` as fallback)

Railway setup steps
1. Commit and push the changes to your repo.
2. In Railway, create a project from this Git repo. Ensure it uses repository root.
3. Set an environment variable `BOT_DIR` to the subfolder you want to run (for example: `clanwar-bot`). If the folder name contains spaces, set the exact name (e.g., `new generate`).
4. You can optionally set the Build command to `npm install` and Start command to `npm start` (the default behavior should work).

Local testing
- From repo root: `npm start` (runs `bash start.sh` which starts the default BOT_DIR)
- To test a specific folder:
  - macOS/Linux/WSL/PowerShell: `BOT_DIR="discord-ai-bot" npm start` or `env BOT_DIR=cpf-bot npm start`
  - Windows cmd: `set BOT_DIR=cpf-bot && npm start`

Notes
- I added `start` scripts (`node index.js`) to these packages so `npm start` works in-subfolder: `clanwar-bot`, `cpf-bot`, `discord-ai-bot`, `discord-meme-bot`, `playerprofile`.
- `new generate` already had a `start` script.
- Node engine in root `package.json` is set to `18.x` to match Railway's Node selector.
