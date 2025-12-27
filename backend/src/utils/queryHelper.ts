import { orgMember, section, sectionMember } from '@/db/schema.ts'
import db from './db.ts'
import { and, eq } from 'drizzle-orm'

export const getScopedSectionQuery = (userId: number, orgId: number) => {
  return db
    .select({
      id: section.id,
      name: section.name,
      createdAt: section.createdAt,
      role: sectionMember.role,
      active: section.active,
    })
    .from(sectionMember)
    .innerJoin(section, eq(section.id, sectionMember.sectionId))
    .innerJoin(
      orgMember,
      and(eq(orgMember.userId, userId), eq(orgMember.orgId, section.orgId))
    )
}
