const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('closerequest')
    .setDescription('Request to close the current ticket'),

  async execute(interaction) {
    await interaction.deferReply();
    const ticketChannel = interaction.channel;
    if (!ticketChannel) return interaction.editReply({ content: 'Channel not found.' });

    // Allow only ticket channels starting with these prefixes
    const allowedPrefixes = ['Clothing', 'Livery', 'Graphics', 'Discord', 'Bot', 'Photography'];
    if (!allowedPrefixes.some(prefix => ticketChannel.name.startsWith(prefix))) {
      return interaction.editReply({ content: 'This command can only be used in a ticket channel.' });
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('accept_close')
        .setLabel('Accept & Close')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('deny_keep_open')
        .setLabel('Deny & Keep Open')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.editReply({
      embeds: [
        {
          title: 'Close Request',
          description: `${interaction.user.tag} has requested to close this ticket.\n\nPlease accept or deny using the buttons below.`,
          color: '#f52a90'
        }
      ],
      components: [row],
    });

    const filter = i => i.user.id === interaction.user.id && i.isButton();
    const collector = ticketChannel.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 60000 });

    collector.on('collect', async i => {
      if (i.customId === 'accept_close') {
        await i.deferUpdate();
        try {
          const messages = await ticketChannel.messages.fetch({ limit: 100 });
          const sorted = Array.from(messages.values()).sort((a, b) => a.createdTimestamp - b.createdTimestamp);
          let transcript = `Transcript for ${ticketChannel.name}:\n`;
          for (const msg of sorted) transcript += `[${new Date(msg.createdTimestamp).toLocaleString()}] ${msg.author.tag}: ${msg.content}\n`;

          const logChannel = interaction.guild.channels.cache.get('1406132914613391463');
          if (logChannel) {
            await logChannel.send({
              content: `Ticket closed by <@${interaction.user.id}> in ${ticketChannel.name}`,
              files: [{ attachment: Buffer.from(transcript, 'utf-8'), name: `${ticketChannel.name}_transcript.txt` }]
            });
          }

          await ticketChannel.delete('Ticket closed via /closerequest command');
        } catch (err) {
          console.error(err);
          await interaction.followUp({ content: 'There was an error closing the ticket.' });
        }
        collector.stop();
      } else if (i.customId === 'deny_keep_open') {
        await i.update({ content: 'Ticket close canceled. The ticket will remain open.', components: [] });
        collector.stop();
      }
    });

    collector.on('end', async collected => {
      if (collected.size === 0) {
        await interaction.editReply({ content: 'No response received. Ticket close canceled.', components: [] });
      }
    });
  }
};