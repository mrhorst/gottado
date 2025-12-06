import { Router } from 'express'
import { userLogin, userLogout } from '../controllers/authentication.ts'
import { createUser } from '@/controllers/users.ts'

const router = Router()

router.post('/login', userLogin)
router.post('/logout', userLogout)
router.post('/signup', createUser)

export default router
