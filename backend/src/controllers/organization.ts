import { organization, orgMember } from '@/db/schema.ts'
import { AuthenticatedRequest } from '@/types/index.ts'
import als from '@/utils/context.ts'
import db from '@/utils/db.ts'
import { and, eq } from 'drizzle-orm'
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
