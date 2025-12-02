import { useQuery } from '@tanstack/react-query'
import { useLoggedUser } from '../context/user/UserContext'
import { getSectionMembers } from '../services/sectionService'
import { useParams } from 'react-router-native'

interface SectionMembers {
  role: 'owner' | 'editor' | 'viewer'
  sectionName: string
  member: string
}

export const useSectionMembersQuery = () => {
  const { user } = useLoggedUser()
  const { id } = useParams()
  const {
    data,
    isLoading,
  }: { data: SectionMembers[] | undefined; isLoading: boolean } = useQuery({
    queryKey: ['sectionMembers', user?.sub],
    enabled: !!user,
    queryFn: () => getSectionMembers(Number(id)),
  })

  return { sectionMembers: data, isLoading }
}
