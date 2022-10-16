import { SlashCommandBuilder } from 'discord.js'
import { getLanguage } from '../service/languages-api'
import { command } from '../types/command-types'
import { Language } from '../types/languages'
import { isResourceList, ResourceList } from '../types/list-response'

export const botCommand: command = {
  // @ts-expect-error
  data: new SlashCommandBuilder<>()
    .setName('language')
    .setDescription('Specify a language to get details - No option returns a list of available languages!')
    .addStringOption(option =>
      option
        .setName('language')
        .setDescription('Select a language')
        .setRequired(false)
    ),
  async execute (interaction) {
    const language = interaction.options.getString('language')?.split(' ').join('-') ?? ''
    const languageResponse: Language | ResourceList = await getLanguage(language)
    if (isResourceList(languageResponse)) {
      await interaction.reply(`**Languages:**\n${languageResponse.results.map(language => language.name).join('\n')}`)
    } else {
      await interaction.reply(`**Name**: ${languageResponse.name}\n**Type**: ${languageResponse.type}\n**Speakers:**\n${languageResponse.typical_speakers.join('\n')}`)
    }
  }
}
