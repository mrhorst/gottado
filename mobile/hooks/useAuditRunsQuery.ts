import { useQuery } from '@tanstack/react-query'
import { getRuns, getRun } from '@/services/auditService'
import { useAuth } from '@/context/auth/AuthContext'

export const useAuditRunsQuery = () => {
  const { user } = useAuth()

  const { data: runs = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['auditRuns', user?.id],
    queryFn: getRuns,
    enabled: !!user,
  })

  return { runs, isLoading, isError, error, refetch }
}

export const useAuditRunDetailQuery = (runId: number) => {
  const { user } = useAuth()

  const { data: run, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['auditRun', runId],
    queryFn: () => getRun(runId),
    enabled: !!user && !!runId,
  })

  return { run, isLoading, isError, error, refetch }
}
