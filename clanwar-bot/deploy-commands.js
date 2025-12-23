const { REST, Routes } = require("discord.js");
const fs = require("fs");

// Prefer environment variables (Railway); fall back to local config.json if present
let clientId = process.env.CLIENT_ID;
let guildId = process.env.GUILD_ID;
let token = process.env.DISCORD_TOKEN || process.env.TOKEN;
try {
  const cfg = require("./config.json");
  clientId = clientId || cfg.clientId;
  guildId = guildId || cfg.guildId;
  token = token || cfg.token;
} catch (e) {
  // no config.json, continue
}

if (!clientId || !token) {
  console.error("Missing CLIENT_ID or DISCORD_TOKEN. Set env vars or add a local config.json (use config.example.json as template).");
  process.exit(1);
}

const commands = [];
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log("⏳ Refreshing slash commands...");
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );
    console.log("✅ Slash commands registered!");
  } catch (error) {
    console.error(error);
  }
})();