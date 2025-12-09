import db from '../utils/db.ts'
import { Request, Response, NextFunction } from 'express'
import { user } from '../db/schema.ts'
import { eq } from 'drizzle-orm'
import * as bcrypt from 'bcrypt'
import { AuthenticatedRequest } from './tasks.ts'

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
  try {
    const user = req.user
    res.send(user)
  } catch (err) {
    next(err)
  }
}

export { listUsers, createUser, updateUser, deleteUser, me }
