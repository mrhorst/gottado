import { Router } from 'express'
import usersRouter from './users.ts'
import todosRouter from './todos.ts'

const api = Router()

api.use('/users', usersRouter)
api.use('/todos', todosRouter)

export default api
