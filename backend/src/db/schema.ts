import {
  integer,
  pgTable,
  varchar,
  date,
  AnyPgColumn,
  text,
  timestamp,
  boolean,
  primaryKey,
  index,
} from 'drizzle-orm/pg-core'

import { sql } from 'drizzle-orm'

export const user = pgTable('users', {
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
  active: boolean().notNull().default(true),
  deactivatedAt: timestamp('deactivated_at', { withTimezone: true }),
})

export const task = pgTable('tasks', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  description: varchar({ length: 255 }),
  title: varchar({ length: 100 }).notNull(),
  dueDate: date('due_date'),
  complete: boolean().notNull().default(false),
  sectionId: integer('section_id')
    .references((): AnyPgColumn => section.id)
    .notNull(),
})

export const section = pgTable('sections', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  ownerId: integer('owner_id')
    .references((): AnyPgColumn => user.id)
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  active: boolean().notNull().default(true),
  deactivatedAt: timestamp('deactivated_at', { withTimezone: true }),
})

export const sectionMember = pgTable(
  'section_members',
  {
    sectionId: integer('section_id')
      .references(() => section.id, { onDelete: 'cascade' })
      .notNull(),
    userId: integer('user_id')
      .references(() => user.id, { onDelete: 'cascade' })
      .notNull(),
    role: varchar({ length: 20 })
      .notNull()
      .default('viewer')
      .$type<'owner' | 'editor' | 'viewer'>(),
  },
  (table) => [
    primaryKey({ columns: [table.sectionId, table.userId] }),
    index('section_members_user_id_idx').on(table.userId),
    index('section_members_section_id_idx').on(table.sectionId),
    index('section_members_role_idx').on(table.role),
  ]
)
