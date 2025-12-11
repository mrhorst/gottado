import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

type AuthContextType = {
  token: string | null
  login: (newToken: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [ready, setReady] = useState<boolean>(false)

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('auth_token')
        setToken(storedToken)
      } catch (err) {
        console.error(err)
      } finally {
        setReady(true)
      }
    }
    loadToken()
  }, [])

  const login = async (newToken: string) => {
    await AsyncStorage.setItem('auth_token', newToken)
    setToken(newToken)
  }

  const logout = async () => {
    await AsyncStorage.removeItem('auth_token')
    setToken(null)
  }

  const value = useMemo(() => ({ token, login, logout }), [token])

  if (!ready) return null

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
