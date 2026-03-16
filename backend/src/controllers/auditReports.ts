import { NextFunction, Response } from 'express'
import db from '@/utils/db.ts'
import {
  auditRun,
  auditFinding,
  auditAction,
  task,
  taskCompletion,
  auditCheckpoint,
  auditTemplate,
} from '@/db/schema.ts'
import { and, eq, gte, lte, sql, desc, count, avg, asc } from 'drizzle-orm'
import { AuthenticatedRequest } from '@/types/index.ts'

interface ZoneBreakdown {
  score: number
  previousScore: number
  topIssues: Array<{
    id: number
    label: string
    count: number
  }>
}

interface PartnerSummaryReport {
  period: {
    start: string
    end: string
  }
  summary: {
    totalAudits: number
    averageScore: number
    trending: 'up' | 'down' | 'stable'
    criticalFindings: number
    openActions: number
  }
  zoneBreakdown: Record<string, ZoneBreakdown>
  actionItems: {
    total: number
    byStatus: {
      proposed: number
      approved: number
      promoted: number
      dismissed: number
    }
    byPriority: {
      critical: number
      high: number
      medium: number
      low: number
    }
    highImpact: Array<{
      id: number
      title: string
      priority: string
      status: string
      zone: string
      createdAt: string
    }>
  }
  completedTasks: {
    total: number
    onTime: number
    late: number
  }
}

// Helper to calculate trend
const calculateTrend = (current: number, previous: number): 'up' | 'down' | 'stable' => {
  const diff = current - previous
  if (diff > 2) return 'up'
  if (diff < -2) return 'down'
  return 'stable'
}

// Get partner summary report
const getPartnerSummary = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const { startDate, endDate, previousStartDate, previousEndDate } = req.query

  try {
    // Validate dates
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate as string) : new Date()
    
    // Default previous period is same duration before start
    const prevStart = previousStartDate 
      ? new Date(previousStartDate as string)
      : new Date(start.getTime() - (end.getTime() - start.getTime()))
    const prevEnd = previousEndDate 
      ? new Date(previousEndDate as string)
      : new Date(start.getTime() - 1)

    // Current period metrics
    const currentAudits = await db
      .select({
        total: count(),
        avgScore: avg(auditRun.overallScore),
        criticalFindings: sql<number>`COUNT(CASE WHEN ${auditFinding.severity} = 'critical' THEN 1 END)`,
      })
      .from(auditRun)
      .leftJoin(auditFinding, eq(auditFinding.runId, auditRun.id))
      .where(
        and(
          eq(auditRun.orgId, orgId),
          gte(auditRun.startedAt, start.toISOString()),
          lte(auditRun.startedAt, end.toISOString()),
          eq(auditRun.status, 'completed')
        )
      )

    // Previous period metrics for trend
    const previousAudits = await db
      .select({
        avgScore: avg(auditRun.overallScore),
      })
      .from(auditRun)
      .where(
        and(
          eq(auditRun.orgId, orgId),
          gte(auditRun.startedAt, prevStart.toISOString()),
          lte(auditRun.startedAt, prevEnd.toISOString()),
          eq(auditRun.status, 'completed')
        )
      )

    // Action items summary
    const actionSummary = await db
      .select({
        status: auditAction.status,
        priority: auditAction.priority,
        count: count(),
      })
      .from(auditAction)
      .where(eq(auditAction.orgId, orgId))
      .groupBy(auditAction.status, auditAction.priority)

    // High impact action items (top 5)
    const highImpactActions = await db
      .select({
        id: auditAction.id,
        title: auditAction.title,
        priority: auditAction.priority,
        status: auditAction.status,
        createdAt: auditAction.createdAt,
      })
      .from(auditAction)
      .where(
        and(
          eq(auditAction.orgId, orgId),
          sql`${auditAction.status} != 'dismissed'`
        )
      )
      .orderBy(
        sql`CASE ${auditAction.priority}
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END`,
        desc(auditAction.createdAt)
      )
      .limit(5)

    // Get zone breakdown from findings
    const zoneScores = await db
      .select({
        zone: auditFinding.zone,
        avgScore: sql<number>`AVG(CASE 
          WHEN ${auditFinding.passed} = true THEN 5
          WHEN ${auditFinding.passed} = false THEN 0
          ELSE ${auditFinding.score}
        END)`,
        count: count(),
      })
      .from(auditFinding)
      .innerJoin(auditRun, eq(auditRun.id, auditFinding.runId))
      .where(
        and(
          eq(auditRun.orgId, orgId),
          gte(auditRun.startedAt, start.toISOString()),
          lte(auditRun.startedAt, end.toISOString())
        )
      )
      .groupBy(auditFinding.zone)

    // Previous period zone scores for trend
    const prevZoneScores = await db
      .select({
        zone: auditFinding.zone,
        avgScore: sql<number>`AVG(CASE 
          WHEN ${auditFinding.passed} = true THEN 5
          WHEN ${auditFinding.passed} = false THEN 0
          ELSE ${auditFinding.score}
        END)`,
      })
      .from(auditFinding)
      .innerJoin(auditRun, eq(auditRun.id, auditFinding.runId))
      .where(
        and(
          eq(auditRun.orgId, orgId),
          gte(auditRun.startedAt, prevStart.toISOString()),
          lte(auditRun.startedAt, prevEnd.toISOString())
        )
      )
      .groupBy(auditFinding.zone)

    // Top issues per zone (most failed)
    const topIssuesPerZone = await db
      .select({
        zone: auditFinding.zone,
        label: auditFinding.label,
        failCount: sql<number>`COUNT(CASE WHEN ${auditFinding.passed} = false OR ${auditFinding.score} <= 2 THEN 1 END)`,
      })
      .from(auditFinding)
      .innerJoin(auditRun, eq(auditRun.id, auditFinding.runId))
      .where(
        and(
          eq(auditRun.orgId, orgId),
          gte(auditRun.startedAt, start.toISOString()),
          lte(auditRun.startedAt, end.toISOString())
        )
      )
      .groupBy(auditFinding.zone, auditFinding.label)
      .having(sql`failCount > 0`)
      .orderBy(desc(sql`failCount`))

    // Task completion stats
    const taskStats = await db
      .select({
        total: count(),
        onTime: sql<number>`COUNT(CASE WHEN ${taskCompletion.onTime} = true THEN 1 END)`,
        late: sql<number>`COUNT(CASE WHEN ${taskCompletion.onTime} = false THEN 1 END)`,
      })
      .from(taskCompletion)
      .innerJoin(task, eq(task.id, taskCompletion.taskId))
      .where(
        and(
          eq(task.orgId, orgId),
          gte(taskCompletion.completedAt, start.toISOString()),
          lte(taskCompletion.completedAt, end.toISOString())
        )
      )

    // Build zone breakdown
    const PRESTO_ZONES = ['People', 'Routines', 'Execution', 'Standards', 'Team Leadership', 'Operations & Upkeep']
    const zoneBreakdown: Record<string, ZoneBreakdown> = {}

    for (const zone of PRESTO_ZONES) {
      const currentZone = zoneScores.find(z => z.zone === zone)
      const prevZone = prevZoneScores.find(z => z.zone === zone)
      const issues = topIssuesPerZone
        .filter(i => i.zone === zone)
        .slice(0, 3)
        .map((i, idx) => ({
          id: idx,
          label: i.label,
          count: i.failCount,
        }))

      zoneBreakdown[zone] = {
        score: Math.round((currentZone?.avgScore || 0) * 10) / 10,
        previousScore: Math.round((prevZone?.avgScore || 0) * 10) / 10,
        topIssues: issues,
      }
    }

    // Aggregate action item counts
    const byStatus = { proposed: 0, approved: 0, promoted: 0, dismissed: 0 }
    const byPriority = { critical: 0, high: 0, medium: 0, low: 0 }
    
    for (const row of actionSummary) {
      const status = row.status as keyof typeof byStatus
      const priority = row.priority as keyof typeof byPriority
      if (status in byStatus) byStatus[status] = Number(row.count)
      if (priority in byPriority) byPriority[priority] = Number(row.count)
    }

    const currentAvgScore = Number(currentAudits[0]?.avgScore || 0)
    const previousAvgScore = Number(previousAudits[0]?.avgScore || 0)

    const report: PartnerSummaryReport = {
      period: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      },
      summary: {
        totalAudits: Number(currentAudits[0]?.total || 0),
        averageScore: Math.round(currentAvgScore * 10) / 10,
        trending: calculateTrend(currentAvgScore, previousAvgScore),
        criticalFindings: Number(currentAudits[0]?.criticalFindings || 0),
        openActions: byStatus.proposed + byStatus.approved,
      },
      zoneBreakdown,
      actionItems: {
        total: Object.values(byStatus).reduce((a, b) => a + b, 0),
        byStatus,
        byPriority,
        highImpact: highImpactActions.map(a => ({
          id: a.id,
          title: a.title,
          priority: a.priority,
          status: a.status,
          zone: 'General', // Could join to get actual zone
          createdAt: a.createdAt,
        })),
      },
      completedTasks: {
        total: Number(taskStats[0]?.total || 0),
        onTime: Number(taskStats[0]?.onTime || 0),
        late: Number(taskStats[0]?.late || 0),
      },
    }

    res.send(report)
  } catch (err) {
    next(err)
  }
}

