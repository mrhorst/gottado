import { Router } from 'express'
import {
  listSections,
  createSection,
  updateSection,
  getSectionInfo,
  addMember,
  updateMemberRole,
  unsubscribeMember,
  deleteSection,
} from '../controllers/sections.ts'
import { validate } from '@/middleware/validate.ts'
import {
  createSectionSchema,
  updateSectionSchema,
  addSectionMemberSchema,
  updateSectionMemberSchema,
} from '@/validation/schemas.ts'

const router = Router()

router.get('/', listSections)
router.get('/:id', getSectionInfo)
router.post('/', validate(createSectionSchema), createSection)
router.put('/:id', validate(updateSectionSchema), updateSection)
router.delete('/:id', deleteSection)

router.post('/:id/members', validate(addSectionMemberSchema), addMember)
router.put('/:id/members', validate(updateSectionMemberSchema), updateMemberRole)

router.delete('/:id/members/:userId', unsubscribeMember)

export default router
