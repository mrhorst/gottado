import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import os from 'os'
import {
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  archiveTemplate,
  seedPresto,
} from '@/controllers/auditTemplates.ts'
import {
  addCheckpoint,
  updateCheckpoint,
  removeCheckpoint,
  reorderCheckpoints,
} from '@/controllers/auditCheckpoints.ts'
import {
  listRuns,
  getRun,
  startRun,
  completeRun,
  cancelRun,
  addAdHocFinding,
} from '@/controllers/auditRuns.ts'
import {
  assessFinding,
  batchAssessFindings,
} from '@/controllers/auditFindings.ts'
import {
  listActions,
  listActionItems,
  createAction,
  updateAction,
  promoteAction,
  dismissAction,
} from '@/controllers/auditActions.ts'
import {
  listFollowUps,
  scheduleFollowUp,
  updateFollowUp,
  completeFollowUp,
} from '@/controllers/auditFollowUps.ts'
import {
  uploadPhoto,
  getPhotosByFinding,
  deletePhoto,
} from '@/controllers/auditPhotos.ts'
import { getAuditDashboard } from '@/controllers/auditDashboard.ts'
import { getPartnerSummary, exportPartnerCSV } from '@/controllers/auditReports.ts'
import { validate } from '@/middleware/validate.ts'
import {
  createTemplateSchema,
  updateTemplateSchema,
  addCheckpointSchema,
  updateCheckpointSchema,
  reorderCheckpointsSchema,
  startRunSchema,
  completeRunSchema,
  assessFindingSchema,
  batchAssessFindingsSchema,
  createActionSchema,
  updateActionSchema,
  promoteActionSchema,
  scheduleFollowUpSchema,
  updateFollowUpSchema,
  completeFollowUpSchema,
  addAdHocFindingSchema,
} from '@/validation/schemas.ts'

// Multer setup for audit photos - store to temp first
const photoUpload = multer({
  storage: multer.diskStorage({
    destination: os.tmpdir(),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname)
      cb(null, `audit-photo-${Date.now()}${ext}`)
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'))
    }
  },
})

const auditsRouter = Router()

// Dashboard
auditsRouter.get('/dashboard', getAuditDashboard)

// Templates
auditsRouter.get('/templates', listTemplates)
auditsRouter.get('/templates/:id', getTemplate)
auditsRouter.post('/templates', validate(createTemplateSchema), createTemplate)
auditsRouter.put('/templates/:id', validate(updateTemplateSchema), updateTemplate)
auditsRouter.delete('/templates/:id', archiveTemplate)
auditsRouter.post('/templates/seed-presto', seedPresto)

// Checkpoints
auditsRouter.post('/templates/:templateId/checkpoints', validate(addCheckpointSchema), addCheckpoint)
auditsRouter.put('/templates/:templateId/checkpoints/reorder', validate(reorderCheckpointsSchema), reorderCheckpoints)
auditsRouter.put('/templates/:templateId/checkpoints/:id', validate(updateCheckpointSchema), updateCheckpoint)
auditsRouter.delete('/templates/:templateId/checkpoints/:id', removeCheckpoint)

// Runs
auditsRouter.get('/runs', listRuns)
auditsRouter.get('/runs/:id', getRun)
auditsRouter.post('/runs', validate(startRunSchema), startRun)
auditsRouter.post('/runs/:id/complete', validate(completeRunSchema), completeRun)
auditsRouter.post('/runs/:id/cancel', cancelRun)

// Ad-hoc findings (Operations & Upkeep zone)
auditsRouter.post('/runs/:runId/findings', validate(addAdHocFindingSchema), addAdHocFinding)

// Findings
auditsRouter.put('/runs/:runId/findings/batch', validate(batchAssessFindingsSchema), batchAssessFindings)
auditsRouter.put('/runs/:runId/findings/:findingId', validate(assessFindingSchema), assessFinding)

// Action Items (org-wide)
auditsRouter.get('/action-items', listActionItems)

// Actions (run-scoped)
auditsRouter.get('/runs/:runId/actions', listActions)
auditsRouter.post('/runs/:runId/actions', validate(createActionSchema), createAction)
auditsRouter.put('/actions/:id', validate(updateActionSchema), updateAction)
auditsRouter.post('/actions/:id/promote', validate(promoteActionSchema), promoteAction)
auditsRouter.put('/actions/:id/dismiss', dismissAction)

// Follow-ups
auditsRouter.get('/runs/:runId/follow-ups', listFollowUps)
auditsRouter.post('/runs/:runId/follow-ups', validate(scheduleFollowUpSchema), scheduleFollowUp)
auditsRouter.put('/follow-ups/:id', validate(updateFollowUpSchema), updateFollowUp)
auditsRouter.post('/follow-ups/:id/complete', validate(completeFollowUpSchema), completeFollowUp)

// Photos
auditsRouter.get('/runs/:runId/findings/:findingId/photos', getPhotosByFinding)
auditsRouter.post('/runs/:runId/findings/:findingId/photos', photoUpload.single('photo'), uploadPhoto)
auditsRouter.delete('/photos/:photoId', deletePhoto)

// Partner Reports
auditsRouter.get('/reports/partner-summary', getPartnerSummary)
auditsRouter.get('/reports/partner-summary.csv', exportPartnerCSV)

export default auditsRouter
