import { useQuery } from '@tanstack/react-query'

import { getTasks, UserTasks } from '../services/taskService'

import { useMemo } from 'react'
import { sortTasks } from '../utils/taskHelpers'
import { SectionProps } from '@/types/section'
import { useAuth } from '@/context/auth/AuthContext'

export const useTasksQuery = () => {
  const { user } = useAuth()
  const queryKey = ['tasks', user?.id]

  const { data: tasks = [], isLoading } = useQuery({
    queryKey,
    queryFn: getTasks,
    enabled: !!user,
  })

  const sortedTasks = useMemo(() => {
    return sortTasks(tasks)
  }, [tasks])

  const allPendingTasks = tasks.filter((t) => !t.complete)
  const allCompletedTasks = tasks.filter((t) => t.complete)

  const sectionPendingTasks = (section: SectionProps): UserTasks[] => {
    return allPendingTasks.filter((t) => t.sectionName === section.name)
  }

  const sectionCompletedTasks = (section: SectionProps): UserTasks[] => {
    return allCompletedTasks.filter((t) => t.sectionName === section.name)
  }

  const sectionTotalTasks = (section: SectionProps): number =>
    sectionPendingTasks(section).length + sectionCompletedTasks(section).length

  return {
    tasks: sortedTasks,
    isLoading,
    allPendingTasks,
    allCompletedTasks,
    sectionPendingTasks,
    sectionCompletedTasks,
    sectionTotalTasks,
  }
}
