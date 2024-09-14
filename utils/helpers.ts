/* eslint-disable @typescript-eslint/strict-boolean-expressions */

import { getAllCharacterAndUserIdsForGuildChannel } from '../database/database'

const guildUserCharacterNames = new Map<string, Map<string, Map<string, string>>>()

export function getCharacterName (userId: string, guildId: string, channelId: string): string {
  return guildUserCharacterNames.get(guildId)?.get(channelId)?.get(userId) ?? ''
}

export function addToMap (guildId: string, channelId: string): void {
  const characters = getAllCharacterAndUserIdsForGuildChannel(guildId, channelId)
  guildUserCharacterNames.set(guildId, new Map([[channelId, new Map(characters.map(({ userId, name }) => [userId, name]))]]))
}
