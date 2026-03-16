import { Router, Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import crypto from 'crypto'
import fs from 'fs'
import type { Express } from 'express'

const uploadDir = path.resolve(import.meta.dirname, '../../uploads')

// Task photo uploads should work on fresh environments before any manual setup.
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${crypto.randomUUID()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  },
})

const router = Router()

router.post('/', upload.any(), (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? []
  const uploadedFile = req.file ?? files[0]

  if (!uploadedFile) {
    return res.status(400).send({ error: 'No image provided' })
  }
  const url = `/uploads/${uploadedFile.filename}`
  res.status(201).send({ url })
})

export default router
