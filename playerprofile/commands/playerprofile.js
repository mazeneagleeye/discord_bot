const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

const profilesFile = './profiles.json';
let profiles = fs.existsSync(profilesFile) ? JSON.parse(fs.readFileSync(profilesFile)) : {};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playerprofile')
        .setDescription('View a Tacticool profile')
        .addUserOption(opt =>
            opt.setName('user').setDescription('The Discord user').setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const profile = profiles[user.id];

        if (!profile) {
            return interaction.reply(`❌ No profile found for ${user.username}.`);
        }

        return interaction.reply(
            `🎮 Player Profile for **${user.username}**\n` +
            `─────────────────────────\n` +
            `Name: ${profile.name ?? 'Not set'}\n` +
            `ID: ${profile.id ?? 'Not set'}`
        );
    }
};