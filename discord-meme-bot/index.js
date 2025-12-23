import { Client, GatewayIntentBits, Partials } from "discord.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
import http from "http";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

const prefix = "-";

client.on("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "meme") {
    try {
      const res = await axios.get("https://meme-api.com/gimme");
      const meme = res.data;

      await message.channel.send(
        `😂 **${meme.title}**\n${meme.url}`
      );
    } catch (err) {
      console.error(err);
      message.channel.send("⚠ Couldn't fetch a meme right now!");
    }
  }
});
const DISCORD_TOKEN = process.env.DISCORD_TOKEN || process.env.TOKEN;
if (!DISCORD_TOKEN) {
  console.error("❌ Discord bot token not found in environment variables. Set DISCORD_TOKEN in Railway.");
  process.exit(1);
}
client.login(DISCORD_TOKEN);

// health server
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