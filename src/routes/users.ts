import { Router } from 'express'
import { listUsers } from '../controllers/users.ts'

const router = Router()

router.get('/', listUsers)

export default router
