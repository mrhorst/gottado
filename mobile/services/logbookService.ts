import api from './api'
import type {
  LogbookEntriesResponse,
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

export const getLogbookEntries = async (templateId: number): Promise<LogbookEntriesResponse> => {
  const { data } = await api.get<LogbookEntriesResponse>(`/logbook/templates/${templateId}/entries`)
  return data
}

export const createLogbookEntry = async (
  templateId: number,
  payload: { title?: string; body: string; entryDate?: string }
) => {
  const { data } = await api.post(`/logbook/templates/${templateId}/entries`, payload)
  return data
}
