import { user } from '../db/schema.ts'
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

  try {
    const users = await db
      .select({
        id: user.id,
        passwordHash: user.passwordHash,
        active: user.active,
        name: user.name,
      })
      .from(user)
      .where(eq(user.email, email))

    const userRecord = users[0]
    if (userRecord.active === false)
      return res.status(403).send('Inactive user')
    const { passwordHash, id, name } = userRecord
    const passwordCorrect = await bcrypt.compare(password, passwordHash)
    if (!passwordCorrect) return res.status(401).send({ error: 'login failed' })
    const payload = { name, email, sub: id }

    const token = jwt.sign(payload, JWT_SECRET)
    res.send({ token, user: { id, email, name } })
  } catch (err) {
    next(err)
  }
}

const userLogout = (req: Request, res: Response, next: NextFunction) => {
  res.send('logout')
}

export { userLogin, userLogout }
