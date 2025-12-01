import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLoggedUser } from '../context/user/UserContext'
import { createSection, getSections } from '../services/sectionService'

export const useSectionQuery = () => {
  const queryClient = useQueryClient()
  const { user } = useLoggedUser()

  const { data, isLoading } = useQuery({
    queryKey: ['sections', user?.sub],
    queryFn: getSections,
    enabled: !!user,
  })

  const mutation = useMutation({
    mutationFn: ({ name, userId }: { name: string; userId: number }) =>
      createSection(name, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', user?.sub] })
    },
  })

  return { sections: data, addSection: mutation, isLoading }
}
