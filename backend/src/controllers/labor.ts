import { NextFunction, Response } from 'express'
import { and, asc, eq } from 'drizzle-orm'
import { AuthenticatedRequest } from '@/types/index.ts'
import { getUserOrgRole } from '@/utils/auditHelpers.ts'
import { laborShift, orgMember, section, team, user } from '@/db/schema.ts'
import db from '@/utils/db.ts'
import { AppError } from '@/utils/AppError.ts'

const ensureOrgAccess = async (userId: number, orgId: number) => {
  const role = await getUserOrgRole(userId, orgId)
  if (!role) {
    throw new AppError('organization access required', 403)
  }
  return role
}

const ensureOrgManager = async (userId: number, orgId: number) => {
  const role = await ensureOrgAccess(userId, orgId)
  if (role !== 'owner' && role !== 'editor') {
    throw new AppError('only owners and editors can manage labor plans', 403)
  }
}

const getShiftDate = (value?: string) => {
  if (value) return value
  return new Date().toISOString().slice(0, 10)
}

export const listLaborReferences = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const userId = Number(req.user?.sub)

  try {
    await ensureOrgAccess(userId, orgId)

    const areas = await db
      .select({
        id: section.id,
        name: section.name,
        teamId: section.teamId,
        teamName: team.name,
      })
      .from(section)
      .leftJoin(team, eq(team.id, section.teamId))
      .where(and(eq(section.orgId, orgId), eq(section.active, true)))
      .orderBy(section.name)

    const teams = await db
      .select({
        id: team.id,
        name: team.name,
        color: team.color,
        description: team.description,
      })
      .from(team)
      .where(and(eq(team.orgId, orgId), eq(team.active, true)))
      .orderBy(team.name)

    const members = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: orgMember.role,
      })
      .from(orgMember)
      .innerJoin(user, eq(user.id, orgMember.userId))
      .where(and(eq(orgMember.orgId, orgId), eq(user.active, true)))
      .orderBy(user.name)

    res.send({ areas, teams, members })
  } catch (error) {
    next(error)
  }
}

export const listLaborShifts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const userId = Number(req.user?.sub)
  const shiftDate = getShiftDate(
    typeof req.query.date === 'string' ? req.query.date : undefined
  )

  try {
    await ensureOrgAccess(userId, orgId)

    const shifts = await db
      .select({
        id: laborShift.id,
        title: laborShift.title,
        shiftDate: laborShift.shiftDate,
        startTime: laborShift.startTime,
        endTime: laborShift.endTime,
        areaId: laborShift.areaId,
        areaName: section.name,
        assignedTeamId: laborShift.assignedTeamId,
        assignedTeamName: team.name,
        teamColor: team.color,
        assignedUserId: laborShift.assignedUserId,
        assignedUserName: user.name,
        notes: laborShift.notes,
        createdAt: laborShift.createdAt,
      })
      .from(laborShift)
      .leftJoin(section, eq(section.id, laborShift.areaId))
      .leftJoin(team, eq(team.id, laborShift.assignedTeamId))
      .leftJoin(user, eq(user.id, laborShift.assignedUserId))
      .where(and(eq(laborShift.orgId, orgId), eq(laborShift.shiftDate, shiftDate)))
      .orderBy(asc(laborShift.startTime), asc(laborShift.title))

    res.send(shifts)
  } catch (error) {
    next(error)
  }
}

export const createLaborShift = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = Number(req.headers['x-org-id'])
  const userId = Number(req.user?.sub)
  const {
    title,
    shiftDate,
    startTime,
    endTime,
    areaId,
    assignedTeamId,
    assignedUserId,
    notes,
  } = req.body

  try {
    await ensureOrgManager(userId, orgId)

    if (areaId != null) {
      const [area] = await db
        .select({ id: section.id })
        .from(section)
        .where(and(eq(section.id, areaId), eq(section.orgId, orgId)))
        .limit(1)

      if (!area) throw new AppError('area not found', 404)
    }

    if (assignedTeamId != null) {
      const [selectedTeam] = await db
        .select({ id: team.id })
        .from(team)
        .where(and(eq(team.id, assignedTeamId), eq(team.orgId, orgId)))
        .limit(1)

      if (!selectedTeam) throw new AppError('team not found', 404)
    }

    if (assignedUserId != null) {
      const [member] = await db
        .select({ id: orgMember.userId })
        .from(orgMember)
        .where(and(eq(orgMember.orgId, orgId), eq(orgMember.userId, assignedUserId)))
        .limit(1)

      if (!member) throw new AppError('member not found', 404)
    }

    const [created] = await db
      .insert(laborShift)
      .values({
        orgId,
        title,
        shiftDate,
        startTime,
        endTime,
        areaId: areaId ?? null,
        assignedTeamId: assignedTeamId ?? null,
        assignedUserId: assignedUserId ?? null,
        notes: notes ?? null,
        createdBy: userId,
      })
      .returning()

    const [fullShift] = await db
      .select({
        id: laborShift.id,
        title: laborShift.title,
        shiftDate: laborShift.shiftDate,
        startTime: laborShift.startTime,
        endTime: laborShift.endTime,
        areaId: laborShift.areaId,
        areaName: section.name,
        assignedTeamId: laborShift.assignedTeamId,
        assignedTeamName: team.name,
        teamColor: team.color,
        assignedUserId: laborShift.assignedUserId,
        assignedUserName: user.name,
        notes: laborShift.notes,
        createdAt: laborShift.createdAt,
      })
      .from(laborShift)
      .leftJoin(section, eq(section.id, laborShift.areaId))
      .leftJoin(team, eq(team.id, laborShift.assignedTeamId))
      .leftJoin(user, eq(user.id, laborShift.assignedUserId))
      .where(eq(laborShift.id, created.id))
      .limit(1)

    res.status(201).send(fullShift)
  } catch (error) {
    next(error)
  }
}
