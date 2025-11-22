import { fetchLoggedUser } from '@/app/services/userService'
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useAuth } from '../auth/AuthContext'

export type LoggedUser = {
  name: string
  email: string
  sub: number
  iat: number
}

type UserContextType = {
  user: LoggedUser | null
  loading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export default function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoggedUser | null>(null)
  const [loading, setLoading] = useState(true)

  const { token } = useAuth()

  useEffect(() => {
    loadUser()
  }, [token])

  const loadUser = async () => {
    setLoading(true)
    try {
      const u = await fetchLoggedUser()
      setUser(u)
    } catch (err) {
      setUser(null)
      console.warn(err)
    } finally {
      setLoading(false)
    }
  }

  const value: UserContextType = {
    user,
    loading,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useLoggedUser = () => {
  const context = useContext(UserContext)
  if (!context) throw new Error('useLoggedUser must be within UserProvider')
  return context
}
