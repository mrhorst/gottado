import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { UserProfile } from '@/types/user'
import { AuthStatus } from '@/types/auth'
import { fetchLoggedUser } from '@/services/userService'

type AuthContextType = {
  token: string | null
  user: UserProfile | null
  startSession: (newToken: string) => Promise<void>
  endSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [status, setStatus] = useState<AuthStatus>('idle')

  useEffect(() => {
    try {
      setStatus('loading')
      loadToken()
      loadUser()
    } catch (error) {
      console.error(error)
      setStatus('unauthenticated')
    } finally {
      setStatus('authenticated')
    }
  }, [])

  const loadToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token')
      setToken(storedToken)
    } catch (err) {
      console.error(err)
      setStatus('unauthenticated')
    }
  }

  const loadUser = async () => {
    try {
      const u = await fetchLoggedUser()
      console.log(u)
      setUser(u)
    } catch (err) {
      setUser(null)
      console.warn(err)
    }
  }

  const startSession = async (newToken: string) => {
    await AsyncStorage.setItem('auth_token', newToken)
    setToken(newToken)
  }

  const endSession = async () => {
    await AsyncStorage.removeItem('auth_token')
    setToken(null)
  }

  const value = useMemo(
    () => ({ token, user, startSession, endSession }),
    [token, user]
  )

  if (status !== 'authenticated') return null

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
