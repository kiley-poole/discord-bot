import { ChannelType, SlashCommandBuilder } from 'discord.js'
import { Command } from '../utils/types'

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('taunt')
    .setDescription('Alerts the server!')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to mention')
        .setRequired(false)
    ),
  async execute (input) {
    const { client, interaction } = input
    const channel = client.channels.cache.get(interaction.channelId)
    if (!channel) {
      await interaction.reply({ content: 'Channel not found.', ephemeral: true })
      return
    }
    if (channel.isTextBased() && channel.type === ChannelType.GuildText) {
      await interaction.deferReply({ ephemeral: true })
      const user = interaction.options.getUser('user')
      let message = "@everyone It's time for our session! Let's get started!"

      if (user) {
        const member = channel.guild.members.cache.get(user.id)
        if (member && channel.members.has(member.id)) {
          message = `${user} It's time for our session! Let's get started!`
        } else {
          await interaction.followUp({ content: 'The specified user is not in this channel.', ephemeral: true })
          return
        }
      }

      await channel.send(message)
      await interaction.followUp({ content: 'Message posted to the channel!', ephemeral: true })
    } else {
      await interaction.reply({ content: 'Failed to send the message. Channel not found or is not a text channel.', ephemeral: true })
    }
  }
}

export default command
