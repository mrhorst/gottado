import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  archiveSection,
  createSection,
  deleteSection,
  renameSection,
  unarchiveSection,
} from '../services/sectionService'
import { useAuth } from '@/context/auth/AuthContext'

export const useSectionMutation = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = Number(user?.id)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['sections', user?.id] })
    queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] })
  }

  const create = useMutation({
    mutationFn: (name: string) => createSection(name, userId),
    onSuccess: invalidate,
  })
  const rename = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      renameSection(id, name),
    onSuccess: invalidate,
  })
  const archive = useMutation({
    mutationFn: (sectionId: number) => archiveSection(sectionId),
    onSuccess: invalidate,
  })
  const unarchive = useMutation({
    mutationFn: (sectionId: number) => unarchiveSection(sectionId),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (sectionId: number) => deleteSection(sectionId),
    onSuccess: invalidate,
  })

  return {
    addSection: create.mutate,
    renameSection: rename.mutate,
    archiveSection: archive.mutate,
    unarchiveSection: unarchive.mutate,
    deleteSection: remove.mutate,
  }
}
