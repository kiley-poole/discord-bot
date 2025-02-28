/**
 * Migration script to help transition from the old project structure to the new one
 * Run this with: npx ts-node src/scripts/migrate.ts
 */
import * as fs from 'fs'
import * as path from 'path'

const OLD_ROOT = path.join(process.cwd())
const NEW_ROOT = path.join(process.cwd(), 'src')

console.log('Starting migration from old structure to new structure...')

/**
 * Create directories if they don't exist
 */
function createDirectoriesIfNeeded(): void {
  // List of directories to ensure exist
  const directories = [
    path.join(NEW_ROOT, 'commands'),
    path.join(NEW_ROOT, 'config'),
    path.join(NEW_ROOT, 'database'),
    path.join(NEW_ROOT, 'events'),
    path.join(NEW_ROOT, 'services', 'voice'),
    path.join(NEW_ROOT, 'services', 'fileProcessing'),
    path.join(NEW_ROOT, 'types'),
    path.join(NEW_ROOT, 'utils'),
    path.join(process.cwd(), 'recordings'),
    path.join(process.cwd(), 'summaries'),
    path.join(process.cwd(), 'journals'),
    path.join(process.cwd(), 'archive', 'summaries'),
    path.join(process.cwd(), 'archive', 'journals'),
  ]

  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      console.log(`Created directory: ${dir}`)
    }
  }
}

/**
 * Copy .env file and create .env.example if needed
 */
function setupEnvFiles(): void {
  const envPath = path.join(OLD_ROOT, '.env')
  const envExamplePath = path.join(OLD_ROOT, '.env.example')
  
  // Copy .env to src/ if it exists
  if (fs.existsSync(envPath)) {
    fs.copyFileSync(envPath, path.join(OLD_ROOT, '.env.backup'))
    console.log('Created backup of .env file as .env.backup')
  } else {
    console.log('No .env file found. Please create one based on .env.example')
  }

  // Create .env.example at project root if it doesn't exist
  if (!fs.existsSync(envExamplePath)) {
    const srcEnvExample = path.join(NEW_ROOT, '.env.example')
    if (fs.existsSync(srcEnvExample)) {
      fs.copyFileSync(srcEnvExample, envExamplePath)
      console.log('Created .env.example file at project root')
    }
  }
}

/**
 * Main migration function
 */
async function migrate(): Promise<void> {
  try {
    // Create necessary directories
    createDirectoriesIfNeeded()
    
    // Setup environment files
    setupEnvFiles()

    // Check database file
    const dbPath = path.join(OLD_ROOT, 'yadl.db')
    if (fs.existsSync(dbPath)) {
      console.log('Database file found: yadl.db')
    } else {
      console.log('No database file found. A new one will be created when the bot runs.')
    }

    console.log('\nMigration complete!')
    console.log('\nNext steps:')
    console.log('1. Ensure your .env file has all required environment variables')
    console.log('2. Run "npm install" to install dependencies')
    console.log('3. Run "npm run build" to build the project')
    console.log('4. Run "npm run deploy" to deploy commands')
    console.log('5. Run "npm start" to start the bot')
  } catch (error) {
    console.error('Error during migration:', error)
  }
}

// Run migration
void migrate()