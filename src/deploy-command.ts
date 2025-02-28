import { REST, Routes } from 'discord.js'
import { commands } from './commands'
import { Command } from './types/command'
import { config } from './config/env'

// Get required environment variables
const clientId = process.env.CLIENT_ID
const guildId = process.env.GUILD_ID
const token = config.token

if (!clientId) {
  console.error('CLIENT_ID must be set in environment variables.')
  process.exit(1)
}

// Extract command data from commands
const commandData = commands.map((command: Command) => command.data.toJSON())

/**
 * Deploy commands to Discord API
 */
async function deployCommands(): Promise<void> {
  const rest = new REST({ version: '10' }).setToken(token)
  
  try {
    console.log(`Started refreshing ${commandData.length} application (/) commands.`)
    
    let response
    
    // Deploy to guild or globally
    if (guildId) {
      // Guild commands - update instantly, only work in specified guild
      response = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commandData }
      )
      console.log(`Successfully reloaded application commands for guild ${guildId}.`)
    } else {
      // Global commands - can take up to an hour to update, work in all guilds
      response = await rest.put(
        Routes.applicationCommands(clientId),
        { body: commandData }
      )
      console.log('Successfully reloaded global application commands.')
    }
    
    console.log(`Deployed ${Array.isArray(response) ? response.length : '0'} commands.`)
  } catch (error) {
    console.error('Error deploying commands:', error)
  }
}

// Execute the deployment function
void deployCommands()