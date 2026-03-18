import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/auth/AuthContext'
import { createIssueRecord as createIssueRecordApi } from '@/services/issuesService'

export const useCreateIssueRecordMutation = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const createIssueMutation = useMutation({
    mutationFn: createIssueRecordApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue-records', user?.id] })
    },
  })

  return {
    createIssueRecord: createIssueMutation.mutate,
    isPending: createIssueMutation.isPending,
  }
}
