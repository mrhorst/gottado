import { useQuery } from '@tanstack/react-query'
import { useLoggedUser } from '../context/user/UserContext'
import { getSectionMembers } from '../services/sectionService'
import { useLocalSearchParams } from 'expo-router'

export interface SectionMembers {
  userId: number
  sectionId?: number
  role: MembershipRoles
  sectionName: string
  name: string
}

export type MembershipRoles = 'owner' | 'editor' | 'viewer'

export interface SectionNonMembers {
  id: number
  name: string
  email: string
}

export interface SectionMembersResponse {
  members: SectionMembers[]
  nonMembers: SectionNonMembers[]
}

export const useMembershipQuery = () => {
  const { user } = useLoggedUser()
  const { id } = useLocalSearchParams()

  const {
    data,
    isLoading,
    isError,
  }: {
    data: SectionMembersResponse | undefined
    isLoading: boolean
    isError: boolean
  } = useQuery({
    queryKey: ['sectionMembers', user?.sub],
    enabled: !!user,
    queryFn: () => getSectionMembers(Number(id)),
    retry: 1,
    initialData: [],
  })

  return {
    sectionMembersResponse: data,
    isLoading,
    isError,
  }
}
