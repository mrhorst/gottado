import { orgMember } from '@/db/schema.ts'
import db from './db.ts'
import { and, eq } from 'drizzle-orm'

export const getUserOrgRole = async (userId: number, orgId: number) => {
  const result = await db
    .select({ role: orgMember.role })
    .from(orgMember)
    .where(and(eq(orgMember.userId, userId), eq(orgMember.orgId, orgId)))
    .limit(1)

  return result[0]?.role || null
}

export const calculateOverallScore = (
  findings: Array<{
    score: number | null
    passed: boolean | null
    scoringType: 'score' | 'pass_fail'
  }>
): number => {
  if (findings.length === 0) return 0

  let totalEarned = 0
  let totalPossible = 0

  for (const f of findings) {
    if (f.scoringType === 'pass_fail') {
      totalPossible += 1
      if (f.passed) totalEarned += 1
    } else {
      totalPossible += 5
      totalEarned += f.score ?? 0
    }
  }

  if (totalPossible === 0) return 0
  return Math.round((totalEarned / totalPossible) * 100)
}
