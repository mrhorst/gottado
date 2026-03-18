import {
  integer,
  pgTable,
  varchar,
  date,
  numeric,
  AnyPgColumn,
  text,
  timestamp,
  boolean,
  primaryKey,
  index,
  check,
  uniqueIndex,
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
  listId: integer('list_id')
    .references((): AnyPgColumn => taskList.id)
    .notNull(),
  assignedTeamId: integer('assigned_team_id')
    .references((): AnyPgColumn => team.id),
  measurableCriteria: text('measurable_criteria'),
  relevanceTag: varchar('relevance_tag', { length: 100 }),
  recurrence: varchar({ length: 20 }).$type<
    'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semi_annual' | 'yearly'
  >(),
  lastCompletedAt: timestamp('last_completed_at', { withTimezone: true }),
  deadlineTime: varchar('deadline_time', { length: 5 }), // HH:MM format, e.g. "16:00"
  requiresPicture: boolean('requires_picture').notNull().default(false),
    priority: varchar({ length: 20 })
      .notNull()
      .default('medium')
      .$type<'low' | 'medium' | 'high'>(),
})

export const taskList = pgTable(
  'task_lists',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    sectionId: integer('section_id')
      .references(() => section.id, { onDelete: 'cascade' })
      .notNull(),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    index('task_lists_section_id_idx').on(table.sectionId),
  ]
)

export const taskCompletion = pgTable(
  'task_completions',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    taskId: integer('task_id')
      .references(() => task.id, { onDelete: 'cascade' })
      .notNull(),
    completedBy: integer('completed_by')
      .references(() => user.id)
      .notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    dueDate: date('due_date'),
    deadlineTime: varchar('deadline_time', { length: 5 }),
    onTime: boolean('on_time'),
    pictureUrl: varchar('picture_url', { length: 500 }),
    notes: text(),
  },
  (table) => [
    index('completions_task_id_idx').on(table.taskId),
    index('completions_completed_by_idx').on(table.completedBy),
    index('completions_completed_at_idx').on(table.completedAt),
  ]
)

export const taskActivity = pgTable(
  'task_activities',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    taskId: integer('task_id')
      .references(() => task.id, { onDelete: 'cascade' })
      .notNull(),
    userId: integer('user_id')
      .references(() => user.id)
      .notNull(),
    action: varchar({ length: 30 })
      .notNull()
      .$type<
        | 'created'
        | 'completed'
        | 'uncompleted'
        | 'edited'
        | 'deleted'
      >(),
    details: text(), // JSON string with changed fields
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    index('task_activities_task_id_idx').on(table.taskId),
    index('task_activities_user_id_idx').on(table.userId),
    index('task_activities_created_at_idx').on(table.createdAt),
  ]
)

export const laborShift = pgTable(
  'labor_shifts',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    orgId: integer('org_id')
      .references(() => organization.id, { onDelete: 'cascade' })
      .notNull(),
    title: varchar({ length: 255 }).notNull(),
    shiftDate: date('shift_date').notNull(),
    startTime: varchar('start_time', { length: 5 }).notNull(),
    endTime: varchar('end_time', { length: 5 }).notNull(),
    areaId: integer('area_id').references(() => section.id, { onDelete: 'set null' }),
    assignedTeamId: integer('assigned_team_id').references(() => team.id, {
      onDelete: 'set null',
    }),
    assignedUserId: integer('assigned_user_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    notes: text(),
    createdBy: integer('created_by')
      .references(() => user.id)
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    check('labor_shift_title_not_empty', sql`${table.title} <> ''`),
    index('labor_shifts_org_id_idx').on(table.orgId),
    index('labor_shifts_shift_date_idx').on(table.shiftDate),
    index('labor_shifts_area_id_idx').on(table.areaId),
    index('labor_shifts_team_id_idx').on(table.assignedTeamId),
    index('labor_shifts_user_id_idx').on(table.assignedUserId),
  ]
)

export const costRecord = pgTable(
  'cost_records',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    orgId: integer('org_id')
      .references(() => organization.id, { onDelete: 'cascade' })
      .notNull(),
    kind: varchar({ length: 20 })
      .$type<'waste' | 'purchase' | 'vendor_issue'>()
      .notNull(),
    title: varchar({ length: 255 }).notNull(),
    entryDate: date('entry_date').notNull(),
    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    areaId: integer('area_id').references(() => section.id, { onDelete: 'set null' }),
    vendorName: varchar('vendor_name', { length: 255 }),
    quantityLabel: varchar('quantity_label', { length: 255 }),
    notes: text(),
    createdBy: integer('created_by')
      .references(() => user.id)
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    check('cost_record_title_not_empty', sql`${table.title} <> ''`),
    index('cost_records_org_id_idx').on(table.orgId),
    index('cost_records_entry_date_idx').on(table.entryDate),
    index('cost_records_kind_idx').on(table.kind),
    index('cost_records_area_id_idx').on(table.areaId),
  ]
)

