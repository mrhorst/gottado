import { NextFunction, Response } from 'express'
import { section, sectionMember, task, taskList, team } from '@/db/schema.ts'
import db from '@/utils/db.ts'
import { and, eq, sql } from 'drizzle-orm'
import {
  getSectionMembers,
  getSectionNonMembers,
  getUserSectionRole,
} from '@/utils/controllerHelpers.ts'
import { AuthenticatedRequest } from '@/types/index.ts'
import { getScopedSectionQuery } from '@/utils/queryHelper.ts'

const listSections = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = Number(req.user!.sub)
  const orgId = Number(req.headers['x-org-id'])
  // console.log(als.getStore())
  const securityFilters = [
    eq(sectionMember.userId, userId),
    eq(section.orgId, orgId),
  ]

  try {
    const scopedQuery = getScopedSectionQuery(userId)

    const active = await scopedQuery.where(
      and(...securityFilters, eq(section.active, true))
    )

    const inactive = await scopedQuery.where(
      and(...securityFilters, eq(section.active, false))
    )

    res.status(200).send({ active, inactive })
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
  const orgId = Number(req.headers['x-org-id']) // manually adding it here to fix bug

  const newSection = { name, ownerId, orgId }

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
const updateSection = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const loggedUser = Number(req.user?.sub)
  const sectionId = Number(req.params.id)
  try {
    const requesterRole = await getUserSectionRole(loggedUser, sectionId)

    if (requesterRole !== 'owner') {
      return res.status(403).send({ error: 'you are not the owner' })
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'teamId')) {
      const teamId = req.body.teamId as number | null

      if (teamId !== null) {
        const [sectionRecord] = await db
          .select({ orgId: section.orgId })
          .from(section)
          .where(eq(section.id, sectionId))
          .limit(1)

        const [selectedTeam] = await db
          .select({ id: team.id })
          .from(team)
          .where(and(eq(team.id, teamId), eq(team.orgId, sectionRecord.orgId)))
          .limit(1)

        if (!selectedTeam) {
          return res.status(400).send({ error: 'team does not belong to this organization' })
        }
      }
    }

    await db.update(section).set(req.body).where(eq(section.id, sectionId))
    const [updatedSection] = await db
      .select({
        id: section.id,
        name: section.name,
        teamId: section.teamId,
        teamName: team.name,
      })
      .from(section)
      .leftJoin(team, eq(team.id, section.teamId))
      .where(eq(section.id, sectionId))
      .limit(1)
    res.status(200).send(updatedSection)
  } catch (e) {
    next(e)
  }
}

const deleteSection = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const loggedUserId = Number(req.user?.sub)
  const sectionId = Number(req.params.id)

  try {
    const requesterRole = await getUserSectionRole(loggedUserId, sectionId)
    if (requesterRole !== 'owner') {
      return res.status(403).send({ error: 'you are not the owner' })
    }

    // wrap in transaction to make sure it's only executed if all passes
    await db.transaction(async (tx) => {
      // remove membership associatons
      await tx
        .delete(sectionMember)
        .where(eq(sectionMember.sectionId, sectionId))
      // remove tasks that belong to this section
      await tx.delete(task).where(eq(task.sectionId, sectionId))
      // then, remove the section
      await tx.delete(section).where(eq(section.id, sectionId))
    })
    res.sendStatus(200)
  } catch (e) {
    next(e)
  }
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

const getTaskLists = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const sectionId = Number(req.params.id)
  const loggedUser = Number(req.user?.sub)

  try {
    const requesterRole = await getUserSectionRole(loggedUser, sectionId)
    if (!requesterRole) {
      return res.status(403).send({ error: 'you do not have access to this section' })
    }

    const lists = await db
      .select({
        id: taskList.id,
        name: taskList.name,
        description: taskList.description,
        sortOrder: taskList.sortOrder,
        totalTasks: sql<number>`count(${task.id})::int`,
        completedTasks:
          sql<number>`count(case when ${task.complete} = true then 1 end)::int`,
      })
      .from(taskList)
      .leftJoin(task, eq(task.listId, taskList.id))
      .where(eq(taskList.sectionId, sectionId))
      .groupBy(taskList.id)
      .orderBy(taskList.sortOrder, taskList.name)

    res.send(lists)
  } catch (error) {
    next(error)
  }
}

const createTaskList = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const sectionId = Number(req.params.id)
  const loggedUser = Number(req.user?.sub)
  const { name, description } = req.body

  try {
    const requesterRole = await getUserSectionRole(loggedUser, sectionId)
    if (requesterRole !== 'owner' && requesterRole !== 'editor') {
      return res
        .status(403)
        .send({ error: 'only owners and editors can create task lists' })
    }

    const [lastList] = await db
      .select({ sortOrder: taskList.sortOrder })
      .from(taskList)
      .where(eq(taskList.sectionId, sectionId))
      .orderBy(sql`${taskList.sortOrder} desc`)
      .limit(1)

    const [createdList] = await db
      .insert(taskList)
      .values({
        sectionId,
        name,
        description: description ?? null,
        sortOrder: (lastList?.sortOrder ?? -1) + 1,
      })
      .returning()

    res.status(201).send(createdList)
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
  getTaskLists,
  createTaskList,
  addMember,
  updateMemberRole,
  unsubscribeMember,
}
