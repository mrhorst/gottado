import { NextFunction, Response } from 'express'
import { and, asc, eq, sql } from 'drizzle-orm'
import { AuthenticatedRequest } from '@/types/index.ts'
import { getUserOrgRole } from '@/utils/auditHelpers.ts'
import { costRecord, section } from '@/db/schema.ts'
import db from '@/utils/db.ts'
import { AppError } from '@/utils/AppError.ts'

const ensureOrgAccess = async (userId: number, orgId: number) => {
  const role = await getUserOrgRole(userId, orgId)
  if (!role) throw new AppError('organization access required', 403)
  return role
}

const ensureOrgManager = async (userId: number, orgId: number) => {
  const role = await ensureOrgAccess(userId, orgId)
  if (role !== 'owner' && role !== 'editor') {
    throw new AppError('only owners and editors can manage cost records', 403)
  }
}

const getEntryDate = (value?: string) => value ?? new Date().toISOString().slice(0, 10)

export const listCostReferences = async (
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

export const listCostRecords = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const userId = Number(req.user?.sub)
  const entryDate = getEntryDate(
    typeof req.query.date === 'string' ? req.query.date : undefined
  )

  try {
    await ensureOrgAccess(userId, orgId)

    const records = await db
      .select({
        id: costRecord.id,
        kind: costRecord.kind,
        title: costRecord.title,
        entryDate: costRecord.entryDate,
        amount: costRecord.amount,
        areaId: costRecord.areaId,
        areaName: section.name,
        vendorName: costRecord.vendorName,
        quantityLabel: costRecord.quantityLabel,
        notes: costRecord.notes,
        createdAt: costRecord.createdAt,
      })
      .from(costRecord)
      .leftJoin(section, eq(section.id, costRecord.areaId))
      .where(and(eq(costRecord.orgId, orgId), eq(costRecord.entryDate, entryDate)))
      .orderBy(asc(costRecord.kind), asc(costRecord.title))

    const [summary] = await db
      .select({
        totalAmount: sql<string>`coalesce(sum(${costRecord.amount})::text, '0.00')`,
        wasteCount: sql<number>`count(*) filter (where ${costRecord.kind} = 'waste')::int`,
        purchaseCount: sql<number>`count(*) filter (where ${costRecord.kind} = 'purchase')::int`,
        vendorIssueCount: sql<number>`count(*) filter (where ${costRecord.kind} = 'vendor_issue')::int`,
      })
      .from(costRecord)
      .where(and(eq(costRecord.orgId, orgId), eq(costRecord.entryDate, entryDate)))

    res.send({
      summary: {
        totalAmount: summary?.totalAmount ?? '0.00',
        wasteCount: summary?.wasteCount ?? 0,
        purchaseCount: summary?.purchaseCount ?? 0,
        vendorIssueCount: summary?.vendorIssueCount ?? 0,
      },
      records,
    })
  } catch (error) {
    next(error)
  }
}

export const createCostRecord = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const userId = Number(req.user?.sub)
  const { kind, title, entryDate, amount, areaId, vendorName, quantityLabel, notes } =
    req.body

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
      .insert(costRecord)
      .values({
        orgId,
        kind,
        title,
        entryDate,
        amount,
        areaId: areaId ?? null,
        vendorName: vendorName ?? null,
        quantityLabel: quantityLabel ?? null,
        notes: notes ?? null,
        createdBy: userId,
      })
      .returning()

    const [fullRecord] = await db
      .select({
        id: costRecord.id,
        kind: costRecord.kind,
        title: costRecord.title,
        entryDate: costRecord.entryDate,
        amount: costRecord.amount,
        areaId: costRecord.areaId,
        areaName: section.name,
        vendorName: costRecord.vendorName,
        quantityLabel: costRecord.quantityLabel,
        notes: costRecord.notes,
        createdAt: costRecord.createdAt,
      })
      .from(costRecord)
      .leftJoin(section, eq(section.id, costRecord.areaId))
      .where(eq(costRecord.id, created.id))
      .limit(1)

    res.status(201).send(fullRecord)
  } catch (error) {
    next(error)
  }
}
