const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    Collection,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    InteractionType
} = require('discord.js');
const fs = require('fs');
const fetch = require('node-fetch');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

// Load handlers
const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");

// Send ticket dropdown
async function sendTicketMessage() {
    const TICKET_CHANNEL_ID = '1404194903075983523';
    const channel = client.channels.cache.get(TICKET_CHANNEL_ID);
    if (!channel) return console.error("Ticket channel not found!");

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('faq')
            .setLabel('Pricing')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true)
    );

    const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('ticket_select')
            .setPlaceholder('Open a ticket...')
            .addOptions([
                { label: 'Clothing', description: 'Open a clothing ticket', value: 'clothing' },
                { label: 'Livery', description: 'Open a livery ticket', value: 'livery' },
                { label: 'Graphics', description: 'Open a graphics ticket', value: 'graphics' },
                { label: 'Discord', description: 'Open a discord ticket', value: 'discord' },
                { label: 'Bot', description: 'Open a bot ticket', value: 'bot' },
                { label: 'Photography', description: 'Open a photography ticket', value: 'photography' },
            ])
    );

    await channel.send({ components: [row, row2] });
}

// Startup
(async () => {
    for (const file of functions) require(`./functions/${file}`)(client);
    client.handleEvents(eventFiles, "./src/events");
    client.handleCommands(commandFolders, "./src/commands");
    client.login(process.env.token);
})();

// Bot ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    sendTicketMessage();
});

// Interaction handler
client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: 'There was an error executing that command.' });
        }
    } 
    // Ticket creation
    else if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {
        await interaction.deferReply({ flags: 1 << 6 });
        const category = interaction.values[0];
        const guild = interaction.guild;
        const member = interaction.member;
        const channelName = `${category}-${member.user.username.toLowerCase()}`.replace(/[^a-z0-9-]/g, '');

        const parentCategories = {
            clothing: '1403585725055631451',
            livery: '1403585535326289972',
            graphics: '1403585611226546336',
            discord: '1403585962595975179',
            bot: '1403585901900206100',
            photography: '1403585778428149940',
        };
        const parentId = parentCategories[category];

        const existingChannel = guild.channels.cache.find(c => c.name === channelName);
        if (existingChannel) return interaction.editReply({ content: 'You already have an open ticket in this category!' });

        try {
            const channel = await guild.channels.create({
                name: channelName,
                type: 0,
                parent: parentId,
                permissionOverwrites: [
                    { id: guild.roles.everyone.id, deny: ['ViewChannel'] },
                    { id: member.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
                ],
            });

            const fields = [
                { name: 'Discord Username', value: `${member.user.tag}`, inline: true },
                { name: 'Discord ID', value: `\`${member.id}\``, inline: true },
                { name: '\u200B', value: '\u200B', inline: true },
            ];

            const ticketEmbed = new EmbedBuilder()
                .addFields(fields)
                .setColor('#f52a90')
                .setImage('https://media.discordapp.net/attachments/1403575808622334095/1403578318380470292/Screenshot_2025-08-05_at_7.57.07_AM.png?ex=68a14a2c&is=689ff8ac&hm=012c0ffdb521eb0fedd4bc54860c548568a879c3a04ceaac473c00bc352e49a2&=&format=webp&quality=lossless&width=2844&height=130');

            const textembed = new EmbedBuilder()
                .setTitle('Order Opened')
                .setDescription('Thank you for ordering at BeachBloom Studio! A designer will be with you shortly.')
                .setImage('https://media.discordapp.net/attachments/955550139865526273/1364983208382566533/banner.png')
                .setColor('#f52a90');

            const Banner1 = new EmbedBuilder()
                .setImage('https://media.discordapp.net/attachments/1403575808622334095/1403578427306676224/Screenshot_2025-08-05_at_7.52.41_AM.png?ex=68a14a46&is=689ff8c6&hm=b7e0d1405c26311f17ff02d94289a4f20de60538b168e7c8dd50d1014e4a1cd9&=&format=webp&quality=lossless&width=2844&height=828')
                .setColor('#f52a90');

            const ticketControlRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('claim_ticket').setLabel('Claim').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('close_ticket').setLabel('Close').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('close_reason_ticket').setLabel('Close with Reason').setStyle(ButtonStyle.Danger),
            );

            await channel.send({ embeds: [Banner1, textembed, ticketEmbed], components: [ticketControlRow] });
            await interaction.editReply({ content: `<a:loading:1404902683650953337> Your ticket has been created: ${channel}` });
        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: 'There was an error creating your ticket.' });
        }
    }
    // Close ticket button
    else if (interaction.isButton() && interaction.customId === 'close_ticket') {
        await interaction.deferReply({ ephemeral: true });
        const ticketChannel = interaction.channel;
        if (!ticketChannel) return interaction.editReply({ content: 'Channel not found.' });
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
            await interaction.editReply({ content: 'Ticket will be closed and transcript logged.' });
            await ticketChannel.delete('Ticket closed');
        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: 'There was an error closing the ticket.' });
        }
    }
    // Close with reason button
    else if (interaction.isButton() && interaction.customId === 'close_reason_ticket') {
        const modal = new ModalBuilder()
            .setCustomId('close_reason_modal')
            .setTitle('Close Ticket with Reason')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('close_reason_input')
                        .setLabel('Reason for closing')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                )
            );
        await interaction.showModal(modal);
    }
    // Handle modal submission
    else if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'close_reason_modal') {
        await interaction.deferReply({ ephemeral: true });
        const ticketChannel = interaction.channel;
        if (!ticketChannel) return interaction.editReply({ content: 'Channel not found.' });
        const reason = interaction.fields.getTextInputValue('close_reason_input');
        try {
            const messages = await ticketChannel.messages.fetch({ limit: 100 });
            const sorted = Array.from(messages.values()).sort((a, b) => a.createdTimestamp - b.createdTimestamp);
            let transcript = `Transcript for ${ticketChannel.name}:\n`;
            for (const msg of sorted) transcript += `[${new Date(msg.createdTimestamp).toLocaleString()}] ${msg.author.tag}: ${msg.content}\n`;

            const logChannel = interaction.guild.channels.cache.get('1406132914613391463');
            if (logChannel) {
                await logChannel.send({
                    content: `Ticket closed by <@${interaction.user.id}> in ${ticketChannel.name}\n**Reason:** ${reason}`,
                    files: [{ attachment: Buffer.from(transcript, 'utf-8'), name: `${ticketChannel.name}_transcript.txt` }]
                });
            }
            await interaction.editReply({ content: 'Ticket will be closed and transcript (with reason) logged.' });
            await ticketChannel.delete('Ticket closed with reason');
        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: 'There was an error closing the ticket.' });
        }
    }
});