
import { ApplicationCommandOptionType, REST, Routes } from 'discord.js'
import dotenv from 'dotenv'

dotenv.config()

const clientId = process.env.CLIENT_ID ?? ''
const token = process.env.DISCORD_TOKEN ?? ''

const commands = [
  {
    name: 'join',
    description: 'Joins the voice channel that you are in'
  },
  {
    name: 'register',
    description: 'maps character name to discord user',
    options: [
      {
        name: 'character_name',
        type: ApplicationCommandOptionType.String,
        description: 'Character name',
        required: true
      }
    ]
  },
  {
    name: 'leave',
    description: 'Leave the voice channel'
  }
]

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function deployCommands () {
  const rest = new REST({ version: '10' }).setToken(token)

  try {
    console.log('Started refreshing application (/) commands.')

    await rest.put(Routes.applicationCommands(clientId), { body: commands })

    console.log('Successfully reloaded application (/) commands.')
  } catch (error) {
    console.error(error)
  }
}

void deployCommands()
