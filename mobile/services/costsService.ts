import api from './api'
import type {
  CostFilter,
  CostRecordsResponse,
  CostReferencesResponse,
  CostRecord,
  CreateCostRecordPayload,
  ExportCostRecordsParams,
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

export const getFilteredCostRecords = async ({
  date,
  kind,
}: {
  date: string
  kind: CostFilter
}): Promise<CostRecordsResponse> => {
  const { data } = await api.get<CostRecordsResponse>(
    `/costs/records?date=${encodeURIComponent(date)}&kind=${encodeURIComponent(kind)}`
  )
  return data
}

export const createCostRecord = async (
  payload: CreateCostRecordPayload
): Promise<CostRecord> => {
  const { data } = await api.post<CostRecord>('/costs/records', payload)
  return data
}

export const exportCostRecordsCsv = async ({
  from,
  to,
  kind,
}: ExportCostRecordsParams): Promise<string> => {
  const { data } = await api.get<string>(
    `/costs/records/export?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&kind=${encodeURIComponent(kind)}`
  )
  return data
}
