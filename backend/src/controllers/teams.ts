import { NextFunction, Response } from 'express'
import { and, count, eq, notExists } from 'drizzle-orm'
import { orgMember, team, teamMember, user } from '@/db/schema.ts'
import type { AuthenticatedRequest } from '@/types/index.ts'
import db from '@/utils/db.ts'
import { AppError } from '@/utils/AppError.ts'
import { getUserOrgRole } from '@/utils/auditHelpers.ts'

const ensureOrgManager = async (userId: number, orgId: number) => {
  const role = await getUserOrgRole(userId, orgId)
  if (role !== 'owner' && role !== 'editor') {
    throw new AppError('only owners and editors can manage teams', 403)
  }
}

export const listTeams = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const userId = Number(req.user!.sub)

  try {
    const role = await getUserOrgRole(userId, orgId)
    if (!role) {
      throw new AppError('you do not have access to this organization', 403)
    }

    const teams = await db
      .select({
        id: team.id,
        name: team.name,
        description: team.description,
        active: team.active,
        memberCount: count(teamMember.userId),
      })
      .from(team)
      .leftJoin(teamMember, eq(teamMember.teamId, team.id))
      .where(eq(team.orgId, orgId))
      .groupBy(team.id)
      .orderBy(team.name)

    res.send(teams)
  } catch (error) {
    next(error)
  }
}

export const createTeam = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const userId = Number(req.user!.sub)
  const { name, description } = req.body

  try {
    await ensureOrgManager(userId, orgId)

    const [createdTeam] = await db
      .insert(team)
      .values({
        orgId,
        name,
        description: description ?? null,
      })
      .returning()

    res.status(201).send(createdTeam)
  } catch (error) {
    next(error)
  }
}

export const getTeam = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const userId = Number(req.user!.sub)
  const teamId = Number(req.params.id)

  try {
    const role = await getUserOrgRole(userId, orgId)
    if (!role) {
      throw new AppError('you do not have access to this organization', 403)
    }

    const [selectedTeam] = await db
      .select()
      .from(team)
      .where(and(eq(team.id, teamId), eq(team.orgId, orgId)))
      .limit(1)

    if (!selectedTeam) {
      throw new AppError('team not found', 404)
    }

    const members = await db
      .select({
        userId: user.id,
        name: user.name,
        email: user.email,
        role: teamMember.role,
        joinedAt: teamMember.joinedAt,
      })
      .from(teamMember)
      .innerJoin(user, eq(user.id, teamMember.userId))
      .where(eq(teamMember.teamId, teamId))

    const nonMembers = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
      })
      .from(user)
      .innerJoin(
        orgMember,
        and(eq(orgMember.userId, user.id), eq(orgMember.orgId, orgId))
      )
      .where(
        and(
          eq(user.active, true),
          notExists(
            db
              .select()
              .from(teamMember)
              .where(
                and(eq(teamMember.userId, user.id), eq(teamMember.teamId, teamId))
              )
          )
        )
      )

    res.send({ team: selectedTeam, members, nonMembers })
  } catch (error) {
    next(error)
  }
}

export const updateTeam = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const userId = Number(req.user!.sub)
  const teamId = Number(req.params.id)

  try {
    await ensureOrgManager(userId, orgId)

    const [updatedTeam] = await db
      .update(team)
      .set({
        ...req.body,
        updatedAt: new Date(),
      })
      .where(and(eq(team.id, teamId), eq(team.orgId, orgId)))
      .returning()

    if (!updatedTeam) {
      throw new AppError('team not found', 404)
    }

    res.send(updatedTeam)
  } catch (error) {
    next(error)
  }
}

export const deleteTeam = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const userId = Number(req.user!.sub)
  const teamId = Number(req.params.id)

  try {
    await ensureOrgManager(userId, orgId)

    const [archivedTeam] = await db
      .update(team)
      .set({ active: false, updatedAt: new Date() })
      .where(and(eq(team.id, teamId), eq(team.orgId, orgId)))
      .returning()

    if (!archivedTeam) {
      throw new AppError('team not found', 404)
    }

    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}

export const addTeamMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const callerId = Number(req.user!.sub)
  const teamId = Number(req.params.id)
  const { userId, role } = req.body

  try {
    await ensureOrgManager(callerId, orgId)

    const [selectedTeam] = await db
      .select()
      .from(team)
      .where(and(eq(team.id, teamId), eq(team.orgId, orgId)))
      .limit(1)

    if (!selectedTeam) {
      throw new AppError('team not found', 404)
    }

    const [createdMember] = await db
      .insert(teamMember)
      .values({
        teamId,
        userId,
        role: role ?? 'member',
      })
      .returning()

    res.status(201).send(createdMember)
  } catch (error) {
    next(error)
  }
}

export const updateTeamMemberRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const callerId = Number(req.user!.sub)
  const teamId = Number(req.params.id)
  const { userId, role } = req.body

  try {
    await ensureOrgManager(callerId, orgId)

    const [selectedTeam] = await db
      .select({ id: team.id })
      .from(team)
      .where(and(eq(team.id, teamId), eq(team.orgId, orgId)))
      .limit(1)

    if (!selectedTeam) {
      throw new AppError('team not found', 404)
    }

    const [updatedMember] = await db
      .update(teamMember)
      .set({ role })
      .where(and(eq(teamMember.teamId, teamId), eq(teamMember.userId, userId)))
      .returning()

    if (!updatedMember) {
      throw new AppError('team member not found', 404)
    }

    res.send(updatedMember)
  } catch (error) {
    next(error)
  }
}

export const removeTeamMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const callerId = Number(req.user!.sub)
  const teamId = Number(req.params.id)
  const userId = Number(req.params.userId)

  try {
    await ensureOrgManager(callerId, orgId)

    const [selectedTeam] = await db
      .select({ id: team.id })
      .from(team)
      .where(and(eq(team.id, teamId), eq(team.orgId, orgId)))
      .limit(1)

    if (!selectedTeam) {
      throw new AppError('team not found', 404)
    }

    await db
      .delete(teamMember)
      .where(and(eq(teamMember.teamId, teamId), eq(teamMember.userId, userId)))

    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}
