import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLoggedUser } from '../context/user/UserContext'
import { getTasks, setTaskCompleted, UserTasks } from '../services/taskService'
import { Section } from '../context/section/SectionContext'
import { useMemo } from 'react'
import { sortTasks } from '../utils/taskHelpers'

export const useTasksQuery = () => {
  const { user } = useLoggedUser()
  const queryClient = useQueryClient()

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', user?.sub],
    queryFn: getTasks,
    enabled: !!user,
  })

  const sortedTasks = useMemo(() => {
    return sortTasks(tasks)
  }, [tasks])

  const mutation = useMutation({
    mutationFn: ({ id, complete }: { id: number; complete: boolean }) =>
      setTaskCompleted(id, complete),

    onMutate: async ({ id, complete }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', user?.sub] })
      const previousTasks = queryClient.getQueryData<UserTasks[]>([
        'tasks',
        user?.sub,
      ])

      const newTasks = previousTasks
        ? previousTasks.map((task) =>
            task.id === id ? { ...task, complete } : task
          )
        : []

      queryClient.setQueryData<UserTasks[]>(
        ['tasks', user?.sub],
        sortTasks(newTasks)
      )
      return { previousTasks }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.sub] })
    },
    onError: (err, _updatedTask, context) => {
      queryClient.setQueryData(['tasks', user?.sub], context?.previousTasks)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.sub] })
    },
  })

  const toggleCompleteTask = (t: UserTasks) => {
    mutation.mutate({ id: t.id, complete: !t.complete })
  }

  const allPendingTasks = tasks.filter((t) => !t.complete)
  const allCompletedTasks = tasks.filter((t) => t.complete)

  const sectionPendingTasks = (section: Section): UserTasks[] => {
    return allPendingTasks.filter((t) => t.sectionName === section.name)
  }

  const sectionCompletedTasks = (section: Section): UserTasks[] => {
    return allCompletedTasks.filter((t) => t.sectionName === section.name)
  }

  const sectionTotalTasks = (section: Section): number =>
    sectionPendingTasks(section).length + sectionCompletedTasks(section).length

  return {
    tasks: sortedTasks,
    allPendingTasks,
    allCompletedTasks,
    toggleCompleteTask,
    sectionPendingTasks,
    sectionCompletedTasks,
    sectionTotalTasks,
  }
}
