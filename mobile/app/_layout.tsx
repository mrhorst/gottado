import AuthProvider from '@/context/auth/AuthContext'
import UserProvider, { useLoggedUser } from '@/context/user/UserContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SectionProvider from '@/context/section/SectionContext'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Stack, useRouter, useSegments } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { colors } from '@/styles/theme'
import { DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useEffect } from 'react'

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
  },
}

const client = new QueryClient()

const RootLayoutNav = () => {
  const { user } = useLoggedUser()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)'

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)/dashboard')
    }
  }, [user, segments, router])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='(tabs)' />
      <Stack.Screen name='(auth)' />

      <Stack.Screen
        name='create-section'
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Create New Section',
        }}
      />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <QueryClientProvider client={client}>
          <AuthProvider>
            <UserProvider>
              <SectionProvider>
                <ThemeProvider value={AppTheme}>
                  <RootLayoutNav />
                </ThemeProvider>
              </SectionProvider>
            </UserProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
