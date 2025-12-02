import { Router } from 'express'
import {
  listSections,
  createSection,
  updateSection,
  deleteSection,
  getSectionInfo,
} from '../controllers/sections.ts'

const router = Router()

router.get('/', listSections)
router.get('/:id', getSectionInfo)
router.post('/', createSection)
router.put('/:id', updateSection)
router.delete('/:id', deleteSection)

export default router