export const section = pgTable(
  'sections',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull().unique(),
    ownerId: integer('owner_id')
      .references((): AnyPgColumn => user.id)
      .notNull(),
    orgId: integer('org_id')
      .references(() => organization.id)
      .notNull(),
    teamId: integer('team_id').references(() => team.id),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    active: boolean().notNull().default(true),
    deactivatedAt: timestamp('deactivated_at', { withTimezone: true }),
  },
  (table) => [check('name_not_empty', sql`${table.name} <> ''`)]
)

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
    uniqueIndex('one_owner_per_section_idx')
      .on(table.sectionId)
      .where(sql`${table.role} = 'owner'`),
  ]
)

export const team = pgTable(
  'teams',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    orgId: integer('org_id')
      .references(() => organization.id, { onDelete: 'cascade' })
      .notNull(),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    active: boolean().notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    check('team_name_not_empty', sql`${table.name} <> ''`),
    index('teams_org_id_idx').on(table.orgId),
    uniqueIndex('teams_org_id_name_idx').on(table.orgId, table.name),
  ]
)

export const teamMember = pgTable(
  'team_members',
  {
    teamId: integer('team_id')
      .references(() => team.id, { onDelete: 'cascade' })
      .notNull(),
    userId: integer('user_id')
      .references(() => user.id, { onDelete: 'cascade' })
      .notNull(),
    role: varchar({ length: 20 })
      .notNull()
      .default('member')
      .$type<'lead' | 'member'>(),
    joinedAt: timestamp('joined_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.teamId, table.userId] }),
    index('team_members_user_id_idx').on(table.userId),
    index('team_members_team_id_idx').on(table.teamId),
    index('team_members_role_idx').on(table.role),
  ]
)

export const organization = pgTable('organizations', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  active: boolean().notNull().default(true),
  deactivatedAt: timestamp('deactivated_at', { withTimezone: true }),
})

export const logbookTemplate = pgTable(
  'logbook_templates',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    orgId: integer('org_id')
      .references(() => organization.id, { onDelete: 'cascade' })
      .notNull(),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    isSystem: boolean('is_system').notNull().default(false),
    active: boolean().notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    index('logbook_templates_org_id_idx').on(table.orgId),
    uniqueIndex('logbook_templates_org_title_idx').on(table.orgId, table.title),
  ]
)

export const logbookEntry = pgTable(
  'logbook_entries',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    templateId: integer('template_id')
      .references(() => logbookTemplate.id, { onDelete: 'cascade' })
      .notNull(),
    authorId: integer('author_id')
      .references(() => user.id)
      .notNull(),
    title: varchar({ length: 255 }),
    body: text().notNull(),
    entryDate: date('entry_date').notNull().default(sql`CURRENT_DATE`),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    index('logbook_entries_template_id_idx').on(table.templateId),
    index('logbook_entries_author_id_idx').on(table.authorId),
    index('logbook_entries_created_at_idx').on(table.createdAt),
  ]
)

export const orgMember = pgTable(
  'organization_members',
  {
    orgId: integer('org_id')
      .references(() => organization.id, { onDelete: 'cascade' })
      .notNull(),
    userId: integer('user_id')
      .references(() => user.id, { onDelete: 'cascade' })
      .notNull(),
    role: varchar({ length: 20 })
      .notNull()
      .default('viewer')
      .$type<'owner' | 'editor' | 'viewer'>(),
    joinedAt: timestamp('joined_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.orgId, table.userId] }),
    index('org_members_user_id_idx').on(table.userId),
    index('org_members_org_id_idx').on(table.orgId),
    index('org_members_role_idx').on(table.role),
    uniqueIndex('one_owner_per_org_idx')
      .on(table.orgId)
      .where(sql`${table.role} = 'owner'`),
  ]
)

// ── Audit Module ────────────────────────────────────────────────────────

export const auditTemplate = pgTable('audit_templates', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  orgId: integer('org_id')
    .references(() => organization.id)
    .notNull(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  frameworkTag: varchar('framework_tag', { length: 50 }),
  createdBy: integer('created_by')
    .references(() => user.id)
    .notNull(),
  active: boolean().notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
})

export const auditCheckpoint = pgTable(
  'audit_checkpoints',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    templateId: integer('template_id')
      .references(() => auditTemplate.id, { onDelete: 'cascade' })
      .notNull(),
    zone: varchar({ length: 100 }).notNull(),
    label: varchar({ length: 255 }).notNull(),
    description: text(),
    scoringType: varchar('scoring_type', { length: 20 })
      .notNull()
      .default('score')
      .$type<'score' | 'pass_fail'>(),
    sortOrder: integer('sort_order').notNull().default(0),
    active: boolean().notNull().default(true),
  },
  (table) => [
    index('checkpoints_template_zone_idx').on(
      table.templateId,
      table.zone,
      table.sortOrder
    ),
  ]
)

