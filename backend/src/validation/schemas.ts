import { z } from 'zod'

// ── Auth ────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const signupSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  password: z.string().min(6),
})

// ── Organizations ───────────────────────────────────────────────────────

export const createOrgSchema = z.object({
  name: z.string().min(1).max(255),
})

export const updateOrgSchema = z.object({
  name: z.string().min(1).max(255),
})

export const addOrgMemberSchema = z.object({
  userId: z.number().int().positive(),
  role: z.enum(['editor', 'viewer']).optional().default('viewer'),
})

export const updateOrgMemberSchema = z.object({
  userId: z.number().int().positive(),
  role: z.enum(['owner', 'editor', 'viewer']),
})

// ── Teams ───────────────────────────────────────────────────────────────

export const createTeamSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(255).optional(),
})

export const updateTeamSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(255).nullable().optional(),
  active: z.boolean().optional(),
})

export const addTeamMemberSchema = z.object({
  userId: z.number().int().positive(),
  role: z.enum(['lead', 'member']).optional().default('member'),
})

export const updateTeamMemberSchema = z.object({
  userId: z.number().int().positive(),
  role: z.enum(['lead', 'member']),
})

// ── Sections ────────────────────────────────────────────────────────────

export const createSectionSchema = z.object({
  name: z.string().min(1).max(255),
})

export const updateSectionSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  active: z.boolean().optional(),
  teamId: z.number().int().positive().nullable().optional(),
})

export const createTaskListSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(255).optional(),
})

export const addSectionMemberSchema = z.object({
  sectionId: z.number().int().positive(),
  userId: z.number().int().positive(),
})

export const updateSectionMemberSchema = z.object({
  sectionId: z.number().int().positive(),
  userId: z.number().int().positive(),
  role: z.enum(['editor', 'viewer']),
})

// ── Tasks ───────────────────────────────────────────────────────────────

const recurrenceEnum = z.enum([
  'daily', 'weekly', 'monthly', 'quarterly', 'semi_annual', 'yearly',
])
const taskPriorityEnum = z.enum(['low', 'medium', 'high'])

export const createTaskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(255).optional(),
  dueDate: z.string().optional(),
  deadlineTime: z.string().max(5).optional(),
  recurrence: recurrenceEnum.optional(),
  requiresPicture: z.boolean().optional(),
  priority: taskPriorityEnum.optional(),
  sectionId: z.number().int().positive(),
  listId: z.number().int().positive().optional(),
})

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(255).optional(),
  dueDate: z.string().nullable().optional(),
  deadlineTime: z.string().max(5).nullable().optional(),
  recurrence: recurrenceEnum.nullable().optional(),
  requiresPicture: z.boolean().optional(),
  priority: taskPriorityEnum.nullable().optional(),
  listId: z.number().int().positive().nullable().optional(),
  complete: z.boolean().optional(),
  pictureUrl: z.string().max(500).nullable().optional(),
})

// ── Audit Templates ─────────────────────────────────────────────────────

export const createTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
})

export const updateTemplateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
})

// ── Audit Checkpoints ───────────────────────────────────────────────────

export const addCheckpointSchema = z.object({
  zone: z.string().min(1).max(100),
  label: z.string().min(1).max(255),
  description: z.string().optional(),
  scoringType: z.enum(['score', 'pass_fail']).optional().default('score'),
  sortOrder: z.number().int().optional().default(0),
})

export const updateCheckpointSchema = z.object({
  zone: z.string().min(1).max(100).optional(),
  label: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  scoringType: z.enum(['score', 'pass_fail']).optional(),
  sortOrder: z.number().int().optional(),
})

export const reorderCheckpointsSchema = z.object({
  items: z.array(
    z.object({
      id: z.number().int().positive(),
      sortOrder: z.number().int(),
    })
  ),
})

// ── Audit Runs ──────────────────────────────────────────────────────────

export const startRunSchema = z.object({
  templateId: z.number().int().positive(),
})

export const completeRunSchema = z.object({
  notes: z.string().optional(),
})

// ── Audit Findings ──────────────────────────────────────────────────────

export const assessFindingSchema = z.object({
  score: z.number().int().min(0).max(5).optional(),
  passed: z.boolean().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  notes: z.string().optional(),
  flagged: z.boolean().optional(),
})

export const batchAssessFindingsSchema = z.object({
  findings: z.array(
    z.object({
      id: z.number().int().positive(),
      score: z.number().int().min(0).max(5).optional(),
      passed: z.boolean().optional(),
      severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      notes: z.string().optional(),
      flagged: z.boolean().optional(),
    })
  ),
})

// ── Audit Actions ───────────────────────────────────────────────────────

export const createActionSchema = z.object({
  findingId: z.number().int().positive(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  assignedTo: z.number().int().positive().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  recurrence: z
    .enum(['daily', 'weekly', 'monthly', 'quarterly', 'semi_annual', 'yearly'])
    .optional(),
})

export const updateActionSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  assignedTo: z.number().int().positive().nullable().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  recurrence: z
    .enum(['daily', 'weekly', 'monthly', 'quarterly', 'semi_annual', 'yearly'])
    .nullable()
    .optional(),
  sectionId: z.number().int().positive().nullable().optional(),
})

export const promoteActionSchema = z.object({
  sectionId: z.number().int().positive(),
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(255).optional(),
  dueDate: z.string().optional(),
  deadlineTime: z.string().max(5).optional(),
  recurrence: z
    .enum(['daily', 'weekly', 'monthly', 'quarterly', 'semi_annual', 'yearly'])
    .nullable()
    .optional(),
  measurableCriteria: z.string().optional(),
})

// ── Audit Follow-ups ────────────────────────────────────────────────────

export const scheduleFollowUpSchema = z.object({
  scheduledDate: z.string().min(1),
})

export const updateFollowUpSchema = z.object({
  notes: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'skipped']).optional(),
})

export const completeFollowUpSchema = z.object({
  notes: z.string().optional(),
  score: z.number().int().min(0).max(100).optional(),
})

// ── Ad-hoc Finding (O&U zone) ──────────────────────────────────────────

export const addAdHocFindingSchema = z.object({
  label: z.string().min(1).max(255),
  description: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  notes: z.string().optional(),
})
