import { SlashCommandBuilder } from 'discord.js'
import { Command } from '../utils/types'
import { getCharacterName } from '../utils/helpers'

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Get your character name.'),
  async execute (input) {
    const { interaction } = input
    if (interaction.guildId == null) {
      await interaction.reply({ ephemeral: true, content: 'Failed to get character name. Please try again later.' })
      return
    }
    const characterName = getCharacterName(interaction.user.id, interaction.guildId, interaction.channelId)
    if (characterName.length === 0) {
      await interaction.reply({ ephemeral: true, content: 'No character name registered.' })
      return
    }
    await interaction.reply({ ephemeral: true, content: `Your character name is ${characterName}` })
  }
}

export default command
