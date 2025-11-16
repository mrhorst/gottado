import { Router } from 'express'
import { userLogin, userLogout } from '../controllers/authentication.ts'

const router = Router()

router.post('/login', userLogin)
router.post('/logout', userLogout)

export default router
