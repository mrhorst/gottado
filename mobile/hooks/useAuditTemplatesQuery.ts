import { useQuery } from '@tanstack/react-query'
import { getTemplates, getTemplate } from '@/services/auditService'
import { useAuth } from '@/context/auth/AuthContext'

export const useAuditTemplatesQuery = () => {
  const { user } = useAuth()

  const { data: templates = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['auditTemplates', user?.id],
    queryFn: getTemplates,
    enabled: !!user,
  })

  return { templates, isLoading, isError, error, refetch }
}

export const useAuditTemplateDetailQuery = (templateId: number) => {
  const { user } = useAuth()

  const { data: template, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['auditTemplate', templateId],
    queryFn: () => getTemplate(templateId),
    enabled: !!user && !!templateId,
  })

  return { template, isLoading, isError, error, refetch }
}
