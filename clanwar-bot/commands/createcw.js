// commands/createcw.js
const { SlashCommandBuilder } = require("discord.js");
const cron = require("node-cron");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("createcw")
    .setDescription("Create a Clan War (CW) event")
    .addStringOption(option =>
      option.setName("leadername")
        .setDescription("The main leader’s name")
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName("leadera")
        .setDescription("Select Leader A")
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName("leaderb")
        .setDescription("Select Leader B")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("time")
        .setDescription("Time in HH:MM CET (example: 18:30)")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("players")
        .setDescription("Players and ranks (example: user1:5000,user2:6500...)")
        .setRequired(true)
    ),

  async execute(interaction) {
    const leaderName = interaction.options.getString("leadername");
    const leaderA = interaction.options.getUser("leadera");
    const leaderB = interaction.options.getUser("leaderb");
    const time = interaction.options.getString("time");
    const playersInput = interaction.options.getString("players");

    await interaction.reply(
      `📢 Clan War created by **${leaderName}**\n👑 Leaders: ${leaderA} vs ${leaderB}\n🕒 Time: ${time} CET\n🧑‍🤝‍🧑 Players: ${playersInput}`
    );

    // Parse HH:MM into numbers
    const [hour, minute] = time.split(":").map(Number);

    // Schedule the CW every day at that time (CET)
    cron.schedule(`${minute} ${hour} * * *`, async () => {
      const channel = await interaction.client.channels.fetch(interaction.channelId);
      channel.send(`⚔ Time for the CW! Leaders: ${leaderA} vs ${leaderB}`);
      // TODO: Add team balancing code here
    }, {
      scheduled: true,
      timezone: "Europe/Berlin", // CET
    });
  },
};