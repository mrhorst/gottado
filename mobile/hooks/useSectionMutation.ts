import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  archiveSection,
  createSection,
  deleteSection,
  unarchiveSection,
} from '../services/sectionService'
import { useAuth } from '@/context/auth/AuthContext'

export const useSectionMutation = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = Number(user?.id)

  const create = useMutation({
    mutationFn: (name: string) => createSection(name, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', user?.id] })
    },
  })
  const archive = useMutation({
    mutationFn: (sectionId: number) => archiveSection(sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', user?.id] })
    },
  })
  const unarchive = useMutation({
    mutationFn: (sectionId: number) => unarchiveSection(sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', user?.id] })
    },
  })
  const remove = useMutation({
    mutationFn: (sectionId: number) => deleteSection(sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', user?.id] })
    },
  })

  return {
    addSection: create.mutate,
    archiveSection: archive.mutate,
    unarchiveSection: unarchive.mutate,
    deleteSection: remove.mutate,
  }
}
