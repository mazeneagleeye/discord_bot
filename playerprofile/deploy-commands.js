const { REST, Routes } = require('discord.js');
require('dotenv').config();
const fs = require('fs');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

const clientId = "1344047946638954716"; // from Discord Dev Portal

(async () => {
    try {
        console.log("Deploying global commands...");
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );
        console.log("✅ Global commands deployed!");
    } catch (err) {
        console.error(err);
    }
})();