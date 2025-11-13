import { Router } from 'express'
import usersRouter from './users.ts'
import tasksRouter from './tasks.ts'

const api = Router()

api.use('/users', usersRouter)
api.use('/tasks', tasksRouter)

export default api
