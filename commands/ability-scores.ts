import { SlashCommandBuilder } from 'discord.js'
import { getAbilityScore } from '../service/ability-scores-api'
import { AbilityScore } from '../types/ability-scores'
import { command } from '../types/command-types'

export const botCommand: command = {
  // @ts-expect-error
  data: new SlashCommandBuilder<>()
    .setName('ability')
    .setDescription('Details')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Select')
        .setRequired(true)
        .addChoices(
          { name: 'Intelligence', value: 'int' },
          { name: 'Charisma', value: 'cha' },
          { name: 'Wisdom', value: 'wis' },
          { name: 'Strength', value: 'str' },
          { name: 'Constitution', value: 'con' },
          { name: 'Dexterity', value: 'dex' }
        )
    ),
  async execute (interaction) {
    const ability = interaction.options.get('type')?.value as string
    const abilityResponse: AbilityScore = await getAbilityScore(ability)
    await interaction.reply(`**Name**: ${abilityResponse.full_name}\n**Description**: ${abilityResponse.desc.join('\n')}\n**Skills:**\n${abilityResponse.skills.map(skill => skill.name).join('\n')}`)
  }
}
