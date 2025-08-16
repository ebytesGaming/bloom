const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Add or remove a role from a user')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add a role to a user')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('The user to add the role to')
            .setRequired(true))
        .addRoleOption(option =>
          option.setName('role')
            .setDescription('The role to add')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove a role from a user')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('The user to remove the role from')
            .setRequired(true))
        .addRoleOption(option =>
          option.setName('role')
            .setDescription('The role to remove')
            .setRequired(true))),
  async execute(interaction) {
    try {
      await interaction.deferReply({ flags: 1 << 6 });
    } catch (err) {
      // Could not defer, maybe already replied
      return;
    }
    const memberRoles = interaction.member.roles.cache;
    if (
      !memberRoles.has('1400148677695242302') &&
      !memberRoles.has('1396980123823116349') &&
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      await interaction.editReply({ content: '<:wifired:1404903607178105014> You do not have permission to use this command.' });
      return;
    }

    const subcommand = interaction.options.getSubcommand();
    const user = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');
    const member = await interaction.guild.members.fetch(user.id);

    if (subcommand === 'add') {
      try {
        await member.roles.add(role);
        await interaction.editReply({ content: `**${role.name}** has been added to ${user.tag}.` });
      } catch (error) {
        await interaction.editReply({ content: `Failed to add the role: ${error.message}` });
      }
    } else if (subcommand === 'remove') {
      try {
        await member.roles.remove(role);
        await interaction.editReply({ content: `**${role.name}** has been removed from ${user.tag}.` });
      } catch (error) {
        await interaction.editReply({ content: `Failed to remove the role: ${error.message}` });
      }
    }
  },
};
