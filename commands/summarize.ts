/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { SlashCommandBuilder } from 'discord.js'
import { Command } from '../utils/types'
import { spawn } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('summarize')
    .setDescription('Transcribe and summarize the latest recordings.'),
  async execute (input) {
    const { interaction } = input
    await interaction.deferReply()

    try {
      const recordingsPath = path.resolve('./recordings')
      const files = await fs.promises.readdir(recordingsPath)
      const oggFiles = files.filter(file => file.endsWith('.ogg'))

      if (oggFiles.length === 0) {
        await interaction.editReply('No recordings found in the recordings directory.')
        return
      }

      // Sort files to get the first recording
      oggFiles.sort()

      const firstRecording = oggFiles[0]
      const timestampStr = firstRecording.split('-')[0]
      const timestamp = parseInt(timestampStr, 10)

      if (isNaN(timestamp)) {
        await interaction.editReply('Could not determine the date of the first recording.')
        return
      }

      const date = new Date(timestamp)
      const dateArg = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`

      // Construct the command to execute the Python script with the date argument
      const pythonScriptPath = path.resolve('./transcribe.py')

      // Spawn the Python process
      const pythonProcess = spawn('python3', [pythonScriptPath, dateArg])

      // Initialize variables for tracking progress
      let transcriptionTotal = 0
      let transcriptionProgress = 0
      let summarizationTotal = 0
      let summarizationProgress = 0

      await interaction.editReply('Starting transcription and summarization...')

      let lastEditTime = 0
      const editInterval = 2000 // Update every 2 seconds

      pythonProcess.stdout.on('data', (data) => {
        const output = data.toString()

        // Parse progress updates
        const transcriptionMatch = output.match(/Transcription Progress: (\d+)\/(\d+)/)
        const summarizationMatch = output.match(/Summarization Progress: (\d+)\/(\d+)/)

        if (transcriptionMatch) {
          transcriptionProgress = parseInt(transcriptionMatch[1], 10)
          transcriptionTotal = parseInt(transcriptionMatch[2], 10)
        }

        if (summarizationMatch) {
          summarizationProgress = parseInt(summarizationMatch[1], 10)
          summarizationTotal = parseInt(summarizationMatch[2], 10)
        }

        const now = Date.now()
        if (now - lastEditTime >= editInterval) {
          lastEditTime = now

          // Build the progress bar strings
          const transcriptionBar = buildProgressBar(transcriptionProgress, transcriptionTotal)
          const summarizationBar = buildProgressBar(summarizationProgress, summarizationTotal)

          const messageContent = `**Transcription Progress:** ${transcriptionBar} (${transcriptionProgress}/${transcriptionTotal})\n` +
                                 `**Summarization Progress:** ${summarizationBar} (${summarizationProgress}/${summarizationTotal})`

          // Edit the message with the updated progress
          interaction.editReply(messageContent).catch(console.error)
        }
      })

      pythonProcess.stderr.on('data', (data) => {
        console.error(`Python stderr: ${data}`)
      })

      pythonProcess.on('close', (code) => {
        // Ensure the final progress update is sent
        const transcriptionBar = buildProgressBar(transcriptionProgress, transcriptionTotal)
        const summarizationBar = buildProgressBar(summarizationProgress, summarizationTotal)

        let finalMessage = ''
        if (code === 0) {
          finalMessage = 'Transcription and summarization completed successfully.'
        } else {
          finalMessage = 'An error occurred during transcription and summarization.'
        }

        const messageContent = `**Transcription Progress:** ${transcriptionBar} (${transcriptionProgress}/${transcriptionTotal})\n` +
                               `**Summarization Progress:** ${summarizationBar} (${summarizationProgress}/${summarizationTotal})\n\n` +
                               finalMessage

        interaction.editReply(messageContent).catch(console.error)
      })
    } catch (error) {
      console.error('Error in summarize command:', error)
      await interaction.editReply('An error occurred while processing your request.')
    }
  }
}

function buildProgressBar (progress: number, total: number, barLength = 20): string {
  if (total === 0) {
    return `[${'─'.repeat(barLength)}] 0%`
  }
  const percentage = progress / total
  const filledLength = Math.round(barLength * percentage)
  const emptyLength = barLength - filledLength

  const filledBar = '█'.repeat(filledLength)
  const emptyBar = '─'.repeat(emptyLength)

  return `[${filledBar}${emptyBar}] ${Math.round(percentage * 100)}%`
}

export default command
