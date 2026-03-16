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

  const today = new Date().toISOString().split('T')[0]

  const allPendingTasks = tasks.filter((t) => {
    if (t.complete) return false
    // Hide recurring tasks whose next due date hasn't arrived yet
    if (t.recurrence && t.dueDate && t.dueDate > today && t.lastCompletedAt) return false
    return true
  })
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
