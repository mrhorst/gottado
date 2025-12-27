import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useAuth } from '../auth/AuthContext'
import { UserOrgs } from '@/types/user'
import { useAsyncStorage } from '@react-native-async-storage/async-storage'

interface WorkspaceProviderProps {
  activeOrgId: number | null
  handleSelectOrganization: (item: UserOrgs) => void
  organizations: UserOrgs[] | undefined
  isWorkspaceLoading: boolean
  org: UserOrgs | undefined
  clearOrganization: () => void
}

const WorkspaceContext = createContext<WorkspaceProviderProps | null>(null)

export default function WorkspaceProvider({
  children,
}: {
  children: ReactNode
}) {
  const { user } = useAuth()
  const [activeOrgId, setActiveOrgId] = useState<number | null>(null)
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState<boolean>(true)
  const { setItem, getItem, removeItem } = useAsyncStorage('activeOrgId')

  const org = user?.organizations.find((org) => org.id === activeOrgId)

  useEffect(() => {
    const initialize = async () => {
      try {
        const storedOrgId = await getItem()
        if (storedOrgId) {
          setActiveOrgId(Number(storedOrgId))
        } else {
          setActiveOrgId(null)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setIsWorkspaceLoading(false)
      }
    }
    initialize()
  }, [getItem])

  const handleSelectOrganization = useCallback(
    async (item: UserOrgs) => {
      await setItem(String(item.id))
      setActiveOrgId(item.id)
    },
    [setItem]
  )

  const clearOrganization = useCallback(async () => {
    await removeItem()
    setActiveOrgId(null)
  }, [removeItem])

  const value = useMemo(
    () => ({
      activeOrgId,
      handleSelectOrganization,
      clearOrganization,
      organizations: user?.organizations,
      isWorkspaceLoading,
      org,
    }),
    [
      org,
      activeOrgId,
      user?.organizations,
      handleSelectOrganization,
      isWorkspaceLoading,
      clearOrganization,
    ]
  )

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error('useWorkspace must be used inside WorkspaceProvider')
  }

  return context
}
