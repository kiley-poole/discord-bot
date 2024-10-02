/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { SlashCommandBuilder, TextChannel } from 'discord.js';
import { Command } from '../utils/types';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('summarize')
    .setDescription('Transcribe and summarize the latest recordings.'),
  async execute(input) {
    const { interaction } = input;
    const client = interaction.client;
    await interaction.deferReply();

    try {
      const recordingsPath = path.resolve('./recordings');
      const files = await fs.promises.readdir(recordingsPath);
      const oggFiles = files.filter((file) => file.endsWith('.ogg'));

      if (oggFiles.length === 0) {
        await interaction.editReply('No recordings found in the recordings directory.');
        return;
      }

      // Sort files to get the first recording
      oggFiles.sort();

      const firstRecording = oggFiles[0];
      const timestampStr = firstRecording.split('-')[0];
      const timestamp = parseInt(timestampStr, 10);

      if (isNaN(timestamp)) {
        await interaction.editReply('Could not determine the date of the first recording.');
        return;
      }

      const date = new Date(timestamp);
      const dateArg = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;

      // Path to the shell script
      const scriptPath = '/home/kpool/translator/run_transcribe.sh';

      // Prepare environment variables
      const env = { ...process.env };
      env.PATH = `/home/kpool/.local/bin:${env.PATH}`; // Ensure pipenv is in PATH
      env.PYTHONUNBUFFERED = '1';

      // Send initial reply and get the message
      const initialReply = await interaction.editReply({
        content: 'Starting transcription and summarization...',
      });
      const messageId = initialReply.id;
      const channelId = interaction.channelId;

      // Initialize variables for tracking progress
      let transcriptionTotal = 0;
      let transcriptionProgress = 0;
      let summarizationTotal = 0;
      let summarizationProgress = 0;

      let lastEditTime = 0;
      const editInterval = 2000; // Update every 2 seconds
      const filledEmoji1 = '<:penis1:1289406720891818004>';
      const filledEmoji2 = '<:bearfuck:1289406658488832123>';

      // Spawn the shell script
      const pythonProcess = spawn(scriptPath, [dateArg], {
        cwd: '/home/kpool/translator',
        env,
      });

      pythonProcess.stdout.on('data', async (data) => {
        const output = data.toString();

        // Split output into lines
        const lines = output.split('\n');
        lines.forEach((line: string) => {
          // Parse progress updates
          const transcriptionMatch = line.match(/Transcription Progress: (\d+)\/(\d+)/);
          const summarizationMatch = line.match(/Summarization Progress: (\d+)\/(\d+)/);

          if (transcriptionMatch) {
            transcriptionProgress = parseInt(transcriptionMatch[1], 10);
            transcriptionTotal = parseInt(transcriptionMatch[2], 10);
          }

          if (summarizationMatch) {
            summarizationProgress = parseInt(summarizationMatch[1], 10);
            summarizationTotal = parseInt(summarizationMatch[2], 10);
          }
        });

        const now = Date.now();
        if (now - lastEditTime >= editInterval) {
          lastEditTime = now;

          // Build the progress bar strings
          const transcriptionBar = buildProgressBar(
            transcriptionProgress,
            transcriptionTotal,
            20,
            filledEmoji1,
            '⬜'
          );
          const summarizationBar = buildProgressBar(
            summarizationProgress,
            summarizationTotal,
            20,
            filledEmoji2,
            '⬜'
          );

          const messageContent =
            `**Transcription Progress:** ${transcriptionBar} (${transcriptionProgress}/${transcriptionTotal})\n` +
            `**Summarization Progress:** ${summarizationBar} (${summarizationProgress}/${summarizationTotal})`;

          // Edit the message with the updated progress using the bot client
          try {
            const channel = await client.channels.fetch(channelId);
            if (!channel?.isTextBased()) return;
            const message = await (channel as TextChannel).messages.fetch(messageId);
            await message.edit(messageContent);
          } catch (error) {
            console.error('Error editing message:', error);
          }
        }
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error(`Python stderr: ${data}`);
      });

      pythonProcess.on('close', async (code) => {
        const transcriptionBar = buildProgressBar(
          transcriptionProgress,
          transcriptionTotal,
          20,
          filledEmoji1,
          '⬜'
        );
        const summarizationBar = buildProgressBar(
          summarizationProgress,
          summarizationTotal,
          20,
          filledEmoji2,
          '⬜'
        );

        let finalMessage = '';
        if (code === 0) {
          finalMessage = '\nTranscription and summarization completed successfully.';
        } else {
          finalMessage = '\nAn error occurred during transcription and summarization.';
        }

        const messageContent =
          `**Transcription Progress:** ${transcriptionBar} (${transcriptionProgress}/${transcriptionTotal})\n` +
          `**Summarization Progress:** ${summarizationBar} (${summarizationProgress}/${summarizationTotal})` +
          finalMessage;

        // Edit the message with the final progress using the bot client
        try {
          const channel = await client.channels.fetch(channelId);
          if (!channel?.isTextBased()) return;
          const message = await (channel as TextChannel).messages.fetch(messageId);
          await message.edit(messageContent);
        } catch (error) {
          console.error('Error editing message:', error);
        }
      });

      pythonProcess.on('error', async (err) => {
        console.error('Failed to start subprocess:', err);
        try {
          const channel = await client.channels.fetch(channelId);
          if (!channel?.isTextBased()) return;
          const message = await (channel as TextChannel).messages.fetch(messageId);
          await message.edit('An error occurred while starting the Python process.');
        } catch (error) {
          console.error('Error editing message:', error);
        }
      });
    } catch (error) {
      console.error('Error in summarize command:', error);
      await interaction.editReply('An error occurred while processing your request.');
    }
  },
};

function buildProgressBar(
  progress: number,
  total: number,
  barLength = 20,
  filledEmoji = '🟩',
  emptyEmoji = '⬜'
): string {
  if (total === 0) {
    return `[${emptyEmoji.repeat(barLength)}] 0%`;
  }
  const percentage = progress / total;
  const filledLength = Math.round(barLength * percentage);
  const emptyLength = barLength - filledLength;

  const filledBar = filledEmoji.repeat(filledLength);
  const emptyBar = emptyEmoji.repeat(emptyLength);

  return `[${filledBar}${emptyBar}] ${Math.round(percentage * 100)}%`;
}

export default command;