import { SlashCommandBuilder, TextChannel } from 'discord.js'
import { Command } from '../types/command'
import { spawn } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import { config } from '../config/env'

/**
 * Build a visual progress bar using emojis
 */
function buildProgressBar(
  progress: number,
  total: number,
  barLength = 20,
  filledEmoji = '🟩',
  emptyEmoji = '⬜'
): string {
  if (total === 0) {
    return `[${emptyEmoji.repeat(barLength)}] 0%`
  }
  
  const percentage = progress / total
  const filledLength = Math.round(barLength * percentage)
  const emptyLength = barLength - filledLength
  const filledBar = filledEmoji.repeat(filledLength)
  const emptyBar = emptyEmoji.repeat(emptyLength)
  
  return `[${filledBar}${emptyBar}] ${Math.round(percentage * 100)}%`
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('summarize')
    .setDescription('Transcribe and summarize the latest recordings.'),
    
  async execute({ interaction }) {
    const client = interaction.client
    await interaction.deferReply()
    
    try {
      // Get recordings directory
      const recordingsPath = path.resolve(config.recordingsPath || './recordings')
      
      // Check for recordings
      const files = await fs.promises.readdir(recordingsPath)
      const oggFiles = files.filter((file) => file.endsWith('.ogg'))
      
      if (oggFiles.length === 0) {
        await interaction.editReply('No recordings found in the recordings directory.')
        return
      }
      
      // Sort files to get the earliest recording
      oggFiles.sort()
      const firstRecording = oggFiles[0]
      const timestampStr = firstRecording.split('-')[0]
      const timestamp = parseInt(timestampStr, 10)
      
      if (isNaN(timestamp)) {
        await interaction.editReply('Could not determine the date of the first recording.')
        return
      }
      
      // Format date for the script
      const date = new Date(timestamp)
      const dateArg = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`
      
      // Path to the shell script
      const scriptPath = '/home/kpool/translator/run_transcribe.sh'
      
      // Prepare environment variables
      const env = { ...process.env }
      env.PATH = `/home/kpool/.local/bin:${env.PATH}` // Ensure pipenv is in PATH
      env.PYTHONUNBUFFERED = '1' // Force unbuffered Python output
      
      // Send initial reply and get the message
      const initialReply = await interaction.editReply({
        content: 'Starting transcription and summarization...',
      })
      
      const messageId = initialReply.id
      const channelId = interaction.channelId
      
      // Initialize variables for tracking progress
      let transcriptionTotal = 0
      let transcriptionProgress = 0
      let summarizationTotal = 0
      let summarizationProgress = 0
      let lastEditTime = 0
      const editInterval = 2000 // Update every 2 seconds
      
      // Custom emojis for progress bars
      const filledEmoji1 = '<:penis1:1289406720891818004>'
      const filledEmoji2 = '<:bearfuck:1289406658488832123>'
      
      // Spawn the shell script
      const pythonProcess = spawn(scriptPath, [dateArg], {
        cwd: '/home/kpool/translator',
        env,
      })
      
      // Handle script output
      pythonProcess.stdout.on('data', async (data) => {
        const output = data.toString()
        
        // Split output into lines and parse progress updates
        const lines = output.split('\n')
        lines.forEach((line: string) => {
          const transcriptionMatch = line.match(/Transcription Progress: (\d+)\/(\d+)/)
          const summarizationMatch = line.match(/Summarization Progress: (\d+)\/(\d+)/)
          
          if (transcriptionMatch) {
            transcriptionProgress = parseInt(transcriptionMatch[1], 10)
            transcriptionTotal = parseInt(transcriptionMatch[2], 10)
          }
          
          if (summarizationMatch) {
            summarizationProgress = parseInt(summarizationMatch[1], 10)
            summarizationTotal = parseInt(summarizationMatch[2], 10)
          }
        })
        
        // Update progress message at intervals
        const now = Date.now()
        if (now - lastEditTime >= editInterval) {
          lastEditTime = now
          
          // Build progress bars
          const transcriptionBar = buildProgressBar(
            transcriptionProgress,
            transcriptionTotal,
            20,
            filledEmoji1,
            '⬜'
          )
          
          const summarizationBar = buildProgressBar(
            summarizationProgress,
            summarizationTotal,
            20,
            filledEmoji2,
            '⬜'
          )
          
          // Create message content
          const messageContent =
            `**Transcription Progress:** ${transcriptionBar} (${transcriptionProgress}/${transcriptionTotal})\n` +
            `**Summarization Progress:** ${summarizationBar} (${summarizationProgress}/${summarizationTotal})`
          
          // Edit the message with updated progress
          try {
            const channel = await client.channels.fetch(channelId)
            if (!channel?.isTextBased()) return
            
            const message = await (channel as TextChannel).messages.fetch(messageId)
            await message.edit(messageContent)
          } catch (error) {
            console.error('Error editing progress message:', error)
          }
        }
      })
      
      // Handle errors from the script
      pythonProcess.stderr.on('data', (data) => {
        console.error(`Python stderr: ${data}`)
      })
      
      // Handle script completion
      pythonProcess.on('close', async (code) => {
        // Create final progress bars
        const transcriptionBar = buildProgressBar(
          transcriptionProgress,
          transcriptionTotal,
          20,
          filledEmoji1,
          '⬜'
        )
        
        const summarizationBar = buildProgressBar(
          summarizationProgress,
          summarizationTotal,
          20,
          filledEmoji2,
          '⬜'
        )
        
        // Determine final status message
        let finalMessage = ''
        if (code === 0) {
          finalMessage = '\nTranscription and summarization completed successfully.'
        } else {
          finalMessage = '\nAn error occurred during transcription and summarization.'
        }
        
        // Create final message content
        const messageContent =
          `**Transcription Progress:** ${transcriptionBar} (${transcriptionProgress}/${transcriptionTotal})\n` +
          `**Summarization Progress:** ${summarizationBar} (${summarizationProgress}/${summarizationTotal})` +
          finalMessage
        
        // Update with final message
        try {
          const channel = await client.channels.fetch(channelId)
          if (!channel?.isTextBased()) return
          
          const message = await (channel as TextChannel).messages.fetch(messageId)
          await message.edit(messageContent)
        } catch (error) {
          console.error('Error editing final message:', error)
        }
      })
      
      // Handle script launch errors
      pythonProcess.on('error', async (err) => {
        console.error('Failed to start subprocess:', err)
        
        try {
          const channel = await client.channels.fetch(channelId)
          if (!channel?.isTextBased()) return
          
          const message = await (channel as TextChannel).messages.fetch(messageId)
          await message.edit('An error occurred while starting the Python process.')
        } catch (error) {
          console.error('Error editing error message:', error)
        }
      })
      
    } catch (error) {
      console.error('Error in summarize command:', error)
      await interaction.editReply('An error occurred while processing your request.')
    }
  },
}

export default command