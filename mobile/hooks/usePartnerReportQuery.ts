import { useQuery } from '@tanstack/react-query'
import { getPartnerSummary } from '@/services/auditService'
import { useAuth } from '@/context/auth/AuthContext'

export const usePartnerReportQuery = (startDate?: string, endDate?: string) => {
  const { user } = useAuth()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['partnerReport', startDate, endDate, user?.id],
    queryFn: () => getPartnerSummary(startDate, endDate),
    enabled: !!user,
  })

  return { report: data, isLoading, isError, error, refetch }
}