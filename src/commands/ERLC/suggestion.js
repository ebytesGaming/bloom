const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Submit a suggestion')
    .addStringOption(option =>
      option.setName('suggestion')
        .setDescription('Your suggestion')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('category')
        .setDescription('Category of your suggestion')
        .setRequired(true)
        .addChoices(
          { name: 'Bot Features', value: 'Bot Features' },
          { name: 'Server Features', value: 'Server Features' },
          { name: 'Community Features', value: 'Community Features' },
          { name: 'Other', value: 'Other' }
        )),

  async execute(interaction) {
    let deferred = false;
    try {
      await interaction.deferReply({ flags: 1 << 6 });
      deferred = true;
    } catch (error) {
      // Handle deferReply error silently to prevent "Unknown interaction" errors
    }

    const suggestionText = interaction.options.getString('suggestion');
    const category = interaction.options.getString('category');

    const suggestionChannelId = process.env.SUGGESTION_CHANNEL_ID;
    const suggestionChannel = interaction.client.channels.cache.get(suggestionChannelId);
    if (!suggestionChannel) {
      const content = 'Suggestion channel not found!';
      try {
        if (deferred) {
          await interaction.editReply({ content });
        } else {
          await interaction.reply({ content, flags: 1 << 6 });
        }
      } catch {
        try {
          await interaction.reply({ content, flags: 1 << 6 });
        } catch {}
      }
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('New Suggestion')
      .setImage('https://media.discordapp.net/attachments/1402865432624500736/1404937244409729195/footer_nyrp.png?ex=689e52c5&is=689d0145&hm=12789cedd9903f83f2aa58bcac3e8e9ca15280dad22672cb6c166ce75d761110&=&format=webp&quality=lossless&width=2636&height=136')
      .addFields(
        { name: 'Submitter', value: `${interaction.user}`, inline: true },
        { name: 'Category', value: category, inline: true },
        { name: 'Suggestion', value: suggestionText, inline: false }
      )
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setColor('#494949')
      .setFooter({ text: `Suggestion ID: pending` });

    const msg = await suggestionChannel.send({ content: `${interaction.user}`, embeds: [embed] });
    embed.setFooter({ text: `Suggestion ID: ${msg.id}` });
    await msg.edit({ embeds: [embed] });

    const successContent = '✅ Your suggestion has been submitted!';
    try {
      if (deferred) {
        await interaction.editReply({ content: successContent });
      } else {
        await interaction.reply({ content: successContent, flags: 1 << 6 });
      }
    } catch {
      try {
        await interaction.reply({ content: successContent, flags: 1 << 6 });
      } catch {}
    }
  },
};