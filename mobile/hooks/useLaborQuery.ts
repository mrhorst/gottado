import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useAuth } from '@/context/auth/AuthContext'
import { getDayParts, getLaborReferences, getLaborShifts } from '@/services/laborService'
import type { ScheduleStatus } from '@/types/labor'

const getToday = () => new Date().toISOString().slice(0, 10)

export const useLaborShiftsQuery = () => {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(getToday)

  const query = useQuery({
    queryKey: ['labor-shifts', user?.id, selectedDate],
    queryFn: () => getLaborShifts(selectedDate),
    enabled: !!user,
  })

  return {
    shifts: query.data?.shifts ?? [],
    scheduleStatus: (query.data?.scheduleStatus ?? 'draft') as ScheduleStatus,
    selectedDate,
    setSelectedDate,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}

export const useLaborReferencesQuery = () => {
  const { user } = useAuth()

  const query = useQuery({
    queryKey: ['labor-references', user?.id],
    queryFn: getLaborReferences,
    enabled: !!user,
  })

  const data = useMemo(
    () => query.data ?? { areas: [], teams: [], members: [] },
    [query.data]
  )

  return {
    areas: data.areas,
    teams: data.teams,
    members: data.members,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}

export const useDayPartsQuery = () => {
  const { user } = useAuth()

  const query = useQuery({
    queryKey: ['day-parts', user?.id],
    queryFn: getDayParts,
    enabled: !!user,
  })

  return {
    dayParts: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}
