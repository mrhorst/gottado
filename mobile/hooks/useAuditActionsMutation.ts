import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createAction,
  updateAction,
  promoteAction,
  dismissAction,
} from '@/services/auditService'
import type { Severity, Recurrence, PromoteActionPayload } from '@/types/audit'

export const useAuditActionsMutation = (runId: number) => {
  const queryClient = useQueryClient()

  const createActionMutation = useMutation({
    mutationFn: (payload: {
      findingId: number
      title: string
      description?: string
      assignedTo?: number
      priority?: Severity
      recurrence?: Recurrence
    }) => createAction(runId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditActions', runId] })
      queryClient.invalidateQueries({ queryKey: ['auditRun', runId] })
    },
  })

  const updateActionMutation = useMutation({
    mutationFn: (payload: {
      id: number
      title?: string
      description?: string
      assignedTo?: number
      priority?: Severity
      recurrence?: Recurrence
      sectionId?: number
    }) => updateAction(payload.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditActions', runId] })
    },
  })

  const promoteActionMutation = useMutation({
    mutationFn: (payload: { id: number } & PromoteActionPayload) =>
      promoteAction(payload.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditActions', runId] })
      queryClient.invalidateQueries({ queryKey: ['auditRun', runId] })
    },
  })

  const dismissActionMutation = useMutation({
    mutationFn: (id: number) => dismissAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditActions', runId] })
    },
  })

  return {
    createAction: createActionMutation.mutate,
    updateAction: updateActionMutation.mutate,
    promoteAction: promoteActionMutation.mutate,
    dismissAction: dismissActionMutation.mutate,
    isCreating: createActionMutation.isPending,
    isPromoting: promoteActionMutation.isPending,
  }
}
