import { SlashCommandBuilder } from 'discord.js'
import { Command } from '../types/command'
import { CharacterDB } from '../database/database'

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Register your character name.')
    .addStringOption(option =>
      option.setName('character_name')
        .setDescription('Your character name')
        .setRequired(true)
    ),
    
  async execute({ interaction }) {
    const characterName = interaction.options.get('character_name')?.value
    const { guildId, channelId } = interaction
    const userId = interaction.user.id
    
    if (guildId == null || channelId == null) {
      await interaction.reply({ 
        ephemeral: true, 
        content: 'Failed to register character name. Please try again later.' 
      })
      return
    }
    
    if (characterName != null && typeof characterName === 'string' && characterName.length > 0) {
      try {
        await CharacterDB.registerCharacterName(characterName, userId, guildId, channelId)
        await interaction.reply({ 
          ephemeral: true, 
          content: `Character name registered as ${characterName}!` 
        })
      } catch (error) {
        console.error('Error registering character:', error)
        await interaction.reply({ 
          ephemeral: true, 
          content: 'An error occurred while registering your character name. Please try again later.' 
        })
      }
    } else {
      await interaction.reply({ 
        ephemeral: true, 
        content: 'Please provide a valid character name.' 
      })
    }
  }
}

export default command