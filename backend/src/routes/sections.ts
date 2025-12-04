import { Router } from 'express'
import {
  listSections,
  createSection,
  updateSection,
  deleteSection,
  getSectionInfo,
  addMember,
  updateMemberRole,
} from '../controllers/sections.ts'

const router = Router()

router.get('/', listSections)
router.get('/:id', getSectionInfo)
router.post('/', createSection)
router.put('/:id', updateSection)
router.delete('/:id', deleteSection)

router.post('/:id/members', addMember)
router.put('/:id/members', updateMemberRole)

export default router
