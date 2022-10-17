const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { token } = require('./config.json');
const cron = require('cron');
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const LeaderboardRepository = require("./db/leaderboard-repository");
const URL = "https://www.opinionstage.com/blog/trivia-questions/";

const questions = [];
const answers = [];

const AppDAO = require('./db/dao');
const dao = new AppDAO('./db/database.sqlite3');
const lbRepo = new LeaderboardRepository(dao);

//Current Error:
// node:internal/process/promises:279
//             triggerUncaughtException(err, true /* fromPromise */);
//             ^

// Error: read ECONNRESET
//     at TLSWrap.onStreamRead (node:internal/stream_base_commons:217:20) {
//   errno: -4077,
//   code: 'ECONNRESET',
//   syscall: 'read'
// }

//Free Hosting:
//-https://railway.app/
//Or Oracle?

const client = new Client({
	partials: [
		Partials.Message, // for message
		Partials.Channel, // for text channel
		Partials.GuildMember, // for guild member
		Partials.Reaction, // for message reaction
		Partials.GuildScheduledEvent, // for guild events
		Partials.User, // for discord user
		Partials.ThreadMember, // for thread member
	],
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	], 
});

client.once('ready', () => {
	getQuestions();
	console.log('Ready!');
	lbRepo.createTable();

	//Create Slash Commands
	client.commands = new Collection();
	const commandsPath = path.join(__dirname, 'commands');
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		client.commands.set(command.data.name, command);
	}

	//Ask first question after delay to ensure questions are fetched
	setTimeout(() => askQuestion(), 10000);
});


client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

const addPoint = async (user) => {
	lbRepo.createIfNotExists(user.username);
	lbRepo.reward(user.username);
}

//Quiz Game
const getRawData = (URL) => {
    return fetch(URL)
        .then((response) => response.text())
    		.then((data) => {
    		   return data;
    		});
};

const getQuestions = async () => {
    const questionData = await getRawData(URL);
    const $ = cheerio.load(questionData);

    $('ol').find('li').each(function(index, element) {
        questions.push($(element).html().split("<br>")[0]);
        answers.push($(element).html().split("<br>Answer: ")[1]);
        index;
    });
};

const askQuestion = () => {
	const channel = client.channels.cache.get('979059609304195122');

	//Pick random question and answer
	do {
		randNumber = Math.floor(Math.random() * questions.length);
		channel.send('**Question:** ' + questions[randNumber]);
	} while(questions[randNumber].startsWith('<'));

	const filter = m => String(m.content).toLowerCase() === String(answers[randNumber]).toLowerCase();

	channel.awaitMessages({ filter, max: 1, time: 60_000, errors: ['time'] })
		.then(collected => {
		    channel.send(`${collected.first().author} got the correct answer and earned 1 point!`);
			addPoint(collected.first().author);
			askQuestion();
		})
		.catch(collected => {
		    channel.send(`Looks like nobody got the answer this time! The correct answer was: ${answers[randNumber]}`);
			askQuestion();
		});
}

client.login(token);

module.exports = lbRepo
