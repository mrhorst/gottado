import { Router } from 'express'
import { listTodos } from '../controllers/todos.ts'

const router = Router()

// Get list of TODOS
router.get('/', listTodos)

export default router
