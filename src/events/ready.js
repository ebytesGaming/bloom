const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log('Ready!')
        console.log('Status Changed');

        try {
            await client.user.setPresence({
                activities: [
                    {
                        name: 'over the Studio',
                        type: ActivityType.Watching,
                    },
                ],
                status: 'online',
            });
        } catch (error) {
            console.error(error);
        }
    },
};