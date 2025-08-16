

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('beachboom')
    .setDescription('Send the BeachBoom Studio order embed'),

  async execute(interaction) {
    const ticketBanner = new EmbedBuilder()
      .setImage('https://media.discordapp.net/attachments/1403575808622334095/1403578427306676224/Screenshot_2025-08-05_at_7.52.41_AM.png?ex=68a0a186&is=689f5006&hm=cb6cf3d9558565c1e8a3fee26891aa217cb97a12b86adfff1aa912a8d3757406&=&format=webp&quality=lossless&width=2844&height=828')
      .setColor('#f52a90');

    const ticketEmbed = new EmbedBuilder()
      .setDescription('Ordering is simple at BeachBoom Studio – where creativity meets quality. Please review our terms of service and pricing before submitting your request. We’re here to bring your ideas to life with competitive rates, skilled designers, and quick turnaround times. Orders are accepted based on designer availability and open on a bi-weekly cycle.')
      .setColor('#f52a90')
      .addFields(
        { name: 'Clothing', value: '<:emoji_25:1405766690054209707><:emoji_26:1405766710572613814><:emoji_27:1405766728599998494><:emoji_28:1405766748946436238>', inline: true },
        { name: 'Livery', value: '<:emoji_25:1405766690054209707><:emoji_26:1405766710572613814><:emoji_27:1405766728599998494><:emoji_28:1405766748946436238>', inline: true },
        { name: 'Graphics', value: '<:emoji_25:1405766690054209707><:emoji_26:1405766710572613814><:emoji_27:1405766728599998494><:emoji_28:1405766748946436238>', inline: true },
        { name: 'Discord', value: '<:emoji_25:1405766690054209707><:emoji_26:1405766710572613814><:emoji_27:1405766728599998494><:emoji_28:1405766748946436238>', inline: true },
        { name: 'Photography', value: '<:emoji_25:1405766690054209707><:emoji_26:1405766710572613814><:emoji_27:1405766728599998494><:emoji_28:1405766748946436238>', inline: true },
        { name: 'Bot Services', value: '<:emoji_25:1405766690054209707><:emoji_26:1405766710572613814><:emoji_27:1405766728599998494><:emoji_28:1405766748946436238>', inline: true }
      )
      .setImage('https://media.discordapp.net/attachments/1403575808622334095/1403578318380470292/Screenshot_2025-08-05_at_7.57.07_AM.png?ex=68a0a16c&is=689f4fec&hm=436fbb3ea65a523c4aec3345f564e7062494e715aa665dc49f72b1a8aa1bacc2&=&format=webp&quality=lossless&width=2844&height=130');

    const channel = interaction.client.channels.cache.get('1404194903075983523');
    if (!channel) {
      return interaction.reply({ content: 'Target channel not found!', ephemeral: true });
    }
    await channel.send({ embeds: [ticketBanner, ticketEmbed] });
    await interaction.deferReply({ flags: 1 << 6 });
    await interaction.editReply({ content: 'Embed sent successfully!' });
  }
}