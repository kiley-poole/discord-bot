import { SlashCommandBuilder } from 'discord.js'
import { Command } from '../utils/types'
import { createGame } from '../database/database'

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('register-game')
    .setDescription('Register a game for the channel.')
    .addStringOption(option =>
      option.setName('game_name')
        .setDescription('The name of the game')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('game_system')
        .setDescription('The system of the game')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('player_count')
        .setDescription('The number of players')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('summary_channel')
        .setDescription('The channel for game summaries')
        .setRequired(true)),
  async execute (input) {
    const { interaction } = input
    try {
      const gameName = interaction.options.get('game_name')?.value as string
      const gameSystem = interaction.options.get('game_system')?.value as string
      const playerCount = interaction.options.get('player_count')?.value as number
      const userId = interaction.user.id
      const channelId = interaction.channelId
      const guildId = interaction.guildId
      const summaryChannel = interaction.options.get('summary_channel')?.channel

      if (guildId == null) {
        await interaction.reply('Failed to register the game. Please try again later.')
        return
      }

      if ((gameName.length === 0) || (gameSystem.length === 0) || playerCount === null || (summaryChannel == null)) {
        await interaction.reply('Please provide all required inputs: game name, game system, summary channel and player count.')
        return
      }

      await createGame(gameName, gameSystem, playerCount, userId, guildId, channelId, summaryChannel.id)

      await interaction.reply(`Game registered: ${gameName} (${gameSystem}) with ${playerCount} players.`)
    } catch (error) {
      await interaction.reply('An error occurred while registering the game.')
    }
  }
}

export default command
