const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits } = require("discord.js");

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

client.once("ready", () => {
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

client.login(token);