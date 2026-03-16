import { NextFunction, Response } from 'express'
import db from '@/utils/db.ts'
import { auditAction, auditFinding, auditCheckpoint, auditRun, auditTemplate, user, task } from '@/db/schema.ts'
import { and, eq, inArray, desc } from 'drizzle-orm'
import { AuthenticatedRequest } from '@/types/index.ts'
import { AppError } from '@/utils/AppError.ts'

const listActions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const runId = Number(req.params.runId)
  const { status } = req.query

  try {
    const filters = [eq(auditAction.runId, runId)]
    if (status && typeof status === 'string') {
      filters.push(
        eq(
          auditAction.status,
          status as 'proposed' | 'approved' | 'promoted' | 'dismissed'
        )
      )
    }

    const actions = await db
      .select()
      .from(auditAction)
      .where(and(...filters))

    res.send(actions)
  } catch (err) {
    next(err)
  }
}

const createAction = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const runId = Number(req.params.runId)
  const { findingId, title, description, assignedTo, priority, recurrence } =
    req.body

  try {
    const [created] = await db
      .insert(auditAction)
      .values({
        findingId,
        runId,
        title,
        description,
        assignedTo,
        priority: priority || 'medium',
        recurrence,
      })
      .returning()

    res.status(201).send(created)
  } catch (err) {
    next(err)
  }
}

const updateAction = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const actionId = Number(req.params.id)
  const { title, description, assignedTo, priority, recurrence, sectionId } =
    req.body

  try {
    const [updated] = await db
      .update(auditAction)
      .set({
        title,
        description,
        assignedTo,
        priority,
        recurrence,
        sectionId,
        updatedAt: new Date(),
      })
      .where(eq(auditAction.id, actionId))
      .returning()

    if (!updated) throw new AppError('action not found', 404)
    res.send(updated)
  } catch (err) {
    next(err)
  }
}

const promoteAction = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const actionId = Number(req.params.id)
  const { sectionId, title, description, dueDate, measurableCriteria } = req.body

  try {
    const [action] = await db
      .select()
      .from(auditAction)
      .where(eq(auditAction.id, actionId))
      .limit(1)

    if (!action) throw new AppError('action not found', 404)
    if (action.status === 'promoted') {
      throw new AppError('action already promoted', 400)
    }

    // Look up the finding's checkpoint zone for relevanceTag
    let relevanceTag: string | null = null
    const [findingWithZone] = await db
      .select({ zone: auditCheckpoint.zone })
      .from(auditFinding)
      .innerJoin(
        auditCheckpoint,
        eq(auditFinding.checkpointId, auditCheckpoint.id)
      )
      .where(eq(auditFinding.id, action.findingId))
      .limit(1)

    if (findingWithZone) {
      relevanceTag = findingWithZone.zone
    }

    const result = await db.transaction(async (tx) => {
      const [newTask] = await tx
        .insert(task)
        .values({
          title: title || action.title,
          description: description ?? action.description,
          sectionId,
          dueDate: dueDate || null,
          measurableCriteria: measurableCriteria || null,
          relevanceTag,
          recurrence: action.recurrence,
          complete: false,
        })
        .returning()

      const [promoted] = await tx
        .update(auditAction)
        .set({
          status: 'promoted',
          taskId: newTask.id,
          sectionId,
          updatedAt: new Date(),
        })
        .where(eq(auditAction.id, actionId))
        .returning()

      return { action: promoted, task: newTask }
    })

    res.status(201).send(result)
  } catch (err) {
    next(err)
  }
}

const dismissAction = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const actionId = Number(req.params.id)

  try {
    const [dismissed] = await db
      .update(auditAction)
      .set({ status: 'dismissed', updatedAt: new Date() })
      .where(eq(auditAction.id, actionId))
      .returning()

    if (!dismissed) throw new AppError('action not found', 404)
    res.send(dismissed)
  } catch (err) {
    next(err)
  }
}

/**
 * Org-wide pending action items — returns all proposed/approved actions
 * across all audit runs for the current org, enriched with audit context.
 */
const listActionItems = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const statusFilter = req.query.status as string | undefined

  try {
    const allowedStatuses = statusFilter
      ? [statusFilter as 'proposed' | 'approved' | 'promoted' | 'dismissed']
      : ['proposed', 'approved'] as const

    const items = await db
      .select({
        id: auditAction.id,
        title: auditAction.title,
        description: auditAction.description,
        priority: auditAction.priority,
        status: auditAction.status,
        recurrence: auditAction.recurrence,
        assignedTo: auditAction.assignedTo,
        assignedUserName: user.name,
        runId: auditAction.runId,
        auditName: auditTemplate.name,
        auditDate: auditRun.startedAt,
        findingId: auditAction.findingId,
        taskId: auditAction.taskId,
        createdAt: auditAction.createdAt,
        updatedAt: auditAction.updatedAt,
      })
      .from(auditAction)
      .innerJoin(auditRun, eq(auditAction.runId, auditRun.id))
      .innerJoin(auditTemplate, eq(auditRun.templateId, auditTemplate.id))
      .leftJoin(user, eq(auditAction.assignedTo, user.id))
      .where(
        and(
          eq(auditRun.orgId, orgId),
          inArray(auditAction.status, [...allowedStatuses])
        )
      )
      .orderBy(desc(auditAction.createdAt))

    res.send(items)
  } catch (err) {
    next(err)
  }
}

export { listActions, createAction, updateAction, promoteAction, dismissAction, listActionItems }
