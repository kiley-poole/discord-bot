/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { pipeline } from 'stream'
import { EndBehaviorType, VoiceReceiver } from '@discordjs/voice'
import type { Snowflake, User } from 'discord.js'
import * as prism from 'prism-media'
import { getCharacterNameByUserIdGuildIdChannelId } from '../database/database'

async function getDisplayName (userId: string, guildId: string, channelId: string, user?: User): Promise<string> {
  const characterName = await getCharacterNameByUserIdGuildIdChannelId(userId, guildId, channelId)
  return characterName || ((user != null) ? `${user.username}_${user.discriminator}` : userId)
}

export async function createListeningStream (receiver: VoiceReceiver, userId: string, guildId: string, channelId: string, recordable: Set<Snowflake>, user?: User): Promise<void> {
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
  const recordingsPath = './recordings'
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
}
