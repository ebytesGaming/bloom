const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Reply with the current ping of the bot.'),
    async execute(interaction) {
        try {
            await interaction.deferReply({ flags: 1 << 6 });
        } catch (error) {
            // Ignore defer errors to prevent "Unknown interaction" errors
        }

        if (!interaction.member.permissions.has('SEND_MESSAGES')) {
            await interaction.editReply({ content: '<:wifired:1404903607178105014> You do not have permission to use this command', flags: 1 << 6 }).catch(() => {});
            return;
        }

        const latency = `${interaction.client.ws.ping}ms`;
        const roundTripLatency = `${Date.now() - interaction.createdTimestamp}ms`;

        const totalSeconds = Math.floor(interaction.client.uptime / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const uptime = `${hours} hours ${minutes} minutes`;

        const embed = new EmbedBuilder()
            .setTitle('Pong')
            .setColor('#333333')
            .addFields(
                { name: '<:arrow1:1404907525173936352> Latency', value: latency, inline: false },
                { name: '<:1392603120231518249:1404907510682488974> Round Trip Latency', value: roundTripLatency, inline: false },
                { name: '<:1388628680330444880:1404907492923805827> Uptime', value: uptime, inline: false }
            );

        await interaction.editReply({ embeds: [embed] }).catch(() => {});
    },
};
