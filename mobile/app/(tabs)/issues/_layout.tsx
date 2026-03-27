import { Stack } from 'expo-router'
import { baseStackScreenOptions } from '@/styles/navigation'

export default function IssuesLayout() {
  return (
    <Stack screenOptions={{ ...baseStackScreenOptions, headerShown: true }}>
      <Stack.Screen name='index' options={{ title: 'Issues' }} />
      <Stack.Screen name='new' options={{ title: 'New Issue' }} />
    </Stack>
  )
}
