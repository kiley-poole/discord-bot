import { SlashCommandBuilder } from 'discord.js'
import { getAlignment } from '../service/alignments-api'
import { Alignment } from '../types/alignments'
import { command } from '../types/command-types'

export const botCommand: command = {
  // @ts-expect-error
  data: new SlashCommandBuilder<>()
    .setName('alignment')
    .setDescription('Displays alignment description')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Select')
        .setRequired(true)
        .addChoices(
          { name: 'LG', value: 'lawful-good' },
          { name: 'NG', value: 'neutral-good' },
          { name: 'CG', value: 'chaotic-good' },
          { name: 'LN', value: 'lawful-neutral' },
          { name: 'N', value: 'neutral' },
          { name: 'CN', value: 'chaotic-neutral' },
          { name: 'LE', value: 'lawful-evil' },
          { name: 'NE', value: 'neutral-evil' },
          { name: 'CE', value: 'chaotic-evil' }
        )
    ),
  async execute (interaction) {
    const alignmentType = interaction.options.get('type')?.value as string
    const alignment: Alignment = await getAlignment(alignmentType)
    await interaction.reply(`**Name**: ${alignment.name}\n**Description**: ${alignment.desc}`)
  }
}
