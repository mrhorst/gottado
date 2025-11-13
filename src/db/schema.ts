import {
  integer,
  pgTable,
  varchar,
  date,
  AnyPgColumn,
} from 'drizzle-orm/pg-core'

export const usersTable = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  taskId: integer('task_id').references(() => tasksTable.id),
})

export const tasksTable = pgTable('tasks', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  description: varchar({ length: 255 }),
  title: varchar({ length: 100 }).notNull(),
  dueDate: date('due_date'),
  userId: integer('users_id')
    .references((): AnyPgColumn => usersTable.id)
    .notNull(),
})
