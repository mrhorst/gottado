import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  assessFinding,
  batchAssessFindings,
} from '@/services/auditService'
import type { Severity } from '@/types/audit'

export const useAuditFindingsMutation = (runId: number) => {
  const queryClient = useQueryClient()

  const assessFindingMutation = useMutation({
    mutationFn: (payload: {
      findingId: number
      score?: number
      passed?: boolean
      severity?: Severity
      notes?: string
      flagged?: boolean
    }) => assessFinding(runId, payload.findingId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditRun', runId] })
    },
  })

  const batchAssessMutation = useMutation({
    mutationFn: (
      findings: Array<{
        id: number
        score?: number
        passed?: boolean
        severity?: string
        notes?: string
        flagged?: boolean
      }>
    ) => batchAssessFindings(runId, findings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditRun', runId] })
    },
  })

  return {
    assessFinding: assessFindingMutation.mutate,
    batchAssess: batchAssessMutation.mutate,
    batchAssessAsync: batchAssessMutation.mutateAsync,
    isAssessing: assessFindingMutation.isPending,
    isBatchAssessing: batchAssessMutation.isPending,
  }
}
