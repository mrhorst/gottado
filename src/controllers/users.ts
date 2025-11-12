import { Request, Response, NextFunction } from 'express'

// returns all users
const listUsers = async (_req: Request, res: Response, _next: NextFunction) => {
  res.send('all users')
}

// CREATE a user
const createUser = async (
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  res.send('creates user')
}

const updateUser = async (_req: Request, _res: Response) => {}

const deleteUser = async (_req: Request, _res: Response) => {}

export { listUsers, createUser, updateUser, deleteUser }
