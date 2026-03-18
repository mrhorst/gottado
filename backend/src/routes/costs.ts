import { Router } from 'express'
import {
  createCostRecord,
  exportCostRecords,
  listCostRecords,
  listCostReferences,
} from '@/controllers/costs.ts'
import { validate } from '@/middleware/validate.ts'
import { createCostRecordSchema } from '@/validation/schemas.ts'

const router = Router()

router.get('/references', listCostReferences)
router.get('/records', listCostRecords)
router.get('/records/export', exportCostRecords)
router.post('/records', validate(createCostRecordSchema), createCostRecord)

export default router
