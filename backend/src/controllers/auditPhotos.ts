import { NextFunction, Response } from 'express'
import { auditPhoto, auditFinding, auditRun } from '@/db/schema.ts'
import db from '@/utils/db.ts'
import { eq, and } from 'drizzle-orm'
import { AuthenticatedRequest } from '@/types/index.ts'
import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads', 'audits')

// Ensure upload directory exists
const ensureUploadDir = async (orgId: number, runId: number) => {
  const dir = path.join(UPLOAD_DIR, orgId.toString(), runId.toString(), 'original')
  await fs.mkdir(dir, { recursive: true })
  return dir
}

// Get run ID from finding ID for path construction
const getRunIdFromFinding = async (findingId: number): Promise<number | null> => {
  const result = await db
    .select({ runId: auditFinding.runId })
    .from(auditFinding)
    .where(eq(auditFinding.id, findingId))
    .limit(1)
  return result[0]?.runId ?? null
}

// Validate user has access to this finding's organization
const validateFindingAccess = async (
  findingId: number,
  userId: number,
  orgId: number
): Promise<boolean> => {
  const result = await db
    .select({ runOrgId: auditRun.orgId })
    .from(auditFinding)
    .innerJoin(auditRun, eq(auditFinding.runId, auditRun.id))
    .where(eq(auditFinding.id, findingId))
    .limit(1)
  return result[0]?.runOrgId === orgId
}

const uploadPhoto = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const findingId = Number(req.params.findingId)
  const userId = req.user!.id
  const orgId = req.orgId!

  if (!req.file) {
    return res.status(400).json({ error: 'No photo uploaded' })
  }

  try {
    // Validate access
    const hasAccess = await validateFindingAccess(findingId, userId, orgId)
    if (!hasAccess) {
      await fs.unlink(req.file.path) // Clean up temp file
      return res.status(403).json({ error: 'Access denied' })
    }

    const runId = await getRunIdFromFinding(findingId)
    if (!runId) {
      await fs.unlink(req.file.path)
      return res.status(404).json({ error: 'Finding not found' })
    }

    // Create permanent storage path
    const uploadDir = await ensureUploadDir(orgId, runId)
    const fileExt = path.extname(req.file.originalname).toLowerCase()
    const filename = `${uuidv4()}${fileExt}`
    const permanentPath = path.join(uploadDir, filename)

    // Move file from temp to permanent location
    await fs.rename(req.file.path, permanentPath)

    // Create relative path for storage
    const storagePath = path.join(
      'audits',
      orgId.toString(),
      runId.toString(),
      'original',
      filename
    )

    // Save to database
    const [photo] = await db
      .insert(auditPhoto)
      .values({
        findingId,
        storagePath,
        originalFilename: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        createdBy: userId,
      })
      .returning()

    // Return photo with URL
    res.status(201).json({
      ...photo,
      url: `/uploads/${storagePath}`,
    })
  } catch (err) {
    // Clean up temp file on error
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {})
    }
    next(err)
  }
}

const getPhotosByFinding = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const findingId = Number(req.params.findingId)
  const orgId = req.orgId!

  try {
    // Validate access
    const hasAccess = await validateFindingAccess(findingId, 0, orgId)
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const photos = await db
      .select({
        id: auditPhoto.id,
        findingId: auditPhoto.findingId,
        originalFilename: auditPhoto.originalFilename,
        mimeType: auditPhoto.mimeType,
        fileSize: auditPhoto.fileSize,
        createdAt: auditPhoto.createdAt,
        createdBy: auditPhoto.createdBy,
        storagePath: auditPhoto.storagePath,
      })
      .from(auditPhoto)
      .where(eq(auditPhoto.findingId, findingId))
      .orderBy(auditPhoto.createdAt)

    // Add URLs
    const photosWithUrls = photos.map((photo) => ({
      ...photo,
      url: `/uploads/${photo.storagePath}`,
    }))

    res.json(photosWithUrls)
  } catch (err) {
    next(err)
  }
}

const deletePhoto = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const photoId = Number(req.params.photoId)
  const userId = req.user!.id
  const orgId = req.orgId!

  try {
    // Get photo with finding info to validate access
    const photo = await db
      .select({
        id: auditPhoto.id,
        storagePath: auditPhoto.storagePath,
        findingId: auditPhoto.findingId,
      })
      .from(auditPhoto)
      .where(eq(auditPhoto.id, photoId))
      .limit(1)

    if (!photo[0]) {
      return res.status(404).json({ error: 'Photo not found' })
    }

    // Validate access
    const hasAccess = await validateFindingAccess(photo[0].findingId, userId, orgId)
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Delete file from filesystem
    const filePath = path.resolve(process.cwd(), 'uploads', photo[0].storagePath)
    await fs.unlink(filePath).catch(() => {}) // Ignore if already deleted

    // Delete from database
    await db.delete(auditPhoto).where(eq(auditPhoto.id, photoId))

    res.sendStatus(204)
  } catch (err) {
    next(err)
  }
}

export { uploadPhoto, getPhotosByFinding, deletePhoto }
