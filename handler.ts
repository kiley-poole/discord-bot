import { entersState, joinVoiceChannel, VoiceConnection, VoiceConnectionStatus } from '@discordjs/voice'
import { Client, CommandInteraction, GuildMember, Snowflake } from 'discord.js'
import { createListeningStream } from './listener'

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

    receiver.speaking.on('start', (userId) => {
      createListeningStream(receiver, userId, client.users.cache.get(userId))
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
