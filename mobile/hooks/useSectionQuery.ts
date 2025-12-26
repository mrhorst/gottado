import { useQuery } from '@tanstack/react-query'

import { getSections } from '../services/sectionService'
import { SectionResponseProps } from '@/types/section'
import { useAuth } from '@/context/auth/AuthContext'

export const useSectionQuery = () => {
  const { user } = useAuth()

  const {
    data,
    isLoading,
  }: { data: SectionResponseProps | undefined; isLoading: boolean } = useQuery({
    queryKey: ['sections', user?.id],
    queryFn: getSections,
    enabled: !!user,
  })

  const active = data?.active
  const inactive = data?.inactive

  return { sections: active, archivedSections: inactive, isLoading }
}
