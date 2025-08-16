const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('orderstatus')
        .setDescription('Set and display the order status for each category.')
        .addStringOption(option =>
            option.setName('clothing')
                .setDescription('Status for Clothing')
                .setRequired(true)
                .addChoices(
                    { name: 'Opened', value: 'Opened' },
                    { name: 'Delayed', value: 'Delayed' },
                    { name: 'Closed', value: 'Closed' },
                ))
        .addStringOption(option =>
            option.setName('livery')
                .setDescription('Status for Livery')
                .setRequired(true)
                .addChoices(
                    { name: 'Opened', value: 'Opened' },
                    { name: 'Delayed', value: 'Delayed' },
                    { name: 'Closed', value: 'Closed' },
                ))
        .addStringOption(option =>
            option.setName('graphics')
                .setDescription('Status for Graphics')
                .setRequired(true)
                .addChoices(
                    { name: 'Opened', value: 'Opened' },
                    { name: 'Delayed', value: 'Delayed' },
                    { name: 'Closed', value: 'Closed' },
                ))
        .addStringOption(option =>
            option.setName('discord')
                .setDescription('Status for Discord')
                .setRequired(true)
                .addChoices(
                    { name: 'Opened', value: 'Opened' },
                    { name: 'Delayed', value: 'Delayed' },
                    { name: 'Closed', value: 'Closed' },
                ))
        .addStringOption(option =>
            option.setName('bot')
                .setDescription('Status for Bot')
                .setRequired(true)
                .addChoices(
                    { name: 'Opened', value: 'Opened' },
                    { name: 'Delayed', value: 'Delayed' },
                    { name: 'Closed', value: 'Closed' },
                ))
        .addStringOption(option =>
            option.setName('photography')
                .setDescription('Status for Photography')
                .setRequired(true)
                .addChoices(
                    { name: 'Opened', value: 'Opened' },
                    { name: 'Delayed', value: 'Delayed' },
                    { name: 'Closed', value: 'Closed' },
                )),
    async execute(interaction) {
        await interaction.deferReply({ flags: 1 << 6 });

        const clothing = interaction.options.getString('clothing');
        const livery = interaction.options.getString('livery');
        const graphics = interaction.options.getString('graphics');
        const discordStatus = interaction.options.getString('discord');
        const bot = interaction.options.getString('bot');
        const photography = interaction.options.getString('photography');

        const statusEmojis = {
            Closed: '<:emoji_25:1405766690054209707><:emoji_26:1405766710572613814><:emoji_27:1405766728599998494><:emoji_28:1405766748946436238>',
            Delayed: '<:emoji_21:1405766575965077504><:emoji_22:1405766596919820288><:emoji_23:1405766620269379674><:emoji_24:1405766641450745937>',
            Opened: '<:emoji_17:1405766441570926684><:emoji_18:1405766475901304963><:emoji_19:1405766515424493578><:emoji_20:1405766539457724446>',
        };

        const ticketBanner = new EmbedBuilder()
            .setImage('https://media.discordapp.net/attachments/1403575808622334095/1403578427306676224/Screenshot_2025-08-05_at_7.52.41_AM.png?ex=68a0a186&is=689f5006&hm=cb6cf3d9558565c1e8a3fee26891aa217cb97a12b86adfff1aa912a8d3757406&=&format=webp&quality=lossless&width=2844&height=828')
            .setColor('#f52a90');

        const embed = new EmbedBuilder()
            .setDescription('Ordering is simple at BeachBoom Studio – where creativity meets quality. Please review our terms of service and pricing before submitting your request. We’re here to bring your ideas to life with competitive rates, skilled designers, and quick turnaround times. Orders are accepted based on designer availability and open on a bi-weekly cycle.')
            .setColor('#f52a90')
            .addFields(
                { name: 'Clothing', value: statusEmojis[clothing] || clothing, inline: true },
                { name: 'Livery', value: statusEmojis[livery] || livery, inline: true },
                { name: 'Graphics', value: statusEmojis[graphics] || graphics, inline: true },
                { name: 'Discord', value: statusEmojis[discordStatus] || discordStatus, inline: true },
                { name: 'Photography', value: statusEmojis[photography] || photography, inline: true },
                { name: 'Bot Services', value: statusEmojis[bot] || bot, inline: true }
            )
            .setImage('https://media.discordapp.net/attachments/1403575808622334095/1403578318380470292/Screenshot_2025-08-05_at_7.57.07_AM.png?ex=68a0a16c&is=689f4fec&hm=436fbb3ea65a523c4aec3345f564e7062494e715aa665dc49f72b1a8aa1bacc2&=&format=webp&quality=lossless&width=2844&height=130');

        try {
            const message = await interaction.channel.messages.fetch('1406133708112789606');
            await message.edit({ embeds: [ticketBanner, embed] });
            await interaction.editReply('Order status updated successfully.');
        } catch (error) {
            console.error('Failed to fetch or edit the message:', error);
            await interaction.editReply('Failed to update order status message.');
        }
    }
};