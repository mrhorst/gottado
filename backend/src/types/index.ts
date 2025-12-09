import { Request } from 'express'
import { JwtPayload } from 'jsonwebtoken'

export interface AuthenticatedRequest extends Request {
  token?: string
  // We explicitly say: "If user exists, it looks like UserPayload"
  user?: UserPayload
}

export interface UserPayload extends JwtPayload {
  email: string
  sub: string
  iat: number
}
