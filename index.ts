import { Client, GatewayIntentBits } from 'discord.js'
import dotenv from 'dotenv'

dotenv.config()
const TOKEN = process.env.DISCORD_TOKEN

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

client.once('ready', () => {
  console.log('Ready!')
})

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return

  const { commandName } = interaction

  switch (commandName) {
    case 'ping':
      await interaction.reply('Pong!')
      break
    case 'server':
      await interaction.reply(
      `Server name: ${interaction.guild?.name ?? 'Placeholder'}
Total Members: ${interaction.guild?.memberCount ?? 0}
Server Created: ${interaction.guild?.createdAt.toDateString() ?? 'Today'}
       `)
      break
    case 'user':
      await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`)
      break
  }
})

void client.login(TOKEN)
