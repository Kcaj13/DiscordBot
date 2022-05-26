const { SlashCommandBuilder } = require('@discordjs/builders');
const cron = require('cron');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start-quiz')
		.setDescription('Ask questions every 30mins, first user to answer earns points!'),
	async execute(interaction) {

        //Delay: */{mins} * * * * | Current delay: 1 minute
        let scheduledMessage = new cron.CronJob('*/1 * * * *', () => {
            interaction.guild.channels.cache.get('979059609304195122').send('Question:')
        });
                  
        // When you want to start it, use:
        scheduledMessage.start()
    }
      
};