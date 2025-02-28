/**
 * Helper utilities for the bot
 */
import { getAllCharacterAndUserIdsForGuildChannel } from '../database/database'

/**
 * Map to store character names for users across guilds and channels
 * Structure: guildId -> channelId -> userId -> characterName
 */
const guildUserCharacterNames = new Map<string, Map<string, Map<string, string>>>()

/**
 * Get a character name for a user in a specific guild and channel
 */
export function getCharacterName(userId: string, guildId: string, channelId: string): string {
  return guildUserCharacterNames.get(guildId)?.get(channelId)?.get(userId) ?? ''
}

/**
 * Add character mappings to the in-memory cache
 */
export async function addToMap(guildId: string, channelId: string): Promise<void> {
  try {
    const characters = await getAllCharacterAndUserIdsForGuildChannel(guildId, channelId)
    
    // Initialize nested maps if they don't exist
    if (!guildUserCharacterNames.has(guildId)) {
      guildUserCharacterNames.set(guildId, new Map())
    }
    
    const guildMap = guildUserCharacterNames.get(guildId)!
    guildMap.set(channelId, new Map(characters.map(({ userId, name }) => [userId, name])))
    
    console.log(`Loaded ${characters.length} character mappings for guild ${guildId}, channel ${channelId}`)
  } catch (error) {
    console.error(`Failed to load character mappings for guild ${guildId}, channel ${channelId}:`, error)
  }
}