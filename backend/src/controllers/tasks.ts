import db from '../utils/db.ts'
import { NextFunction, Response } from 'express'
import { section, sectionMember, task, taskActivity, taskCompletion, user } from '../db/schema.ts'

import { and, eq, desc, gte, lte, sql } from 'drizzle-orm'
import { getUserSectionRole } from '@/utils/controllerHelpers.ts'
import { AuthenticatedRequest } from '@/types/index.ts'

const logActivity = async (
  taskId: number,
  userId: number,
  action: 'created' | 'completed' | 'uncompleted' | 'edited' | 'deleted',
  details?: Record<string, unknown>
) => {
  await db.insert(taskActivity).values({
    taskId,
    userId,
    action,
    details: details ? JSON.stringify(details) : null,
  })
}

const listTasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = Number(req.user?.sub)
  const orgId = Number(req.headers['x-org-id'])

  try {
    const tasks = await db
      .select({
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        complete: task.complete,
        sectionName: section.name,
        recurrence: task.recurrence,
        lastCompletedAt: task.lastCompletedAt,
        deadlineTime: task.deadlineTime,
        requiresPicture: task.requiresPicture,
      })
      .from(task)
      .innerJoin(section, eq(task.sectionId, section.id))
      .innerJoin(sectionMember, eq(section.id, sectionMember.sectionId))
      .where(and(eq(section.orgId, orgId), eq(sectionMember.userId, userId)))

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
  const userId = Number(req.user?.sub)
  try {
    const body = req.body

    const requesterRole = await getUserSectionRole(userId, Number(body.sectionId))

    if (requesterRole !== 'owner' && requesterRole !== 'editor') {
      return res
        .status(403)
        .send({ error: 'only owners and editors can create tasks' })
    }

    const taskPayload = { ...body, userId }

    const [taskRecord] = await db.insert(task).values(taskPayload).returning()
    await logActivity(taskRecord.id, userId, 'created', { title: taskRecord.title })
    res.status(201).send(taskRecord)
  } catch (err: unknown) {
    next(err)
  }
}

const getNextDueDate = (
  currentDueDate: string | null,
  recurrence: string
): string => {
  const base = currentDueDate ? new Date(currentDueDate) : new Date()
  switch (recurrence) {
    case 'daily':
      base.setDate(base.getDate() + 1)
      break
    case 'weekly':
      base.setDate(base.getDate() + 7)
      break
    case 'monthly':
      base.setMonth(base.getMonth() + 1)
      break
    case 'quarterly':
      base.setMonth(base.getMonth() + 3)
      break
    case 'semi_annual':
      base.setMonth(base.getMonth() + 6)
      break
    case 'yearly':
      base.setFullYear(base.getFullYear() + 1)
      break
  }
  return base.toISOString().split('T')[0]
}

const isOnTime = (deadlineTime: string | null): boolean | null => {
  if (!deadlineTime) return null
  const now = new Date()
  const [hours, minutes] = deadlineTime.split(':').map(Number)
  const deadline = new Date(now)
  deadline.setHours(hours, minutes, 0, 0)
  return now <= deadline
}

const updateTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const taskIdToBeUpdated = req.params.id
  const userId = Number(req.user?.sub)

  try {
    // If completing a task, log the completion (only if not already complete)
    if (req.body.complete === true) {
      const [existing] = await db
        .select()
        .from(task)
        .where(eq(task.id, Number(taskIdToBeUpdated)))
        .limit(1)

      if (!existing) return res.sendStatus(404)

      // Already complete — skip logging to prevent double-counting
      if (existing.complete) {
        return res.send(existing)
      }

      // If task requires picture and none provided, reject
      if (existing.requiresPicture && !req.body.pictureUrl) {
        return res.status(400).send({ error: 'This task requires a picture to complete' })
      }

      const now = new Date()
      const onTime = isOnTime(existing.deadlineTime)
      const pictureUrl = req.body.pictureUrl || null

      if (existing.recurrence) {
        // Recurring: log completion, then reset with next due date
        const nextDue = getNextDueDate(existing.dueDate, existing.recurrence)

        const [updated] = await db.transaction(async (tx) => {
          await tx.insert(taskCompletion).values({
            taskId: existing.id,
            completedBy: userId,
            completedAt: now,
            dueDate: existing.dueDate,
            deadlineTime: existing.deadlineTime,
            onTime,
            pictureUrl,
          })

          return tx
            .update(task)
            .set({
              complete: false,
              dueDate: nextDue,
              lastCompletedAt: now,
            })
            .where(eq(task.id, Number(taskIdToBeUpdated)))
            .returning()
        })

        await logActivity(existing.id, userId, 'completed', { recurring: true, onTime, pictureUrl })
        return res.send(updated)
      } else {
        // Non-recurring: log completion and mark complete
        await db.insert(taskCompletion).values({
          taskId: existing.id,
          completedBy: userId,
          completedAt: now,
          dueDate: existing.dueDate,
          deadlineTime: existing.deadlineTime,
          onTime,
          pictureUrl,
        })
        await logActivity(existing.id, userId, 'completed', { onTime, pictureUrl })
      }
    }

    // If un-completing a task, log it
    if (req.body.complete === false) {
      const [existing] = await db
        .select()
        .from(task)
        .where(eq(task.id, Number(taskIdToBeUpdated)))
        .limit(1)

      if (existing?.complete) {
        await logActivity(Number(taskIdToBeUpdated), userId, 'uncompleted')
      }
    }

    // If editing fields (not just toggling complete), log edit
    const editFields = { ...req.body }
    delete editFields.complete
    delete editFields.pictureUrl
    if (Object.keys(editFields).length > 0) {
      await logActivity(Number(taskIdToBeUpdated), userId, 'edited', editFields)
    }

    // Strip fields that don't belong on the task table
    const updatePayload = { ...req.body }
    delete updatePayload.pictureUrl

    const [taskRecord] = await db
      .update(task)
      .set(updatePayload)
      .where(eq(task.id, Number(taskIdToBeUpdated)))
      .returning()

    if (!taskRecord) return res.sendStatus(404)

    res.send(taskRecord)
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
    await logActivity(Number(taskIdToBeDeleted), authenticatedUserId, 'deleted')

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

const getTaskHistory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const taskId = Number(req.params.id)

  try {
    const completions = await db
      .select()
      .from(taskCompletion)
      .where(eq(taskCompletion.taskId, taskId))
      .orderBy(desc(taskCompletion.completedAt))

    res.send(completions)
  } catch (err) {
    next(err)
  }
}

