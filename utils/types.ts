import { VoiceConnection } from '@discordjs/voice'
import { Client, CommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder, Snowflake } from 'discord.js'

export interface Command {
  data: SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'> | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder
  execute: (input: InteractionHandlerInput) => Promise<void>
}

export interface InteractionHandlerInput {
  interaction: CommandInteraction
  recordable: Set<Snowflake>
  client: Client
  connection?: VoiceConnection
}
