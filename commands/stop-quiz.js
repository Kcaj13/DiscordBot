const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop-quiz')
		.setDescription('Stop the quiz from running!'),
	async execute() {
        //Export the scheduledMessage cron here then run .stop??
    }
      
};