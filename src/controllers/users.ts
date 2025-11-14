import db from '../utils/db.ts'
import { Request, Response, NextFunction } from 'express'
import { usersTable } from '../db/schema.ts'
import { eq } from 'drizzle-orm'
import * as bcrypt from 'bcrypt'

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
    const user = await db
      .insert(usersTable)
      .values(newUser)
      .returning({
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

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await db.delete(usersTable).where(eq(usersTable.id, 1)) //req.user.id
    res.status(204).send()
  } catch (error: unknown) {
    next(error)
  }
}

export { listUsers, createUser, updateUser, deleteUser }
