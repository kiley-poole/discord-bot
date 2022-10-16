import { REST, Routes } from 'discord.js'
import dotenv from 'dotenv'

import fs from 'node:fs'
import path from 'node:path'

dotenv.config()

const clientId = process.env.CLIENT_ID ?? ''
const guildId = process.env.SERVER_ID ?? ''
const token = process.env.DISCORD_TOKEN ?? ''

const commands = []
const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const command = require(filePath)
  commands.push(command.botCommand.data.toJSON())
}

const rest = new REST({ version: '10' }).setToken(token)

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
  .then((data: any) => console.log(`Successfully registered ${data.length as string} applications commands.`))
  .catch(console.error)
