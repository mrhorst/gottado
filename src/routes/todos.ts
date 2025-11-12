import { Router } from 'express'
import {
  createTodo,
  deleteTodo,
  listTodos,
  updateTodo,
} from '../controllers/todos.ts'

const router = Router()

router.get('/', listTodos)
router.post('/', createTodo)
router.put('/:id', updateTodo)
router.delete('/:id', deleteTodo)

export default router
