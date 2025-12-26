import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  addMember,
  removeMember,
  updateMemberRole,
} from '../services/sectionService'

import { MembershipRoles } from './useMembershipQuery'
import { useAuth } from '@/context/auth/AuthContext'

interface MembershipKeys {
  userId: number
  sectionId: number
}

interface MembershipPayload extends MembershipKeys {
  role: MembershipRoles
}

export const useMembershipMutation = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const queryKey = ['sectionMembers', user?.id]

  const subscribeMember = useMutation({
    mutationFn: ({ userId, sectionId, role }: MembershipPayload) =>
      addMember(userId, sectionId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const updateMember = useMutation({
    mutationFn: ({ userId, sectionId, role }: MembershipPayload) =>
      updateMemberRole(userId, sectionId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const unsubscribeMember = useMutation({
    mutationFn: ({ sectionId, userId }: MembershipKeys) =>
      removeMember(userId, sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  return {
    updateMember: updateMember.mutate,
    unsubscribeMember: unsubscribeMember.mutate,
    subscribeMember: subscribeMember.mutate,
  }
}
