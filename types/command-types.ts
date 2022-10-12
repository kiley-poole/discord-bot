import { SlashCommandBuilder, ChatInputCommandInteraction, CacheType } from 'discord.js'

export interface command {
  data: SlashCommandBuilder
  execute: (interaction: ChatInputCommandInteraction<CacheType>) => Promise<void>
}
