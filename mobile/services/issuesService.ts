import api from './api'
import type {
  CreateIssueRecordPayload,
  IssueCategory,
  IssueRecord,
  IssueRecordsResponse,
  IssueReferencesResponse,
} from '@/types/issues'

export const getIssueReferences = async (): Promise<IssueReferencesResponse> => {
  const { data } = await api.get<IssueReferencesResponse>('/issues/references')
  return data
}

export const getIssueRecords = async ({
  date,
  category,
}: {
  date: string
  category: IssueCategory | 'all'
}): Promise<IssueRecordsResponse> => {
  const { data } = await api.get<IssueRecordsResponse>(
    `/issues/records?date=${encodeURIComponent(date)}&category=${encodeURIComponent(category)}`
  )
  return data
}

export const createIssueRecord = async (
  payload: CreateIssueRecordPayload
): Promise<IssueRecord> => {
  const { data } = await api.post<IssueRecord>('/issues/records', payload)
  return data
}
