import { AuthenticatedRequest } from '@/types/index.ts'
import { getUserOrgRole } from '@/utils/auditHelpers.ts'
import db from '@/utils/db.ts'
import { logbookEntry, logbookEntryEdit, logbookTemplate, user } from '@/db/schema.ts'
import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import { NextFunction, Response } from 'express'

const ensureGeneralLog = async (orgId: number) => {
  await db
    .insert(logbookTemplate)
    .values({
      orgId,
      title: 'General Log',
      description: 'Daily operating notes and manager handoff context.',
      isSystem: true,
    })
    .onConflictDoNothing({
      target: [logbookTemplate.orgId, logbookTemplate.title],
    })
}

export const listLogbookTemplates = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const userId = Number(req.user?.sub)

  try {
    const role = await getUserOrgRole(userId, orgId)
    if (!role) return res.status(403).send({ error: 'organization access required' })

    await ensureGeneralLog(orgId)

    const templates = await db
      .select({
        id: logbookTemplate.id,
        title: logbookTemplate.title,
        description: logbookTemplate.description,
        isSystem: logbookTemplate.isSystem,
        active: logbookTemplate.active,
      })
      .from(logbookTemplate)
      .where(and(eq(logbookTemplate.orgId, orgId), eq(logbookTemplate.active, true)))

    const counts = await db
      .select({
        templateId: logbookEntry.templateId,
        entryCount: sql<number>`count(*)::int`,
      })
      .from(logbookEntry)
      .where(inArray(logbookEntry.templateId, templates.map((t) => t.id)))
      .groupBy(logbookEntry.templateId)

    const latestEntries = await db
      .select({
        id: logbookEntry.id,
        templateId: logbookEntry.templateId,
        body: logbookEntry.body,
        createdAt: logbookEntry.createdAt,
        authorName: user.name,
      })
      .from(logbookEntry)
      .innerJoin(user, eq(logbookEntry.authorId, user.id))
      .where(inArray(logbookEntry.templateId, templates.map((t) => t.id)))
      .orderBy(desc(logbookEntry.createdAt))

    const countMap = new Map(counts.map((row) => [row.templateId, row.entryCount]))
    const latestMap = new Map<number, (typeof latestEntries)[number]>()
    latestEntries.forEach((entry) => {
      if (!latestMap.has(entry.templateId)) latestMap.set(entry.templateId, entry)
    })

    res.send(
      templates.map((template) => ({
        ...template,
        entryCount: countMap.get(template.id) ?? 0,
        lastEntryAt: latestMap.get(template.id)?.createdAt ?? null,
        lastEntryPreview: latestMap.get(template.id)?.body ?? null,
        lastAuthorName: latestMap.get(template.id)?.authorName ?? null,
      }))
    )
  } catch (err) {
    next(err)
  }
}

export const createLogbookTemplate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const userId = Number(req.user?.sub)

  try {
    const role = await getUserOrgRole(userId, orgId)
    if (role !== 'owner' && role !== 'editor') {
      return res.status(403).send({ error: 'only owners and editors can create logs' })
    }

    const [created] = await db
      .insert(logbookTemplate)
      .values({
        orgId,
        title: req.body.title,
        description: req.body.description,
      })
      .returning()

    res.status(201).send(created)
  } catch (err) {
    next(err)
  }
}

export const getEntryByDate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const userId = Number(req.user?.sub)
  const templateId = Number(req.params.id)
  const dateParam = req.params.date

  try {
    const role = await getUserOrgRole(userId, orgId)
    if (!role) return res.status(403).send({ error: 'organization access required' })

    const [template] = await db
      .select({
        id: logbookTemplate.id,
        title: logbookTemplate.title,
        description: logbookTemplate.description,
        isSystem: logbookTemplate.isSystem,
      })
      .from(logbookTemplate)
      .where(and(eq(logbookTemplate.id, templateId), eq(logbookTemplate.orgId, orgId)))
      .limit(1)

    if (!template) return res.status(404).send({ error: 'log not found' })

    const [entry] = await db
      .select({
        id: logbookEntry.id,
        body: logbookEntry.body,
        entryDate: logbookEntry.entryDate,
        createdAt: logbookEntry.createdAt,
        updatedAt: logbookEntry.updatedAt,
        authorName: user.name,
      })
      .from(logbookEntry)
      .innerJoin(user, eq(logbookEntry.authorId, user.id))
      .where(
        and(eq(logbookEntry.templateId, templateId), eq(logbookEntry.entryDate, dateParam))
      )
      .limit(1)

    const today = new Date().toISOString().slice(0, 10)

    res.send({
      template,
      entry: entry
        ? { ...entry, isEditable: entry.entryDate === today }
        : null,
    })
  } catch (err) {
    next(err)
  }
}

