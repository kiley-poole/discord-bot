import { SlashCommandBuilder } from 'discord.js'
import { Command } from '../utils/types'

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Have the bot leave the voice channel you are in.'),
  async execute (input) {
    const { interaction, recordable, connection } = input
    if (connection != null) {
      connection.destroy()
      recordable.clear()
      await interaction.reply({ ephemeral: true, content: 'Left the channel!' })
    } else {
      await interaction.reply({ ephemeral: true, content: 'Not playing in this server!' })
    }
  }
}

export default command
