import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream'
import { EndBehaviorType, VoiceReceiver } from '@discordjs/voice'
import type { Snowflake, User } from 'discord.js'
import * as prism from 'prism-media'
import { getCharacterName } from './handler'

async function getDisplayName (userId: string, user?: User): Promise<string> {
  const characterName = await getCharacterName(userId)
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  return characterName || ((user != null) ? `${user.username}_${user.discriminator}` : userId)
}

export async function createListeningStream (receiver: VoiceReceiver, userId: string, recordable: Set<Snowflake>, user?: User): Promise<any> {
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

  const name = await getDisplayName(userId, user)
  const filename = `./recordings/${Date.now()}-${name}.ogg`

  const out = createWriteStream(filename)

  console.log(`👂 Started recording ${filename}`)

  pipeline(opusStream, oggStream, out, (err) => {
    if (err != null) {
      console.warn(`❌ Error recording file ${filename} - ${err.message}`)
    } else {
      console.log(`✅ Recorded ${filename}`)
      recordable.delete(userId)
    }
  })
}
