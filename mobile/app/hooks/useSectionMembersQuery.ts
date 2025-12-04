import { useQuery } from '@tanstack/react-query'
import { useLoggedUser } from '../context/user/UserContext'
import { getSectionMembers } from '../services/sectionService'
import { useParams } from 'react-router-native'

export interface SectionMembers {
  role: 'owner' | 'editor' | 'viewer'
  sectionName: string
  member: string
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
  const {
    data,
    isLoading,
  }: { data: SectionMembersResponse | undefined; isLoading: boolean } =
    useQuery({
      queryKey: ['sectionMembers', user?.sub],
      enabled: !!user,
      queryFn: () => getSectionMembers(Number(id)),
    })

  return { sectionMembersResponse: data, isLoading }
}
