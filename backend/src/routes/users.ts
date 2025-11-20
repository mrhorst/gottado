import { Router } from 'express'
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  me,
} from '../controllers/users.ts'

const router = Router()

router.get('/', listUsers)
router.post('/', createUser)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)
router.get('/me', me)

export default router
