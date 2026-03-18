import { Router } from 'express'
import { createLaborShift, listLaborReferences, listLaborShifts } from '@/controllers/labor.ts'
import { validate } from '@/middleware/validate.ts'
import { createLaborShiftSchema } from '@/validation/schemas.ts'

const router = Router()

router.get('/references', listLaborReferences)
router.get('/shifts', listLaborShifts)
router.post('/shifts', validate(createLaborShiftSchema), createLaborShift)

export default router
