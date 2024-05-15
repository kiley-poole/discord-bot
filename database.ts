import Database from 'better-sqlite3'

const db = new Database('yadl.db', { verbose: console.log })

interface CharacterNameRow {
  name: string
  userId: string
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

initializeDatabase()
