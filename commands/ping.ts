import { SlashCommandBuilder } from 'discord.js'
import { command } from '../types/command-types'

export const botCommand: command = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  async execute (interaction) {
    await interaction.reply('Pong!')
  }
}
