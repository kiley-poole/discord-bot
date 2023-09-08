import { Client, GatewayIntentBits, Interaction } from 'discord.js'
import dotenv from 'dotenv'
import { interactionHandlers } from './handler'
import { getVoiceConnection } from '@discordjs/voice'
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages] })

dotenv.config()

const TOKEN = process.env.DISCORD_TOKEN

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag ?? 'unknown user'}!`)
})

const recordable = new Set<string>()

client.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isCommand() || (interaction.guildId == null)) return

  const handler = interactionHandlers.get(interaction.commandName)

  try {
    if (handler != null) {
      await handler(interaction, recordable, client, getVoiceConnection(interaction.guildId))
    } else {
      await interaction.reply('Unknown command')
    }
  } catch (error) {
    console.warn(error)
  }
})

void client.login(TOKEN)
