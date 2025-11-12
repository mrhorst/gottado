import { Request, Response, NextFunction } from 'express'

// returns all users
export const listUsers = async (
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  res.send('all users')
}

// CREATE a user
export const createUser = async (
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  res.send('creates user')
}
