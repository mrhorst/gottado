import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/auth/AuthContext'
import {
  createLogbookTemplate as createLogbookTemplateApi,
  upsertTodayEntry as upsertTodayEntryApi,
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

  const upsertEntryMutation = useMutation({
    mutationFn: ({ templateId, body }: { templateId: number; body: string }) =>
      upsertTodayEntryApi(templateId, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: templatesKey })
      queryClient.invalidateQueries({
        queryKey: ['logbook-day', user?.id, variables.templateId],
      })
      queryClient.invalidateQueries({
        queryKey: ['logbook-entry-dates', user?.id, variables.templateId],
      })
      queryClient.invalidateQueries({
        queryKey: ['logbook-history', user?.id, variables.templateId],
      })
    },
  })

  return {
    createTemplate: createTemplateMutation.mutate,
    upsertEntry: upsertEntryMutation.mutate,
    isCreatingTemplate: createTemplateMutation.isPending,
    isUpsertingEntry: upsertEntryMutation.isPending,
  }
}
