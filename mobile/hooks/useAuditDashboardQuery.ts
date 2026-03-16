import { useQuery } from '@tanstack/react-query'
import { getAuditDashboard } from '@/services/auditService'
import { useAuth } from '@/context/auth/AuthContext'

export const useAuditDashboardQuery = (scoreLimit?: number) => {
  const { user } = useAuth()

  const { data: dashboard, isLoading, isError, error } = useQuery({
    queryKey: ['auditDashboard', user?.id, scoreLimit],
    queryFn: () => getAuditDashboard(scoreLimit),
    enabled: !!user,
  })

  return { dashboard, isLoading, isError, error }
}
