import * as fs from 'fs'
import * as path from 'path'
import { ChannelType, Client, TextChannel } from 'discord.js'
import { splitBySentence } from '../../utils/sentence-chunker'
import { ClientWithCommands } from '../../types/client'

/**
 * Process a file by reading its contents, creating a thread in the specified channel,
 * and moving the file to an archive directory after processing
 */
export async function handleFile(
  client: ClientWithCommands, 
  filePath: string, 
  archivePath: string, 
  threadName: string, 
  channelID: string
): Promise<void> {
  if (path.extname(filePath) !== '.txt') {
    return
  }
  
  try {
    if (!channelID) {
      console.warn('Channel ID is missing for file processing')
      return
    }
    
    const fileContents = await fs.promises.readFile(filePath, 'utf-8')
    const channel = client.channels.cache.get(channelID)
    
    if (!channel?.isTextBased() || channel.type !== ChannelType.GuildText) {
      console.warn(`Channel ${channelID} is not a text channel`)
      return
    }
    
    const fileName = path.basename(filePath)
    const initialMessage = await channel.send(`${threadName} for ${fileName}:`)
    
    const thread = await initialMessage.startThread({
      name: `${threadName} for ${fileName}`,
      autoArchiveDuration: 60
    })
    
    const chunks = splitBySentence(fileContents)
    for (const chunk of chunks) {
      await thread.send(chunk)
    }
    
    try {
      fs.renameSync(filePath, path.join(archivePath, fileName))
      console.log(`File ${fileName} processed and moved to archive`)
    } catch (error) {
      console.warn('Error archiving file:', error)
    }
  } catch (error) {
    console.error('Error processing file:', error)
  }
}

/**
 * Setup watchers for directory paths to automatically process new files
 */
export function setupFileWatchers(
  client: ClientWithCommands, 
  summaryPath: string,
  summaryArchive: string,
  journalPath: string,
  journalArchive: string,
  summaryChannelId: string,
  journalChannelId: string
): void {
  const chokidar = require('chokidar')
  
  // Watch summary directory
  const summaryWatcher = chokidar.watch(summaryPath, {
    ignored: /^\./,
    persistent: true
  })
  
  summaryWatcher.on('add', (filePath: string) => {
    handleFile(client, filePath, summaryArchive, 'Summary', summaryChannelId)
  })
  
  // Watch journal directory
  const journalWatcher = chokidar.watch(journalPath, {
    ignored: /^\./,
    persistent: true
  })
  
  journalWatcher.on('add', (filePath: string) => {
    handleFile(client, filePath, journalArchive, 'Journal Entry', journalChannelId)
  })
  
  console.log('File watchers set up successfully')
}