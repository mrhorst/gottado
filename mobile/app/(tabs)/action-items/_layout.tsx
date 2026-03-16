import { Stack } from 'expo-router'

const ActionItemsLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name='index'
        options={{ title: 'Action Items', headerLargeTitle: true }}
      />
    </Stack>
  )
}

export default ActionItemsLayout
