import { NextFunction, Response } from 'express'
import db from '@/utils/db.ts'
import { auditFinding } from '@/db/schema.ts'
import { eq } from 'drizzle-orm'
import { AuthenticatedRequest } from '@/types/index.ts'

const assessFinding = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const findingId = Number(req.params.findingId)
  const { score, passed, severity, notes, flagged } = req.body

  try {
    const [updated] = await db
      .update(auditFinding)
      .set({ score, passed, severity, notes, flagged })
      .where(eq(auditFinding.id, findingId))
      .returning()

    if (!updated) return res.sendStatus(404)
    res.send(updated)
  } catch (err) {
    next(err)
  }
}

const batchAssessFindings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const findings: Array<{
    id: number
    score?: number
    passed?: boolean
    severity?: string
    notes?: string
    flagged?: boolean
  }> = req.body.findings

  try {
    const results = await db.transaction(async (tx) => {
      const updated = []
      for (const f of findings) {
        const [result] = await tx
          .update(auditFinding)
          .set({
            score: f.score,
            passed: f.passed,
            severity: f.severity as
              | 'low'
              | 'medium'
              | 'high'
              | 'critical'
              | undefined,
            notes: f.notes,
            flagged: f.flagged,
          })
          .where(eq(auditFinding.id, f.id))
          .returning()
        if (result) updated.push(result)
      }
      return updated
    })

    res.send(results)
  } catch (err) {
    next(err)
  }
}

export { assessFinding, batchAssessFindings }
