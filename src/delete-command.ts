import { REST, Routes } from 'discord.js'
import { config } from './config/env'

// Get required environment variables
const clientId = process.env.CLIENT_ID
const guildId = process.env.GUILD_ID
const token = config.token

if (!clientId) {
  console.error('CLIENT_ID must be set in environment variables.')
  process.exit(1)
}

/**
 * Delete all commands from Discord API
 */
async function deleteCommands(): Promise<void> {
  const rest = new REST({ version: '10' }).setToken(token)
  
  try {
    console.log('Started deleting application (/) commands.')
    
    // Delete guild or global commands
    if (guildId) {
      // Guild commands - delete instantly
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: [] }
      )
      console.log(`Successfully deleted all commands for guild ${guildId}.`)
    } else {
      // Global commands - can take up to an hour to update
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: [] }
      )
      console.log('Successfully deleted all global commands. This may take up to an hour to take effect.')
    }
    
  } catch (error) {
    console.error('Error deleting commands:', error)
  }
}

// Execute the deletion function
void deleteCommands()