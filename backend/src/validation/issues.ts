import { z } from 'zod'

export const createIssueRecordSchema = z.object({
  category: z.enum(['guest', 'staffing', 'maintenance', 'inventory', 'financial']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string().min(1).max(255),
  entryDate: z.string().min(1).max(10),
  areaId: z.number().int().positive().nullable().optional(),
  followUpRequired: z.boolean().optional(),
  notes: z.string().max(5000).optional(),
})
