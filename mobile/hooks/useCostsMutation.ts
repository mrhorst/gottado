import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/auth/AuthContext'
import { createCostRecord as createCostRecordApi } from '@/services/costsService'

export const useCreateCostRecordMutation = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const createCostRecordMutation = useMutation({
    mutationFn: createCostRecordApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-records', user?.id] })
    },
  })

  return {
    createCostRecord: createCostRecordMutation.mutate,
    isPending: createCostRecordMutation.isPending,
  }
}
