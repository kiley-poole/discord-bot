import { Events } from 'discord.js'
import { ClientWithCommands } from '../types/client'
import { config } from '../config/env'
import { setupFileWatchers } from '../services/fileProcessing/fileHandler'

export default {
  name: Events.ClientReady,
  once: true,
  execute(client: ClientWithCommands) {
    console.log(`Logged in as ${client.user?.tag ?? 'unknown user'}!`)
    
    // Setup file watchers
    setupFileWatchers(
      client, 
      config.summaryDirectoryPath,
      config.summaryArchivePath,
      config.journalDirectoryPath,
      config.journalArchivePath,
      config.channelId,
      config.journalChannelId
    )
  }
}