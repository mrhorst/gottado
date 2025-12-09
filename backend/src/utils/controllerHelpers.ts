import { sectionMember } from '@/db/schema.ts'
import db from './db.ts'
import { and, eq } from 'drizzle-orm'

export const getUserSectionRole = async (userId: number, sectionId: number) => {
  const result = await db
    .select({ role: sectionMember.role })
    .from(sectionMember)
    .where(
      and(
        eq(sectionMember.userId, userId),
        eq(sectionMember.sectionId, sectionId)
      )
    )
    .limit(1)

  return result[0]?.role || null
}
