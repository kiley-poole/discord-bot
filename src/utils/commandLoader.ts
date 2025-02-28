import { Collection } from 'discord.js'
import * as fs from 'fs'
import * as path from 'path'
import { ClientWithCommands } from '../types/client'
import { Command } from '../types/command'

/**
 * Dynamically loads all command modules from the commands directory
 */
export function loadCommands(client: ClientWithCommands): void {
  client.commands = new Collection()
  const commandsPath = path.join(__dirname, '..', 'commands')
  
  // Get all command files
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter(file => (file.endsWith('.js') || file.endsWith('.ts')) && !file.includes('index'))

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    
    try {
      const command = require(filePath).default as Command
      
      // Set a new item in the Collection with the command name as the key and the command module as the value
      if (command && 'data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command)
        console.log(`Loaded command: ${command.data.name}`)
      } else {
        console.warn(`The command at ${filePath} is missing a required "data" or "execute" property`)
      }
    } catch (error) {
      console.error(`Error loading command from ${filePath}:`, error)
    }
  }
}