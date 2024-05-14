/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { entersState, joinVoiceChannel, VoiceConnection, VoiceConnectionStatus } from '@discordjs/voice'
import { Client, CommandInteraction, GuildMember, Snowflake } from 'discord.js'
import { createListeningStream } from './listener'
import { promises as fs } from 'node:fs'

const CHARACTER_FILE_PATH = './characters.json'

async function join (
  interaction: CommandInteraction,
  recordable: Set<Snowflake>,
  client: Client,
  connection?: VoiceConnection
): Promise<any> {
  await interaction.deferReply()
  if (connection == null) {
    if (interaction.member instanceof GuildMember && (interaction.member.voice.channel != null)) {
      const channel = interaction.member.voice.channel
      connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        selfDeaf: false,
        selfMute: true,
        adapterCreator: channel.guild.voiceAdapterCreator
      })
    } else {
      await interaction.followUp('Join a voice channel and then try that again!')
      return
    }
  }

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 20e3)
    const receiver = connection.receiver

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    receiver.speaking.on('start', async (userId) => {
      if (!recordable.has(userId)) {
        recordable.add(userId)
        await createListeningStream(receiver, userId, recordable, client.users.cache.get(userId))
      }
    })
  } catch (error) {
    console.warn(error)
    await interaction.followUp('Failed to join voice channel within 20 seconds, please try again later!')
  }

  await interaction.followUp('Ready!')
}

async function leave (
  interaction: CommandInteraction,
  recordable: Set<Snowflake>,
  _client: Client,
  connection?: VoiceConnection
): Promise<any> {
  if (connection != null) {
    connection.destroy()
    recordable.clear()
    await interaction.reply({ ephemeral: true, content: 'Left the channel!' })
  } else {
    await interaction.reply({ ephemeral: true, content: 'Not playing in this server!' })
  }
}

async function register (
  interaction: CommandInteraction,
  _recordable: Set<Snowflake>,
  _client: Client,
  _connection?: VoiceConnection
): Promise<any> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const characterName: string = interaction.options.get('character_name')!.value! as string
  if (characterName) {
    await setCharacterName(interaction.user.id, characterName)
    await interaction.reply(`Character name registered as ${characterName}!`)
  } else {
    await interaction.reply('Please provide a valid character name.')
  }
}

export const interactionHandlers = new Map<
string,
(
  interaction: CommandInteraction,
  recordable: Set<Snowflake>,
  client: Client,
  connection?: VoiceConnection,
) => Promise<void>
>()

interactionHandlers.set('join', join)
interactionHandlers.set('leave', leave)
interactionHandlers.set('register', register)

export async function getCharacterName (userId: string): Promise<string> {
  const data = JSON.parse(await fs.readFile(CHARACTER_FILE_PATH, 'utf-8'))
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  return data[userId] || userId
}

async function setCharacterName (userId: string, characterName: string): Promise<void> {
  const data = JSON.parse(await fs.readFile(CHARACTER_FILE_PATH, 'utf-8'))
  data[userId] = characterName
  await fs.writeFile(CHARACTER_FILE_PATH, JSON.stringify(data, null, 2))
}
