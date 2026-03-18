import api from './api'
import type {
  CreateLaborShiftPayload,
  LaborReferencesResponse,
  LaborShift,
} from '@/types/labor'

export const getLaborReferences = async (): Promise<LaborReferencesResponse> => {
  const { data } = await api.get<LaborReferencesResponse>('/labor/references')
  return data
}

export const getLaborShifts = async (date: string): Promise<LaborShift[]> => {
  const { data } = await api.get<LaborShift[]>(`/labor/shifts?date=${encodeURIComponent(date)}`)
  return data
}

export const createLaborShift = async (
  payload: CreateLaborShiftPayload
): Promise<LaborShift> => {
  const { data } = await api.post<LaborShift>('/labor/shifts', payload)
  return data
}
