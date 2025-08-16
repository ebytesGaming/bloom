const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('infract')
        .setDescription('Punish a staff member.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The staff member to issue an infraction to.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the infraction.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('infraction')
                .setDescription('Infraction type.')
                .setRequired(true)
                .addChoices(
                    { name: 'Activity Notice', value: 'Activity Notice' },
                    { name: 'Warning', value: 'Warning' },
                    { name: 'Strike', value: 'Strike' },
                    { name: 'Demotion', value: 'Demotion' },
                    { name: 'Suspension', value: 'Suspension' },
                    { name: 'Termination', value: 'Termination' },
                ))
        .addStringOption(option =>
            option.setName('appeal')
                .setDescription('Appeal status.')
                .setRequired(true)
                .addChoices(
                    { name: 'Yes', value: 'Yes' },
                    { name: 'No', value: 'No' },
                )),
    async execute(interaction) {
        await interaction.deferReply({ flags: 1 << 6 });

        const member = interaction.member;
        const hasRole = member.roles.cache.has('1400148677695242302') || member.roles.cache.has('1396980123823116349');
        const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);

        if (!hasRole && !isAdmin) {
            return interaction.editReply({ content: '<:wifired:1404903607178105014> You do not have permission to use this command' });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const infraction = interaction.options.getString('infraction');
        const appeal = interaction.options.getString('appeal');

        const logChannel = interaction.guild.channels.cache.get('1404686932579188816');
        if (!logChannel) {
            return interaction.editReply({ content: 'Log channel not found.' });
        }

        // Generate random 5-character alphanumeric case ID (uppercase letters and digits)
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let caseID = '';
        for (let i = 0; i < 5; i++) {
            caseID += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        // Get current date and time formatted as MM/DD/YYYY hh:mm AM/PM
        const now = new Date();
        const pad = (n) => n.toString().padStart(2, '0');
        let hours = now.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const formattedDateTime = `${pad(now.getMonth() + 1)}/${pad(now.getDate())}/${now.getFullYear()} ${pad(hours)}:${pad(now.getMinutes())} ${ampm}`;

        const embed = new EmbedBuilder()
            .setAuthor({ name: `Infracted Logged By ${member.user.tag}`, iconURL: member.user.displayAvatarURL() })
            .setThumbnail(interaction.guild.iconURL())
            .setTitle('Staff Infraction')
            .addFields(
                { name: 'Staff Member', value: `<@${user.id}>`, inline: true },
                { name: 'Infraction Type', value: infraction, inline: true },
                { name: 'Reason', value: reason, inline: false },
                { name: 'Appeal Status', value: appeal, inline: false },
            )
            .setImage('https://media.discordapp.net/attachments/1402865432624500736/1404699729954213949/footer_nyrp.png?ex=689cccd1&is=689b7b51&hm=0a7c1c67f5244cf1c70a5b5ffa3f54b655dfedc64bba1591ab3183564537edc3&=&format=webp&quality=lossless&width=2636&height=136')
            .setFooter({ text: `Case ID: ${caseID} | ${formattedDateTime}` });

        try {
            await logChannel.send({ embeds: [embed] });
            try {
                await user.send({ content: 'You have been infracted:', embeds: [embed] });
            } catch {}
            await interaction.editReply({ content: 'Infraction has been logged successfully.' });
        } catch (error) {
            await interaction.editReply({ content: 'There was an error logging the infraction.' });
        }
    },
};
