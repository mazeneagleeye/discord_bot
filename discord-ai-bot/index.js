
require('dotenv').config();
const { Client, GatewayIntentBits } = require("discord.js");
const OpenAI = require("openai");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // your OpenAI key
});

// Helper: chance for rare random messages (e.g. 2%)
function randomChance(percent) {
  return Math.random() < percent / 100;
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const mentionedBot = message.mentions.has(client.user);
  const repliedToBot = message.reference
    ? (await message.fetchReference()).author.id === client.user.id
    : false;

  // 1. If bot is mentioned OR someone replies to bot
  if (mentionedBot || repliedToBot) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message.content }],
      });

      const reply = response.choices[0].message.content;
      await message.reply(reply);
    } catch (err) {
      console.error(err);
      await message.reply("🤖 Oops, I couldn't think of a reply.");
    }
  }

  // 2. Rare chance to send random message
  if (randomChance(2)) { // 2% chance
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Say something random and fun." }],
      });

      const randomMsg = response.choices[0].message.content;
      await message.channel.send(randomMsg);
    } catch (err) {
      console.error(err);
    }
  }
});


client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN || process.env.TOKEN;
if (!DISCORD_TOKEN) {
  console.error("❌ No DISCORD_TOKEN found. Set DISCORD_TOKEN env var in Railway or a local .env for testing.");
  process.exit(1);
}
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ Missing OPENAI_API_KEY (set in Railway environment variables).");
  process.exit(1);
}

client.login(DISCORD_TOKEN);

// health server for Railway
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