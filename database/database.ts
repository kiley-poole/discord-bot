import Database from 'better-sqlite3'

const db = new Database('yadl.db', { verbose: console.log })

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
}

export function initializeDatabase (): void {
  db.exec(`
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

export function registerCharacterName (name: string, userId: string, guildId: string, channelId: string): void {
  db.prepare('INSERT INTO character_names (name, userId, guildId, channelId) VALUES (?, ?, ?, ?)').run(name, userId, guildId, channelId)
}

export function getCharacterNameByUserIdGuildIdChannelId (userId: string, guildId: string, channelId: string): string {
  const row = db.prepare('SELECT name FROM character_names WHERE userId = ? AND guildId = ? AND channelId = ?').get(userId, guildId, channelId) as CharacterNameRow | undefined
  return row?.name ?? ''
}

export function getAllCharacterAndUserIdsForGuildChannel (guildId: string, channelId: string): CharacterNameRow[] {
  return db.prepare('SELECT name, userId FROM character_names WHERE guildId = ? AND channelId = ?').all(guildId, channelId) as CharacterNameRow[]
}

export function createGame (gameName: string, gameSystem: string, playerCount: number, userId: string, guildId: string, channelId: string, summaryChannelId: string): void {
  db.prepare('INSERT INTO games (gameName, gameSystem, playerCount, userId, guildId, channelId, summaryChannelId) VALUES (?, ?, ?, ?, ?, ?, ?)').run(gameName, gameSystem, playerCount, userId, guildId, channelId, summaryChannelId)
}

export function getGameByUserIdGuildIdChannelId (userId: string, guildId: string, channelId: string): GameRow | undefined {
  return db.prepare('SELECT * FROM games WHERE userId = ? AND guildId = ? AND channelId = ?').get(userId, guildId, channelId) as GameRow | undefined
}

export function getAllGamesForGuildChannel (guildId: string, channelId: string): GameRow[] {
  return db.prepare('SELECT * FROM games WHERE guildId = ? AND channelId = ?').all(guildId, channelId) as GameRow[]
}

initializeDatabase()
