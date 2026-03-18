import { Router } from 'express'
import {
  createLaborShift,
  deleteLaborShift,
  listLaborReferences,
  listLaborShifts,
  publishScheduleDay,
  unpublishScheduleDay,
  updateLaborShift,
} from '@/controllers/labor.ts'
import { createDayPart, deleteDayPart, listDayParts, updateDayPart } from '@/controllers/dayParts.ts'
import { validate } from '@/middleware/validate.ts'
import {
  createDayPartSchema,
  createLaborShiftSchema,
  publishScheduleDaySchema,
  updateDayPartSchema,
  updateLaborShiftSchema,
} from '@/validation/schemas.ts'

const router = Router()

// Day parts
router.get('/day-parts', listDayParts)
router.post('/day-parts', validate(createDayPartSchema), createDayPart)
router.put('/day-parts/:id', validate(updateDayPartSchema), updateDayPart)
router.delete('/day-parts/:id', deleteDayPart)

// Schedule status
router.post('/schedule-day/publish', validate(publishScheduleDaySchema), publishScheduleDay)
router.post('/schedule-day/unpublish', validate(publishScheduleDaySchema), unpublishScheduleDay)

// Shifts
router.get('/references', listLaborReferences)
router.get('/shifts', listLaborShifts)
router.post('/shifts', validate(createLaborShiftSchema), createLaborShift)
router.put('/shifts/:id', validate(updateLaborShiftSchema), updateLaborShift)
router.delete('/shifts/:id', deleteLaborShift)

export default router
