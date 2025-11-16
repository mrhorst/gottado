import { Router } from 'express'
import usersRouter from './users.ts'
import tasksRouter from './tasks.ts'
import authRouter from './authentication.ts'

import {
  authenticateUser,
  tokenExtractor,
} from '../middleware/authentication.ts'

const api = Router()

api.use('/', authRouter)
api.use('/users', usersRouter) // we need to revisit this later to see how we should protect it
api.use('/tasks', tokenExtractor, authenticateUser, tasksRouter)

export default api
