import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  archiveSection,
  createSection,
  deleteSection,
  unarchiveSection,
} from '../services/sectionService'
import { useLoggedUser } from '../context/user/UserContext'

export const useSectionMutation = () => {
  const queryClient = useQueryClient()
  const { user } = useLoggedUser()
  const userId = Number(user?.sub)

  const create = useMutation({
    mutationFn: (name: string) => createSection(name, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', user?.sub] })
    },
  })
  const archive = useMutation({
    mutationFn: (sectionId: number) => archiveSection(sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', user?.sub] })
    },
  })
  const unarchive = useMutation({
    mutationFn: (sectionId: number) => unarchiveSection(sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', user?.sub] })
    },
  })
  const remove = useMutation({
    mutationFn: (sectionId: number) => deleteSection(sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', user?.sub] })
    },
  })

  return {
    addSection: create.mutate,
    archiveSection: archive.mutate,
    unarchiveSection: unarchive.mutate,
    deleteSection: remove.mutate,
  }
}
