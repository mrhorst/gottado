import { Router } from 'express'
import { validate } from '@/middleware/validate.ts'
import {
  createLogbookEntrySchema,
  createLogbookTemplateSchema,
} from '@/validation/schemas.ts'
import {
  createLogbookEntry,
  createLogbookTemplate,
  getLogbookEntries,
  listLogbookTemplates,
} from '@/controllers/logbook.ts'

const router = Router()

router.get('/templates', listLogbookTemplates)
router.post('/templates', validate(createLogbookTemplateSchema), createLogbookTemplate)
router.get('/templates/:id/entries', getLogbookEntries)
router.post('/templates/:id/entries', validate(createLogbookEntrySchema), createLogbookEntry)

export default router
