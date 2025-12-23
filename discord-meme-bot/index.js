import { Client, GatewayIntentBits, Partials } from "discord.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

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
if (!process.env.TOKEN) {
  console.error("❌ Discord bot token not found in environment variables.");
  process.exit(1);
}
client.login(process.env.TOKEN);