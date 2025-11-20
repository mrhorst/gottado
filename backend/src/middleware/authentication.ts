import { JWT_SECRET } from '../utils/config.ts'
import { NextFunction, Request, Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'

export interface AuthRequest extends Request {
  token?: string | null
  user?: JwtPayload | string
}

const tokenExtractor = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const authorization = req.header('authorization')
  const token = authorization?.toLowerCase().startsWith('bearer ')
    ? authorization.substring(7)
    : null

  req.token = token

  next()
}

const authenticateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.token
  const user = token ? jwt.verify(token, JWT_SECRET) : ''
  if (!user)
    return res
      .status(400)
      .send({ error: 'blocked by middleware: token invalid' })

  req.user = user
  next()
}

export { tokenExtractor, authenticateUser }
