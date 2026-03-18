import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/auth/AuthContext'
import { createTeam as createTeamApi } from '@/services/teamService'

export const useTeamsMutation = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = ['teams', user?.id]

  const createTeamMutation = useMutation({
    mutationFn: (payload: { name: string; description?: string }) => createTeamApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  return {
    createTeam: createTeamMutation.mutate,
    isCreating: createTeamMutation.isPending,
  }
}
