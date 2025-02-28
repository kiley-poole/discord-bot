# Discord Bot

A Discord bot for managing voice recordings, file processing, and game management.

## Features

- Voice recording in Discord channels
- File monitoring and processing
- Character name registration 
- Game registration
- Thread creation for summaries and journal entries

## Project Structure

```
discord-bot/
├── src/                      # All source code
│   ├── commands/             # Bot commands
│   ├── config/               # Configuration files
│   ├── database/             # Database interactions
│   ├── events/               # Event handlers
│   ├── services/             # Business logic services
│   │   ├── voice/            # Voice recording functionality
│   │   ├── fileProcessing/   # File processing functionality
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   └── index.ts              # Entry point
├── recordings/               # Voice recordings output directory
├── .env.example              # Example environment variables
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## Setup

### Prerequisites

- Node.js (v16 or higher)
- npm
- Discord Bot Token (from [Discord Developer Portal](https://discord.com/developers/applications))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd discord-bot
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root and add the following environment variables:
```
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_application_id
GUILD_ID=optional_guild_id_for_dev_testing
CHANNEL_ID=your_discord_channel_id
JOURNAL_CHANNEL_ID=your_journal_channel_id
SUMMARY_DIRECTORY_PATH=path/to/summaries
SUMMARY_ARCHIVE_PATH=path/to/archive/summaries
JOURNAL_DIRECTORY_PATH=path/to/journals
JOURNAL_ARCHIVE_PATH=path/to/archive/journals
```

### Building and Running

Build the bot:
```bash
npm run build
```

Deploy slash commands:
```bash
npm run deploy
```

Start the bot:
```bash
npm start
```

For development with hot reloading:
```bash
npm run dev
```

## Commands

- `/join` - Have the bot join your voice channel for recording
- `/leave` - Have the bot leave the voice channel
- `/register <character_name>` - Register your character name
- `/register-game` - Register a new game (with various options)
- `/info` - Get information about the bot
- `/summarize` - Generate a summary (with various options)
- `/taunt` - Send a taunt message

## Database

The bot uses SQLite for data storage. The database file `yadl.db` will be created automatically in the project root.

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add some amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

ISC