import { NextFunction, Response } from 'express'
import db from '@/utils/db.ts'
import {
  auditRun,
  auditCheckpoint,
  auditFinding,
  auditTemplate,
  auditAction,
  auditFollowUp,
} from '@/db/schema.ts'
import { and, eq, desc, asc, sql } from 'drizzle-orm'
import { AuthenticatedRequest } from '@/types/index.ts'
import { calculateOverallScore } from '@/utils/auditHelpers.ts'

const listRuns = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const { status, from, to } = req.query

  try {
    const filters = [eq(auditRun.orgId, orgId)]

    if (status && typeof status === 'string') {
      filters.push(
        eq(
          auditRun.status,
          status as 'in_progress' | 'completed' | 'cancelled'
        )
      )
    }
    if (from && typeof from === 'string') {
      filters.push(sql`${auditRun.startedAt} >= ${from}`)
    }
    if (to && typeof to === 'string') {
      filters.push(sql`${auditRun.startedAt} <= ${to}`)
    }

    const runs = await db
      .select({
        id: auditRun.id,
        templateName: auditTemplate.name,
        status: auditRun.status,
        overallScore: auditRun.overallScore,
        totalCheckpoints: auditRun.totalCheckpoints,
        startedAt: auditRun.startedAt,
        completedAt: auditRun.completedAt,
        conductedBy: auditRun.conductedBy,
      })
      .from(auditRun)
      .innerJoin(auditTemplate, eq(auditRun.templateId, auditTemplate.id))
      .where(and(...filters))
      .orderBy(desc(auditRun.startedAt))

    res.send(runs)
  } catch (err) {
    next(err)
  }
}

const getRun = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const runId = Number(req.params.id)

  try {
    const [run] = await db
      .select()
      .from(auditRun)
      .where(eq(auditRun.id, runId))
      .limit(1)

    if (!run) return res.sendStatus(404)

    const findings = await db
      .select({
        id: auditFinding.id,
        checkpointId: auditFinding.checkpointId,
        zone: auditCheckpoint.zone,
        label: auditCheckpoint.label,
        scoringType: auditCheckpoint.scoringType,
        score: auditFinding.score,
        passed: auditFinding.passed,
        severity: auditFinding.severity,
        notes: auditFinding.notes,
        flagged: auditFinding.flagged,
      })
      .from(auditFinding)
      .innerJoin(
        auditCheckpoint,
        eq(auditFinding.checkpointId, auditCheckpoint.id)
      )
      .where(eq(auditFinding.runId, runId))
      .orderBy(asc(auditCheckpoint.zone), asc(auditCheckpoint.sortOrder))

    const actions = await db
      .select()
      .from(auditAction)
      .where(eq(auditAction.runId, runId))

    const followUps = await db
      .select()
      .from(auditFollowUp)
      .where(eq(auditFollowUp.runId, runId))
      .orderBy(asc(auditFollowUp.scheduledDate))

    res.send({ ...run, findings, actions, followUps })
  } catch (err) {
    next(err)
  }
}

const startRun = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = Number(req.user!.sub)
  const orgId = Number(req.headers['x-org-id'])
  const { templateId } = req.body

  try {
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

    if (checkpoints.length === 0) {
      return res
        .status(400)
        .send({ error: 'template has no active checkpoints' })
    }

    const result = await db.transaction(async (tx) => {
      const [run] = await tx
        .insert(auditRun)
        .values({
          templateId,
          orgId,
          conductedBy: userId,
          totalCheckpoints: checkpoints.length,
        })
        .returning()

      const findingValues = checkpoints.map((cp) => ({
        runId: run.id,
        checkpointId: cp.id,
      }))

      await tx.insert(auditFinding).values(findingValues)

      return run
    })

    // Return the run with checkpoints grouped by zone for the UI
    const zones: Record<
      string,
      Array<{ checkpoint: (typeof checkpoints)[0]; findingId?: number }>
    > = {}
    const createdFindings = await db
      .select()
      .from(auditFinding)
      .where(eq(auditFinding.runId, result.id))

    for (const cp of checkpoints) {
      if (!zones[cp.zone]) zones[cp.zone] = []
      const finding = createdFindings.find((f) => f.checkpointId === cp.id)
      zones[cp.zone].push({ checkpoint: cp, findingId: finding?.id })
    }

    res.status(201).send({ ...result, zones })
  } catch (err) {
    next(err)
  }
}

const completeRun = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const runId = Number(req.params.id)

  try {
    const [run] = await db
      .select()
      .from(auditRun)
      .where(eq(auditRun.id, runId))
      .limit(1)

    if (!run) return res.sendStatus(404)
    if (run.status !== 'in_progress') {
      return res.status(400).send({ error: 'run is not in progress' })
    }

    const findings = await db
      .select({
        score: auditFinding.score,
        passed: auditFinding.passed,
        scoringType: auditCheckpoint.scoringType,
      })
      .from(auditFinding)
      .innerJoin(
        auditCheckpoint,
        eq(auditFinding.checkpointId, auditCheckpoint.id)
      )
      .where(eq(auditFinding.runId, runId))

    const overallScore = calculateOverallScore(
      findings as Array<{
        score: number | null
        passed: boolean | null
        scoringType: 'score' | 'pass_fail'
      }>
    )

    const [completed] = await db
      .update(auditRun)
      .set({
        status: 'completed',
        overallScore,
        completedAt: new Date(),
        notes: req.body.notes,
      })
      .where(eq(auditRun.id, runId))
      .returning()

    res.send(completed)
  } catch (err) {
    next(err)
  }
}

const cancelRun = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const runId = Number(req.params.id)

  try {
    const [cancelled] = await db
      .update(auditRun)
      .set({ status: 'cancelled' })
      .where(and(eq(auditRun.id, runId), eq(auditRun.status, 'in_progress')))
      .returning()

    if (!cancelled) return res.sendStatus(404)
    res.send(cancelled)
  } catch (err) {
    next(err)
  }
}

const addAdHocFinding = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const runId = Number(req.params.runId)
  const { label, description, severity, notes } = req.body

  try {
    const [run] = await db
      .select()
      .from(auditRun)
      .where(eq(auditRun.id, runId))
      .limit(1)

    if (!run) return res.sendStatus(404)
    if (run.status !== 'in_progress') {
      return res.status(400).send({ error: 'run is not in progress' })
    }

    const result = await db.transaction(async (tx) => {
      // Create an ad-hoc checkpoint in the Operations & Upkeep zone
      const [checkpoint] = await tx
        .insert(auditCheckpoint)
        .values({
          templateId: run.templateId,
          zone: 'Operations & Upkeep',
          label,
          description,
          scoringType: 'pass_fail',
          sortOrder: 999,
        })
        .returning()

      // Create the finding linked to this checkpoint
      const [finding] = await tx
        .insert(auditFinding)
        .values({
          runId,
          checkpointId: checkpoint.id,
          passed: false,
          severity: severity || 'medium',
          notes,
          flagged: true,
        })
        .returning()

      // Update total checkpoints count
      await tx
        .update(auditRun)
        .set({ totalCheckpoints: (run.totalCheckpoints ?? 0) + 1 })
        .where(eq(auditRun.id, runId))

      return { checkpoint, finding }
    })

    res.status(201).send(result)
  } catch (err) {
    next(err)
  }
}

export { listRuns, getRun, startRun, completeRun, cancelRun, addAdHocFinding }
