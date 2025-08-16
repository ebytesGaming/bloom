const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Make the bot say a message.')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to display. (Use \\n for new lines!)')
                .setRequired(true)),
    async execute(interaction) {
        const member = interaction.member;
        const roleIds = ['1400148677695242302', '1396980123823116349'];
        const hasRole = roleIds.some(roleId => member.roles.cache.has(roleId));
        const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);

        if (!hasRole && !isAdmin) {
            await interaction.reply({ content: '<:wifired:1404903607178105014> You do not have permission to use this command.', ephemeral: true });
            return;
        }

        const message = interaction.options.getString('message').replace(/\\n/g, '\n');

        await interaction.deferReply();
        await interaction.deleteReply();
        await interaction.channel.send(message);
    },
};
