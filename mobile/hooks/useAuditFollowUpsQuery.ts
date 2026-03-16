import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getFollowUps,
  scheduleFollowUp,
  updateFollowUp,
  completeFollowUp,
} from '@/services/auditService'
import { useAuth } from '@/context/auth/AuthContext'

export const useAuditFollowUpsQuery = (runId: number) => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: followUps = [], isLoading } = useQuery({
    queryKey: ['auditFollowUps', runId],
    queryFn: () => getFollowUps(runId),
    enabled: !!user && !!runId,
  })

  const scheduleMutation = useMutation({
    mutationFn: (scheduledDate: string) =>
      scheduleFollowUp(runId, scheduledDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditFollowUps', runId] })
      queryClient.invalidateQueries({ queryKey: ['auditRun', runId] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (payload: {
      id: number
      notes?: string
      status?: string
    }) => updateFollowUp(payload.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditFollowUps', runId] })
    },
  })

  const completeMutation = useMutation({
    mutationFn: (payload: { id: number; notes?: string; score?: number }) =>
      completeFollowUp(payload.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditFollowUps', runId] })
      queryClient.invalidateQueries({ queryKey: ['auditRun', runId] })
    },
  })

  return {
    followUps,
    isLoading,
    scheduleFollowUp: scheduleMutation.mutate,
    updateFollowUp: updateMutation.mutate,
    completeFollowUp: completeMutation.mutate,
    isScheduling: scheduleMutation.isPending,
  }
}
