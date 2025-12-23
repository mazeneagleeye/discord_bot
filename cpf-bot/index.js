const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

console.log("🚀 Starting bot..."); // <-- debug log

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const TARGET_POINTS = 3000000; // 3 million
const PASS_VALUE = 5000;       // every 5000 = 1 clan pass

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith("-cpfm8")) {
    const args = message.content.trim().split(/\s+/);
    const currentPoints = parseInt(args[1], 10);

    if (isNaN(currentPoints)) {
      return message.reply("❌ Example: `-cpfm8 1011800`");
    }

    const remaining = TARGET_POINTS - currentPoints;

    if (remaining <= 0) {
      return message.reply("🎉 Mission 8 already completed!");
    }

    const passes = Math.ceil(remaining / PASS_VALUE);

    message.reply(
      `📊 You need **${remaining.toLocaleString()}** points = **${passes} Clan Passes**`
    );
  }
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN || process.env.TOKEN;
console.log("🔑 Logging in with token:", DISCORD_TOKEN ? "Found ✅" : "Missing ❌");

if (!DISCORD_TOKEN) {
  console.error("❌ No DISCORD_TOKEN found. Set DISCORD_TOKEN env var in Railway or a local .env for testing.");
  process.exit(1);
}

client.login(DISCORD_TOKEN);

// health server for PaaS
const http = require('http');
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  if ((req.url || '') === '/health') {
    res.writeHead(200, {'Content-Type':'text/plain'});
    res.end('OK');
    return;
  }
  res.writeHead(200, {'Content-Type':'text/plain'});
  res.end('Bot is running');
}).listen(PORT, () => console.log(`🔌 Health server listening on port ${PORT}`));

const shutdown = async (signal) => {
  console.log(`Received ${signal}, shutting down...`);
  try { await client.destroy(); } catch (err) { console.error('Error while destroying client:', err); }
  try { server.close(); } catch (err) { console.error('Error while closing server:', err); }
  process.exit(0);
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (r)=>console.error('Unhandled Rejection:', r));
process.on('uncaughtException', (e)=>{ console.error('Uncaught Exception:', e); process.exit(1); });

console.log(`💓 initial heartbeat: ${new Date().toISOString()} PID:${process.pid} BOT_DIR:${process.env.BOT_DIR||'N/A'} PORT:${process.env.PORT||'N/A'} TOKEN:${process.env.DISCORD_TOKEN||process.env.TOKEN? 'present':'missing'}`);
setInterval(() => console.log(`💓 heartbeat: ${new Date().toISOString()} PID:${process.pid}`), 30 * 1000);
process.on('beforeExit', (code) => console.log(`🧾 beforeExit with code ${code} PID:${process.pid}`));
process.on('exit', (code) => console.log(`🔚 Process exiting with code ${code} PID:${process.pid}`));