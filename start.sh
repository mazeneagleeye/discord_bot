#!/usr/bin/env bash
set -euo pipefail

# Default bot folder. Override in Railway by setting BOT_DIR environment variable.
BOT_DIR="${BOT_DIR:-clanwar-bot}"

echo "Starting bot in '$BOT_DIR'..."
cd "$BOT_DIR" || { echo "Directory not found: $BOT_DIR"; exit 1; }

# Install dependencies (production only in CI environment) and start
echo "Installing dependencies..."
npm install --production

echo "Running npm start (fallback to node index.js if needed)..."
npm start || node index.js
