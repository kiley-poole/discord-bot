import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'
import path from 'path'

// Database connection
let db: Database<sqlite3.Database, sqlite3.Statement>

// Type definitions for database rows
export interface CharacterNameRow {
  name: string
  userId: string
}

export interface GameRow {
  id: number
  gameName: string
  gameSystem: string
  playerCount: number
  userId: string
  guildId: string
  channelId: string
  summaryChannelId: string
}

/**
 * Initialize the database connection and create tables if they don't exist
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Open database connection
    db = await open({
      filename: path.join(process.cwd(), 'yadl.db'),
      driver: sqlite3.Database
    })

    // Create tables if they don't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS character_names (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        userId TEXT NOT NULL,
        guildId TEXT NOT NULL,
        channelId TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        gameName TEXT NOT NULL,
        gameSystem TEXT NOT NULL,
        playerCount INTEGER NOT NULL,
        userId TEXT NOT NULL,
        guildId TEXT NOT NULL,
        channelId TEXT NOT NULL,
        summaryChannelId TEXT NOT NULL
      );
    `)

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

/**
 * Character-related database operations
 */
export const CharacterDB = {
  /**
   * Register a character name for a user in a specific guild and channel
   */
  async registerCharacterName(name: string, userId: string, guildId: string, channelId: string): Promise<void> {
    try {
      await db.run(
        'INSERT INTO character_names (name, userId, guildId, channelId) VALUES (?, ?, ?, ?)',
        [name, userId, guildId, channelId]
      )
      console.log(`Registered character "${name}" for user ${userId} in guild ${guildId}`)
    } catch (error) {
      console.error('Failed to register character name:', error)
      throw error
    }
  },

  /**
   * Get a character name for a user in a specific guild and channel
   */
  async getCharacterNameByUserIdGuildIdChannelId(userId: string, guildId: string, channelId: string): Promise<string> {
    try {
      const row = await db.get<CharacterNameRow>(
        'SELECT name FROM character_names WHERE userId = ? AND guildId = ? AND channelId = ?',
        [userId, guildId, channelId]
      )
      return row?.name ?? ''
    } catch (error) {
      console.error('Failed to get character name:', error)
      throw error
    }
  },

  /**
   * Get all character names and user IDs for a specific guild and channel
   */
  async getAllCharacterAndUserIdsForGuildChannel(guildId: string, channelId: string): Promise<CharacterNameRow[]> {
    try {
      const rows = await db.all<CharacterNameRow[]>(
        'SELECT name, userId FROM character_names WHERE guildId = ? AND channelId = ?',
        [guildId, channelId]
      )
      return rows
    } catch (error) {
      console.error('Failed to get character names for guild and channel:', error)
      throw error
    }
  }
}

/**
 * Game-related database operations
 */
export const GameDB = {
  /**
   * Create a new game
   */
  async createGame(
    gameName: string,
    gameSystem: string,
    playerCount: number,
    userId: string,
    guildId: string,
    channelId: string,
    summaryChannelId: string
  ): Promise<void> {
    try {
      await db.run(
        'INSERT INTO games (gameName, gameSystem, playerCount, userId, guildId, channelId, summaryChannelId) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [gameName, gameSystem, playerCount, userId, guildId, channelId, summaryChannelId]
      )
      console.log(`Created game "${gameName}" for user ${userId} in guild ${guildId}`)
    } catch (error) {
      console.error('Failed to create game:', error)
      throw error
    }
  },

  /**
   * Get a game by user ID, guild ID, and channel ID
   */
  async getGameByUserIdGuildIdChannelId(userId: string, guildId: string, channelId: string): Promise<GameRow | undefined> {
    try {
      const row = await db.get<GameRow>(
        'SELECT * FROM games WHERE userId = ? AND guildId = ? AND channelId = ?',
        [userId, guildId, channelId]
      )
      return row
    } catch (error) {
      console.error('Failed to get game:', error)
      throw error
    }
  },

  /**
   * Get all games for a specific guild and channel
   */
  async getAllGamesForGuildChannel(guildId: string, channelId: string): Promise<GameRow[]> {
    try {
      const rows = await db.all<GameRow[]>(
        'SELECT * FROM games WHERE guildId = ? AND channelId = ?',
        [guildId, channelId]
      )
      return rows
    } catch (error) {
      console.error('Failed to get games for guild and channel:', error)
      throw error
    }
  }
}

// For backward compatibility
export const getCharacterNameByUserIdGuildIdChannelId = CharacterDB.getCharacterNameByUserIdGuildIdChannelId
export const getAllCharacterAndUserIdsForGuildChannel = CharacterDB.getAllCharacterAndUserIdsForGuildChannel
export const registerCharacterName = CharacterDB.registerCharacterName
export const createGame = GameDB.createGame
export const getGameByUserIdGuildIdChannelId = GameDB.getGameByUserIdGuildIdChannelId
export const getAllGamesForGuildChannel = GameDB.getAllGamesForGuildChannel