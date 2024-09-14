import { REST, Routes } from 'discord.js'
import { config } from 'dotenv'
import { commands } from './commands'
import { Command } from './utils/types'

config()

const clientId = process.env.CLIENT_ID ?? ''
const token = process.env.DISCORD_TOKEN ?? ''
const guildId = process.env.GUILD_ID

if ((clientId == null && !clientId) || (token == null && !token)) {
  console.error('CLIENT_ID and DISCORD_TOKEN must be set in environment variables.')
  process.exit(1)
}

console.log('Commands:', commands)

const commandData = commands.map((command: Command) => command.data.toJSON())

async function deployCommands (): Promise<void> {
  const rest = new REST({ version: '10' }).setToken(token)

  try {
    console.log('Started refreshing application (/) commands.')

    if (guildId != null) {
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commandData }
      )
      console.log(`Successfully reloaded application (/) commands for guild ${guildId}.`)
    } else {
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: commandData }
      )
      console.log('Successfully reloaded global application (/) commands.')
    }
  } catch (error) {
    console.error(error)
  }
}

void deployCommands()
