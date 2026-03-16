import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const messages = result.error.issues.map(
        (e) => `${e.path.join('.')}: ${e.message}`
      )
      return res.status(400).send({ error: 'validation failed', details: messages })
    }
    req.body = result.data
    next()
  }
