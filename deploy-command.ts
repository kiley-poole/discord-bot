import { REST, Routes } from 'discord.js'
import { config } from 'dotenv'
import { commands } from './commands'
import { Command } from './utils/types'

config()

const clientId = process.env.CLIENT_ID ?? ''
const token = process.env.DISCORD_TOKEN ?? ''
console.log('Commands:', commands) // Add this line to debug

const commandData = commands.map((command: Command) => command.data.toJSON())

async function deployCommands (): Promise<void> {
  const rest = new REST({ version: '10' }).setToken(token)

  try {
    console.log('Started refreshing application (/) commands.')

    await rest.put(Routes.applicationCommands(clientId), { body: commandData })

    console.log('Successfully reloaded application (/) commands.')
  } catch (error) {
    console.error(error)
  }
}

void deployCommands()
