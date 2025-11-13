import db from '../utils/db.ts'
import { Request, Response } from 'express'
import { tasksTable } from '../db/schema.ts'

const listTasks = async (_req: Request, _res: Response) => {}

const createTask = async (req: Request, res: Response) => {
  const body = req.body
  const task = await db.insert(tasksTable).values(body).returning()
  res.status(201).send(task)
}

const updateTask = async (_req: Request, _res: Response) => {}

const deleteTask = async (_req: Request, _res: Response) => {}

export { listTasks, createTask, updateTask, deleteTask }
