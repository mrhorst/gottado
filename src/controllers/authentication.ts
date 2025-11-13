import { usersTable } from '../db/schema.ts'
import db from '../utils/db.ts'
import { NextFunction, Request, Response } from 'express'
import { eq } from 'drizzle-orm'

const userLogin = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body ?? {}

  if (!(email || password)) {
    return res.status(400).send({ error: 'email or password not present' })
  }

  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))

  console.log(user[0])

  res.send('login')
}
const userLogout = (req: Request, res: Response, next: NextFunction) => {
  res.send('logout')
}

export { userLogin, userLogout }
