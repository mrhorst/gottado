import { Router } from 'express'
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
} from '../controllers/tasks.ts'
import {
  authenticateUser,
  tokenExtractor,
} from '../middleware/authentication.ts'

const router = Router()

router.get('/', listTasks)
router.post('/', tokenExtractor, authenticateUser, createTask)
router.put('/:id', updateTask)
router.delete('/:id', deleteTask)

export default router
