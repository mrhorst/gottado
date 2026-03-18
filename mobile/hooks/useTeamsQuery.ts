import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/context/auth/AuthContext'
import { getTeams } from '@/services/teamService'

export const useTeamsQuery = () => {
  const { user } = useAuth()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['teams', user?.id],
    queryFn: getTeams,
    enabled: !!user,
  })

  return {
    teams: data ?? [],
    isLoading,
    isError,
    error,
  }
}
