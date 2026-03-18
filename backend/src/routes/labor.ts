import { Router } from 'express'
import { createLaborShift, listLaborReferences, listLaborShifts } from '@/controllers/labor.ts'
import { createDayPart, deleteDayPart, listDayParts, updateDayPart } from '@/controllers/dayParts.ts'
import { validate } from '@/middleware/validate.ts'
import {
  createDayPartSchema,
  createLaborShiftSchema,
  updateDayPartSchema,
} from '@/validation/schemas.ts'

const router = Router()

// Day parts
router.get('/day-parts', listDayParts)
router.post('/day-parts', validate(createDayPartSchema), createDayPart)
router.put('/day-parts/:id', validate(updateDayPartSchema), updateDayPart)
router.delete('/day-parts/:id', deleteDayPart)

// Shifts
router.get('/references', listLaborReferences)
router.get('/shifts', listLaborShifts)
router.post('/shifts', validate(createLaborShiftSchema), createLaborShift)

export default router
