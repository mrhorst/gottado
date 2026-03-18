export type IssueCategory = 'guest' | 'staffing' | 'maintenance' | 'inventory' | 'financial'
export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface IssueRecord {
  id: number
  category: IssueCategory
  severity: IssueSeverity
  title: string
  entryDate: string
  areaId?: number | null
  areaName?: string | null
  followUpRequired: boolean
  status: 'open' | 'resolved'
  notes?: string | null
  createdAt?: string
}

export interface IssueSummary {
  total: number
  followUpCount: number
  highSeverityCount: number
}

export interface IssueRecordsResponse {
  summary: IssueSummary
  records: IssueRecord[]
}

export interface IssueReferencesResponse {
  areas: { id: number; name: string }[]
}

export interface CreateIssueRecordPayload {
  category: IssueCategory
  severity: IssueSeverity
  title: string
  entryDate: string
  areaId?: number | null
  followUpRequired?: boolean
  notes?: string
}
