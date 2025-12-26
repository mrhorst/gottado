import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createNewTask,
  setTaskCompleted,
  UserTasks,
} from '../services/taskService'

import { sortTasks } from '../utils/taskHelpers'
import { useAuth } from '@/context/auth/AuthContext'

export const useTasksMutation = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = ['tasks', user?.id]

  const toggleCompleteMutation = useMutation({
    mutationFn: ({ id, complete }: { id: number; complete: boolean }) =>
      setTaskCompleted(id, complete),

    onMutate: async ({ id, complete }) => {
      await queryClient.cancelQueries({ queryKey })
      const previousTasks = queryClient.getQueryData<UserTasks[]>(queryKey)

      const newTasks = previousTasks
        ? previousTasks.map((task) =>
            task.id === id ? { ...task, complete } : task
          )
        : []

      queryClient.setQueryData<UserTasks[]>(queryKey, sortTasks(newTasks))
      return { previousTasks }
    },
    onError: (err, _updatedTask, context) => {
      queryClient.setQueryData(queryKey, context?.previousTasks)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const createTaskMutation = useMutation({
    mutationFn: ({
      title,
      description,
      sectionId,
      userId,
    }: {
      title: string
      description: string
      sectionId: number
      userId: number
    }) => createNewTask(title, description, sectionId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] })
    },
  })

  return {
    toggleComplete: toggleCompleteMutation.mutate,
    createTask: createTaskMutation.mutate,
  }
}
