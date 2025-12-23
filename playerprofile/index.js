const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// Load commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// Handle slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);

    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(err);
        await interaction.reply({ content: '❌ There was an error!', ephemeral: true });
    }
});

client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN || process.env.TOKEN;
if (!DISCORD_TOKEN) {
  console.error("❌ No DISCORD_TOKEN found. Set DISCORD_TOKEN in Railway environment variables.");
  process.exit(1);
}

client.login(DISCORD_TOKEN);

// health server
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

setInterval(() => console.log(`💓 heartbeat: ${new Date().toISOString()} PID:${process.pid}`), 5 * 60 * 1000);
process.on('exit', (code) => console.log(`🔚 Process exiting with code ${code} PID:${process.pid}`));