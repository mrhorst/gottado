import { useQuery } from '@tanstack/react-query'
import { getTaskHistory, getDailySnapshot, getCompletionsByUser } from '@/services/taskService'
import { useAuth } from '@/context/auth/AuthContext'

export const useTaskHistoryQuery = (taskId: number) => {
  const { user } = useAuth()

  const { data: completions = [], isLoading } = useQuery({
    queryKey: ['taskHistory', taskId],
    queryFn: () => getTaskHistory(taskId),
    enabled: !!user && !!taskId,
  })

  return { completions, isLoading }
}

export const useDailySnapshotQuery = (date?: string) => {
  const { user } = useAuth()

  const { data: snapshot, isLoading, isError, error } = useQuery({
    queryKey: ['dailySnapshot', date],
    queryFn: () => getDailySnapshot(date),
    enabled: !!user,
  })

  return { snapshot, isLoading, isError, error }
}

export const useCompletionsByUserQuery = (days = 7) => {
  const { user } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['completionsByUser', days],
    queryFn: () => getCompletionsByUser(days),
    enabled: !!user,
  })

  return { completionsByUser: data, isLoading }
}
