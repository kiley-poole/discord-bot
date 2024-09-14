import { ChannelType, SlashCommandBuilder } from 'discord.js'
import { Command } from '../utils/types'

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('taunt')
    .setDescription('Alerts the server!'),
  async execute (input) {
    const { client, interaction } = input
    const channel = client.channels.cache.get(interaction.channelId)
    if (channel == null) {
      await interaction.reply({ content: 'Channel not found.', ephemeral: true })
      return
    }
    if (channel?.isTextBased() && channel.type === ChannelType.GuildText) {
      await interaction.deferReply({ ephemeral: true })
      await channel.send("@everyone It's time for our session! Let's get started!")
      await interaction.followUp({ content: 'Message posted to the channel!', ephemeral: true })
    } else {
      await interaction.reply({ content: 'Failed to send the message. Channel not found or is not a text channel.', ephemeral: true })
    }
  }
}

export default command
