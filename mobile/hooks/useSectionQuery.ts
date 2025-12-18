import { useQuery } from '@tanstack/react-query'
import { useLoggedUser } from '../context/user/UserContext'
import { getSections } from '../services/sectionService'
import { SectionResponseProps } from '../context/section/SectionContext'

export const useSectionQuery = () => {
  const { user } = useLoggedUser()

  const {
    data,
    isLoading,
  }: { data: SectionResponseProps | undefined; isLoading: boolean } = useQuery({
    queryKey: ['sections', user?.sub],
    queryFn: getSections,
    enabled: !!user,
  })

  const active = data?.active
  const inactive = data?.inactive

  return { sections: active, archivedSections: inactive, isLoading }
}
