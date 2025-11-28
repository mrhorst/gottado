import db from '../utils/db.ts'
import { NextFunction, Request, Response } from 'express'
import { task, user } from '../db/schema.ts'
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
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      complete: task.complete,
      // user: { id: user.id, name: user.name },
    })
    .from(task)
    .innerJoin(user, eq(task.userId, user.id))
    .where(eq(task.userId, Number(req.user?.sub)))

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

    const taskRecord = await db.insert(task).values(taskPayload).returning()
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
    const taskRecord = await db
      .update(task)
      .set(req.body)
      .where(
        and(
          eq(task.id, Number(taskIdToBeUpdated)),
          eq(task.userId, Number(authenticatedUserId))
        )
      )
      .returning()

    if (taskRecord.length === 0) return res.sendStatus(404)

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
      .delete(task)
      .where(
        and(
          eq(task.id, Number(taskIdToBeDeleted)),
          eq(task.userId, Number(authenticatedUserId))
        )
      )
      .returning({ id: task.id })
    if (deletedTaskId.length === 0) return res.sendStatus(404)
    res.sendStatus(204)
  } catch (err) {
    next(err)
  }
}

export { listTasks, createTask, updateTask, deleteTask }
