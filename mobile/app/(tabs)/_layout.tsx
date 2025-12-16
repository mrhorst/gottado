import { Tabs } from 'expo-router'

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name='dashboard' options={{ title: 'Dashboard' }} />
      <Tabs.Screen
        name='tasks'
        options={{ headerShown: false, title: 'Tasks' }}
      />
      <Tabs.Screen
        name='sections'
        options={{ headerShown: false, title: 'Sections' }}
      />
      <Tabs.Screen name='user' options={{ title: 'User' }} />
    </Tabs>
  )
}
