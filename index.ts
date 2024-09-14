/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { ChannelType, Client, Collection, Events, GatewayIntentBits } from 'discord.js'
import dotenv from 'dotenv'
import chokidar from 'chokidar'
import * as fs from 'fs'
import * as path from 'path'
import { getVoiceConnection } from '@discordjs/voice'
import { splitBySentence } from './utils/sentence-chunker'
import { commands } from './commands'
import { ClientWithCommands } from './utils/client'
import { initializeDatabase } from './database/database'

dotenv.config()

const TOKEN = process.env.DISCORD_TOKEN
const CHANNEL_ID = process.env.CHANNEL_ID
const DIRECTORY_PATH = process.env.DIRECTORY_PATH
const ARCHIVE_PATH = process.env.ARCHIVE_PATH

if (!TOKEN) {
  console.error('DISCORD_TOKEN is not set in environment variables.')
  process.exit(1)
}

if (!CHANNEL_ID) {
  console.error('CHANNEL_ID is not set in environment variables.')
  process.exit(1)
}

if (!DIRECTORY_PATH) {
  console.error('DIRECTORY_PATH is not set in environment variables.')
  process.exit(1)
}

if (!ARCHIVE_PATH) {
  console.error('ARCHIVE_PATH is not set in environment variables.')
  process.exit(1)
}

// Ensure the directories exist
if (!fs.existsSync(DIRECTORY_PATH)) {
  fs.mkdirSync(DIRECTORY_PATH, { recursive: true })
}

if (!fs.existsSync(ARCHIVE_PATH)) {
  fs.mkdirSync(ARCHIVE_PATH, { recursive: true })
}

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages] }) as ClientWithCommands
client.commands = new Collection()

for (const command of commands) {
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command)
  } else {
    console.log('[WARNING] The command is missing a required "data" or "execute" property.')
  }
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user?.tag ?? 'unknown user'}!`)

  const watcher = chokidar.watch(DIRECTORY_PATH, {
    ignored: /^\./,
    persistent: true
  })

  watcher.on('add', async filePath => {
    if (path.extname(filePath) === '.txt') {
      try {
        const fileContents = await fs.promises.readFile(filePath, 'utf-8')
        const channel = client.channels.cache.get(CHANNEL_ID)

        if (channel?.isTextBased() && channel.type === ChannelType.GuildText) {
          const fileName = path.basename(filePath)
          const initialMessage = await channel.send(`Summary for ${fileName}:`)

          const thread = await initialMessage.startThread({
            name: `Summary Thread for ${fileName}`,
            autoArchiveDuration: 60
          })

          const chunks = splitBySentence(fileContents)
          for (const chunk of chunks) {
            await thread.send(chunk)
          }

          try {
            fs.renameSync(filePath, path.join(ARCHIVE_PATH, fileName))
          } catch (error) {
            console.warn(error)
          }
        }
      } catch (error) {
        console.error('Error reading file:', error)
      }
    }
  })
})

const recordable = new Set<string>()

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return

  const interactionClient = interaction.client as ClientWithCommands
  const command = interactionClient.commands.get(interaction.commandName)

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`)
    return
  }

  if (!interaction.guildId) {
    await interaction.reply({ content: 'This command is not available in DMs.', ephemeral: true })
    return
  }

  try {
    await command.execute({ interaction, recordable, client, connection: getVoiceConnection(interaction.guildId) })
  } catch (error) {
    console.error(error)
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true })
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
    }
  }
})

async function startBot (): Promise<void> {
  await initializeDatabase()

  client.login(TOKEN).catch(console.error)
}

void startBot()
