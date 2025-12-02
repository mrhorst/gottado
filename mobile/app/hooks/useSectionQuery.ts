import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLoggedUser } from '../context/user/UserContext'
import { createSection, getSections } from '../services/sectionService'
import { Section } from '../context/section/SectionContext'

export const useSectionQuery = () => {
  const queryClient = useQueryClient()
  const { user } = useLoggedUser()
  const userId = Number(user?.sub)

  const {
    data,
    isLoading,
  }: { data: Section[] | undefined; isLoading: boolean } = useQuery({
    queryKey: ['sections', user?.sub],
    queryFn: getSections,
    enabled: !!user,
  })

  const mutation = useMutation({
    mutationFn: (name: string) => createSection(name, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', user?.sub] })
    },
  })

  const addSection = (name: string) => {
    mutation.mutate(name)
  }

  return { sections: data, addSection, isLoading }
}
