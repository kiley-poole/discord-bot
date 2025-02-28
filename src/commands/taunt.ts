import { ChannelType, SlashCommandBuilder } from 'discord.js'
import { Command } from '../types/command'

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('taunt')
    .setDescription('Alerts the server!')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to mention')
        .setRequired(false)
    ),
    
  async execute({ interaction, client }) {
    // Get the channel
    const channel = client.channels.cache.get(interaction.channelId)
    
    if (!channel) {
      await interaction.reply({ 
        content: 'Channel not found.', 
        ephemeral: true 
      })
      return
    }
    
    // Verify the channel is a text channel
    if (channel.isTextBased() && channel.type === ChannelType.GuildText) {
      await interaction.deferReply({ ephemeral: true })
      
      // Get optional user mention
      const user = interaction.options.getUser('user')
      let message = "@everyone It's time for our session! Let's get started!"
      
      // If a specific user was provided, mention them instead of everyone
      if (user) {
        const member = channel.guild.members.cache.get(user.id)
        
        // Check if the mentioned user is in the channel
        if (member && channel.members.has(member.id)) {
          message = `${user} It's time for our session! Let's get started!`
        } else {
          await interaction.followUp({ 
            content: 'The specified user is not in this channel.', 
            ephemeral: true 
          })
          return
        }
      }
      
      // Send the message to the channel
      await channel.send(message)
      
      // Confirm to the command user
      await interaction.followUp({ 
        content: 'Message posted to the channel!', 
        ephemeral: true 
      })
    } else {
      await interaction.reply({ 
        content: 'Failed to send the message. Channel not found or is not a text channel.', 
        ephemeral: true 
      })
    }
  }
}

export default command