import dotenv from 'dotenv'
import * as fs from 'fs'

dotenv.config()

// Required environment variables
const requiredEnvVars = [
  'DISCORD_TOKEN',
  'CHANNEL_ID',
  'JOURNAL_CHANNEL_ID',
  'SUMMARY_DIRECTORY_PATH',
  'SUMMARY_ARCHIVE_PATH',
  'JOURNAL_DIRECTORY_PATH',
  'JOURNAL_ARCHIVE_PATH',
]

// Check for required environment variables
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`${envVar} is not set in environment variables.`)
    process.exit(1)
  }
}

// Create required directories
const directoriesToCreate = [
  process.env.SUMMARY_DIRECTORY_PATH,
  process.env.SUMMARY_ARCHIVE_PATH,
  process.env.JOURNAL_DIRECTORY_PATH,
  process.env.JOURNAL_ARCHIVE_PATH,
]

for (const directory of directoriesToCreate) {
  if (directory && !fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true })
  }
}

// Export config variables
export const config = {
  token: process.env.DISCORD_TOKEN!,
  channelId: process.env.CHANNEL_ID!,
  journalChannelId: process.env.JOURNAL_CHANNEL_ID!,
  summaryDirectoryPath: process.env.SUMMARY_DIRECTORY_PATH!,
  summaryArchivePath: process.env.SUMMARY_ARCHIVE_PATH!,
  journalDirectoryPath: process.env.JOURNAL_DIRECTORY_PATH!,
  journalArchivePath: process.env.JOURNAL_ARCHIVE_PATH!,
  recordingsPath: './recordings',
}