import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createOrg,
  updateOrg,
  deleteOrg,
  addOrgMember,
  updateOrgMemberRole,
  removeOrgMember,
} from '@/services/orgService'

export const useOrgMutation = () => {
  const queryClient = useQueryClient()

  const createOrgMutation = useMutation({
    mutationFn: (name: string) => createOrg(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })

  const updateOrgMutation = useMutation({
    mutationFn: (payload: { id: number; name: string }) =>
      updateOrg(payload.id, payload.name),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['org', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })

  const deleteOrgMutation = useMutation({
    mutationFn: (id: number) => deleteOrg(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })

  const addMemberMutation = useMutation({
    mutationFn: (payload: { orgId: number; userId: number; role?: string }) =>
      addOrgMember(payload.orgId, payload.userId, payload.role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['org', variables.orgId] })
    },
  })

  const updateMemberMutation = useMutation({
    mutationFn: (payload: { orgId: number; userId: number; role: string }) =>
      updateOrgMemberRole(payload.orgId, payload.userId, payload.role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['org', variables.orgId] })
    },
  })

  const removeMemberMutation = useMutation({
    mutationFn: (payload: { orgId: number; userId: number }) =>
      removeOrgMember(payload.orgId, payload.userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['org', variables.orgId] })
    },
  })

  return {
    createOrg: createOrgMutation.mutateAsync,
    updateOrg: updateOrgMutation.mutate,
    deleteOrg: deleteOrgMutation.mutate,
    addMember: addMemberMutation.mutate,
    updateMember: updateMemberMutation.mutate,
    removeMember: removeMemberMutation.mutate,
    isCreating: createOrgMutation.isPending,
  }
}
