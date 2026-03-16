import { Router } from 'express'
import { listUsers, updateUser, deleteUser, me } from '../controllers/users.ts'

const router = Router()

router.get('/', listUsers)
router.get('/me', me)
router.put('/me', updateUser)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)

export default router
