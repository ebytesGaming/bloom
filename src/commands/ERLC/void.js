const { SlashCommandBuilder } = require('@discordjs/builders');
const { ButtonBuilder, ButtonStyle, ActionRowBuilder, Colors } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('void')
    .setDescription('Void a message by editing its embed and marking it as voided.')
    .addStringOption(option =>
      option.setName('message_id')
        .setDescription('The ID of the message to void')
        .setRequired(true)
    ),
  async execute(interaction) {
    let deferSucceeded = false;
    try {
      await interaction.deferReply({ flags: 1 << 6 }); // ephemeral
      deferSucceeded = true;
    } catch (err) {
      // If error is "Unknown interaction", do not throw, but fallback to reply
      deferSucceeded = false;
    }
    const messageId = interaction.options.getString('message_id');
    let msg;
    try {
      msg = await interaction.channel.messages.fetch(messageId);
    } catch (err) {
      if (deferSucceeded) {
        try {
          await interaction.editReply({ content: 'Could not find a message with that ID in this channel.' });
        } catch (e) { /* ignore */ }
      } else {
        try {
          await interaction.reply({ content: 'Could not find a message with that ID in this channel.', flags: 1 << 6 });
        } catch (e) { /* ignore */ }
      }
      return;
    }
    if (!msg.embeds || msg.embeds.length === 0) {
      if (deferSucceeded) {
        try {
          await interaction.editReply({ content: 'The specified message does not have an embed to edit.' });
        } catch (e) { /* ignore */ }
      } else {
        try {
          await interaction.reply({ content: 'The specified message does not have an embed to edit.', flags: 1 << 6 });
        } catch (e) { /* ignore */ }
      }
      return;
    }
    // Clone the embed and update fields
    const embed = msg.embeds[0];
    const newEmbed = {
      ...embed.data,
      color: Colors.Red,
      footer: {
        text: `Voided by ${interaction.user.tag}`,
        icon_url: interaction.user.displayAvatarURL({ dynamic: true })
      }
    };
    // Create the voided button
    const voidedButton = new ButtonBuilder()
      .setCustomId('voided')
      .setLabel('Voided')
      .setStyle(ButtonStyle.Danger)
      .setDisabled(true);
    const row = new ActionRowBuilder().addComponents(voidedButton);
    // Edit the message
    try {
      await msg.edit({ embeds: [newEmbed], components: [row] });
      if (deferSucceeded) {
        try {
          await interaction.editReply({ content: 'Message has been voided successfully.' });
        } catch (e) { /* ignore */ }
      } else {
        try {
          await interaction.reply({ content: 'Message has been voided successfully.', flags: 1 << 6 });
        } catch (e) { /* ignore */ }
      }
    } catch (err) {
      if (deferSucceeded) {
        try {
          await interaction.editReply({ content: 'Failed to edit the message. Do I have permission?' });
        } catch (e) { /* ignore */ }
      } else {
        try {
          await interaction.reply({ content: 'Failed to edit the message. Do I have permission?', flags: 1 << 6 });
        } catch (e) { /* ignore */ }
      }
    }
  }
};