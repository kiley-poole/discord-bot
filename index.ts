import fs from 'node:fs'
import path from 'node:path'
import { Client, GatewayIntentBits, Collection } from 'discord.js'
import dotenv from 'dotenv'
// import { discordClient } from './types/client'

dotenv.config()
const TOKEN = process.env.DISCORD_TOKEN

const client: any = new Client({ intents: [GatewayIntentBits.Guilds] })
client.commands = new Collection()

const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.js'))
const eventsPath = path.join(__dirname, 'events')
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const command = require(filePath)
  client.commands.set(command.botCommand.data.name, command.botCommand)
}

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const event = require(filePath)
  if (event.once as boolean) {
    client.once(event.name, (...args: any) => event.execute(...args))
  } else {
    client.on(event.name, (...args: any) => event.execute(...args))
  }
}

void client.login(TOKEN)
