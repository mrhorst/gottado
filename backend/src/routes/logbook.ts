import { Router } from 'express'
import { validate } from '@/middleware/validate.ts'
import {
  createLogbookTemplateSchema,
  upsertLogbookEntrySchema,
} from '@/validation/schemas.ts'
import {
  createLogbookTemplate,
  getEntryByDate,
  getEntryDates,
  getEntryHistory,
  listLogbookTemplates,
  upsertTodayEntry,
} from '@/controllers/logbook.ts'

const router = Router()

router.get('/templates', listLogbookTemplates)
router.post('/templates', validate(createLogbookTemplateSchema), createLogbookTemplate)
router.get('/templates/:id/entries/:date', getEntryByDate)
router.put('/templates/:id/entries/today', validate(upsertLogbookEntrySchema), upsertTodayEntry)
router.get('/templates/:id/entries/:date/history', getEntryHistory)
router.get('/templates/:id/entry-dates', getEntryDates)

export default router
