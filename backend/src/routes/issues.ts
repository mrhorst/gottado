import { Router } from 'express'
import { createIssueRecord, listIssueRecords, listIssueReferences } from '@/controllers/issues.ts'
import { validate } from '@/middleware/validate.ts'
import { createIssueRecordSchema } from '@/validation/issues.ts'

const router = Router()

router.get('/references', listIssueReferences)
router.get('/records', listIssueRecords)
router.post('/records', validate(createIssueRecordSchema), createIssueRecord)

export default router
