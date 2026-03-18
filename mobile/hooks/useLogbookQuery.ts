import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/context/auth/AuthContext'
import { getLogbookEntries, getLogbookTemplates } from '@/services/logbookService'

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

export const useLogbookEntriesQuery = (templateId: number) => {
  const { user } = useAuth()
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['logbook-entries', user?.id, templateId],
    queryFn: () => getLogbookEntries(templateId),
    enabled: !!user && Number.isFinite(templateId) && templateId > 0,
  })

  return {
    template: data?.template ?? null,
    entries: data?.entries ?? [],
    isLoading,
    isError,
    error,
  }
}
