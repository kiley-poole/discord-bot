/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { entersState, joinVoiceChannel, VoiceConnection, VoiceConnectionStatus } from '@discordjs/voice'
import { ChannelType, Client, CommandInteraction, GuildMember, Snowflake } from 'discord.js'
import { createListeningStream } from './listener'
import { getAllCharacterAndUserIdsForGuildChannel, registerCharacterName } from './database'
import { guildUserCharacterNames } from './index'

async function join (
  input: InteractionHandlerInput
): Promise<void> {
  let { interaction, recordable, client, connection } = input
  await interaction.deferReply()
  if (connection == null) {
    if (interaction.member instanceof GuildMember && (interaction.member.voice.channel != null)) {
      const channel = interaction.member.voice.channel
      connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        selfDeaf: false,
        selfMute: true,
        adapterCreator: channel.guild.voiceAdapterCreator
      })
      if (interaction.guildId != null) {
        await addToMap(interaction.guildId, interaction.channelId)
        console.log(guildUserCharacterNames)
      }
    } else {
      await interaction.followUp('Join a voice channel and then try that again!')
      return
    }
  }

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 20e3)
    const receiver = connection.receiver

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    receiver.speaking.on('start', async (userId) => {
      if (!recordable.has(userId)) {
        recordable.add(userId)
        if (interaction.guildId != null) {
          await createListeningStream(receiver, userId, interaction.guildId, interaction.channelId, recordable, client.users.cache.get(userId))
        }
      }
    })
  } catch (error) {
    console.warn(error)
    await interaction.followUp('Failed to join voice channel within 20 seconds, please try again later!')
  }

  await interaction.followUp('Ready!')
}

async function leave (
  input: InteractionHandlerInput
): Promise<any> {
  const { interaction, recordable, connection } = input
  if (connection != null) {
    connection.destroy()
    recordable.clear()
    await interaction.reply({ ephemeral: true, content: 'Left the channel!' })
  } else {
    await interaction.reply({ ephemeral: true, content: 'Not playing in this server!' })
  }
}

async function register (
  input: InteractionHandlerInput
): Promise<void> {
  const { interaction } = input
  const characterName = interaction.options.get('character_name')?.value
  const { guildId, channelId } = interaction
  const userId = interaction.user.id

  if (guildId == null || channelId == null) {
    await interaction.reply({ ephemeral: true, content: 'Failed to register character name. Please try again later.' })
    return
  }

  if (characterName != null && typeof characterName === 'string' && characterName.length > 0) {
    await registerCharacterName(characterName, userId, guildId, channelId)
    await interaction.reply({ ephemeral: true, content: `Character name registered as ${characterName}!` })
  } else {
    await interaction.reply({ ephemeral: true, content: 'Please provide a valid character name.' })
  }
}

async function taunt (
  input: InteractionHandlerInput
): Promise<void> {
  const { client, interaction } = input
  const channel = client.channels.cache.get(interaction.channelId)
  if (channel?.isTextBased() && channel.type === ChannelType.GuildText) {
    await interaction.deferReply({ ephemeral: true }) // Acknowledge the interaction
    await channel.send('Eat shit and die')
    await interaction.followUp({ content: 'Message posted to the channel!', ephemeral: true }) // Final response to the interaction
  } else {
    await interaction.reply({ content: 'Failed to send the message. Channel not found or is not a text channel.', ephemeral: true })
  }
}

interface InteractionHandlerInput {
  interaction: CommandInteraction
  recordable: Set<Snowflake>
  client: Client
  connection?: VoiceConnection
}

export async function getInteractionHandler (): Promise<Map<string, (input: InteractionHandlerInput) => Promise<void>>> {
  const interactionHandlers = new Map<
  string,
  (
    input: InteractionHandlerInput
  ) => Promise<void>
  >()

  interactionHandlers.set('join', join)
  interactionHandlers.set('leave', leave)
  interactionHandlers.set('register', register)
  interactionHandlers.set('taunt', taunt)
  return interactionHandlers
}

export async function getCharacterName (userId: string, guildId: string, channelId: string): Promise<string> {
  return guildUserCharacterNames.get(guildId)?.get(channelId)?.get(userId) ?? ''
}

async function addToMap (guildId: string, channelId: string): Promise<void> {
  const characters = getAllCharacterAndUserIdsForGuildChannel(guildId, channelId)
  guildUserCharacterNames.set(guildId, new Map([[channelId, new Map(characters.map(({ userId, name }) => [userId, name]))]]))
}
