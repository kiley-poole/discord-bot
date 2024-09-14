import { Client, Collection } from 'discord.js'
import { Command } from './types'

export interface ClientWithCommands extends Client {
  commands: Collection<string, Command>
}
