import { orgMember, section, sectionMember, team } from '@/db/schema.ts'
import db from './db.ts'
import { and, eq } from 'drizzle-orm'

export const getScopedSectionQuery = (userId: number) => {
  return db
    .select({
      id: section.id,
      name: section.name,
      createdAt: section.createdAt,
      role: sectionMember.role,
      active: section.active,
      teamId: section.teamId,
      teamName: team.name,
    })
    .from(sectionMember)
    .innerJoin(section, eq(section.id, sectionMember.sectionId))
    .leftJoin(team, eq(team.id, section.teamId))
    .innerJoin(
      orgMember,
      and(eq(orgMember.userId, userId), eq(orgMember.orgId, section.orgId))
    )
}
