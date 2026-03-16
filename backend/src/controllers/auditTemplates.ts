import { NextFunction, Response } from 'express'
import db from '@/utils/db.ts'
import {
  auditTemplate,
  auditCheckpoint,
} from '@/db/schema.ts'
import { and, eq, asc, ilike } from 'drizzle-orm'
import { AuthenticatedRequest } from '@/types/index.ts'
import { getUserOrgRole } from '@/utils/auditHelpers.ts'
import { AppError } from '@/utils/AppError.ts'
import { PRESTO_CHECKPOINTS } from '@/utils/prestoDefaults.ts'

const listTemplates = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const { search } = req.query

  try {
    const filters = [eq(auditTemplate.orgId, orgId), eq(auditTemplate.active, true)]
    if (search && typeof search === 'string') {
      filters.push(ilike(auditTemplate.name, `%${search}%`))
    }

    const templates = await db
      .select()
      .from(auditTemplate)
      .where(and(...filters))
      .orderBy(asc(auditTemplate.name))

    res.send(templates)
  } catch (err) {
    next(err)
  }
}

const getTemplate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const templateId = Number(req.params.id)

  try {
    const [template] = await db
      .select()
      .from(auditTemplate)
      .where(eq(auditTemplate.id, templateId))
      .limit(1)

    if (!template) return res.sendStatus(404)

    const checkpoints = await db
      .select()
      .from(auditCheckpoint)
      .where(
        and(
          eq(auditCheckpoint.templateId, templateId),
          eq(auditCheckpoint.active, true)
        )
      )
      .orderBy(asc(auditCheckpoint.zone), asc(auditCheckpoint.sortOrder))

    const zones: Record<string, typeof checkpoints> = {}
    for (const cp of checkpoints) {
      if (!zones[cp.zone]) zones[cp.zone] = []
      zones[cp.zone].push(cp)
    }

    res.send({ ...template, checkpoints: zones })
  } catch (err) {
    next(err)
  }
}

const createTemplate = async (
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
        .send({ error: 'only owners and editors can create templates' })
    }

    const { name, description } = req.body
    const [created] = await db
      .insert(auditTemplate)
      .values({ name, description, orgId, createdBy: userId })
      .returning()

    res.status(201).send(created)
  } catch (err) {
    next(err)
  }
}

const updateTemplate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = Number(req.user!.sub)
  const orgId = Number(req.headers['x-org-id'])
  const templateId = Number(req.params.id)

  try {
    const role = await getUserOrgRole(userId, orgId)
    if (role !== 'owner' && role !== 'editor') {
      return res
        .status(403)
        .send({ error: 'only owners and editors can update templates' })
    }

    const { name, description } = req.body
    const [updated] = await db
      .update(auditTemplate)
      .set({ name, description, updatedAt: new Date() })
      .where(eq(auditTemplate.id, templateId))
      .returning()

    if (!updated) return res.sendStatus(404)
    res.send(updated)
  } catch (err) {
    next(err)
  }
}

const archiveTemplate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = Number(req.user!.sub)
  const orgId = Number(req.headers['x-org-id'])
  const templateId = Number(req.params.id)

  try {
    const role = await getUserOrgRole(userId, orgId)
    if (role !== 'owner' && role !== 'editor') {
      return res
        .status(403)
        .send({ error: 'only owners and editors can archive templates' })
    }

    const [archived] = await db
      .update(auditTemplate)
      .set({ active: false, updatedAt: new Date() })
      .where(eq(auditTemplate.id, templateId))
      .returning()

    if (!archived) return res.sendStatus(404)
    res.sendStatus(204)
  } catch (err) {
    next(err)
  }
}

const seedPresto = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = Number(req.user!.sub)
  const orgId = Number(req.headers['x-org-id'])

  try {
    const role = await getUserOrgRole(userId, orgId)
    if (role !== 'owner' && role !== 'editor') {
      throw new AppError('only owners and editors can seed templates', 403)
    }

    // Idempotent: check if org already has a PRESTO template
    const [existing] = await db
      .select({ id: auditTemplate.id })
      .from(auditTemplate)
      .where(
        and(
          eq(auditTemplate.orgId, orgId),
          eq(auditTemplate.frameworkTag, 'presto'),
          eq(auditTemplate.active, true)
        )
      )
      .limit(1)

    if (existing) {
      return res.send({ id: existing.id, message: 'PRESTO template already exists' })
    }

    const result = await db.transaction(async (tx) => {
      const [template] = await tx
        .insert(auditTemplate)
        .values({
          name: 'PRESTO Operations Excellence',
          description:
            'Restaurant operations excellence audit covering People, Routines, Execution, Standards, Team Leadership, and Operations & Upkeep.',
          frameworkTag: 'presto',
          orgId,
          createdBy: userId,
        })
        .returning()

      if (PRESTO_CHECKPOINTS.length > 0) {
        await tx.insert(auditCheckpoint).values(
          PRESTO_CHECKPOINTS.map((cp) => ({
            templateId: template.id,
            zone: cp.zone,
            label: cp.label,
            scoringType: cp.scoringType,
            sortOrder: cp.sortOrder,
          }))
        )
      }

      return template
    })

    res.status(201).send(result)
  } catch (err) {
    next(err)
  }
}

export {
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  archiveTemplate,
  seedPresto,
}
