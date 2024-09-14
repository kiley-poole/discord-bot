import { GuildMember, SlashCommandBuilder } from 'discord.js'
import { Command } from '../utils/types'
import { joinVoiceChannel, entersState, VoiceConnectionStatus } from '@discordjs/voice'
import { createListeningStream } from '../voice/listener'
import { addToMap } from '../utils/helpers'

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('join')
    .setDescription('Have the bot join the voice channel you are in.'),
  async execute (input) {
    let { interaction, recordable, client, connection } = input
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
        if (interaction.guildId != null) {
          addToMap(interaction.guildId, interaction.channelId)
        }
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
          if (interaction.guildId != null) {
            await createListeningStream(receiver, userId, interaction.guildId, interaction.channelId, recordable, client.users.cache.get(userId))
          }
        }
      })
    } catch (error) {
      console.warn(error)
      await interaction.followUp('Failed to join voice channel within 20 seconds, please try again later!')
    }

    await interaction.followUp('Ready!')
  }
}

export default command
