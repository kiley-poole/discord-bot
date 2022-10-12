import { Client, Collection } from 'discord.js'

export interface discordClient {
  client: Client
  commands: Collection<unknown, unknown>
}
