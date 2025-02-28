import { Client, Collection } from 'discord.js'
import { Command } from './command'

export interface ClientWithCommands extends Client {
  commands: Collection<string, Command>
}