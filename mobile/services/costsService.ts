import api from './api'
import type {
  CostRecordsResponse,
  CostReferencesResponse,
  CostRecord,
  CreateCostRecordPayload,
} from '@/types/costs'

export const getCostReferences = async (): Promise<CostReferencesResponse> => {
  const { data } = await api.get<CostReferencesResponse>('/costs/references')
  return data
}

export const getCostRecords = async (date: string): Promise<CostRecordsResponse> => {
  const { data } = await api.get<CostRecordsResponse>(
    `/costs/records?date=${encodeURIComponent(date)}`
  )
  return data
}

export const createCostRecord = async (
  payload: CreateCostRecordPayload
): Promise<CostRecord> => {
  const { data } = await api.post<CostRecord>('/costs/records', payload)
  return data
}
