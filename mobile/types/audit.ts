export type ScoringType = 'score' | 'pass_fail'
export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type AuditRunStatus = 'in_progress' | 'completed' | 'cancelled'
export type ActionStatus = 'proposed' | 'approved' | 'promoted' | 'dismissed'
export type FollowUpStatus = 'scheduled' | 'completed' | 'skipped'
export type Recurrence =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'semi_annual'
  | 'yearly'

export interface AuditTemplate {
  id: number
  orgId: number
  name: string
  description: string | null
  frameworkTag: string | null
  createdBy: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface AuditCheckpoint {
  id: number
  templateId: number
  zone: string
  label: string
  description: string | null
  scoringType: ScoringType
  sortOrder: number
  active: boolean
}

export interface AuditTemplateDetail extends AuditTemplate {
  checkpoints: Record<string, AuditCheckpoint[]>
}

export interface AuditRunListItem {
  id: number
  templateName: string
  status: AuditRunStatus
  overallScore: number | null
  totalCheckpoints: number | null
  startedAt: string
  completedAt: string | null
  conductedBy: number
}

export interface AuditFinding {
  id: number
  checkpointId: number
  zone: string
  label: string
  scoringType: ScoringType
  score: number | null
  passed: boolean | null
  severity: Severity | null
  notes: string | null
  flagged: boolean
}

export interface AuditAction {
  id: number
  findingId: number
  runId: number
  title: string
  description: string | null
  assignedTo: number | null
  priority: Severity
  recurrence: Recurrence | null
  status: ActionStatus
  taskId: number | null
  sectionId: number | null
  createdAt: string
  updatedAt: string
}

export interface AuditFollowUp {
  id: number
  runId: number
  scheduledDate: string
  status: FollowUpStatus
  conductedBy: number | null
  notes: string | null
  score: number | null
  completedAt: string | null
  createdAt: string
}

export interface AuditRunDetail {
  id: number
  templateId: number
  orgId: number
  conductedBy: number
  status: AuditRunStatus
  overallScore: number | null
  totalCheckpoints: number | null
  notes: string | null
  startedAt: string
  completedAt: string | null
  findings: AuditFinding[]
  actions: AuditAction[]
  followUps: AuditFollowUp[]
}

export interface StartRunResponse {
  id: number
  templateId: number
  orgId: number
  conductedBy: number
  status: AuditRunStatus
  totalCheckpoints: number
  startedAt: string
  zones: Record<
    string,
    Array<{ checkpoint: AuditCheckpoint; findingId?: number }>
  >
}

export interface AuditDashboardData {
  recentRuns: Array<{
    id: number
    templateId: number
    templateName: string
    overallScore: number | null
    completedAt: string | null
    conductedBy: number
  }>
  upcomingFollowUps: Array<{
    id: number
    runId: number
    scheduledDate: string
    status: FollowUpStatus
  }>
  pendingActionsCount: number
  averageScore: number | null
  totalCompletedRuns: number
  scoreLimit: number
  zoneScores: Record<string, number> | null
  previousZoneScores: Record<string, number> | null
}

export interface ActionItem {
  id: number
  title: string
  description: string | null
  priority: Severity
  status: ActionStatus
  recurrence: Recurrence | null
  assignedTo: number | null
  assignedUserName: string | null
  runId: number
  auditName: string
  auditDate: string
  findingId: number
  taskId: number | null
  createdAt: string
  updatedAt: string
}

export interface PromoteActionPayload {
  sectionId: number
  title?: string
  description?: string
  dueDate?: string
  deadlineTime?: string
  recurrence?: Recurrence | null
  measurableCriteria?: string
}

export interface AdHocFindingPayload {
  label: string
  description?: string
  severity?: Severity
  notes?: string
}
