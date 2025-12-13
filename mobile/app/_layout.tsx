import AuthProvider from '@/context/auth/AuthContext'
import UserProvider from '@/context/user/UserContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SectionProvider from '@/context/section/SectionContext'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Stack } from 'expo-router'

import { colors } from '@/styles/theme'
import { DefaultTheme, ThemeProvider } from '@react-navigation/native'

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
  },
}

const client = new QueryClient()

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={client}>
        <AuthProvider>
          <UserProvider>
            <SectionProvider>
              <ThemeProvider value={AppTheme}>
                <Stack
                  screenOptions={{
                    headerShown: false,
                  }}
                />
              </ThemeProvider>
            </SectionProvider>
          </UserProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  )
}
