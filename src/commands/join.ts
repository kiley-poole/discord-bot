import { GuildMember, SlashCommandBuilder } from 'discord.js'
import { joinVoiceChannel, entersState, VoiceConnectionStatus } from '@discordjs/voice'
import { createListeningStream } from '../services/voice/listener'
import { Command } from '../types/command'
import { addToMap } from '../utils/helpers' // This will need to be migrated as well

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('join')
    .setDescription('Have the bot join the voice channel you are in.'),
  
  async execute({ interaction, recordable, client, connection }) {
    await interaction.deferReply()
    
    if (connection == null) {
      if (interaction.member instanceof GuildMember && interaction.member.voice.channel != null) {
        const channel = interaction.member.voice.channel
        
        connection = joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          selfDeaf: false,
          selfMute: true,
          adapterCreator: channel.guild.voiceAdapterCreator
        })
        
        if (interaction.guildId != null) {
          await addToMap(interaction.guildId, interaction.channelId)
        }
      } else {
        await interaction.followUp('Join a voice channel and then try that again!')
        return
      }
    }
    
    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 20e3)
      const receiver = connection.receiver
      
      // Set up speaking event handler
      receiver.speaking.on('start', async (userId) => {
        if (!recordable.has(userId)) {
          recordable.add(userId)
          
          if (interaction.guildId != null) {
            await createListeningStream(
              receiver, 
              userId, 
              interaction.guildId, 
              interaction.channelId, 
              recordable, 
              client.users.cache.get(userId)
            )
          }
        }
      })
      
      await interaction.followUp('Ready to record!')
    } catch (error) {
      console.warn('Voice connection error:', error)
      await interaction.followUp('Failed to join voice channel within 20 seconds, please try again later!')
    }
  }
}

export default command