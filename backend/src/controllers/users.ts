import db from '../utils/db.ts'
import { Request, Response, NextFunction } from 'express'
import { usersTable } from '../db/schema.ts'
import { eq } from 'drizzle-orm'
import * as bcrypt from 'bcrypt'
import { AuthenticatedRequest } from './tasks.ts'

// returns all users
const listUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const usersList = await db.select().from(usersTable)
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
    const user = await db.insert(usersTable).values(newUser).returning({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
    })
    res.send(user[0])
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
    await db.delete(usersTable).where(eq(usersTable.id, Number(req.user?.sub))) //req.user.id
    res.sendStatus(204)
  } catch (error: unknown) {
    next(error)
  }
}

export { listUsers, createUser, updateUser, deleteUser }
