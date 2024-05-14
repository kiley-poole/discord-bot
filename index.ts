/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { ChannelType, Client, GatewayIntentBits, Interaction } from 'discord.js'
import dotenv from 'dotenv'
import chokidar from 'chokidar'
import * as fs from 'fs'
import * as path from 'path'
import { interactionHandlers } from './handler'
import { getVoiceConnection } from '@discordjs/voice'
import { splitBySentence } from './sentence-chunker'
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages] })

dotenv.config()

const TOKEN = process.env.DISCORD_TOKEN
const CHANNEL_ID = '1149792386650755072'
// const CHANNEL_ID = '1188299492945035356'
const DIRECTORY_PATH = '/home/kpoole/translator/summaries'
const ARCHIVE_PATH = '/home/kpoole/translator/archive/summaries'

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag ?? 'unknown user'}!`)
})

client.once('ready', () => {
  const watcher = chokidar.watch(DIRECTORY_PATH, {
    ignored: /^\./, // ignore dotfiles
    persistent: true
  })

  watcher.on('add', async filePath => {
    if (path.extname(filePath) === '.txt') {
      const fileContents = fs.readFileSync(filePath, 'utf-8')
      const channel = client.channels.cache.get(CHANNEL_ID)

      if (channel?.isTextBased() && channel.type === ChannelType.GuildText) {
        const fileName = path.basename(filePath)
        const initialMessage = await channel.send(`Summary for ${fileName}:`)

        // Start a thread from the initial message
        const thread = await initialMessage.startThread({
          name: `Summary Thread for ${fileName}`,
          autoArchiveDuration: 60 // auto archive after 1 hour of inactivity
        })

        const chunks = splitBySentence(fileContents)
        for (const chunk of chunks) {
          await thread.send(chunk)
        }

        // Move the file to the archive
        try {
          fs.renameSync(filePath, path.join(ARCHIVE_PATH, fileName))
        } catch (error) {
          console.warn(error)
        }
      }
    }
  })
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
