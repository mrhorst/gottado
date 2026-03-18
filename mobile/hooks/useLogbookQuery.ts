import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/context/auth/AuthContext'
import {
  getEntryDates,
  getEntryHistory,
  getLogbookEntryByDate,
  getLogbookTemplates,
} from '@/services/logbookService'

export const useLogbookTemplatesQuery = () => {
  const { user } = useAuth()
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['logbook-templates', user?.id],
    queryFn: getLogbookTemplates,
    enabled: !!user,
  })

  return {
    templates: data ?? [],
    isLoading,
    isError,
    error,
  }
}

export const useLogbookDayQuery = (templateId: number, date: string) => {
  const { user } = useAuth()
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['logbook-day', user?.id, templateId, date],
    queryFn: () => getLogbookEntryByDate(templateId, date),
    enabled: !!user && Number.isFinite(templateId) && templateId > 0 && !!date,
  })

  return {
    template: data?.template ?? null,
    entry: data?.entry ?? null,
    isLoading,
    isError,
    error,
  }
}

export const useLogbookEntryDatesQuery = (templateId: number) => {
  const { user } = useAuth()
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['logbook-entry-dates', user?.id, templateId],
    queryFn: () => getEntryDates(templateId),
    enabled: !!user && Number.isFinite(templateId) && templateId > 0,
  })

  return {
    dates: data?.dates ?? [],
    isLoading,
    isError,
    error,
  }
}

export const useLogbookHistoryQuery = (
  templateId: number,
  date: string,
  enabled: boolean
) => {
  const { user } = useAuth()
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['logbook-history', user?.id, templateId, date],
    queryFn: () => getEntryHistory(templateId, date),
    enabled: !!user && enabled && Number.isFinite(templateId) && templateId > 0 && !!date,
  })

  return {
    edits: data?.edits ?? [],
    isLoading,
    isError,
    error,
  }
}
