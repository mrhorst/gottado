import { useQuery } from '@tanstack/react-query'
import { useLoggedUser } from '../context/user/UserContext'
import { getSections } from '../services/sectionService'
import { SectionProps } from '../context/section/SectionContext'

export const useSectionQuery = () => {
  const { user } = useLoggedUser()

  const {
    data,
    isLoading,
  }: { data: SectionProps[] | undefined; isLoading: boolean } = useQuery({
    queryKey: ['sections', user?.sub],
    queryFn: getSections,
    enabled: !!user,
  })

  return { sections: data, isLoading }
}
