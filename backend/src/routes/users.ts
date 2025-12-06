import { Router } from 'express'
import { listUsers, updateUser, deleteUser, me } from '../controllers/users.ts'

const router = Router()

router.get('/', listUsers)

router.put('/:id', updateUser)
router.delete('/:id', deleteUser)
router.get('/me', me)

export default router
