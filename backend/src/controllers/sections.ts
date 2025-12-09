import { Request, Response } from 'express'
import { section, sectionMember, user } from '@/db/schema.ts'
import db from '@/utils/db.ts'
import { and, eq, notExists } from 'drizzle-orm'
import { getUserSectionRole } from '@/utils/controllerHelpers.ts'
import { AuthenticatedRequest } from '@/types/index.ts'

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
    .where(and(eq(sectionMember.userId, userId), eq(section.active, true)))
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
  const sectionId = Number(req.params.id)

  const loggedUser = Number(req.user?.sub)

  const requesterRole = await getUserSectionRole(loggedUser, sectionId)
  if (requesterRole !== 'owner') {
    return res
      .status(403)
      .send({ error: 'only owners can see the section info' })
  }

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
  const { sectionId, userId } = req.body
  const loggedUser = Number(req.user?.sub)

  const requesterRole = await getUserSectionRole(loggedUser, sectionId)
  if (requesterRole !== 'owner') {
    return res.status(403).send({ error: 'only owners can add members' })
  }

  await db.insert(sectionMember).values({ sectionId, userId, role: 'viewer' })
  res.send(201)
}

const updateMemberRole = async (req: AuthenticatedRequest, res: Response) => {
  const { sectionId, userId, role } = req.body
  const loggedUser = Number(req.user?.sub)

  const requesterRole = await getUserSectionRole(loggedUser, sectionId)
  if (requesterRole !== 'owner') {
    return res
      .status(403)
      .send({ error: 'only owners can update member roles' })
  }

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
  console.log(req.params)

  const requesterRole = await getUserSectionRole(
    Number(req.user?.sub),
    Number(sectionId)
  )

  console.log('section id: ', sectionId)
  console.log('user id: ', req.user?.sub)
  console.log('requester role: ', requesterRole)

  if (requesterRole !== 'owner') {
    return res
      .status(403)
      .send({ error: 'only owners can unsubscribe members.' })
  }

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
