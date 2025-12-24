import { Router } from 'express'
import usersRouter from './users.ts'
import tasksRouter from './tasks.ts'
import authRouter from './authentication.ts'
import sectionsRouter from './sections.ts'

import { protect } from '../middleware/authentication.ts'

const api = Router()

api.use('/', authRouter)
api.use(protect)
api.use('/users', usersRouter)
api.use('/tasks', tasksRouter)
api.use('/sections', sectionsRouter)

export default api
