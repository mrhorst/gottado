import { Stack } from 'expo-router'
import { baseStackScreenOptions } from '@/styles/navigation'

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ ...baseStackScreenOptions, headerShown: false }}>
      <Stack.Screen
        name='login'
        options={{ headerShown: true, title: 'Login' }}
      />
      <Stack.Screen
        name='signup'
        options={{ headerShown: true, title: 'Sign up' }}
      />
    </Stack>
  )
}