const getTaskActivities = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const taskId = Number(req.params.id)

  try {
    const activities = await db
      .select({
        id: taskActivity.id,
        taskId: taskActivity.taskId,
        userId: taskActivity.userId,
        userName: user.name,
        action: taskActivity.action,
        details: taskActivity.details,
        createdAt: taskActivity.createdAt,
      })
      .from(taskActivity)
      .innerJoin(user, eq(taskActivity.userId, user.id))
      .where(eq(taskActivity.taskId, taskId))
      .orderBy(desc(taskActivity.createdAt))

    res.send(activities)
  } catch (err) {
    next(err)
  }
}

const getDailySnapshot = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const { date: dateStr } = req.query

  try {
    // Default to today if no date provided
    const targetDate = dateStr ? String(dateStr) : new Date().toISOString().split('T')[0]
    const dayStart = new Date(`${targetDate}T00:00:00.000Z`)
    const dayEnd = new Date(`${targetDate}T23:59:59.999Z`)

    const completions = await db
      .select({
        id: taskCompletion.id,
        taskId: taskCompletion.taskId,
        taskTitle: task.title,
        sectionName: section.name,
        completedAt: taskCompletion.completedAt,
        dueDate: taskCompletion.dueDate,
        deadlineTime: taskCompletion.deadlineTime,
        onTime: taskCompletion.onTime,
        recurrence: task.recurrence,
      })
      .from(taskCompletion)
      .innerJoin(task, eq(taskCompletion.taskId, task.id))
      .innerJoin(section, eq(task.sectionId, section.id))
      .where(
        and(
          eq(section.orgId, orgId),
          gte(taskCompletion.completedAt, dayStart),
          lte(taskCompletion.completedAt, dayEnd)
        )
      )
      .orderBy(desc(taskCompletion.completedAt))

    const onTimeCount = completions.filter((c) => c.onTime === true).length
    const lateCount = completions.filter((c) => c.onTime === false).length
    const noDeadlineCount = completions.filter((c) => c.onTime === null).length

    res.send({
      date: targetDate,
      completions,
      summary: {
        total: completions.length,
        onTime: onTimeCount,
        late: lateCount,
        noDeadline: noDeadlineCount,
      },
    })
  } catch (err) {
    next(err)
  }
}

const getCompletionsByUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const { days } = req.query
  const lookbackDays = days ? Number(days) : 7

  try {
    const since = new Date()
    since.setDate(since.getDate() - lookbackDays)

    const rows = await db
      .select({
        userId: taskCompletion.completedBy,
        userName: user.name,
        count: sql<number>`count(*)::int`,
      })
      .from(taskCompletion)
      .innerJoin(task, eq(taskCompletion.taskId, task.id))
      .innerJoin(section, eq(task.sectionId, section.id))
      .innerJoin(user, eq(taskCompletion.completedBy, user.id))
      .where(
        and(
          eq(section.orgId, orgId),
          gte(taskCompletion.completedAt, since)
        )
      )
      .groupBy(taskCompletion.completedBy, user.name)
      .orderBy(sql`count(*) desc`)

    res.send({ days: lookbackDays, users: rows })
  } catch (err) {
    next(err)
  }
}

export { listTasks, createTask, updateTask, deleteTask, getTaskHistory, getTaskActivities, getDailySnapshot, getCompletionsByUser }
