import { Router } from 'express'
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
  getTaskHistory,
  getTaskActivities,
  getDailySnapshot,
  getCompletionsByUser,
} from '../controllers/tasks.ts'
import { validate } from '@/middleware/validate.ts'
import { createTaskSchema, updateTaskSchema } from '@/validation/schemas.ts'

const router = Router()

router.get('/', listTasks)
router.get('/snapshot', getDailySnapshot)
router.get('/completions-by-user', getCompletionsByUser)
router.post('/', validate(createTaskSchema), createTask)
router.get('/:id/history', getTaskHistory)
router.get('/:id/activities', getTaskActivities)
router.put('/:id', validate(updateTaskSchema), updateTask)
router.delete('/:id', deleteTask)

export default router
