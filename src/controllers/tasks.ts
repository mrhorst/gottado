import db from '../utils/db.ts'
import { NextFunction, Request, Response } from 'express'
import { tasksTable, usersTable } from '../db/schema.ts'
import { AuthRequest } from 'src/middleware/authentication.ts'
import { eq } from 'drizzle-orm'

const listTasks = async (_req: Request, res: Response) => {
  const tasks = await await db
    .select({
      id: tasksTable.id,
      title: tasksTable.title,
      description: tasksTable.description,
      dueDate: tasksTable.dueDate,
      user: { id: usersTable.id, name: usersTable.name },
    })
    .from(tasksTable)
    .innerJoin(usersTable, eq(tasksTable.userId, usersTable.id))
  res.send(tasks)
}

const createTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body
    const taskPayload = { ...body, userId: req.user?.sub }
    console.log(taskPayload)

    const task = await db.insert(tasksTable).values(taskPayload).returning()
    res.status(201).send(task)
  } catch (err: unknown) {
    next(err)
  }
}

const updateTask = async (_req: Request, _res: Response) => {}

const deleteTask = async (_req: Request, _res: Response) => {}

export { listTasks, createTask, updateTask, deleteTask }
