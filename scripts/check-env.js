/*
  check-env.js
  Validates that required environment variables for each bot are present.
  Usage: node scripts/check-env.js
  Returns non-zero exit code if any required var is missing.
*/

const fs = require('fs');
const path = require('path');

const bots = {
  'clanwar-bot': { vars: ['DISCORD_TOKEN'] },
  'cpf-bot': { vars: ['DISCORD_TOKEN'] },
  'discord-ai-bot': { vars: ['DISCORD_TOKEN', 'OPENAI_API_KEY'] },
  'discord-meme-bot': { vars: ['DISCORD_TOKEN'] },
  'new generate': { vars: ['DISCORD_TOKEN', 'CLIENT_ID'] },
  'playerprofile': { vars: ['DISCORD_TOKEN'] },
};

let ok = true;

function loadDotenvFor(dir) {
  const file = path.resolve(dir, '.env');
  if (!fs.existsSync(file)) return {};
  const content = fs.readFileSync(file, 'utf8');
  const parsed = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    parsed[key] = val;
  }
  return parsed;
}

console.log('Checking environment variables for each bot...');
for (const [bot, meta] of Object.entries(bots)) {
  const dir = path.resolve(process.cwd(), bot);
  let dotenvVars = {};
  try { dotenvVars = loadDotenvFor(dir); } catch (e) { /* ignore */ }

  const missing = [];
  for (const v of meta.vars) {
    if ((process.env[v] && process.env[v].length > 0) || (dotenvVars[v] && dotenvVars[v].length > 0)) continue;
    missing.push(v);
  }
  if (missing.length) {
    ok = false;
    console.error(`- ${bot}: missing ${missing.join(', ')} (set in Railway variables or create ${path.join(bot, '.env')})`);
  } else {
    console.log(`- ${bot}: OK`);
  }
}

if (!ok) {
  console.error('\nOne or more bots have missing environment variables.');
  process.exit(1);
}

console.log('\nAll required environment variables are present (or available in .env files).');
process.exit(0);
