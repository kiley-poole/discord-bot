import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'

let db: Database<sqlite3.Database, sqlite3.Statement>

interface CharacterNameRow {
  name: string
  userId: string
}

interface GameRow {
  id: number
  gameName: string
  gameSystem: string
  playerCount: number
  userId: string
  guildId: string
  channelId: string
  summaryChannelId: string
}

export async function initializeDatabase (): Promise<void> {
  db = await open({
    filename: 'yadl.db',
    driver: sqlite3.Database
  })

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
}

export async function registerCharacterName (name: string, userId: string, guildId: string, channelId: string): Promise<void> {
  try {
    await db.run('INSERT INTO character_names (name, userId, guildId, channelId) VALUES (?, ?, ?, ?)', [name, userId, guildId, channelId])
  } catch (error) {
    console.error('Database error:', error)
    throw error
  }
}

export async function getCharacterNameByUserIdGuildIdChannelId (userId: string, guildId: string, channelId: string): Promise<string> {
  try {
    const row = await db.get<CharacterNameRow>('SELECT name FROM character_names WHERE userId = ? AND guildId = ? AND channelId = ?', [userId, guildId, channelId])
    return row?.name ?? ''
  } catch (error) {
    console.error('Database error:', error)
    throw error
  }
}

export async function getAllCharacterAndUserIdsForGuildChannel (guildId: string, channelId: string): Promise<CharacterNameRow[]> {
  try {
    const rows = await db.all<CharacterNameRow[]>('SELECT name, userId FROM character_names WHERE guildId = ? AND channelId = ?', [guildId, channelId])
    return rows
  } catch (error) {
    console.error('Database error:', error)
    throw error
  }
}

export async function createGame (gameName: string, gameSystem: string, playerCount: number, userId: string, guildId: string, channelId: string, summaryChannelId: string): Promise<void> {
  try {
    await db.run('INSERT INTO games (gameName, gameSystem, playerCount, userId, guildId, channelId, summaryChannelId) VALUES (?, ?, ?, ?, ?, ?, ?)', [gameName, gameSystem, playerCount, userId, guildId, channelId, summaryChannelId])
  } catch (error) {
    console.error('Database error:', error)
    throw error
  }
}

export async function getGameByUserIdGuildIdChannelId (userId: string, guildId: string, channelId: string): Promise<GameRow | undefined> {
  try {
    const row = await db.get<GameRow>('SELECT * FROM games WHERE userId = ? AND guildId = ? AND channelId = ?', [userId, guildId, channelId])
    return row
  } catch (error) {
    console.error('Database error:', error)
    throw error
  }
}

export async function getAllGamesForGuildChannel (guildId: string, channelId: string): Promise<GameRow[]> {
  try {
    const rows = await db.all<GameRow[]>('SELECT * FROM games WHERE guildId = ? AND channelId = ?', [guildId, channelId])
    return rows
  } catch (error) {
    console.error('Database error:', error)
    throw error
  }
}
