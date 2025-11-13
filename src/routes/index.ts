import { Router } from 'express'
import usersRouter from './users.ts'
import tasksRouter from './tasks.ts'
import authRouter from './authentication.ts'

const api = Router()

api.use('/', authRouter)
api.use('/users', usersRouter)
api.use('/tasks', tasksRouter)

export default api
