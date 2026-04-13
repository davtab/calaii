import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const sql = neon(process.env.DATABASE_URL)

const migration = readFileSync(join(__dirname, '../drizzle/0000_spooky_bulldozer.sql'), 'utf-8')

// Split by --> statement-breakpoint and run each statement
const statements = migration.split('--> statement-breakpoint').map(s => s.trim()).filter(Boolean)

for (const stmt of statements) {
  console.log('Running:', stmt.slice(0, 60) + '...')
  await sql.query(stmt)
}

console.log('Migration complete!')
