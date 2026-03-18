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
const getKindFilter = (value?: string) =>
  value === 'waste' || value === 'purchase' || value === 'vendor_issue' ? value : 'all'

const buildCostFilter = (
  orgId: number,
  from: string,
  to?: string,
  kind: 'all' | 'waste' | 'purchase' | 'vendor_issue' = 'all'
) => {
  const filters = [
    eq(costRecord.orgId, orgId),
    sql`${costRecord.entryDate} >= ${from}`,
    sql`${costRecord.entryDate} <= ${to ?? from}`,
  ]

  if (kind !== 'all') {
    filters.push(eq(costRecord.kind, kind))
  }

  return and(...filters)
}

const csvEscape = (value: string | null | undefined) => {
  const safeValue = value ?? ''
  return `"${safeValue.replaceAll('"', '""')}"`
}

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
  const kind = getKindFilter(typeof req.query.kind === 'string' ? req.query.kind : undefined)

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
      .where(buildCostFilter(orgId, entryDate, entryDate, kind))
      .orderBy(asc(costRecord.kind), asc(costRecord.title))

    const [summary] = await db
      .select({
        totalAmount: sql<string>`coalesce(sum(${costRecord.amount})::text, '0.00')`,
        wasteCount: sql<number>`count(*) filter (where ${costRecord.kind} = 'waste')::int`,
        purchaseCount: sql<number>`count(*) filter (where ${costRecord.kind} = 'purchase')::int`,
        vendorIssueCount: sql<number>`count(*) filter (where ${costRecord.kind} = 'vendor_issue')::int`,
      })
      .from(costRecord)
      .where(buildCostFilter(orgId, entryDate, entryDate, kind))

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

export const exportCostRecords = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const userId = Number(req.user?.sub)
  const from = getEntryDate(typeof req.query.from === 'string' ? req.query.from : undefined)
  const to =
    typeof req.query.to === 'string' && req.query.to.trim().length > 0 ? req.query.to : from
  const kind = getKindFilter(typeof req.query.kind === 'string' ? req.query.kind : undefined)

  try {
    await ensureOrgAccess(userId, orgId)

    const records = await db
      .select({
        entryDate: costRecord.entryDate,
        kind: costRecord.kind,
        title: costRecord.title,
        amount: costRecord.amount,
        areaName: section.name,
        vendorName: costRecord.vendorName,
        quantityLabel: costRecord.quantityLabel,
        notes: costRecord.notes,
      })
      .from(costRecord)
      .leftJoin(section, eq(section.id, costRecord.areaId))
      .where(buildCostFilter(orgId, from, to, kind))
      .orderBy(asc(costRecord.entryDate), asc(costRecord.kind), asc(costRecord.title))

    const header =
      'entryDate,kind,title,amount,areaName,vendorName,quantityLabel,notes'
    const rows = records.map((record) =>
      [
        record.entryDate,
        record.kind,
        record.title,
        record.amount,
        record.areaName,
        record.vendorName,
        record.quantityLabel,
        record.notes,
      ]
        .map((value) => csvEscape(value == null ? '' : String(value)))
        .join(',')
    )

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="cost-records-${from}-to-${to}.csv"`
    )
    res.send([header, ...rows].join('\n'))
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
