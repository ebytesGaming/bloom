const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('promotion')
        .setDescription('Announce a promotion')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The staff member to issue an infraction to.')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('new_rank')
                .setDescription('The new rank of the user')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the promotion')
                .setRequired(true)),
    async execute(interaction) {
        let deferred = false;
        try {
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply();
                deferred = true;
            }
        } catch (error) {
            // defer failed, proceed without deferring
        }

        const user = interaction.options.getUser('user');
        const newRank = interaction.options.getRole('new_rank');
        const reason = interaction.options.getString('reason');

        // Assign the specified role to the user in the guild
        try {
            const member = await interaction.guild.members.fetch(user.id);
            await member.roles.add(newRank);
        } catch (error) {
            if (deferred) {
                await interaction.editReply('Failed to assign the role to the user.');
            } else {
                await interaction.reply({ content: 'Failed to assign the role to the user.', flags: 1 << 6 });
            }
            return;
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
            .setTitle('Staff Promotion')
            .setImage('https://media.discordapp.net/attachments/1402865432624500736/1404699729954213949/footer_nyrp.png?ex=689cccd1&is=689b7b51&hm=0a7c1c67f5244cf1c70a5b5ffa3f54b655dfedc64bba1591ab3183564537edc3&=&format=webp&quality=lossless&width=2636&height=136')
            .setThumbnail(interaction.guild.iconURL())
            .setFooter({ text: `Case ID: ${caseID} | ${formattedDateTime}` })
            .addFields(
                { name: 'User', value: `<@${user.id}>`, inline: true },
                { name: 'New Rank', value: newRank.name, inline: true },
                { name: 'Reason', value: reason }
            )
            .setColor('#494949');

        const promotionChannelId = process.env.PROMOTION_CHANNEL_ID;
        const promotionChannel = interaction.guild.channels.cache.get(promotionChannelId);
        if (promotionChannel) {
            await promotionChannel.send({ content: `<@${user.id}>`, embeds: [embed] });
        } else {
            if (deferred) {
                await interaction.editReply('Promotion channel not found.');
            } else {
                await interaction.reply({ content: 'Promotion channel not found.', flags: 1 << 6 });
            }
            return;
        }

        if (deferred) {
            await interaction.editReply(`Promotion announced for <@${user.id}>.`);
        } else {
            await interaction.reply({ content: `Promotion announced for <@${user.id}>.`, flags: 1 << 6 });
        }
    },
};
