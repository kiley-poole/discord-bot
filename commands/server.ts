import { SlashCommandBuilder } from 'discord.js'
import { command } from '../types/command-types'

export const botCommand: command = {
  data: new SlashCommandBuilder()
    .setName('server')
    .setDescription('Replies with server info!'),
  async execute (interaction) {
    await interaction.reply(
        `Server name: ${interaction.guild?.name ?? 'Placeholder'}\nTotal Members: ${interaction.guild?.memberCount ?? 0}\nServer Created: ${interaction.guild?.createdAt.toDateString() ?? 'Today'}`)
  }
}
