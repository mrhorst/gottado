import api from './api'
import type {
  LogbookDayResponse,
  LogbookEntryDatesResponse,
  LogbookHistoryResponse,
  LogbookTemplateSummary,
} from '@/types/logbook'

export const getLogbookTemplates = async (): Promise<LogbookTemplateSummary[]> => {
  const { data } = await api.get<LogbookTemplateSummary[]>('/logbook/templates')
  return data
}

export const createLogbookTemplate = async (payload: {
  title: string
  description?: string
}): Promise<LogbookTemplateSummary> => {
  const { data } = await api.post<LogbookTemplateSummary>('/logbook/templates', payload)
  return data
}

export const getLogbookEntryByDate = async (
  templateId: number,
  date: string
): Promise<LogbookDayResponse> => {
  const { data } = await api.get<LogbookDayResponse>(
    `/logbook/templates/${templateId}/entries/${date}`
  )
  return data
}

export const upsertTodayEntry = async (
  templateId: number,
  body: string
) => {
  const { data } = await api.put(`/logbook/templates/${templateId}/entries/today`, { body })
  return data
}

export const getEntryHistory = async (
  templateId: number,
  date: string
): Promise<LogbookHistoryResponse> => {
  const { data } = await api.get<LogbookHistoryResponse>(
    `/logbook/templates/${templateId}/entries/${date}/history`
  )
  return data
}

export const getEntryDates = async (
  templateId: number
): Promise<LogbookEntryDatesResponse> => {
  const { data } = await api.get<LogbookEntryDatesResponse>(
    `/logbook/templates/${templateId}/entry-dates`
  )
  return data
}
