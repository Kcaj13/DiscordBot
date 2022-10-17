const { SlashCommandBuilder } = require('@discordjs/builders');
const lbRepo = require('../index')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Display the quiz leaderboard!'),
	async execute(interaction) {
		let leaderboard = '```\n';

		leaderboard += '»»————————⍟————————««\n\n';

		lbRepo.getAll()
			.then((users) => {
				users.forEach((user, index) => {
					console.log(`\nRetreived user ${user.username} from database`);
					leaderboard += `${index + 1}. ${user.username} - ${user.points > 1 ? `${user.points} points\n` : `${user.points} point\n`}`;
				});
			})

		setTimeout(() => {
			leaderboard += '\n»»————————⍟————————««```\n';
			interaction.reply(leaderboard);
		}, 1000);
		
    }
      
};