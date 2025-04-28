const { Client, GatewayIntentBits } = require('discord.js');
const bot = new Client({ intents: [GatewayIntentBits.Guilds] });

const responses = [
  "Yes.",
  "No.",
  "Maybe.",
  "Ask again later.",
  "I'm not sure."
];

bot.on('messageCreate', (message) => {
  if (message.content.toLowerCase() === '!8ball') {
    const response = responses[Math.floor(Math.random() * responses.length)];
    message.channel.send(response);
  }
});

bot.login(process.env.DISCORD_TOKEN);
