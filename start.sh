#!/usr/bin/env bash
set -euo pipefail

# Allow passing directory as the first argument, then fallback to BOT_DIR env var or default to clanwar-bot
if [ "${1:-}" != "" ]; then BOT_DIR="$1"; fi
BOT_DIR="${BOT_DIR:-clanwar-bot}"

echo "Starting bot in '$BOT_DIR'..."
cd "$BOT_DIR" || { echo "Directory not found: $BOT_DIR"; exit 1; }

# Install dependencies (omit dev deps in production) only if needed
# Skip install when node_modules exists unless FORCE_INSTALL=1 is set
if [ "${FORCE_INSTALL:-0}" != "1" ] && [ -d node_modules ] && [ "$(ls -A node_modules 2>/dev/null || true)" != "" ]; then
  echo "Skipping install — node_modules already present"
else
  echo "Installing dependencies..."
  # Use --omit=dev to avoid npm production deprecation warnings
  npm install --omit=dev --no-audit
fi

echo "Running npm start (this will replace the shell so signals are forwarded)..."
# Use exec so npm becomes PID 1 in the container and receives signals from Railway
exec npm start
