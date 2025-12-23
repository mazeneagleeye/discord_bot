# Deploying to Railway

This repo is a monorepo with multiple bots in subfolders. I added a root `start.sh` and a root `package.json` so Railway can detect Node and start a chosen subfolder.

How it works
- `BOT_DIR` environment variable chooses the subfolder to run (e.g., `clanwar-bot`, `discord-ai-bot`, `new generate`).
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
