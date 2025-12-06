import { Request, Response } from 'express'
import { section, sectionMember, user } from '@/db/schema.ts'
import db from '@/utils/db.ts'
import { AuthenticatedRequest } from './tasks.ts'
import { and, eq, notExists } from 'drizzle-orm'

const listSections = async (req: AuthenticatedRequest, res: Response) => {
  const userId = Number(req.user!.sub)

  const subscribed = await db
    .select({
      id: section.id,
      name: section.name,
      createdAt: section.createdAt,
      role: sectionMember.role,
    })
    .from(sectionMember)
    .where(eq(sectionMember.userId, userId))
    .leftJoin(section, eq(sectionMember.sectionId, section.id))

  res.status(200).send(subscribed)
}

const createSection = async (req: AuthenticatedRequest, res: Response) => {
  const { name } = req.body
  const ownerId = Number(req.user!.sub)
  const newSection = { name, ownerId }

  const [addedSection, addedSectionMember] = await db.transaction(
    async (tx) => {
      const [addedSection] = await tx
        .insert(section)
        .values(newSection)
        .returning()

      const [addedSectionMember] = await tx
        .insert(sectionMember)
        .values({ userId: ownerId, sectionId: addedSection.id, role: 'owner' })
        .returning()

      return [addedSection, addedSectionMember] as const
    }
  )

  res.status(201).send({ addedSection, addedSectionMember })
}
const updateSection = (_req: Request, res: Response) => {
  res.status(501).send('TODO')
}
const deleteSection = (_req: Request, res: Response) => {
  res.status(501).send('TODO')
}

const getSectionInfo = async (req: AuthenticatedRequest, res: Response) => {
  // const userId = req.user!.sub
  const sectionId = Number(req.params.id)

  const members = await db
    .select({
      name: user.name,
      sectionName: section.name,
      userId: user.id,
      role: sectionMember.role,
    })
    .from(sectionMember)
    .where(eq(sectionMember.sectionId, sectionId))
    .leftJoin(user, eq(sectionMember.userId, user.id))
    .leftJoin(section, eq(section.id, sectionId))

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

  res.send({ members, nonMembers })
}

const addMember = async (req: AuthenticatedRequest, res: Response) => {
  const { sectionId, userId, role } = req.body
  await db.insert(sectionMember).values({ sectionId, userId, role })
  res.send(201)
}

const updateMemberRole = async (req: AuthenticatedRequest, res: Response) => {
  const { sectionId, userId, role } = req.body
  const updatedMember = await db
    .update(sectionMember)
    .set({ role })
    .where(
      and(
        eq(sectionMember.sectionId, sectionId),
        eq(sectionMember.userId, userId)
      )
    )
    .returning()
  res.send(updatedMember)
}

const unsubscribeMember = async (req: AuthenticatedRequest, res: Response) => {
  const { id: sectionId, userId } = req.params
  await db
    .delete(sectionMember)
    .where(
      and(
        eq(sectionMember.sectionId, Number(sectionId)),
        eq(sectionMember.userId, Number(userId))
      )
    )
  res.send(204)
}

export {
  listSections,
  createSection,
  updateSection,
  deleteSection,
  getSectionInfo,
  addMember,
  updateMemberRole,
  unsubscribeMember,
}
