import { Stack } from 'expo-router'
import { baseStackScreenOptions } from '@/styles/navigation'

export default function LogbookLayout() {
  return (
    <Stack screenOptions={{ ...baseStackScreenOptions, headerShown: true }}>
      <Stack.Screen name='index' options={{ title: 'Manager Logbook' }} />
      <Stack.Screen name='new' options={{ title: 'New Log Type' }} />
      <Stack.Screen name='[id]' options={{ title: 'Log Entries' }} />
      <Stack.Screen name='[id]/new-entry' options={{ title: 'New Log Entry' }} />
    </Stack>
  )
}
