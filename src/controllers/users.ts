import db from '../utils/db.ts'
import { Request, Response, NextFunction } from 'express'
import { usersTable } from '../db/schema.ts'

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
  const body = req.body
  try {
    const user = await db.insert(usersTable).values(body).returning()
    res.send(user[0])
  } catch (error: unknown) {
    next(error)
  }
}

const updateUser = async (_req: Request, _res: Response) => {}

const deleteUser = async (_req: Request, _res: Response) => {}

export { listUsers, createUser, updateUser, deleteUser }
