import api from './api'
import type {
  AuditTemplate,
  AuditTemplateDetail,
  AuditRunListItem,
  AuditRunDetail,
  AuditFinding,
  AuditAction,
  AuditFollowUp,
  AuditDashboardData,
  StartRunResponse,
  Severity,
  Recurrence,
  PromoteActionPayload,
  AdHocFindingPayload,
  ActionItem,
} from '@/types/audit'

// Templates
const getTemplates = async (): Promise<AuditTemplate[]> => {
  const { data } = await api.get('/audits/templates')
  return data
}

const getTemplate = async (id: number): Promise<AuditTemplateDetail> => {
  const { data } = await api.get(`/audits/templates/${id}`)
  return data
}

const createTemplate = async (
  name: string,
  description?: string
): Promise<AuditTemplate> => {
  const { data } = await api.post('/audits/templates', { name, description })
  return data
}

const updateTemplate = async (
  id: number,
  payload: { name?: string; description?: string }
): Promise<AuditTemplate> => {
  const { data } = await api.put(`/audits/templates/${id}`, payload)
  return data
}

const archiveTemplate = async (id: number): Promise<void> => {
  await api.delete(`/audits/templates/${id}`)
}

// Checkpoints
const addCheckpoint = async (
  templateId: number,
  payload: {
    zone: string
    label: string
    description?: string
    scoringType?: string
    sortOrder?: number
  }
) => {
  const { data } = await api.post(
    `/audits/templates/${templateId}/checkpoints`,
    payload
  )
  return data
}

const updateCheckpoint = async (
  templateId: number,
  checkpointId: number,
  payload: {
    zone?: string
    label?: string
    description?: string
    scoringType?: string
    sortOrder?: number
  }
) => {
  const { data } = await api.put(
    `/audits/templates/${templateId}/checkpoints/${checkpointId}`,
    payload
  )
  return data
}

const removeCheckpoint = async (
  templateId: number,
  checkpointId: number
): Promise<void> => {
  await api.delete(
    `/audits/templates/${templateId}/checkpoints/${checkpointId}`
  )
}

const reorderCheckpoints = async (
  templateId: number,
  items: Array<{ id: number; sortOrder: number }>
): Promise<void> => {
  await api.put(`/audits/templates/${templateId}/checkpoints/reorder`, {
    items,
  })
}

// Runs
const getRuns = async (): Promise<AuditRunListItem[]> => {
  const { data } = await api.get('/audits/runs')
  return data
}

const getRun = async (id: number): Promise<AuditRunDetail> => {
  const { data } = await api.get(`/audits/runs/${id}`)
  return data
}

const startRun = async (templateId: number): Promise<StartRunResponse> => {
  const { data } = await api.post('/audits/runs', { templateId })
  return data
}

const completeRun = async (
  id: number,
  notes?: string
): Promise<AuditRunDetail> => {
  const { data } = await api.post(`/audits/runs/${id}/complete`, { notes })
  return data
}

const cancelRun = async (id: number): Promise<void> => {
  await api.post(`/audits/runs/${id}/cancel`)
}

// Findings
const assessFinding = async (
  runId: number,
  findingId: number,
  payload: {
    score?: number
    passed?: boolean
    severity?: Severity
    notes?: string
    flagged?: boolean
  }
): Promise<AuditFinding> => {
  const { data } = await api.put(
    `/audits/runs/${runId}/findings/${findingId}`,
    payload
  )
  return data
}

const batchAssessFindings = async (
  runId: number,
  findings: Array<{
    id: number
    score?: number
    passed?: boolean
    severity?: string
    notes?: string
    flagged?: boolean
  }>
): Promise<AuditFinding[]> => {
  const { data } = await api.put(`/audits/runs/${runId}/findings/batch`, {
    findings,
  })
  return data
}

// Actions
const getActions = async (runId: number): Promise<AuditAction[]> => {
  const { data } = await api.get(`/audits/runs/${runId}/actions`)
  return data
}

const createAction = async (
  runId: number,
  payload: {
    findingId: number
    title: string
    description?: string
    assignedTo?: number
    priority?: Severity
    recurrence?: Recurrence
  }
): Promise<AuditAction> => {
  const { data } = await api.post(`/audits/runs/${runId}/actions`, payload)
  return data
}

const updateAction = async (
  id: number,
  payload: Partial<{
    title: string
    description: string
    assignedTo: number
    priority: Severity
    recurrence: Recurrence
    sectionId: number
  }>
): Promise<AuditAction> => {
  const { data } = await api.put(`/audits/actions/${id}`, payload)
  return data
}

const promoteAction = async (
  id: number,
  payload: PromoteActionPayload
): Promise<{ action: AuditAction; task: unknown }> => {
  const { data } = await api.post(`/audits/actions/${id}/promote`, payload)
  return data
}

const seedPrestoTemplate = async (): Promise<AuditTemplate> => {
  const { data } = await api.post('/audits/templates/seed-presto')
  return data
}

const addAdHocFinding = async (
  runId: number,
  payload: AdHocFindingPayload
): Promise<{ checkpoint: unknown; finding: AuditFinding }> => {
  const { data } = await api.post(`/audits/runs/${runId}/findings`, payload)
  return data
}

const dismissAction = async (id: number): Promise<AuditAction> => {
  const { data } = await api.put(`/audits/actions/${id}/dismiss`)
  return data
}

// Follow-ups
const getFollowUps = async (runId: number): Promise<AuditFollowUp[]> => {
  const { data } = await api.get(`/audits/runs/${runId}/follow-ups`)
  return data
}

const scheduleFollowUp = async (
  runId: number,
  scheduledDate: string
): Promise<AuditFollowUp> => {
  const { data } = await api.post(`/audits/runs/${runId}/follow-ups`, {
    scheduledDate,
  })
  return data
}

const updateFollowUp = async (
  id: number,
  payload: { notes?: string; status?: string }
): Promise<AuditFollowUp> => {
  const { data } = await api.put(`/audits/follow-ups/${id}`, payload)
  return data
}

const completeFollowUp = async (
  id: number,
  payload: { notes?: string; score?: number }
): Promise<AuditFollowUp> => {
  const { data } = await api.post(`/audits/follow-ups/${id}/complete`, payload)
  return data
}

// Dashboard
const getAuditDashboard = async (
  scoreLimit?: number
): Promise<AuditDashboardData> => {
  const params = scoreLimit ? `?scoreLimit=${scoreLimit}` : ''
  const { data } = await api.get(`/audits/dashboard${params}`)
  return data
}

// Action Items (org-wide)
const getActionItems = async (status?: string): Promise<ActionItem[]> => {
  const params = status ? `?status=${status}` : ''
  const { data } = await api.get(`/audits/action-items${params}`)
  return data
}

export {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  archiveTemplate,
  addCheckpoint,
  updateCheckpoint,
  removeCheckpoint,
  reorderCheckpoints,
  getRuns,
  getRun,
  startRun,
  completeRun,
  cancelRun,
  assessFinding,
  batchAssessFindings,
  getActions,
  createAction,
  updateAction,
  promoteAction,
  dismissAction,
  getFollowUps,
  scheduleFollowUp,
  updateFollowUp,
  completeFollowUp,
  getAuditDashboard,
  getActionItems,
  seedPrestoTemplate,
  addAdHocFinding,
}
