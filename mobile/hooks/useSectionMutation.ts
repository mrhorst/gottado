import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createSection } from '../services/sectionService'
import { useLoggedUser } from '../context/user/UserContext'

export const useSectionMutation = () => {
  const queryClient = useQueryClient()
  const { user } = useLoggedUser()
  const userId = Number(user?.sub)

  const mutation = useMutation({
    mutationFn: (name: string) => createSection(name, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', user?.sub] })
    },
  })

  const addSection = (name: string, options?: any) => {
    mutation.mutate(name, options)
  }
  return { addSection }
}
