import { Router } from 'express'
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
} from '../controllers/tasks.ts'

const router = Router()

router.get('/', listTasks)
router.post('/', createTask)
router.put('/:id', updateTask)
router.delete('/:id', deleteTask)

export default router
