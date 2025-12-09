import { section, sectionMember, user } from '@/db/schema.ts'
import db from './db.ts'
import { and, eq, notExists } from 'drizzle-orm'

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

export const getSectionNonMembers = async (sectionId: number) => {
  const nonMembers = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
    })
    .from(user)
    .where(
      and(
        eq(user.active, true),
        notExists(
          db
            .select()
            .from(sectionMember)
            .where(
              and(
                eq(sectionMember.userId, user.id),
                eq(sectionMember.sectionId, sectionId)
              )
            )
        )
      )
    )
  return nonMembers
}

export const getSectionMembers = async (sectionId: number) => {
  const members = await db
    .select({
      name: user.name,
      sectionName: section.name,
      userId: user.id,
      role: sectionMember.role,
      sectionId: sectionMember.sectionId,
    })
    .from(sectionMember)
    .where(
      and(eq(sectionMember.sectionId, sectionId), eq(section.active, true))
    )
    .leftJoin(user, eq(sectionMember.userId, user.id))
    .leftJoin(section, eq(section.id, sectionId))

  return members
}
