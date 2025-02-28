import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { pipeline } from 'stream'
import { EndBehaviorType, VoiceReceiver } from '@discordjs/voice'
import type { Snowflake, User } from 'discord.js'
import * as prism from 'prism-media'
import { getCharacterNameByUserIdGuildIdChannelId } from '../../database/database'
import { config } from '../../config/env'

/**
 * Get the display name for a user based on character name or username
 */
async function getDisplayName(userId: string, guildId: string, channelId: string, user?: User): Promise<string> {
  try {
    const characterName = await getCharacterNameByUserIdGuildIdChannelId(userId, guildId, channelId)
    return characterName || ((user != null) ? `${user.username}` : userId)
  } catch (error) {
    console.error('Error getting display name:', error)
    return userId
  }
}

/**
 * Create a listening stream to record user's voice
 */
export async function createListeningStream(
  receiver: VoiceReceiver, 
  userId: string, 
  guildId: string, 
  channelId: string, 
  recordable: Set<Snowflake>, 
  user?: User
): Promise<void> {
  try {
    const opusStream = receiver.subscribe(userId, {
      end: {
        behavior: EndBehaviorType.AfterSilence,
        duration: 500
      }
    })

    const oggStream = new prism.opus.OggLogicalBitstream({
      opusHead: new prism.opus.OpusHead({
        channelCount: 2,
        sampleRate: 48000
      }),
      pageSizeControl: {
        maxPackets: 10
      }
    })

    const name = await getDisplayName(userId, guildId, channelId, user)
    const recordingsPath = config.recordingsPath
    const filename = `${recordingsPath}/${Date.now()}-${name}.ogg`

    // Ensure the recordings directory exists
    if (!existsSync(recordingsPath)) {
      mkdirSync(recordingsPath, { recursive: true })
    }

    const out = createWriteStream(filename)

    console.log(`👂 Started recording ${filename}`)

    pipeline(opusStream, oggStream, out, (err: any) => {
      if (err != null) {
        console.warn(`❌ Error recording file ${filename} - ${err.message}`)
      } else {
        console.log(`✅ Recorded ${filename}`)
        recordable.delete(userId)
      }
    })
  } catch (error) {
    console.error('Error creating listening stream:', error)
    recordable.delete(userId)
  }
}