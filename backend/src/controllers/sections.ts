import { NextFunction, Request, Response } from 'express'
import { section, sectionMember } from '@/db/schema.ts'
import db from '@/utils/db.ts'
import { and, eq } from 'drizzle-orm'
import {
  getSectionMembers,
  getSectionNonMembers,
  getUserSectionRole,
} from '@/utils/controllerHelpers.ts'
import { AuthenticatedRequest } from '@/types/index.ts'

const listSections = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = Number(req.user!.sub)
  try {
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
  } catch (error) {
    next(error)
  }
}

const createSection = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { name } = req.body
  const ownerId = Number(req.user!.sub)
  const newSection = { name, ownerId }

  try {
    const [addedSection, addedSectionMember] = await db.transaction(
      async (tx) => {
        const [addedSection] = await tx
          .insert(section)
          .values(newSection)
          .returning()

        const [addedSectionMember] = await tx
          .insert(sectionMember)
          .values({
            userId: ownerId,
            sectionId: addedSection.id,
            role: 'owner',
          })
          .returning()

        return [addedSection, addedSectionMember] as const
      }
    )

    res.status(201).send({ addedSection, addedSectionMember })
  } catch (error) {
    next(error)
  }
}
const updateSection = (_req: Request, res: Response) => {
  res.status(501).send('TODO')
}
const deleteSection = (_req: Request, res: Response) => {
  res.status(501).send('TODO')
}

const getSectionInfo = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const sectionId = Number(req.params.id)

  const loggedUser = Number(req.user?.sub)

  try {
    const requesterRole = await getUserSectionRole(loggedUser, sectionId)
    if (requesterRole !== 'owner' && requesterRole !== 'editor') {
      return res
        .status(403)
        .send({ error: 'only owners can see the section info' })
    }

    const members = await getSectionMembers(sectionId)
    const nonMembers = await getSectionNonMembers(sectionId)

    res.send({ members, nonMembers })
  } catch (error) {
    next(error)
  }
}

const addMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { sectionId, userId } = req.body
  const loggedUser = Number(req.user?.sub)
  try {
    const requesterRole = await getUserSectionRole(loggedUser, sectionId)
    if (requesterRole !== 'owner') {
      return res.status(403).send({ error: 'only owners can add members' })
    }

    await db.insert(sectionMember).values({ sectionId, userId, role: 'viewer' })
    res.send(201)
  } catch (error) {
    next(error)
  }
}

const updateMemberRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { sectionId, userId, role } = req.body
  const loggedUser = Number(req.user?.sub)
  try {
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
  } catch (error) {
    next(error)
  }
}

const unsubscribeMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { id: sectionId, userId } = req.params
  try {
    const requesterRole = await getUserSectionRole(
      Number(req.user?.sub),
      Number(sectionId)
    )

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
  } catch (error) {
    next(error)
  }
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
