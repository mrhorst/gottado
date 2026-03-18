import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/auth/AuthContext'
import { createLaborShift as createLaborShiftApi } from '@/services/laborService'

export const useCreateShiftMutation = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const createShiftMutation = useMutation({
    mutationFn: createLaborShiftApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labor-shifts', user?.id] })
    },
  })

  return {
    createShift: createShiftMutation.mutate,
    isPending: createShiftMutation.isPending,
  }
}
