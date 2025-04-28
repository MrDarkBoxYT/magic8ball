const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const PREFIX = '!';
const DATA_FILE = 'data.json';

let userData = {};
if (fs.existsSync(DATA_FILE)) {
  userData = JSON.parse(fs.readFileSync(DATA_FILE));
}

// Utility: Save user data
function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(userData, null, 2));
}

// Utility: Get or create user data
function getUser(id) {
  if (!userData[id]) {
    userData[id] = {
      xp: 0,
      level: 1,
      coins: 100,
      lastDaily: 0
    };
  }
  return userData[id];
}

// Random 8ball responses
const responses = [
  "Yes.", "No.", "Maybe.", "Absolutely!", "Definitely not.", "Ask again later.",
  "Without a doubt.", "Highly unlikely.", "It is certain.", "I wouldn't count on it."
];

client.on('messageCreate', async message => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  const [command, ...args] = message.content.slice(PREFIX.length).split(/\s+/);
  const user = getUser(message.author.id);

  // XP + level system
  user.xp += Math.floor(Math.random() * 10) + 5;
  if (user.xp >= user.level * 100) {
    user.xp = 0;
    user.level++;
    message.channel.send(`${message.author}, you leveled up to **${user.level}**!`);
  }

  if (command === 'ask') {
    const reply = responses[Math.floor(Math.random() * responses.length)];
    message.reply(`🎱 ${reply}`);
  }

  if (command === 'balance' || command === 'bal') {
    message.reply(`💰 You have **${user.coins} coins**.`);
  }

  if (command === 'rank') {
    message.reply(`📊 You are level **${user.level}** with **${user.xp} XP**.`);
  }

  if (command === 'daily') {
    const now = Date.now();
    const cooldown = 1000 * 60 * 60 * 24;
    if (now - user.lastDaily < cooldown) {
      const remaining = ((cooldown - (now - user.lastDaily)) / 3600000).toFixed(1);
      message.reply(`⏳ You already claimed daily! Try again in ${remaining} hours.`);
    } else {
      const reward = 200;
      user.coins += reward;
      user.lastDaily = now;
      message.reply(`🎉 You claimed your daily reward of **${reward} coins**!`);
    }
  }

  if (command === 'gamble') {
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount <= 0) return message.reply('Enter a valid amount to gamble.');
    if (user.coins < amount) return message.reply('You don’t have enough coins!');

    const win = Math.random() < 0.5;
    if (win) {
      user.coins += amount;
      message.reply(`🎉 You won **${amount} coins**!`);
    } else {
      user.coins -= amount;
      message.reply(`💸 You lost **${amount} coins**. Better luck next time!`);
    }
  }

  saveData(); // Save after every command
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);
