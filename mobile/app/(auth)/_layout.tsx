import { Stack } from 'expo-router'

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
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
