import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/auth/AuthContext'
import {
  createDayPart as createDayPartApi,
  createLaborShift as createLaborShiftApi,
  deleteDayPart as deleteDayPartApi,
  deleteLaborShift as deleteLaborShiftApi,
  publishScheduleDay as publishApi,
  unpublishScheduleDay as unpublishApi,
  updateDayPart as updateDayPartApi,
  updateLaborShift as updateLaborShiftApi,
} from '@/services/laborService'
import type { UpdateDayPartPayload, UpdateLaborShiftPayload } from '@/types/labor'

// ── Shifts ─────────────────────────────────────────────────────────────

export const useCreateShiftMutation = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createLaborShiftApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labor-shifts', user?.id] })
    },
  })

  return {
    createShift: mutation.mutate,
    isPending: mutation.isPending,
  }
}

export const useUpdateShiftMutation = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateLaborShiftPayload }) =>
      updateLaborShiftApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labor-shifts', user?.id] })
    },
  })

  return {
    updateShift: mutation.mutate,
    isPending: mutation.isPending,
  }
}

export const useDeleteShiftMutation = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: deleteLaborShiftApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labor-shifts', user?.id] })
    },
  })

  return {
    deleteShift: mutation.mutate,
    isPending: mutation.isPending,
  }
}

// ── Schedule status ────────────────────────────────────────────────────

export const usePublishDayMutation = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: publishApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labor-shifts', user?.id] })
    },
  })

  return {
    publishDay: mutation.mutate,
    isPending: mutation.isPending,
  }
}

export const useUnpublishDayMutation = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: unpublishApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labor-shifts', user?.id] })
    },
  })

  return {
    unpublishDay: mutation.mutate,
    isPending: mutation.isPending,
  }
}

// ── Day parts ──────────────────────────────────────────────────────────

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
