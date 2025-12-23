const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

const profilesFile = './profiles.json';
let profiles = fs.existsSync(profilesFile) ? JSON.parse(fs.readFileSync(profilesFile)) : {};

function saveProfiles() {
    fs.writeFileSync(profilesFile, JSON.stringify(profiles, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createaprofile')
        .setDescription('Save your Tacticool profile (name and/or ID)')
        .addStringOption(opt =>
            opt.setName('name').setDescription('Your Tacticool name').setRequired(false))
        .addStringOption(opt =>
            opt.setName('id').setDescription('Your Tacticool ID').setRequired(false)),
    async execute(interaction) {
        const userId = interaction.user.id;
        const name = interaction.options.getString('name');
        const id = interaction.options.getString('id');

        if (!name && !id) {
            return interaction.reply({ content: '❌ Provide at least a name or an ID!', ephemeral: true });
        }

        profiles[userId] = { name, id };
        saveProfiles();

    return interaction.reply(`✅ Profile saved!\nName: ${name ?? 'Not set'}\nID: ${id ?? 'Not set'}`);
    }
};