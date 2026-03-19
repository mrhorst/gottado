import { NextFunction, Response } from 'express'
import { and, asc, eq } from 'drizzle-orm'
import { AuthenticatedRequest } from '@/types/index.ts'
import { getUserOrgRole } from '@/utils/auditHelpers.ts'
import { dayPart } from '@/db/schema.ts'
import db from '@/utils/db.ts'
import { AppError } from '@/utils/AppError.ts'

const ensureOrgAccess = async (userId: number, orgId: number) => {
  const role = await getUserOrgRole(userId, orgId)
  if (!role) {
    throw new AppError('organization access required', 403)
  }
  return role
}

const ensureOrgManager = async (userId: number, orgId: number) => {
  const role = await ensureOrgAccess(userId, orgId)
  if (role !== 'owner' && role !== 'editor') {
    throw new AppError('only owners and editors can manage day parts', 403)
  }
}

export const listDayParts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const userId = Number(req.user?.sub)

  try {
    await ensureOrgAccess(userId, orgId)

    const parts = await db
      .select()
      .from(dayPart)
      .where(eq(dayPart.orgId, orgId))
      .orderBy(asc(dayPart.sortOrder), asc(dayPart.startTime))

    res.send(parts)
  } catch (error) {
    next(error)
  }
}

export const createDayPart = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const userId = Number(req.user?.sub)
  const { name, startTime, endTime, sortOrder } = req.body

  try {
    await ensureOrgManager(userId, orgId)

    const [created] = await db
      .insert(dayPart)
      .values({
        orgId,
        name,
        startTime,
        endTime,
        sortOrder: sortOrder ?? 0,
      })
      .returning()

    res.status(201).send(created)
  } catch (error) {
    next(error)
  }
}

export const updateDayPart = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const userId = Number(req.user?.sub)
  const partId = Number(req.params.id)

  try {
    await ensureOrgManager(userId, orgId)

    const [updated] = await db
      .update(dayPart)
      .set({
        ...req.body,
        updatedAt: new Date(),
      })
      .where(and(eq(dayPart.id, partId), eq(dayPart.orgId, orgId)))
      .returning()

    if (!updated) {
      throw new AppError('day part not found', 404)
    }

    res.send(updated)
  } catch (error) {
    next(error)
  }
}

export const deleteDayPart = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const userId = Number(req.user?.sub)
  const partId = Number(req.params.id)

  try {
    await ensureOrgManager(userId, orgId)

    const [deleted] = await db
      .delete(dayPart)
      .where(and(eq(dayPart.id, partId), eq(dayPart.orgId, orgId)))
      .returning()

    if (!deleted) {
      throw new AppError('day part not found', 404)
    }

    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}
