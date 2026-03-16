import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createTemplate,
  updateTemplate,
  archiveTemplate,
  addCheckpoint,
  updateCheckpoint,
  removeCheckpoint,
  reorderCheckpoints,
  seedPrestoTemplate,
} from '@/services/auditService'
import { useAuth } from '@/context/auth/AuthContext'

export const useAuditTemplatesMutation = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const createTemplateMutation = useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      createTemplate(payload.name, payload.description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditTemplates', user?.id] })
    },
  })

  const updateTemplateMutation = useMutation({
    mutationFn: (payload: {
      id: number
      name?: string
      description?: string
    }) => updateTemplate(payload.id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['auditTemplates', user?.id] })
      queryClient.invalidateQueries({
        queryKey: ['auditTemplate', variables.id],
      })
    },
  })

  const archiveTemplateMutation = useMutation({
    mutationFn: (id: number) => archiveTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditTemplates', user?.id] })
    },
  })

  const addCheckpointMutation = useMutation({
    mutationFn: (payload: {
      templateId: number
      zone: string
      label: string
      description?: string
      scoringType?: string
      sortOrder?: number
    }) => addCheckpoint(payload.templateId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['auditTemplate', variables.templateId],
      })
    },
  })

  const updateCheckpointMutation = useMutation({
    mutationFn: (payload: {
      templateId: number
      checkpointId: number
      zone?: string
      label?: string
      description?: string
      scoringType?: string
      sortOrder?: number
    }) =>
      updateCheckpoint(payload.templateId, payload.checkpointId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['auditTemplate', variables.templateId],
      })
    },
  })

  const removeCheckpointMutation = useMutation({
    mutationFn: (payload: { templateId: number; checkpointId: number }) =>
      removeCheckpoint(payload.templateId, payload.checkpointId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['auditTemplate', variables.templateId],
      })
    },
  })

  const reorderCheckpointsMutation = useMutation({
    mutationFn: (payload: {
      templateId: number
      items: Array<{ id: number; sortOrder: number }>
    }) => reorderCheckpoints(payload.templateId, payload.items),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['auditTemplate', variables.templateId],
      })
    },
  })

  const seedPrestoMutation = useMutation({
    mutationFn: () => seedPrestoTemplate(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditTemplates', user?.id] })
    },
  })

  return {
    createTemplate: createTemplateMutation.mutate,
    updateTemplate: updateTemplateMutation.mutate,
    archiveTemplate: archiveTemplateMutation.mutate,
    addCheckpoint: addCheckpointMutation.mutate,
    updateCheckpoint: updateCheckpointMutation.mutate,
    removeCheckpoint: removeCheckpointMutation.mutate,
    reorderCheckpoints: reorderCheckpointsMutation.mutate,
    seedPresto: seedPrestoMutation.mutate,
    isCreating: createTemplateMutation.isPending,
    isSeeding: seedPrestoMutation.isPending,
  }
}
