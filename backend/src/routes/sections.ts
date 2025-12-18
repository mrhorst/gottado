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

const router = Router()

router.get('/', listSections)
router.get('/:id', getSectionInfo)
router.post('/', createSection)
router.put('/:id', updateSection)
router.delete('/:id', deleteSection)

router.post('/:id/members', addMember)
router.put('/:id/members', updateMemberRole)

router.delete('/:id/members/:userId', unsubscribeMember)

export default router
