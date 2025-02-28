import { ChannelType, SlashCommandBuilder } from 'discord.js'
import { Command } from '../types/command'
import { GameDB } from '../database/database'

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
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(20))
    .addChannelOption(option =>
      option.setName('summary_channel')
        .setDescription('The channel for game summaries')
        .setRequired(true)),
  
  async execute({ interaction }) {
    try {
      // Get option values
      const gameName = interaction.options.getString('game_name')!
      const gameSystem = interaction.options.getString('game_system')!
      const playerCount = interaction.options.getInteger('player_count')!
      const userId = interaction.user.id
      const channelId = interaction.channelId
      const guildId = interaction.guildId
      const summaryChannel = interaction.options.getChannel('summary_channel')
      
      // Validate inputs
      if (!guildId) {
        await interaction.reply({ 
          ephemeral: true,
          content: 'Failed to register the game. Please try in a server.'
        })
        return
      }
      
      if (!summaryChannel || summaryChannel.type !== ChannelType.GuildText) {
        await interaction.reply({ 
          ephemeral: true,
          content: 'Please provide a valid text channel for summaries.'
        })
        return
      }
      
      // Register the game in the database
      await GameDB.createGame(
        gameName,
        gameSystem,
        playerCount,
        userId,
        guildId,
        channelId,
        summaryChannel.id
      )
      
      // Respond with success message
      await interaction.reply({
        content: `Game registered: **${gameName}** (${gameSystem}) with ${playerCount} players.`,
        ephemeral: false
      })
    } catch (error) {
      console.error('Error registering game:', error)
      await interaction.reply({ 
        ephemeral: true,
        content: 'An error occurred while registering the game. Please try again later.'
      })
    }
  }
}

export default command