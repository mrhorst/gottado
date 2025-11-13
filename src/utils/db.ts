import { DATABASE_URL } from './config.ts'
import { drizzle } from 'drizzle-orm/node-postgres'

const db = drizzle(DATABASE_URL!)

export default db
