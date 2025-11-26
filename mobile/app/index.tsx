import { NativeRouter } from 'react-router-native'

import AppRouter from './router/AppRouter'
import AuthProvider from './context/auth/AuthContext'
import UserProvider from './context/user/UserContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'

const FixZoom = () => {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'viewport'
    meta.content =
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
    document.getElementsByTagName('head')[0].appendChild(meta)
  }, [])
  return null
}

const v7_flag = {
  v7_relativeSplatPath: true,
  v7_startTransition: true,
}

const client = new QueryClient()

export default function Index() {
  return (
    <>
      <FixZoom />
      <QueryClientProvider client={client}>
        <AuthProvider>
          <UserProvider>
            <NativeRouter future={v7_flag}>
              <AppRouter />
            </NativeRouter>
          </UserProvider>
        </AuthProvider>
      </QueryClientProvider>
    </>
  )
}
