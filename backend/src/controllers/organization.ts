import { organization, orgMember, user } from '@/db/schema.ts'
import { AuthenticatedRequest } from '@/types/index.ts'
import als from '@/utils/context.ts'
import db from '@/utils/db.ts'
import { AppError } from '@/utils/AppError.ts'
import { getUserOrgRole } from '@/utils/auditHelpers.ts'
import { and, eq, count } from 'drizzle-orm'
import { NextFunction, Response } from 'express'

export const findOrganization = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const store = als.getStore()

    if (!store?.orgId) {
      return res.status(400).send({ error: 'organization context required' })
    }

    const [membership] = await db
      .select({
        id: organization.id,
        name: organization.name,
        role: orgMember.role,
        joinedAt: orgMember.joinedAt,
      })
      .from(orgMember)
      .innerJoin(organization, eq(orgMember.orgId, organization.id))
      .where(
        and(
          eq(orgMember.userId, Number(req.user?.sub)),
          eq(orgMember.orgId, store.orgId)
        )
      )

    if (!membership) {
      return res
        .status(403)
        .send({ error: 'you do not have access to this resource' })
    }

    return res.send({ data: membership })
  } catch (e) {
    next(e)
  }
}

export const createOrganization = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = Number(req.user!.sub)
  const { name } = req.body

  try {
    const result = await db.transaction(async (tx) => {
      const [org] = await tx
        .insert(organization)
        .values({ name })
        .returning()

      await tx.insert(orgMember).values({
        orgId: org.id,
        userId,
        role: 'owner',
      })

      return org
    })

    res.status(201).send(result)
  } catch (err) {
    next(err)
  }
}

export const updateOrganization = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = Number(req.user!.sub)
  const orgId = Number(req.params.id)
  const { name } = req.body

  try {
    const role = await getUserOrgRole(userId, orgId)
    if (role !== 'owner') {
      throw new AppError('only owners can update organizations', 403)
    }

    const [updated] = await db
      .update(organization)
      .set({ name, updatedAt: new Date() })
      .where(eq(organization.id, orgId))
      .returning()

    if (!updated) throw new AppError('organization not found', 404)
    res.send(updated)
  } catch (err) {
    next(err)
  }
}

export const deleteOrganization = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = Number(req.user!.sub)
  const orgId = Number(req.params.id)

  try {
    const role = await getUserOrgRole(userId, orgId)
    if (role !== 'owner') {
      throw new AppError('only owners can delete organizations', 403)
    }

    const [archived] = await db
      .update(organization)
      .set({ active: false, deactivatedAt: new Date(), updatedAt: new Date() })
      .where(eq(organization.id, orgId))
      .returning()

    if (!archived) throw new AppError('organization not found', 404)
    res.sendStatus(204)
  } catch (err) {
    next(err)
  }
}

export const getOrganization = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = Number(req.user!.sub)
  const orgId = Number(req.params.id)

  try {
    const role = await getUserOrgRole(userId, orgId)
    if (!role) {
      throw new AppError('you do not have access to this organization', 403)
    }

    const [org] = await db
      .select()
      .from(organization)
      .where(eq(organization.id, orgId))
      .limit(1)

    if (!org) throw new AppError('organization not found', 404)

    const members = await db
      .select({
        userId: orgMember.userId,
        role: orgMember.role,
        joinedAt: orgMember.joinedAt,
        name: user.name,
        email: user.email,
      })
      .from(orgMember)
      .innerJoin(user, eq(orgMember.userId, user.id))
      .where(eq(orgMember.orgId, orgId))

    res.send({ ...org, members })
  } catch (err) {
    next(err)
  }
}

export const addMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = Number(req.user!.sub)
  const orgId = Number(req.params.id)
  const { userId: newUserId, role } = req.body

  try {
    const callerRole = await getUserOrgRole(userId, orgId)
    if (callerRole !== 'owner' && callerRole !== 'editor') {
      throw new AppError('only owners and editors can add members', 403)
    }

    await db.insert(orgMember).values({
      orgId,
      userId: newUserId,
      role: role || 'viewer',
    })

    res.sendStatus(201)
  } catch (err) {
    next(err)
  }
}

export const updateMemberRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const callerUserId = Number(req.user!.sub)
  const orgId = Number(req.params.id)
  const { userId: targetUserId, role: newRole } = req.body

  try {
    const callerRole = await getUserOrgRole(callerUserId, orgId)
    if (callerRole !== 'owner') {
      throw new AppError('only owners can update member roles', 403)
    }

    // Prevent sole-owner downgrade
    if (newRole !== 'owner') {
      const [currentMember] = await db
        .select({ role: orgMember.role })
        .from(orgMember)
        .where(
          and(eq(orgMember.orgId, orgId), eq(orgMember.userId, targetUserId))
        )
        .limit(1)

      if (currentMember?.role === 'owner') {
        const [ownerCount] = await db
          .select({ count: count() })
          .from(orgMember)
          .where(and(eq(orgMember.orgId, orgId), eq(orgMember.role, 'owner')))

        if (ownerCount.count <= 1) {
          throw new AppError(
            'cannot downgrade the sole owner of the organization',
            400
          )
        }
      }
    }

    const [updated] = await db
      .update(orgMember)
      .set({ role: newRole })
      .where(
        and(eq(orgMember.orgId, orgId), eq(orgMember.userId, targetUserId))
      )
      .returning()

    if (!updated) throw new AppError('member not found', 404)
    res.send(updated)
  } catch (err) {
    next(err)
  }
}

export const removeMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const callerUserId = Number(req.user!.sub)
  const orgId = Number(req.params.id)
  const targetUserId = Number(req.params.userId)

  try {
    const callerRole = await getUserOrgRole(callerUserId, orgId)
    if (callerRole !== 'owner') {
      throw new AppError('only owners can remove members', 403)
    }

    if (callerUserId === targetUserId) {
      throw new AppError('owners cannot remove themselves', 400)
    }

    await db
      .delete(orgMember)
      .where(
        and(eq(orgMember.orgId, orgId), eq(orgMember.userId, targetUserId))
      )

    res.sendStatus(204)
  } catch (err) {
    next(err)
  }
}
