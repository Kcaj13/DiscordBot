const { SlashCommandBuilder } = require('@discordjs/builders');
const cron = require('cron');
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const URL = "https://www.opinionstage.com/blog/trivia-questions/";

const getRawData = (URL) => {
    return fetch(URL)
       .then((response) => response.text())
       .then((data) => {
          return data;
       });
 };

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start-quiz')
		.setDescription('Ask questions every 30mins, first user to answer earns points!'),
	async execute(interaction) {

        //Delay: */{mins} * * * * | Current delay: 1 minute
        let scheduledMessage = new cron.CronJob('*/1 * * * *', () => {

            const getQuestion = async () => {
                const questionData = await getRawData(URL);
                const $ = cheerio.load(questionData);
            
                const questions = [];
                const answers = [];
            
                $('ol').find('li').each(function(index, element) {
                    questions.push($(element).html().split("<br>")[0]);
                    answers.push($(element).html().split("<br>Answer: ")[1]);
                    index;
                });
            
                var randNumber = Math.floor(Math.random() * 200)
            
                interaction.guild.channels.cache.get('979059609304195122').send('Question: ' + questions[randNumber]);
                interaction.guild.channels.cache.get('979059609304195122').send('Answer: ' + answers[randNumber]);
            };

            getQuestion();

            const collector = interaction.channel.createMessageCollector({ time: 15000 });
            
            collector.on('collect', async (msg) => {
                console.log(`Collected ${msg.content}`);
                interaction.guild.channels.cache.get('979059609304195122').send('Answer recieved');
            });
            
            collector.on('end', collected => {
                console.log(`Collected ${collected.size} items`);
            });
          
        });

        // When you want to start it, use:
        scheduledMessage.start();
    }
      
};