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
import { ActivityIndicator, View } from 'react-native'
import { colors } from '@/styles/theme'
import { router } from 'expo-router'

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
    const initialize = async () => {
      try {
        setStatus('loading')
        const storedToken = await AsyncStorage.getItem('auth_token')
        if (!storedToken) {
          setStatus('unauthenticated')
          return
        }
        setToken(storedToken)

        const userProfile = await fetchLoggedUser()
        setUser(userProfile)
        setStatus('authenticated')
      } catch (error) {
        console.error('Auth Init Error:', error)

        await AsyncStorage.removeItem('auth_token')
        setToken(null)
        setUser(null)
        setStatus('unauthenticated')
      }
    }
    initialize()
  }, [])

  const startSession = async (newToken: string) => {
    await AsyncStorage.setItem('auth_token', newToken)
    setToken(newToken)
    const userProfile = await fetchLoggedUser()
    setUser(userProfile)
  }

  const endSession = async () => {
    await AsyncStorage.removeItem('auth_token')
    await AsyncStorage.removeItem('activeOrgId')
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({ token, user, status, startSession, endSession }),
    [token, user, status]
  )

  if (status === 'loading' || status === 'idle')
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
