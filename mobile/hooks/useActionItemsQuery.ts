import { useQuery } from '@tanstack/react-query'
import { getActionItems } from '@/services/auditService'
import { useAuth } from '@/context/auth/AuthContext'

export const useActionItemsQuery = (status?: string) => {
  const { user } = useAuth()

  const query = useQuery({
    queryKey: ['action-items', user?.id, status],
    queryFn: () => getActionItems(status),
    enabled: !!user,
  })

  return {
    actionItems: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}
