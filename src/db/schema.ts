import {
  integer,
  pgTable,
  varchar,
  date,
  AnyPgColumn,
  text,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core'

import { sql } from 'drizzle-orm'

export const usersTable = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
})

export const tasksTable = pgTable('tasks', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  description: varchar({ length: 255 }),
  title: varchar({ length: 100 }).notNull(),
  dueDate: date('due_date'),
  complete: boolean().notNull().default(false),
  userId: integer('user_id')
    .references((): AnyPgColumn => usersTable.id)
    .notNull(),
})
