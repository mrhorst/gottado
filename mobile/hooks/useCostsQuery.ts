import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useAuth } from '@/context/auth/AuthContext'
import { getCostRecords, getCostReferences } from '@/services/costsService'

const getToday = () => new Date().toISOString().slice(0, 10)

export const useCostRecordsQuery = () => {
  const { user } = useAuth()
  const [selectedDate] = useState(getToday)

  const query = useQuery({
    queryKey: ['cost-records', user?.id, selectedDate],
    queryFn: () => getCostRecords(selectedDate),
    enabled: !!user,
  })

  return {
    selectedDate,
    records: query.data?.records ?? [],
    summary: query.data?.summary ?? {
      totalAmount: '0.00',
      wasteCount: 0,
      purchaseCount: 0,
      vendorIssueCount: 0,
    },
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}

export const useCostReferencesQuery = () => {
  const { user } = useAuth()

  const query = useQuery({
    queryKey: ['cost-references', user?.id],
    queryFn: getCostReferences,
    enabled: !!user,
  })

  return {
    areas: query.data?.areas ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}
