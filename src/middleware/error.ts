import { NextFunction, Request, Response } from 'express'

const errorHandler = async (
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof Error) {
    res.status(400).send(error)
  }
  next()
}

export default errorHandler
