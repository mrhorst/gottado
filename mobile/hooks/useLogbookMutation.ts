import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/auth/AuthContext'
import {
  createLogbookEntry as createLogbookEntryApi,
  createLogbookTemplate as createLogbookTemplateApi,
} from '@/services/logbookService'

export const useLogbookMutation = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const templatesKey = ['logbook-templates', user?.id]

  const createTemplateMutation = useMutation({
    mutationFn: (payload: { title: string; description?: string }) =>
      createLogbookTemplateApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templatesKey })
    },
  })

  const createEntryMutation = useMutation({
    mutationFn: ({
      templateId,
      payload,
    }: {
      templateId: number
      payload: { title?: string; body: string; entryDate?: string }
    }) => createLogbookEntryApi(templateId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: templatesKey })
      queryClient.invalidateQueries({
        queryKey: ['logbook-entries', user?.id, variables.templateId],
      })
    },
  })

  return {
    createTemplate: createTemplateMutation.mutate,
    createEntry: createEntryMutation.mutate,
    isCreatingTemplate: createTemplateMutation.isPending,
    isCreatingEntry: createEntryMutation.isPending,
  }
}
