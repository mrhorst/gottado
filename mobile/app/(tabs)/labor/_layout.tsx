import { Stack } from 'expo-router'
import { baseStackScreenOptions } from '@/styles/navigation'

export default function LaborLayout() {
  return (
    <Stack screenOptions={{ ...baseStackScreenOptions, headerShown: true }}>
      <Stack.Screen name='index' options={{ title: 'Labor' }} />
      <Stack.Screen name='new' options={{ title: 'New Shift' }} />
      <Stack.Screen name='[id]' options={{ title: 'Edit Shift' }} />
      <Stack.Screen name='settings' options={{ title: 'Day Parts' }} />
    </Stack>
  )
}
