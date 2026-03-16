import { useQuery } from '@tanstack/react-query'
import { getActions } from '@/services/auditService'
import { useAuth } from '@/context/auth/AuthContext'

export const useAuditActionsQuery = (runId: number) => {
  const { user } = useAuth()

  const { data: actions = [], isLoading, isError, error } = useQuery({
    queryKey: ['auditActions', runId],
    queryFn: () => getActions(runId),
    enabled: !!user && !!runId,
  })

  return { actions, isLoading, isError, error }
}