// Export report as CSV
const exportPartnerCSV = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const { startDate, endDate } = req.query

  try {
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate as string) : new Date()

    // Get detailed action items with findings
    const actionItems = await db
      .select({
        id: auditAction.id,
        title: auditAction.title,
        description: auditAction.description,
        priority: auditAction.priority,
        status: auditAction.status,
        createdAt: auditAction.createdAt,
        zone: auditFinding.zone,
        findingLabel: auditFinding.label,
      })
      .from(auditAction)
      .leftJoin(auditFinding, eq(auditFinding.id, auditAction.findingId))
      .leftJoin(auditRun, eq(auditRun.id, auditFinding.runId))
      .where(
        and(
          eq(auditAction.orgId, orgId),
          gte(auditAction.createdAt, start.toISOString()),
          lte(auditAction.createdAt, end.toISOString())
        )
      )
      .orderBy(desc(auditAction.createdAt))

    // CSV header
    const csvHeader = ['Date', 'Zone', 'Issue', 'Description', 'Priority', 'Status', 'Action ID']
    
    // CSV rows
    const csvRows = actionItems.map(item => [
      item.createdAt.split('T')[0],
      item.zone || 'General',
      `"${(item.findingLabel || item.title).replace(/"/g, '""')}"`,
      `"${(item.description || '').replace(/"/g, '""')}"`,
      item.priority,
      item.status,
      item.id,
    ])

    const csvContent = [csvHeader, ...csvRows].map(row => row.join(',')).join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="partner-report-${start.toISOString().split('T')[0]}.csv"`)
    res.send(csvContent)
  } catch (err) {
    next(err)
  }
}

export {
  getPartnerSummary,
  exportPartnerCSV,
}