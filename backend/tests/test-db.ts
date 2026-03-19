import { execSync } from 'child_process'
import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Client } from 'pg'
import * as schema from '../src/db/schema.ts'

// Load test environment
config({ path: '.env.test' })

const TEST_DB_NAME = process.env.TEST_DB_NAME || 'gottado_test'
const TEST_DB_URL = process.env.TEST_DATABASE_URL || `postgresql://localhost:5432/${TEST_DB_NAME}`

/**
 * Create test database if it doesn't exist
 */
export async function createTestDatabase(): Promise<void> {
  const adminUrl = process.env.ADMIN_DATABASE_URL || 'postgresql://localhost:5432/postgres'
  const client = new Client({ connectionString: adminUrl })
  
  try {
    await client.connect()
    
    // Check if database exists
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [TEST_DB_NAME]
    )
    
    if (result.rows.length === 0) {
      console.log(`Creating test database: ${TEST_DB_NAME}`)
      await client.query(`CREATE DATABASE "${TEST_DB_NAME}"`)
    }
  } finally {
    await client.end()
  }
}

/**
 * Drop and recreate test database (for clean slate)
 */
export async function resetTestDatabase(): Promise<void> {
  const adminUrl = process.env.ADMIN_DATABASE_URL || 'postgresql://localhost:5432/postgres'
  const client = new Client({ connectionString: adminUrl })
  
  try {
    await client.connect()
    
    // Terminate existing connections
    await client.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = $1
      AND pid <> pg_backend_pid()
    `, [TEST_DB_NAME])
    
    // Drop and recreate
    await client.query(`DROP DATABASE IF EXISTS "${TEST_DB_NAME}"`)
    await client.query(`CREATE DATABASE "${TEST_DB_NAME}"`)
    console.log(`Reset test database: ${TEST_DB_NAME}`)
  } finally {
    await client.end()
  }
}

/**
 * Push schema to test database using drizzle-kit push
 */
export async function migrateTestDatabase(): Promise<void> {
  console.log('Pushing schema to test database...')
  execSync(`npx drizzle-kit push --force --url "${TEST_DB_URL}"`, {
    stdio: 'inherit',
    cwd: import.meta.dirname ? `${import.meta.dirname}/..` : process.cwd(),
  })
  console.log('Schema push complete')
}

/**
 * Get test database connection
 */
export function getTestDb() {
  const client = new Client({ connectionString: TEST_DB_URL })
  return { client, db: drizzle(client, { schema }) }
}

/**
 * Clean all data from tables (for test isolation)
 */
export async function cleanDatabase(): Promise<void> {
  const { client, db } = getTestDb()
  
  try {
    await client.connect()
    
    // Delete in order to respect foreign keys (table names in DB)
    const tables = [
      'audit_photos',
      'cost_records',
      'schedule_days',
      'labor_shifts',
      'day_parts',
      'task_activities',
      'audit_findings',
      'audit_checkpoints',
      'audit_runs',
      'audit_templates',
      'task_completions',
      'tasks',
      'logbook_entry_edits',
      'logbook_entries',
      'logbook_templates',
      'team_members',
      'audit_actions',
      'audit_follow_ups',
      'section_members',
      'sections',
      'teams',
      'organization_members',
      'users',
      'organizations',
    ]
    
    for (const table of tables) {
      await db.execute(`DELETE FROM "${table}"`)
    }
  } finally {
    await client.end()
  }
}

/**
 * Full setup for integration tests
 */
export async function setupTestDb(): Promise<void> {
  await createTestDatabase()
  await migrateTestDatabase()
}

// CLI usage
if (import.meta.main) {
  const command = process.argv[2]
  
  switch (command) {
    case 'create':
      await createTestDatabase()
      break
    case 'reset':
      await resetTestDatabase()
      await migrateTestDatabase()
      break
    case 'migrate':
      await migrateTestDatabase()
      break
    case 'clean':
      await cleanDatabase()
      break
    default:
      console.log('Usage: tsx tests/test-db.ts [create|reset|migrate|clean]')
      process.exit(1)
  }
}
