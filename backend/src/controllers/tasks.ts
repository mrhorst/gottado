import db from '../utils/db.ts'
import { NextFunction, Response } from 'express'
import { section, sectionMember, task } from '../db/schema.ts'

import { and, eq } from 'drizzle-orm'
import { getUserSectionRole } from '@/utils/controllerHelpers.ts'
import { AuthenticatedRequest } from '@/types/index.ts'

const listTasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tasks = await db
      .select({
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        complete: task.complete,
        sectionName: section.name,
      })
      .from(task)
      .innerJoin(section, eq(task.sectionId, section.id))
      .innerJoin(sectionMember, eq(section.id, sectionMember.sectionId))
      .where(eq(sectionMember.userId, Number(req.user?.sub)))

    res.send(tasks)
  } catch (err) {
    console.log(err)
    next(err)
  }
}

const createTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body

    const requesterRole = await getUserSectionRole(
      Number(req.user?.sub),
      Number(body.sectionId)
    )

    if (requesterRole !== 'owner' && requesterRole !== 'editor') {
      return res
        .status(403)
        .send({ error: 'only owners and editors can create tasks' })
    }

    const taskPayload = { ...body, userId: req.user?.sub }

    const taskRecord = await db.insert(task).values(taskPayload).returning()
    res.status(201).send(taskRecord)
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
  // need to add guards to prevent anyone from updating whatever they want
  // also need to refactor this into 2 functions: 1 to update the task's general data, and 1 to updated the completed status

  try {
    const taskRecord = await db
      .update(task)
      .set(req.body)
      .where(and(eq(task.id, Number(taskIdToBeUpdated))))
      .returning()

    if (taskRecord.length === 0) return res.sendStatus(404)

    res.send(taskRecord[0])
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
  const authenticatedUserId = Number(req.user?.sub)

  const role = await getUserSectionRole(
    authenticatedUserId,
    Number(task.sectionId)
  )

  // right now we are deleting tasks, need to think about making them inactive only instead of destroying resources
  if (role !== 'owner') {
    return res.status(403).send({ error: 'only owners can delete tasks' })
  }

  try {
    const deletedTaskId = await db
      .delete(task)
      .where(
        and(
          eq(task.id, Number(taskIdToBeDeleted)),
          eq(sectionMember.userId, authenticatedUserId)
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
