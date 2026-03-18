import { Stack } from 'expo-router'
import { baseStackScreenOptions } from '@/styles/navigation'

export default function CostsLayout() {
  return (
    <Stack screenOptions={{ ...baseStackScreenOptions, headerShown: true }}>
      <Stack.Screen name='index' options={{ title: 'Costs' }} />
      <Stack.Screen name='new' options={{ title: 'New Cost Record' }} />
    </Stack>
  )
}
