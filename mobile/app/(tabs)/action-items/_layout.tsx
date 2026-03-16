import { Stack } from 'expo-router'
import { baseStackScreenOptions } from '@/styles/navigation'

const ActionItemsLayout = () => {
  return (
    <Stack screenOptions={{ ...baseStackScreenOptions, headerShown: true }}>
      <Stack.Screen
        name='index'
        options={{ title: 'Action Items', headerLargeTitle: true }}
      />
    </Stack>
  )
}

export default ActionItemsLayout
