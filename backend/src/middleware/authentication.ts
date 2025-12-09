import { AuthenticatedRequest, UserPayload } from '@/types/index.ts'
import { JWT_SECRET } from '../utils/config.ts'
import { NextFunction, Response } from 'express'
import jwt from 'jsonwebtoken'

const tokenExtractor = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  const authorization = req.header('authorization')
  const token = authorization?.toLowerCase().startsWith('bearer ')
    ? authorization.substring(7)
    : undefined

  req.token = token

  next()
}

const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.token
  if (!token) {
    return res.status(401).send({ error: 'no token provided' })
  }
  try {
    const decodedUser = jwt.verify(token, JWT_SECRET) as UserPayload
    if (!decodedUser)
      return res
        .status(400)
        .send({ error: 'blocked by middleware: token invalid' })

    req.user = decodedUser
    next()
  } catch (error) {
    return res.status(400).send({ error })
  }
}

export { tokenExtractor, authenticateUser }
