import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useAuth } from '@/context/auth/AuthContext'
import { getIssueRecords, getIssueReferences } from '@/services/issuesService'
import type { IssueCategory } from '@/types/issues'

const getToday = () => new Date().toISOString().slice(0, 10)

export const useIssueRecordsQuery = () => {
  const { user } = useAuth()
  const [selectedDate] = useState(getToday)
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | 'all'>('all')

  const query = useQuery({
    queryKey: ['issue-records', user?.id, selectedDate, categoryFilter],
    queryFn: () => getIssueRecords({ date: selectedDate, category: categoryFilter }),
    enabled: !!user,
  })

  return {
    selectedDate,
    categoryFilter,
    setCategoryFilter,
    records: query.data?.records ?? [],
    summary: query.data?.summary ?? {
      total: 0,
      followUpCount: 0,
      highSeverityCount: 0,
    },
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}

export const useIssueReferencesQuery = () => {
  const { user } = useAuth()

  const query = useQuery({
    queryKey: ['issue-references', user?.id],
    queryFn: getIssueReferences,
    enabled: !!user,
  })

  return {
    areas: query.data?.areas ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}
