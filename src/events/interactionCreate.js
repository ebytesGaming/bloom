const {
    Interaction,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ComponentType
} = require("discord.js");

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isCommand()) return;

        // Acknowledge interaction immediately to avoid "Unknown interaction"
        try {
            await interaction.deferReply({ flags: 1 << 6 });
        } catch (e) {
            return; // Interaction already acknowledged or expired
        }

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(error);

            // Edit the deferred reply instead of sending a new one
            await interaction.editReply({
                content: 'There was an error while executing this command!'
            }).catch(() => {});

            const guild = interaction.guild;
            const member = interaction.member;
            const channel = interaction.channel;
            const errorTime = `<t:${Math.floor(Date.now() / 100)}:R>`;

            // Safe channel fetch to avoid Missing Access crashes
            let sendChannel;
            try {
                sendChannel = await client.channels.fetch('1402865432624500736');
            } catch (fetchErr) {
                console.error("Failed to fetch error log channel:", fetchErr);
                return;
            }

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('New error flagged, this interaction will no longer work or be flagged again')
                .addFields({ name: 'Command:', value: `${interaction.commandName}` })
                .addFields({ name: 'Error Stack (Full Error)', value: `${error.stack}` })
                .addFields({ name: 'Error Message', value: `${error.message}` })
                .addFields({ name: 'Error Time', value: `${errorTime}` })
                .setFooter({ text: 'Error Flagging' })
                .setTimestamp();

            const button = new ButtonBuilder()
                .setCustomId('fetchErrorUserInfo')
                .setLabel(`🤷‍♂️ User Info`)
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(button);

            const msg = await sendChannel.send({ embeds: [embed], components: [row] }).catch(() => {});

            const time = 300000; // 5 minutes
            const collector = msg.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time
            });

            collector.on('collect', async i => {
                if (i.customId === 'fetchErrorUserInfo') {
                    const userEmbed = new EmbedBuilder()
                        .setColor('DarkOrange')
                        .setDescription('The following user has triggered an error in the above slash command(s)')
                        .addFields({ name: 'Error User', value: `\`${member.user.username} (${member.id})\`` })
                        .addFields({ name: 'Command Channel', value: `\`${channel.name} (${channel.id})\`` })
                        .setTimestamp();

                    await i.reply({ embeds: [userEmbed], flags: 1 << 6 });
                }
            });

            collector.on('end', async () => {
                button.setDisabled(true);
                embed.setFooter({ text: 'User Info Button Expired, soz' });
                await msg.edit({ embeds: [embed], components: [row] });
            });
        }
    }
};