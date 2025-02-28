import joinCommand from './join'
import leaveCommand from './leave'
import registerCommand from './register'
import infoCommand from './info'
import registerGameCommand from './register-game'
import summarizeCommand from './summarize'
import tauntCommand from './taunt'

// Export all commands as an array
export const commands = [
  joinCommand,
  leaveCommand,
  registerCommand,
  infoCommand,
  registerGameCommand,
  summarizeCommand,
  tauntCommand
]