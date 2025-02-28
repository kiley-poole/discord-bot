import { Events, Interaction } from 'discord.js'
import { getVoiceConnection } from '@discordjs/voice'
import { ClientWithCommands } from '../types/client'

export default {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction, client: ClientWithCommands, recordable: Set<string>) {
    if (!interaction.isChatInputCommand()) return
    
    const command = client.commands.get(interaction.commandName)
    
    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`)
      return
    }
    
    if (!interaction.guildId) {
      await interaction.reply({ content: 'This command is not available in DMs.', ephemeral: true })
      return
    }
    
    try {
      await command.execute({ 
        interaction, 
        recordable, 
        client, 
        connection: getVoiceConnection(interaction.guildId) 
      })
    } catch (error) {
      console.error(`Error executing command ${interaction.commandName}:`, error)
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true })
      } else {
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
      }
    }
  }
}