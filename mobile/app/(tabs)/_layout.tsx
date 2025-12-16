import { Tabs } from 'expo-router'

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name='dashboard' options={{ title: 'Dashboard' }} />
      <Tabs.Screen name='tasks' options={{ headerShown: false }} />
      <Tabs.Screen name='sections' options={{ headerShown: false }} />
      <Tabs.Screen name='user' />
    </Tabs>
  )
}
