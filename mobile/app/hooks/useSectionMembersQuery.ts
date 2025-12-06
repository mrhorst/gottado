import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLoggedUser } from '../context/user/UserContext'
import {
  getSectionMembers,
  removeMember,
  updateMemberRole,
} from '../services/sectionService'
import { useParams } from 'react-router-native'

export interface SectionMembers {
  userId: number
  role: 'owner' | 'editor' | 'viewer'
  sectionName: string
  name: string
}

export interface SectionNonMembers {
  id: number
  name: string
  email: string
}

export interface SectionMembersResponse {
  members: SectionMembers[]
  nonMembers: SectionNonMembers[]
}

export const useSectionMembersQuery = () => {
  const { user } = useLoggedUser()
  const { id } = useParams()
  const queryClient = useQueryClient()
  const {
    data,
    isLoading,
  }: { data: SectionMembersResponse | undefined; isLoading: boolean } =
    useQuery({
      queryKey: ['sectionMembers', user?.sub],
      enabled: !!user,
      queryFn: () => getSectionMembers(Number(id)),
    })

  const updateMember = useMutation({
    mutationFn: ({
      userId,
      sectionId,
      role,
    }: {
      userId: number
      sectionId: number
      role: string
    }) => updateMemberRole(userId, sectionId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sectionMembers', user?.sub] })
    },
  })

  const unsubscribeMember = useMutation({
    mutationFn: ({
      sectionId,
      userId,
    }: {
      sectionId: number
      userId: number
    }) => removeMember(sectionId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sectionMembers', user?.sub] })
    },
  })

  return {
    sectionMembersResponse: data,
    isLoading,
    updateMember,
    unsubscribeMember,
  }
}
