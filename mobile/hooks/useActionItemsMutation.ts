import { useMutation, useQueryClient } from '@tanstack/react-query'
import { promoteAction, dismissAction } from '@/services/auditService'
import type { PromoteActionPayload } from '@/types/audit'

export const useActionItemsMutation = () => {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['action-items'] })
    queryClient.invalidateQueries({ queryKey: ['auditDashboard'] })
  }

  const promoteMutation = useMutation({
    mutationFn: ({ actionId, payload }: { actionId: number; payload: PromoteActionPayload }) =>
      promoteAction(actionId, payload),
    onSuccess: () => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const dismissMutation = useMutation({
    mutationFn: (id: number) => dismissAction(id),
    onSuccess: invalidate,
  })

  return {
    promote: promoteMutation,
    dismiss: dismissMutation,
  }
}
