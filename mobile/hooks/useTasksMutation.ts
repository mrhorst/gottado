import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createNewTask,
  setTaskCompleted,
  updateTask as updateTaskApi,
  deleteTask as deleteTaskApi,
  completeTaskWithPicture as completeWithPictureApi,
  uploadImage,
  UserTasks,
  Recurrence,
  UpdateTaskPayload,
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
    mutationFn: (payload: {
      title: string
      description?: string
      sectionId: number
      userId: number
      dueDate?: string
      deadlineTime?: string
      recurrence?: Recurrence
      requiresPicture?: boolean
    }) => createNewTask(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, ...payload }: UpdateTaskPayload & { id: number }) =>
      updateTaskApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => deleteTaskApi(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey })
      const previousTasks = queryClient.getQueryData<UserTasks[]>(queryKey)
      queryClient.setQueryData<UserTasks[]>(
        queryKey,
        previousTasks?.filter((t) => t.id !== id) ?? []
      )
      return { previousTasks }
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(queryKey, context?.previousTasks)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const completeWithPictureMutation = useMutation({
    mutationFn: async ({ id, imageUri }: { id: number; imageUri: string }) => {
      const pictureUrl = await uploadImage(imageUri)
      return completeWithPictureApi(id, pictureUrl)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  return {
    toggleComplete: toggleCompleteMutation.mutate,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    completeWithPicture: completeWithPictureMutation.mutateAsync,
    isUploadingPicture: completeWithPictureMutation.isPending,
  }
}
