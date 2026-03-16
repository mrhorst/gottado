import { NextFunction, Request, Response } from 'express'
import { AppError } from '@/utils/AppError.ts'

const errorHandler = async (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(error)

  if (error instanceof AppError) {
    return res.status(error.statusCode).send({ error: error.message })
  }

  if (error instanceof Error) {
    // Drizzle/pg unique constraint violation
    if (
      'code' in error &&
      (error as Record<string, unknown>).code === '23505'
    ) {
      return res.status(409).send({ error: 'resource already exists' })
    }

    return res.status(500).send({ error: error.message })
  }

  res.status(500).send({ error: 'an unexpected error occurred' })
}

export default errorHandler