export const auditRun = pgTable(
  'audit_runs',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    templateId: integer('template_id')
      .references(() => auditTemplate.id)
      .notNull(),
    orgId: integer('org_id')
      .references(() => organization.id)
      .notNull(),
    conductedBy: integer('conducted_by')
      .references(() => user.id)
      .notNull(),
    status: varchar({ length: 20 })
      .notNull()
      .default('in_progress')
      .$type<'in_progress' | 'completed' | 'cancelled'>(),
    overallScore: integer('overall_score'),
    totalCheckpoints: integer('total_checkpoints'),
    notes: text(),
    startedAt: timestamp('started_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => [
    index('runs_org_id_idx').on(table.orgId),
    index('runs_template_id_idx').on(table.templateId),
    index('runs_conducted_by_idx').on(table.conductedBy),
  ]
)

export const auditFinding = pgTable(
  'audit_findings',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    runId: integer('run_id')
      .references(() => auditRun.id, { onDelete: 'cascade' })
      .notNull(),
    checkpointId: integer('checkpoint_id')
      .references(() => auditCheckpoint.id)
      .notNull(),
    score: integer(),
    passed: boolean(),
    severity: varchar({ length: 20 }).$type<
      'low' | 'medium' | 'high' | 'critical'
    >(),
    notes: text(),
    flagged: boolean().notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    index('findings_run_id_idx').on(table.runId),
    index('findings_checkpoint_id_idx').on(table.checkpointId),
  ]
)

export const auditAction = pgTable(
  'audit_actions',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    findingId: integer('finding_id')
      .references(() => auditFinding.id, { onDelete: 'cascade' })
      .notNull(),
    runId: integer('run_id')
      .references(() => auditRun.id, { onDelete: 'cascade' })
      .notNull(),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    assignedTo: integer('assigned_to').references(() => user.id),
    priority: varchar({ length: 20 })
      .notNull()
      .default('medium')
      .$type<'low' | 'medium' | 'high' | 'critical'>(),
    recurrence: varchar({ length: 20 }).$type<
      'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semi_annual' | 'yearly'
    >(),
    status: varchar({ length: 20 })
      .notNull()
      .default('proposed')
      .$type<'proposed' | 'approved' | 'promoted' | 'dismissed'>(),
    taskId: integer('task_id').references((): AnyPgColumn => task.id),
    sectionId: integer('section_id').references(() => section.id),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    index('actions_run_id_idx').on(table.runId),
    index('actions_finding_id_idx').on(table.findingId),
    index('actions_status_idx').on(table.status),
  ]
)

export const auditFollowUp = pgTable(
  'audit_follow_ups',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    runId: integer('run_id')
      .references(() => auditRun.id, { onDelete: 'cascade' })
      .notNull(),
    scheduledDate: date('scheduled_date').notNull(),
    status: varchar({ length: 20 })
      .notNull()
      .default('scheduled')
      .$type<'scheduled' | 'completed' | 'skipped'>(),
    conductedBy: integer('conducted_by').references(() => user.id),
    notes: text(),
    score: integer(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [index('follow_ups_run_id_idx').on(table.runId)]
)

export const auditPhoto = pgTable(
  'audit_photos',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    findingId: integer('finding_id')
      .references(() => auditFinding.id, { onDelete: 'cascade' })
      .notNull(),
    storagePath: text('storage_path').notNull(),
    originalFilename: varchar('original_filename', { length: 255 }).notNull(),
    mimeType: varchar('mime_type', { length: 50 }).notNull(),
    fileSize: integer('file_size').notNull(),
    thumbnailPath: text('thumbnail_path'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    createdBy: integer('created_by')
      .references(() => user.id)
      .notNull(),
  },
  (table) => [
    index('photos_finding_id_idx').on(table.findingId),
    index('photos_created_by_idx').on(table.createdBy),
  ]
)
