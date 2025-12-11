import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  addMember,
  removeMember,
  updateMemberRole,
} from '../services/sectionService'
import { useLoggedUser } from '../context/user/UserContext'
import { MembershipRoles } from './useMembershipQuery'

interface MembershipKeys {
  userId: number
  sectionId: number
}

interface MembershipPayload extends MembershipKeys {
  role: MembershipRoles
}

export const useMembershipMutation = () => {
  const queryClient = useQueryClient()
  const { user } = useLoggedUser()
  const queryKey = ['sectionMembers', user?.sub]

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
