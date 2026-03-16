import { useMutation, useQueryClient } from '@tanstack/react-query'
import { startRun, completeRun, cancelRun } from '@/services/auditService'
import { useAuth } from '@/context/auth/AuthContext'

export const useAuditRunsMutation = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const startRunMutation = useMutation({
    mutationFn: (templateId: number) => startRun(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditRuns', user?.id] })
    },
  })

  const completeRunMutation = useMutation({
    mutationFn: (payload: { runId: number; notes?: string }) =>
      completeRun(payload.runId, payload.notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['auditRuns', user?.id] })
      queryClient.invalidateQueries({
        queryKey: ['auditRun', variables.runId],
      })
    },
  })

  const cancelRunMutation = useMutation({
    mutationFn: (runId: number) => cancelRun(runId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditRuns', user?.id] })
    },
  })

  return {
    startRun: startRunMutation.mutateAsync,
    completeRun: completeRunMutation.mutate,
    cancelRun: cancelRunMutation.mutate,
    isStarting: startRunMutation.isPending,
    isCompleting: completeRunMutation.isPending,
  }
}
