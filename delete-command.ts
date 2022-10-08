import { REST, Routes } from 'discord.js'
import dotenv from 'dotenv'

dotenv.config()

const clientId = process.env.CLIENT_ID ?? ''
const guildId = process.env.SERVER_ID ?? ''
const token = process.env.DISCORD_TOKEN ?? ''

const rest = new REST({ version: '10' }).setToken(token)

// for guild-based commands
rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
  .then(() => console.log('Successfully deleted all guild commands.'))
  .catch(console.error)

// for global commands
rest.put(Routes.applicationCommands(clientId), { body: [] })
  .then(() => console.log('Successfully deleted all application commands.'))
  .catch(console.error)

rest.delete(Routes.applicationGuildCommand(clientId, guildId, 'commandId'))
  .then(() => console.log('Successfully deleted guild command'))
  .catch(console.error)

// for global commands
rest.delete(Routes.applicationCommand(clientId, 'commandId'))
  .then(() => console.log('Successfully deleted application command'))
  .catch(console.error)
