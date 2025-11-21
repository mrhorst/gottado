import { NativeRouter } from 'react-router-native'

import AppRouter from './router/AppRouter'
import AuthProvider from './context/auth/AuthContext'
import UserProvider from './context/user/UserContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const v7_flag = {
  v7_relativeSplatPath: true,
  v7_startTransition: true,
}

const client = new QueryClient()

export default function Index() {
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <UserProvider>
          <NativeRouter future={v7_flag}>
            <AppRouter />
          </NativeRouter>
        </UserProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
