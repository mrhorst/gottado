import { Router } from 'express'
import { userLogin, userLogout } from '../controllers/authentication.ts'
import { createUser } from '@/controllers/users.ts'
import { validate } from '@/middleware/validate.ts'
import { loginSchema, signupSchema } from '@/validation/schemas.ts'

const router = Router()

router.post('/login', validate(loginSchema), userLogin)
router.post('/logout', userLogout)
router.post('/signup', validate(signupSchema), createUser)

export default router
