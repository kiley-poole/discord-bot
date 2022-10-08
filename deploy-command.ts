import { REST, SlashCommandBuilder, Routes } from 'discord.js'
import dotenv from 'dotenv'

dotenv.config()

const clientId = process.env.CLIENT_ID ?? ''
const guildId = process.env.SERVER_ID ?? ''
const token = process.env.DISCORD_TOKEN ?? ''

const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
  new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
  new SlashCommandBuilder().setName('user').setDescription('Replies with user info!')
].map(command => command.toJSON())

const rest = new REST({ version: '10' }).setToken(token)

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
  .then((data: any) => console.log(`Successfully registered ${data.length as string} application commands.`))
  .catch(console.error)