export const upsertTodayEntry = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const userId = Number(req.user?.sub)
  const templateId = Number(req.params.id)

  try {
    const role = await getUserOrgRole(userId, orgId)
    if (role !== 'owner' && role !== 'editor') {
      return res.status(403).send({ error: 'only owners and editors can add log entries' })
    }

    const [template] = await db
      .select({ id: logbookTemplate.id })
      .from(logbookTemplate)
      .where(and(eq(logbookTemplate.id, templateId), eq(logbookTemplate.orgId, orgId)))
      .limit(1)

    if (!template) return res.status(404).send({ error: 'log not found' })

    const [existing] = await db
      .select({
        id: logbookEntry.id,
        body: logbookEntry.body,
      })
      .from(logbookEntry)
      .where(
        and(
          eq(logbookEntry.templateId, templateId),
          eq(logbookEntry.entryDate, sql`CURRENT_DATE`)
        )
      )
      .limit(1)

    if (existing) {
      // Save previous body to edit history
      await db.insert(logbookEntryEdit).values({
        entryId: existing.id,
        editorId: userId,
        previousBody: existing.body,
      })

      const [updated] = await db
        .update(logbookEntry)
        .set({ body: req.body.body, updatedAt: sql`now()` })
        .where(eq(logbookEntry.id, existing.id))
        .returning()

      return res.send(updated)
    }

    const [created] = await db
      .insert(logbookEntry)
      .values({
        templateId,
        authorId: userId,
        body: req.body.body,
      })
      .returning()

    res.status(201).send(created)
  } catch (err) {
    next(err)
  }
}

export const getEntryHistory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const userId = Number(req.user?.sub)
  const templateId = Number(req.params.id)
  const dateParam = req.params.date

  try {
    const role = await getUserOrgRole(userId, orgId)
    if (!role) return res.status(403).send({ error: 'organization access required' })

    // Verify template belongs to org
    const [template] = await db
      .select({ id: logbookTemplate.id })
      .from(logbookTemplate)
      .where(and(eq(logbookTemplate.id, templateId), eq(logbookTemplate.orgId, orgId)))
      .limit(1)

    if (!template) return res.status(404).send({ error: 'log not found' })

    const [entry] = await db
      .select({ id: logbookEntry.id })
      .from(logbookEntry)
      .where(
        and(eq(logbookEntry.templateId, templateId), eq(logbookEntry.entryDate, dateParam))
      )
      .limit(1)

    if (!entry) return res.send({ edits: [] })

    const edits = await db
      .select({
        id: logbookEntryEdit.id,
        previousBody: logbookEntryEdit.previousBody,
        editorName: user.name,
        createdAt: logbookEntryEdit.createdAt,
      })
      .from(logbookEntryEdit)
      .innerJoin(user, eq(logbookEntryEdit.editorId, user.id))
      .where(eq(logbookEntryEdit.entryId, entry.id))
      .orderBy(desc(logbookEntryEdit.createdAt))

    res.send({ edits })
  } catch (err) {
    next(err)
  }
}

export const getEntryDates = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const userId = Number(req.user?.sub)
  const templateId = Number(req.params.id)

  try {
    const role = await getUserOrgRole(userId, orgId)
    if (!role) return res.status(403).send({ error: 'organization access required' })

    const [template] = await db
      .select({ id: logbookTemplate.id })
      .from(logbookTemplate)
      .where(and(eq(logbookTemplate.id, templateId), eq(logbookTemplate.orgId, orgId)))
      .limit(1)

    if (!template) return res.status(404).send({ error: 'log not found' })

    const rows = await db
      .select({ entryDate: logbookEntry.entryDate })
      .from(logbookEntry)
      .where(eq(logbookEntry.templateId, templateId))
      .orderBy(desc(logbookEntry.entryDate))

    res.send({ dates: rows.map((r) => r.entryDate) })
  } catch (err) {
    next(err)
  }
}
