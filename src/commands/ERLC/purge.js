const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Deletes a specified number of messages from the channel.')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)),
  async execute(interaction) {
    let deferred = false;
    try {
      await interaction.deferReply({ ephemeral: true });
      deferred = true;
    } catch (error) {
      // If deferReply fails, we'll use reply with ephemeral fallback
    }

    const amount = interaction.options.getInteger('amount');

    // Permission check for user
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      const content = 'You do not have permission to manage messages.';
      if (deferred) {
        return interaction.editReply(content);
      } else {
        return interaction.reply({ content, flags: 1 << 6 }).catch(() => {});
      }
    }

    // Permission check for bot
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
      const content = 'I do not have permission to manage messages.';
      if (deferred) {
        return interaction.editReply(content);
      } else {
        return interaction.reply({ content, flags: 1 << 6 }).catch(() => {});
      }
    }

    try {
      const deletedMessages = await interaction.channel.bulkDelete(amount, true);
      console.log('${member.user.tag} has used the purge command.');
      const content = `Purged ${deletedMessages.size} messages successfully!`;
      if (deferred) {
        await interaction.editReply(content);
      } else {
        await interaction.reply({ content, flags: 1 << 6 }).catch(() => {});
      }
    } catch (error) {
      const content = 'There was an error trying to delete messages in this channel.';
      if (deferred) {
        await interaction.editReply(content);
      } else {
        await interaction.reply({ content, flags: 1 << 6 }).catch(() => {});
      }
    }
  },
};
