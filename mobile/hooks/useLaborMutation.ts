import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/auth/AuthContext'
import {
  createDayPart as createDayPartApi,
  createLaborShift as createLaborShiftApi,
  deleteDayPart as deleteDayPartApi,
  updateDayPart as updateDayPartApi,
} from '@/services/laborService'
import type { UpdateDayPartPayload } from '@/types/labor'

export const useCreateShiftMutation = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const createShiftMutation = useMutation({
    mutationFn: createLaborShiftApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labor-shifts', user?.id] })
    },
  })

  return {
    createShift: createShiftMutation.mutate,
    isPending: createShiftMutation.isPending,
  }
}

export const useCreateDayPartMutation = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createDayPartApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['day-parts', user?.id] })
    },
  })

  return {
    createDayPart: mutation.mutate,
    isPending: mutation.isPending,
  }
}

export const useUpdateDayPartMutation = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateDayPartPayload }) =>
      updateDayPartApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['day-parts', user?.id] })
    },
  })

  return {
    updateDayPart: mutation.mutate,
    isPending: mutation.isPending,
  }
}

export const useDeleteDayPartMutation = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: deleteDayPartApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['day-parts', user?.id] })
    },
  })

  return {
    deleteDayPart: mutation.mutate,
    isPending: mutation.isPending,
  }
}
