const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits } = require("discord.js");

// Load environment from .env (if present) — useful for local testing and consistent with other bots
require('dotenv').config();

// Load token from config.json if present, otherwise fall back to environment variables (Railway uses env vars)
let token;
try {
  const cfg = require("./config.json");
  token = cfg.token;
} catch (e) {
  token = process.env.DISCORD_TOKEN || process.env.TOKEN;
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

client.once("clientReady", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: "❌ Error executing command.", ephemeral: true });
  }
});

if (!token) {
  console.error("❌ No bot token found. Set DISCORD_TOKEN env var in Railway or add a local 'clanwar-bot/config.json' (use 'config.example.json').");
  process.exit(1);
}

client.login(token).catch(err => {
  console.error('❌ Login failed for clanwar-bot:', err && err.message ? err.message : err);
  process.exit(1);
});

// --- Lightweight health server for PaaS (Railway) ---
const http = require('http');
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  if ((req.url || '') === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running');
}).listen(PORT, () => console.log(`🔌 Health server listening on port ${PORT}`));

// Handle termination signals and errors so Railway can restart cleanly
const shutdown = async (signal) => {
  console.log(`Received ${signal}, shutting down...`);
  try {
    await client.destroy();
  } catch (err) {
    console.error('Error while destroying client:', err);
  }
  try {
    server.close();
  } catch (err) {
    console.error('Error while closing server:', err);
  }
  process.exit(0);
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason));
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Helpful diagnostics for PaaS (Railway) — immediate heartbeat, frequent heartbeats, and exit logs
console.log(`💓 initial heartbeat: ${new Date().toISOString()} PID:${process.pid} BOT_DIR:${process.env.BOT_DIR||'N/A'} PORT:${process.env.PORT||'N/A'} TOKEN:${process.env.DISCORD_TOKEN||process.env.TOKEN? 'present':'missing'}`);
setInterval(() => console.log(`💓 heartbeat: ${new Date().toISOString()} PID:${process.pid}`), 30 * 1000);
process.on('beforeExit', (code) => console.log(`🧾 beforeExit with code ${code} PID:${process.pid}`));
process.on('exit', (code) => console.log(`🔚 Process exiting with code ${code} PID:${process.pid}`));