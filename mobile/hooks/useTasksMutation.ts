import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createNewTask,
  setTaskCompleted,
  UserTasks,
} from '../services/taskService'
import { useLoggedUser } from '../context/user/UserContext'
import { sortTasks } from '../utils/taskHelpers'

export const useTasksMutation = () => {
  const { user } = useLoggedUser()
  const queryClient = useQueryClient()
  const queryKey = ['tasks', user?.sub]

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
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.sub] })
    },
  })

  return {
    toggleComplete: toggleCompleteMutation.mutate,
    createTask: createTaskMutation.mutate,
  }
}
