import { NextFunction, Response } from 'express'
import db from '@/utils/db.ts'
import { auditFollowUp } from '@/db/schema.ts'
import { eq } from 'drizzle-orm'
import { AuthenticatedRequest } from '@/types/index.ts'

const listFollowUps = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const runId = Number(req.params.runId)

  try {
    const followUps = await db
      .select()
      .from(auditFollowUp)
      .where(eq(auditFollowUp.runId, runId))

    res.send(followUps)
  } catch (err) {
    next(err)
  }
}

const scheduleFollowUp = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const runId = Number(req.params.runId)
  const userId = Number(req.user!.sub)
  const { scheduledDate } = req.body

  try {
    const [created] = await db
      .insert(auditFollowUp)
      .values({
        runId,
        scheduledDate,
        conductedBy: userId,
      })
      .returning()

    res.status(201).send(created)
  } catch (err) {
    next(err)
  }
}

const updateFollowUp = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const followUpId = Number(req.params.id)
  const { notes, status } = req.body

  try {
    const [updated] = await db
      .update(auditFollowUp)
      .set({ notes, status })
      .where(eq(auditFollowUp.id, followUpId))
      .returning()

    if (!updated) return res.sendStatus(404)
    res.send(updated)
  } catch (err) {
    next(err)
  }
}

const completeFollowUp = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const followUpId = Number(req.params.id)
  const { notes, score } = req.body

  try {
    const [completed] = await db
      .update(auditFollowUp)
      .set({
        status: 'completed',
        notes,
        score,
        completedAt: new Date(),
      })
      .where(eq(auditFollowUp.id, followUpId))
      .returning()

    if (!completed) return res.sendStatus(404)
    res.send(completed)
  } catch (err) {
    next(err)
  }
}

export { listFollowUps, scheduleFollowUp, updateFollowUp, completeFollowUp }
