import { SlashCommandBuilder } from 'discord.js'
import { command } from '../types/command-types'

export const botCommand: command = {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('Replies with server info!'),
  async execute (interaction) {
    await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`)
  }
}
