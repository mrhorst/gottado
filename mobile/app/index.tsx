import AppRouter from './router/AppRouter'
import AuthProvider from './context/auth/AuthContext'
import UserProvider from './context/user/UserContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SectionProvider from './context/section/SectionContext'
import { SafeAreaProvider } from 'react-native-safe-area-context'

const client = new QueryClient()

export default function Index() {
  return (
    <>
      <SafeAreaProvider>
        <QueryClientProvider client={client}>
          <AuthProvider>
            <UserProvider>
              <SectionProvider>
                <AppRouter />
              </SectionProvider>
            </UserProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </>
  )
}
