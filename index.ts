import fs from 'node:fs'
import path from 'node:path'
import { Client, GatewayIntentBits, Collection } from 'discord.js'
import dotenv from 'dotenv'
import { discordClient } from './types/client'

dotenv.config()
const TOKEN = process.env.DISCORD_TOKEN

const client: discordClient = {
  client: new Client({ intents: [GatewayIntentBits.Guilds] }),
  commands: new Collection()
}

client.client.once('ready', () => {
  console.log('Ready!')
})

const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.js'))

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const command = require(filePath)
  client.commands.set(command.botCommand.data.name, command.botCommand)
}

client.client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return

  const command: any = client.commands.get(interaction.commandName)

  try {
    await command.execute(interaction)
  } catch (error) {
    console.error(error)
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
  }
})

void client.client.login(TOKEN)
