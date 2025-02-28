import * as fs from 'fs'
import * as path from 'path'
import { ClientWithCommands } from '../types/client'

/**
 * Dynamically loads all event handlers from the events directory
 */
export function loadEvents(client: ClientWithCommands, recordable: Set<string>): void {
  const eventsPath = path.join(__dirname, '..', 'events')
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'))

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file)
    const event = require(filePath).default
    
    if (!event || !event.name) {
      console.warn(`Event file ${file} is missing required properties`)
      continue
    }
    
    try {
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client, recordable))
      } else {
        client.on(event.name, (...args) => event.execute(...args, client, recordable))
      }
      
      console.log(`Loaded event: ${event.name}`)
    } catch (error) {
      console.error(`Error loading event ${file}:`, error)
    }
  }
}