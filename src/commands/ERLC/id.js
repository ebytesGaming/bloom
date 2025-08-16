const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('id')
        .setDescription('Display the ID of a user.'),
    async execute(interaction) {
        await interaction.reply({ content: '<:wifired:1404903607178105014> You do not have permission to use this command', ephemeral: true });
    },
};
