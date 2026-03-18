import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useAuth } from '@/context/auth/AuthContext'
import { getCostReferences, getFilteredCostRecords } from '@/services/costsService'
import type { CostFilter } from '@/types/costs'

const getToday = () => new Date().toISOString().slice(0, 10)

export const useCostRecordsQuery = () => {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(getToday)
  const [kindFilter, setKindFilter] = useState<CostFilter>('all')

  const query = useQuery({
    queryKey: ['cost-records', user?.id, selectedDate, kindFilter],
    queryFn: () => getFilteredCostRecords({ date: selectedDate, kind: kindFilter }),
    enabled: !!user,
  })

  return {
    selectedDate,
    kindFilter,
    setKindFilter,
    goToPreviousDate: () => {
      const date = new Date(`${selectedDate}T12:00:00`)
      date.setDate(date.getDate() - 1)
      setSelectedDate(date.toISOString().slice(0, 10))
    },
    goToNextDate: () => {
      const date = new Date(`${selectedDate}T12:00:00`)
      date.setDate(date.getDate() + 1)
      setSelectedDate(date.toISOString().slice(0, 10))
    },
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
