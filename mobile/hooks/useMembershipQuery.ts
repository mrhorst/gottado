import { useQuery } from '@tanstack/react-query'
import { useLoggedUser } from '../context/user/UserContext'
import { getSectionMembers } from '../services/sectionService'
import { useRoute } from '@react-navigation/native'

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
  const route = useRoute<any>()
  const { id } = route.params || {}

  const {
    data,
    isLoading,
  }: { data: SectionMembersResponse | undefined; isLoading: boolean } =
    useQuery({
      queryKey: ['sectionMembers', user?.sub],
      enabled: !!user,
      queryFn: () => getSectionMembers(Number(id)),
    })

  return {
    sectionMembersResponse: data,
    isLoading,
  }
}
