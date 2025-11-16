import db from '../utils/db.ts'
import { NextFunction, Request, Response } from 'express'
import { tasksTable, usersTable } from '../db/schema.ts'
import { AuthRequest } from 'src/middleware/authentication.ts'
import { and, eq } from 'drizzle-orm'

export interface AuthenticatedRequest extends Request {
  token?: string
  user?: {
    email: string
    sub: string | number
    iat: number
  }
}

const listTasks = async (req: AuthenticatedRequest, res: Response) => {
  const tasks = await db
    .select({
      id: tasksTable.id,
      title: tasksTable.title,
      description: tasksTable.description,
      dueDate: tasksTable.dueDate,
      user: { id: usersTable.id, name: usersTable.name },
    })
    .from(tasksTable)
    .innerJoin(usersTable, eq(tasksTable.userId, usersTable.id))
    .where(eq(tasksTable.userId, Number(req.user?.sub)))

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

const updateTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const taskIdToBeUpdated = req.params.id
  const authenticatedUserId = req.user?.sub

  try {
    const task = await db
      .update(tasksTable)
      .set(req.body)
      .where(
        and(
          eq(tasksTable.id, Number(taskIdToBeUpdated)),
          eq(tasksTable.userId, Number(authenticatedUserId))
        )
      )
      .returning()

    if (task.length === 0) return res.sendStatus(404)

    res.send(task)
  } catch (err) {
    next(err)
  }
}

const deleteTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const taskIdToBeDeleted = req.params.id
  const authenticatedUserId = req.user?.sub

  try {
    const deletedTaskId = await db
      .delete(tasksTable)
      .where(
        and(
          eq(tasksTable.id, Number(taskIdToBeDeleted)),
          eq(tasksTable.userId, Number(authenticatedUserId))
        )
      )
      .returning({ id: tasksTable.id })
    if (deletedTaskId.length === 0) return res.sendStatus(404)
    res.sendStatus(204)
  } catch (err) {
    next(err)
  }
}

export { listTasks, createTask, updateTask, deleteTask }
