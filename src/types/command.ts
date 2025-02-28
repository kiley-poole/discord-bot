import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { VoiceConnection } from '@discordjs/voice'
import { ClientWithCommands } from './client'

interface CommandExecuteOptions {
  interaction: ChatInputCommandInteraction
  recordable: Set<string>
  client: ClientWithCommands
  connection?: VoiceConnection | null
}

export interface Command {
  data: SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
  execute: (options: CommandExecuteOptions) => Promise<void>
}