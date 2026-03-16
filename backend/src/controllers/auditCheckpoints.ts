import { NextFunction, Response } from 'express'
import db from '@/utils/db.ts'
import { auditCheckpoint } from '@/db/schema.ts'
import { and, eq } from 'drizzle-orm'
import { AuthenticatedRequest } from '@/types/index.ts'
import { getUserOrgRole } from '@/utils/auditHelpers.ts'

const addCheckpoint = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = Number(req.user!.sub)
  const orgId = Number(req.headers['x-org-id'])
  const templateId = Number(req.params.templateId)

  try {
    const role = await getUserOrgRole(userId, orgId)
    if (role !== 'owner' && role !== 'editor') {
      return res
        .status(403)
        .send({ error: 'only owners and editors can manage checkpoints' })
    }

    const { zone, label, description, scoringType, sortOrder } = req.body
    const [created] = await db
      .insert(auditCheckpoint)
      .values({
        templateId,
        zone,
        label,
        description,
        scoringType: scoringType || 'score',
        sortOrder: sortOrder ?? 0,
      })
      .returning()

    res.status(201).send(created)
  } catch (err) {
    next(err)
  }
}

const updateCheckpoint = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = Number(req.user!.sub)
  const orgId = Number(req.headers['x-org-id'])
  const checkpointId = Number(req.params.id)

  try {
    const role = await getUserOrgRole(userId, orgId)
    if (role !== 'owner' && role !== 'editor') {
      return res
        .status(403)
        .send({ error: 'only owners and editors can manage checkpoints' })
    }

    const { zone, label, description, scoringType, sortOrder } = req.body
    const [updated] = await db
      .update(auditCheckpoint)
      .set({ zone, label, description, scoringType, sortOrder })
      .where(eq(auditCheckpoint.id, checkpointId))
      .returning()

    if (!updated) return res.sendStatus(404)
    res.send(updated)
  } catch (err) {
    next(err)
  }
}

const removeCheckpoint = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = Number(req.user!.sub)
  const orgId = Number(req.headers['x-org-id'])
  const checkpointId = Number(req.params.id)

  try {
    const role = await getUserOrgRole(userId, orgId)
    if (role !== 'owner' && role !== 'editor') {
      return res
        .status(403)
        .send({ error: 'only owners and editors can manage checkpoints' })
    }

    const [removed] = await db
      .update(auditCheckpoint)
      .set({ active: false })
      .where(eq(auditCheckpoint.id, checkpointId))
      .returning()

    if (!removed) return res.sendStatus(404)
    res.sendStatus(204)
  } catch (err) {
    next(err)
  }
}

const reorderCheckpoints = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = Number(req.user!.sub)
  const orgId = Number(req.headers['x-org-id'])

  try {
    const role = await getUserOrgRole(userId, orgId)
    if (role !== 'owner' && role !== 'editor') {
      return res
        .status(403)
        .send({ error: 'only owners and editors can manage checkpoints' })
    }

    const items: Array<{ id: number; sortOrder: number }> = req.body.items
    await db.transaction(async (tx) => {
      for (const item of items) {
        await tx
          .update(auditCheckpoint)
          .set({ sortOrder: item.sortOrder })
          .where(eq(auditCheckpoint.id, item.id))
      }
    })

    res.sendStatus(200)
  } catch (err) {
    next(err)
  }
}

export { addCheckpoint, updateCheckpoint, removeCheckpoint, reorderCheckpoints }
