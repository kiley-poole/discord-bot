import { Client, GatewayIntentBits } from 'discord.js'
import { config } from './config/env'
import { loadCommands } from './utils/commandLoader'
import { loadEvents } from './utils/eventLoader'
import { initializeDatabase } from './database/database'
import { ClientWithCommands } from './types/client'

// The set of users who are currently being recorded
const recordable = new Set<string>()

/**
 * Initialize and start the Discord bot
 */
async function startBot(): Promise<void> {
  try {
    // Initialize the database
    await initializeDatabase()
    
    // Create a new client instance
    const client = new Client({ 
      intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildVoiceStates, 
        GatewayIntentBits.GuildMessages
      ] 
    }) as ClientWithCommands
    
    // Load commands and events
    loadCommands(client)
    loadEvents(client, recordable)
    
    // Login to Discord with the token
    console.log('Logging in to Discord...')
    await client.login(config.token)
    
  } catch (error) {
    console.error('Failed to start bot:', error)
    process.exit(1)
  }
}

// Start the bot
void startBot()