import { usersTable } from '../db/schema.ts'
import db from '../utils/db.ts'
import { NextFunction, Request, Response } from 'express'
import { eq } from 'drizzle-orm'
import * as bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../utils/config.ts'

const userLogin = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body ?? {}

  if (!(email && password)) {
    return res.status(400).send({ error: 'email or password not present' })
  }

  const users = await db
    .select({ id: usersTable.id, passwordHash: usersTable.passwordHash })
    .from(usersTable)
    .where(eq(usersTable.email, email))
  const user = users[0]

  const { passwordHash, id } = user

  const passwordCorrect = await bcrypt.compare(password, passwordHash)

  if (!passwordCorrect) return res.status(401).send({ error: 'login failed' })

  const payload = { email, sub: id }

  const token = jwt.sign(payload, JWT_SECRET)
  res.send({ token, user: { id, email } })
}
const userLogout = (req: Request, res: Response, next: NextFunction) => {
  res.send('logout')
}

export { userLogin, userLogout }
