import { Router, Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import crypto from 'crypto'

const storage = multer.diskStorage({
  destination: path.resolve(import.meta.dirname, '../../uploads'),
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

router.post('/', upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).send({ error: 'No image provided' })
  }
  const url = `/uploads/${req.file.filename}`
  res.status(201).send({ url })
})

export default router
