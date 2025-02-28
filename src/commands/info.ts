import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import { Command } from '../types/command'
import { getCharacterName } from '../utils/helpers'
import { version } from '../../package.json'
import * as os from 'os'

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Get information about the bot and your character'),
  
  async execute({ interaction }) {
    // Basic validation
    if (interaction.guildId == null) {
      await interaction.reply({ 
        ephemeral: true, 
        content: 'Failed to get information. Please try again in a server.' 
      })
      return
    }
    
    // Get character name if registered
    const characterName = getCharacterName(
      interaction.user.id, 
      interaction.guildId, 
      interaction.channelId
    )
    
    // Create embed for better presentation
    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('Bot Information')
      .setDescription('Information about the Discord bot and your character')
      .addFields(
        { 
          name: 'Character Name', 
          value: characterName || 'No character registered' 
        },
        { 
          name: 'Bot Version', 
          value: version || '1.0.0', 
          inline: true 
        },
        { 
          name: 'Uptime', 
          value: formatUptime(process.uptime()), 
          inline: true 
        }
      )
      .setTimestamp()
    
    // Send the response
    await interaction.reply({ 
      ephemeral: true, 
      embeds: [embed]
    })
  }
}

/**
 * Format uptime in a readable format
 */
function formatUptime(uptime: number): string {
  const days = Math.floor(uptime / 86400)
  const hours = Math.floor((uptime % 86400) / 3600)
  const minutes = Math.floor((uptime % 3600) / 60)
  const seconds = Math.floor(uptime % 60)
  
  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  parts.push(`${seconds}s`)
  
  return parts.join(' ')
}

export default command