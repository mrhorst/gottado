import api from './api'
import type {
  CreateDayPartPayload,
  CreateLaborShiftPayload,
  DayPart,
  LaborReferencesResponse,
  LaborShift,
  LaborShiftsResponse,
  UpdateDayPartPayload,
  UpdateLaborShiftPayload,
} from '@/types/labor'

export const getLaborReferences = async (): Promise<LaborReferencesResponse> => {
  const { data } = await api.get<LaborReferencesResponse>('/labor/references')
  return data
}

export const getLaborShifts = async (date: string): Promise<LaborShiftsResponse> => {
  const { data } = await api.get<LaborShiftsResponse>(
    `/labor/shifts?date=${encodeURIComponent(date)}`
  )
  return data
}

export const createLaborShift = async (
  payload: CreateLaborShiftPayload
): Promise<LaborShift> => {
  const { data } = await api.post<LaborShift>('/labor/shifts', payload)
  return data
}

export const updateLaborShift = async (
  id: number,
  payload: UpdateLaborShiftPayload
): Promise<LaborShift> => {
  const { data } = await api.put<LaborShift>(`/labor/shifts/${id}`, payload)
  return data
}

export const deleteLaborShift = async (id: number): Promise<void> => {
  await api.delete(`/labor/shifts/${id}`)
}

// Schedule status

export const publishScheduleDay = async (date: string): Promise<void> => {
  await api.post('/labor/schedule-day/publish', { date })
}

export const unpublishScheduleDay = async (date: string): Promise<void> => {
  await api.post('/labor/schedule-day/unpublish', { date })
}

// Day parts

export const getDayParts = async (): Promise<DayPart[]> => {
  const { data } = await api.get<DayPart[]>('/labor/day-parts')
  return data
}

export const createDayPart = async (payload: CreateDayPartPayload): Promise<DayPart> => {
  const { data } = await api.post<DayPart>('/labor/day-parts', payload)
  return data
}

export const updateDayPart = async (
  id: number,
  payload: UpdateDayPartPayload
): Promise<DayPart> => {
  const { data } = await api.put<DayPart>(`/labor/day-parts/${id}`, payload)
  return data
}

export const deleteDayPart = async (id: number): Promise<void> => {
  await api.delete(`/labor/day-parts/${id}`)
}
