import { Router } from 'express'
import {
  listSections,
  createSection,
  updateSection,
  deleteSection,
} from '../controllers/sections.ts'

const router = Router()

router.get('/', listSections)
router.post('/', createSection)
router.put('/:id', updateSection)
router.delete('/:id', deleteSection)

export default router
