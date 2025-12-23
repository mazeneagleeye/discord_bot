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

console.log("🔑 Logging in with token:", process.env.TOKEN ? "Found ✅" : "Missing ❌");

client.login(process.env.TOKEN);