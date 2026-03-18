import { and, asc, eq, sql } from 'drizzle-orm'
import { NextFunction, Response } from 'express'
import { issueRecord, section } from '@/db/schema.ts'
import { AuthenticatedRequest } from '@/types/index.ts'
import { AppError } from '@/utils/AppError.ts'
import { getUserOrgRole } from '@/utils/auditHelpers.ts'
import db from '@/utils/db.ts'

const ensureOrgAccess = async (userId: number, orgId: number) => {
  const role = await getUserOrgRole(userId, orgId)
  if (!role) throw new AppError('organization access required', 403)
  return role
}

const ensureOrgManager = async (userId: number, orgId: number) => {
  const role = await ensureOrgAccess(userId, orgId)
  if (role !== 'owner' && role !== 'editor') {
    throw new AppError('only owners and editors can manage issues', 403)
  }
}

const getEntryDate = (value?: string) => value ?? new Date().toISOString().slice(0, 10)
const getCategoryFilter = (value?: string) =>
  value === 'guest' ||
  value === 'staffing' ||
  value === 'maintenance' ||
  value === 'inventory' ||
  value === 'financial'
    ? value
    : 'all'

export const listIssueReferences = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const userId = Number(req.user?.sub)

  try {
    await ensureOrgAccess(userId, orgId)

    const areas = await db
      .select({
        id: section.id,
        name: section.name,
      })
      .from(section)
      .where(and(eq(section.orgId, orgId), eq(section.active, true)))
      .orderBy(section.name)

    res.send({ areas })
  } catch (error) {
    next(error)
  }
}

export const listIssueRecords = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const userId = Number(req.user?.sub)
  const entryDate = getEntryDate(
    typeof req.query.date === 'string' ? req.query.date : undefined
  )
  const category = getCategoryFilter(
    typeof req.query.category === 'string' ? req.query.category : undefined
  )

  try {
    await ensureOrgAccess(userId, orgId)

    const filters = [
      eq(issueRecord.orgId, orgId),
      eq(issueRecord.entryDate, entryDate),
    ]

    if (category !== 'all') {
      filters.push(eq(issueRecord.category, category))
    }

    const whereClause = and(...filters)

    const records = await db
      .select({
        id: issueRecord.id,
        category: issueRecord.category,
        severity: issueRecord.severity,
        title: issueRecord.title,
        entryDate: issueRecord.entryDate,
        areaId: issueRecord.areaId,
        areaName: section.name,
        followUpRequired: issueRecord.followUpRequired,
        status: issueRecord.status,
        notes: issueRecord.notes,
        createdAt: issueRecord.createdAt,
      })
      .from(issueRecord)
      .leftJoin(section, eq(section.id, issueRecord.areaId))
      .where(whereClause)
      .orderBy(asc(issueRecord.severity), asc(issueRecord.title))

    const [summary] = await db
      .select({
        total: sql<number>`count(*)::int`,
        followUpCount: sql<number>`count(*) filter (where ${issueRecord.followUpRequired} = true)::int`,
        highSeverityCount: sql<number>`count(*) filter (where ${issueRecord.severity} in ('high', 'critical'))::int`,
      })
      .from(issueRecord)
      .where(whereClause)

    res.send({
      summary: {
        total: summary?.total ?? 0,
        followUpCount: summary?.followUpCount ?? 0,
        highSeverityCount: summary?.highSeverityCount ?? 0,
      },
      records,
    })
  } catch (error) {
    next(error)
  }
}

export const createIssueRecord = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const userId = Number(req.user?.sub)
  const { category, severity, title, entryDate, areaId, followUpRequired, notes } = req.body

  try {
    await ensureOrgManager(userId, orgId)

    if (areaId != null) {
      const [area] = await db
        .select({ id: section.id })
        .from(section)
        .where(and(eq(section.id, areaId), eq(section.orgId, orgId)))
        .limit(1)

      if (!area) throw new AppError('area not found', 404)
    }

    const [created] = await db
      .insert(issueRecord)
      .values({
        orgId,
        category,
        severity,
        title,
        entryDate,
        areaId: areaId ?? null,
        followUpRequired: followUpRequired ?? false,
        notes: notes ?? null,
        createdBy: userId,
      })
      .returning()

    const [fullRecord] = await db
      .select({
        id: issueRecord.id,
        category: issueRecord.category,
        severity: issueRecord.severity,
        title: issueRecord.title,
        entryDate: issueRecord.entryDate,
        areaId: issueRecord.areaId,
        areaName: section.name,
        followUpRequired: issueRecord.followUpRequired,
        status: issueRecord.status,
        notes: issueRecord.notes,
        createdAt: issueRecord.createdAt,
      })
      .from(issueRecord)
      .leftJoin(section, eq(section.id, issueRecord.areaId))
      .where(eq(issueRecord.id, created.id))
      .limit(1)

    res.status(201).send(fullRecord)
  } catch (error) {
    next(error)
  }
}
