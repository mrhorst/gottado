import AuthProvider, { useAuth } from '@/context/auth/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Stack, useRouter, useSegments } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { colors } from '@/styles/theme'
import { DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useEffect } from 'react'
import WorkspaceProvider, {
  useWorkspace,
} from '@/context/workspace/WorkspaceContext'

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
  },
}

const client = new QueryClient()

const RootLayoutNav = () => {
  const { user } = useAuth()
  const { activeOrgId } = useWorkspace()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)'
    const inOrgSelector = segments[0] === 'select-org'

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (user && !activeOrgId && !inOrgSelector) {
      router.replace('/select-org')
    } else if (user && activeOrgId && (inAuthGroup || inOrgSelector)) {
      router.replace('/(tabs)/dashboard')
    }
  }, [user, segments, router, activeOrgId])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='(tabs)' />
      <Stack.Screen name='(auth)' />
      <Stack.Screen
        name='select-org'
        options={{
          presentation: 'card',
          headerShown: true,
          title: 'Select Organization',
        }}
      />

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
            <WorkspaceProvider>
              <ThemeProvider value={AppTheme}>
                <RootLayoutNav />
              </ThemeProvider>
            </WorkspaceProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
