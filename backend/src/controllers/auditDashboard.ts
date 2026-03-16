import { NextFunction, Response } from 'express'
import db from '@/utils/db.ts'
import {
  auditRun,
  auditAction,
  auditFollowUp,
  auditTemplate,
  auditFinding,
  auditCheckpoint,
} from '@/db/schema.ts'
import { and, eq, desc, asc, count, sql } from 'drizzle-orm'
import { AuthenticatedRequest } from '@/types/index.ts'

const calculateZoneScores = (
  findings: Array<{
    zone: string
    score: number | null
    passed: boolean | null
    scoringType: string
  }>
): Record<string, number> => {
  const zones: Record<string, { earned: number; possible: number }> = {}

  for (const f of findings) {
    if (!zones[f.zone]) zones[f.zone] = { earned: 0, possible: 0 }

    if (f.scoringType === 'pass_fail') {
      zones[f.zone].possible += 1
      if (f.passed) zones[f.zone].earned += 1
    } else {
      zones[f.zone].possible += 5
      zones[f.zone].earned += f.score ?? 0
    }
  }

  const result: Record<string, number> = {}
  for (const [zone, { earned, possible }] of Object.entries(zones)) {
    result[zone] = possible > 0 ? Math.round((earned / possible) * 100) : 0
  }
  return result
}

const getAuditDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])

  try {
    // Recent completed runs (last 5)
    const recentRuns = await db
      .select({
        id: auditRun.id,
        templateId: auditRun.templateId,
        templateName: auditTemplate.name,
        overallScore: auditRun.overallScore,
        completedAt: auditRun.completedAt,
        conductedBy: auditRun.conductedBy,
      })
      .from(auditRun)
      .innerJoin(auditTemplate, eq(auditRun.templateId, auditTemplate.id))
      .where(
        and(eq(auditRun.orgId, orgId), eq(auditRun.status, 'completed'))
      )
      .orderBy(desc(auditRun.completedAt))
      .limit(5)

    // Upcoming follow-ups
    const upcomingFollowUps = await db
      .select({
        id: auditFollowUp.id,
        runId: auditFollowUp.runId,
        scheduledDate: auditFollowUp.scheduledDate,
        status: auditFollowUp.status,
      })
      .from(auditFollowUp)
      .innerJoin(auditRun, eq(auditFollowUp.runId, auditRun.id))
      .where(
        and(
          eq(auditRun.orgId, orgId),
          eq(auditFollowUp.status, 'scheduled')
        )
      )
      .orderBy(asc(auditFollowUp.scheduledDate))
      .limit(5)

    // Pending actions count
    const [pendingActions] = await db
      .select({ count: count() })
      .from(auditAction)
      .innerJoin(auditRun, eq(auditAction.runId, auditRun.id))
      .where(
        and(
          eq(auditRun.orgId, orgId),
          eq(auditAction.status, 'proposed')
        )
      )

    // Total completed runs count
    const [totalCompleted] = await db
      .select({ count: count() })
      .from(auditRun)
      .where(
        and(eq(auditRun.orgId, orgId), eq(auditRun.status, 'completed'))
      )

    // Average score of last N completed runs (default 5)
    const scoreLimit = Math.max(1, Number(req.query.scoreLimit) || 5)
    const [avgScore] = await db
      .select({
        avg: sql<number>`ROUND(AVG(sub.overall_score))`,
      })
      .from(
        sql`(
          SELECT ${auditRun.overallScore} as overall_score
          FROM ${auditRun}
          WHERE ${auditRun.orgId} = ${orgId}
            AND ${auditRun.status} = 'completed'
            AND ${auditRun.overallScore} IS NOT NULL
          ORDER BY ${auditRun.completedAt} DESC
          LIMIT ${scoreLimit}
        ) sub`
      )

    // Zone score breakdown for the most recent completed run
    let zoneScores: Record<string, number> | null = null
    let previousZoneScores: Record<string, number> | null = null

    if (recentRuns.length > 0) {
      const latestRun = recentRuns[0]

      // Get findings with zone info for latest run
      const latestFindings = await db
        .select({
          zone: auditCheckpoint.zone,
          score: auditFinding.score,
          passed: auditFinding.passed,
          scoringType: auditCheckpoint.scoringType,
        })
        .from(auditFinding)
        .innerJoin(
          auditCheckpoint,
          eq(auditFinding.checkpointId, auditCheckpoint.id)
        )
        .where(eq(auditFinding.runId, latestRun.id))

      zoneScores = calculateZoneScores(latestFindings)

      // Find previous run of the same template for trend comparison
      const [previousRun] = await db
        .select({ id: auditRun.id })
        .from(auditRun)
        .where(
          and(
            eq(auditRun.orgId, orgId),
            eq(auditRun.templateId, latestRun.templateId),
            eq(auditRun.status, 'completed'),
            sql`${auditRun.id} != ${latestRun.id}`
          )
        )
        .orderBy(desc(auditRun.completedAt))
        .limit(1)

      if (previousRun) {
        const prevFindings = await db
          .select({
            zone: auditCheckpoint.zone,
            score: auditFinding.score,
            passed: auditFinding.passed,
            scoringType: auditCheckpoint.scoringType,
          })
          .from(auditFinding)
          .innerJoin(
            auditCheckpoint,
            eq(auditFinding.checkpointId, auditCheckpoint.id)
          )
          .where(eq(auditFinding.runId, previousRun.id))

        previousZoneScores = calculateZoneScores(prevFindings)
      }
    }

    res.send({
      recentRuns,
      upcomingFollowUps,
      pendingActionsCount: pendingActions?.count ?? 0,
      averageScore: avgScore?.avg ?? null,
      totalCompletedRuns: totalCompleted?.count ?? 0,
      scoreLimit,
      zoneScores,
      previousZoneScores,
    })
  } catch (err) {
    next(err)
  }
}

export { getAuditDashboard }
