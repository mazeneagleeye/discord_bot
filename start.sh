#!/usr/bin/env bash
set -euo pipefail

# Allow passing directory as the first argument, then fallback to BOT_DIR env var or default to clanwar-bot
if [ "${1:-}" != "" ]; then BOT_DIR="$1"; fi
BOT_DIR="${BOT_DIR:-clanwar-bot}"

echo "Starting bot in '$BOT_DIR'..."
cd "$BOT_DIR" || { echo "Directory not found: $BOT_DIR"; exit 1; }

# Install dependencies (omit dev deps in production) and start
echo "Installing dependencies..."
# Use --omit=dev to avoid npm production deprecation warnings
npm install --omit=dev --no-audit

echo "Running npm start (this will replace the shell so signals are forwarded)..."
# Use exec so npm becomes PID 1 in the container and receives signals from Railway
exec npm start
