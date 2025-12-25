import db from '../utils/db.ts'
import { Request, Response, NextFunction } from 'express'
import { organization, orgMember, user } from '../db/schema.ts'
import { eq } from 'drizzle-orm'
import * as bcrypt from 'bcrypt'
import { AuthenticatedRequest } from '@/types/index.ts'

const usersWithoutPasswordHash = {
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  active: user.active,
  deactivatedAt: user.deactivatedAt,
}

// returns all active users
const listUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const usersList = await db
      .select(usersWithoutPasswordHash)
      .from(user)
      .where(eq(user.active, true))
    res.send(usersList)
  } catch (error: unknown) {
    next(error)
  }
}

// CREATE a user
const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name, password } = req.body
    const passwordHash = await bcrypt.hash(password, 10)
    const newUser = { email, name, passwordHash }
    const users = await db.insert(user).values(newUser).returning({
      id: user.id,
      name: user.name,
      email: user.email,
    })
    const userRecord = users[0]
    res.send(userRecord)
  } catch (error: unknown) {
    next(error)
  }
}

const updateUser = async (_req: Request, _res: Response) => {}

const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await db.delete(user).where(eq(user.id, Number(req.user?.sub))) //req.user.id
    res.sendStatus(204)
  } catch (error: unknown) {
    next(error)
  }
}

const me = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = Number(req.user?.sub)
  try {
    const data = await db
      .select({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        orgId: organization.id,
        orgName: organization.name,
        role: orgMember.role,
      })
      .from(user)
      .leftJoin(orgMember, eq(user.id, orgMember.userId))
      .leftJoin(organization, eq(orgMember.orgId, organization.id))
      .where(eq(user.id, userId))
    if (data.length === 0) {
      return res.status(404).send({ error: 'user not found' })
    }

    const result = {
      id: data[0].userId,
      name: data[0].userName,
      email: data[0].userEmail,
      organizations: data
        .filter((d) => d.orgId !== null)
        .map((d) => {
          return { id: d.orgId, name: d.orgName, role: d.role }
        }),
    }
    res.send(result)
  } catch (err) {
    next(err)
  }
}

export { listUsers, createUser, updateUser, deleteUser, me }
